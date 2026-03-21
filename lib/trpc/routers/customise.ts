import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { customisationInquiries } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { sendCustomiseAcknowledgementEmail, sendCustomiseInternalNotification } from "@/lib/email";

// Simple in-memory rate limiting (3 submissions per IP per 24 hours)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000, // 24 hours from now
    });
    return true;
  }

  if (limit.count >= 3) {
    return false; // Rate limit exceeded
  }

  limit.count += 1;
  return true;
}

export const customiseRouter = router({
  // Submit customisation inquiry
  submitInquiry: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(100),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
        requirement: z
          .string()
          .min(20, "Please describe your requirement in at least 20 characters")
          .max(2000, "Requirement must be less than 2000 characters"),
        budgetRange: z.enum(["under_50k", "50k_1l", "1l_3l", "3l_5l", "above_5l"]).optional(),
        occasion: z.enum(["engagement", "wedding", "anniversary", "birthday", "self", "gift", "other"]).optional(),
        timeline: z.string().max(200).optional(),
        referenceImageUrl: z.string().url().optional(),
        referenceImageKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Rate limiting (using a mock IP for now, in production use real IP)
      const clientIp = "mock-ip"; // In production: ctx.req?.headers.get("x-forwarded-for") || ctx.req?.headers.get("x-real-ip") || "unknown"

      if (!checkRateLimit(clientIp)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many submissions. Please try again tomorrow.",
        });
      }

      // Create inquiry
      const [inquiry] = await ctx.db
        .insert(customisationInquiries)
        .values({
          name: input.name,
          email: input.email,
          phone: input.phone,
          requirement: input.requirement,
          budgetRange: input.budgetRange,
          occasion: input.occasion,
          timeline: input.timeline,
          referenceImageUrl: input.referenceImageUrl,
          referenceImageKey: input.referenceImageKey,
          userId: ctx.user?.id || null,
          status: "new",
        })
        .returning();

      // Send emails gracefully - don't fail the submission if email fails
      try {
        await sendCustomiseAcknowledgementEmail(inquiry.email, inquiry.name, inquiry.id);
      } catch (emailError) {
        console.error("Failed to send acknowledgement email:", emailError);
        // Continue - inquiry is already saved
      }

      try {
        await sendCustomiseInternalNotification({
          id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          requirement: inquiry.requirement,
          budgetRange: inquiry.budgetRange,
          occasion: inquiry.occasion,
          timeline: inquiry.timeline,
          referenceImageUrl: inquiry.referenceImageUrl,
        });
      } catch (emailError) {
        console.error("Failed to send internal notification:", emailError);
        // Continue - inquiry is already saved
      }

      return {
        status: "submitted",
        inquiryId: inquiry.id,
      };
    }),

  // User: List own inquiries (for account page)
  myInquiries: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      return [];
    }

    const inquiries = await ctx.db
      .select()
      .from(customisationInquiries)
      .where(eq(customisationInquiries.userId, ctx.user.id))
      .orderBy(desc(customisationInquiries.createdAt));

    return inquiries;
  }),

  // Admin: List all inquiries
  adminList: protectedProcedure
    .input(
      z.object({
        status: z.enum(["new", "reviewed", "in_discussion", "quoted", "completed", "cancelled"]).optional(),
        offset: z.number().min(0).default(0),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: Add admin role check here
      // if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      const where = input.status ? eq(customisationInquiries.status, input.status) : undefined;

      const inquiries = await ctx.db
        .select()
        .from(customisationInquiries)
        .where(where)
        .orderBy(desc(customisationInquiries.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return inquiries;
    }),

  // Admin: Get single inquiry details
  adminGetById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // TODO: Add admin role check

      const inquiry = await ctx.db.query.customisationInquiries.findFirst({
        where: eq(customisationInquiries.id, input.id),
      });

      if (!inquiry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inquiry not found",
        });
      }

      return inquiry;
    }),

  // Admin: Update inquiry status and notes
  adminUpdateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["new", "reviewed", "in_discussion", "quoted", "completed", "cancelled"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Add admin role check

      await ctx.db
        .update(customisationInquiries)
        .set({
          status: input.status,
          adminNotes: input.adminNotes,
          updatedAt: new Date(),
        })
        .where(eq(customisationInquiries.id, input.id));

      return { success: true };
    }),
});
