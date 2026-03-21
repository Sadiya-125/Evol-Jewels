"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useNavbar } from "./NavbarContext";
import {
  solitaireShapes,
  RingIcon,
  EarringIcon,
  PendantIcon,
  BraceletIcon,
  NecklaceIcon,
  DiamondIcon,
} from "@/components/icons/shapes";

const solitaireCategories = [
  { label: "Solitaire Rings", slug: "rings", Icon: RingIcon },
  { label: "Solitaire Earrings", slug: "earrings", Icon: EarringIcon },
  { label: "Solitaire Pendants", slug: "pendants", Icon: PendantIcon },
  { label: "Solitaire Bracelets", slug: "bracelets", Icon: BraceletIcon },
  { label: "Solitaire Necklaces", slug: "necklaces", Icon: NecklaceIcon },
];

const genders = [
  { label: "For Her", value: "her" },
  { label: "For Him", value: "him" },
];

export default function SolitaireMegaMenu() {
  const { activeMenu, setActiveMenu, scheduleClose, cancelClose } = useNavbar();

  if (activeMenu !== "solitaire") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-full left-0 right-0 bg-white border-t border-evol-grey shadow-[0_8px_24px_rgba(0,0,0,0.06)] z-50"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <div className="max-w-[1400px] mx-auto px-20 py-10">
        <div className="grid grid-cols-3 gap-16">
          {/* Column 1 - By Category */}
          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
              By Category
            </h3>
            <ul className="space-y-3">
              {solitaireCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/shop?category=${category.slug}&filter=solitaire`}
                    onClick={() => setActiveMenu(null)}
                    className="flex items-center gap-2 text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
                  >
                    <category.Icon className="w-4 h-4" />
                    {category.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/shop?filter=solitaire"
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center gap-2 text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
                >
                  <DiamondIcon className="w-4 h-4" />
                  View All
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - By Gender */}
          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
              By Gender
            </h3>
            <ul className="space-y-3">
              {genders.map((gender) => (
                <li key={gender.value}>
                  <Link
                    href={`/shop?filter=solitaire&gender=${gender.value}`}
                    onClick={() => setActiveMenu(null)}
                    className="text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
                  >
                    {gender.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - By Shape */}
          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
              By Shape
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {solitaireShapes.map((shape) => (
                <Link
                  key={shape.slug}
                  href={`/shop?filter=solitaire&shape=${shape.slug}`}
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center gap-2 text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
                >
                  <shape.Icon className="w-4 h-4" />
                  {shape.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
