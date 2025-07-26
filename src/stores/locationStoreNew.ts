import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LocationService } from '../services/locationService';
import type {
    Business,
    BusinessCategory,
    BusinessSearchParams,
    Location,
    LocationState,
    NearbyBusinessesResponse
} from '../types/index_location';

interface LocationStore extends LocationState {
  // Location actions
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location | null>;
  updateLocation: (location: Location) => void;
  getAddressFromCoordinates: (lat: number, lng: number) => Promise<string>;
  
  // Business discovery actions
  nearbyBusinesses: Business[];
  businessCategories: BusinessCategory[];
  searchResults: Business[];
  selectedBusiness: Business | null;
  
  getNearbyBusinesses: (params: BusinessSearchParams) => Promise<NearbyBusinessesResponse>;
  getBusinessCategories: () => Promise<BusinessCategory[]>;
  searchBusinesses: (query: string, location: Location, filters?: any) => Promise<Business[]>;
  setSelectedBusiness: (business: Business | null) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLocation: null,
      permissionGranted: false,
      loading: false,
      error: null,
      nearbyBusinesses: [],
      businessCategories: [],
      searchResults: [],
      selectedBusiness: null,

      // Location actions
      requestLocationPermission: async () => {
        set({ loading: true, error: null });
        try {
          const granted = await LocationService.requestLocationPermission();
          set({ permissionGranted: granted, loading: false });
          return granted;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to request location permission';
          set({ error: errorMessage, loading: false, permissionGranted: false });
          return false;
        }
      },

      getCurrentLocation: async () => {
        set({ loading: true, error: null });
        try {
          const location = await LocationService.getCurrentLocation();
          if (location) {
            set({ 
              currentLocation: location, 
              loading: false, 
              permissionGranted: true 
            });
          } else {
            set({ 
              error: 'Unable to get current location', 
              loading: false 
            });
          }
          return location;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      updateLocation: (location: Location) => {
        set({ currentLocation: location, error: null });
      },

      getAddressFromCoordinates: async (lat: number, lng: number) => {
        try {
          return await LocationService.getAddressFromCoordinates(lat, lng);
        } catch (error) {
          console.error('Error getting address:', error);
          return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
      },

      // Business discovery actions
      getNearbyBusinesses: async (params: BusinessSearchParams) => {
        set({ loading: true, error: null });
        try {
          const response = await LocationService.getNearbyBusinesses(params);
          set({ 
            nearbyBusinesses: response.businesses, 
            loading: false 
          });
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get nearby businesses';
          set({ error: errorMessage, loading: false, nearbyBusinesses: [] });
          return {
            businesses: [],
            total_count: 0,
            radius_km: params.filters?.radius_km || 5,
            center_location: params.location,
          };
        }
      },

      getBusinessCategories: async () => {
        set({ loading: true, error: null });
        try {
          const categories = await LocationService.getBusinessCategories();
          set({ businessCategories: categories, loading: false });
          return categories;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get business categories';
          set({ error: errorMessage, loading: false, businessCategories: [] });
          return [];
        }
      },

      searchBusinesses: async (query: string, location: Location, filters?: any) => {
        set({ loading: true, error: null });
        try {
          const results = await LocationService.searchBusinesses(query, location, filters);
          set({ searchResults: results, loading: false });
          return results;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to search businesses';
          set({ error: errorMessage, loading: false, searchResults: [] });
          return [];
        }
      },

      setSelectedBusiness: (business: Business | null) => {
        set({ selectedBusiness: business });
      },

      // Error handling
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'location-storage-new',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        permissionGranted: state.permissionGranted,
        businessCategories: state.businessCategories,
      }),
    }
  )
);
