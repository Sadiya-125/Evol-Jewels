"use client";

import { motion } from "framer-motion";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Sparkles,
  Heart,
  Target,
  Lightbulb,
  Shield,
  Check,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import Skeleton from "@/components/ui/Skeleton";
import ProductCard from "@/components/shop/ProductCard";
import CollectionCard from "@/components/shop/CollectionCard";
import NewsletterRedirectHandler from "@/components/layout/NewsletterRedirectHandler";

const brandValues = [
  {
    icon: Target,
    value: "Clarity",
    description:
      "We move with precision in thought, design, and every decision",
  },
  {
    icon: Lightbulb,
    value: "Creativity",
    description: "We shape taste without chasing trends",
  },
  {
    icon: Heart,
    value: "Commitment",
    description: "We deliver with consistency and excellence, every time",
  },
  {
    icon: Sparkles,
    value: "Curiosity",
    description: "We ask better questions and think deeply about answers",
  },
  {
    icon: Shield,
    value: "Character",
    description: "Integrity and authenticity guide us in everything we do",
  },
];

export default function Home() {
  const { data: collectionsData, isLoading: collectionsLoading } =
    trpc.collections.featured.useQuery();
  const { data: featuredProductsData, isLoading: productsLoading } =
    trpc.products.featured.useQuery({ limit: 4 });

  const collections = collectionsData || [];
  const featuredProducts =
    featuredProductsData?.map((p) => ({
      ...p.product,
      category: p.category,
    })) || [];

  // Newsletter state
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const newsletterMutation = trpc.newsletter.subscribe.useMutation();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      setNewsletterState("error");
      return;
    }

    setNewsletterState("loading");
    setErrorMessage("");

    try {
      await newsletterMutation.mutateAsync({ email });
      setNewsletterState("success");
      setEmail("");
      // Note: Email sending happens in the background
    } catch (error: any) {
      setNewsletterState("error");
      setErrorMessage(
        error.message || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Newsletter redirect handler */}
      <Suspense fallback={null}>
        <NewsletterRedirectHandler />
      </Suspense>

      {/* Section 1: Cinematic Hero with Parallax */}
      <section className="relative h-screen overflow-hidden">
        {/* Hero Background - Split Layout */}
        <div className="absolute inset-0">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Left - Image Mosaic */}
            <div className="hidden md:grid grid-cols-2 gap-1 bg-evol-dark-grey p-1">
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.1 }}
                className="relative overflow-hidden"
              >
                <Image
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"
                  alt="Evol Jewels Craftsmanship"
                  fill
                  className="object-cover"
                  priority
                  sizes="25vw"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="relative overflow-hidden"
              >
                <Image
                  src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80"
                  alt="Gold Jewelry Detail"
                  fill
                  className="object-cover"
                  priority
                  sizes="25vw"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="relative overflow-hidden"
              >
                <Image
                  src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80"
                  alt="Diamond Ring"
                  fill
                  className="object-cover"
                  priority
                  sizes="25vw"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="relative overflow-hidden"
              >
                <Image
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"
                  alt="Elegant Necklace"
                  fill
                  className="object-cover"
                  priority
                  sizes="25vw"
                />
              </motion.div>
            </div>

            {/* Right - Hero Content */}
            <div className="relative bg-evol-off-white flex items-center justify-center p-6 md:p-12">
              {/* Mobile Background Image */}
              <div className="absolute inset-0 md:hidden">
                <Image
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"
                  alt="Evol Jewels"
                  fill
                  className="object-cover opacity-20"
                  priority
                  sizes="100vw"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative text-center max-w-lg space-y-6 md:space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="inline-block px-4 py-1.5 border border-evol-red"
                >
                  <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-evol-red">
                    Handcrafted Excellence
                  </p>
                </motion.div>

                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-evol-dark-grey leading-tight">
                  Begin.
                </h1>

                <p className="font-script text-2xl md:text-3xl lg:text-4xl text-evol-dark-grey">
                  Love begins with you.
                </p>

                <p className="font-body text-sm md:text-base text-evol-metallic leading-relaxed max-w-md mx-auto">
                  Discover timeless pieces that express who you are and who
                  you're becoming.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/shop">
                    <Button variant="primary" size="lg">
                      Discover Collection
                    </Button>
                  </Link>
                  <Link href="/customise">
                    <Button variant="secondary" size="lg">
                      Create Your Own
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-evol-dark-grey/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-evol-dark-grey/30 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 2: Collections Grid */}
      <section className="bg-white py-16 md:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-evol-red mb-4">
              Curated Collections
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-evol-dark-grey mb-4">
              Pieces That Tell Your Story
            </h2>
            <p className="font-body text-evol-metallic max-w-2xl mx-auto text-sm md:text-base">
              Each collection is thoughtfully designed to celebrate moments,
              memories, and the beauty of being you.
            </p>
          </motion.div>

          <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto">
              {collectionsLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div key={index}>
                      <Skeleton className="aspect-4/5 w-full mb-4" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))
                : collections.slice(0, 4).map((collection, index) => (
                    <CollectionCard
                      key={collection.id}
                      collection={{
                        id: collection.id,
                        name: collection.name,
                        slug: collection.slug,
                        tagline: collection.tagline,
                        coverImageUrl: collection.coverImageUrl,
                      }}
                      index={index}
                    />
                  ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex justify-center mt-12 md:mt-16"
          >
            <Link href="/collections">
              <Button variant="secondary" size="lg">
                Explore All Collections
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Brand Statement with Visual */}
      <section className="relative bg-evol-off-white py-20 md:py-32 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-evol-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Centered Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-16 md:mb-20"
          >
            <div className="inline-block px-6 py-2 bg-white/80 backdrop-blur-sm border border-evol-red mb-6">
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-evol-red">
                Our Philosophy
              </p>
            </div>
            <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight text-evol-dark-grey mb-8">
              "To learn to love ourselves,
              <br />
              so we can love another."
            </blockquote>
            <p className="font-body text-base md:text-lg text-evol-metallic max-w-2xl mx-auto leading-relaxed mb-10">
              Every piece we create is a testament to self-love and the journey
              of becoming. Wear your story with pride, knowing that true beauty
              begins from within.
            </p>
          </motion.div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative aspect-3/4 overflow-hidden group"
            >
              <Image
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"
                alt="Evol Jewels Collection"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-evol-dark-grey/30 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-3/4 overflow-hidden group"
            >
              <Image
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"
                alt="Handcrafted Jewelry"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-evol-dark-grey/30 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative aspect-3/4 overflow-hidden group"
            >
              <Image
                src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80"
                alt="Luxury Craftsmanship"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-evol-dark-grey/30 via-transparent to-transparent" />
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link href="/our-story">
              <Button variant="primary" size="lg">
                Discover Our Story
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Featured Products */}
      <section className="bg-evol-light-grey py-16 md:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-evol-red mb-4">
              Signature Pieces
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-evol-dark-grey mb-4">
              Featured Collection
            </h2>
            <p className="font-body text-evol-metallic max-w-2xl mx-auto text-sm md:text-base">
              Handpicked pieces that embody elegance, craftsmanship, and
              timeless beauty.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {productsLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton className="aspect-4/5 w-full mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              : featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    category={product.category}
                    index={index}
                  />
                ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex justify-center mt-12 md:mt-16"
          >
            <Link href="/shop">
              <Button variant="primary" size="lg">
                Shop All Jewelry
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Brand Values */}
      <section className="bg-white py-16 md:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-evol-red mb-4">
              Our Foundation
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-evol-dark-grey mb-4">
              The 5Cs of Evol
            </h2>
            <p className="font-body text-evol-metallic max-w-2xl mx-auto text-sm md:text-base">
              Five core values that guide every piece we create and every
              decision we make.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {brandValues.map((value, index) => (
              <motion.div
                key={value.value}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative bg-evol-light-grey p-6 md:p-8 hover:bg-evol-red transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-14 w-14 flex items-center justify-center text-evol-red group-hover:text-white transition-colors duration-300">
                    <value.icon className="h-9 w-9" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-evol-dark-grey group-hover:text-white transition-colors duration-300">
                    {value.value}
                  </h3>
                  <p className="font-body text-xs md:text-sm text-evol-metallic group-hover:text-white/90 leading-relaxed transition-colors duration-300">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Newsletter CTA */}
      <section className="relative bg-evol-dark-grey py-16 md:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 border border-white rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto text-center space-y-8 md:space-y-10"
        >
          <div className="space-y-4 md:space-y-6">
            <div className="w-12 h-0.5 bg-evol-red mx-auto" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
              Join Our Journey
            </h2>
            <p className="font-body text-base md:text-lg text-evol-grey max-w-2xl mx-auto">
              Be the first to discover new collections, exclusive offers, and
              stories of craftsmanship.
            </p>
          </div>

          {newsletterState === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 p-8 md:p-10 max-w-md mx-auto backdrop-blur-sm"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="font-sans text-white text-xl mb-3">
                Check Your Email
              </p>
              <p className="font-body text-sm md:text-base text-evol-grey leading-relaxed">
                We've sent a confirmation link to your inbox. Please click to
                complete your subscription.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-lg mx-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setNewsletterState("idle");
                    setErrorMessage("");
                  }}
                  placeholder="Enter your Email"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-evol-red focus:bg-white/15 px-4 py-3 md:py-4"
                  disabled={newsletterState === "loading"}
                />
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={newsletterState === "loading"}
                  loading={newsletterState === "loading"}
                  className="whitespace-nowrap"
                >
                  {newsletterState === "loading"
                    ? "Subscribing..."
                    : "Subscribe"}
                </Button>
              </div>

              {newsletterState === "error" && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-red-300 bg-red-500/10 border border-red-500/20 p-4 max-w-lg mx-auto"
                >
                  <X className="h-4 w-4 shrink-0" />
                  <p className="font-body text-sm">{errorMessage}</p>
                </motion.div>
              )}
            </form>
          )}

          <p className="font-body text-xs md:text-sm text-evol-grey/60">
            We respect your privacy. Unsubscribe anytime with one click.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
