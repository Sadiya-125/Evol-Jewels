"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Target, Lightbulb, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const brandManifesto = [
  "It begins with me. It begins with you.",
  "To see the world with compassion and clarity.",
  "To walk the path that feels true.",
  "To give fully, and deliver with intention.",
  "To ask boldly, and listen with an open mind.",
  "To remain steady in a shifting world.",
  "To stand with integrity, rooted in who we are.",
  "To learn to love ourselves, so we can love another.",
  "It begins with me. It begins with you.",
];

const brandValues = [
  {
    icon: Target,
    number: "01",
    value: "Clarity",
    description:
      "We move with precision and deliberation-in thought, in design, in every decision. Clarity is our constant. It shapes what we create, how we communicate, and how we decide.",
  },
  {
    icon: Lightbulb,
    number: "02",
    value: "Creativity",
    description:
      "We shape taste without chasing trends-doing better, not more, finding the new in the familiar. Evol creates restrained designs that feel relevant today and timeless tomorrow.",
  },
  {
    icon: Heart,
    number: "03",
    value: "Commitment",
    description:
      "We deliver with consistency and excellence, every time. Commitment is our quiet promise-grounded in ownership, discipline, and follow-through.",
  },
  {
    icon: Sparkles,
    number: "04",
    value: "Curiosity",
    description:
      "We ask better questions. Curiosity keeps Evol evolving-open-minded, discerning, and guided by clear standards.",
  },
  {
    icon: Shield,
    number: "05",
    value: "Character",
    description:
      "Integrity and authenticity guide us. Character earns trust, through consistency, respect, and care for the buyer. We do the right thing, even when it's harder.",
  },
];

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-evolOffWhite">
      {/* Section 1: Cinematic Hero */}
      <section className="relative min-h-150 h-screen w-full overflow-hidden bg-evolOffWhite">
        {/* Mosaic Images */}
        <div className="absolute inset-0 flex flex-wrap">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative w-1/2 md:w-1/4 h-1/2 md:h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"
              alt="Craftsmanship heritage"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-1/2 md:w-1/4 h-1/2 md:h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80"
              alt="Artisan crafting jewellery"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-1/2 md:w-1/4 h-1/2 md:h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"
              alt="Evol jewellery piece"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative w-1/2 md:w-1/4 h-1/2 md:h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80"
              alt="Finished masterpiece"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        {/* Centered Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-serif text-5xl md:text-7xl mb-6"
            >
              Love Begins With You
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-lg md:text-xl mb-8 leading-relaxed"
            >
              We design jewellery as compositions-thoughtful pieces that express
              who you are, and who you're growing into.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Link
                href="/shop"
                className="inline-block bg-evolRed text-white px-10 py-4 text-sm uppercase tracking-wider font-bold border-2 border-white hover:bg-white hover:text-evol-red transition-all"
              >
                Explore Collection
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Brand Story Panels */}
      <section className="bg-white">
        {/* Panel 1: Text Left, Image Right */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2"
        >
          <div className="flex items-center justify-center p-12 md:p-20">
            <div className="max-w-lg">
              <h2 className="font-serif text-4xl md:text-5xl text-evolDarkGrey mb-6">
                Our Beginning
              </h2>
              <p className="text-evolMetallic text-base md:text-lg leading-relaxed mb-4">
                Evol was born from a simple truth: the most meaningful jewellery
                isn't about status or trends. It's about marking moments that
                matter.
              </p>
              <p className="text-evolMetallic text-base md:text-lg leading-relaxed">
                Founded in Hyderabad, we set out to create pieces that speak to
                the journey of becoming yourself-restrained, intentional, and
                deeply personal.
              </p>
            </div>
          </div>
          <div className="relative h-100 md:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80"
              alt="Our beginning"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        {/* Panel 2: Image Left, Text Right */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2"
        >
          <div className="relative h-100 md:h-auto order-2 md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"
              alt="The craft"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex items-center justify-center p-12 md:p-20 order-1 md:order-2">
            <div className="max-w-lg">
              <h2 className="font-serif text-4xl md:text-5xl text-evolDarkGrey mb-6">
                The Craft
              </h2>
              <p className="text-evolMetallic text-base md:text-lg leading-relaxed mb-4">
                Every Evol piece passes through the hands of master artisans who
                have honed their craft over decades. We don't rush. We refine.
              </p>
              <p className="text-evolMetallic text-base md:text-lg leading-relaxed">
                From sourcing ethically-mined stones to the final polish, our
                process honors both the material and the person who will wear
                it.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Panel 3: Text Left, Image Right */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2"
        >
          <div className="flex items-center justify-center p-12 md:p-20">
            <div className="max-w-lg">
              <h2 className="font-serif text-4xl md:text-5xl text-evolDarkGrey mb-6">
                For You
              </h2>
              <p className="text-evolMetallic text-base md:text-lg leading-relaxed mb-4">
                Evol isn't about wearing jewellery. It's about wearing your
                story. Each piece is designed to complement who you are-not
                define you.
              </p>
              <p className="text-evolMetallic text-base md:text-lg leading-relaxed">
                Whether it's an engagement ring that captures your unique bond
                or a quiet piece of self-love, we're here to make it meaningful.
              </p>
            </div>
          </div>
          <div className="relative h-100 md:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80"
              alt="For you"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* Section 3: Brand Manifesto */}
      <section className="bg-evolOffWhite py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="font-sans text-xs uppercase tracking-widest text-evolDarkGrey text-center mb-12">
              Our Manifesto
            </h2>

            {brandManifesto.map((line, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`${
                  index === 0 || index === brandManifesto.length - 1
                    ? "font-serif text-2xl md:text-3xl text-evolDarkGrey"
                    : "font-body text-lg md:text-xl text-evolMetallic"
                } text-center leading-relaxed`}
              >
                {line}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 4: Mission & Vision */}
      <section className="bg-white py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-evolOffWhite p-12 text-center"
            >
              <h3 className="font-sans text-xs uppercase tracking-widest text-evolRed mb-6">
                Mission
              </h3>
              <p className="font-body text-lg text-evolDarkGrey leading-relaxed">
                We design jewellery as compositions-thoughtful pieces that
                express who you are, and who you're growing into.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-evolOffWhite p-12 text-center"
            >
              <h3 className="font-sans text-xs uppercase tracking-widest text-evolRed mb-6">
                Vision
              </h3>
              <p className="font-body text-lg text-evolDarkGrey leading-relaxed">
                To reclaim love as something you give yourself first.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 5: The 5Cs */}
      <section className="bg-evolOffWhite py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-evolDarkGrey mb-4">
              Our 5Cs
            </h2>
            <p className="font-body text-evolMetallic max-w-xl mx-auto">
              Just like the 4Cs of diamonds, our 5Cs are reflected in all our
              actions-from design to delivery.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-8">
            {brandValues.map((value, index) => (
              <motion.div
                key={value.value}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white p-8 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-evolRed/10 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-evolRed" />
                </div>
                <span className="font-serif text-4xl text-evolGrey/40 block mb-2">
                  {value.number}
                </span>
                <h3 className="font-sans text-lg font-bold uppercase tracking-wider text-evolDarkGrey mb-3">
                  {value.value}
                </h3>
                <p className="font-body text-sm text-evolMetallic leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Brand Proposition */}
      <section className="bg-white py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <p className="font-serif text-2xl md:text-3xl text-evolDarkGrey leading-relaxed">
              In knowing yourself, you make space for real connection.
            </p>
            <p className="font-serif text-2xl md:text-3xl text-evolDarkGrey leading-relaxed">
              In loving yourself, you invite love in.
            </p>
            <p className="font-body text-lg text-evolMetallic leading-relaxed max-w-2xl mx-auto">
              Evol exists to honour that journey, crafting modern pieces that
              reflect clarity, balance, and the beauty of being true to oneself.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 7: Community CTA */}
      <section className="bg-evolOffWhite py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-evolGrey p-12 md:p-16"
          >
            {/* Instagram Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-evolRed to-evolDarkGrey flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl text-center text-evolDarkGrey mb-4"
            >
              Join Our Journey
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center text-evolMetallic mb-2 text-lg"
            >
              @evoljewels
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center text-evolMetallic mb-8 max-w-xl mx-auto leading-relaxed"
            >
              Follow us for behind-the-scenes glimpses, new collections, and
              stories of love and craft.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex justify-center items-center"
            >
              <a
                href="https://instagram.com/evoljewels"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-evolRed text-white px-10 py-4 text-sm uppercase tracking-wider font-bold border-2 border-evolRed hover:bg-white hover:text-evolRed transition-all"
              >
                Follow on Instagram
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-8 border-t border-evolGrey flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center"
            >
              <div>
                <p className="font-serif text-2xl text-evolDarkGrey mb-1">
                  15K+
                </p>
                <p className="text-xs uppercase tracking-wider text-evolMetallic">
                  Followers
                </p>
              </div>
              <div className="w-px h-12 bg-evolGrey"></div>
              <div>
                <p className="font-serif text-2xl text-evolDarkGrey mb-1">
                  1000+
                </p>
                <p className="text-xs uppercase tracking-wider text-evolMetallic">
                  Happy Customers
                </p>
              </div>
              <div className="w-px h-12 bg-evolGrey"></div>
              <div>
                <p className="font-serif text-2xl text-evolDarkGrey mb-1">12</p>
                <p className="text-xs uppercase tracking-wider text-evolMetallic">
                  Years of Craft
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
