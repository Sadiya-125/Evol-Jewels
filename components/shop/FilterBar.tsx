"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import { trpc } from "@/lib/trpc/client";
import { diamondShapes } from "@/components/icons/shapes";
import { useDebounce } from "@/hooks/useDebounce";

const occasions = [
  { label: "Dailywear", value: "dailywear" },
  { label: "Engagement", value: "engagement" },
  { label: "Fancy", value: "fancy" },
  { label: "Festive", value: "festive" },
  { label: "Office", value: "office" },
];

const genders = [
  { label: "For Her", value: "her" },
  { label: "For Him", value: "him" },
  { label: "Unisex", value: "unisex" },
];

const ringSizes = Array.from({ length: 14 }, (_, i) => (i + 5).toString());

const sortOptions = [
  { label: "Price, Low to High", value: "price_asc" },
  { label: "Price, High to Low", value: "price_desc" },
  { label: "New Arrivals", value: "newest" },
  { label: "Most Popular", value: "popular" },
];

type FilterType = "categories" | "shape" | "occasion" | "gender" | "size" | "price" | "weight" | "sort" | null;

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openFilter, setOpenFilter] = useState<FilterType>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const filterRef = useRef<HTMLDivElement>(null);

  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get("priceMin") || "0"),
    parseInt(searchParams.get("priceMax") || "500000"),
  ]);

  // Weight range state
  const [weightRange, setWeightRange] = useState<[number, number]>([
    parseFloat(searchParams.get("weightMin") || "0"),
    parseFloat(searchParams.get("weightMax") || "50"),
  ]);

  const { data: categoriesData } = trpc.categories.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update URL with debounced search
  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      updateFilter("search", debouncedSearch || null);
    }
  }, [debouncedSearch]);

  // Get current filter values from URL
  const getFilterValues = (key: string): string[] => {
    const value = searchParams.get(key);
    return value ? value.split(",") : [];
  };

  const updateFilter = (key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null || (Array.isArray(value) && value.length === 0) || value === "") {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, value);
    }

    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const toggleArrayFilter = (key: string, value: string) => {
    const currentValues = getFilterValues(key);
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues);
  };

  const clearAllFilters = () => {
    router.replace("/shop", { scroll: false });
    setSearchQuery("");
    setPriceRange([0, 500000]);
    setWeightRange([0, 50]);
  };

  // Count active filters
  const activeFilterCount = () => {
    let count = 0;
    if (searchParams.get("category")) count += getFilterValues("category").length;
    if (searchParams.get("shape")) count++;
    if (searchParams.get("occasion")) count += getFilterValues("occasion").length;
    if (searchParams.get("gender")) count++;
    if (searchParams.get("size")) count += getFilterValues("size").length;
    if (searchParams.get("priceMin") || searchParams.get("priceMax")) count++;
    if (searchParams.get("weightMin") || searchParams.get("weightMax")) count++;
    return count;
  };

  const hasActiveFilters = activeFilterCount() > 0;
  const currentSort = searchParams.get("sort") || "newest";

  return (
    <div className="sticky top-0 md:top-0 z-40 bg-white border-b border-evol-light-grey py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search input */}
        <div className="mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-evol-metallic" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Products"
              className="w-full pl-10 pr-4 py-2 border border-evol-grey text-sm focus:outline-none focus:border-evol-dark-grey rounded"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4" ref={filterRef}>
          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Categories */}
            <FilterPill
              label="Categories"
              count={getFilterValues("category").length}
              isOpen={openFilter === "categories"}
              onClick={() => setOpenFilter(openFilter === "categories" ? null : "categories")}
            >
              <div className="space-y-2">
                {categoriesData?.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getFilterValues("category").includes(category.slug)}
                      onChange={() => toggleArrayFilter("category", category.slug)}
                      className="w-4 h-4 text-evol-red border-evol-grey focus:ring-evol-red"
                    />
                    <span className="text-sm text-evol-dark-grey">{category.name}</span>
                  </label>
                ))}
              </div>
            </FilterPill>

            {/* Stone Shape */}
            <FilterPill
              label="Stone Shape"
              count={searchParams.get("shape") ? 1 : 0}
              isOpen={openFilter === "shape"}
              onClick={() => setOpenFilter(openFilter === "shape" ? null : "shape")}
              width="wide"
            >
              <div className="grid grid-cols-3 gap-3">
                {diamondShapes.map((shape) => (
                  <button
                    key={shape.slug}
                    onClick={() => {
                      updateFilter("shape", searchParams.get("shape") === shape.slug ? null : shape.slug);
                      setOpenFilter(null);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 border transition-colors ${
                      searchParams.get("shape") === shape.slug
                        ? "border-evol-red bg-evol-light-grey"
                        : "border-evol-grey hover:border-evol-dark-grey"
                    }`}
                  >
                    <shape.Icon className="w-6 h-6" />
                    <span className="text-xs text-evol-dark-grey">{shape.name}</span>
                  </button>
                ))}
              </div>
            </FilterPill>

            {/* Occasion */}
            <FilterPill
              label="Occasion"
              count={getFilterValues("occasion").length}
              isOpen={openFilter === "occasion"}
              onClick={() => setOpenFilter(openFilter === "occasion" ? null : "occasion")}
            >
              <div className="space-y-2">
                {occasions.map((occasion) => (
                  <label key={occasion.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getFilterValues("occasion").includes(occasion.value)}
                      onChange={() => toggleArrayFilter("occasion", occasion.value)}
                      className="w-4 h-4 text-evol-red border-evol-grey focus:ring-evol-red"
                    />
                    <span className="text-sm text-evol-dark-grey">{occasion.label}</span>
                  </label>
                ))}
              </div>
            </FilterPill>

            {/* Gender */}
            <FilterPill
              label="For Whom?"
              count={searchParams.get("gender") ? 1 : 0}
              isOpen={openFilter === "gender"}
              onClick={() => setOpenFilter(openFilter === "gender" ? null : "gender")}
            >
              <div className="space-y-2">
                {genders.map((gender) => (
                  <label key={gender.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={searchParams.get("gender") === gender.value}
                      onChange={() => {
                        updateFilter("gender", gender.value);
                        setOpenFilter(null);
                      }}
                      className="w-4 h-4 text-evol-red border-evol-grey focus:ring-evol-red"
                    />
                    <span className="text-sm text-evol-dark-grey">{gender.label}</span>
                  </label>
                ))}
              </div>
            </FilterPill>

            {/* Size */}
            <FilterPill
              label="Size"
              count={getFilterValues("size").length}
              isOpen={openFilter === "size"}
              onClick={() => setOpenFilter(openFilter === "size" ? null : "size")}
            >
              <div className="grid grid-cols-4 gap-2">
                {ringSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleArrayFilter("size", size)}
                    className={`px-3 py-2 text-sm border transition-colors ${
                      getFilterValues("size").includes(size)
                        ? "border-evol-red bg-evol-light-grey text-evol-dark-grey"
                        : "border-evol-grey text-evol-metallic hover:border-evol-dark-grey"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FilterPill>

            {/* Price */}
            <FilterPill
              label="Price"
              count={searchParams.get("priceMin") || searchParams.get("priceMax") ? 1 : 0}
              isOpen={openFilter === "price"}
              onClick={() => setOpenFilter(openFilter === "price" ? null : "price")}
            >
              <div className="space-y-4">
                <Slider.Root
                  className="relative flex items-center w-full h-5 select-none touch-none"
                  value={priceRange}
                  onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  onValueCommit={(value) => {
                    updateFilter("priceMin", value[0] > 0 ? value[0].toString() : null);
                    updateFilter("priceMax", value[1] < 500000 ? value[1].toString() : null);
                  }}
                  min={0}
                  max={500000}
                  step={5000}
                >
                  <Slider.Track className="relative h-1 w-full grow rounded-full bg-evol-grey">
                    <Slider.Range className="absolute h-full rounded-full bg-evol-red" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-evol-red rounded-full focus:outline-none" />
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-evol-red rounded-full focus:outline-none" />
                </Slider.Root>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-24 px-2 py-1 border border-evol-grey text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="Min"
                  />
                  <span className="text-evol-metallic">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500000])}
                    className="w-24 px-2 py-1 border border-evol-grey text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="Max"
                  />
                </div>
              </div>
            </FilterPill>

            {/* Weight */}
            <FilterPill
              label="Gross Weight"
              count={searchParams.get("weightMin") || searchParams.get("weightMax") ? 1 : 0}
              isOpen={openFilter === "weight"}
              onClick={() => setOpenFilter(openFilter === "weight" ? null : "weight")}
            >
              <div className="space-y-4">
                <Slider.Root
                  className="relative flex items-center w-full h-5 select-none touch-none"
                  value={weightRange}
                  onValueChange={(value) => setWeightRange([value[0], value[1]])}
                  onValueCommit={(value) => {
                    updateFilter("weightMin", value[0] > 0 ? value[0].toString() : null);
                    updateFilter("weightMax", value[1] < 50 ? value[1].toString() : null);
                  }}
                  min={0}
                  max={50}
                  step={0.5}
                >
                  <Slider.Track className="relative h-1 w-full grow rounded-full bg-evol-grey">
                    <Slider.Range className="absolute h-full rounded-full bg-evol-red" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-evol-red rounded-full focus:outline-none" />
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-evol-red rounded-full focus:outline-none" />
                </Slider.Root>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weightRange[0]}
                    onChange={(e) => setWeightRange([parseFloat(e.target.value) || 0, weightRange[1]])}
                    className="w-24 px-2 py-1 border border-evol-grey text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="Min (g)"
                    step="0.5"
                  />
                  <span className="text-evol-metallic">-</span>
                  <input
                    type="number"
                    value={weightRange[1]}
                    onChange={(e) => setWeightRange([weightRange[0], parseFloat(e.target.value) || 50])}
                    className="w-24 px-2 py-1 border border-evol-grey text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="Max (g)"
                    step="0.5"
                  />
                </div>
              </div>
            </FilterPill>

            {/* Clear All */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-evol-red hover:text-evol-dark-grey transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setOpenFilter(openFilter === "sort" ? null : "sort")}
              className="flex items-center gap-2 text-sm text-evol-dark-grey whitespace-nowrap"
            >
              <span className="hidden md:inline uppercase tracking-wider text-xs">Sort By:</span>
              <span className="text-xs md:text-sm">{sortOptions.find((s) => s.value === currentSort)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openFilter === "sort" ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {openFilter === "sort" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white border border-evol-grey shadow-md p-2 z-10"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFilter("sort", option.value);
                        setOpenFilter(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        currentSort === option.value
                          ? "bg-evol-light-grey text-evol-dark-grey"
                          : "text-evol-metallic hover:bg-evol-light-grey hover:text-evol-dark-grey"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterPillProps {
  label: string;
  count: number;
  isOpen: boolean;
  onClick: () => void;
  width?: "normal" | "wide";
  children: React.ReactNode;
}

function FilterPill({ label, count, isOpen, onClick, width = "normal", children }: FilterPillProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 border text-xs md:text-sm transition-colors rounded ${
          isOpen || count > 0
            ? "border-evol-dark-grey bg-evol-light-grey"
            : "border-evol-grey hover:border-evol-dark-grey"
        }`}
      >
        <span className="text-evol-dark-grey whitespace-nowrap">{label}</span>
        {count > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-evol-red text-white text-[10px]">
            {count}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-evol-metallic transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 md:left-auto top-full mt-1 bg-white border border-evol-grey shadow-lg p-4 z-50 max-h-[60vh] overflow-y-auto ${
              width === "wide" ? "w-[calc(100vw-2rem)] md:w-[360px]" : "w-[calc(100vw-2rem)] md:min-w-[240px] md:max-w-[320px]"
            }`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
