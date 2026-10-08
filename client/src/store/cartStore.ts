import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartAddOn {
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique item instance id
  menuItemId: string;
  name: string;
  price: number; // base price
  quantity: number;
  variantName?: string;
  variantPrice?: number;
  addOns?: CartAddOn[];
  itemUnitPrice: number; // base + variant + addOns
  totalPrice: number; // itemUnitPrice * quantity
  notes?: string;
  image?: string;
}

interface CartStore {
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  items: CartItem[];
  coupon: {
    id?: string;
    code: string;
    discountAmount: number;
  } | null;
  isCartOpen: boolean;

  // Actions
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    restaurant: { id: string; name: string; deliveryFee: number },
    item: {
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      variantName?: string;
      variantPrice?: number;
      addOns?: CartAddOn[];
      notes?: string;
      image?: string;
    }
  ) => boolean; // returns false if prompt needed for diff restaurant
  replaceCartAndAdd: (
    restaurant: { id: string; name: string; deliveryFee: number },
    item: any
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  applyCoupon: (coupon: { id?: string; code: string; discountAmount: number }) => void;
  removeCoupon: () => void;
  clearCart: () => void;

  // Computed
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      deliveryFee: 0,
      items: [],
      coupon: null,
      isCartOpen: false,

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addItem: (restaurant, itemData) => {
        const { restaurantId, items } = get();

        // Single restaurant constraint check
        if (restaurantId && restaurantId !== restaurant.id && items.length > 0) {
          return false; // requires confirmation to clear cart first
        }

        const basePrice = itemData.variantPrice ?? itemData.price;
        const addOnsCost = (itemData.addOns || []).reduce((acc, a) => acc + a.price, 0);
        const itemUnitPrice = basePrice + addOnsCost;
        const totalPrice = itemUnitPrice * itemData.quantity;

        // Create unique ID for item configuration
        const addOnsKey = (itemData.addOns || []).map((a) => a.name).sort().join(',');
        const instanceId = `${itemData.menuItemId}-${itemData.variantName || 'default'}-${addOnsKey}`;

        const existingIndex = items.findIndex((i) => i.id === instanceId);
        let updatedItems = [...items];

        if (existingIndex > -1) {
          const existing = updatedItems[existingIndex];
          const newQty = existing.quantity + itemData.quantity;
          updatedItems[existingIndex] = {
            ...existing,
            quantity: newQty,
            totalPrice: existing.itemUnitPrice * newQty,
          };
        } else {
          updatedItems.push({
            id: instanceId,
            menuItemId: itemData.menuItemId,
            name: itemData.name,
            price: itemData.price,
            quantity: itemData.quantity,
            variantName: itemData.variantName,
            variantPrice: itemData.variantPrice,
            addOns: itemData.addOns,
            itemUnitPrice,
            totalPrice,
            notes: itemData.notes,
            image: itemData.image,
          });
        }

        set({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          deliveryFee: restaurant.deliveryFee,
          items: updatedItems,
        });

        return true;
      },

      replaceCartAndAdd: (restaurant, itemData) => {
        set({ items: [], coupon: null });
        get().addItem(restaurant, itemData);
      },

      removeItem: (id) => {
        const updated = get().items.filter((i) => i.id !== id);
        if (updated.length === 0) {
          set({ items: [], restaurantId: null, restaurantName: null, coupon: null });
        } else {
          set({ items: updated });
        }
      },

      updateQuantity: (id, delta) => {
        const updated = get().items
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              if (newQty <= 0) return null;
              return {
                ...item,
                quantity: newQty,
                totalPrice: item.itemUnitPrice * newQty,
              };
            }
            return item;
          })
          .filter(Boolean) as CartItem[];

        if (updated.length === 0) {
          set({ items: [], restaurantId: null, restaurantName: null, coupon: null });
        } else {
          set({ items: updated });
        }
      },

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      clearCart: () =>
        set({
          restaurantId: null,
          restaurantName: null,
          deliveryFee: 0,
          items: [],
          coupon: null,
        }),

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.totalPrice, 0);
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        return Math.round(subtotal * 0.05); // 5% tax
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTax();
        const deliveryFee = get().items.length > 0 ? get().deliveryFee : 0;
        const discount = get().coupon?.discountAmount || 0;
        return Math.max(0, Math.round(subtotal + tax + deliveryFee - discount));
      },
    }),
    {
      name: 'foodie_cart_storage',
    }
  )
);
