import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { EdgeFunctionsService } from './edgeFunctionsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  address?: string;
}

export interface TrackingSession {
  id: string;
  user_id: string;
  activity_type: 'delivery' | 'service' | 'customer' | 'business';
  related_id?: string; // order_id, service_request_id, etc.
  start_time: string;
  end_time?: string;
  is_active: boolean;
  total_distance?: number;
  total_duration?: number;
  route_points: LocationData[];
}

export interface GeofenceArea {
  id: string;
  name: string;
  center: { latitude: number; longitude: number };
  radius: number; // in meters
  business_id?: string;
  area_type: 'service_area' | 'delivery_zone' | 'restricted_zone';
  is_active: boolean;
}

export interface NearbyUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  distance: number;
  business_type?: string;
  is_available: boolean;
  last_seen: string;
  location: { latitude: number; longitude: number };
}

export interface LocationSettings {
  user_id: string;
  tracking_enabled: boolean;
  high_accuracy: boolean;
  background_tracking: boolean;
  share_location: boolean;
  geofence_alerts: boolean;
  nearby_notifications: boolean;
  tracking_interval: number; // in seconds
  distance_filter: number; // in meters
}

export class LiveLocationService {
  private static instance: LiveLocationService;
  private locationSubscription: Location.LocationSubscription | null = null;
  private currentSession: TrackingSession | null = null;
  private geofenceAreas: GeofenceArea[] = [];
  private watchPositionId: number | null = null;
  private lastKnownLocation: LocationData | null = null;
  private trackingTimer: NodeJS.Timeout | null = null;
  private isTracking = false;

  static getInstance(): LiveLocationService {
    if (!LiveLocationService.instance) {
      LiveLocationService.instance = new LiveLocationService();
    }
    return LiveLocationService.instance;
  }

  /**
   * Initialize location service with permissions
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🗺️ Initializing Live Location Service...');

      // Request location permissions
      const hasPermissions = await this.requestLocationPermissions();
      if (!hasPermissions) {
        console.warn('Location permissions not granted');
        return false;
      }

      // Load location settings
      await this.loadLocationSettings();

      // Load geofence areas
      await this.loadGeofenceAreas();

      console.log('✅ Live Location Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize location service:', error);
      return false;
    }
  }

  /**
   * Request comprehensive location permissions
   */
  private async requestLocationPermissions(): Promise<boolean> {
    try {
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.warn('Location services are disabled');
        return false;
      }

      // Request foreground permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Foreground location permission denied');
        return false;
      }

      // Request background permissions for service providers
      const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
      if (backgroundPermission.status !== 'granted') {
        console.warn('Background location permission denied');
        // Continue without background permissions
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Start location tracking for user
   */
  async startTracking(
    userId: string,
    activityType: 'delivery' | 'service' | 'customer' | 'business',
    relatedId?: string
  ): Promise<boolean> {
    try {
      if (this.isTracking) {
        console.warn('Location tracking already active');
        return true;
      }

      const settings = await this.getLocationSettings(userId);
      if (!settings?.tracking_enabled) {
        console.warn('Location tracking disabled by user');
        return false;
      }

      // Create tracking session
      this.currentSession = {
        id: `session_${Date.now()}`,
        user_id: userId,
        activity_type: activityType,
        related_id: relatedId,
        start_time: new Date().toISOString(),
        is_active: true,
        route_points: [],
      };

      // Configure location options based on activity type
      const locationOptions: Location.LocationOptions = {
        accuracy: settings.high_accuracy 
          ? Location.Accuracy.BestForNavigation 
          : Location.Accuracy.High,
        timeInterval: (settings.tracking_interval || 10) * 1000,
        distanceInterval: settings.distance_filter || 10,
        mayShowUserSettingsDialog: true,
      };

      // Start location updates
      this.locationSubscription = await Location.watchPositionAsync(
        locationOptions,
        (location) => this.handleLocationUpdate(location)
      );

      this.isTracking = true;

      // Save session to database
      await this.saveTrackingSession();

      console.log(`🎯 Started ${activityType} tracking for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<void> {
    try {
      if (!this.isTracking || !this.currentSession) {
        return;
      }

      // Stop location subscription
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      if (this.trackingTimer) {
        clearInterval(this.trackingTimer);
        this.trackingTimer = null;
      }

      // Update session end time
      this.currentSession.end_time = new Date().toISOString();
      this.currentSession.is_active = false;

      // Calculate total distance and duration
      if (this.currentSession.route_points.length > 1) {
        this.currentSession.total_distance = this.calculateTotalDistance(
          this.currentSession.route_points
        );
        this.currentSession.total_duration = 
          new Date(this.currentSession.end_time).getTime() - 
          new Date(this.currentSession.start_time).getTime();
      }

      // Save final session data
      await this.saveTrackingSession();

      this.isTracking = false;
      this.currentSession = null;

      console.log('🛑 Location tracking stopped');
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
    }
  }

  /**
   * Handle location updates
   */
  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    try {
      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        altitude: location.coords.altitude || undefined,
        altitudeAccuracy: location.coords.altitudeAccuracy || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

      // Get address for important locations
      if (this.shouldReverseGeocode(locationData)) {
        locationData.address = await this.reverseGeocode(
          locationData.latitude,
          locationData.longitude
        );
      }

      this.lastKnownLocation = locationData;

      // Add to current session
      if (this.currentSession) {
        this.currentSession.route_points.push(locationData);
        
        // Trim route points if too many (keep last 1000)
        if (this.currentSession.route_points.length > 1000) {
          this.currentSession.route_points = this.currentSession.route_points.slice(-1000);
        }
      }

      // Update location via Edge Function
      await this.updateLocationInDatabase(locationData);

      // Check geofences
      await this.checkGeofences(locationData);

      // Send real-time updates to interested parties
      await this.broadcastLocationUpdate(locationData);

    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }

  /**
   * Update location in database via Edge Function
   */
  private async updateLocationInDatabase(location: LocationData): Promise<void> {
    if (!this.currentSession) return;

    try {
      await EdgeFunctionsService.updateLocation({
        user_id: this.currentSession.user_id,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
        activity_type: this.currentSession.activity_type as 'delivery' | 'service' | 'customer',
        related_id: this.currentSession.related_id,
        address: location.address,
      });
    } catch (error) {
      console.error('Failed to update location in database:', error);
    }
  }

  /**
   * Check if location triggers any geofences
   */
  private async checkGeofences(location: LocationData): Promise<void> {
    for (const geofence of this.geofenceAreas) {
      if (!geofence.is_active) continue;

      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.center.latitude,
        geofence.center.longitude
      );

      const isInside = distance <= geofence.radius;
      const wasInside = await this.wasInGeofence(geofence.id);

      // Geofence entry
      if (isInside && !wasInside) {
        await this.handleGeofenceEntry(geofence, location);
        await this.setGeofenceStatus(geofence.id, true);
      }
      // Geofence exit
      else if (!isInside && wasInside) {
        await this.handleGeofenceExit(geofence, location);
        await this.setGeofenceStatus(geofence.id, false);
      }
    }
  }

  /**
   * Handle geofence entry
   */
  private async handleGeofenceEntry(geofence: GeofenceArea, location: LocationData): Promise<void> {
    console.log(`📍 Entered geofence: ${geofence.name}`);

    if (!this.currentSession) return;

    // Send notification based on geofence type
    switch (geofence.area_type) {
      case 'service_area':
        if (this.currentSession.activity_type === 'service') {
          await EdgeFunctionsService.sendNotification({
            recipient_id: this.currentSession.user_id,
            type: 'service_arrival',
            title: 'Arrived at Service Location! 📍',
            message: `You've arrived at ${geofence.name}`,
            data: { geofence_id: geofence.id, location },
            send_push: true,
          });
        }
        break;
        
      case 'delivery_zone':
        if (this.currentSession.activity_type === 'delivery') {
          await EdgeFunctionsService.sendNotification({
            recipient_id: this.currentSession.user_id,
            type: 'delivery_update',
            title: 'Entered Delivery Zone! 🚛',
            message: `You've entered the delivery area for ${geofence.name}`,
            data: { geofence_id: geofence.id, location },
            send_push: true,
          });
        }
        break;
    }
  }

  /**
   * Handle geofence exit
   */
  private async handleGeofenceExit(geofence: GeofenceArea, location: LocationData): Promise<void> {
    console.log(`📍 Exited geofence: ${geofence.name}`);
    
    // Could trigger completion notifications, time tracking, etc.
  }

  /**
   * Broadcast location update to interested parties
   */
  private async broadcastLocationUpdate(location: LocationData): Promise<void> {
    if (!this.currentSession?.related_id) return;

    try {
      // Real-time location channel for customers tracking service providers
      await supabase
        .channel(`location_updates_${this.currentSession.related_id}`)
        .send({
          type: 'broadcast',
          event: 'location_update',
          payload: {
            user_id: this.currentSession.user_id,
            activity_type: this.currentSession.activity_type,
            location,
            timestamp: new Date().toISOString(),
          },
        });
    } catch (error) {
      console.error('Failed to broadcast location update:', error);
    }
  }

  /**
   * Get current location (one-time)
   */
  async getCurrentLocation(highAccuracy = false): Promise<LocationData | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: highAccuracy 
          ? Location.Accuracy.BestForNavigation 
          : Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        altitude: location.coords.altitude || undefined,
        altitudeAccuracy: location.coords.altitudeAccuracy || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

      // Get address
      locationData.address = await this.reverseGeocode(
        locationData.latitude,
        locationData.longitude
      );

      this.lastKnownLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  /**
   * Find nearby users/businesses
   */
  async findNearbyUsers(
    location: LocationData,
    radius = 5000, // 5km default
    userType?: 'customer' | 'business',
    businessCategory?: string
  ): Promise<NearbyUser[]> {
    try {
      // Call Supabase function to find nearby users using PostGIS
      const { data, error } = await supabase.functions.invoke('find-nearby-users', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius_meters: radius,
          user_type: userType,
          business_category: businessCategory,
        },
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to find nearby users:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }

  /**
   * Calculate total distance traveled
   */
  private calculateTotalDistance(routePoints: LocationData[]): number {
    let totalDistance = 0;
    
    for (let i = 1; i < routePoints.length; i++) {
      const distance = this.calculateDistance(
        routePoints[i-1].latitude,
        routePoints[i-1].longitude,
        routePoints[i].latitude,
        routePoints[i].longitude
      );
      totalDistance += distance;
    }
    
    return totalDistance;
  }

  /**
   * Reverse geocode location to address
   */
  private async reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
    try {
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (geocoded && geocoded.length > 0) {
        const address = geocoded[0];
        return `${address.name || ''} ${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
      }
      
      return undefined;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return undefined;
    }
  }

  /**
   * Create geofence area
   */
  async createGeofence(geofence: Omit<GeofenceArea, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('geofence_areas')
        .insert({
          ...geofence,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      // Add to local cache
      this.geofenceAreas.push({ ...geofence, id: data.id });
      
      return data.id;
    } catch (error) {
      console.error('Failed to create geofence:', error);
      return null;
    }
  }

  /**
   * Load geofence areas
   */
  private async loadGeofenceAreas(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('geofence_areas')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      this.geofenceAreas = data || [];
    } catch (error) {
      console.error('Failed to load geofence areas:', error);
    }
  }

  /**
   * Load user location settings
   */
  private async loadLocationSettings(): Promise<void> {
    // Implementation would load from database/storage
    console.log('Location settings loaded');
  }

  /**
   * Get location settings for user
   */
  private async getLocationSettings(userId: string): Promise<LocationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('location_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Failed to get location settings:', error);
      return null;
    }
  }

  /**
   * Save tracking session to database
   */
  private async saveTrackingSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      await supabase
        .from('tracking_sessions')
        .upsert(this.currentSession);
    } catch (error) {
      console.error('Failed to save tracking session:', error);
    }
  }

  /**
   * Check if should reverse geocode this location
   */
  private shouldReverseGeocode(location: LocationData): boolean {
    // Only geocode if we don't have recent address or location changed significantly
    if (!this.lastKnownLocation) return true;
    
    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      this.lastKnownLocation.latitude,
      this.lastKnownLocation.longitude
    );
    
    return distance > 100; // 100 meters threshold
  }

  /**
   * Check if was inside geofence (from local storage)
   */
  private async wasInGeofence(geofenceId: string): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(`geofence_${geofenceId}`);
      return status === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Set geofence status in local storage
   */
  private async setGeofenceStatus(geofenceId: string, isInside: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(`geofence_${geofenceId}`, String(isInside));
    } catch (error) {
      console.error('Failed to set geofence status:', error);
    }
  }

  /**
   * Subscribe to location updates for a specific service/delivery
   */
  subscribeToLocationUpdates(
    relatedId: string,
    callback: (locationUpdate: any) => void
  ): () => void {
    const subscription = supabase
      .channel(`location_updates_${relatedId}`)
      .on('broadcast', { event: 'location_update' }, callback)
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }

  /**
   * Get location history for a user
   */
  async getLocationHistory(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit = 100
  ): Promise<LocationData[]> {
    try {
      let query = supabase
        .from('location_history')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('recorded_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('recorded_at', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map((item: any) => ({
        latitude: item.location.coordinates[1],
        longitude: item.location.coordinates[0],
        accuracy: item.accuracy,
        speed: item.speed,
        heading: item.heading,
        timestamp: new Date(item.recorded_at).getTime(),
        address: item.address,
      })) || [];
    } catch (error) {
      console.error('Failed to get location history:', error);
      return [];
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
      this.trackingTimer = null;
    }
    
    this.isTracking = false;
    this.currentSession = null;
  }
}

// Export singleton instance
export const liveLocationService = LiveLocationService.getInstance();