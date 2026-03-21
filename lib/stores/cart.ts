import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export interface CartItem {
  id: string; // UUID for this cart entry
  productId: string;
  productVariantId: string;
  name: string;
  image: string | null;
  variantLabel?: string; // e.g., "18K Yellow Gold"
  price: number;
  quantity: number;
  isCustomizable?: boolean;
  customizations?: {
    engraving?: string;
    specialInstructions?: string;
  };
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;

  // Selectors
  itemCount: () => number;
  subtotal: () => number;
  getItem: (cartItemId: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) => {
        // Check if the same product variant already exists
        const existingItem = get().items.find(
          (i) => i.productVariantId === item.productVariantId
        );

        if (existingItem) {
          // If it exists, increase quantity
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }));
        } else {
          // Add new item with quantity 1
          set((state) => ({
            items: [
              ...state.items,
              {
                ...item,
                id: nanoid(),
                quantity: 1,
              },
            ],
          }));
        }
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      openDrawer: () => {
        set({ isDrawerOpen: true });
      },

      closeDrawer: () => {
        set({ isDrawerOpen: false });
      },

      itemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItem: (cartItemId) => {
        return get().items.find((item) => item.id === cartItemId);
      },
    }),
    {
      name: "evol-cart",
    }
  )
);
