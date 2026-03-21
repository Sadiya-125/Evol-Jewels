import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  productVariantId: string;
  name: string;
  image: string | null;
  price: number;
  variantLabel?: string;
  addedAt: number;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productVariantId: string) => void;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  isInWishlist: (productVariantId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const exists = get().items.some((i) => i.productVariantId === item.productVariantId);
        if (!exists) {
          set((state) => ({
            items: [...state.items, { ...item, addedAt: Date.now() }],
          }));
        }
      },

      removeItem: (productVariantId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productVariantId !== productVariantId),
        }));
      },

      toggleItem: (item) => {
        const exists = get().items.some((i) => i.productVariantId === item.productVariantId);
        if (exists) {
          get().removeItem(item.productVariantId);
        } else {
          get().addItem(item);
        }
      },

      isInWishlist: (productVariantId: string) => {
        return get().items.some((item) => item.productVariantId === productVariantId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "evol-wishlist",
    }
  )
);
