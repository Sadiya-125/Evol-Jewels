"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    coverImageUrl: string | null;
  };
  index?: number;
}

export default function CollectionCard({
  collection,
  index = 0,
}: CollectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white border border-evol-grey hover:border-evol-dark-grey transition-all duration-300"
    >
      <Link href={`/collections/${collection.slug}`} className="block">
        {/* Image Area */}
        <div className="relative aspect-4/5 bg-evol-light-grey overflow-hidden">
          {collection.coverImageUrl ? (
            <Image
              src={collection.coverImageUrl}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-evol-grey text-sm">
              No image
            </div>
          )}

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2">
          <h3 className="font-serif text-xl font-bold text-evol-dark-grey line-clamp-2 group-hover:text-evol-red transition-colors">
            {collection.name}
          </h3>

          {collection.tagline && (
            <p className="font-sans text-[13px] uppercase tracking-wide text-evol-metallic line-clamp-1">
              {collection.tagline}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
