import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

// MailerSend Configuration
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

// Sender configuration - using MailerSend verified domain
const sentFrom = new Sender(
  "noreply@test-51ndgwvm2j5lzqx8.mlsender.net",
  "Evol Jewels"
);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<void> {
  try {
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html)
      .setText(text);

    const response = await mailerSend.email.send(emailParams);
    console.log("Email Sent Successfully via MailerSend:", response);
  } catch (error) {
    console.error("Failed to Send Email via MailerSend:", error);
    throw error;
  }
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
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; letter-spacing: 4px; color: ${colors.evolRed};">EVOL</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 16px;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 400; color: ${colors.evolDarkGrey};">Sign In to EVOL</h1>
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
