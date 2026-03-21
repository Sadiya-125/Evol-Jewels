import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { wishlists, productVariants, products, categories } from "@/db/schema";
import { nanoid } from "nanoid";

export const wishlistRouter = router({
  // Get user's wishlist items
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select({
        wishlist: wishlists,
        variant: productVariants,
        product: products,
        category: categories,
      })
      .from(wishlists)
      .leftJoin(productVariants, eq(wishlists.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(wishlists.userId, ctx.user.id));

    return items.map((item) => ({
      id: item.wishlist.id,
      productId: item.product?.id || "",
      productVariantId: item.wishlist.productVariantId,
      name: item.product?.name || "",
      image: item.product?.images?.[0] || null,
      price: parseFloat(item.variant?.variantPrice || item.product?.basePrice || "0"),
      variantLabel: item.variant
        ? `${item.variant.id}` // Simplified - you can enhance this
        : null,
      addedAt: item.wishlist.createdAt.getTime(),
      category: item.category,
    }));
  }),

  // Add item to wishlist
  add: protectedProcedure
    .input(z.object({ productVariantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if item already exists
      const existing = await ctx.db.query.wishlists.findFirst({
        where: and(
          eq(wishlists.userId, ctx.user.id),
          eq(wishlists.productVariantId, input.productVariantId)
        ),
      });

      if (existing) {
        return { id: existing.id, alreadyExists: true };
      }

      // Verify product variant exists
      const variant = await ctx.db.query.productVariants.findFirst({
        where: eq(productVariants.id, input.productVariantId),
      });

      if (!variant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product variant not found",
        });
      }

      // Create new wishlist item
      const id = nanoid();
      await ctx.db.insert(wishlists).values({
        id,
        userId: ctx.user.id,
        productVariantId: input.productVariantId,
      });

      return { id, alreadyExists: false };
    }),

  // Remove item from wishlist
  remove: protectedProcedure
    .input(z.object({ productVariantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(wishlists)
        .where(
          and(
            eq(wishlists.userId, ctx.user.id),
            eq(wishlists.productVariantId, input.productVariantId)
          )
        );

      return { success: true };
    }),

  // Toggle item in wishlist (add if not exists, remove if exists)
  toggle: protectedProcedure
    .input(z.object({ productVariantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.wishlists.findFirst({
        where: and(
          eq(wishlists.userId, ctx.user.id),
          eq(wishlists.productVariantId, input.productVariantId)
        ),
      });

      if (existing) {
        // Remove from wishlist
        await ctx.db.delete(wishlists).where(eq(wishlists.id, existing.id));
        return { added: false };
      } else {
        // Add to wishlist
        const id = nanoid();
        await ctx.db.insert(wishlists).values({
          id,
          userId: ctx.user.id,
          productVariantId: input.productVariantId,
        });
        return { added: true };
      }
    }),

  // Check if item is in wishlist
  isInWishlist: protectedProcedure
    .input(z.object({ productVariantId: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.wishlists.findFirst({
        where: and(
          eq(wishlists.userId, ctx.user.id),
          eq(wishlists.productVariantId, input.productVariantId)
        ),
      });

      return { isInWishlist: !!item };
    }),

  // Clear entire wishlist
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(wishlists).where(eq(wishlists.userId, ctx.user.id));

    return { success: true };
  }),

  // Sync local wishlist to server (for when user logs in)
  sync: protectedProcedure
    .input(
      z.object({
        productVariantIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get existing wishlist items
      const existingItems = await ctx.db.query.wishlists.findMany({
        where: eq(wishlists.userId, ctx.user.id),
      });

      const existingVariantIds = new Set(existingItems.map((item) => item.productVariantId));

      // Add new items that don't exist yet
      const newVariantIds = input.productVariantIds.filter(
        (id) => !existingVariantIds.has(id)
      );

      if (newVariantIds.length > 0) {
        await ctx.db.insert(wishlists).values(
          newVariantIds.map((variantId) => ({
            id: nanoid(),
            userId: ctx.user.id,
            productVariantId: variantId,
          }))
        );
      }

      return { success: true, added: newVariantIds.length };
    }),

  // Move items from wishlist to cart
  moveToCart: protectedProcedure
    .input(z.object({ productVariantIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      // This is handled by the cart router's add mutation
      // Just return success, the client will handle adding to cart
      return { success: true };
    }),
});
