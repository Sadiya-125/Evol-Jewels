"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FlyingItem } from "@/hooks/useFlyToCartAnimation";

interface FlyToCartPortalProps {
  items: FlyingItem[];
}

// Generate points along a quadratic bezier curve for smooth animation
function generateBezierPoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  steps: number = 8,
): { x: number[]; y: number[]; times: number[] } {
  // Control point - creates a smooth arc toward the cart
  // Position it closer to the end point for a natural "falling into cart" feel
  const controlX = startX + (endX - startX) * 0.4;
  const controlY = Math.min(startY, endY) - Math.abs(startY - endY) * 0.2 - 60;

  const xPoints: number[] = [];
  const yPoints: number[] = [];
  const times: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier formula
    const x =
      (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
    const y =
      (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

    // Adjust position for element size (shrinks from 80px to 20px)
    const size = 80 - 60 * t;
    xPoints.push(x - size / 2);
    yPoints.push(y - size / 2);
    times.push(t);
  }

  return { x: xPoints, y: yPoints, times };
}

export default function FlyToCartPortal({ items }: FlyToCartPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 pointer-events-none z-9999"
      style={{ isolation: "isolate" }}
    >
      <AnimatePresence>
        {items.map((item) => {
          // Generate smooth bezier curve path
          const path = generateBezierPoints(
            item.startX,
            item.startY,
            item.endX,
            item.endY,
            8,
          );

          // Generate size and opacity arrays matching path length
          const sizes = path.times.map((t) => 80 - 60 * t);
          const scales = path.times.map((t) => 1 - 0.75 * t);
          const opacities = path.times.map((t) =>
            t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15,
          );
          const rotations = path.times.map((t) => t * 15);
          const blurs = path.times.map((t) => `blur(${t * 2}px)`);

          return (
            <motion.div
              key={item.id}
              initial={{
                position: "fixed",
                left: item.startX - 40,
                top: item.startY - 40,
                width: 80,
                height: 80,
                opacity: 1,
                scale: 1,
                rotate: 0,
                filter: "blur(0px)",
              }}
              animate={{
                left: path.x,
                top: path.y,
                width: sizes,
                height: sizes,
                scale: scales,
                rotate: rotations,
                opacity: opacities,
                filter: blurs,
              }}
              transition={{
                duration: 0.85,
                ease: [0.25, 0.1, 0.25, 1], // Smooth ease-out curve
                times: path.times,
              }}
              exit={{ opacity: 0 }}
            >
              {/* Golden Halo Behind */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(218,165,32,0.4) 0%, rgba(218,165,32,0) 70%)",
                }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 0.6, 0] }}
                transition={{ duration: 0.5, times: [0, 0.3, 1] }}
              />

              {/* Product Image */}
              <motion.div
                className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl"
                style={{
                  border: "2px solid #DAA520",
                  boxShadow: "0 8px 32px rgba(218, 165, 32, 0.3)",
                }}
                initial={{ boxShadow: "0 4px 16px rgba(218, 165, 32, 0.2)" }}
                animate={{ boxShadow: "0 12px 48px rgba(218, 165, 32, 0.4)" }}
              >
                <img
                  src={item.imageSrc}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Lift Phase Glow */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 0] }}
                transition={{ duration: 0.18 }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
