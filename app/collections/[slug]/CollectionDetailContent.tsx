"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductCard from "@/components/shop/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: string;
  images: string[] | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  minPrice: number;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImageUrl: string | null;
  moodImageUrls: string[] | null;
  accentColor: string | null;
  products: Product[];
}

interface CollectionDetailContentProps {
  collection: Collection;
}

export default function CollectionDetailContent({
  collection,
}: CollectionDetailContentProps) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: collection.name },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Cinematic Hero */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        {/* Background Image */}
        {collection.coverImageUrl && (
          <Image
            src={collection.coverImageUrl}
            alt={collection.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-20">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-white/70 mb-4">
                Collection
              </p>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-4">
                {collection.name}
              </h1>
              {collection.tagline && (
                <p className="font-body text-xl md:text-2xl text-white/90 max-w-xl leading-relaxed">
                  {collection.tagline}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Description Section */}
      {collection.description && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-body text-lg md:text-xl text-evol-dark-grey/80 leading-relaxed text-center"
          >
            {collection.description}
          </motion.p>
        </section>
      )}

      {/* Mood Images (if available) */}
      {collection.moodImageUrls && collection.moodImageUrls.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-2 gap-4">
            {collection.moodImageUrls.slice(0, 2).map((imageUrl, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="aspect-4/3 relative overflow-hidden bg-evol-light-grey"
              >
                <Image
                  src={imageUrl}
                  alt={`${collection.name} mood ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 45vw"
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-evol-dark-grey mb-4">
            The Pieces
          </h2>
          <p className="font-body text-evol-metallic">
            {collection.products.length}{" "}
            {collection.products.length === 1 ? "piece" : "pieces"} in this
            collection
          </p>
        </motion.div>

        {collection.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {collection.products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  description: product.description,
                  basePrice: product.basePrice,
                  images: product.images,
                  isFeatured: false,
                }}
                category={product.category}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-body text-evol-metallic mb-6">
              No pieces in this collection yet.
            </p>
            <Link href="/shop">
              <Button variant="secondary">Browse All Products</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Navigation */}
      <section className="border-t border-evol-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 font-sans text-sm uppercase tracking-widest text-evol-dark-grey hover:text-evol-red transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All Collections
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-sans text-sm uppercase tracking-widest text-evol-dark-grey hover:text-evol-red transition-colors"
            >
              Shop All Pieces
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
