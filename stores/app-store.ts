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
  
  // Notifications
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: string;
    data?: Record<string, any>;
  }>;
  unreadCount: number;
  
  // Offline queue for API calls
  offlineQueue: Array<{
    id: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    timestamp: string;
    retryCount: number;
  }>;
  
  // Connection status for realtime
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  completeOnboarding: () => void;
  updateSettings: <K extends keyof AppState['settings']>(
    section: K, 
    updates: Partial<AppState['settings'][K]>
  ) => void;
  setNetworkStatus: (online: boolean) => void;
  updateConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
  
  // Notification actions
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  
  // Offline queue actions
  addToOfflineQueue: (request: Omit<AppState['offlineQueue'][0], 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromOfflineQueue: (id: string) => void;
  processOfflineQueue: () => Promise<void>;
  clearOfflineQueue: () => void;
  
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
      notifications: [],
      unreadCount: 0,
      offlineQueue: [],
      connectionStatus: 'disconnected' as const,
      
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
        const wasOffline = !get().isOnline;
        set({ isOnline: online });
        
        // Process offline queue when coming back online
        if (wasOffline && online) {
          get().processOfflineQueue();
        }
      },
      
      updateConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },
      
      // Notification actions
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },
      
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      // Offline queue actions
      addToOfflineQueue: (request) => {
        const queueItem = {
          ...request,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          retryCount: 0,
        };
        
        set((state) => ({
          offlineQueue: [...state.offlineQueue, queueItem],
        }));
      },
      
      removeFromOfflineQueue: (id: string) => {
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((item) => item.id !== id),
        }));
      },
      
      processOfflineQueue: async () => {
        const { offlineQueue, removeFromOfflineQueue } = get();
        
        for (const item of offlineQueue) {
          try {
            const response = await fetch(item.url, {
              method: item.method,
              headers: item.headers,
              body: item.body ? JSON.stringify(item.body) : undefined,
            });
            
            if (response.ok) {
              removeFromOfflineQueue(item.id);
            } else if (item.retryCount >= 3) {
              // Remove after 3 failed retries
              removeFromOfflineQueue(item.id);
            } else {
              // Increment retry count
              set((state) => ({
                offlineQueue: state.offlineQueue.map((q) =>
                  q.id === item.id ? { ...q, retryCount: q.retryCount + 1 } : q
                ),
              }));
            }
          } catch (error) {
            console.error('Failed to process offline queue item:', error);
            if (item.retryCount >= 3) {
              removeFromOfflineQueue(item.id);
            }
          }
        }
      },
      
      clearOfflineQueue: () => {
        set({ offlineQueue: [] });
      },
      
      reset: () => {
        set({
          isInitialized: false,
          isLoading: false,
          hasCompletedOnboarding: false,
          settings: initialSettings,
          isOnline: true,
          notifications: [],
          unreadCount: 0,
          offlineQueue: [],
        });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        settings: state.settings,
        notifications: state.notifications,
        offlineQueue: state.offlineQueue,
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