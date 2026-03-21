"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import FilterBar from "@/components/shop/FilterBar";
import ProductCard from "@/components/shop/ProductCard";
import Skeleton from "@/components/ui/Skeleton";

function ShopContent() {
  const searchParams = useSearchParams();

  // Get filter values from URL
  const categoryFilter = searchParams.get("category")?.split(",") || [];
  const shapeFilter = searchParams.get("shape") || undefined;
  const occasionFilter = searchParams.get("occasion")?.split(",") || [];
  const genderFilter = searchParams.get("gender") || undefined;
  const sizeFilter = searchParams.get("size")?.split(",") || [];
  const priceMin = searchParams.get("priceMin") ? parseInt(searchParams.get("priceMin")!) : undefined;
  const priceMax = searchParams.get("priceMax") ? parseInt(searchParams.get("priceMax")!) : undefined;
  const weightMin = searchParams.get("weightMin") ? parseFloat(searchParams.get("weightMin")!) : undefined;
  const weightMax = searchParams.get("weightMax") ? parseFloat(searchParams.get("weightMax")!) : undefined;
  const searchQuery = searchParams.get("search") || undefined;
  const sortBy = (searchParams.get("sort") || "newest") as "newest" | "price_asc" | "price_desc" | "popular";
  const specialFilter = searchParams.get("filter") || undefined;

  // Fetch categories for page title
  const { data: categoriesData } = trpc.categories.list.useQuery();

  // Fetch products with filters
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery({
    category: categoryFilter.length > 0 ? categoryFilter : undefined,
    shape: shapeFilter,
    occasion: occasionFilter.length > 0 ? occasionFilter : undefined,
    gender: genderFilter,
    size: sizeFilter.length > 0 ? sizeFilter : undefined,
    priceMin,
    priceMax,
    weightMin,
    weightMax,
    search: searchQuery,
    sort: sortBy,
    filter: specialFilter,
    limit: 50,
  });

  const products = productsData?.map((p) => ({
    ...p.product,
    category: p.category,
  })) || [];

  // Generate page title based on filters
  const getPageTitle = () => {
    if (specialFilter === "solitaire") {
      if (categoryFilter.length === 1) {
        const categoryName = categoriesData?.find(c => c.slug === categoryFilter[0])?.name || categoryFilter[0];
        return `Solitaire ${categoryName}`;
      }
      return "Solitaire Jewellery";
    }
    if (specialFilter === "ready-to-ship") {
      return "Ready To Ship";
    }
    if (categoryFilter.length === 1) {
      const categoryName = categoriesData?.find(c => c.slug === categoryFilter[0])?.name;
      if (categoryName) {
        return `Lab Grown Diamond ${categoryName}`;
      }
    }
    return "All Jewellery";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white py-12 md:py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-[clamp(1.8rem,3vw,2.8rem)] text-evol-dark-grey mb-4"
        >
          {getPageTitle()}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-20 h-px bg-evol-grey mx-auto"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="aspect-square w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-evol-metallic text-lg mb-2">No products found</p>
            <p className="font-body text-evol-metallic text-sm">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-evol-metallic mb-6">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={product.category}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ShopFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white py-12 md:py-16 text-center">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="w-20 h-px mx-auto" />
      </div>
      <div className="border-b border-evol-beige/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="aspect-square w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent />
    </Suspense>
  );
}
