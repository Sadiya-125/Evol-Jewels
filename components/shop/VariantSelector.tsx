"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useCartStore } from "@/lib/stores/cart";
import { useFlyToCart } from "@/components/animations/FlyToCartProvider";
import Button from "@/components/ui/Button";

interface VariantSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage: string | null;
}

export default function VariantSelector({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
}: VariantSelectorProps) {
  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: isOpen && !!productId },
  );

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const { addItem, openDrawer } = useCartStore();
  const { startAnimation } = useFlyToCart();
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Set initial variant when product loads
  useEffect(() => {
    if (product && product.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  const handleAddToCart = () => {
    if (!product || !selectedVariantId) return;

    const selectedVariant = product.variants.find(
      (v) => v.id === selectedVariantId,
    );
    if (!selectedVariant) return;

    // Trigger fly-to-cart animation
    const cartIcon = document.querySelector("[data-cart-icon]") as HTMLElement;
    const productImg = product.images[0];
    if (addButtonRef.current && cartIcon && productImg) {
      startAnimation(productImg, addButtonRef.current, cartIcon);
    }

    addItem({
      productId: product.id,
      productVariantId: selectedVariant.id,
      name: product.name,
      image: product.images[0] || null,
      variantLabel: `${selectedVariant.goldKarat} ${selectedVariant.goldColor} Gold`,
      price: selectedVariant.price,
      isCustomizable: selectedVariant.isCustomizable,
    });

    onClose();

    // Delay opening drawer to let animation play
    setTimeout(() => {
      openDrawer();
    }, 900);
  };

  if (!isOpen) return null;

  const selectedVariant = product?.variants.find(
    (v) => v.id === selectedVariantId,
  );

  // Group variants by gold karat and color
  const goldKarats = product
    ? Array.from(new Set(product.variants.map((v) => v.goldKarat)))
    : [];
  const goldColors = product
    ? Array.from(new Set(product.variants.map((v) => v.goldColor)))
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Slide-in Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-120 bg-white z-50 overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-evol-grey px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-sans text-sm uppercase tracking-wider text-evol-dark-grey">
                Select Variant
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-evol-light-grey rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="p-6 text-center">
                <p className="text-evol-metallic">Loading Variants...</p>
              </div>
            ) : product ? (
              <div className="p-6 space-y-6">
                {/* Product Info */}
                <div className="flex gap-4">
                  {productImage && (
                    <div className="relative w-24 h-24 bg-evol-light-grey shrink-0">
                      <Image
                        src={productImage}
                        alt={productName}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/shop/${productId}`}
                      onClick={onClose}
                      className="font-serif text-lg text-evol-dark-grey hover:text-evol-red transition-colors"
                    >
                      {productName}
                    </Link>
                    <p className="font-sans text-sm text-evol-metallic mt-1">
                      {product.variants.length} variant
                      {product.variants.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>

                {/* Price */}
                {selectedVariant && (
                  <div className="bg-evol-light-grey p-4">
                    <p className="font-sans text-2xl font-bold text-evol-dark-grey">
                      ₹{selectedVariant.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                )}

                {/* Gold Karat Selector */}
                {goldKarats.length > 1 && (
                  <div>
                    <label className="block font-sans text-xs uppercase tracking-wider text-evol-dark-grey mb-3">
                      Gold Karat
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {goldKarats.map((karat) => {
                        const variant = product.variants.find(
                          (v) => v.goldKarat === karat,
                        );
                        const isSelected = selectedVariant?.goldKarat === karat;
                        return (
                          <button
                            key={karat}
                            onClick={() =>
                              variant && setSelectedVariantId(variant.id)
                            }
                            className={`px-6 py-3 border font-sans text-sm transition-all ${
                              isSelected
                                ? "border-evol-red bg-evol-red text-white"
                                : "border-evol-grey text-evol-dark-grey hover:border-evol-dark-grey"
                            }`}
                          >
                            {karat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gold Color Selector */}
                {goldColors.length > 1 && (
                  <div>
                    <label className="block font-sans text-xs uppercase tracking-wider text-evol-dark-grey mb-3">
                      Gold Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {goldColors.map((color) => {
                        const variant = product.variants.find(
                          (v) =>
                            v.goldColor === color &&
                            (selectedVariant
                              ? v.goldKarat === selectedVariant.goldKarat
                              : true),
                        );
                        const isSelected = selectedVariant?.goldColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() =>
                              variant && setSelectedVariantId(variant.id)
                            }
                            className={`px-6 py-3 border font-sans text-sm transition-all ${
                              isSelected
                                ? "border-evol-red bg-evol-red text-white"
                                : "border-evol-grey text-evol-dark-grey hover:border-evol-dark-grey"
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stone Specifications */}
                {selectedVariant && selectedVariant.stoneType && (
                  <div className="bg-evol-light-grey p-4 space-y-2">
                    <h3 className="font-sans text-xs uppercase tracking-wider text-evol-dark-grey mb-3">
                      Stone Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-3 font-body text-sm">
                      {selectedVariant.stoneType && (
                        <div>
                          <span className="text-evol-metallic">Stone:</span>{" "}
                          <span className="text-evol-dark-grey">
                            {selectedVariant.stoneType}
                          </span>
                        </div>
                      )}
                      {selectedVariant.stoneWeight && (
                        <div>
                          <span className="text-evol-metallic">Weight:</span>{" "}
                          <span className="text-evol-dark-grey">
                            {selectedVariant.stoneWeight} ct
                          </span>
                        </div>
                      )}
                      {selectedVariant.stoneQuality && (
                        <div>
                          <span className="text-evol-metallic">Quality:</span>{" "}
                          <span className="text-evol-dark-grey">
                            {selectedVariant.stoneQuality}
                          </span>
                        </div>
                      )}
                      {selectedVariant.stoneColor && (
                        <div>
                          <span className="text-evol-metallic">Color:</span>{" "}
                          <span className="text-evol-dark-grey">
                            {selectedVariant.stoneColor}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                {selectedVariant && (
                  <div className="text-sm">
                    {selectedVariant.stockQuantity > 0 ? (
                      <p className="text-green-600">
                        ✓ In Stock ({selectedVariant.stockQuantity} available)
                      </p>
                    ) : (
                      <p className="text-evol-metallic">
                        Made to order (4-6 weeks)
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    ref={addButtonRef}
                    variant="primary"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={!selectedVariantId}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Link
                    href={`/shop/${productId}`}
                    onClick={onClose}
                    className="block w-full text-center py-3 border border-evol-grey text-evol-dark-grey font-sans text-sm hover:border-evol-dark-grey transition-colors"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-evol-metallic">Product not found</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
