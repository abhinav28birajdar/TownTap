// ================================================================
// 🚀 REAL-TIME BUSINESS DISCOVERY SERVICE
// ================================================================

import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

// ================================================================
// TYPES
// ================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BusinessDetails {
  id: string;
  name: string;
  description: string;
  distance: number;
  estimatedWaitTime: number;
  rating: number;
  address: string;
  phone: string;
  email: string;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  latitude: number;
  longitude: number;
  is_open: boolean;
  current_customers?: number;
  total_reviews?: number;
  price_range?: string;
  hours?: any;
}

export interface RealTimeOptions {
  userId: string;
  location: Coordinates;
  radius: number;
  onBusinessesUpdate: (businesses: BusinessDetails[]) => void;
  onLocationUpdate: (location: Coordinates) => void;
  onError: (error: any) => void;
}

// ================================================================
// SERVICE CLASS
// ================================================================

class RealTimeBusinessDiscoveryService {
  private static instance: RealTimeBusinessDiscoveryService;
  private currentLocation: Coordinates | null = null;
  private locationWatcher: Location.LocationSubscription | null = null;
  private subscriptions: Map<string, any> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): RealTimeBusinessDiscoveryService {
    if (!RealTimeBusinessDiscoveryService.instance) {
      RealTimeBusinessDiscoveryService.instance = new RealTimeBusinessDiscoveryService();
    }
    return RealTimeBusinessDiscoveryService.instance;
  }

  // ================================================================
  // LOCATION SERVICES
  // ================================================================

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<Coordinates | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      this.currentLocation = coordinates;
      return coordinates;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // ================================================================
  // REAL-TIME DISCOVERY
  // ================================================================

  async startRealTimeDiscovery(options: RealTimeOptions): Promise<void> {
    const { userId, location, radius, onBusinessesUpdate, onLocationUpdate, onError } = options;

    try {
      // Stop any existing discovery
      await this.stopRealTimeDiscovery(userId);

      // Start location tracking
      this.locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (locationData) => {
          const newLocation = {
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
          };
          this.currentLocation = newLocation;
          onLocationUpdate(newLocation);

          // Update businesses with new location
          this.getNearbyBusinesses(newLocation, radius, userId)
            .then(onBusinessesUpdate)
            .catch(onError);
        }
      );

      // Initial business fetch
      const businesses = await this.getNearbyBusinesses(location, radius, userId);
      onBusinessesUpdate(businesses);

      // Set up periodic updates
      const updateInterval = setInterval(async () => {
        if (this.currentLocation) {
          try {
            const updatedBusinesses = await this.getNearbyBusinesses(this.currentLocation, radius, userId);
            onBusinessesUpdate(updatedBusinesses);
          } catch (error) {
            onError(error);
          }
        }
      }, 30000); // Update every 30 seconds

      this.updateIntervals.set(userId, updateInterval);

      // Subscribe to real-time business updates
      await this.subscribeToBusinessUpdates(userId, radius, onBusinessesUpdate);

    } catch (error) {
      onError(error);
    }
  }

  async stopRealTimeDiscovery(userId: string): Promise<void> {
    try {
      // Stop location watching
      if (this.locationWatcher) {
        this.locationWatcher.remove();
        this.locationWatcher = null;
      }

      // Clear update interval
      const intervalId = this.updateIntervals.get(userId);
      if (intervalId) {
        clearInterval(intervalId);
        this.updateIntervals.delete(userId);
      }

      // Unsubscribe from real-time updates
      const businessSub = this.subscriptions.get(`business_updates_${userId}`);
      if (businessSub) {
        businessSub.unsubscribe();
        this.subscriptions.delete(`business_updates_${userId}`);
      }

      console.log(`Stopped real-time discovery for user: ${userId}`);
    } catch (error) {
      console.error('Error stopping real-time discovery:', error);
    }
  }

  // ================================================================
  // BUSINESS DATA
  // ================================================================

  async getNearbyBusinesses(location: Coordinates, radiusKm: number = 5, userId?: string): Promise<BusinessDetails[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_km: radiusKm,
      });

      if (error) {
        console.error('Error fetching nearby businesses:', error);
        throw error;
      }

      if (!data) return [];

      // Enhanced business data with real-time info
      const enhancedBusinesses = await Promise.all(
        data.map(async (business: any) => {
          const distance = this.calculateDistance(
            location.latitude,
            location.longitude,
            business.latitude,
            business.longitude
          );

          return {
            ...business,
            distance,
          };
        })
      );

      // Sort by distance
      enhancedBusinesses.sort((a: any, b: any) => a.distance - b.distance);

      return enhancedBusinesses.slice(0, 50); // Limit to 50 businesses
    } catch (error) {
      console.error('Error in getNearbyBusinesses:', error);
      throw error;
    }
  }

  async subscribeToBusinessUpdates(userId: string, radius: number, onUpdate: (businesses: BusinessDetails[]) => void): Promise<void> {
    if (!this.currentLocation) return;

    try {
      const channel = supabase
        .channel(`business_updates_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'businesses',
          },
          async (payload) => {
            if (this.currentLocation) {
              const updatedBusinesses = await this.getNearbyBusinesses(this.currentLocation, radius, userId);
              onUpdate(updatedBusinesses);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'service_requests',
          },
          async (payload) => {
            if (this.currentLocation) {
              const updatedBusinesses = await this.getNearbyBusinesses(this.currentLocation, radius, userId);
              onUpdate(updatedBusinesses);
            }
          }
        )
        .subscribe();

      this.subscriptions.set(`business_updates_${userId}`, channel);
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
    }
  }

  // ================================================================
  // SEARCH FUNCTIONS
  // ================================================================

  async searchBusinesses(
    location: Coordinates,
    searchQuery: string,
    options: {
      radius?: number;
      category?: string;
      onlyOpen?: boolean;
    } = {}
  ): Promise<BusinessDetails[]> {
    try {
      const { radius = 5, category, onlyOpen = false } = options;

      const { data, error } = await supabase.rpc('search_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        search_term: searchQuery,
        radius_km: radius,
        category_filter: category,
        only_open: onlyOpen,
      });

      if (error) {
        console.error('Error searching businesses:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchBusinesses:', error);
      throw error;
    }
  }

  async getBusinessesByCategory(
    location: Coordinates,
    categoryId: string,
    radius: number = 5
  ): Promise<BusinessDetails[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        category_id: categoryId,
        radius_km: radius,
      });

      if (error) {
        console.error('Error fetching businesses by category:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBusinessesByCategory:', error);
      throw error;
    }
  }

  // ================================================================
  // BUSINESS CATEGORIES
  // ================================================================

  async getBusinessCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching business categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBusinessCategories:', error);
      return [];
    }
  }

  // ================================================================
  // UTILITY FUNCTIONS
  // ================================================================

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  // ================================================================
  // SERVICE REQUESTS
  // ================================================================

  async createServiceRequest(data: {
    userId: string;
    businessId: string;
    serviceType: string;
    description: string;
    location: Coordinates;
  }): Promise<any> {
    try {
      const { data: result, error } = await supabase
        .from('service_requests')
        .insert({
          customer_id: data.userId,
          business_id: data.businessId,
          service_type: data.serviceType,
          description: data.description,
          customer_latitude: data.location.latitude,
          customer_longitude: data.location.longitude,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating service request:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Error in createServiceRequest:', error);
      throw error;
    }
  }

  // ================================================================
  // CLEANUP
  // ================================================================

  cleanup(): void {
    // Stop all subscriptions
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    // Clear all intervals
    this.updateIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.updateIntervals.clear();

    // Stop location watching
    if (this.locationWatcher) {
      this.locationWatcher.remove();
      this.locationWatcher = null;
    }
  }
}

export default RealTimeBusinessDiscoveryService.getInstance();
