// Location Store using Zustand
import { create } from 'zustand';
import { Location } from '../types';

interface LocationStore {
  // State properties
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLocation: (location: Location) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCurrentLocation: () => Promise<void>;
  clearError: () => void;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  // Initial state
  latitude: null,
  longitude: null,
  address: null,
  city: null,
  state: null,
  country: null,
  isLoading: false,
  error: null,

  // Actions
  setLocation: (location) => {
    set({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || null,
      city: location.city || null,
      state: location.state || null,
      country: location.country || null,
      error: null,
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  clearError: () => {
    set({ error: null });
  },

  getCurrentLocation: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Implement actual location services when dependencies are available
      // const { status } = await Location.requestForegroundPermissionsAsync();
      // if (status !== 'granted') {
      //   throw new Error('Location permission not granted');
      // }
      // const location = await Location.getCurrentPositionAsync({});
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock coordinates (Pune, India)
      const mockLocation = {
        latitude: 18.5204,
        longitude: 73.8567,
        address: 'Pune, Maharashtra, India',
      };

      set({
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
        address: mockLocation.address,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get location',
        isLoading: false,
      });
    }
  },
}));
