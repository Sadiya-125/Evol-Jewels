"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Rings", href: "/shop?category=rings" },
    { label: "Necklaces", href: "/shop?category=necklaces" },
    { label: "Earrings", href: "/shop?category=earrings" },
    { label: "Bracelets", href: "/shop?category=bracelets" },
  ],
  about: [
    { label: "Our Story", href: "/our-story" },
    { label: "Store Locator", href: "/stores" },
    { label: "Care Guide", href: "/care" },
    { label: "Customisation", href: "/customisation" },
  ],
  connect: [
    { label: "sadiya.siddiqui@evoljewels.com", href: "mailto:sadiya.siddiqui@evoljewels.com" },
    { label: "Banjara Hills, Hyderabad", href: "/stores" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/evoljewels", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/evoljewels", label: "Facebook" },
  { icon: Mail, href: "mailto:sadiya.siddiqui@evoljewels.com", label: "Email" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const newsletterMutation = trpc.newsletter.subscribe.useMutation();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email");
      setNewsletterState("error");
      return;
    }

    setNewsletterState("loading");
    setErrorMessage("");

    try {
      await newsletterMutation.mutateAsync({ email });
      setNewsletterState("success");
      setEmail("");
    } catch (error: any) {
      setNewsletterState("error");
      setErrorMessage(error.message || "Something went wrong");
    }
  };

  return (
    <footer className="bg-evol-light-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-20">
            <Link href="/">
              <Image
                src="/logos/Evol Jewels Logo - Black.png"
                alt="Evol Jewels"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p className="font-script text-lg text-evol-dark-grey">
              Love begins with you.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey font-medium mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-evol-metallic hover:text-evol-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey font-medium mb-4">
              About
            </h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-evol-metallic hover:text-evol-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey font-medium mb-4">
              Newsletter
            </h3>
            {newsletterState === "success" ? (
              <div className="bg-white border border-evol-grey p-4">
                <p className="font-sans text-sm text-evol-dark-grey mb-2">Check Your Email</p>
                <p className="font-body text-xs text-evol-metallic">
                  Please click the confirmation link we sent you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setNewsletterState("idle");
                    setErrorMessage("");
                  }}
                  placeholder="Your Email"
                  className="text-sm"
                  disabled={newsletterState === "loading"}
                />
                <Button
                  variant="secondary"
                  type="submit"
                  className="w-full text-xs"
                  disabled={newsletterState === "loading"}
                  loading={newsletterState === "loading"}
                >
                  Subscribe
                </Button>
                {newsletterState === "error" && errorMessage && (
                  <p className="font-body text-xs text-evol-red">{errorMessage}</p>
                )}
                <p className="font-body text-xs text-evol-metallic">
                  Unsubscribe Anytime
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-evol-grey">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-sans text-xs text-evol-metallic">
              © {new Date().getFullYear()} Evol Jewels. All Rights Reserved.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-evol-metallic hover:text-evol-red transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
