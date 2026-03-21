import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { collections } from "./collections";
import { products } from "./products";

export const collectionProducts = pgTable("collection_products", {
  id: text("id").primaryKey(),
  collectionId: text("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").default(0).notNull(),
});

export type CollectionProduct = typeof collectionProducts.$inferSelect;
export type NewCollectionProduct = typeof collectionProducts.$inferInsert;
