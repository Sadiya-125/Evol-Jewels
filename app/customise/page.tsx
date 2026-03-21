"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Pencil,
  CheckCircle,
  Gem,
  Plus,
  Minus,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import * as Accordion from "@radix-ui/react-accordion";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";

// Form input schema (what the form sends)
const inquiryInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  requirement: z
    .string()
    .min(20, "Please describe your requirement in at least 20 characters")
    .max(2000, "Requirement must be less than 2000 characters"),
  budgetRange: z.enum(["under_50k", "50k_1l", "1l_3l", "3l_5l", "above_5l", ""]).optional(),
  occasion: z.enum(["engagement", "wedding", "anniversary", "birthday", "self", "gift", "other", ""]).optional(),
  timeline: z.string().max(200).optional(),
});

type InquiryFormData = z.input<typeof inquiryInputSchema>;

export default function CustomisePage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageKey, setUploadedImageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [inquiryId, setInquiryId] = useState<string>("");

  // Confetti celebration
  const triggerConfetti = useCallback(() => {
    // Fire multiple bursts for a celebratory effect
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#9F0B10", "#DAA520", "#FFD700", "#FFFFFF", "#666666"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
        origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.2 + 0.2 },
      });

      confetti({
        ...defaults,
        particleCount: 25,
        scalar: 0.85,
        shapes: ["circle"],
        origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.2 + 0.3 },
      });
    };

    // Initial burst
    shoot();
    // Follow-up bursts
    setTimeout(shoot, 150);
    setTimeout(shoot, 300);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryInputSchema),
  });

  const requirementText = watch("requirement", "");

  const submitInquiry = trpc.customise.submitInquiry.useMutation({
    onSuccess: (data) => {
      setSubmitSuccess(true);
      setInquiryId(data.inquiryId);
      // Trigger confetti celebration!
      triggerConfetti();
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get upload signature from backend
      const signatureResponse = await fetch("/api/customise/upload-signature", {
        method: "POST",
      });
      const signatureData = await signatureResponse.json();

      // Upload directly to Cloudinary with progress tracking
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signatureData.signature);
      formData.append("timestamp", signatureData.timestamp);
      formData.append("api_key", signatureData.apiKey);
      formData.append("folder", signatureData.folder);

      // Use XMLHttpRequest for upload progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const uploadData = JSON.parse(xhr.responseText);
            setUploadedImageUrl(uploadData.secure_url);
            setUploadedImageKey(uploadData.public_id);
            resolve(uploadData);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        // Send request
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        );
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedImageKey) {
      try {
        await fetch("/api/customise/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: uploadedImageKey }),
        });
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
    setUploadedImageUrl(null);
    setUploadedImageKey(null);
  };

  const onSubmit = async (data: InquiryFormData) => {
    await submitInquiry.mutateAsync({
      name: data.name,
      email: data.email,
      phone: data.phone,
      requirement: data.requirement,
      budgetRange: data.budgetRange === "" ? undefined : data.budgetRange,
      occasion: data.occasion === "" ? undefined : data.occasion,
      timeline: data.timeline === "" ? undefined : data.timeline,
      referenceImageUrl: uploadedImageUrl || undefined,
      referenceImageKey: uploadedImageKey || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-evolOffWhite">
      {/* Section 1: Cinematic Hero */}
      <section className="relative min-h-[600px] h-screen w-full overflow-hidden bg-evolOffWhite">
        {/* Mosaic Images */}
        <div className="absolute inset-0 flex flex-wrap">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative w-1/2 md:w-1/4 h-1/2 md:h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80"
              alt="Bespoke craftsmanship"
              fill
              className="object-cover"
              priority
              sizes="25vw"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-1/2 md:w-1/4 h-1/2 md:h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"
              alt="Artisan at work"
              fill
              className="object-cover"
              priority
              sizes="25vw"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-1/2 md:w-1/4 h-1/2 md:h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80"
              alt="Custom jewellery design"
              fill
              className="object-cover"
              priority
              sizes="25vw"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative w-1/2 md:w-1/4 h-1/2 md:h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"
              alt="Finished masterpiece"
              fill
              className="object-cover"
              priority
              sizes="25vw"
            />
          </motion.div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Centered Content */}
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
          <div className="text-center text-white max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="inline-block px-4 py-1.5 border border-white/50 mb-6"
            >
              <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-white">
                Bespoke Service
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
            >
              Bespoke by Evol
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-base sm:text-lg md:text-xl mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Every love story is unique. Your jewellery should be too. Work
              directly with our master artisans to bring your vision to life.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <a
                href="#inquiry-form"
                className="inline-block bg-evolRed text-white px-8 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-white hover:bg-white hover:text-evol-red transition-all"
              >
                Begin Your Journey
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 2: Bespoke Process (3 Alternating Panels) */}
      <section className="bg-white">
        {/* Panel 1: Text Left, Image Right */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2"
        >
          <div className="flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-20">
            <div className="max-w-lg">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-evolDarkGrey mb-4 md:mb-6">
                Bespoke Forms
              </h2>
              <p className="text-evolMetallic text-sm sm:text-base md:text-lg leading-relaxed mb-4">
                Bespoke isn't about prestige. It's about precision-the exact
                weight, width, curve, or engraving that makes a piece
                unmistakably yours.
              </p>
              <p className="text-evolMetallic text-sm sm:text-base md:text-lg leading-relaxed">
                We don't offer infinite options. We offer clarity. Together,
                we'll refine your idea into something tangible, intentional, and
                enduring.
              </p>
            </div>
          </div>
          <div className="relative h-[400px] md:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80"
              alt="Bespoke forms"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
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
          <div className="relative h-[400px] md:h-auto order-2 md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80"
              alt="A note from the heart"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-20 order-1 md:order-2">
            <div className="max-w-lg">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-evolDarkGrey mb-4 md:mb-6">
                A Note From the Heart
              </h2>
              <p className="text-evolMetallic text-sm sm:text-base md:text-lg leading-relaxed mb-4">
                The best bespoke pieces begin with a story. A moment you want to
                preserve. A feeling you want to carry. A promise you want to
                keep.
              </p>
              <p className="text-evolMetallic text-sm sm:text-base md:text-lg leading-relaxed">
                We listen first. Not to sell you something, but to understand
                what matters. Then we design something that honors that.
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
          <div className="flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-20">
            <div className="max-w-lg">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-evolDarkGrey mb-4 md:mb-6">
                A Thorough Process
              </h2>
              <p className="text-evolMetallic text-sm sm:text-base md:text-lg leading-relaxed mb-4">
                Bespoke takes time. There's consultation, sketches, revisions,
                metal sourcing, stone selection, crafting, finishing.
              </p>
              <p className="text-evolMetallic text-sm sm:text-base md:text-lg leading-relaxed">
                We're transparent about timelines and costs. You'll see sketches
                before we start. You'll approve materials before we craft. And
                you'll receive something made exactly as promised.
              </p>
            </div>
          </div>
          <div className="relative h-[400px] md:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=1200&q=80"
              alt="Thorough process"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </motion.div>
      </section>

      {/* Section 3: How It Works (4 Steps) */}
      <section className="bg-evolOffWhite py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl text-center text-evolDarkGrey mb-16"
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-evolRed/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-evolRed" />
              </div>
              <h3 className="font-semibold text-lg mb-3 text-evolDarkGrey">
                Share Your Vision
              </h3>
              <p className="text-evolMetallic text-sm leading-relaxed">
                Tell us about your idea, occasion, and budget. Upload reference
                images if you have them.
              </p>
            </motion.div>

            {/* Connector Line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-evolGrey/40" />
            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-evolRed/10 flex items-center justify-center">
                <Pencil className="w-8 h-8 text-evolRed" />
              </div>
              <h3 className="font-semibold text-lg mb-3 text-evolDarkGrey">
                Design Together
              </h3>
              <p className="text-evolMetallic text-sm leading-relaxed">
                Our artisans create sketches and 3D renders. We refine until
                it's exactly right.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-evolRed/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-evolRed" />
              </div>
              <h3 className="font-semibold text-lg mb-3 text-evolDarkGrey">
                Approve & Craft
              </h3>
              <p className="text-evolMetallic text-sm leading-relaxed">
                You approve the design and materials. We begin crafting your
                piece with care.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-evolRed/10 flex items-center justify-center">
                <Gem className="w-8 h-8 text-evolRed" />
              </div>
              <h3 className="font-semibold text-lg mb-3 text-evolDarkGrey">
                Receive Your Piece
              </h3>
              <p className="text-evolMetallic text-sm leading-relaxed">
                Your bespoke jewellery arrives, made exactly as envisioned.
                Uniquely yours.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Inspiration Journal (3 Cards) */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl text-center text-evolDarkGrey mb-4"
          >
            Inspiration Journal
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-evolMetallic mb-12 max-w-2xl mx-auto"
          >
            Stories of pieces we've created, the symbolism behind them, and the
            craft that brings them to life.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <Link href="/journal/signet-rings">
                <div className="relative h-80 mb-4 overflow-hidden">
                  <Image
                    src="/images/journal/signet-rings.jpg"
                    alt="The Return of Signet Rings"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-2xl mb-2 text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  The Return of Signet Rings
                </h3>
                <p className="text-evolMetallic text-sm leading-relaxed">
                  Once worn by families as symbols of legacy, signet rings are
                  being reimagined for a new generation seeking personal
                  emblems.
                </p>
              </Link>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <Link href="/journal/asymmetric-engagement">
                <div className="relative h-80 mb-4 overflow-hidden">
                  <Image
                    src="/images/journal/asymmetric-engagement.jpg"
                    alt="Why Asymmetric Engagement Rings Matter"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-2xl mb-2 text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Why Asymmetric Engagement Rings Matter
                </h3>
                <p className="text-evolMetallic text-sm leading-relaxed">
                  Tradition has its place, but some love stories don't fit into
                  perfect symmetry. Here's why we're seeing more intentionally
                  off-center designs.
                </p>
              </Link>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <Link href="/journal/choosing-metal">
                <div className="relative h-80 mb-4 overflow-hidden">
                  <Image
                    src="/images/journal/choosing-metal.jpg"
                    alt="Choosing Metal That Lasts"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-2xl mb-2 text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Choosing Metal That Lasts
                </h3>
                <p className="text-evolMetallic text-sm leading-relaxed">
                  Gold, platinum, silver, each has different properties.
                  Understanding durability, patina, and care helps you choose
                  wisely.
                </p>
              </Link>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Section 5: Bespoke Inquiry Form */}
      <section id="inquiry-form" className="bg-evolOffWhite py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-evolDarkGrey mb-4">
              Begin Your Bespoke Journey
            </h2>
            <p className="text-evolMetallic max-w-xl mx-auto">
              Share your vision with us. We'll respond within 48 hours to begin
              the conversation.
            </p>
          </motion.div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 text-center border border-evolGrey"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-6 text-evolRed" />
              <h3 className="font-serif text-3xl text-evolDarkGrey mb-4">
                Thank You
              </h3>
              <p className="text-evolMetallic mb-2">
                Your inquiry has been received. Our team will review your
                requirements and reach out within 48 hours.
              </p>
              <p className="text-sm text-evolMetallic mb-6">
                Reference ID: <span className="font-mono">{inquiryId}</span>
              </p>
              <Link
                href="/shop"
                className="inline-block bg-evolRed text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-evolDarkGrey transition-colors"
              >
                Continue Browsing
              </Link>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white p-8 md:p-12 border border-evolGrey space-y-6"
            >
              {/* Name */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-evolDarkGrey mb-2">
                  Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full border border-evolGrey px-4 py-3 focus:outline-none focus:border-evolRed"
                />
                {errors.name && (
                  <p className="text-evolRed text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-evolDarkGrey mb-2">
                  Email *
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full border border-evolGrey px-4 py-3 focus:outline-none focus:border-evolRed"
                />
                {errors.email && (
                  <p className="text-evolRed text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-evolDarkGrey mb-2">
                  Phone (10-digit Indian mobile) *
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="9876543210"
                  className="w-full border border-evolGrey px-4 py-3 focus:outline-none focus:border-evolRed"
                />
                {errors.phone && (
                  <p className="text-evolRed text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Requirement */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-evolDarkGrey mb-2">
                  Describe Your Vision * (Min 20 characters)
                </label>
                <textarea
                  {...register("requirement")}
                  rows={6}
                  placeholder="Tell us about the piece you envision. What's the occasion? What style resonates with you? Any specific details you have in mind?"
                  className="w-full border border-evolGrey px-4 py-3 focus:outline-none focus:border-evolRed resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.requirement && (
                      <p className="text-evolRed text-xs">
                        {errors.requirement.message}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-evolMetallic">
                    {requirementText.length} / 2000
                  </p>
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-evolDarkGrey mb-2">
                  Budget Range (Optional)
                </label>
                <select
                  {...register("budgetRange")}
                  className="w-full border border-evolGrey px-4 py-3 focus:outline-none focus:border-evolRed bg-white"
                >
                  <option value="">Select budget range</option>
                  <option value="under_50k">Under ₹50,000</option>
                  <option value="50k_1l">₹50,000 - ₹1,00,000</option>
                  <option value="1l_3l">₹1,00,000 - ₹3,00,000</option>
                  <option value="3l_5l">₹3,00,000 - ₹5,00,000</option>
                  <option value="above_5l">Above ₹5,00,000</option>
                </select>
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-evolDarkGrey mb-2">
                  Occasion (Optional)
                </label>
                <select
                  {...register("occasion")}
                  className="w-full border border-evolGrey px-4 py-3 focus:outline-none focus:border-evolRed bg-white"
                >
                  <option value="">Select occasion</option>
                  <option value="engagement">Engagement</option>
                  <option value="wedding">Wedding</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="birthday">Birthday</option>
                  <option value="self">Self</option>
                  <option value="gift">Gift</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-evolDarkGrey mb-2">
                  Timeline (Optional)
                </label>
                <input
                  {...register("timeline")}
                  type="text"
                  placeholder="e.g., 'Needed by June 2026' or 'No rush'"
                  className="w-full border border-evolGrey px-4 py-3 focus:outline-none focus:border-evolRed"
                />
              </div>

              {/* Reference Image Upload */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-evolDarkGrey mb-2">
                  Reference Image (Optional)
                </label>
                {uploadedImageUrl ? (
                  <div className="relative w-full h-48 border border-evolGrey">
                    <Image
                      src={uploadedImageUrl}
                      alt="Reference"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-evolRed text-white p-2 rounded-full hover:bg-evolDarkGrey transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full border-2 border-dashed border-evolGrey p-6 md:p-12 text-center cursor-pointer hover:border-evolRed transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        {/* Circular Progress Loader */}
                        <div className="relative w-20 h-20 mb-3">
                          <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 100 100"
                          >
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              stroke="#EEEEEE"
                              strokeWidth="8"
                              fill="none"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              stroke="#9F0B10"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 42}`}
                              strokeDashoffset={`${2 * Math.PI * 42 * (1 - uploadProgress / 100)}`}
                              strokeLinecap="round"
                              className="transition-all duration-300"
                            />
                          </svg>
                          {/* Percentage text - centered in circle */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-sans font-bold text-evol-dark-grey">
                              {uploadProgress}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-evol-metallic font-sans">
                          Uploading...
                        </p>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-8 h-8 mx-auto mb-2 text-evolMetallic" />
                        <p className="text-sm text-evolMetallic">
                          Click to upload a reference image
                        </p>
                        <p className="text-xs text-evolMetallic mt-1">
                          JPG, PNG, WEBP, HEIC (Max 10MB)
                        </p>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitInquiry.isPending}
                className="w-full bg-evolRed text-white py-4 text-sm uppercase tracking-wider hover:bg-evolDarkGrey transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitInquiry.isPending ? "Submitting..." : "Submit Inquiry"}
              </button>

              {submitInquiry.isError && (
                <p className="text-evolRed text-sm text-center">
                  {submitInquiry.error.message ||
                    "Failed to submit inquiry. Please try again."}
                </p>
              )}
            </motion.form>
          )}
        </div>
      </section>

      {/* Section 6: FAQ Accordion */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl text-center text-evolDarkGrey mb-12"
          >
            Frequently Asked Questions
          </motion.h2>

          <Accordion.Root type="single" collapsible className="space-y-4">
            <Accordion.Item value="item-1" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  How much does bespoke jewellery cost?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                It depends entirely on materials, complexity, and size. A simple
                gold band might start around ₹30,000. A custom engagement ring
                with stones can range from ₹1,00,000 to ₹10,00,000+. We'll
                provide a detailed quote after understanding your requirements.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-2" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  How long does the process take?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Typically 4-8 weeks from final design approval to delivery. Rush
                orders may be possible depending on complexity. We'll give you a
                realistic timeline upfront.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-3" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Can I use my own stones or gold?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Yes. We can work with heirloom stones or gold you provide. Our
                artisan will assess their condition and advise if they're
                suitable for your design.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-4" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Do I need to visit your store?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Not necessarily. We can manage the entire process remotely via
                video calls, emails, and couriered samples. However, an
                in-person consultation in Hyderabad can be helpful for complex
                projects.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-5" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  What if I don't like the final piece?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                We work through multiple approval stages (sketches, 3D renders,
                material selection) to ensure alignment before crafting begins.
                If there's an issue with craftsmanship, we'll make it right. If
                it's a design preference change, we can discuss modifications
                (additional costs may apply).
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-6" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Can I see progress photos during crafting?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Absolutely. We'll share updates at key milestones-metal casting,
                stone setting, finishing-so you can see your piece come to life.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-7" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Do you offer warranties on bespoke pieces?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Yes. All bespoke pieces come with a 1-year warranty covering
                craftsmanship defects. We also offer lifetime polishing and
                maintenance services.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-8" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Can I make changes after the design is approved?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Minor tweaks are usually possible before crafting begins. Once
                production starts, changes become difficult and may incur extra
                costs. That's why we're thorough during the design phase.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-9" className="border-b border-evolGrey">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  What payment terms do you offer?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Typically 50% upfront to begin, 50% before delivery. For
                high-value pieces, we can discuss customized payment plans.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item
              value="item-10"
              className="border-b border-evolGrey"
            >
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Do you ship internationally?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Yes, we ship worldwide via insured courier. International
                customers are responsible for customs duties and taxes in their
                country.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item
              value="item-11"
              className="border-b border-evolGrey"
            >
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Can I resize or modify the piece later?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Most pieces can be resized or adjusted. Complex designs may have
                limitations. We offer aftercare services including resizing,
                re-plating, and stone replacement.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item
              value="item-12"
              className="border-b border-evolGrey"
            >
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  What's the difference between bespoke and customization?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Customization means tweaking an existing design (changing stone
                size, metal type, engraving). Bespoke means creating something
                entirely new from scratch, designed specifically for you.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item
              value="item-13"
              className="border-b border-evolGrey"
            >
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  I have a vague idea. Can you help develop it?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                Yes. Many clients start with just a feeling or a loose concept.
                We'll ask questions, show references, and guide you toward
                clarity. You don't need to have everything figured out.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item
              value="item-14"
              className="border-b border-evolGrey"
            >
              <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                <span className="font-medium text-evolDarkGrey group-hover:text-evolRed transition-colors">
                  Is there a consultation fee?
                </span>
                <Plus className="w-5 h-5 text-evolMetallic group-data-[state=open]:rotate-45 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4 text-evolMetallic leading-relaxed">
                No. Initial consultations and design discussions are
                complimentary. We only charge once you decide to proceed with
                the project.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
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
            {/* Instagram Icon/Logo Area */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-evolRed to-evolDarkGrey flex items-center justify-center">
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
              Follow Our Story
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
              Behind-the-scenes glimpses of our bespoke process, new
              collections, and the artistry that goes into every piece. Join our
              community of collectors and connoisseurs.
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

            {/* Optional: Social Proof */}
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
                  500+
                </p>
                <p className="text-xs uppercase tracking-wider text-evolMetallic">
                  Bespoke Pieces
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
