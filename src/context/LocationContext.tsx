// FILE: src/context/LocationContext.tsx
// PURPOSE: Location services and geospatial business discovery with permission handling

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BusinessLocation, LocationRegion } from '../types';

interface LocationContextType {
  currentLocation: Location.LocationObject | null;
  selectedRegion: LocationRegion | null;
  nearbyBusinesses: BusinessLocation[];
  isLocationEnabled: boolean;
  isLoading: boolean;
  hasLocationPermission: boolean;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location.LocationObject | null>;
  setSelectedRegion: (region: LocationRegion) => void;
  searchNearbyBusinesses: (radius?: number, category?: string) => Promise<void>;
  getDistanceToLocation: (lat: number, lng: number) => number | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
}

const LOCATION_STORAGE_KEY = 'user_location';
const REGION_STORAGE_KEY = 'selected_region';
const DEFAULT_SEARCH_RADIUS = 5000; // 5km in meters

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedRegion, setSelectedRegionState] = useState<LocationRegion | null>(null);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<BusinessLocation[]>([]);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    // Initialize location services
    initializeLocation();
  }, []);

  useEffect(() => {
    // Auto-search nearby businesses when location changes
    if (currentLocation && hasLocationPermission) {
      searchNearbyBusinesses();
    }
  }, [currentLocation, hasLocationPermission]);

  const initializeLocation = async () => {
    try {
      // Check location services
      const isEnabled = await Location.hasServicesEnabledAsync();
      setIsLocationEnabled(isEnabled);

      // Check permissions
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      const hasPermission = foregroundStatus === 'granted';
      setHasLocationPermission(hasPermission);

      // Load saved location and region
      await loadSavedData();

      // Get current location if permission granted
      if (hasPermission && isEnabled) {
        await getCurrentLocationInternal();
      }
    } catch (error) {
      console.error('Error initializing location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedData = async () => {
    try {
      // Load saved location
      const savedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedLocation) {
        setCurrentLocation(JSON.parse(savedLocation));
      }

      // Load saved region
      const savedRegion = await AsyncStorage.getItem(REGION_STORAGE_KEY);
      if (savedRegion) {
        setSelectedRegionState(JSON.parse(savedRegion));
      }
    } catch (error) {
      console.error('Error loading saved location data:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasLocationPermission(granted);

      if (granted) {
        await getCurrentLocationInternal();
      }

      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocationInternal = async (): Promise<Location.LocationObject | null> => {
    try {
      setIsLoading(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation(location);
      
      // Save to storage
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));

      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    if (!hasLocationPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return null;
    }

    return await getCurrentLocationInternal();
  };

  const setSelectedRegion = async (region: LocationRegion) => {
    try {
      setSelectedRegionState(region);
      await AsyncStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(region));
    } catch (error) {
      console.error('Error saving selected region:', error);
    }
  };

  const searchNearbyBusinesses = async (radius: number = DEFAULT_SEARCH_RADIUS, category?: string) => {
    if (!currentLocation) {
      console.warn('No current location available for business search');
      return;
    }

    try {
      setIsLoading(true);

      const { latitude, longitude } = currentLocation.coords;

      // Use the business-discovery Edge Function
      const { data, error } = await supabase.functions.invoke('business-discovery', {
        body: {
          latitude,
          longitude,
          radius,
          category,
          limit: 50,
        },
      });

      if (error) {
        console.error('Error searching nearby businesses:', error);
        return;
      }

      if (data?.businesses) {
        const businesses: BusinessLocation[] = data.businesses.map((business: any) => ({
          id: business.id,
          name: business.name,
          category: business.category,
          subcategory: business.subcategory,
          latitude: business.latitude,
          longitude: business.longitude,
          address: business.address,
          phone: business.phone,
          rating: business.rating,
          isOpen: business.is_open,
          distance: business.distance_meters,
          imageUrl: business.image_url,
        }));

        setNearbyBusinesses(businesses);
      }
    } catch (error) {
      console.error('Error in searchNearbyBusinesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDistanceToLocation = (lat: number, lng: number): number | null => {
    if (!currentLocation) return null;

    const { latitude, longitude } = currentLocation.coords;
    
    // Haversine formula for distance calculation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = latitude * Math.PI / 180;
    const φ2 = lat * Math.PI / 180;
    const Δφ = (lat - latitude) * Math.PI / 180;
    const Δλ = (lng - longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const value: LocationContextType = {
    currentLocation,
    selectedRegion,
    nearbyBusinesses,
    isLocationEnabled,
    isLoading,
    hasLocationPermission,
    requestLocationPermission,
    getCurrentLocation,
    setSelectedRegion,
    searchNearbyBusinesses,
    getDistanceToLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
