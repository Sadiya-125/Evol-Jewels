import { relations } from "drizzle-orm";
import { user } from "./users";
import { session, account } from "./auth";
import { categories } from "./categories";
import { baseVariants } from "./baseVariants";
import { stoneSpecifications } from "./stoneSpecifications";
import { products } from "./products";
import { productVariants } from "./productVariants";
import { stores } from "./stores";
import { items } from "./items";
import { orders } from "./orders";
import { orderItems } from "./orderItems";
import { payments } from "./payments";
import { collections } from "./collections";
import { collectionProducts } from "./collectionProducts";
import { wishlists } from "./wishlists";
import { cartItems } from "./cartItems";
import { customisationInquiries } from "./customisationInquiries";

// Products relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  collectionProducts: many(collectionProducts),
}));

// Categories relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// Product Variants relations
export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  baseVariant: one(baseVariants, {
    fields: [productVariants.baseVariantId],
    references: [baseVariants.id],
  }),
  stoneSpec: one(stoneSpecifications, {
    fields: [productVariants.stoneSpecId],
    references: [stoneSpecifications.id],
  }),
  items: many(items),
  orderItems: many(orderItems),
  wishlists: many(wishlists),
  cartItems: many(cartItems),
}));

// Base Variants relations
export const baseVariantsRelations = relations(baseVariants, ({ many }) => ({
  productVariants: many(productVariants),
}));

// Stone Specifications relations
export const stoneSpecificationsRelations = relations(stoneSpecifications, ({ many }) => ({
  productVariants: many(productVariants),
}));

// Orders relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  orderItems: many(orderItems),
  payments: many(payments),
}));

// User relations (BetterAuth)
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  orders: many(orders),
  wishlists: many(wishlists),
  cartItems: many(cartItems),
  customisationInquiries: many(customisationInquiries),
}));

// Session relations (BetterAuth)
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

// Account relations (BetterAuth)
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Stores relations
export const storesRelations = relations(stores, ({ many }) => ({
  items: many(items),
  orders: many(orders),
}));

// Items relations
export const itemsRelations = relations(items, ({ one }) => ({
  store: one(stores, {
    fields: [items.storeId],
    references: [stores.id],
  }),
  productVariant: one(productVariants, {
    fields: [items.productVariantId],
    references: [productVariants.id],
  }),
}));

// Order Items relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

// Payments relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

// Collections relations
export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionProducts: many(collectionProducts),
}));

// Collection Products relations (junction table)
export const collectionProductsRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionProducts.collectionId],
    references: [collections.id],
  }),
  product: one(products, {
    fields: [collectionProducts.productId],
    references: [products.id],
  }),
}));

// Wishlists relations
export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(user, {
    fields: [wishlists.userId],
    references: [user.id],
  }),
  productVariant: one(productVariants, {
    fields: [wishlists.productVariantId],
    references: [productVariants.id],
  }),
}));

// Cart Items relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(user, {
    fields: [cartItems.userId],
    references: [user.id],
  }),
  productVariant: one(productVariants, {
    fields: [cartItems.productVariantId],
    references: [productVariants.id],
  }),
}));

// Customisation Inquiries relations
export const customisationInquiriesRelations = relations(customisationInquiries, ({ one }) => ({
  user: one(user, {
    fields: [customisationInquiries.userId],
    references: [user.id],
  }),
}));
