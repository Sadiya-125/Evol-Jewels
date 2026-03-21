import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/?newsletter=error&message=Invalid+confirmation+link", request.url)
    );
  }

  try {
    // Find subscriber by confirmation token
    const subscriber = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.confirmationToken, token),
    });

    if (!subscriber) {
      return NextResponse.redirect(
        new URL("/?newsletter=error&message=Invalid+or+expired+confirmation+link", request.url)
      );
    }

    if (subscriber.confirmed) {
      // Already confirmed
      return NextResponse.redirect(
        new URL("/?newsletter=already-confirmed", request.url)
      );
    }

    // Update subscriber to confirmed
    await db
      .update(newsletterSubscribers)
      .set({
        confirmed: true,
        confirmedAt: new Date(),
      })
      .where(eq(newsletterSubscribers.id, subscriber.id));

    // Send welcome email
    await sendNewsletterWelcomeEmail(subscriber.email, subscriber.unsubscribeToken);

    return NextResponse.redirect(
      new URL("/?newsletter=confirmed", request.url)
    );
  } catch (error) {
    console.error("Newsletter confirmation error:", error);
    return NextResponse.redirect(
      new URL("/?newsletter=error&message=Something+went+wrong", request.url)
    );
  }
}
