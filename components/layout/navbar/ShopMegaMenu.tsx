"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useNavbar } from "./NavbarContext";
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

const occasions = [
  { label: "Dailywear", value: "dailywear" },
  { label: "Engagement", value: "engagement" },
  { label: "Fancy", value: "fancy" },
];

const genders = [
  { label: "For Her", value: "her" },
  { label: "For Him", value: "him" },
];

export default function ShopMegaMenu() {
  const { activeMenu, setActiveMenu, scheduleClose, cancelClose } = useNavbar();
  const { data: categories } = trpc.categories.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
  });
  const { data: collections } = trpc.collections.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
  });

  if (activeMenu !== "shop") return null;

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
        <div className="grid grid-cols-5 gap-8">
          {/* Column 1 - By Category */}
          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
              By Category
            </h3>
            <ul className="space-y-3">
              {categories?.map((category) => {
                const IconComponent = categoryIcons[category.slug] || RingIcon;
                return (
                  <li key={category.id}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-2 text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
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
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center gap-2 text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
                >
                  <DiamondIcon className="w-4 h-4" />
                  View All
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - By Occasion */}
          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
              By Occasion
            </h3>
            <ul className="space-y-3">
              {occasions.map((occasion) => (
                <li key={occasion.value}>
                  <Link
                    href={`/shop?occasion=${occasion.value}`}
                    onClick={() => setActiveMenu(null)}
                    className="text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
                  >
                    {occasion.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - By Gender */}
          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
              By Gender
            </h3>
            <ul className="space-y-3">
              {genders.map((gender) => (
                <li key={gender.value}>
                  <Link
                    href={`/shop?gender=${gender.value}`}
                    onClick={() => setActiveMenu(null)}
                    className="text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
                  >
                    {gender.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - By Collection */}
          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
              By Collection
            </h3>
            <ul className="space-y-3">
              {collections?.slice(0, 4).map((collection) => (
                <li key={collection.id}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    onClick={() => setActiveMenu(null)}
                    className="text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/collections"
                  onClick={() => setActiveMenu(null)}
                  className="text-evol-metallic hover:text-evol-dark-grey transition-colors text-sm inline-flex items-center gap-1"
                >
                  View All Collections
                  <span className="text-xs">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 - By Shape */}
          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-evol-metallic mb-4">
              By Shape
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {diamondShapes.map((shape) => (
                <Link
                  key={shape.slug}
                  href={`/shop?shape=${shape.slug}`}
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
