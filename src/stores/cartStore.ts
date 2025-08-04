import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartStore {
  // State
  items: CartItem[];
  businessId: string | null;
  totalAmount: number;
  deliveryCharge: number;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
  
  // Computed getters
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      businessId: null,
      totalAmount: 0,
      deliveryCharge: 0,

      // Actions
      addItem: (product: Product, quantity = 1) => {
        const { items, businessId } = get();
        
        // If cart is empty or same business, allow adding
        if (!businessId || businessId === product.business_id) {
          const existingItemIndex = items.findIndex(item => item.product.id === product.id);
          
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity;
            set({ items: updatedItems });
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${product.id}_${Date.now()}`,
              product,
              quantity,
            };
            set({ 
              items: [...items, newItem],
              businessId: product.business_id,
            });
          }
          get().calculateTotal();
        } else {
          // Different business - clear cart first
          set({
            items: [{
              id: `${product.id}_${Date.now()}`,
              product,
              quantity,
            }],
            businessId: product.business_id,
          });
          get().calculateTotal();
        }
      },

      removeItem: (productId: string) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.product.id !== productId);
        
        set({ 
          items: updatedItems,
          businessId: updatedItems.length > 0 ? get().businessId : null,
        });
        get().calculateTotal();
      },

      updateItemQuantity: (productId: string, quantity: number) => {
        const { items } = get();
        
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updatedItems = items.map(item =>
          item.product.id === productId 
            ? { ...item, quantity }
            : item
        );
        
        set({ items: updatedItems });
        get().calculateTotal();
      },

      clearCart: () => {
        set({
          items: [],
          businessId: null,
          totalAmount: 0,
          deliveryCharge: 0,
        });
      },

      calculateTotal: () => {
        const { items } = get();
        const subtotal = items.reduce((total, item) => {
          const price = item.product.discount_price || item.product.price;
          return total + (price * item.quantity);
        }, 0);

        // Calculate delivery charge (example logic)
        const deliveryCharge = subtotal > 500 ? 0 : 50;
        
        set({
          totalAmount: subtotal + deliveryCharge,
          deliveryCharge,
        });
      },

      // Computed getters
      getTotalPrice: () => {
        const { totalAmount } = get();
        return totalAmount;
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
