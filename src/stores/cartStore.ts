import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Service } from '../types';

interface CartItem {
  id: string;
  service: Service; // Changed from 'product' to 'service' to match database
  quantity: number;
  customizations?: Record<string, any>;
  special_instructions?: string;
}

interface CartStore {
  // State
  items: CartItem[];
  businessId: string | null;
  totalAmount: number;
  deliveryCharge: number;
  taxAmount: number;
  discountAmount: number;

  // Actions
  addItem: (service: Service, quantity?: number, customizations?: Record<string, any>, specialInstructions?: string) => void;
  removeItem: (serviceId: string) => void;
  updateItemQuantity: (serviceId: string, quantity: number) => void;
  updateItemCustomizations: (serviceId: string, customizations: Record<string, any>) => void;
  clearCart: () => void;
  calculateTotal: () => void;
  
  // Computed getters
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  canApplyPromotion: (minimumAmount: number) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      businessId: null,
      totalAmount: 0,
      deliveryCharge: 0,
      taxAmount: 0,
      discountAmount: 0,

      // Actions
      addItem: (service: Service, quantity = 1, customizations = {}, specialInstructions = '') => {
        const { items, businessId } = get();
        
        // If cart is empty or same business, allow adding
        if (!businessId || businessId === service.business_id) {
          const existingItemIndex = items.findIndex(item => 
            item.service.id === service.id && 
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
          );
          
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity;
            set({ items: updatedItems });
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${service.id}_${Date.now()}`,
              service,
              quantity,
              customizations,
              special_instructions: specialInstructions,
            };
            set({ 
              items: [...items, newItem],
              businessId: service.business_id,
            });
          }
          get().calculateTotal();
        } else {
          // Different business - clear cart first
          set({
            items: [{
              id: `${service.id}_${Date.now()}`,
              service,
              quantity,
              customizations,
              special_instructions: specialInstructions,
            }],
            businessId: service.business_id,
          });
          get().calculateTotal();
        }
      },

      removeItem: (serviceId: string) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.service.id !== serviceId);
        
        set({ 
          items: updatedItems,
          businessId: updatedItems.length > 0 ? get().businessId : null,
        });
        get().calculateTotal();
      },

      updateItemQuantity: (serviceId: string, quantity: number) => {
        const { items } = get();
        
        if (quantity <= 0) {
          get().removeItem(serviceId);
          return;
        }

        const updatedItems = items.map(item =>
          item.service.id === serviceId 
            ? { ...item, quantity }
            : item
        );
        
        set({ items: updatedItems });
        get().calculateTotal();
      },

      updateItemCustomizations: (serviceId: string, customizations: Record<string, any>) => {
        const { items } = get();
        
        const updatedItems = items.map(item =>
          item.service.id === serviceId 
            ? { ...item, customizations }
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
          taxAmount: 0,
          discountAmount: 0,
        });
      },

      calculateTotal: () => {
        const { items } = get();
        const subtotal = items.reduce((total, item) => {
          const price = item.service.price || 0;
          return total + (price * item.quantity);
        }, 0);

        // Calculate tax (18% GST in India)
        const taxAmount = subtotal * 0.18;
        
        // Calculate delivery charge (free for orders above ₹500)
        const deliveryCharge = subtotal > 500 ? 0 : 50;
        
        // Discount amount (if any promotion applied)
        const discountAmount = 0; // Will be updated when promotions are applied
        
        const totalAmount = subtotal + taxAmount + deliveryCharge - discountAmount;
        
        set({
          totalAmount,
          deliveryCharge,
          taxAmount,
          discountAmount,
        });
      },

      // Computed getters
      getTotalPrice: () => {
        const { totalAmount } = get();
        return totalAmount;
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.service.price || 0;
          return total + (price * item.quantity);
        }, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      canApplyPromotion: (minimumAmount: number) => {
        const subtotal = get().getSubtotal();
        return subtotal >= minimumAmount;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
