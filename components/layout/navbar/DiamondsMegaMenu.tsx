"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useNavbar } from "./NavbarContext";

const blogLinks = [
  { label: "Find Your Hand's Perfect Diamond Shape", href: "/journal/diamond-shape-guide" },
  { label: "Lab Grown Diamonds", href: "/journal/lab-grown-diamonds" },
  { label: "4C's Of Lab Grown Diamonds", href: "/journal/4cs-lab-grown-diamonds" },
  { label: "Caring For Your Diamond Jewellery", href: "/journal/caring-for-diamond-jewellery" },
  { label: "World Of Lab Grown Diamond", href: "/journal/world-of-lab-grown-diamond" },
  { label: "Celebrity Style Redefined", href: "/journal/celebrity-style" },
  { label: "Effortless Ear Stacks", href: "/journal/ear-stacks" },
];

export default function DiamondsMegaMenu() {
  const { activeMenu, setActiveMenu, scheduleClose, cancelClose } = useNavbar();

  if (activeMenu !== "diamonds") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 bg-white border border-evol-grey shadow-[0_8px_24px_rgba(0,0,0,0.06)] z-50 min-w-[320px]"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <div className="px-8 py-6">
        <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
          Blogs
        </h3>
        <ul className="space-y-3">
          {blogLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setActiveMenu(null)}
                className="text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm block"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2 border-t border-evol-light-grey mt-4">
            <Link
              href="/journal"
              onClick={() => setActiveMenu(null)}
              className="text-evol-metallic hover:text-evol-dark-grey hover:underline transition-colors text-sm"
            >
              View All Blogs
            </Link>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
