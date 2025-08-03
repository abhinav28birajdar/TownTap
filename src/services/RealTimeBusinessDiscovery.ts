// ================================================================
// 🚀 COMPLETE REAL-TIME BUSINESS DISCOVERY SYSTEM
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
  description: string;
  category_name: string;
  category_icon: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  rating: number;
  total_reviews: number;
  is_currently_open: boolean;
  current_customers: number;
  estimated_wait_time: number;
  price_range: string;
  service_radius: number;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  service_type: string;
  description: string;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimated_cost?: number;
  business_id: string;
  customer_id: string;
}

class RealTimeBusinessDiscovery {
  private static subscriptions: Map<string, any> = new Map();
  private static locationWatcher: Location.LocationSubscription | null = null;
  private static currentLocation: Coordinates | null = null;

  // =====================================================
  // LOCATION SERVICES
  // =====================================================

  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<Coordinates | null> {
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

  static async startLocationTracking(
    onLocationUpdate: (location: Coordinates) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        onError('Location permission denied');
        return;
      }

      // Stop existing tracker
      if (this.locationWatcher) {
        this.locationWatcher.remove();
      }

      // Start new location tracking
      this.locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 50, // 50 meters
        },
        (location) => {
          const coordinates: Coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          this.currentLocation = coordinates;
          onLocationUpdate(coordinates);
        }
      );
    } catch (error: any) {
      console.error('Location tracking error:', error);
      onError(error.message || 'Failed to start location tracking');
    }
  }

  static stopLocationTracking(): void {
    if (this.locationWatcher) {
      this.locationWatcher.remove();
      this.locationWatcher = null;
    }
  }

  // =====================================================
  // BUSINESS DISCOVERY
  // =====================================================

  static async getNearbyBusinesses(
    location: Coordinates,
    radius: number = 20,
    categoryFilter?: string,
    limit: number = 50
  ): Promise<BusinessDetails[]> {
    try {
      console.log('🔍 Getting nearby businesses:', { location, radius, categoryFilter });

      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_km: radius,
        category_filter: categoryFilter || null,
        limit_count: limit,
      });

      if (error) {
        console.error('Error getting nearby businesses:', error);
        throw error;
      }

      console.log('✅ Found businesses:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('Error getting nearby businesses:', error);
      throw new Error(error.message || 'Failed to get nearby businesses');
    }
  }

  static async searchBusinesses(
    location: Coordinates,
    searchQuery: string,
    radius: number = 20,
    limit: number = 50
  ): Promise<BusinessDetails[]> {
    try {
      const { data, error } = await supabase.rpc('search_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        search_query: searchQuery,
        radius_km: radius,
        limit_count: limit,
      });

      if (error) {
        console.error('Error searching businesses:', error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error searching businesses:', error);
      throw new Error(error.message || 'Failed to search businesses');
    }
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToBusinessUpdates(
    onBusinessUpdate: (business: BusinessDetails) => void,
    onError: (error: string) => void
  ): () => void {
    try {
      const subscription = supabase
        .channel('business_stats_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_stats',
          },
          async (payload) => {
            console.log('📊 Business stats updated:', payload);
            // Fetch updated business details and notify
            if (payload.new && this.currentLocation) {
              const updatedBusinesses = await this.getNearbyBusinesses(
                this.currentLocation,
                20,
                undefined,
                1
              );
              if (updatedBusinesses.length > 0) {
                onBusinessUpdate(updatedBusinesses[0]);
              }
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error: any) {
      console.error('Error subscribing to business updates:', error);
      onError(error.message || 'Failed to subscribe to business updates');
      return () => {};
    }
  }

  // =====================================================
  // SERVICE REQUESTS
  // =====================================================

  static async createServiceRequest(
    businessId: string,
    customerId: string,
    serviceType: string,
    description: string,
    serviceLocation: Coordinates,
    serviceAddress: string,
    urgency: 'low' | 'normal' | 'high' | 'emergency' = 'normal'
  ): Promise<ServiceRequest> {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          business_id: businessId,
          customer_id: customerId,
          service_type: serviceType,
          description,
          service_latitude: serviceLocation.latitude,
          service_longitude: serviceLocation.longitude,
          service_address: serviceAddress,
          urgency,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating service request:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error creating service request:', error);
      throw new Error(error.message || 'Failed to create service request');
    }
  }

  static async getCustomerRequests(customerId: string): Promise<ServiceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          business:business_profiles(name, phone, category:business_categories(name, icon))
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting customer requests:', error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error getting customer requests:', error);
      throw new Error(error.message || 'Failed to get service requests');
    }
  }

  // =====================================================
  // BUSINESS CATEGORIES
  // =====================================================

  static async getBusinessCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error getting business categories:', error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error getting business categories:', error);
      throw new Error(error.message || 'Failed to get business categories');
    }
  }

  // =====================================================
  // CUSTOMER MANAGEMENT
  // =====================================================

  static async createOrUpdateCustomer(
    userId: string,
    fullName: string,
    phone: string,
    location?: Coordinates
  ): Promise<any> {
    try {
      const customerData: any = {
        user_id: userId,
        full_name: fullName,
        phone,
        updated_at: new Date().toISOString(),
      };

      if (location) {
        customerData.current_latitude = location.latitude;
        customerData.current_longitude = location.longitude;
        customerData.last_location_update = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('customers')
        .upsert(customerData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating customer:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error creating/updating customer:', error);
      throw new Error(error.message || 'Failed to create/update customer');
    }
  }

  // =====================================================
  // REAL-TIME DISCOVERY ORCHESTRATOR
  // =====================================================

  static async startRealTimeDiscovery(
    userId: string,
    customerName: string,
    customerPhone: string,
    options: {
      radius?: number;
      onBusinessesUpdate: (businesses: BusinessDetails[]) => void;
      onLocationUpdate: (location: Coordinates) => void;
      onError: (error: string) => void;
    }
  ): Promise<void> {
    const { radius = 20, onBusinessesUpdate, onLocationUpdate, onError } = options;

    try {
      console.log('🚀 Starting real-time discovery for user:', userId);

      // Get initial location
      const initialLocation = await this.getCurrentLocation();
      if (!initialLocation) {
        onError('Unable to get your current location');
        return;
      }

      // Create/update customer profile
      await this.createOrUpdateCustomer(userId, customerName, customerPhone, initialLocation);

      // Get initial businesses
      const initialBusinesses = await this.getNearbyBusinesses(initialLocation, radius);
      onBusinessesUpdate(initialBusinesses);
      onLocationUpdate(initialLocation);

      // Start location tracking
      await this.startLocationTracking(
        async (location) => {
          console.log('📍 Location updated:', location);
          onLocationUpdate(location);

          // Update customer location
          await this.createOrUpdateCustomer(userId, customerName, customerPhone, location);

          // Get updated businesses
          const updatedBusinesses = await this.getNearbyBusinesses(location, radius);
          onBusinessesUpdate(updatedBusinesses);
        },
        onError
      );

      // Subscribe to real-time business updates
      this.subscribeToBusinessUpdates(
        async (updatedBusiness) => {
          console.log('📊 Business updated:', updatedBusiness.name);
          if (this.currentLocation) {
            const allBusinesses = await this.getNearbyBusinesses(this.currentLocation, radius);
            onBusinessesUpdate(allBusinesses);
          }
        },
        onError
      );

      console.log('✅ Real-time discovery started successfully');
    } catch (error: any) {
      console.error('Error starting real-time discovery:', error);
      onError(error.message || 'Failed to start real-time discovery');
    }
  }

  static stopRealTimeDiscovery(): void {
    console.log('🛑 Stopping real-time discovery');
    
    // Stop location tracking
    this.stopLocationTracking();

    // Unsubscribe from all channels
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    console.log('✅ Real-time discovery stopped');
  }
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };

            try {
              // Update user's location in real-time
              onLocationUpdate(currentLocation);

              // Get nearby businesses in real-time
              const nearbyBusinesses = await this.getRealtimeNearbyBusinesses(
                currentLocation,
                radius
              );

              onBusinessesUpdate(nearbyBusinesses);

              // Store user's current location for other users to see
              await this.updateUserLocation(userId, currentLocation);

            } catch (error: any) {
              onError(error.message || 'Failed to update location');
            }
          },
          (error) => {
            onError(`Location error: ${error.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        );

        return watchId;
      };

      // Start tracking
      const watchId = startLocationTracking();
      if (watchId) {
        this.subscriptions.set(`location_${userId}`, watchId);
      }

      // Set up periodic business updates even if location doesn't change
      const intervalId = setInterval(async () => {
        try {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const currentLocation: Coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };

            const nearbyBusinesses = await this.getRealtimeNearbyBusinesses(
              currentLocation,
              radius
            );
            
            onBusinessesUpdate(nearbyBusinesses);
          });
        } catch (error) {
          console.error('Periodic update error:', error);
        }
      }, updateInterval);

      this.updateIntervals.set(userId, intervalId);

      // Subscribe to real-time business updates from database
      await this.subscribeToBusinessUpdates(userId, radius, onBusinessesUpdate);

    } catch (error: any) {
      onError(error.message || 'Failed to start real-time discovery');
    }
  }

  /**
   * Stop real-time discovery for a user
   */
  static stopRealTimeDiscovery(userId: string): void {
    // Stop location tracking
    const watchId = this.subscriptions.get(`location_${userId}`);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      this.subscriptions.delete(`location_${userId}`);
    }

    // Stop periodic updates
    const intervalId = this.updateIntervals.get(userId);
    if (intervalId) {
      clearInterval(intervalId);
      this.updateIntervals.delete(userId);
    }

    // Unsubscribe from business updates
    const businessSub = this.subscriptions.get(`business_${userId}`);
    if (businessSub) {
      businessSub.unsubscribe();
      this.subscriptions.delete(`business_${userId}`);
    }

    console.log(`Real-time discovery stopped for user: ${userId}`);
  }

  // =====================================================
  // REAL-TIME BUSINESS DISCOVERY
  // =====================================================

  /**
   * Get nearby businesses in real-time with live data
   */
  static async getRealtimeNearbyBusinesses(
    location: Coordinates,
    radiusKm: number = 20
  ): Promise<BusinessProfileDetail[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_businesses_realtime', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_km: radiusKm,
        include_closed: false, // Only show open businesses
        real_time: true
      });

      if (error) {
        console.error('Error fetching real-time nearby businesses:', error);
        throw error;
      }

      // Enhance with real-time status
      const enhancedBusinesses = await Promise.all(
        (data || []).map(async (business: any) => ({
          ...business,
          isRealTimeOpen: await this.checkBusinessRealTimeStatus(business.id),
          lastUpdated: new Date().toISOString(),
          customerCount: await this.getCurrentCustomerCount(business.id),
          averageWaitTime: await this.getAverageWaitTime(business.id),
          distanceFromUser: this.calculateDistance(
            location.latitude,
            location.longitude,
            business.latitude,
            business.longitude
          )
        }))
      );

      // Sort by distance and real-time availability
      return enhancedBusinesses.sort((a, b) => {
        // Prioritize open businesses
        if (a.isRealTimeOpen && !b.isRealTimeOpen) return -1;
        if (!a.isRealTimeOpen && b.isRealTimeOpen) return 1;
        
        // Then sort by distance
        return a.distanceFromUser - b.distanceFromUser;
      });

    } catch (error: any) {
      console.error('Error getting real-time nearby businesses:', error);
      throw new Error(error.message || 'Failed to get nearby businesses');
    }
  }

  /**
   * Subscribe to real-time business updates
   */
  private static async subscribeToBusinessUpdates(
    userId: string,
    radius: number,
    onUpdate: (businesses: BusinessProfileDetail[]) => void
  ): Promise<void> {
    const channel = supabase.channel(`business_updates_${userId}`);

    // Subscribe to business changes
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'businesses'
    }, async (payload) => {
      // When any business updates, refresh the list
      try {
        const userLocation = await this.getCurrentUserLocation(userId);
        if (userLocation) {
          const updatedBusinesses = await this.getRealtimeNearbyBusinesses(
            userLocation,
            radius
          );
          onUpdate(updatedBusinesses);
        }
      } catch (error) {
        console.error('Error updating businesses:', error);
      }
    });

    // Subscribe to business hours changes
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'business_hours'
    }, async (payload) => {
      try {
        const userLocation = await this.getCurrentUserLocation(userId);
        if (userLocation) {
          const updatedBusinesses = await this.getRealtimeNearbyBusinesses(
            userLocation,
            radius
          );
          onUpdate(updatedBusinesses);
        }
      } catch (error) {
        console.error('Error updating business hours:', error);
      }
    });

    const subscription = await channel.subscribe();
    this.subscriptions.set(`business_${userId}`, subscription);
  }

  // =====================================================
  // BUSINESS STATUS CHECKING
  // =====================================================

  /**
   * Check if a business is currently open in real-time
   */
  private static async checkBusinessRealTimeStatus(businessId: string): Promise<boolean> {
    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      const { data: hours, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .eq('day_of_week', currentDay)
        .single();

      if (error || !hours) return false;

      // Check if business is open today
      if (!hours.is_open) return false;

      // Check if current time is within business hours
      const isWithinHours = currentTime >= hours.open_time && currentTime <= hours.close_time;

      // Additional check: Is business currently accepting orders?
      const { data: businessStatus } = await supabase
        .from('businesses')
        .select('is_accepting_orders, is_temporarily_closed')
        .eq('id', businessId)
        .single();

      return isWithinHours && 
             businessStatus?.is_accepting_orders !== false && 
             businessStatus?.is_temporarily_closed !== true;

    } catch (error) {
      console.error('Error checking business status:', error);
      return false;
    }
  }

  /**
   * Get current customer count at a business
   */
  private static async getCurrentCustomerCount(businessId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('business_id', businessId)
        .eq('order_status', 'in_progress');

      if (error) return 0;
      return data?.length || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get average wait time for a business
   */
  private static async getAverageWaitTime(businessId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, completed_at')
        .eq('business_id', businessId)
        .eq('order_status', 'completed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .limit(10);

      if (error || !data || data.length === 0) return 30; // Default 30 minutes

      const waitTimes = data
        .filter(order => order.completed_at)
        .map(order => {
          const created = new Date(order.created_at).getTime();
          const completed = new Date(order.completed_at).getTime();
          return (completed - created) / (1000 * 60); // Convert to minutes
        });

      if (waitTimes.length === 0) return 30;

      const averageWait = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
      return Math.round(averageWait);
    } catch (error) {
      return 30; // Default fallback
    }
  }

  // =====================================================
  // LOCATION UTILITIES
  // =====================================================

  /**
   * Update user's current location
   */
  private static async updateUserLocation(
    userId: string, 
    location: Coordinates
  ): Promise<void> {
    try {
      await supabase
        .from('user_locations')
        .upsert({
          user_id: userId,
          latitude: location.latitude,
          longitude: location.longitude,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error updating user location:', error);
    }
  }

  /**
   * Get user's current location from database
   */
  private static async getCurrentUserLocation(userId: string): Promise<Coordinates | null> {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('latitude, longitude')
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;

      return {
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // =====================================================
  // SEARCH & FILTERING
  // =====================================================

  /**
   * Search businesses by name with real-time filtering
   */
  static async searchBusinessesRealTime(
    location: Coordinates,
    searchQuery: string,
    options: {
      radius?: number;
      category?: string;
      onlyOpen?: boolean;
    } = {}
  ): Promise<BusinessProfileDetail[]> {
    const { radius = 20, category, onlyOpen = true } = options;

    try {
      const { data, error } = await supabase.rpc('search_businesses_realtime', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        search_query: searchQuery,
        radius_km: radius,
        category_filter: category || null,
        only_open: onlyOpen
      });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error searching businesses:', error);
      throw new Error(error.message || 'Failed to search businesses');
    }
  }

  /**
   * Get businesses by category with real-time updates
   */
  static async getBusinessesByCategory(
    location: Coordinates,
    categoryId: string,
    radius: number = 20
  ): Promise<BusinessProfileDetail[]> {
    try {
      const { data, error } = await supabase.rpc('get_businesses_by_category_realtime', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        category_uuid: categoryId,
        radius_km: radius
      });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error getting businesses by category:', error);
      throw new Error(error.message || 'Failed to get businesses by category');
    }
  }

  // =====================================================
  // ANALYTICS & INSIGHTS
  // =====================================================

  /**
   * Track user interaction with businesses
   */
  static async trackBusinessInteraction(
    userId: string,
    businessId: string,
    interactionType: 'view' | 'call' | 'direction' | 'order',
    metadata?: any
  ): Promise<void> {
    try {
      await supabase
        .from('business_interactions')
        .insert({
          user_id: userId,
          business_id: businessId,
          interaction_type: interactionType,
          metadata: metadata || {},
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking business interaction:', error);
    }
  }

  /**
   * Get popular businesses in area
   */
  static async getPopularBusinesses(
    location: Coordinates,
    radius: number = 20
  ): Promise<BusinessProfileDetail[]> {
    try {
      const { data, error } = await supabase.rpc('get_popular_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_km: radius,
        time_period: '24h' // Last 24 hours
      });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error getting popular businesses:', error);
      return [];
    }
}

export default RealTimeBusinessDiscovery;

export default RealTimeBusinessDiscovery;
