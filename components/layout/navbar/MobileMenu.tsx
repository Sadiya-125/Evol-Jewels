"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { useNavbar } from "./NavbarContext";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { trpc } from "@/lib/trpc/client";
import {
  diamondShapes,
  RingIcon,
  EarringIcon,
  PendantIcon,
  BraceletIcon,
  NecklaceIcon,
  DiamondIcon,
} from "@/components/icons/shapes";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  rings: RingIcon,
  earrings: EarringIcon,
  pendants: PendantIcon,
  bracelets: BraceletIcon,
  necklaces: NecklaceIcon,
};

export default function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useNavbar();
  const { data: session } = useSession();
  const { isAdmin } = useIsAdmin();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { data: categories } = trpc.categories.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
  });
  const { data: collections } = trpc.collections.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
  });

  const accountLink = session ? (isAdmin ? "/admin" : "/account") : "/sign-in";

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setExpandedSection(null);
  };

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-0 top-0 z-[100] bg-white overflow-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-evol-grey">
            <span className="font-sans text-sm uppercase tracking-widest text-evol-dark-grey">
              Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:text-evol-red transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="py-4">
            {/* Shop Accordion */}
            <div className="border-b border-evol-light-grey">
              <button
                onClick={() => toggleSection("shop")}
                className="w-full flex items-center justify-between px-6 py-4 text-evol-dark-grey"
              >
                <span className="font-sans text-sm uppercase tracking-widest">Shop</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === "shop" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedSection === "shop" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden bg-evol-light-grey"
                  >
                    <div className="px-6 py-4 space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-evol-metallic mb-2">
                          By Category
                        </p>
                        <ul className="space-y-2">
                          {categories?.map((category) => {
                            const IconComponent = categoryIcons[category.slug] || RingIcon;
                            return (
                              <li key={category.id}>
                                <Link
                                  href={`/shop?category=${category.slug}`}
                                  onClick={handleLinkClick}
                                  className="flex items-center gap-2 text-evol-dark-grey text-sm py-1"
                                >
                                  <IconComponent className="w-4 h-4" />
                                  {category.name}
                                </Link>
                              </li>
                            );
                          })}
                          <li>
                            <Link
                              href="/shop"
                              onClick={handleLinkClick}
                              className="flex items-center gap-2 text-evol-dark-grey text-sm py-1"
                            >
                              <DiamondIcon className="w-4 h-4" />
                              View All
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-evol-metallic mb-2">
                          By Collection
                        </p>
                        <ul className="space-y-2">
                          {collections?.slice(0, 4).map((collection) => (
                            <li key={collection.id}>
                              <Link
                                href={`/collections/${collection.slug}`}
                                onClick={handleLinkClick}
                                className="text-evol-dark-grey text-sm py-1 block"
                              >
                                {collection.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solitaire Accordion */}
            <div className="border-b border-evol-light-grey">
              <button
                onClick={() => toggleSection("solitaire")}
                className="w-full flex items-center justify-between px-6 py-4 text-evol-dark-grey"
              >
                <span className="font-sans text-sm uppercase tracking-widest">Solitaire</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === "solitaire" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedSection === "solitaire" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden bg-evol-light-grey"
                  >
                    <div className="px-6 py-4 space-y-2">
                      <Link
                        href="/shop?filter=solitaire&category=rings"
                        onClick={handleLinkClick}
                        className="block text-evol-dark-grey text-sm py-1"
                      >
                        Solitaire Rings
                      </Link>
                      <Link
                        href="/shop?filter=solitaire&category=earrings"
                        onClick={handleLinkClick}
                        className="block text-evol-dark-grey text-sm py-1"
                      >
                        Solitaire Earrings
                      </Link>
                      <Link
                        href="/shop?filter=solitaire"
                        onClick={handleLinkClick}
                        className="block text-evol-dark-grey text-sm py-1"
                      >
                        View All Solitaire
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simple Links */}
            <Link
              href="/shop?filter=ready-to-ship"
              onClick={handleLinkClick}
              className="block px-6 py-4 text-evol-dark-grey font-sans text-sm uppercase tracking-widest border-b border-evol-light-grey"
            >
              Ready To Ship
            </Link>
            <Link
              href="/customise"
              onClick={handleLinkClick}
              className="block px-6 py-4 text-evol-dark-grey font-sans text-sm uppercase tracking-widest border-b border-evol-light-grey"
            >
              Customise
            </Link>
            <Link
              href="/gift"
              onClick={handleLinkClick}
              className="block px-6 py-4 text-evol-dark-grey font-sans text-sm uppercase tracking-widest border-b border-evol-light-grey"
            >
              Gift
            </Link>
            <Link
              href="/try-at-home"
              onClick={handleLinkClick}
              className="block px-6 py-4 text-evol-dark-grey font-sans text-sm uppercase tracking-widest border-b border-evol-light-grey"
            >
              Try At Home
            </Link>
            <Link
              href="/gold-beans"
              onClick={handleLinkClick}
              className="block px-6 py-4 text-evol-dark-grey font-sans text-sm uppercase tracking-widest border-b border-evol-light-grey"
            >
              Gold Beans
            </Link>

            {/* Know Your Diamonds Accordion */}
            <div className="border-b border-evol-light-grey">
              <button
                onClick={() => toggleSection("diamonds")}
                className="w-full flex items-center justify-between px-6 py-4 text-evol-dark-grey"
              >
                <span className="font-sans text-sm uppercase tracking-widest">
                  Know Your Diamonds
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === "diamonds" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedSection === "diamonds" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden bg-evol-light-grey"
                  >
                    <div className="px-6 py-4 space-y-2">
                      <Link
                        href="/journal/lab-grown-diamonds"
                        onClick={handleLinkClick}
                        className="block text-evol-dark-grey text-sm py-1"
                      >
                        Lab Grown Diamonds
                      </Link>
                      <Link
                        href="/journal/4cs-lab-grown-diamonds"
                        onClick={handleLinkClick}
                        className="block text-evol-dark-grey text-sm py-1"
                      >
                        4C's Of Lab Grown Diamonds
                      </Link>
                      <Link
                        href="/journal"
                        onClick={handleLinkClick}
                        className="block text-evol-dark-grey text-sm py-1"
                      >
                        View All Blogs
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/our-story"
              onClick={handleLinkClick}
              className="block px-6 py-4 text-evol-dark-grey font-sans text-sm uppercase tracking-widest border-b border-evol-light-grey"
            >
              Our Story
            </Link>

            {/* Account Link */}
            <Link
              href={accountLink}
              onClick={handleLinkClick}
              className="block px-6 py-4 text-evol-dark-grey font-sans text-sm uppercase tracking-widest border-b border-evol-light-grey"
            >
              {session ? "Account" : "Sign In"}
            </Link>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
