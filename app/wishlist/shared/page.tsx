"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/shop/ProductCard";
import { trpc } from "@/lib/trpc/client";
import { useCartStore } from "@/lib/stores/cart";

export default function SharedWishlistPage() {
  const searchParams = useSearchParams();
  const encodedItems = searchParams.get("items");
  const { addItem: addToCart, openDrawer } = useCartStore();

  let variantIds: string[] = [];
  let decodeError = false;

  try {
    if (encodedItems) {
      variantIds = JSON.parse(atob(encodedItems));
      console.log("Decoded variant IDs:", variantIds);
    }
  } catch (error) {
    console.error(
      "Failed to decode wishlist items:",
      error,
      "encodedItems:",
      encodedItems,
    );
    decodeError = true;
  }

  const {
    data: products,
    isLoading,
    error: queryError,
  } = trpc.products.byVariantIds.useQuery(
    { ids: variantIds },
    { enabled: variantIds.length > 0 && !decodeError },
  );

  console.log(
    "Products:",
    products,
    "Loading:",
    isLoading,
    "Query error:",
    queryError,
  );

  const handleAddAllToCart = () => {
    if (!products) return;

    products.forEach((product) => {
      addToCart({
        productId: product.productId,
        productVariantId: product.variantId,
        name: product.name,
        image: product.image,
        variantLabel: product.category?.name || "",
        price: product.price,
      });
    });

    openDrawer();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-evol-off-white">
        <p className="font-body text-evol-metallic">Loading Wishlist...</p>
      </div>
    );
  }

  if (decodeError || (!isLoading && (!products || products.length === 0))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-evol-off-white">
        <div className="text-center max-w-md px-4">
          <Heart
            className="w-14 h-14 text-evol-grey mx-auto mb-6"
            strokeWidth={1.5}
          />
          <h1 className="font-serif text-3xl text-evol-dark-grey mb-4">
            {decodeError ? "Invalid Link" : "Empty Wishlist"}
          </h1>
          <p className="font-body text-evol-metallic mb-8">
            {decodeError
              ? "This wishlist link appears to be broken. Please check the link and try again."
              : variantIds.length === 0
                ? "This wishlist is empty."
                : "The items in this wishlist are no longer available."}
          </p>
          <Link href="/shop">
            <Button variant="primary">Browse Our Collection</Button>
          </Link>
        </div>
      </div>
    );
  }

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
            Shared Wishlist
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-evol-dark-grey mb-6"
          >
            Shop This Edit
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button variant="primary" onClick={handleAddAllToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className="bg-evol-light-grey py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products?.map((item, index) => {
              // Transform data to ProductCard format
              const productData = {
                id: item.productId,
                name: item.name,
                slug: item.slug,
                description: null,
                basePrice: item.price.toString(),
                images: item.image ? [item.image] : [],
                isFeatured: false,
                isActive: true,
                categoryId: item.category?.id || "",
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              return (
                <ProductCard
                  key={item.variantId}
                  product={productData}
                  category={item.category || null}
                  index={index}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
