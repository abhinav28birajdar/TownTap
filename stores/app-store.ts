import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// App State Interface
interface AppState {
  // App lifecycle
  isInitialized: boolean;
  isLoading: boolean;
  
  // Onboarding
  hasCompletedOnboarding: boolean;
  
  // Settings
  settings: {
    notifications: {
      enabled: boolean;
      push: boolean;
      email: boolean;
      sms: boolean;
    };
    privacy: {
      locationSharing: boolean;
      dataCollection: boolean;
      analytics: boolean;
    };
    preferences: {
      language: string;
      currency: string;
      distanceUnit: 'km' | 'mi';
      timeFormat: '12h' | '24h';
    };
  };
  
  // Network state
  isOnline: boolean;
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  completeOnboarding: () => void;
  updateSettings: <K extends keyof AppState['settings']>(
    section: K, 
    updates: Partial<AppState['settings'][K]>
  ) => void;
  setNetworkStatus: (online: boolean) => void;
  reset: () => void;
}

const initialSettings = {
  notifications: {
    enabled: true,
    push: true,
    email: true,
    sms: false,
  },
  privacy: {
    locationSharing: true,
    dataCollection: true,
    analytics: true,
  },
  preferences: {
    language: 'en',
    currency: 'USD',
    distanceUnit: 'km' as const,
    timeFormat: '12h' as const,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      isLoading: false,
      hasCompletedOnboarding: false,
      settings: initialSettings,
      isOnline: true,
      
      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
      
      updateSettings: (section, updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [section]: {
              ...state.settings[section],
              ...updates,
            },
          },
        }));
      },
      
      setNetworkStatus: (online: boolean) => {
        set({ isOnline: online });
      },
      
      reset: () => {
        set({
          isInitialized: false,
          isLoading: false,
          hasCompletedOnboarding: false,
          settings: initialSettings,
          isOnline: true,
        });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        settings: state.settings,
      }),
    }
  )
);

// Search State Store
interface SearchState {
  query: string;
  filters: {
    category: string | null;
    location: string | null;
    priceRange: [number, number] | null;
    rating: number | null;
    distance: number | null;
    availability: 'now' | 'today' | 'this_week' | null;
  };
  recentSearches: string[];
  
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchState['filters']>) => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      filters: {
        category: null,
        location: null,
        priceRange: null,
        rating: null,
        distance: null,
        availability: null,
      },
      recentSearches: [],
      
      setQuery: (query: string) => {
        set({ query });
      },
      
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      
      addRecentSearch: (search: string) => {
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter((s) => s !== search),
          ].slice(0, 10),
        }));
      },
      
      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },
      
      resetFilters: () => {
        set({
          filters: {
            category: null,
            location: null,
            priceRange: null,
            rating: null,
            distance: null,
            availability: null,
          },
        });
      },
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);

// Navigation State Store
interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  setCurrentRoute: (route: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentRoute: '(tabs)/home',
  previousRoute: null,
  
  setCurrentRoute: (route: string) => {
    set((state) => ({
      currentRoute: route,
      previousRoute: state.currentRoute,
    }));
  },
}));