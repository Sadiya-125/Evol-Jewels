import { useState, useCallback, useRef, useEffect } from "react";

export interface FlyingItem {
  id: string;
  imageSrc: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  timestamp: number;
}

export function useFlyToCartAnimation() {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartBounce, setCartBounce] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prefersReducedMotion = useRef(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Initialize audio element lazily
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/ring-drop.mp3");
      audioRef.current.volume = 0.4; // Subtle volume
    }
    return audioRef.current;
  }, []);

  // Play the ring drop sound effect
  const playSound = useCallback(() => {
    if (prefersReducedMotion.current) return;

    try {
      const audio = getAudio();
      // Reset to start if already playing
      audio.currentTime = 0;
      audio.play().catch((error) => {
        // Browsers may block autoplay, silently fail
        console.warn("Audio playback failed:", error);
      });
    } catch (error) {
      console.warn("Failed to play sound", error);
    }
  }, [getAudio]);

  // Trigger cart bounce animation
  const triggerCartBounce = useCallback(() => {
    if (prefersReducedMotion.current) return;

    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 600);
  }, []);

  // Start fly-to-cart animation
  const startAnimation = useCallback(
    (imageSrc: string, startElement: HTMLElement, cartElement: HTMLElement) => {
      if (prefersReducedMotion.current) {
        // Skip animation, just trigger cart bounce and sound
        triggerCartBounce();
        playSound();
        return;
      }

      const startRect = startElement.getBoundingClientRect();
      const cartRect = cartElement.getBoundingClientRect();

      const item: FlyingItem = {
        id: `${Date.now()}-${Math.random()}`,
        imageSrc,
        startX: startRect.left + startRect.width / 2,
        startY: startRect.top + startRect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
        timestamp: Date.now(),
      };

      setFlyingItems((prev) => [...prev, item]);

      // Trigger cart bounce and play sound when item reaches the cart (at 850ms)
      setTimeout(() => {
        triggerCartBounce();
        playSound();
      }, 850);

      // Remove flying item after animation completes
      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((i) => i.id !== item.id));
      }, 1800);
    },
    [playSound, triggerCartBounce]
  );

  return {
    flyingItems,
    cartBounce,
    startAnimation,
  };
}
