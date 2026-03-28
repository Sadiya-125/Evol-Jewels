import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, magicLink } from "better-auth/plugins";
import { db } from "@/lib/db";
import { sendEmail, generateCombinedAuthEmail } from "@/lib/email";
import * as schema from "@/db/schema";

// Store pending magic link tokens to combine with OTP emails
const pendingMagicLinks = new Map<string, { token: string; url: string }>();

// Normalize URL - remove trailing slash
const normalizeUrl = (url: string | undefined) => url?.replace(/\/$/, "");

const baseURL = normalizeUrl(process.env.BETTER_AUTH_URL) ||
                normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ||
                "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    "https://evol-jewels.vercel.app",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  session: {
    expiresIn: 60 * 60 * 12, // 12 hours (access token)
    updateAge: 60 * 60 * 24, // 24 hours (refresh token rotation)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  emailAndPassword: {
    enabled: false, // Passwordless only
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60, // 10 minutes
      allowedAttempts: 5,
      storeOTP: "hashed",
      disableSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        // Only handle sign-in type for combined email
        if (type === "sign-in") {
          // Check if we have a pending magic link for this email
          const pendingLink = pendingMagicLinks.get(email);

          if (pendingLink) {
            // Send combined email with both OTP and magic link
            const { html, text } = generateCombinedAuthEmail({
              otpCode: otp,
              magicLink: pendingLink.url,
              email,
            });

            // Clear pending magic link
            pendingMagicLinks.delete(email);

            // Await email sending so client knows when it completes
            await sendEmail({
              to: email,
              subject: "Sign In to Evol Jewels",
              html,
              text,
            });
          } else {
            // No magic link yet, store OTP and wait for magic link
            // This shouldn't happen if we call magic link first
            const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
            const { html, text } = generateCombinedAuthEmail({
              otpCode: otp,
              magicLink: `${baseUrl}/sign-in`, // Fallback
              email,
            });

            // Await email sending so client knows when it completes
            await sendEmail({
              to: email,
              subject: "Sign In to Evol Jewels",
              html,
              text,
            });
          }
        }
        // email-verification and forget-password types are not used in this app
      },
    }),
    magicLink({
      expiresIn: 10 * 60, // 10 minutes
      allowedAttempts: 5,
      storeToken: "hashed",
      disableSignUp: false,
      async sendMagicLink({ email, token, url }) {
        // Store the magic link for combination with OTP
        pendingMagicLinks.set(email, { token, url });

        // The actual email will be sent when OTP is generated
        // Set a timeout to clear if OTP never comes
        setTimeout(() => {
          pendingMagicLinks.delete(email);
        }, 5000);
      },
    }),
  ],
});

// Export session type for client
export type Session = typeof auth.$Infer.Session;
