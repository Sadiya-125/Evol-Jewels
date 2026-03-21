import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

// BetterAuth requires table name to be "user" (singular)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"), // "customer", "admin"
  savedAddress: text("saved_address"), // JSON string of saved address
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
