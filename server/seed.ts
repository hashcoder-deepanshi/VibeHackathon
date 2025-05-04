import { db } from "./db";
import { restaurants, users, menu_items, categories } from "@shared/schema";
import { hashSync } from "bcrypt";

async function seed() {
  console.log("Starting to seed the database...");
  
  // Clear existing data
  await db.delete(menu_items);
  await db.delete(restaurants);
  await db.delete(categories);
  await db.delete(users);
  
  console.log("Creating admin user...");
  // Create admin user
  const [admin] = await db.insert(users).values({
    name: "Admin User",
    email: "admin@example.com",
    password: hashSync("password123", 10),
    role: "admin",
    dietary_preferences: ["vegetarian"]
  }).returning();
  
  console.log("Creating regular user...");
  // Create a regular user
  const [user] = await db.insert(users).values({
    name: "Regular User",
    email: "user@example.com",
    password: hashSync("password123", 10),
    role: "user",
    address: "123 Main St, Bengaluru, 560001",
    dietary_preferences: ["vegan", "gluten_free"]
  }).returning();
  
  console.log("Creating food categories...");
  // Create food categories
  const categoriesToInsert = [
    { name: "North Indian", image: "https://images.unsplash.com/photo-1585937421612-70a008356c36?w=500" },
    { name: "South Indian", image: "https://images.unsplash.com/photo-1610192244261-3f33de3f443e?w=500" },
    { name: "Chinese", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500" },
    { name: "Italian", image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500" },
    { name: "Fast Food", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500" }
  ];
  
  const insertedCategories = await Promise.all(
    categoriesToInsert.map(category => db.insert(categories).values(category).returning())
  );
  
  console.log("Creating restaurants...");
  // Create restaurants with dietary options
  const restaurantsToInsert = [
    {
      name: "Punjabi Tadka",
      description: "Authentic North Indian cuisine with rich flavors.",
      cuisine_type: ["North Indian", "Punjabi"],
      address: "Block 5, Koramangala",
      city: "Bangalore",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
      rating: 4.5,
      price_range: "₹500 - ₹1000",
      opening_time: "11:00",
      closing_time: "23:00",
      owner_id: admin.id,
      features: ["takeaway", "dine-in", "home-delivery"],
      estimated_delivery_time: 35,
      photos: [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500"
      ],
      dietary_options: ["vegetarian", "jain"]
    },
    {
      name: "South Spice",
      description: "Authentic South Indian cuisine with a modern twist.",
      cuisine_type: ["South Indian", "Chettinad"],
      address: "HSR Layout, Sector 3",
      city: "Bangalore",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500",
      rating: 4.3,
      price_range: "₹400 - ₹800",
      opening_time: "08:00",
      closing_time: "22:30",
      owner_id: admin.id,
      features: ["takeaway", "dine-in"],
      estimated_delivery_time: 40,
      photos: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500"
      ],
      dietary_options: ["vegetarian", "vegan", "gluten_free"]
    },
    {
      name: "Dragon House",
      description: "Authentic Chinese and Asian fusion cuisine.",
      cuisine_type: ["Chinese", "Asian"],
      address: "Indiranagar, 12th Main",
      city: "Bangalore",
      image: "https://images.unsplash.com/photo-1526234362653-3b75a0c07438?w=500",
      rating: 4.2,
      price_range: "₹600 - ₹1200",
      opening_time: "12:00",
      closing_time: "23:30",
      owner_id: admin.id,
      features: ["dine-in", "home-delivery"],
      estimated_delivery_time: 50,
      photos: [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500",
        "https://images.unsplash.com/photo-1562967914-608f82629710?w=500"
      ],
      dietary_options: ["vegetarian"]
    },
    {
      name: "Pizza Paradise",
      description: "Authentic Italian pizzas and pastas.",
      cuisine_type: ["Italian", "Continental"],
      address: "MG Road, Opposite Metro",
      city: "Bangalore",
      image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500",
      rating: 4.7,
      price_range: "₹700 - ₹1500",
      opening_time: "11:30",
      closing_time: "23:00",
      owner_id: admin.id,
      features: ["takeaway", "dine-in", "home-delivery"],
      estimated_delivery_time: 30,
      photos: [
        "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500",
        "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500"
      ],
      dietary_options: ["vegetarian", "vegan", "gluten_free"]
    },
    {
      name: "Burger Junction",
      description: "Premium burgers, fries and shakes.",
      cuisine_type: ["Fast Food", "American"],
      address: "Electronic City, Phase 1",
      city: "Bangalore",
      image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500",
      rating: 4.0,
      price_range: "₹300 - ₹600",
      opening_time: "10:00",
      closing_time: "22:00",
      owner_id: admin.id,
      features: ["takeaway", "home-delivery"],
      estimated_delivery_time: 25,
      photos: [
        "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500",
        "https://images.unsplash.com/photo-1550317138-10000687a72b?w=500"
      ],
      dietary_options: []
    }
  ];
  
  const insertedRestaurants = await Promise.all(
    restaurantsToInsert.map(restaurant => db.insert(restaurants).values(restaurant).returning())
  );
  
  console.log("Creating menu items...");
  // Create menu items for each restaurant with dietary options
  const menuItemsToInsert = [
    // Punjabi Tadka menu items
    {
      restaurant_id: insertedRestaurants[0][0].id,
      name: "Butter Chicken",
      description: "Creamy tomato curry with tender chicken pieces.",
      price: 320,
      image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500",
      category: "Main Course",
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: true,
      is_jain: false
    },
    {
      restaurant_id: insertedRestaurants[0][0].id,
      name: "Paneer Tikka Masala",
      description: "Grilled paneer in spicy tomato gravy.",
      price: 280,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
      category: "Main Course",
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      is_jain: true
    },
    {
      restaurant_id: insertedRestaurants[0][0].id,
      name: "Garlic Naan",
      description: "Soft bread with garlic flavor.",
      price: 60,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
      category: "Breads",
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      is_jain: false
    },
    
    // South Spice menu items
    {
      restaurant_id: insertedRestaurants[1][0].id,
      name: "Masala Dosa",
      description: "Crispy rice crepe with spiced potato filling.",
      price: 120,
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500",
      category: "Breakfast",
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      is_jain: false
    },
    {
      restaurant_id: insertedRestaurants[1][0].id,
      name: "Idli Sambar",
      description: "Steamed rice cakes with lentil soup.",
      price: 100,
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500",
      category: "Breakfast",
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      is_jain: true
    },
    {
      restaurant_id: insertedRestaurants[1][0].id,
      name: "Vegetable Biryani",
      description: "Fragrant rice with mixed vegetables.",
      price: 220,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
      category: "Main Course",
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      is_jain: true
    },
    
    // Dragon House menu items
    {
      restaurant_id: insertedRestaurants[2][0].id,
      name: "Kung Pao Chicken",
      description: "Spicy stir-fried chicken with peanuts.",
      price: 350,
      image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500",
      category: "Main Course",
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_jain: false
    },
    {
      restaurant_id: insertedRestaurants[2][0].id,
      name: "Veg Hakka Noodles",
      description: "Stir-fried noodles with vegetables.",
      price: 200,
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500",
      category: "Noodles",
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: false,
      is_jain: false
    },
    {
      restaurant_id: insertedRestaurants[2][0].id,
      name: "Veg Fried Rice",
      description: "Stir-fried rice with vegetables.",
      price: 180,
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
      category: "Rice",
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      is_jain: false
    },
    
    // Pizza Paradise menu items
    {
      restaurant_id: insertedRestaurants[3][0].id,
      name: "Margherita Pizza",
      description: "Classic pizza with tomato, mozzarella and basil.",
      price: 350,
      image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500",
      category: "Pizza",
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      is_jain: true
    },
    {
      restaurant_id: insertedRestaurants[3][0].id,
      name: "Vegan Garden Pizza",
      description: "Plant-based cheese with fresh vegetables.",
      price: 450,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
      category: "Pizza",
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: false,
      is_jain: true
    },
    {
      restaurant_id: insertedRestaurants[3][0].id,
      name: "Gluten-Free Pasta Arrabbiata",
      description: "Gluten-free pasta with spicy tomato sauce.",
      price: 320,
      image: "https://images.unsplash.com/photo-1608219992759-ceb79a0cbddc?w=500",
      category: "Pasta",
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      is_jain: true
    },
    
    // Burger Junction menu items
    {
      restaurant_id: insertedRestaurants[4][0].id,
      name: "Classic Cheeseburger",
      description: "Juicy beef patty with cheese and special sauce.",
      price: 250,
      image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500",
      category: "Burgers",
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_jain: false
    },
    {
      restaurant_id: insertedRestaurants[4][0].id,
      name: "Veggie Burger",
      description: "Plant-based patty with fresh toppings.",
      price: 220,
      image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=500",
      category: "Burgers",
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      is_jain: false
    },
    {
      restaurant_id: insertedRestaurants[4][0].id,
      name: "French Fries",
      description: "Crispy golden fries with seasoning.",
      price: 120,
      image: "https://images.unsplash.com/photo-1576777647209-e8733d7b851d?w=500",
      category: "Sides",
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      is_jain: false
    }
  ];
  
  await Promise.all(
    menuItemsToInsert.map(item => db.insert(menu_items).values(item))
  );
  
  console.log("Database seeding complete!");
}

seed().catch(e => {
  console.error("Error seeding database:", e);
  process.exit(1);
});