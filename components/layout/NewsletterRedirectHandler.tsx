"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function NewsletterRedirectHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const newsletter = searchParams.get("newsletter");
    const message = searchParams.get("message");

    if (newsletter === "confirmed") {
      toast.success(
        "Your subscription has been confirmed! Welcome to our newsletter.",
      );
    } else if (newsletter === "already-confirmed") {
      toast.info("Your subscription is already confirmed!");
    } else if (newsletter === "unsubscribed") {
      toast.success("You have been unsubscribed from our newsletter.");
    } else if (newsletter === "error" && message) {
      toast.error(decodeURIComponent(message));
    }
  }, [searchParams]);

  return null;
}
