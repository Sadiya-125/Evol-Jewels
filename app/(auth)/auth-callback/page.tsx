"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const checkAdminAndRedirect = async () => {
      // Small delay to ensure session cookie is available after OAuth redirect
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Retry logic for session availability
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const response = await fetch("/api/auth/check-admin", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          if (!response.ok) {
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              continue;
            }
            throw new Error("Failed to check admin status");
          }

          const data = await response.json();

          if (data.isAdmin) {
            window.location.href = "/admin";
          } else {
            window.location.href = "/account";
          }
          return;
        } catch {
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }

      // If all attempts fail, redirect to account as fallback
      setStatus("error");
      setTimeout(() => {
        window.location.href = "/account";
      }, 1500);
    };

    checkAdminAndRedirect();
  }, []);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-evol-light-grey flex flex-col items-center justify-center px-4">
        <Link href="/">
          <Image
            src="/logos/Evol Jewels Logo - Black.png"
            alt="Evol Jewels"
            width={120}
            height={48}
            className="h-10 w-auto mb-8"
          />
        </Link>
        <p className="font-body text-evol-metallic">
          Redirecting to your account...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evol-light-grey flex flex-col items-center justify-center px-4">
      <Link href="/">
        <Image
          src="/logos/Evol Jewels Logo - Black.png"
          alt="Evol Jewels"
          width={120}
          height={48}
          className="h-10 w-auto mb-8"
        />
      </Link>
      <div className="animate-pulse text-evol-metallic font-sans text-sm uppercase tracking-widest">
        Signing you in...
      </div>
    </div>
  );
}
