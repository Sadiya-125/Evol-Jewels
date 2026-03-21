"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlistStore } from "@/lib/stores/wishlist";
import VariantSelector from "./VariantSelector";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: string;
    images: string[] | null;
    isFeatured: boolean;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variant?: {
    goldKarat?: string;
    goldColor?: string;
  };
  index?: number;
}

export default function ProductCard({ product, category, variant, index = 0 }: ProductCardProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const [showVariantSelector, setShowVariantSelector] = useState(false);

  // Use product.id as variant ID for now (since we don't have full variant objects in listing)
  const variantId = product.id;
  const inWishlist = isInWishlist(variantId);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleItem({
      productId: product.id,
      productVariantId: variantId,
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      price: parseFloat(product.basePrice),
      variantLabel: variant?.goldKarat && variant?.goldColor
        ? `${variant.goldKarat} ${variant.goldColor} Gold`
        : undefined,
    });
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVariantSelector(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative bg-white border border-evol-grey hover:border-evol-dark-grey transition-all duration-300"
      >
        <Link href={`/shop/${product.id}`} className="block">
          {/* Image Area */}
          <div className="relative aspect-[4/5] bg-evol-light-grey overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-6 transition-transform duration-400 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-evol-grey text-sm">
                No image
              </div>
            )}

            {/* Floating Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <button
                onClick={handleWishlistClick}
                className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                  inWishlist
                    ? 'bg-evol-red text-white'
                    : 'bg-white/90 hover:bg-white text-evol-dark-grey'
                }`}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`}
                  strokeWidth={inWishlist ? 0 : 2}
                />
              </button>
            </div>

            {/* Add to Cart Button (appears on hover) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleAddToCartClick}
                className="w-full bg-evol-red text-white py-3 px-4 font-sans text-sm uppercase tracking-wider hover:bg-evol-dark-grey transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-2">
            <h3 className="font-serif text-base font-bold text-evol-dark-grey line-clamp-2 group-hover:text-evol-red transition-colors">
              {product.name}
            </h3>

            {category && (
              <p className="font-sans text-[11px] uppercase tracking-wide text-evol-metallic">
                {category.name}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="font-sans text-[15px] font-bold text-evol-dark-grey">
                From ₹{parseFloat(product.basePrice).toLocaleString('en-IN')}
              </p>
            </div>

            {variant && (
              <p className="font-sans text-[11px] text-evol-metallic">
                {variant.goldKarat} {variant.goldColor} Gold
              </p>
            )}
          </div>
        </Link>
      </motion.div>

      {/* Variant Selector */}
      <VariantSelector
        isOpen={showVariantSelector}
        onClose={() => setShowVariantSelector(false)}
        productId={product.id}
        productName={product.name}
        productImage={product.images && product.images.length > 0 ? product.images[0] : null}
      />
    </>
  );
}
