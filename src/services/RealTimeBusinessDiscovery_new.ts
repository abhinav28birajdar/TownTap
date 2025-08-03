// ================================================================
// 🔥 REAL-TIME BUSINESS DISCOVERY SERVICE - COMPLETE WORKING VERSION
// ================================================================

import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

// Types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BusinessDetails {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: number;
  estimatedWaitTime: number;
  currentCapacity: number;
  maxCapacity: number;
  latitude: number;
  longitude: number;
  phone?: string;
  address?: string;
  isOpen: boolean;
  workingHours?: any;
  imageUrl?: string;
  description?: string;
  realTimeStatus?: {
    lastUpdate: string;
    averageWaitTime: number;
    currentCustomers: number;
    isAcceptingOrders: boolean;
  };
}

export interface BusinessCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface RealTimeConfig {
  radius: number;
  onBusinessesUpdate: (businesses: BusinessDetails[]) => void;
  onLocationUpdate: (location: Coordinates) => void;
  onError: (error: string) => void;
}

// Real-time state
class RealTimeBusinessDiscoveryService {
  private watchId: number | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private businessSubscription: any = null;
  private isActive = false;
  private currentConfig: RealTimeConfig | null = null;
  private currentUserId: string | null = null;
  private currentLocation: Coordinates | null = null;

  // =====================================================
  // LOCATION SERVICES
  // =====================================================

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Location permission error:', error);
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
        timeInterval: 10000,
        distanceInterval: 10,
      });

      const coordinates: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      this.currentLocation = coordinates;
      return coordinates;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // =====================================================
  // REAL-TIME DISCOVERY
  // =====================================================

  async startRealTimeDiscovery(
    userId: string,
    userName: string,
    userPhone: string,
    config: RealTimeConfig
  ): Promise<void> {
    try {
      if (this.isActive) {
        this.stopRealTimeDiscovery();
      }

      this.currentUserId = userId;
      this.currentConfig = config;
      this.isActive = true;

      // Start location tracking
      await this.startLocationTracking();

      // Start business discovery
      await this.startBusinessTracking();

      console.log('🚀 Real-time discovery started for user:', userId);
    } catch (error: any) {
      console.error('Error starting real-time discovery:', error);
      config.onError(error.message || 'Failed to start real-time discovery');
    }
  }

  private async startLocationTracking(): Promise<void> {
    if (!this.currentConfig) return;

    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        this.currentConfig.onError('Location permission denied');
        return;
      }

      // Get initial location
      const initialLocation = await this.getCurrentLocation();
      if (initialLocation) {
        this.currentConfig.onLocationUpdate(initialLocation);
      }

      // Start watching location
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 50, // Update when moved 50 meters
        },
        (location) => {
          const coords: Coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          this.currentLocation = coords;
          if (this.currentConfig) {
            this.currentConfig.onLocationUpdate(coords);
          }
        }
      );
    } catch (error: any) {
      console.error('Error starting location tracking:', error);
      if (this.currentConfig) {
        this.currentConfig.onError('Failed to start location tracking');
      }
    }
  }

  private async startBusinessTracking(): Promise<void> {
    if (!this.currentConfig || !this.currentUserId) return;

    try {
      // Initial business fetch
      await this.updateNearbyBusinesses();

      // Set up periodic updates
      this.intervalId = setInterval(() => {
        this.updateNearbyBusinesses();
      }, 30000); // Update every 30 seconds

      // Set up real-time subscriptions
      this.setupRealtimeSubscriptions();
    } catch (error: any) {
      console.error('Error starting business tracking:', error);
      if (this.currentConfig) {
        this.currentConfig.onError('Failed to start business tracking');
      }
    }
  }

  private async updateNearbyBusinesses(): Promise<void> {
    if (!this.currentLocation || !this.currentConfig) return;

    try {
      const businesses = await this.getNearbyBusinesses(
        this.currentLocation,
        this.currentConfig.radius
      );
      this.currentConfig.onBusinessesUpdate(businesses);
    } catch (error: any) {
      console.error('Error updating nearby businesses:', error);
    }
  }

  private setupRealtimeSubscriptions(): void {
    if (!this.currentUserId) return;

    try {
      // Subscribe to business updates
      this.businessSubscription = supabase
        .channel(`business-updates-${this.currentUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'businesses',
          },
          () => {
            // Refresh businesses when any business data changes
            this.updateNearbyBusinesses();
          }
        )
        .subscribe();
    } catch (error: any) {
      console.error('Error setting up real-time subscriptions:', error);
    }
  }

  stopRealTimeDiscovery(): void {
    try {
      // Clear location watching
      if (this.watchId) {
        Location.stopLocationUpdatesAsync(this.watchId);
        this.watchId = null;
      }

      // Clear interval
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      // Unsubscribe from real-time updates
      if (this.businessSubscription) {
        this.businessSubscription.unsubscribe();
        this.businessSubscription = null;
      }

      this.isActive = false;
      this.currentConfig = null;
      this.currentUserId = null;

      console.log('🛑 Real-time discovery stopped');
    } catch (error: any) {
      console.error('Error stopping real-time discovery:', error);
    }
  }

  // =====================================================
  // BUSINESS DATA METHODS
  // =====================================================

  async getNearbyBusinesses(
    location: Coordinates,
    radiusKm: number = 20
  ): Promise<BusinessDetails[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_km: radiusKm,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to BusinessDetails format
      const businesses = data?.map((business: any) => ({
        id: business.id,
        name: business.name,
        category: business.category_name,
        rating: business.rating || 4.0,
        distance: business.distance_km,
        estimatedWaitTime: business.estimated_wait_time || 15,
        currentCapacity: business.current_customers || 0,
        maxCapacity: 50,
        latitude: business.latitude,
        longitude: business.longitude,
        phone: business.phone,
        address: business.address,
        isOpen: business.is_currently_open || true,
        description: business.description,
        realTimeStatus: {
          lastUpdate: new Date().toISOString(),
          averageWaitTime: business.estimated_wait_time || 15,
          currentCustomers: business.current_customers || 0,
          isAcceptingOrders: business.is_currently_open || true,
        },
      })) || [];

      return businesses.sort((a, b) => a.distance - b.distance);
    } catch (error: any) {
      console.error('Error fetching nearby businesses:', error);
      throw error;
    }
  }

  async searchBusinesses(
    location: Coordinates,
    searchQuery: string,
    radiusKm: number = 20
  ): Promise<BusinessDetails[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_km: radiusKm,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Filter by search query
      const filteredData = data?.filter((business: any) =>
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];

      // Transform to BusinessDetails format
      const businesses = filteredData.map((business: any) => ({
        id: business.id,
        name: business.name,
        category: business.category_name,
        rating: business.rating || 4.0,
        distance: business.distance_km,
        estimatedWaitTime: business.estimated_wait_time || 15,
        currentCapacity: business.current_customers || 0,
        maxCapacity: 50,
        latitude: business.latitude,
        longitude: business.longitude,
        phone: business.phone,
        address: business.address,
        isOpen: business.is_currently_open || true,
        description: business.description,
        realTimeStatus: {
          lastUpdate: new Date().toISOString(),
          averageWaitTime: business.estimated_wait_time || 15,
          currentCustomers: business.current_customers || 0,
          isAcceptingOrders: business.is_currently_open || true,
        },
      }));

      return businesses.sort((a, b) => a.distance - b.distance);
    } catch (error: any) {
      console.error('Error searching businesses:', error);
      throw error;
    }
  }

  async getBusinessCategories(): Promise<BusinessCategory[]> {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      return data?.map((category: any) => ({
        id: category.id,
        name: category.name,
        icon: category.icon || 'business',
        description: category.description || '',
      })) || [];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      // Return default categories if database fails
      return [
        { id: '1', name: 'Restaurants', icon: 'restaurant', description: 'Food and dining' },
        { id: '2', name: 'Healthcare', icon: 'medical', description: 'Medical services' },
        { id: '3', name: 'Shopping', icon: 'bag', description: 'Retail stores' },
        { id: '4', name: 'Services', icon: 'build', description: 'Professional services' },
        { id: '5', name: 'Entertainment', icon: 'film', description: 'Fun activities' },
      ];
    }
  }

  async getBusinessesByCategory(
    location: Coordinates,
    categoryId: string,
    radiusKm: number = 20
  ): Promise<BusinessDetails[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_km: radiusKm,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Filter by category
      const filteredData = data?.filter((business: any) =>
        business.category_id === categoryId
      ) || [];

      // Transform to BusinessDetails format
      const businesses = filteredData.map((business: any) => ({
        id: business.id,
        name: business.name,
        category: business.category_name,
        rating: business.rating || 4.0,
        distance: business.distance_km,
        estimatedWaitTime: business.estimated_wait_time || 15,
        currentCapacity: business.current_customers || 0,
        maxCapacity: 50,
        latitude: business.latitude,
        longitude: business.longitude,
        phone: business.phone,
        address: business.address,
        isOpen: business.is_currently_open || true,
        description: business.description,
        realTimeStatus: {
          lastUpdate: new Date().toISOString(),
          averageWaitTime: business.estimated_wait_time || 15,
          currentCustomers: business.current_customers || 0,
          isAcceptingOrders: business.is_currently_open || true,
        },
      }));

      return businesses.sort((a, b) => a.distance - b.distance);
    } catch (error: any) {
      console.error('Error fetching businesses by category:', error);
      throw error;
    }
  }

  async getPopularBusinesses(
    location: Coordinates,
    radiusKm: number = 20
  ): Promise<BusinessDetails[]> {
    try {
      const businesses = await this.getNearbyBusinesses(location, radiusKm);
      // Sort by rating and current customers for popularity
      return businesses
        .sort((a, b) => (b.rating * 10 + b.currentCapacity) - (a.rating * 10 + a.currentCapacity))
        .slice(0, 10);
    } catch (error: any) {
      console.error('Error fetching popular businesses:', error);
      throw error;
    }
  }

  // =====================================================
  // SERVICE REQUEST METHODS
  // =====================================================

  async createServiceRequest(
    customerId: string,
    businessId: string,
    serviceType: string,
    description: string,
    urgency: 'low' | 'normal' | 'high' | 'emergency' = 'normal'
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          customer_id: customerId,
          business_id: businessId,
          service_type: serviceType,
          description: description,
          urgency: urgency,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Service request created:', data.id);
      return data.id;
    } catch (error: any) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  async trackBusinessInteraction(
    userId: string,
    businessId: string,
    interactionType: 'view' | 'call' | 'request'
  ): Promise<void> {
    try {
      await supabase
        .from('business_interactions')
        .insert({
          user_id: userId,
          business_id: businessId,
          interaction_type: interactionType,
          created_at: new Date().toISOString(),
        });
    } catch (error: any) {
      console.error('Error tracking interaction:', error);
      // Don't throw error for analytics tracking
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  isActiveStatus(): boolean {
    return this.isActive;
  }

  getCurrentLocationData(): Coordinates | null {
    return this.currentLocation;
  }
}

// Export singleton instance
const RealTimeBusinessDiscovery = new RealTimeBusinessDiscoveryService();
export default RealTimeBusinessDiscovery;
