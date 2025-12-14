import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Database } from '../lib/database.types';

type Business = Database['public']['Tables']['businesses']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

// Business State Store
interface BusinessState {
  businesses: Business[];
  favorites: string[];
  currentBusiness: Business | null;
  
  setBusinesses: (businesses: Business[]) => void;
  addBusiness: (business: Business) => void;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  setCurrentBusiness: (business: Business | null) => void;
  toggleFavorite: (businessId: string) => void;
  isFavorite: (businessId: string) => boolean;
  clearBusinesses: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      businesses: [],
      favorites: [],
      currentBusiness: null,
      
      setBusinesses: (businesses: Business[]) => {
        set({ businesses });
      },
      
      addBusiness: (business: Business) => {
        set((state) => ({
          businesses: [business, ...state.businesses],
        }));
      },
      
      updateBusiness: (id: string, updates: Partial<Business>) => {
        set((state) => ({
          businesses: state.businesses.map((business) =>
            business.id === id ? { ...business, ...updates } : business
          ),
        }));
      },
      
      setCurrentBusiness: (business: Business | null) => {
        set({ currentBusiness: business });
      },
      
      toggleFavorite: (businessId: string) => {
        set((state) => ({
          favorites: state.favorites.includes(businessId)
            ? state.favorites.filter((id) => id !== businessId)
            : [...state.favorites, businessId],
        }));
      },
      
      isFavorite: (businessId: string) => {
        return get().favorites.includes(businessId);
      },
      
      clearBusinesses: () => {
        set({ businesses: [], currentBusiness: null });
      },
    }),
    {
      name: 'business-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);

// Booking State Store
interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  selectedServices: Service[];
  bookingForm: {
    serviceIds: string[];
    date: Date | null;
    time: string | null;
    notes: string;
    location: {
      address: string;
      latitude: number;
      longitude: number;
    } | null;
  };
  
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  setSelectedServices: (services: Service[]) => void;
  updateBookingForm: (updates: Partial<BookingState['bookingForm']>) => void;
  resetBookingForm: () => void;
  clearBookings: () => void;
}

const initialBookingForm = {
  serviceIds: [],
  date: null,
  time: null,
  notes: '',
  location: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      currentBooking: null,
      selectedServices: [],
      bookingForm: initialBookingForm,
      
      setBookings: (bookings: Booking[]) => {
        set({ bookings });
      },
      
      addBooking: (booking: Booking) => {
        set((state) => ({
          bookings: [booking, ...state.bookings],
        }));
      },
      
      updateBooking: (id: string, updates: Partial<Booking>) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, ...updates } : booking
          ),
        }));
      },
      
      removeBooking: (id: string) => {
        set((state) => ({
          bookings: state.bookings.filter((booking) => booking.id !== id),
        }));
      },
      
      setCurrentBooking: (booking: Booking | null) => {
        set({ currentBooking: booking });
      },
      
      setSelectedServices: (services: Service[]) => {
        set({ selectedServices: services });
      },
      
      updateBookingForm: (updates) => {
        set((state) => ({
          bookingForm: { ...state.bookingForm, ...updates },
        }));
      },
      
      resetBookingForm: () => {
        set({ bookingForm: initialBookingForm, selectedServices: [] });
      },
      
      clearBookings: () => {
        set({ 
          bookings: [], 
          currentBooking: null,
          selectedServices: [],
          bookingForm: initialBookingForm,
        });
      },
    }),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist form data, only bookings
      partialize: (state) => ({
        bookings: state.bookings,
      }),
    }
  )
);

// Cart State Store (for multi-service bookings)
interface CartItem {
  service: Service;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  
  addItem: (service: Service, quantity?: number) => void;
  removeItem: (serviceId: string) => void;
  updateItemQuantity: (serviceId: string, quantity: number) => void;
  updateItemNotes: (serviceId: string, notes: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  calculateTotal: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  
  addItem: (service: Service, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.service.id === service.id);
      
      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        return { items: updatedItems };
      } else {
        return { items: [...state.items, { service, quantity }] };
      }
    });
    get().calculateTotal();
  },
  
  removeItem: (serviceId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.service.id !== serviceId),
    }));
    get().calculateTotal();
  },
  
  updateItemQuantity: (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(serviceId);
      return;
    }
    
    set((state) => ({
      items: state.items.map((item) =>
        item.service.id === serviceId ? { ...item, quantity } : item
      ),
    }));
    get().calculateTotal();
  },
  
  updateItemNotes: (serviceId: string, notes: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.service.id === serviceId ? { ...item, notes } : item
      ),
    }));
  },
  
  clearCart: () => {
    set({ items: [], total: 0 });
  },
  
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
  
  calculateTotal: () => {
    const total = get().items.reduce(
      (sum, item) => sum + ((item.service.price || 0) * item.quantity),
      0
    );
    set({ total });
  },
}));