import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").default("user").notNull(),
  dietary_preferences: text("dietary_preferences").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  cuisine_type: text("cuisine_type").array(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  image: text("image"),
  phone: text("phone"),
  rating: doublePrecision("rating"),
  price_range: text("price_range"),
  opening_time: text("opening_time"),
  closing_time: text("closing_time"),
  owner_id: integer("owner_id").notNull(),
  features: text("features").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  estimated_delivery_time: integer("estimated_delivery_time"),
  photos: text("photos").array(),
  dietary_options: text("dietary_options").array(),
  google_place_id: text("google_place_id"),
});

export const menu_items = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurant_id: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  image: text("image"),
  category: text("category"),
  is_vegetarian: boolean("is_vegetarian").default(false),
  is_vegan: boolean("is_vegan").default(false),
  is_gluten_free: boolean("is_gluten_free").default(false),
  is_jain: boolean("is_jain").default(false),
  is_available: boolean("is_available").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  restaurant_id: integer("restaurant_id").notNull(),
  restaurant_name: text("restaurant_name"),
  user_id: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  restaurant_id: integer("restaurant_id").notNull(),
  status: text("status").default("pending").notNull(),
  total_amount: doublePrecision("total_amount").notNull(),
  delivery_address: text("delivery_address"),
  payment_method: text("payment_method"),
  payment_status: text("payment_status").default("pending"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  estimated_delivery_time: integer("estimated_delivery_time"),
  delivery_coordinates: jsonb("delivery_coordinates"),
  driver_location: jsonb("driver_location"),
  special_instructions: text("special_instructions"),
  split_details: jsonb("split_details"),
});

export const order_items = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull(),
  menu_item_id: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const cart_items = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  menu_item_id: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
});

export const table_bookings = pgTable("table_bookings", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  restaurant_id: integer("restaurant_id").notNull(),
  restaurant_name: text("restaurant_name"),
  booking_date: timestamp("booking_date").notNull(),
  booking_time: text("booking_time").notNull(),
  guests: text("guests").notNull(),
  status: text("status").default("pending").notNull(),
  special_request: text("special_request").default(''),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true, created_at: true });
export const insertMenuItemSchema = createInsertSchema(menu_items).omit({ id: true, created_at: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, created_at: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, created_at: true, updated_at: true });
export const insertOrderItemSchema = createInsertSchema(order_items).omit({ id: true, created_at: true });
export const insertCartItemSchema = createInsertSchema(cart_items).omit({ id: true, created_at: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertTableBookingSchema = createInsertSchema(table_bookings).omit({ id: true, created_at: true });

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type MenuItem = typeof menu_items.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof order_items.$inferSelect;
export type CartItem = typeof cart_items.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type TableBooking = typeof table_bookings.$inferSelect;
export type InsertTableBooking = z.infer<typeof insertTableBookingSchema>;
