"use client";

import { createContext, useContext, ReactNode } from "react";
import { useFlyToCartAnimation } from "@/hooks/useFlyToCartAnimation";
import FlyToCartPortal from "./FlyToCartPortal";
import ParticleCanvas from "./ParticleCanvas";

interface FlyToCartContextValue {
  startAnimation: (
    imageSrc: string,
    startElement: HTMLElement,
    cartElement: HTMLElement
  ) => void;
  cartBounce: boolean;
}

const FlyToCartContext = createContext<FlyToCartContextValue | null>(null);

export function useFlyToCart() {
  const context = useContext(FlyToCartContext);
  if (!context) {
    throw new Error("useFlyToCart must be used within FlyToCartProvider");
  }
  return context;
}

interface FlyToCartProviderProps {
  children: ReactNode;
}

export default function FlyToCartProvider({ children }: FlyToCartProviderProps) {
  const { flyingItems, cartBounce, startAnimation } = useFlyToCartAnimation();

  return (
    <FlyToCartContext.Provider value={{ startAnimation, cartBounce }}>
      {children}
      <FlyToCartPortal items={flyingItems} />
      <ParticleCanvas items={flyingItems} />
    </FlyToCartContext.Provider>
  );
}
