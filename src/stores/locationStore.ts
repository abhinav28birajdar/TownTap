import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Address, Location as LocationType } from '../types';

interface LocationStore {
  // State
  currentLocation: LocationType | null;
  location: LocationType | null; // Alias for currentLocation
  selectedAddress: Address | null;
  savedAddresses: Address[];
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  
  // Actions
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationType | null>;
  setCurrentLocation: (location: LocationType) => void;
  setLocation: (location: LocationType) => void; // Alias for setCurrentLocation
  setSelectedAddress: (address: Address | null) => void;
  addSavedAddress: (address: Address) => void;
  updateSavedAddress: (addressId: string, updates: Partial<Address>) => void;
  removeSavedAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentLocation: null,
      location: null,
      selectedAddress: null,
      savedAddresses: [],
      loading: false,
      error: null,
      permissionGranted: false,

      // Actions
      requestLocationPermission: async () => {
        try {
          set({ loading: true, error: null });
          
          const { status } = await Location.requestForegroundPermissionsAsync();
          const granted = status === 'granted';
          
          set({ permissionGranted: granted, loading: false });
          return granted;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to request location permission',
            permissionGranted: false 
          });
          return false;
        }
      },

      getCurrentLocation: async () => {
        try {
          set({ loading: true, error: null });
          
          // Check permission first
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status !== 'granted') {
            const granted = await get().requestLocationPermission();
            if (!granted) {
              set({ loading: false, error: 'Location permission denied' });
              return null;
            }
          }

          // Get current location
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const currentLocation: LocationType = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          set({ 
            currentLocation, 
            location: currentLocation,
            loading: false, 
            permissionGranted: true 
          });

          return currentLocation;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to get current location' 
          });
          return null;
        }
      },

      setCurrentLocation: (location: LocationType) => {
        set({ currentLocation: location, location: location });
      },

      setLocation: (location: LocationType) => {
        set({ currentLocation: location, location: location });
      },

      setSelectedAddress: (address: Address | null) => {
        set({ selectedAddress: address });
      },

      addSavedAddress: (address: Address) => {
        const savedAddresses = get().savedAddresses;
        const newAddress = {
          ...address,
          id: address.id || Date.now().toString(),
        };

        // If this is the first address or marked as default, make it default
        if (savedAddresses.length === 0 || address.isDefault) {
          // Remove default from other addresses
          const updatedAddresses = savedAddresses.map(addr => ({
            ...addr,
            isDefault: false,
          }));
          
          set({ 
            savedAddresses: [...updatedAddresses, { ...newAddress, isDefault: true }],
            selectedAddress: newAddress,
          });
        } else {
          set({ 
            savedAddresses: [...savedAddresses, newAddress],
          });
        }
      },

      updateSavedAddress: (addressId: string, updates: Partial<Address>) => {
        const savedAddresses = get().savedAddresses;
        const updatedAddresses = savedAddresses.map(address =>
          address.id === addressId ? { ...address, ...updates } : address
        );

        // If setting as default, remove default from others
        if (updates.isDefault) {
          const finalAddresses = updatedAddresses.map(address => ({
            ...address,
            isDefault: address.id === addressId,
          }));
          
          const defaultAddress = finalAddresses.find(addr => addr.isDefault);
          set({ 
            savedAddresses: finalAddresses,
            selectedAddress: defaultAddress || get().selectedAddress,
          });
        } else {
          set({ savedAddresses: updatedAddresses });
        }
      },

      removeSavedAddress: (addressId: string) => {
        const savedAddresses = get().savedAddresses;
        const filteredAddresses = savedAddresses.filter(
          address => address.id !== addressId
        );

        // If removing default address, set first address as default
        const removedAddress = savedAddresses.find(addr => addr.id === addressId);
        if (removedAddress?.isDefault && filteredAddresses.length > 0) {
          filteredAddresses[0].isDefault = true;
          set({ 
            savedAddresses: filteredAddresses,
            selectedAddress: filteredAddresses[0],
          });
        } else {
          set({ 
            savedAddresses: filteredAddresses,
            selectedAddress: get().selectedAddress?.id === addressId 
              ? null 
              : get().selectedAddress,
          });
        }
      },

      setDefaultAddress: (addressId: string) => {
        get().updateSavedAddress(addressId, { isDefault: true });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedAddresses: state.savedAddresses,
        selectedAddress: state.selectedAddress,
        permissionGranted: state.permissionGranted,
      }),
    }
  )
);
