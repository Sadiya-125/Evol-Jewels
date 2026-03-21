import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { cartItems, productVariants, products } from "@/db/schema";
import { nanoid } from "nanoid";

export const cartRouter = router({
  // Get user's cart items
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select({
        cartItem: cartItems,
        variant: productVariants,
        product: products,
      })
      .from(cartItems)
      .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .where(eq(cartItems.userId, ctx.user.id));

    return items.map((item) => ({
      id: item.cartItem.id,
      productId: item.product?.id || "",
      productVariantId: item.cartItem.productVariantId,
      name: item.product?.name || "",
      image: item.product?.images?.[0] || null,
      price: parseFloat(item.variant?.variantPrice || "0"),
      quantity: item.cartItem.quantity,
      customizationDetails: item.cartItem.customizationDetails
        ? JSON.parse(item.cartItem.customizationDetails)
        : null,
      variantLabel: item.variant
        ? `${item.variant.id}` // Simplified - you can enhance this with base variant details
        : null,
    }));
  }),

  // Add item to cart
  add: protectedProcedure
    .input(
      z.object({
        productVariantId: z.string(),
        quantity: z.number().int().positive().default(1),
        customizationDetails: z
          .object({
            engraving: z.string().optional(),
            specialInstructions: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if item already exists in cart
      const existingItem = await ctx.db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.userId, ctx.user.id),
          eq(cartItems.productVariantId, input.productVariantId)
        ),
      });

      if (existingItem) {
        // Update quantity if item already exists
        await ctx.db
          .update(cartItems)
          .set({
            quantity: existingItem.quantity + input.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingItem.id));

        return { id: existingItem.id };
      }

      // Create new cart item
      const id = nanoid();
      await ctx.db.insert(cartItems).values({
        id,
        userId: ctx.user.id,
        productVariantId: input.productVariantId,
        quantity: input.quantity,
        customizationDetails: input.customizationDetails
          ? JSON.stringify(input.customizationDetails)
          : null,
      });

      return { id };
    }),

  // Update cart item quantity
  updateQuantity: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify item belongs to user
      const item = await ctx.db.query.cartItems.findFirst({
        where: eq(cartItems.id, input.id),
      });

      if (!item || item.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      await ctx.db
        .update(cartItems)
        .set({
          quantity: input.quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, input.id));

      return { success: true };
    }),

  // Remove item from cart
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify item belongs to user
      const item = await ctx.db.query.cartItems.findFirst({
        where: eq(cartItems.id, input.id),
      });

      if (!item || item.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      await ctx.db.delete(cartItems).where(eq(cartItems.id, input.id));

      return { success: true };
    }),

  // Clear entire cart
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(cartItems).where(eq(cartItems.userId, ctx.user.id));

    return { success: true };
  }),

  // Sync local cart to server (for when user logs in)
  sync: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productVariantId: z.string(),
            quantity: z.number().int().positive(),
            customizationDetails: z
              .object({
                engraving: z.string().optional(),
                specialInstructions: z.string().optional(),
              })
              .optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get existing cart items
      const existingItems = await ctx.db.query.cartItems.findMany({
        where: eq(cartItems.userId, ctx.user.id),
      });

      // Process each input item
      for (const item of input.items) {
        const existing = existingItems.find(
          (e) => e.productVariantId === item.productVariantId
        );

        if (existing) {
          // Merge quantities
          await ctx.db
            .update(cartItems)
            .set({
              quantity: existing.quantity + item.quantity,
              updatedAt: new Date(),
            })
            .where(eq(cartItems.id, existing.id));
        } else {
          // Add new item
          await ctx.db.insert(cartItems).values({
            id: nanoid(),
            userId: ctx.user.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            customizationDetails: item.customizationDetails
              ? JSON.stringify(item.customizationDetails)
              : null,
          });
        }
      }

      return { success: true };
    }),
});
