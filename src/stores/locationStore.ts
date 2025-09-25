import { create } from 'zustand';
import * as Location from 'expo-location';

interface LocationState {
  location: Location.LocationObject | null;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location.LocationObject | null>;
  setLocation: (location: Location.LocationObject | null) => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  location: null,
  hasPermission: false,
  isLoading: false,
  error: null,

  requestLocationPermission: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      set({ hasPermission, isLoading: false });
      return hasPermission;
    } catch (error) {
      set({ 
        hasPermission: false, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Location permission error' 
      });
      return false;
    }
  },

  getCurrentLocation: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { hasPermission } = get();
      if (!hasPermission) {
        const permissionGranted = await get().requestLocationPermission();
        if (!permissionGranted) {
          throw new Error('Location permission not granted');
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      set({ location, isLoading: false });
      return location;
    } catch (error) {
      set({ 
        location: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to get location' 
      });
      return null;
    }
  },

  setLocation: (location) => set({ location }),
  
  clearError: () => set({ error: null }),
}));