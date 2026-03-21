"use client";

import { useEffect, useRef } from "react";
import { FlyingItem } from "@/hooks/useFlyToCartAnimation";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ParticleCanvasProps {
  items: FlyingItem[];
}

export default function ParticleCanvas({ items }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size to match viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = now;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Emit particles along flight paths
      items.forEach((item) => {
        const age = now - item.timestamp;
        const progress = Math.min(age / 850, 1); // 850ms flight duration (matches portal)

        if (progress < 0.85) {
          // Only emit particles during first 85% of flight
          // Calculate current position along bezier curve (matches FlyToCartPortal)
          const controlX = item.startX + (item.endX - item.startX) * 0.4;
          const controlY =
            Math.min(item.startY, item.endY) -
            Math.abs(item.startY - item.endY) * 0.2 -
            60;

          const t = progress;
          const x =
            (1 - t) * (1 - t) * item.startX +
            2 * (1 - t) * t * controlX +
            t * t * item.endX;
          const y =
            (1 - t) * (1 - t) * item.startY +
            2 * (1 - t) * t * controlY +
            t * t * item.endY;

          // Emit 1-2 particles per frame
          if (Math.random() > 0.7) {
            const colors = ["#DAA520", "#FFD700", "#FFFFFF"];
            particlesRef.current.push({
              x,
              y,
              vx: (Math.random() - 0.5) * 30,
              vy: (Math.random() - 0.5) * 30 - 20, // Drift upward
              life: 1,
              maxLife: 1,
              size: Math.random() * 3 + 1,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }
        }
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update particle
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        particle.life -= deltaTime;

        // Draw particle
        if (particle.life > 0) {
          const alpha = particle.life / particle.maxLife;
          ctx.save();
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Draw glow
          ctx.save();
          ctx.globalAlpha = alpha * 0.3;
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 3,
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          return true;
        }
        return false;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [items]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-9998"
      style={{ isolation: "isolate" }}
    />
  );
}
