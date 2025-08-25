import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coordinates, FullAddress } from '../types';

interface LocationState {
  currentLocation: Coordinates | null;
  currentAddress: FullAddress | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  
  // Actions
  getCurrentLocation: () => Promise<void>;
  setCurrentLocation: (location: Coordinates) => void;
  setCurrentAddress: (address: FullAddress) => void;
  requestPermission: () => Promise<boolean>;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      currentAddress: null,
      isLoading: false,
      error: null,
      hasPermission: false,

      getCurrentLocation: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Check permission first
          const hasPermission = await get().requestPermission();
          if (!hasPermission) {
            set({ error: 'Location permission denied', isLoading: false });
            return;
          }

          // Get current location
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const coordinates: Coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          set({ 
            currentLocation: coordinates,
            isLoading: false,
            error: null
          });

          // Optionally reverse geocode to get address
          try {
            const [addressResult] = await Location.reverseGeocodeAsync(coordinates);
            if (addressResult) {
              const fullAddress: FullAddress = {
                address_line1: `${addressResult.streetNumber || ''} ${addressResult.street || ''}`.trim(),
                address_line2: addressResult.district || '',
                city: addressResult.city || '',
                state: addressResult.region || '',
                zip_code: addressResult.postalCode || '',
                country: addressResult.country || '',
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
              };
              
              set({ currentAddress: fullAddress });
            }
          } catch (geocodeError) {
            console.warn('Failed to reverse geocode:', geocodeError);
          }

        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to get location',
            isLoading: false 
          });
        }
      },

      setCurrentLocation: (location) => {
        set({ currentLocation: location });
      },

      setCurrentAddress: (address) => {
        set({ currentAddress: address });
      },

      requestPermission: async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          const hasPermission = status === 'granted';
          set({ hasPermission });
          return hasPermission;
        } catch (error) {
          console.error('Error requesting location permission:', error);
          set({ hasPermission: false });
          return false;
        }
      },

      clearLocation: () => {
        set({ 
          currentLocation: null, 
          currentAddress: null, 
          error: null 
        });
      },
    }),
    {
      name: 'location-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        currentAddress: state.currentAddress,
        hasPermission: state.hasPermission,
      }),
    }
  )
);
