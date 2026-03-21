import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { eq, and, asc, desc, sql, min } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import {
  collections,
  collectionProducts,
  products,
  productVariants,
  categories,
} from "@/db/schema";

export const collectionsRouter = router({
  // Get all active collections (public)
  list: publicProcedure.query(async ({ ctx }) => {
    // First get all collections
    const allCollections = await ctx.db
      .select()
      .from(collections)
      .where(eq(collections.isActive, true))
      .orderBy(asc(collections.displayOrder));

    // Then get counts for each collection
    const result = await Promise.all(
      allCollections.map(async (collection) => {
        const countResult = await ctx.db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(collectionProducts)
          .where(eq(collectionProducts.collectionId, collection.id));

        return {
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          tagline: collection.tagline,
          coverImageUrl: collection.coverImageUrl,
          accentColor: collection.accentColor,
          isFeatured: collection.isFeatured,
          displayOrder: collection.displayOrder,
          productCount: countResult[0]?.count || 0,
        };
      })
    );

    return result;
  }),

  // Get featured collections (public)
  featured: publicProcedure.query(async ({ ctx }) => {
    // First get featured collections
    const featuredCollections = await ctx.db
      .select()
      .from(collections)
      .where(and(eq(collections.isActive, true), eq(collections.isFeatured, true)))
      .orderBy(asc(collections.displayOrder));

    // Then get counts for each collection
    const result = await Promise.all(
      featuredCollections.map(async (collection) => {
        const countResult = await ctx.db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(collectionProducts)
          .where(eq(collectionProducts.collectionId, collection.id));

        return {
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          tagline: collection.tagline,
          coverImageUrl: collection.coverImageUrl,
          accentColor: collection.accentColor,
          isFeatured: collection.isFeatured,
          displayOrder: collection.displayOrder,
          productCount: countResult[0]?.count || 0,
        };
      })
    );

    return result;
  }),

  // Get collection by slug with products (public)
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get collection
      const [collection] = await ctx.db
        .select()
        .from(collections)
        .where(and(eq(collections.slug, input.slug), eq(collections.isActive, true)))
        .limit(1);

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      // Get products in this collection with their cheapest variant price
      const collectionProductsData = await ctx.db
        .select({
          product: products,
          category: categories,
          displayOrder: collectionProducts.displayOrder,
          minPrice: sql<string>`(
            SELECT MIN(${productVariants.variantPrice})
            FROM ${productVariants}
            WHERE ${productVariants.productId} = ${products.id}
          )`,
        })
        .from(collectionProducts)
        .innerJoin(products, eq(collectionProducts.productId, products.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(collectionProducts.collectionId, collection.id))
        .orderBy(asc(collectionProducts.displayOrder));

      return {
        ...collection,
        products: collectionProductsData.map((cp) => ({
          ...cp.product,
          category: cp.category,
          minPrice: cp.minPrice ? parseFloat(cp.minPrice) : parseFloat(cp.product.basePrice),
        })),
      };
    }),

  // Admin: Get all collections (including inactive)
  adminList: adminProcedure.query(async ({ ctx }) => {
    // First get all collections
    const allCollections = await ctx.db
      .select()
      .from(collections)
      .orderBy(asc(collections.displayOrder));

    // Then get counts for each collection
    const result = await Promise.all(
      allCollections.map(async (collection) => {
        const countResult = await ctx.db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(collectionProducts)
          .where(eq(collectionProducts.collectionId, collection.id));

        return {
          ...collection,
          productCount: countResult[0]?.count || 0,
        };
      })
    );

    return result;
  }),

  // Admin: Upsert collection
  adminUpsert: adminProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        slug: z.string().min(1),
        tagline: z.string().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        moodImageUrls: z.array(z.string()).optional(),
        accentColor: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check slug uniqueness
      const existingSlug = await ctx.db
        .select({ id: collections.id })
        .from(collections)
        .where(eq(collections.slug, data.slug))
        .limit(1);

      if (existingSlug.length > 0 && existingSlug[0].id !== id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A collection with this slug already exists",
        });
      }

      if (id) {
        // Update
        const [updated] = await ctx.db
          .update(collections)
          .set(data)
          .where(eq(collections.id, id))
          .returning();

        return updated;
      } else {
        // Create
        const [created] = await ctx.db
          .insert(collections)
          .values({
            id: nanoid(),
            ...data,
            displayOrder: data.displayOrder ?? 0,
            isActive: data.isActive ?? true,
            isFeatured: data.isFeatured ?? false,
          })
          .returning();

        return created;
      }
    }),

  // Admin: Add product to collection
  adminAddProduct: adminProcedure
    .input(
      z.object({
        collectionId: z.string(),
        productId: z.string(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if product is already in collection
      const existing = await ctx.db
        .select()
        .from(collectionProducts)
        .where(
          and(
            eq(collectionProducts.collectionId, input.collectionId),
            eq(collectionProducts.productId, input.productId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Product is already in this collection",
        });
      }

      const [created] = await ctx.db
        .insert(collectionProducts)
        .values({
          id: nanoid(),
          collectionId: input.collectionId,
          productId: input.productId,
          displayOrder: input.displayOrder ?? 0,
        })
        .returning();

      return created;
    }),

  // Admin: Remove product from collection
  adminRemoveProduct: adminProcedure
    .input(
      z.object({
        collectionId: z.string(),
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(collectionProducts)
        .where(
          and(
            eq(collectionProducts.collectionId, input.collectionId),
            eq(collectionProducts.productId, input.productId)
          )
        );

      return { success: true };
    }),

  // Admin: Update product order in collection
  adminUpdateProductOrder: adminProcedure
    .input(
      z.object({
        collectionId: z.string(),
        productId: z.string(),
        displayOrder: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(collectionProducts)
        .set({ displayOrder: input.displayOrder })
        .where(
          and(
            eq(collectionProducts.collectionId, input.collectionId),
            eq(collectionProducts.productId, input.productId)
          )
        );

      return { success: true };
    }),
});
