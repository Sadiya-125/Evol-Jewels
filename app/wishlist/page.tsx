"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/shop/ProductCard";
import { useWishlistStore } from "@/lib/stores/wishlist";

export default function WishlistPage() {
  const { items } = useWishlistStore();

  const handleShare = (item: (typeof items)[0]) => {
    const url = `${window.location.origin}/shop/${item.productId}`;
    if (navigator.share) {
      navigator
        .share({
          title: item.name,
          text: `Check out ${item.name}`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleShareWishlist = () => {
    const variantIds = items.map((item) => item.productVariantId);
    const encoded = encodeURIComponent(btoa(JSON.stringify(variantIds)));
    const url = `${window.location.origin}/wishlist/shared?items=${encoded}`;

    if (navigator.share) {
      navigator
        .share({
          title: "My Evol Wishlist",
          text: "Check out my wishlist from Evol Jewels",
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Wishlist link copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-evol-off-white py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-sans text-xs uppercase tracking-widest text-evol-metallic mb-4"
          >
            Your Wishlist
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-evol-dark-grey mb-4"
          >
            Pieces you've loved.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-body text-base text-evol-metallic"
          >
            {items.length} {items.length === 1 ? "piece" : "pieces"} saved
          </motion.p>
        </div>
      </motion.div>

      {/* Empty State */}
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-evol-light-grey py-32"
        >
          <div className="max-w-md mx-auto px-4 text-center">
            <Heart
              className="w-14 h-14 text-evol-grey mx-auto mb-6"
              strokeWidth={1.5}
            />
            <h2 className="font-serif text-3xl text-evol-dark-grey mb-4">
              Nothing saved yet.
            </h2>
            <p className="font-body text-evol-metallic mb-8">
              When something speaks to you, you'll find it here.
            </p>
            <Link href="/shop">
              <Button variant="primary">Start Exploring</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Wishlist Grid */}
      {items.length > 0 && (
        <div className="bg-evol-light-grey py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Share Wishlist Link */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleShareWishlist}
                className="font-sans text-xs text-evol-dark-grey hover:underline flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share this wishlist
              </button>
            </div>

            {/* Grid */}
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {items.map((item, index) => {
                  // Transform wishlist item to ProductCard format
                  const productData = {
                    id: item.productId,
                    name: item.name,
                    slug: item.productId, // Using ID as slug fallback
                    description: null,
                    basePrice: item.price.toString(),
                    images: item.image ? [item.image] : null,
                    isFeatured: false,
                  };

                  return (
                    <motion.div
                      key={item.productVariantId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="relative group"
                    >
                      {/* Product Card */}
                      <ProductCard product={productData} index={index} />

                      {/* Wishlist-specific overlay actions */}
                      <div className="absolute top-14 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                        <button
                          onClick={() => handleShare(item)}
                          className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm"
                          aria-label="Share"
                        >
                          <Share2 className="w-4 h-4 text-evol-dark-grey" />
                        </button>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-2">
                        <p className="font-body text-sm text-evol-metallic">
                          Saved{" "}
                          {formatDistanceToNow(item.addedAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
