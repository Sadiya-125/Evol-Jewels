"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, MessageCircle, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { trpc } from "@/lib/trpc/client";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;

  // Fetch product data
  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: productId });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({
    description: true,
    details: false,
  });

  // Set initial variant after product loads
  const [selectedVariantId, setSelectedVariantId] = useState("");

  // Fetch category data
  const { data: category } = trpc.categories.getById.useQuery(
    { id: product?.categoryId || "" },
    { enabled: !!product?.categoryId }
  );

  // Fetch related products (same category)
  const { data: relatedProductsData } = trpc.products.related.useQuery(
    { productId, limit: 4 },
    { enabled: !!product }
  );

  // Update selected variant when product loads
  if (product && !selectedVariantId && product.variants.length > 0) {
    setSelectedVariantId(product.variants[0].id);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-evol-metallic">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-evol-dark-grey mb-4">
            Product not found
          </h1>
          <Link href="/shop">
            <Button variant="secondary">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const relatedProducts = relatedProductsData?.products || [];

  // Group variants by gold karat and color
  const goldKarats = Array.from(new Set(product.variants.map((v) => v.goldKarat)));
  const goldColors = Array.from(new Set(product.variants.map((v) => v.goldColor)));

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(category ? [{ label: category.name, href: `/shop?category=${category.id}` }] : []),
    { label: product.name },
  ];

  const toggleAccordion = (key: string) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-evol-light-grey overflow-hidden group">
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square w-20 bg-evol-light-grey overflow-hidden transition-opacity ${
                      selectedImageIndex === index
                        ? "ring-2 ring-evol-red"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-evol-dark-grey mb-2">
                {product.name}
              </h1>
              <p className="font-body text-2xl text-evol-dark-grey">
                ₹{(selectedVariant?.price || product.price).toLocaleString("en-IN")}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.isFeatured && (
                <Badge variant="promotional">Featured</Badge>
              )}
              {selectedVariant?.isCustomizable && (
                <Badge variant="default">Customizable</Badge>
              )}
            </div>

            {/* Gold Karat Selector */}
            {goldKarats.length > 1 && (
              <div>
                <label className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-3 block">
                  Gold Karat
                </label>
                <div className="flex gap-3">
                  {goldKarats.map((karat) => {
                    const variant = product.variants.find((v) => v.goldKarat === karat);
                    const isSelected = selectedVariant?.goldKarat === karat;
                    return (
                      <button
                        key={karat}
                        onClick={() => variant && setSelectedVariantId(variant.id)}
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
                <label className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-3 block">
                  Gold Color
                </label>
                <div className="flex gap-3">
                  {goldColors.map((color) => {
                    const variant = product.variants.find(
                      (v) =>
                        v.goldColor === color &&
                        (selectedVariant ? v.goldKarat === selectedVariant.goldKarat : true)
                    );
                    const isSelected = selectedVariant?.goldColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => variant && setSelectedVariantId(variant.id)}
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

            {/* Specifications */}
            {selectedVariant && selectedVariant.stoneType && (
              <div className="bg-evol-light-grey p-6 space-y-3">
                <h3 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-4">
                  Stone Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4 font-body text-sm">
                  {selectedVariant.stoneType && (
                    <div>
                      <span className="text-evol-metallic">Stone:</span>{" "}
                      <span className="text-evol-dark-grey">{selectedVariant.stoneType}</span>
                    </div>
                  )}
                  {selectedVariant.stoneWeight && (
                    <div>
                      <span className="text-evol-metallic">Weight:</span>{" "}
                      <span className="text-evol-dark-grey">{selectedVariant.stoneWeight} ct</span>
                    </div>
                  )}
                  {selectedVariant.stoneQuality && (
                    <div>
                      <span className="text-evol-metallic">Quality:</span>{" "}
                      <span className="text-evol-dark-grey">{selectedVariant.stoneQuality}</span>
                    </div>
                  )}
                  {selectedVariant.stoneColor && (
                    <div>
                      <span className="text-evol-metallic">Color:</span>{" "}
                      <span className="text-evol-dark-grey">{selectedVariant.stoneColor}</span>
                    </div>
                  )}
                  {selectedVariant.stoneCount && (
                    <div>
                      <span className="text-evol-metallic">Count:</span>{" "}
                      <span className="text-evol-dark-grey">{selectedVariant.stoneCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customizable Notice */}
            {product.variants.some((v) => v.isCustomizable) && (
              <div className="bg-evol-off-white p-6 border-l-4 border-evol-red">
                <h4 className="font-sans text-sm font-medium text-evol-dark-grey mb-2">
                  This piece can be personalised
                </h4>
                <p className="font-body text-sm text-evol-metallic mb-4">
                  Speak to us about customisation options
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://wa.me/919963661025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-sans text-evol-red hover:text-evol-dark-grey transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:sadiya.siddiqui@evoljewels.com"
                    className="inline-flex items-center gap-2 text-sm font-sans text-evol-red hover:text-evol-dark-grey transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            {selectedVariant && (
              <AddToCartButton
                productId={product.id}
                productVariantId={selectedVariant.id}
                name={product.name}
                image={product.images[0] || null}
                variantLabel={`${selectedVariant.goldKarat} ${selectedVariant.goldColor} Gold`}
                price={selectedVariant.price}
                variant="primary"
                className="w-full"
                isCustomizable={selectedVariant.isCustomizable}
              />
            )}
          </div>
        </div>

        {/* Accordion Section */}
        <div className="max-w-3xl mx-auto mb-20 border-t border-evol-grey">
          {/* Description */}
          <div className="border-b border-evol-grey">
            <button
              onClick={() => toggleAccordion("description")}
              className="w-full flex items-center justify-between py-6 text-left"
            >
              <h3 className="font-sans text-sm uppercase tracking-widest text-evol-dark-grey">
                Description
              </h3>
              <ChevronDown
                className={`h-5 w-5 text-evol-dark-grey transition-transform ${
                  accordionOpen.description ? "rotate-180" : ""
                }`}
              />
            </button>
            {accordionOpen.description && (
              <div className="pb-6 font-body text-evol-dark-grey leading-relaxed">
                {product.description}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="border-b border-evol-grey">
            <button
              onClick={() => toggleAccordion("details")}
              className="w-full flex items-center justify-between py-6 text-left"
            >
              <h3 className="font-sans text-sm uppercase tracking-widest text-evol-dark-grey">
                Materials & Care
              </h3>
              <ChevronDown
                className={`h-5 w-5 text-evol-dark-grey transition-transform ${
                  accordionOpen.details ? "rotate-180" : ""
                }`}
              />
            </button>
            {accordionOpen.details && (
              <div className="pb-6 font-body text-evol-dark-grey leading-relaxed space-y-4">
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-widest mb-2">
                    Materials
                  </h4>
                  <p>
                    {selectedVariant?.goldKarat} {selectedVariant?.goldColor} Gold
                    {selectedVariant?.goldWeight && ` - ${selectedVariant.goldWeight}g`}
                  </p>
                </div>
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-widest mb-2">Care</h4>
                  <p>
                    Store in a soft cloth pouch. Clean with warm soapy water and a soft
                    brush. Avoid harsh chemicals and extreme temperatures.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey text-center mb-12">
              You may also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((item) => (
                <Link key={item.product.id} href={`/shop/${item.product.id}`} className="group">
                  <div className="relative aspect-square bg-evol-light-grey overflow-hidden mb-4">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:-translate-y-1"
                    />
                  </div>
                  <h3 className="font-sans text-sm font-medium text-evol-dark-grey mb-1">
                    {item.product.name}
                  </h3>
                  <p className="font-body text-sm text-evol-dark-grey">
                    ₹{parseFloat(item.product.basePrice).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
