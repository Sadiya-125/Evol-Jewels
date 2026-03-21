import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq, desc, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { orders, orderItems, productVariants, products } from "@/db/schema";
import { nanoid } from "nanoid";

// Address schema
const addressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10).max(10),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pinCode: z.string().min(6).max(6),
  country: z.string().default("India"),
});

export const ordersRouter = router({
  // Get user's orders
  list: protectedProcedure.query(async ({ ctx }) => {
    const userOrders = await ctx.db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(desc(orders.createdAt));

    return userOrders;
  }),

  // Get order by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.id),
      });

      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Get order items
      const items = await ctx.db
        .select({
          orderItem: orderItems,
          variant: productVariants,
          product: products,
        })
        .from(orderItems)
        .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
        .leftJoin(products, eq(productVariants.productId, products.id))
        .where(eq(orderItems.orderId, input.id));

      return {
        ...order,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        billingAddress: order.billingAddress ? JSON.parse(order.billingAddress) : null,
        items,
      };
    }),

  // Alias for getById to match spec
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.id),
      });

      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Get order items
      const items = await ctx.db
        .select({
          orderItem: orderItems,
          variant: productVariants,
          product: products,
        })
        .from(orderItems)
        .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
        .leftJoin(products, eq(productVariants.productId, products.id))
        .where(eq(orderItems.orderId, input.id));

      return {
        ...order,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        billingAddress: order.billingAddress ? JSON.parse(order.billingAddress) : null,
        items,
      };
    }),

  // Create new order
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productVariantId: z.string(),
            quantity: z.number().int().positive(),
            unitPrice: z.number().positive(),
          })
        ),
        shippingAddress: addressSchema,
        billingAddress: addressSchema.optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Validate all product variants exist and fetch product details
      const variantIds = input.items.map((item) => item.productVariantId);

      const variants = await ctx.db
        .select({
          variant: productVariants,
          product: products,
        })
        .from(productVariants)
        .leftJoin(products, eq(productVariants.productId, products.id))
        .where(inArray(productVariants.id, variantIds));

      if (variants.length !== variantIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more product variants not found",
        });
      }

      // 2. Calculate totals
      let subtotal = 0;
      let makingCharges = 0;
      let taxAmount = 0;

      for (const item of input.items) {
        const variant = variants.find((v) => v.variant.id === item.productVariantId);
        if (!variant || !variant.product) continue;

        const itemSubtotal = item.unitPrice * item.quantity;
        const itemMakingCharges = parseFloat(variant.product.makingCharges) * item.quantity;
        const itemTax = (itemSubtotal + itemMakingCharges) * (parseFloat(variant.product.gst) / 100);

        subtotal += itemSubtotal;
        makingCharges += itemMakingCharges;
        taxAmount += itemTax;
      }

      // Calculate shipping (free for orders above ₹10,000)
      const shippingCost = subtotal + makingCharges >= 10000 ? 0 : 199;

      // Calculate total
      const total = subtotal + makingCharges + taxAmount + shippingCost;

      // 3. Generate order number: EVL-{YYYYMMDD}-{5-digit random}
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `EVL-${dateStr}-${randomDigits}`;

      const orderId = nanoid();

      // 4. Create order
      await ctx.db.insert(orders).values({
        id: orderId,
        userId: ctx.user.id,
        orderNumber,
        status: "pending",
        subtotal: subtotal.toFixed(2),
        tax: taxAmount.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        total: total.toFixed(2),
        shippingAddress: JSON.stringify(input.shippingAddress),
        billingAddress: JSON.stringify(input.billingAddress || input.shippingAddress),
        notes: input.notes,
      });

      // 5. Create order items
      const orderItemsData = input.items.map((item) => ({
        id: nanoid(),
        orderId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: (item.unitPrice * item.quantity).toFixed(2),
      }));

      await ctx.db.insert(orderItems).values(orderItemsData);

      return { orderId, orderNumber };
    }),

  // Update order status
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify order belongs to user
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      });

      if (!order || order.userId !== ctx.user.id) {
        throw new Error("Order not found");
      }

      await ctx.db
        .update(orders)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),
});
