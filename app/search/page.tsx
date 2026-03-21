"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Skeleton from "@/components/ui/Skeleton";
import { trpc } from "@/lib/trpc/client";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);

  // Update input when URL changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Search query
  const { data: searchResults, isLoading } = trpc.products.search.useQuery(
    { query, limit: 50 },
    { enabled: query.length >= 2 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  // Search results now return simplified product data directly
  const products = searchResults || [];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Search", href: "/search" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header with Search Input */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-evol-dark-grey mb-6">
            Search
          </h1>

          <form onSubmit={handleSubmit} className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-evol-metallic" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-12 pr-4 py-3 font-sans text-base border border-evol-grey rounded-sm focus:outline-none focus:border-evol-red transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-evol-red text-white font-sans text-sm uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Count */}
        {query && (
          <p className="font-body text-sm text-evol-metallic mb-8">
            {isLoading
              ? "Searching..."
              : `${products.length} result${products.length !== 1 ? "s" : ""} for "${query}"`}
          </p>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="aspect-square w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : !query ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-evol-grey mx-auto mb-4" />
            <p className="font-body text-evol-metallic mb-4">
              Enter a search term to find products
            </p>
            <Link href="/shop">
              <Button variant="secondary">Browse All Products</Button>
            </Link>
          </div>
        ) : query.length < 2 ? (
          <div className="text-center py-20">
            <p className="font-body text-evol-metallic">
              Enter at least 2 characters to search
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-evol-metallic mb-4">
              No products found for &quot;{query}&quot;
            </p>
            <Link href="/shop">
              <Button variant="secondary">Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group"
              >
                <Link href={`/shop/${product.id}`}>
                  <div className="relative aspect-square bg-evol-light-grey overflow-hidden mb-4">
                    {product.images && product.images.length > 0 && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:-translate-y-1"
                      />
                    )}
                  </div>

                  <h3 className="font-sans text-sm font-medium text-evol-dark-grey mb-1">
                    {product.name}
                  </h3>
                  <p className="font-body text-sm text-evol-dark-grey mb-3">
                    ₹{parseFloat(product.basePrice).toLocaleString("en-IN")}
                  </p>

                  <Button variant="secondary" className="w-full">
                    View Details
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-12 w-full max-w-xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="aspect-square w-full mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
