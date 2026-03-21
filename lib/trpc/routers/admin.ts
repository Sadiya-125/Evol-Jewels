import { z } from "zod";
import { nanoid } from "nanoid";
import { router, adminProcedure } from "../trpc";
import {
  orders,
  orderItems,
  payments,
  items,
  products,
  productVariants,
  stores,
  baseVariants,
  stoneSpecifications,
  categories,
  collections,
  collectionProducts,
  newsletterSubscribers,
  user,
  customisationInquiries,
} from "@/db/schema";
import { eq, gte, and, or, sql, desc, asc, lt, ilike } from "drizzle-orm";

export const adminRouter = router({
  // Get dashboard stats
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Orders today
    const ordersToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, today),
          lt(orders.createdAt, tomorrow)
        )
      );

    // Total revenue (from completed payments)
    const revenue = await db
      .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(payments)
      .where(eq(payments.status, "completed"));

    // Low stock items (quantity < 5)
    const lowStockItems = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(lt(items.quantity, 5));

    // Total products
    const totalProducts = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    // Total orders
    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    // Pending orders
    const pendingOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, "pending"));

    return {
      ordersToday: Number(ordersToday[0]?.count || 0),
      revenue: parseFloat(revenue[0]?.total || "0"),
      lowStockItems: Number(lowStockItems[0]?.count || 0),
      totalProducts: Number(totalProducts[0]?.count || 0),
      totalOrders: Number(totalOrders[0]?.count || 0),
      pendingOrders: Number(pendingOrders[0]?.count || 0),
    };
  }),

  // Get all products with variants
  getProducts: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const conditions = [];
      if (input.search) {
        conditions.push(ilike(products.name, `%${input.search}%`));
      }

      const result = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          images: products.images,
          basePrice: products.basePrice,
          makingCharges: products.makingCharges,
          gst: products.gst,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          stockQuantity: products.stockQuantity,
          categoryId: products.categoryId,
          categoryName: categories.name,
          createdAt: products.createdAt,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(products.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        products: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  // Create product
  createProduct: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
        basePrice: z.string().default("0"),
        categoryId: z.string().min(1),
        makingCharges: z.string().default("0"),
        gst: z.string().default("3"),
        stockQuantity: z.number().default(0),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(products)
        .values({
          id: nanoid(),
          name: input.name,
          slug: input.slug,
          description: input.description,
          images: input.images || [],
          basePrice: input.basePrice,
          categoryId: input.categoryId,
          makingCharges: input.makingCharges,
          gst: input.gst,
          stockQuantity: input.stockQuantity,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
        })
        .returning();

      return result[0];
    }),

  // Update product
  updateProduct: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
        basePrice: z.string().optional(),
        categoryId: z.string().optional(),
        makingCharges: z.string().optional(),
        gst: z.string().optional(),
        stockQuantity: z.number().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      await ctx.db
        .update(products)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(products.id, id));

      return { success: true };
    }),

  // Delete product
  deleteProduct: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  // Get all orders
  getOrders: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const conditions = input.status
        ? [eq(orders.status, input.status)]
        : [];

      const result = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
          userId: orders.userId,
          storeId: orders.storeId,
          storeName: stores.name,
        })
        .from(orders)
        .leftJoin(stores, eq(orders.storeId, stores.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        orders: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  // Update order status
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(orders)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(orders.id, input.id));

      return { success: true };
    }),

  // Get inventory items
  getInventory: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        storeId: z.string().optional(),
        lowStock: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const conditions = [];
      if (input.storeId) {
        conditions.push(eq(items.storeId, input.storeId));
      }
      if (input.lowStock) {
        conditions.push(lt(items.quantity, 5));
      }

      const result = await db
        .select({
          id: items.id,
          quantity: items.quantity,
          reservedQuantity: items.reservedQuantity,
          price: items.price,
          storeId: items.storeId,
          storeName: stores.name,
          productVariantId: items.productVariantId,
          variantSku: productVariants.sku,
          variantPrice: productVariants.variantPrice,
          productId: products.id,
          productName: products.name,
          baseVariantName: baseVariants.name,
        })
        .from(items)
        .leftJoin(stores, eq(items.storeId, stores.id))
        .leftJoin(productVariants, eq(items.productVariantId, productVariants.id))
        .leftJoin(products, eq(productVariants.productId, products.id))
        .leftJoin(baseVariants, eq(productVariants.baseVariantId, baseVariants.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(items.quantity))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(items)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        items: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  // Create inventory item
  createInventory: adminProcedure
    .input(
      z.object({
        storeId: z.string().min(1),
        productVariantId: z.string().min(1),
        quantity: z.number().min(0).default(0),
        reservedQuantity: z.number().min(0).default(0),
        price: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(items)
        .values({
          id: nanoid(),
          storeId: input.storeId,
          productVariantId: input.productVariantId,
          quantity: input.quantity,
          reservedQuantity: input.reservedQuantity,
          price: input.price,
        })
        .returning();

      return result[0];
    }),

  // Update inventory quantity
  updateInventory: adminProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().min(0).optional(),
        reservedQuantity: z.number().min(0).optional(),
        price: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      await ctx.db
        .update(items)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(items.id, id));

      return { success: true };
    }),

  // Delete inventory item
  deleteInventory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(items)
        .where(eq(items.id, input.id));

      return { success: true };
    }),

  // Get product variants for inventory creation
  getProductVariants: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          id: productVariants.id,
          sku: productVariants.sku,
          variantPrice: productVariants.variantPrice,
          productId: productVariants.productId,
          productName: products.name,
          baseVariantId: productVariants.baseVariantId,
          baseVariantName: baseVariants.name,
        })
        .from(productVariants)
        .leftJoin(products, eq(productVariants.productId, products.id))
        .leftJoin(baseVariants, eq(productVariants.baseVariantId, baseVariants.id))
        .orderBy(asc(products.name))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(productVariants);

      return {
        variants: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  // Get all stores (for filtering)
  getStores: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: stores.id,
        name: stores.name,
        city: stores.city,
      })
      .from(stores)
      .orderBy(asc(stores.name));
  }),

  // ==================== CATEGORIES ====================
  getCategories: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(categories)
        .orderBy(asc(categories.name))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(categories);

      return {
        categories: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(categories)
        .values({
          id: nanoid(),
          ...input,
        })
        .returning();

      return result[0];
    }),

  updateCategory: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      await ctx.db
        .update(categories)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(categories.id, id));

      return { success: true };
    }),

  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(categories)
        .where(eq(categories.id, input.id));

      return { success: true };
    }),

  // ==================== COLLECTIONS ====================
  getCollections: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(collections)
        .orderBy(desc(collections.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(collections);

      return {
        collections: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  createCollection: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        tagline: z.string().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        accentColor: z.string().optional(),
        displayOrder: z.number().default(0),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(collections)
        .values({
          id: nanoid(),
          ...input,
        })
        .returning();

      return result[0];
    }),

  updateCollection: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        slug: z.string().optional(),
        tagline: z.string().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        accentColor: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      await ctx.db
        .update(collections)
        .set(updates)
        .where(eq(collections.id, id));

      return { success: true };
    }),

  deleteCollection: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete collection products first
      await ctx.db
        .delete(collectionProducts)
        .where(eq(collectionProducts.collectionId, input.id));

      // Delete collection
      await ctx.db
        .delete(collections)
        .where(eq(collections.id, input.id));

      return { success: true };
    }),

  // ==================== NEWSLETTER SUBSCRIBERS ====================
  getNewsletterSubscribers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(ilike(newsletterSubscribers.email, `%${input.search}%`));
      }

      const result = await ctx.db
        .select()
        .from(newsletterSubscribers)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(newsletterSubscribers.subscribedAt))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(newsletterSubscribers)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        subscribers: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  deleteNewsletterSubscriber: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(newsletterSubscribers)
        .where(eq(newsletterSubscribers.id, input.id));

      return { success: true };
    }),

  // ==================== USERS ====================
  getUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(
          or(
            ilike(user.name, `%${input.search}%`),
            ilike(user.email, `%${input.search}%`)
          )
        );
      }

      const result = await ctx.db
        .select()
        .from(user)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(user.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        users: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      await ctx.db
        .update(user)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(user.id, id));

      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(user)
        .where(eq(user.id, input.id));

      return { success: true };
    }),

  // ==================== STORES ====================
  getAllStores: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(stores)
        .orderBy(asc(stores.name))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(stores);

      return {
        stores: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  createStore: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().default("India"),
        phone: z.string().min(1),
        email: z.string().optional(),
        openingHours: z.string().optional(),
        coordinates: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(stores)
        .values({
          id: nanoid(),
          ...input,
        })
        .returning();

      return result[0];
    }),

  updateStore: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        slug: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        openingHours: z.string().optional(),
        coordinates: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      await ctx.db
        .update(stores)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(stores.id, id));

      return { success: true };
    }),

  deleteStore: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(stores)
        .where(eq(stores.id, input.id));

      return { success: true };
    }),

  // ==================== BASE VARIANTS ====================
  getBaseVariants: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(baseVariants)
        .orderBy(asc(baseVariants.goldKarat), asc(baseVariants.goldColor))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(baseVariants);

      return {
        variants: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  createBaseVariant: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        goldKarat: z.string().min(1),
        goldColor: z.string().min(1),
        goldWeight: z.number().int(),
        isCustomizable: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(baseVariants)
        .values({
          id: nanoid(),
          ...input,
        })
        .returning();

      return result[0];
    }),

  updateBaseVariant: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        goldKarat: z.string().optional(),
        goldColor: z.string().optional(),
        goldWeight: z.number().optional(),
        isCustomizable: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      await ctx.db
        .update(baseVariants)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(baseVariants.id, id));

      return { success: true };
    }),

  deleteBaseVariant: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(baseVariants)
        .where(eq(baseVariants.id, input.id));

      return { success: true };
    }),

  // ==================== STONE SPECIFICATIONS ====================
  getStoneSpecifications: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(stoneSpecifications)
        .orderBy(asc(stoneSpecifications.stoneType))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(stoneSpecifications);

      return {
        specifications: result,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  createStoneSpecification: adminProcedure
    .input(
      z.object({
        stoneType: z.string().min(1),
        stoneQuality: z.string().optional(),
        stoneColor: z.string().optional(),
        stoneWeight: z.string().optional(),
        stoneCount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(stoneSpecifications)
        .values({
          id: nanoid(),
          ...input,
        })
        .returning();

      return result[0];
    }),

  updateStoneSpecification: adminProcedure
    .input(
      z.object({
        id: z.string(),
        stoneType: z.string().optional(),
        stoneQuality: z.string().optional(),
        stoneColor: z.string().optional(),
        stoneWeight: z.string().optional(),
        stoneCount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      await ctx.db
        .update(stoneSpecifications)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(stoneSpecifications.id, id));

      return { success: true };
    }),

  deleteStoneSpecification: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(stoneSpecifications)
        .where(eq(stoneSpecifications.id, input.id));

      return { success: true };
    }),
});
