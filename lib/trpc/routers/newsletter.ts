import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { newsletterSubscribers } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { sendNewsletterConfirmationEmail, sendNewsletterWelcomeEmail } from "@/lib/email";

// Simple in-memory rate limiting (3 attempts per hour per email)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(email);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimitMap.set(email, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour from now
    });
    return true;
  }

  if (limit.count >= 3) {
    return false; // Rate limit exceeded
  }

  limit.count += 1;
  return true;
}

export const newsletterRouter = router({
  // Subscribe to newsletter
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check rate limit
      if (!checkRateLimit(input.email)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many subscription attempts. Please try again in an hour.",
        });
      }

      // Check if email already exists
      const existingSubscriber = await ctx.db.query.newsletterSubscribers.findFirst({
        where: eq(newsletterSubscribers.email, input.email),
      });

      if (existingSubscriber) {
        if (existingSubscriber.confirmed) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This email is already subscribed to our newsletter.",
          });
        } else {
          // Resend confirmation email
          await sendNewsletterConfirmationEmail(
            existingSubscriber.email,
            existingSubscriber.confirmationToken
          );

          return {
            success: true,
            message: "Confirmation email resent. Please check your inbox.",
            confirmationToken: existingSubscriber.confirmationToken,
            email: existingSubscriber.email,
          };
        }
      }

      // Create new subscriber
      const [newSubscriber] = await ctx.db
        .insert(newsletterSubscribers)
        .values({
          email: input.email,
        })
        .returning();

      // Send confirmation email
      await sendNewsletterConfirmationEmail(
        newSubscriber.email,
        newSubscriber.confirmationToken
      );

      return {
        success: true,
        message: "Please check your email to confirm your subscription.",
        confirmationToken: newSubscriber.confirmationToken,
        email: newSubscriber.email,
      };
    }),

  // Confirm subscription
  confirm: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscriber = await ctx.db.query.newsletterSubscribers.findFirst({
        where: eq(newsletterSubscribers.confirmationToken, input.token),
      });

      if (!subscriber) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired confirmation link.",
        });
      }

      if (subscriber.confirmed) {
        return {
          success: true,
          message: "Your subscription is already confirmed!",
          alreadyConfirmed: true,
        };
      }

      // Update subscriber to confirmed
      await ctx.db
        .update(newsletterSubscribers)
        .set({
          confirmed: true,
          confirmedAt: new Date(),
        })
        .where(eq(newsletterSubscribers.id, subscriber.id));

      // Send welcome email
      await sendNewsletterWelcomeEmail(
        subscriber.email,
        subscriber.unsubscribeToken
      );

      return {
        success: true,
        message: "Your subscription has been confirmed! Welcome to our newsletter.",
        alreadyConfirmed: false,
      };
    }),

  // Unsubscribe from newsletter
  unsubscribe: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscriber = await ctx.db.query.newsletterSubscribers.findFirst({
        where: eq(newsletterSubscribers.unsubscribeToken, input.token),
      });

      if (!subscriber) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid unsubscribe link.",
        });
      }

      // Delete subscriber
      await ctx.db
        .delete(newsletterSubscribers)
        .where(eq(newsletterSubscribers.id, subscriber.id));

      return {
        success: true,
        message: "You have been successfully unsubscribed from our newsletter.",
      };
    }),
});
