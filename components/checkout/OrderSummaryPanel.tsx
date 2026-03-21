"use client";

import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/lib/stores/cart";
import { trpc } from "@/lib/trpc/client";
import Button from "@/components/ui/Button";

interface OrderSummaryPanelProps {
  sticky?: boolean;
}

export default function OrderSummaryPanel({ sticky = false }: OrderSummaryPanelProps) {
  const { items } = useCartStore();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");

  // Fetch product details for each cart item to get making_charges and gst
  const productIds = [...new Set(items.map((item) => item.productId))];

  // Simplified: just use base prices from cart
  // In a real app, you'd fetch product details to get making_charges and gst
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  // For now, use fixed values - in real implementation, fetch from products
  const makingCharges = subtotal * 0.05; // Assume 5% making charges
  const gst = (subtotal + makingCharges) * 0.03; // 3% GST
  const shipping = subtotal + makingCharges >= 10000 ? 0 : 199;
  const total = subtotal + makingCharges + gst + shipping;

  const handleApplyPromo = () => {
    // For Phase 1, always show invalid
    setPromoError("Invalid code");
  };

  return (
    <div className={`bg-white border-2 border-evol-grey ${sticky ? "lg:sticky lg:top-24" : ""}`}>
      <div className="p-6 md:p-8">
        {/* Heading */}
        <h2 className="font-sans text-xs uppercase tracking-widest text-evol-metallic mb-6">
          Order Summary
        </h2>

        {/* Items List */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              {/* Thumbnail with quantity badge */}
              <div className="relative w-12 h-12 shrink-0">
                <div className="relative w-full h-full bg-evol-light-grey rounded overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-evol-grey text-xs">
                      No image
                    </div>
                  )}
                </div>
                {/* Quantity badge - positioned outside overflow-hidden container */}
                <div className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-evol-red text-white text-[10px] flex items-center justify-center font-sans font-bold shadow-sm">
                  {item.quantity}
                </div>
              </div>

              {/* Item details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-sans text-sm text-evol-dark-grey line-clamp-2 mb-1">
                  {item.name}
                </h3>
                <p className="font-body text-xs text-evol-metallic mb-1">
                  {item.variantLabel}
                </p>
                <p className="font-sans text-sm font-semibold text-evol-dark-grey">
                  {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-evol-grey my-6" />

        {/* Price breakdown */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between font-body text-sm">
            <span className="text-evol-metallic">Subtotal</span>
            <span className="text-evol-dark-grey">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between font-body text-sm">
            <span className="text-evol-metallic">Making Charges</span>
            <span className="text-evol-dark-grey">₹{makingCharges.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between font-body text-sm">
            <span className="text-evol-metallic">GST (3%)</span>
            <span className="text-evol-dark-grey">₹{gst.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between font-body text-sm">
            <span className="text-evol-metallic">Shipping</span>
            <span className="text-evol-dark-grey">
              {shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-evol-grey pt-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-sm font-bold uppercase tracking-wider text-evol-dark-grey">
              Total
            </span>
            <span className="font-sans text-lg font-bold text-evol-dark-grey">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* GST note */}
        <p className="font-body text-[11px] text-evol-metallic mb-6">
          All prices inclusive of 3% GST on gold value
        </p>

        {/* Promo code */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoError("");
              }}
              placeholder="Promo code"
              className="flex-1 px-4 py-2 border border-evol-grey font-body text-sm text-evol-dark-grey placeholder:text-evol-grey focus:outline-none focus:border-evol-dark-grey"
            />
            <Button variant="secondary" onClick={handleApplyPromo}>
              Apply
            </Button>
          </div>
          {promoError && (
            <p className="font-body text-xs text-evol-red">{promoError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
