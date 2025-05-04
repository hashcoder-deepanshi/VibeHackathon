import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "./db";
import { eq, and, like, desc, inArray } from "drizzle-orm";
import { 
  restaurants, 
  menu_items, 
  reviews, 
  orders, 
  order_items, 
  cart_items, 
  categories,
  table_bookings,
  insertOrderSchema,
  insertReviewSchema,
  insertCartItemSchema,
  insertRestaurantSchema,
  insertMenuItemSchema,
  insertTableBookingSchema,
  Order
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

interface ConnectedClient {
  ws: WebSocket;
  userId: number;
  orderId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to create a new review
  app.post("/api/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to submit a review" });
      }
      
      const review = {
        ...req.body,
        user_id: req.user.id,
      };

      // Get restaurant name if not provided
      if (!review.restaurant_name) {
        const restaurantResult = await db.select()
          .from(restaurants)
          .where(eq(restaurants.id, review.restaurant_id))
          .limit(1);
        
        if (restaurantResult.length > 0) {
          review.restaurant_name = restaurantResult[0].name;
        }
      }
      
      // Use the insertReviewSchema to validate
      const validatedReview = insertReviewSchema.parse(review);
      
      const result = await db.insert(reviews).values(validatedReview).returning();
      res.status(201).json(result[0]);
    } catch (error: any) {
      console.error("Error creating review:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      
      res.status(500).json({ error: error.message });
    }
  });
  // Setup authentication routes
  await setupAuth(app);

  const httpServer = createServer(app);
  
  // WebSocket server for real-time order tracking
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients: ConnectedClient[] = [];

  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.userId) {
          // Store the user ID with this connection
          const existingClientIndex = clients.findIndex(
            client => client.userId === data.userId
          );
          
          if (existingClientIndex >= 0) {
            clients[existingClientIndex].ws = ws;
          } else {
            clients.push({ ws, userId: data.userId });
          }
          
          console.log(`User ${data.userId} authenticated WebSocket`);
        } 
        else if (data.type === 'subscribe' && data.orderId) {
          // Find the client with this websocket and add the order ID
          const clientIndex = clients.findIndex(client => client.ws === ws);
          if (clientIndex >= 0) {
            clients[clientIndex].orderId = data.orderId;
            console.log(`User ${clients[clientIndex].userId} subscribed to order ${data.orderId}`);
          }
        }
      } catch (err) {
        console.error('Invalid message format', err);
      }
    });
    
    ws.on('close', () => {
      const index = clients.findIndex(client => client.ws === ws);
      if (index !== -1) {
        clients.splice(index, 1);
        console.log('Client disconnected');
      }
    });
  });

  // Helper function to broadcast order updates
  const broadcastOrderUpdate = (order: Order) => {
    // Find all clients who are subscribed to this order
    const interestedClients = clients.filter(
      client => client.orderId === order.id || client.userId === order.user_id
    );
    
    // Broadcast the update to those clients
    interestedClients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'order_update',
          data: order
        }));
      }
    });
  };

  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const { search, filter, city, cuisine, diet, minRating, page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      // Get all restaurants first
      const allRestaurants = await db.select().from(restaurants);
      
      // Apply filters in JavaScript
      let filteredResults = [...allRestaurants];
      
      // Apply search filter if provided
      if (search) {
        const searchStr = search as string;
        filteredResults = filteredResults.filter(restaurant => 
          restaurant.name.toLowerCase().includes(searchStr.toLowerCase())
        );
      }
      
      // Apply city filter if provided
      if (city) {
        const cityStr = city as string;
        filteredResults = filteredResults.filter(restaurant => 
          restaurant.city === cityStr
        );
      }
      
      // Apply minimum rating filter if provided
      if (minRating && !isNaN(Number(minRating))) {
        const minRatingNum = Number(minRating);
        filteredResults = filteredResults.filter(restaurant => {
          // Safely handle null/undefined ratings
          return restaurant.rating != null && restaurant.rating >= minRatingNum;
        });
      }
      
      // Apply cuisine filter if provided
      if (cuisine) {
        const cuisineArr = Array.isArray(cuisine) ? cuisine : [cuisine];
        if (cuisineArr.length > 0) {
          filteredResults = filteredResults.filter(restaurant => {
            // Skip restaurants with no cuisine type
            if (!restaurant.cuisine_type) return false;
            
            // Handle array of cuisine types
            const cuisineArray = restaurant.cuisine_type as string[];
            return cuisineArr.some(c => cuisineArray.includes(c as string));
          });
        }
      }
      
      // Apply dietary preference filter if provided
      if (diet) {
        const dietArr = Array.isArray(diet) ? diet : [diet];
        if (dietArr.length > 0) {
          filteredResults = filteredResults.filter(restaurant => {
            // Skip restaurants with no dietary options
            if (!restaurant.dietary_options) return false;
            
            // Handle array of dietary options
            const dietaryOptions = restaurant.dietary_options as string[];
            return dietArr.some(d => dietaryOptions.includes(d as string));
          });
        }
      }
      
      // Get total count for pagination
      const total = filteredResults.length;
      
      // Apply pagination
      const paginatedResults = filteredResults.slice(offset, offset + Number(limit));
      
      res.json({
        data: paginatedResults,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, parseInt(id))).limit(1);
      
      if (!restaurant.length) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.json(restaurant[0]);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });
  
  // Get restaurant wait time
  app.get("/api/restaurants/:id/wait-time", async (req, res) => {
    try {
      const { id } = req.params;
      const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, parseInt(id))).limit(1);
      
      if (!restaurant.length) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      const restaurantData = restaurant[0];
      
      if (!restaurantData.google_place_id) {
        // If no Google Place ID, return an estimated wait time based on time of day
        const hour = new Date().getHours();
        const isLunchTime = hour >= 12 && hour <= 14;
        const isDinnerTime = hour >= 19 && hour <= 21;
        
        let waitTime = 5; // Default low wait time
        
        if (isLunchTime || isDinnerTime) {
          // During peak hours, wait time is higher
          waitTime = Math.floor(Math.random() * 15) + 15; // 15-30 minutes
        } else {
          // During off-peak hours, wait time is lower
          waitTime = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
        }
        
        return res.json({ waitTime });
      }
      
      // In a real app, we would call the Google Maps API with the Place ID
      // to get popular times data. For this demo, we'll generate realistic data.
      
      const hour = new Date().getHours();
      const isLunchTime = hour >= 12 && hour <= 14;
      const isDinnerTime = hour >= 19 && hour <= 21;
      const isWeekend = [0, 6].includes(new Date().getDay()); // 0 = Sunday, 6 = Saturday
      
      let waitTime = 5; // Default low wait time
      
      if ((isLunchTime || isDinnerTime) && isWeekend) {
        // Weekend peak hours have the highest wait times
        waitTime = Math.floor(Math.random() * 20) + 20; // 20-40 minutes
      } else if (isLunchTime || isDinnerTime) {
        // Weekday peak hours have medium-high wait times
        waitTime = Math.floor(Math.random() * 15) + 15; // 15-30 minutes
      } else if (isWeekend) {
        // Weekend off-peak hours have medium wait times
        waitTime = Math.floor(Math.random() * 10) + 10; // 10-20 minutes
      } else {
        // Weekday off-peak hours have the lowest wait times
        waitTime = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
      }
      
      res.json({ waitTime });
      
    } catch (error) {
      console.error("Error getting restaurant wait time:", error);
      res.status(500).json({ error: "Failed to get restaurant wait time" });
    }
  });

  // Menu Items routes
  app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
      const { id } = req.params;
      const { category, diet } = req.query;
      
      // Basic query to get all menu items for this restaurant
      const baseQuery = db.select().from(menu_items)
        .where(eq(menu_items.restaurant_id, parseInt(id)));
      
      // Execute the base query
      let menuItems = await baseQuery;
      
      // Apply category filter if provided
      if (category) {
        menuItems = menuItems.filter(item => 
          item.category === category
        );
      }
      
      // Apply dietary preference filters if provided
      if (diet) {
        const dietPreferences = Array.isArray(diet) ? diet : [diet];
        
        // Filter based on dietary preferences
        menuItems = menuItems.filter(item => {
          // Check each preference
          return dietPreferences.every(pref => {
            switch(pref) {
              case 'vegetarian':
                return item.is_vegetarian;
              case 'vegan':
                return item.is_vegan;
              case 'gluten_free':
                return item.is_gluten_free;
              case 'jain':
                return item.is_jain;
              default:
                return true;
            }
          });
        });
      }
      
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  // Reviews routes
  app.get("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviewsData = await db.select().from(reviews).where(eq(reviews.restaurant_id, parseInt(id)));
      res.json(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to leave a review" });
      }
      
      const { id } = req.params;
      // Get restaurant data for name
      const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, parseInt(id))).limit(1);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      // Transform content to comment
      const { content, ...otherData } = req.body;
      
      const reviewData = insertReviewSchema.parse({
        restaurant_id: parseInt(id),
        user_id: req.user.id,
        rating: otherData.rating,
        comment: content
      });
      
      const [newReview] = await db.insert(reviews).values(reviewData).returning();
      res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view your cart" });
      }
      
      const cartItemsData = await db.select({
        cart_item: cart_items,
        menu_item: menu_items
      })
      .from(cart_items)
      .leftJoin(menu_items, eq(cart_items.menu_item_id, menu_items.id))
      .where(eq(cart_items.user_id, req.user.id));
      
      res.json(cartItemsData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to add to cart" });
      }
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        user_id: req.user.id
      });
      
      // Check if this item is already in the cart
      const existingItem = await db.select()
        .from(cart_items)
        .where(
          and(
            eq(cart_items.user_id, req.user.id),
            eq(cart_items.menu_item_id, cartItemData.menu_item_id)
          )
        )
        .limit(1);
      
      if (existingItem.length > 0) {
        // Update quantity if item exists
        const [updatedItem] = await db
          .update(cart_items)
          .set({ quantity: existingItem[0].quantity + cartItemData.quantity })
          .where(eq(cart_items.id, existingItem[0].id))
          .returning();
        
        return res.json(updatedItem);
      }
      
      // Otherwise insert new item
      const [newCartItem] = await db.insert(cart_items).values(cartItemData).returning();
      res.status(201).json(newCartItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update cart" });
      }
      
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      // If quantity is 0, delete the item
      if (quantity === 0) {
        await db.delete(cart_items)
          .where(
            and(
              eq(cart_items.id, parseInt(id)),
              eq(cart_items.user_id, req.user.id)
            )
          );
        
        return res.json({ message: "Item removed from cart" });
      }
      
      // Otherwise update the quantity
      const [updatedItem] = await db.update(cart_items)
        .set({ quantity })
        .where(
          and(
            eq(cart_items.id, parseInt(id)),
            eq(cart_items.user_id, req.user.id)
          )
        )
        .returning();
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to clear cart" });
      }
      
      await db.delete(cart_items).where(eq(cart_items.user_id, req.user.id));
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to place an order" });
      }
      
      const { restaurant_name, ...reqBody } = req.body;
      const orderData = insertOrderSchema.parse({
        ...reqBody,
        user_id: req.user.id
      });
      
      // Start a transaction
      const [newOrder] = await db.insert(orders).values(orderData).returning();
      
      // Add order items
      if (req.body.items && Array.isArray(req.body.items)) {
        const orderItems = req.body.items.map((item: any) => ({
          order_id: newOrder.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: item.price
        }));
        
        await db.insert(order_items).values(orderItems);
      }
      
      // Clear the cart
      await db.delete(cart_items).where(eq(cart_items.user_id, req.user.id));
      
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view orders" });
      }
      
      const userOrders = await db.select()
        .from(orders)
        .where(eq(orders.user_id, req.user.id))
        .orderBy(desc(orders.created_at));
      
      res.json(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view order details" });
      }
      
      const { id } = req.params;
      
      // Get the order
      const order = await db.select()
        .from(orders)
        .where(
          and(
            eq(orders.id, parseInt(id)),
            eq(orders.user_id, req.user.id)
          )
        )
        .limit(1);
      
      if (!order.length) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get the order items
      const orderItemsWithDetails = await db.select({
        order_item: order_items,
        menu_item: menu_items
      })
      .from(order_items)
      .leftJoin(menu_items, eq(order_items.menu_item_id, menu_items.id))
      .where(eq(order_items.order_id, parseInt(id)));
      
      res.json({
        order: order[0],
        items: orderItemsWithDetails
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, driver_location } = req.body;
      
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update order status" });
      }
      
      const updateData: any = { status };
      if (driver_location) {
        updateData.driver_location = driver_location;
      }
      
      const [updatedOrder] = await db.update(orders)
        .set(updateData)
        .where(eq(orders.id, parseInt(id)))
        .returning();
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Broadcast order update to relevant clients
      broadcastOrderUpdate(updatedOrder);
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const allCategories = await db.select().from(categories);
      res.json(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Table Booking routes
  app.post("/api/restaurants/:id/book-table", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to book a table" });
      }
      
      const { id } = req.params;
      
      // Get restaurant data
      const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, parseInt(id))).limit(1);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      const bookingData = insertTableBookingSchema.parse({
        ...req.body,
        restaurant_id: parseInt(id),
        restaurant_name: restaurant.name,
        user_id: req.user.id
      });
      
      const [newBooking] = await db.insert(table_bookings).values(bookingData).returning();
      res.status(201).json(newBooking);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error booking table:", error);
      res.status(500).json({ message: "Failed to book table" });
    }
  });
  
  app.get("/api/table-bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view your bookings" });
      }
      
      const bookings = await db.select()
        .from(table_bookings)
        .where(eq(table_bookings.user_id, req.user.id))
        .orderBy(desc(table_bookings.booking_date));
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching table bookings:", error);
      res.status(500).json({ message: "Failed to fetch table bookings" });
    }
  });
  
  app.get("/api/restaurants/:id/available-times", async (req, res) => {
    try {
      const { id } = req.params;
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }
      
      // Get restaurant
      const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, parseInt(id))).limit(1);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      // For a real app, we would check existing bookings and restaurant capacity
      // For this demo, we'll generate available times
      const openingTime = restaurant.opening_time || "11:00";
      const closingTime = restaurant.closing_time || "22:00";
      
      // Generate available time slots from opening to closing in 30-min intervals
      const [openHour, openMinute] = openingTime.split(":").map(Number);
      const [closeHour, closeMinute] = closingTime.split(":").map(Number);
      
      const availableTimes = [];
      let currentHour = openHour;
      let currentMinute = openMinute;
      
      while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        availableTimes.push(timeString);
        
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
      }
      
      res.json({ availableTimes });
    } catch (error) {
      console.error("Error fetching available times:", error);
      res.status(500).json({ message: "Failed to fetch available times" });
    }
  });

  // Admin routes - Restaurant management
  app.post("/api/admin/restaurants", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to create restaurants" });
      }
      
      const restaurantData = insertRestaurantSchema.parse({
        ...req.body,
        owner_id: req.user.id
      });
      
      const [newRestaurant] = await db.insert(restaurants).values(restaurantData).returning();
      res.status(201).json(newRestaurant);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating restaurant:", error);
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  app.put("/api/admin/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update restaurants" });
      }
      
      // Verify ownership
      const restaurant = await db.select()
        .from(restaurants)
        .where(eq(restaurants.id, parseInt(id)))
        .limit(1);
      
      if (!restaurant.length || restaurant[0].owner_id !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this restaurant" });
      }
      
      const [updatedRestaurant] = await db.update(restaurants)
        .set(req.body)
        .where(eq(restaurants.id, parseInt(id)))
        .returning();
      
      res.json(updatedRestaurant);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(500).json({ message: "Failed to update restaurant" });
    }
  });

  // Admin routes - Menu management
  app.post("/api/admin/restaurants/:id/menu", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to add menu items" });
      }
      
      // Verify ownership
      const restaurant = await db.select()
        .from(restaurants)
        .where(eq(restaurants.id, parseInt(id)))
        .limit(1);
      
      if (!restaurant.length || restaurant[0].owner_id !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this restaurant's menu" });
      }
      
      const menuItemData = insertMenuItemSchema.parse({
        ...req.body,
        restaurant_id: parseInt(id)
      });
      
      const [newMenuItem] = await db.insert(menu_items).values(menuItemData).returning();
      res.status(201).json(newMenuItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error adding menu item:", error);
      res.status(500).json({ message: "Failed to add menu item" });
    }
  });

  app.put("/api/admin/menu/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update menu items" });
      }
      
      // Get the menu item
      const menuItem = await db.select()
        .from(menu_items)
        .where(eq(menu_items.id, parseInt(id)))
        .limit(1);
      
      if (!menuItem.length) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      // Verify ownership of the restaurant
      const restaurant = await db.select()
        .from(restaurants)
        .where(eq(restaurants.id, menuItem[0].restaurant_id))
        .limit(1);
      
      if (!restaurant.length || restaurant[0].owner_id !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this menu item" });
      }
      
      const [updatedMenuItem] = await db.update(menu_items)
        .set(req.body)
        .where(eq(menu_items.id, parseInt(id)))
        .returning();
      
      res.json(updatedMenuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete menu items" });
      }
      
      // Get the menu item
      const menuItem = await db.select()
        .from(menu_items)
        .where(eq(menu_items.id, parseInt(id)))
        .limit(1);
      
      if (!menuItem.length) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      // Verify ownership of the restaurant
      const restaurant = await db.select()
        .from(restaurants)
        .where(eq(restaurants.id, menuItem[0].restaurant_id))
        .limit(1);
      
      if (!restaurant.length || restaurant[0].owner_id !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this menu item" });
      }
      
      await db.delete(menu_items).where(eq(menu_items.id, parseInt(id)));
      
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  return httpServer;
}
