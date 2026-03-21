"use client";

import { useState, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/stores/cart";
import { useFlyToCart } from "@/components/animations/FlyToCartProvider";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  productVariantId: string;
  name: string;
  image: string | null;
  variantLabel?: string;
  price: number;
  variant?: "primary" | "secondary";
  className?: string;
  isCustomizable?: boolean;
}

export default function AddToCartButton({
  productId,
  productVariantId,
  name,
  image,
  variantLabel = "",
  price,
  variant = "primary",
  className,
  isCustomizable = false,
}: AddToCartButtonProps) {
  const { addItem, openDrawer } = useCartStore();
  const { startAnimation } = useFlyToCart();
  const [isAdding, setIsAdding] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    // Trigger fly-to-cart animation with sparkles
    const cartIcon = document.querySelector("[data-cart-icon]") as HTMLElement;
    if (buttonRef.current && cartIcon && image) {
      startAnimation(image, buttonRef.current, cartIcon);
    }

    addItem({
      productId,
      productVariantId,
      name,
      image,
      variantLabel,
      price,
      isCustomizable,
    });

    setTimeout(() => {
      setIsAdding(false);
      openDrawer();
    }, 900); // Wait for animation to complete
  };

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      onClick={handleAddToCart}
      className={className}
      disabled={isAdding}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
    </Button>
  );
}
