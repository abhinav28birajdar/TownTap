// FILE: src/context/CartContext.tsx
// PURPOSE: Shopping cart state management with local persistence and Supabase sync

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CartItem, Product, Service } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  addToCart: (item: Product | Service, quantity?: number, customizations?: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  getCartForBusiness: (businessId: string) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

const CART_STORAGE_KEY = 'cart_items';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Load cart from storage on app start
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    // Sync cart when user authentication changes
    if (isAuthenticated && user) {
      syncCart();
    } else if (!isAuthenticated) {
      // Keep cart locally but don't sync
    }
  }, [isAuthenticated, user]);

  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCartToStorage = async (cartItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const syncCart = async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Get cart from Supabase
      const { data: cloudCart, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error syncing cart:', error);
        return;
      }

      // If cloud cart exists, merge with local cart
      if (cloudCart && cloudCart.length > 0) {
        // Simple merge strategy: cloud takes precedence
        const mergedCart = cloudCart.map(item => ({
          id: item.id,
          productId: item.product_id,
          serviceId: item.service_id,
          businessId: item.business_id,
          name: item.name || 'Unknown Item',
          quantity: item.quantity,
          unit: item.unit || 'pcs',
          customizations: item.customizations,
          price: item.price,
          addedAt: new Date(item.created_at),
          product: null, // Will be populated when needed
          service: null, // Will be populated when needed
        }));
        
        setItems(mergedCart);
        await saveCartToStorage(mergedCart);
      } else {
        // Upload local cart to cloud
        if (items.length > 0) {
          const cartData = items.map(item => ({
            user_id: user.id,
            product_id: item.productId,
            service_id: item.serviceId,
            business_id: item.businessId,
            quantity: item.quantity,
            customizations: item.customizations,
            price: item.price,
          }));

          const { error: uploadError } = await supabase
            .from('cart_items')
            .insert(cartData);

          if (uploadError) {
            console.error('Error uploading cart to cloud:', uploadError);
          }
        }
      }
    } catch (error) {
      console.error('Error in syncCart:', error);
    }
  };

  const addToCart = async (item: Product | Service, quantity: number = 1, customizations?: any) => {
    try {
      const existingItemIndex = items.findIndex(cartItem => 
        (cartItem.productId === item.id || cartItem.serviceId === item.id) &&
        JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...items];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const newCartItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random()}`,
          productId: 'price' in item ? item.id : undefined,
          serviceId: 'hourly_rate' in item ? item.id : undefined,
          businessId: item.business_id,
          name: item.name,
          quantity,
          unit: 'price' in item ? (item.unit || 'pcs') : 'hour',
          customizations: customizations || {},
          price: 'price' in item ? item.price : item.hourly_rate,
          addedAt: new Date(),
          product: 'price' in item ? item : null,
          service: 'hourly_rate' in item ? item : null,
        };

        newItems = [...items, newCartItem];
      }

      setItems(newItems);
      await saveCartToStorage(newItems);

      // Sync to cloud if authenticated
      if (isAuthenticated && user) {
        const cartData = {
          user_id: user.id,
          product_id: 'price' in item ? item.id : null,
          service_id: 'hourly_rate' in item ? item.id : null,
          business_id: item.business_id,
          quantity,
          customizations: customizations || {},
          price: 'price' in item ? item.price : item.hourly_rate,
        };

        if (existingItemIndex >= 0) {
          // Update existing item in cloud
          await supabase
            .from('cart_items')
            .update({ quantity: newItems[existingItemIndex].quantity })
            .eq('user_id', user.id)
            .eq('product_id', cartData.product_id)
            .eq('service_id', cartData.service_id);
        } else {
          // Insert new item to cloud
          await supabase
            .from('cart_items')
            .insert(cartData);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const newItems = items.filter(item => item.id !== itemId);
      setItems(newItems);
      await saveCartToStorage(newItems);

      // Remove from cloud if authenticated
      if (isAuthenticated && user) {
        const itemToRemove = items.find(item => item.id === itemId);
        if (itemToRemove) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', itemToRemove.productId)
            .eq('service_id', itemToRemove.serviceId);
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const newItems = items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );

      setItems(newItems);
      await saveCartToStorage(newItems);

      // Update cloud if authenticated
      if (isAuthenticated && user) {
        const item = items.find(item => item.id === itemId);
        if (item) {
          await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('user_id', user.id)
            .eq('product_id', item.productId)
            .eq('service_id', item.serviceId);
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      setItems([]);
      await saveCartToStorage([]);

      // Clear cloud cart if authenticated
      if (isAuthenticated && user) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartForBusiness = (businessId: string): CartItem[] => {
    return items.filter(item => item.businessId === businessId);
  };

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value: CartContextType = {
    items,
    totalItems,
    totalAmount,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCart,
    getCartForBusiness,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
