"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircleCheck, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import Button from "@/components/ui/Button";
import { trpc } from "@/lib/trpc/client";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const { data: order, isLoading } = trpc.orders.byId.useQuery({ id: orderId });

  // EVOL-branded confetti animation on mount
  useEffect(() => {
    if (order) {
      // EVOL brand colors
      const evolColors = [
        "#9F0B10",
        "#DAA520",
        "#FFD700",
        "#FFFFFF",
        "#666666",
      ];

      const defaults = {
        spread: 360,
        ticks: 100,
        gravity: 0.8,
        decay: 0.94,
        startVelocity: 30,
        colors: evolColors,
      };

      const shoot = () => {
        confetti({
          ...defaults,
          particleCount: 40,
          scalar: 1.2,
          shapes: ["star"],
          origin: {
            x: Math.random() * 0.4 + 0.3,
            y: Math.random() * 0.2 + 0.2,
          },
        });

        confetti({
          ...defaults,
          particleCount: 25,
          scalar: 0.85,
          shapes: ["circle"],
          origin: {
            x: Math.random() * 0.4 + 0.3,
            y: Math.random() * 0.2 + 0.3,
          },
        });
      };

      // Initial bursts
      shoot();
      setTimeout(shoot, 150);
      setTimeout(shoot, 300);

      // Additional celebratory bursts
      setTimeout(shoot, 600);
      setTimeout(shoot, 900);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-evol-off-white">
        <p className="font-body text-evol-metallic">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-evol-off-white">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-evol-dark-grey mb-4">
            Order Not Found
          </h1>
          <Button variant="secondary" onClick={() => router.push("/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evol-off-white py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkmark Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <CircleCheck
              className="w-16 h-16 text-evol-red"
              strokeWidth={1.5}
            />
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-4xl md:text-5xl text-evol-dark-grey mb-4">
            Order Placed.
          </h1>
          <p className="font-body text-lg text-evol-metallic mb-6">
            We've received your order and will be in touch soon.
          </p>

          {/* Order Number Pill */}
          <div className="inline-flex items-center justify-center px-6 py-3 bg-evol-light-grey border border-evol-grey rounded-full">
            <span className="font-sans text-sm font-mono text-evol-dark-grey">
              Order #{order.orderNumber}
            </span>
          </div>
        </motion.div>

        {/* Order Summary Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-white border-2 border-evol-grey mb-6"
        >
          <button
            onClick={() => setShowOrderSummary(!showOrderSummary)}
            className="w-full p-6 flex items-center justify-between hover:bg-evol-off-white transition-colors"
          >
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-evol-dark-grey">
              Order Summary
            </h2>
            <ChevronDown
              className={`w-5 h-5 text-evol-dark-grey transition-transform ${
                showOrderSummary ? "rotate-180" : ""
              }`}
            />
          </button>

          {showOrderSummary && (
            <div className="p-6 pt-5 space-y-4 border-t border-evol-grey">
              {/* Order Items */}
              {order.items.map((item) => (
                <div key={item.orderItem.id} className="flex gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-evol-light-grey rounded overflow-hidden">
                    {item.product?.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name || "Product"}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-evol-grey text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-sans text-sm text-evol-dark-grey mb-1">
                      {item.product?.name || "Product"}
                    </h3>
                    <p className="font-body text-xs text-evol-metallic mb-1">
                      Quantity: {item.orderItem.quantity}
                    </p>
                    <p className="font-sans text-sm font-semibold text-evol-dark-grey">
                      ₹
                      {parseFloat(item.orderItem.subtotal).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t border-evol-grey pt-4 space-y-2">
                <div className="flex items-center justify-between font-body text-sm">
                  <span className="text-evol-metallic">Subtotal</span>
                  <span className="text-evol-dark-grey">
                    ₹{parseFloat(order.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between font-body text-sm">
                  <span className="text-evol-metallic">Tax</span>
                  <span className="text-evol-dark-grey">
                    ₹{parseFloat(order.tax).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between font-body text-sm">
                  <span className="text-evol-metallic">Shipping</span>
                  <span className="text-evol-dark-grey">
                    {parseFloat(order.shippingCost) === 0
                      ? "Free"
                      : `₹${parseFloat(order.shippingCost).toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="flex items-center justify-between font-sans text-lg font-bold pt-2 border-t border-evol-grey">
                  <span className="text-evol-dark-grey">Total</span>
                  <span className="text-evol-dark-grey">
                    ₹{parseFloat(order.total).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Delivery Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="bg-white border-2 border-evol-grey p-6 mb-8"
        >
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-evol-dark-grey mb-4">
            Delivery Address
          </h2>
          <div className="font-body text-sm text-evol-dark-grey space-y-1">
            <p className="font-semibold">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && (
              <p>{order.shippingAddress.line2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.pinCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/shop" className="flex-1">
            <Button variant="primary" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/account/orders" className="flex-1">
            <Button variant="secondary" className="w-full">
              View All Orders
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
