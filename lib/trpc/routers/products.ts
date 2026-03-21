import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { eq, and, gte, lte, desc, asc, sql, inArray, or, ilike } from "drizzle-orm";
import { products, categories, productVariants, baseVariants, stoneSpecifications } from "@/db/schema";

export const productsRouter = router({
  // Get all products with filters
  list: publicProcedure
    .input(
      z.object({
        // Category filters
        category: z.array(z.string()).optional(), // Multiple category slugs
        categoryId: z.string().optional(), // Single category ID (legacy)

        // Stone/shape filter
        shape: z.string().optional(),

        // Occasion filter (tags)
        occasion: z.array(z.string()).optional(),

        // Gender filter
        gender: z.string().optional(),

        // Size filter
        size: z.array(z.string()).optional(),

        // Price range
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        minPrice: z.number().optional(), // Legacy
        maxPrice: z.number().optional(), // Legacy

        // Weight range
        weightMin: z.number().optional(),
        weightMax: z.number().optional(),

        // Special filters
        filter: z.string().optional(), // For solitaire, ready-to-ship, etc.

        // Gold specifications
        goldKarat: z.string().optional(),
        karat: z.array(z.string()).optional(), // Multiple karat values
        goldColor: z.string().optional(),
        isCustomizable: z.boolean().optional(),

        // Search within results
        search: z.string().optional(),

        // Sorting and pagination
        sort: z.enum(["price_asc", "price_desc", "newest", "popular"]).optional(),
        sortBy: z.enum(["newest", "price_asc", "price_desc", "name"]).optional(), // Legacy
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        category,
        categoryId,
        shape,
        occasion,
        gender,
        priceMin,
        priceMax,
        minPrice,
        maxPrice,
        weightMin,
        weightMax,
        filter,
        goldKarat,
        karat,
        search,
        sort,
        sortBy,
        limit,
        offset,
      } = input;

      // Build where conditions
      const conditions = [];
      conditions.push(eq(products.isActive, true));

      // Category filter (support both array and single ID)
      if (category && category.length > 0) {
        // Get category IDs from slugs
        const categoryResults = await ctx.db
          .select({ id: categories.id })
          .from(categories)
          .where(inArray(categories.slug, category));

        if (categoryResults.length > 0) {
          conditions.push(inArray(products.categoryId, categoryResults.map(c => c.id)));
        }
      } else if (categoryId) {
        conditions.push(eq(products.categoryId, categoryId));
      }

      // Price filter (support both new and legacy params)
      const effectiveMinPrice = priceMin ?? minPrice;
      const effectiveMaxPrice = priceMax ?? maxPrice;

      if (effectiveMinPrice !== undefined) {
        conditions.push(gte(products.basePrice, effectiveMinPrice.toString()));
      }

      if (effectiveMaxPrice !== undefined) {
        conditions.push(lte(products.basePrice, effectiveMaxPrice.toString()));
      }

      // Search filter
      if (search && search.trim().length > 0) {
        conditions.push(
          or(
            ilike(products.name, `%${search}%`),
            ilike(products.description, `%${search}%`)
          )
        );
      }

      // Special filters (solitaire, ready-to-ship, etc.)
      if (filter === "solitaire") {
        conditions.push(ilike(products.name, `%solitaire%`));
      } else if (filter === "ready-to-ship") {
        // Products with stock > 0
        // This would need a subquery on variants, simplified here
        conditions.push(eq(products.isFeatured, true));
      }

      // Build order by
      const effectiveSort = sort || sortBy || "newest";
      let orderBy;
      switch (effectiveSort) {
        case "price_asc":
          orderBy = asc(products.basePrice);
          break;
        case "price_desc":
          orderBy = desc(products.basePrice);
          break;
        case "name":
          orderBy = asc(products.name);
          break;
        case "popular":
          orderBy = desc(products.isFeatured); // Simplified - would need view count
          break;
        case "newest":
        default:
          orderBy = desc(products.createdAt);
          break;
      }

      // Handle karat filtering
      const effectiveKarat = karat || (goldKarat ? [goldKarat] : undefined);
      let filteredProductIds: string[] | undefined;

      if (effectiveKarat && effectiveKarat.length > 0) {
        // Get product IDs that have variants matching the karat filter
        const variantResults = await ctx.db
          .selectDistinct({ productId: productVariants.productId })
          .from(productVariants)
          .innerJoin(baseVariants, eq(productVariants.baseVariantId, baseVariants.id))
          .where(inArray(baseVariants.goldKarat, effectiveKarat));

        filteredProductIds = variantResults.map((r) => r.productId);

        if (filteredProductIds.length === 0) {
          // No products match the karat filter
          return [];
        }

        conditions.push(inArray(products.id, filteredProductIds));
      }

      // Handle weight filtering
      if (weightMin !== undefined || weightMax !== undefined) {
        const weightConditions = [];
        if (weightMin !== undefined) {
          weightConditions.push(gte(baseVariants.goldWeight, weightMin));
        }
        if (weightMax !== undefined) {
          weightConditions.push(lte(baseVariants.goldWeight, weightMax));
        }

        const weightVariantResults = await ctx.db
          .selectDistinct({ productId: productVariants.productId })
          .from(productVariants)
          .innerJoin(baseVariants, eq(productVariants.baseVariantId, baseVariants.id))
          .where(and(...weightConditions));

        const weightFilteredIds = weightVariantResults.map((r) => r.productId);

        if (weightFilteredIds.length === 0) {
          return [];
        }

        conditions.push(inArray(products.id, weightFilteredIds));
      }

      // Handle shape filtering (via stone specifications)
      if (shape) {
        // For now, we'll filter by products that have the shape name in their title
        // In a real implementation, this would use stone_specifications table
        conditions.push(ilike(products.name, `%${shape}%`));
      }

      // Handle occasion filtering
      // Note: This requires a tags/occasions field in the products table
      // For now, we'll use name-based matching
      if (occasion && occasion.length > 0) {
        const occasionConditions = occasion.map(occ => ilike(products.name, `%${occ}%`));
        conditions.push(or(...occasionConditions));
      }

      // Handle gender filtering
      // Note: This requires a gender field in the products table
      // For now, we'll use name-based matching
      if (gender) {
        if (gender === "her") {
          conditions.push(
            or(
              ilike(products.name, "%women%"),
              ilike(products.name, "%ladies%"),
              ilike(products.description, "%women%"),
              ilike(products.description, "%ladies%")
            )
          );
        } else if (gender === "him") {
          conditions.push(
            or(
              ilike(products.name, "%men%"),
              ilike(products.name, "%gents%"),
              ilike(products.description, "%men%"),
              ilike(products.description, "%gents%")
            )
          );
        }
        // Unisex: no additional filter needed
      }

      // Handle size filtering
      // Note: This requires a sizes field in the products table
      // For now, we'll skip this filter as it requires schema changes
      // if (size && size.length > 0) {
      //   // Would filter by available sizes
      // }

      // Get total count for pagination
      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions));

      const totalCount = countResult[0]?.count || 0;

      const result = await ctx.db
        .select({
          product: products,
          category: categories,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return result;
    }),

  // Get product by ID with all variants
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: {
          category: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Get all variants for this product
      const variantsData = await ctx.db
        .select({
          variant: productVariants,
          baseVariant: baseVariants,
          stoneSpec: stoneSpecifications,
        })
        .from(productVariants)
        .leftJoin(baseVariants, eq(productVariants.baseVariantId, baseVariants.id))
        .leftJoin(stoneSpecifications, eq(productVariants.stoneSpecId, stoneSpecifications.id))
        .where(eq(productVariants.productId, input.id));

      // Flatten variants for easier frontend consumption
      const variants = variantsData.map((v) => ({
        id: v.variant.id,
        sku: v.variant.sku,
        price: parseFloat(v.variant.variantPrice),
        stockQuantity: v.variant.stockQuantity,
        goldKarat: v.baseVariant?.goldKarat || "",
        goldColor: v.baseVariant?.goldColor || "",
        goldWeight: v.baseVariant?.goldWeight || 0,
        isCustomizable: v.baseVariant?.isCustomizable || false,
        stoneType: v.stoneSpec?.stoneType,
        stoneQuality: v.stoneSpec?.stoneQuality,
        stoneColor: v.stoneSpec?.stoneColor,
        stoneWeight: v.stoneSpec?.stoneWeight ? parseFloat(v.stoneSpec.stoneWeight) : undefined,
        stoneCount: v.stoneSpec?.stoneCount,
      }));

      return {
        ...product,
        price: parseFloat(product.basePrice),
        variants,
      };
    }),

  // Get product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.slug, input.slug),
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const category = await ctx.db.query.categories.findFirst({
        where: eq(categories.id, product.categoryId),
      });

      // Get all variants for this product
      const variantsData = await ctx.db
        .select({
          variant: productVariants,
          baseVariant: baseVariants,
          stoneSpec: stoneSpecifications,
        })
        .from(productVariants)
        .leftJoin(baseVariants, eq(productVariants.baseVariantId, baseVariants.id))
        .leftJoin(stoneSpecifications, eq(productVariants.stoneSpecId, stoneSpecifications.id))
        .where(eq(productVariants.productId, product.id));

      // Flatten variants for easier frontend consumption
      const variants = variantsData.map((v) => ({
        id: v.variant.id,
        sku: v.variant.sku,
        price: parseFloat(v.variant.variantPrice),
        stockQuantity: v.variant.stockQuantity,
        goldKarat: v.baseVariant?.goldKarat || "",
        goldColor: v.baseVariant?.goldColor || "",
        goldWeight: v.baseVariant?.goldWeight || 0,
        isCustomizable: v.baseVariant?.isCustomizable || false,
        stoneType: v.stoneSpec?.stoneType,
        stoneQuality: v.stoneSpec?.stoneQuality,
        stoneColor: v.stoneSpec?.stoneColor,
        stoneWeight: v.stoneSpec?.stoneWeight ? parseFloat(v.stoneSpec.stoneWeight) : undefined,
        stoneCount: v.stoneSpec?.stoneCount,
      }));

      return {
        ...product,
        price: parseFloat(product.basePrice),
        category,
        variants,
      };
    }),

  // Get featured products
  featured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(6) }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          product: products,
          category: categories,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
        .orderBy(desc(products.createdAt))
        .limit(input.limit);

      return result;
    }),

  // Get related products
  related: publicProcedure
    .input(z.object({ productId: z.string(), limit: z.number().default(4) }))
    .query(async ({ ctx, input }) => {
      // First get the product to find its category
      const currentProduct = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!currentProduct) {
        return { products: [] };
      }

      const result = await ctx.db
        .select({
          product: products,
          category: categories,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          and(
            eq(products.categoryId, currentProduct.categoryId),
            eq(products.isActive, true),
            sql`${products.id} != ${input.productId}`
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(input.limit);

      return { products: result };
    }),

  // Full-text search using PostgreSQL tsvector/tsquery
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;

      // First try simple ILIKE search for better UX
      const simpleResults = await ctx.db
        .select()
        .from(products)
        .where(
          and(
            eq(products.isActive, true),
            or(
              ilike(products.name, `%${query}%`),
              ilike(products.description, `%${query}%`)
            )
          )
        )
        .orderBy(desc(products.isFeatured), desc(products.createdAt))
        .limit(limit);

      // Return simplified format for SearchOverlay
      return simpleResults.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        images: product.images,
      }));
    }),

  // Get products by variant IDs (for shared wishlist)
  byVariantIds: publicProcedure
    .input(z.object({ ids: z.array(z.string()).max(50) }))
    .query(async ({ ctx, input }) => {
      if (input.ids.length === 0) {
        return [];
      }

      // First try to find as variant IDs
      const variantResults = await ctx.db
        .select({
          variant: productVariants,
          product: products,
          category: categories,
        })
        .from(productVariants)
        .leftJoin(products, eq(productVariants.productId, products.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(inArray(productVariants.id, input.ids));

      // If we found results, return them
      if (variantResults.length > 0) {
        return variantResults.map((r) => ({
          variantId: r.variant.id,
          productId: r.product?.id || "",
          name: r.product?.name || "",
          slug: r.product?.slug || "",
          image: r.product?.images && r.product.images.length > 0 ? r.product.images[0] : null,
          price: parseFloat(r.variant.variantPrice),
          category: r.category,
        }));
      }

      // If no variants found, try as product IDs (fallback for old wishlist data)
      const productResults = await ctx.db
        .select({
          product: products,
          category: categories,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(inArray(products.id, input.ids), eq(products.isActive, true)));

      // For each product, get the first variant
      const productsWithVariants = await Promise.all(
        productResults.map(async (r) => {
          const firstVariant = await ctx.db.query.productVariants.findFirst({
            where: eq(productVariants.productId, r.product.id),
          });

          return {
            variantId: firstVariant?.id || r.product.id,
            productId: r.product.id,
            name: r.product.name,
            slug: r.product.slug,
            image: r.product.images && r.product.images.length > 0 ? r.product.images[0] : null,
            price: firstVariant ? parseFloat(firstVariant.variantPrice) : parseFloat(r.product.basePrice),
            category: r.category,
          };
        })
      );

      return productsWithVariants;
    }),
});
