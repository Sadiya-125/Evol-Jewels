import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/?newsletter=error&message=Invalid+unsubscribe+link", request.url)
    );
  }

  try {
    // Find subscriber by unsubscribe token
    const subscriber = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.unsubscribeToken, token),
    });

    if (!subscriber) {
      return NextResponse.redirect(
        new URL("/?newsletter=error&message=Invalid+unsubscribe+link", request.url)
      );
    }

    // Delete subscriber
    await db
      .delete(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, subscriber.id));

    return NextResponse.redirect(
      new URL("/?newsletter=unsubscribed", request.url)
    );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.redirect(
      new URL("/?newsletter=error&message=Something+went+wrong", request.url)
    );
  }
}
