"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  coverImageUrl: string | null;
  accentColor: string | null;
  isFeatured: boolean;
  displayOrder: number;
  productCount: number;
}

interface CollectionsContentProps {
  collections: Collection[];
}

export default function CollectionsContent({
  collections,
}: CollectionsContentProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Header */}
      <header className="bg-evol-off-white py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.3em] text-evol-metallic mb-6"
          >
            Collections
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-evol-dark-grey mb-6"
          >
            The Edit.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-base md:text-lg text-evol-metallic max-w-xl mx-auto leading-relaxed"
          >
            Each collection is a narrative - a study in form, material, and
            meaning. Explore pieces that speak to who you are becoming.
          </motion.p>
        </div>
      </header>

      {/* Collection Panels */}
      <div>
        {collections.map((collection, index) => (
          <CollectionPanel
            key={collection.id}
            collection={collection}
            index={index}
          />
        ))}
      </div>

      {/* Interstitial Brand Moment */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="bg-evol-dark-grey py-32 md:py-40 px-4"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-serif text-2xl md:text-3xl lg:text-4xl text-evol-off-white leading-relaxed mb-8"
          >
            "Jewellery should not complete you. It should reveal you."
          </motion.blockquote>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-sans text-xs uppercase tracking-[0.3em] text-evol-metallic"
          >
            - The Evol Philosophy
          </motion.p>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <section className="bg-evol-off-white py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl md:text-4xl text-evol-dark-grey mb-6"
          >
            Can't decide?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-body text-evol-metallic mb-8 max-w-md mx-auto"
          >
            Browse our full catalogue of pieces, or visit a store to experience
            them in person.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-evol-dark-grey text-evol-off-white font-sans text-sm uppercase tracking-widest hover:bg-evol-red transition-colors duration-300"
            >
              Shop All
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/stores"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-evol-dark-grey text-evol-dark-grey font-sans text-sm uppercase tracking-widest hover:bg-evol-dark-grey hover:text-evol-off-white transition-colors duration-300"
            >
              Find a Store
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function CollectionPanel({
  collection,
  index,
}: {
  collection: Collection;
  index: number;
}) {
  const isReversed = index % 2 === 1;

  return (
    <Link href={`/collections/${collection.slug}`} className="block group">
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className={`min-h-[70vh] md:min-h-[80vh] flex flex-col ${
          isReversed ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* Image Side */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative overflow-hidden bg-evol-light-grey">
          {collection.coverImageUrl && (
            <Image
              src={collection.coverImageUrl}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index < 2}
            />
          )}
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>

        {/* Content Side */}
        <div
          className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24"
          style={{
            backgroundColor: collection.accentColor
              ? `${collection.accentColor}15`
              : "#F5F5F3",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md"
          >
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-evol-metallic mb-4">
              {collection.productCount} {collection.productCount === 1 ? "Piece" : "Pieces"}
            </p>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-evol-dark-grey mb-4">
              {collection.name}
            </h2>

            {collection.tagline && (
              <p className="font-body text-lg md:text-xl text-evol-dark-grey/80 mb-6 leading-relaxed">
                {collection.tagline}
              </p>
            )}

            <div className="flex items-center gap-2 font-sans text-sm uppercase tracking-widest text-evol-dark-grey group-hover:text-evol-red transition-colors duration-300">
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </motion.div>
        </div>
      </motion.section>
    </Link>
  );
}
