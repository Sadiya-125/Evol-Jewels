"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authClient } from "@/lib/auth-client";

type Step = "email" | "otp";

export default function SignInPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailLoading(true);

    try {
      // First, request magic link (this stores the token for combined email)
      await authClient.signIn.magicLink({
        email,
        callbackURL: "/auth-callback",
      });

      // Then, send OTP (this will trigger the combined email with both)
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      setStep("otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send verification email";
      setError(message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOtpLoading(true);

    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      if (result.error) {
        throw new Error(result.error.message || "Verification failed");
      }

      // Check if user is admin and redirect accordingly
      try {
        const adminCheck = await fetch("/api/auth/check-admin");
        const adminData = await adminCheck.json();
        window.location.href = adminData.isAdmin ? "/admin" : "/account";
      } catch {
        window.location.href = "/account";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid code. Please try again.";
      setError(message);
      setOtpLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth-callback",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(message);
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = emailLoading || otpLoading || googleLoading;

  return (
    <div className="min-h-screen bg-evol-light-grey flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logos/Evol Jewels Logo - Black.png"
              alt="Evol Jewels"
              width={120}
              height={48}
              className="h-10 w-auto mx-auto mb-6"
            />
          </Link>
          <h1 className="font-serif text-4xl text-evol-dark-grey mb-2">
            Welcome back.
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-evol-grey p-8">
          {step === "email" ? (
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-3"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isAnyLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-evol-red font-body">{error}</p>
              )}

              <Button type="submit" variant="primary" loading={emailLoading} disabled={isAnyLoading} className="w-full">
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-sm text-evol-metallic hover:text-evol-red transition-colors mb-4"
                  disabled={isAnyLoading}
                >
                  ← Change email
                </button>
                <p className="font-body text-sm text-evol-metallic mb-4">
                  Check your email for a code or click the link we sent to{" "}
                  <span className="text-evol-dark-grey font-medium">{email}</span>.
                </p>
                <label
                  htmlFor="otp"
                  className="block font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-3"
                >
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  required
                  disabled={isAnyLoading}
                  className="text-center tracking-widest text-2xl"
                />
              </div>

              {error && (
                <p className="text-sm text-evol-red font-body">{error}</p>
              )}

              <Button type="submit" variant="primary" loading={otpLoading} disabled={isAnyLoading} className="w-full">
                Verify
              </Button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isAnyLoading}
                className="w-full text-sm text-evol-metallic hover:text-evol-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-evol-grey"></div>
            <span className="font-sans text-xs text-evol-metallic uppercase tracking-wider">
              or continue with
            </span>
            <div className="flex-1 border-t border-evol-grey"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isAnyLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-evol-grey hover:border-evol-dark-grey transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-evol-dark-grey" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-sans text-sm text-evol-dark-grey">
                  Continue with Google
                </span>
              </>
            )}
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-6 font-body text-sm text-evol-metallic">
          New to Evol?{" "}
          <Link href="/shop" className="text-evol-red hover:underline">
            Explore Shop
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
