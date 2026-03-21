import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";

export const usersRouter = router({
  // Save address to user profile
  saveAddress: protectedProcedure
    .input(
      z.object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        pinCode: z.string(),
        country: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({
          savedAddress: JSON.stringify(input),
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id));

      return { success: true };
    }),

  // Save phone number to user profile
  savePhone: protectedProcedure
    .input(
      z.object({
        phone: z.string().regex(/^\+91\d{10}$/, "Phone must be in format +91XXXXXXXXXX"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({
          phone: input.phone,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id));

      return { success: true };
    }),

  // Get user profile with saved address
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await ctx.db
      .select()
      .from(user)
      .where(eq(user.id, ctx.user.id))
      .limit(1);

    if (!profile) {
      return null;
    }

    return {
      ...profile,
      savedAddress: profile.savedAddress ? JSON.parse(profile.savedAddress) : null,
    };
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().regex(/^\+91\d{10}$/, "Phone must be in format +91XXXXXXXXXX").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({
          name: input.name,
          ...(input.phone && { phone: input.phone }),
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id));

      return { success: true };
    }),

  // Update saved address
  updateAddress: protectedProcedure
    .input(
      z.object({
        line1: z.string().min(1, "Address line 1 is required"),
        line2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pinCode: z.string().min(1, "PIN code is required"),
        country: z.string().min(1, "Country is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({
          savedAddress: JSON.stringify(input),
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id));

      return { success: true };
    }),
});
