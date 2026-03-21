"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/stores/cart";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    itemCount,
    subtotal,
  } = useCartStore();

  const count = itemCount();
  const total = subtotal();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-evol-grey">
              <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">
                Shopping Cart ({count})
              </h2>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-evol-light-grey rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-evol-dark-grey" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag className="w-16 h-16 text-evol-grey" />
                  <div>
                    <p className="font-sans text-evol-dark-grey mb-2">
                      Your cart is empty
                    </p>
                    <p className="font-body text-sm text-evol-metallic">
                      Add some beautiful pieces to get started
                    </p>
                  </div>
                  <Button variant="secondary" onClick={closeDrawer}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-evol-off-white rounded"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-evol-grey text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans text-sm font-medium text-evol-dark-grey mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="font-body text-xs text-evol-metallic mb-2">
                        {item.variantLabel}
                      </p>
                      <p className="font-sans text-sm font-semibold text-evol-dark-grey">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center border border-evol-grey rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 hover:bg-evol-light-grey transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 text-evol-dark-grey" />
                          </button>
                          <span className="px-3 py-1 font-sans text-sm text-evol-dark-grey min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-evol-light-grey transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 text-evol-dark-grey" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors ml-auto"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-evol-red" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-evol-grey p-4 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-evol-dark-grey">
                    Subtotal
                  </span>
                  <span className="font-sans text-lg font-semibold text-evol-dark-grey">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="font-body text-xs text-evol-metallic">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={closeDrawer}>
                  <Button variant="primary" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>

                <button
                  onClick={closeDrawer}
                  className="w-full font-sans text-sm text-evol-metallic hover:text-evol-dark-grey transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
