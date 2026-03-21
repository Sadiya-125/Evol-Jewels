"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useNavbar } from "./NavbarContext";
import { trpc } from "@/lib/trpc/client";
import { useDebounce } from "@/hooks/useDebounce";

const popularSearches = ["Rings", "Earrings", "Solitaire", "Diamond"];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useNavbar();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = trpc.products.search.useQuery(
    { query: debouncedQuery, limit: 8 },
    { enabled: debouncedQuery.length >= 2 }
  );

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [searchOpen, setSearchOpen]);

  const handleClose = () => {
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white z-[100] overflow-auto"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 hover:text-evol-red transition-colors"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
            {/* Search input */}
            <div className="relative mb-8">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full text-center font-serif text-3xl md:text-4xl text-evol-dark-grey placeholder:text-evol-metallic border-b-2 border-evol-grey focus:border-evol-dark-grey outline-none pb-4 transition-colors bg-transparent"
              />
            </div>

            {/* Popular searches */}
            {query.length < 2 && (
              <div className="text-center mb-12">
                <p className="font-sans text-xs uppercase tracking-widest text-evol-metallic mb-4">
                  Popular Searches
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 border border-evol-grey text-evol-dark-grey hover:border-evol-dark-grey hover:bg-evol-light-grey transition-colors text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && debouncedQuery.length >= 2 && (
              <div className="text-center py-12">
                <p className="font-body text-evol-metallic">Searching...</p>
              </div>
            )}

            {/* Search results */}
            {searchResults && searchResults.length > 0 && (
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-evol-metallic mb-6 text-center">
                  {searchResults.length} Results
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/shop/${result.id}`}
                      onClick={handleClose}
                      className="group"
                    >
                      <div className="aspect-square bg-evol-light-grey relative overflow-hidden mb-2">
                        {result.images && result.images.length > 0 && (
                          <Image
                            src={result.images[0]}
                            alt={result.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        )}
                      </div>
                      <h3 className="font-sans text-sm text-evol-dark-grey group-hover:text-evol-red transition-colors">
                        {result.name}
                      </h3>
                      <p className="font-body text-sm text-evol-metallic">
                        ₹{parseFloat(result.basePrice).toLocaleString("en-IN")}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {searchResults && searchResults.length === 0 && debouncedQuery.length >= 2 && (
              <div className="text-center py-12">
                <p className="font-body text-evol-metallic">
                  No products found for "{debouncedQuery}"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
