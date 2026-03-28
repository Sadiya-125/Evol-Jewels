import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

// MailerSend Configuration
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

// Sender configuration - using MailerSend verified domain
const sentFrom = new Sender(
  "noreply@test-z0vklo6v9ppl7qrx.mlsender.net",
  "Evol Jewels",
);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Helper function to wait for a given duration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<void> {
  const recipients = [new Recipient(to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setHtml(html)
    .setText(text);

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await mailerSend.email.send(emailParams);
      console.log(`Email Sent Successfully via MailerSend (attempt ${attempt}):`, response);
      return; // Success - exit the function
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorCode = (error as { code?: string })?.code;

      // Check if this is a retryable error (network issues like ECONNRESET, ETIMEDOUT, etc.)
      const isRetryable =
        errorCode === "ECONNRESET" ||
        errorCode === "ETIMEDOUT" ||
        errorCode === "ENOTFOUND" ||
        errorCode === "ECONNREFUSED" ||
        errorCode === "EAI_AGAIN" ||
        lastError.message?.includes("socket hang up") ||
        lastError.message?.includes("network");

      if (isRetryable && attempt < MAX_RETRIES) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(
          `MailerSend attempt ${attempt} failed with ${errorCode || lastError.message}. Retrying in ${retryDelay}ms...`
        );
        await delay(retryDelay);
        continue;
      }

      // Non-retryable error or max retries reached
      console.error(`Failed to Send Email via MailerSend after ${attempt} attempt(s):`, error);
      throw error;
    }
  }

  // Should not reach here, but just in case
  throw lastError || new Error("Failed to send email after all retries");
}

// Brand colors
const colors = {
  evolRed: "#9F0B10",
  evolDarkGrey: "#2D2D2D",
  evolMetallic: "#6B6B6B",
  evolLightGrey: "#EEEEEE",
  evolGrey: "#D4D4D4",
  white: "#FFFFFF",
};

interface CombinedAuthEmailParams {
  otpCode: string;
  magicLink: string;
  email: string;
}

export function generateCombinedAuthEmail({
  otpCode,
  magicLink,
  email,
}: CombinedAuthEmailParams): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Evol</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.evolLightGrey}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.evolLightGrey};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto;">
          <!-- Main Card -->
          <tr>
            <td style="background-color: ${colors.white}; border: 1px solid ${colors.evolGrey}; padding: 48px 40px;">
              <!-- Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; letter-spacing: 4px; color: ${colors.evolRed};">Evol</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 16px;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 400; color: ${colors.evolDarkGrey};">Sign In to Evol</h1>
                  </td>
                </tr>
              </table>

              <!-- Body Text -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${colors.evolMetallic};">You Requested to Sign In. Use Either Option Below:</p>
                  </td>
                </tr>
              </table>

              <!-- OTP Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 8px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: ${colors.evolMetallic};">Enter this Code</span>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <div style="display: inline-block; background-color: ${colors.evolLightGrey}; border-radius: 8px; padding: 16px 32px;">
                      <span style="font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 32px; letter-spacing: 8px; color: ${colors.evolDarkGrey}; font-weight: 500;">${otpCode}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 0 32px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="border-bottom: 1px solid ${colors.evolGrey}; line-height: 1px; font-size: 1px;">&nbsp;</td>
                        <td style="width: 60px; text-align: center; padding: 0 12px;">
                          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: ${colors.evolMetallic};">or</span>
                        </td>
                        <td style="border-bottom: 1px solid ${colors.evolGrey}; line-height: 1px; font-size: 1px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Magic Link Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <a href="${magicLink}" style="display: inline-block; background-color: ${colors.evolRed}; color: ${colors.white}; text-decoration: none; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; padding: 16px 32px; border-radius: 0;">
                      Sign in Instantly &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-top: 16px; border-top: 1px solid ${colors.evolGrey};">
                    <p style="margin: 0; font-size: 12px; color: ${colors.evolMetallic}; line-height: 1.6;">
                      This Link and Code Expire in 10 Minutes.<br>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: ${colors.evolMetallic};">
                Evol Jewels, Banjara Hills, Hyderabad
              </p>
              <p style="margin: 0; font-size: 11px; color: ${colors.evolMetallic};">
                noreply@evoljewels.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Sign In to Evol

You Requested to Sign In. Use Either Option Below:

Your Verification Code: ${otpCode}

Or Click this Link to Sign In Instantly:
${magicLink}

This Link and Code Expire in 10 Minutes.

---
Evol Jewels, Banjara Hills, Hyderabad
noreply@evoljewels.com
  `.trim();

  return { html, text };
}

// Newsletter Email Templates

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Send newsletter confirmation email
 */
export async function sendNewsletterConfirmationEmail(
  email: string,
  confirmationToken: string,
): Promise<{ success: boolean; error?: string }> {
  const confirmationLink = `${SITE_URL}/api/newsletter/confirm?token=${confirmationToken}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Subscription</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.evolLightGrey}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="background-color: ${colors.white}; border: 1px solid ${colors.evolGrey}; padding: 48px 40px;">
              <!-- Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; letter-spacing: 4px; color: ${colors.evolRed};">Evol JEWELS</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 24px;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; color: ${colors.evolDarkGrey};">Confirm Your Subscription</h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${colors.evolMetallic};">
                      Thank you for subscribing to the Evol Jewels newsletter. We're delighted to have you join our community.
                    </p>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: ${colors.evolMetallic};">
                      Please confirm your email address by clicking the button below:
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 24px 0;">
                    <a href="${confirmationLink}" style="display: inline-block; background-color: ${colors.evolRed}; color: ${colors.white}; text-decoration: none; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; padding: 16px 40px;">
                      Confirm Subscription
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer Note -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-top: 24px; border-top: 1px solid ${colors.evolGrey};">
                    <p style="margin: 0; font-size: 14px; color: ${colors.evolMetallic}; line-height: 1.6;">
                      If you didn't request this subscription, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: ${colors.evolMetallic};">
                © ${new Date().getFullYear()} Evol Jewels. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Confirm Your Subscription

Thank you for subscribing to the Evol Jewels newsletter. We're delighted to have you join our community.

Please confirm your email address by clicking the link below:
${confirmationLink}

If you didn't request this subscription, you can safely ignore this email.

© ${new Date().getFullYear()} Evol Jewels. All rights reserved.
  `.trim();

  try {
    await sendEmail({
      to: email,
      subject: "Confirm Your Subscription - Evol Jewels",
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Send welcome email after confirmation
 */
export async function sendNewsletterWelcomeEmail(
  email: string,
  unsubscribeToken: string,
): Promise<{ success: boolean; error?: string }> {
  const unsubscribeLink = `${SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Evol Jewels</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.evolLightGrey}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="background-color: ${colors.white}; border: 1px solid ${colors.evolGrey}; padding: 48px 40px;">
              <!-- Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; letter-spacing: 4px; color: ${colors.evolRed};">Evol JEWELS</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 24px;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; color: ${colors.evolDarkGrey};">Welcome to Our Community</h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${colors.evolMetallic};">
                      Thank you for confirming your subscription. You're now part of the Evol Jewels family.
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${colors.evolMetallic};">
                      We'll be sharing thoughtful stories, new collections, and pieces designed to express who you are, and who you're growing into.
                    </p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-style: italic; color: ${colors.evolDarkGrey}; text-align: center;">
                      Love begins with you
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 24px 0;">
                    <a href="${SITE_URL}/shop" style="display: inline-block; background-color: ${colors.evolRed}; color: ${colors.white}; text-decoration: none; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; padding: 16px 40px;">
                      Explore Collections
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: ${colors.evolMetallic};">
                © ${new Date().getFullYear()} Evol Jewels. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px;">
                <a href="${unsubscribeLink}" style="color: ${colors.evolMetallic}; text-decoration: underline;">
                  Unsubscribe from newsletter
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Welcome to Our Community

Thank you for confirming your subscription. You're now part of the Evol Jewels family.

We'll be sharing thoughtful stories, new collections, and pieces designed to express who you are, and who you're growing into.

Love begins with you

Explore Collections: ${SITE_URL}/shop

© ${new Date().getFullYear()} Evol Jewels. All rights reserved.
Unsubscribe: ${unsubscribeLink}
  `.trim();

  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Evol Jewels",
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Customisation Email Templates

/**
 * Send acknowledgement email to customer after customisation inquiry
 */
export async function sendCustomiseAcknowledgementEmail(
  email: string,
  name: string,
  inquiryId: string,
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customisation Inquiry Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.evolLightGrey}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="background-color: ${colors.white}; border: 1px solid ${colors.evolGrey}; padding: 48px 40px;">
              <!-- Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; letter-spacing: 4px; color: ${colors.evolRed};">Evol JEWELS</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 24px;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; color: ${colors.evolDarkGrey};">Thank You, ${name}</h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${colors.evolMetallic};">
                      We've received your bespoke inquiry and are genuinely excited to bring your vision to life.
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${colors.evolMetallic};">
                      Our design team will carefully review your requirements and reach out within 48 hours to discuss the next steps.
                    </p>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: ${colors.evolMetallic};">
                      Your inquiry reference number is: <strong>${inquiryId}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Quote -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 24px 0; border-top: 1px solid ${colors.evolGrey}; border-bottom: 1px solid ${colors.evolGrey};">
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-style: italic; color: ${colors.evolDarkGrey}; text-align: center; line-height: 1.6;">
                      "Every bespoke piece begins with a conversation,<br>a moment to understand what truly matters."
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer Note -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-top: 24px;">
                    <p style="margin: 0; font-size: 14px; color: ${colors.evolMetallic}; line-height: 1.6;">
                      Meanwhile, feel free to explore our existing collections for inspiration.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 24px 0;">
                    <a href="${SITE_URL}/shop" style="display: inline-block; background-color: ${colors.evolRed}; color: ${colors.white}; text-decoration: none; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; padding: 16px 40px;">
                      Browse Collections
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: ${colors.evolMetallic};">
                © ${new Date().getFullYear()} Evol Jewels. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Thank You, ${name}

We've received your bespoke inquiry and are genuinely excited to bring your vision to life.

Our design team will carefully review your requirements and reach out within 48 hours to discuss the next steps.

Your inquiry reference number is: ${inquiryId}

"Every bespoke piece begins with a conversation, a moment to understand what truly matters."

Meanwhile, feel free to explore our existing collections for inspiration.

Browse Collections: ${SITE_URL}/shop

© ${new Date().getFullYear()} Evol Jewels. All rights reserved.
  `.trim();

  await sendEmail({
    to: email,
    subject: "Your Bespoke Inquiry - Evol Jewels",
    html,
    text,
  });
}

/**
 * Send internal notification to team about new customisation inquiry
 */
export async function sendCustomiseInternalNotification(inquiry: {
  id: string;
  name: string;
  email: string;
  phone: string;
  requirement: string;
  budgetRange: string | null;
  occasion: string | null;
  timeline: string | null;
  referenceImageUrl: string | null;
}): Promise<void> {
  const budgetLabels: Record<string, string> = {
    under_50k: "Under ₹50,000",
    "50k_1l": "₹50,000 - ₹1,00,000",
    "1l_3l": "₹1,00,000 - ₹3,00,000",
    "3l_5l": "₹3,00,000 - ₹5,00,000",
    above_5l: "Above ₹5,00,000",
  };

  const occasionLabels: Record<string, string> = {
    engagement: "Engagement",
    wedding: "Wedding",
    anniversary: "Anniversary",
    birthday: "Birthday",
    self: "Self",
    gift: "Gift",
    other: "Other",
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Customisation Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.evolLightGrey}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 700px; margin: 0 auto;">
          <tr>
            <td style="background-color: ${colors.white}; border: 1px solid ${colors.evolGrey}; padding: 48px 40px;">
              <!-- Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; letter-spacing: 4px; color: ${colors.evolRed};">Evol JEWELS</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 400; color: ${colors.evolDarkGrey};">New Customisation Inquiry</h1>
                  </td>
                </tr>
              </table>

              <!-- Inquiry Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid ${colors.evolGrey};">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Inquiry ID</strong><br>
                          <span style="color: ${colors.evolMetallic}; font-size: 15px; font-family: monospace;">${inquiry.id}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid ${colors.evolGrey};">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Customer Name</strong><br>
                          <span style="color: ${colors.evolMetallic}; font-size: 15px;">${inquiry.name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid ${colors.evolGrey};">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Email</strong><br>
                          <a href="mailto:${inquiry.email}" style="color: ${colors.evolRed}; font-size: 15px; text-decoration: none;">${inquiry.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid ${colors.evolGrey};">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Phone</strong><br>
                          <a href="tel:+91${inquiry.phone}" style="color: ${colors.evolRed}; font-size: 15px; text-decoration: none;">+91 ${inquiry.phone}</a>
                        </td>
                      </tr>
                      ${
                        inquiry.budgetRange
                          ? `
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid ${colors.evolGrey};">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Budget Range</strong><br>
                          <span style="color: ${colors.evolMetallic}; font-size: 15px;">${budgetLabels[inquiry.budgetRange] || inquiry.budgetRange}</span>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        inquiry.occasion
                          ? `
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid ${colors.evolGrey};">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Occasion</strong><br>
                          <span style="color: ${colors.evolMetallic}; font-size: 15px;">${occasionLabels[inquiry.occasion] || inquiry.occasion}</span>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        inquiry.timeline
                          ? `
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid ${colors.evolGrey};">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Timeline</strong><br>
                          <span style="color: ${colors.evolMetallic}; font-size: 15px;">${inquiry.timeline}</span>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Requirement</strong><br>
                          <div style="margin-top: 8px; padding: 16px; background-color: ${colors.evolLightGrey}; border-left: 3px solid ${colors.evolRed};">
                            <p style="margin: 0; color: ${colors.evolDarkGrey}; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${inquiry.requirement}</p>
                          </div>
                        </td>
                      </tr>
                      ${
                        inquiry.referenceImageUrl
                          ? `
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: ${colors.evolDarkGrey}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Reference Image</strong><br>
                          <a href="${inquiry.referenceImageUrl}" style="display: inline-block; margin-top: 8px; color: ${colors.evolRed}; font-size: 14px; text-decoration: none;">View Image →</a>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 24px 0; border-top: 1px solid ${colors.evolGrey};">
                    <a href="${SITE_URL}/admin/customise/${inquiry.id}" style="display: inline-block; background-color: ${colors.evolRed}; color: ${colors.white}; text-decoration: none; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; padding: 16px 40px;">
                      View in Admin Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: ${colors.evolMetallic};">
                © ${new Date().getFullYear()} Evol Jewels. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
New Customisation Inquiry

Inquiry ID: ${inquiry.id}
Customer Name: ${inquiry.name}
Email: ${inquiry.email}
Phone: +91 ${inquiry.phone}
${inquiry.budgetRange ? `Budget Range: ${budgetLabels[inquiry.budgetRange] || inquiry.budgetRange}` : ""}
${inquiry.occasion ? `Occasion: ${occasionLabels[inquiry.occasion] || inquiry.occasion}` : ""}
${inquiry.timeline ? `Timeline: ${inquiry.timeline}` : ""}

Requirement:
${inquiry.requirement}

${inquiry.referenceImageUrl ? `Reference Image: ${inquiry.referenceImageUrl}` : ""}

View in Admin Dashboard: ${SITE_URL}/admin/customise/${inquiry.id}

© ${new Date().getFullYear()} Evol Jewels. All rights reserved.
  `.trim();

  await sendEmail({
    to: "hello@evoljewels.com",
    subject: `New Bespoke Inquiry from ${inquiry.name}`,
    html,
    text,
  });
}
