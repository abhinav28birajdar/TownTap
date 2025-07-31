import { supabase } from '../lib/supabase';

// Real-time tracking interfaces
export interface LocationUpdate {
  id: string;
  orderId: string;
  serviceProviderId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  status: 'en_route' | 'arrived' | 'on_site' | 'completed' | 'offline';
}

export interface GeofenceArea {
  id: string;
  orderId: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'pickup' | 'delivery' | 'service_location';
  isActive: boolean;
}

export interface RouteOptimization {
  serviceProviderId: string;
  orders: Array<{
    orderId: string;
    location: { latitude: number; longitude: number };
    timeWindow?: { start: string; end: string };
    priority: number;
    estimatedDuration: number;
  }>;
  optimizedRoute: Array<{
    orderId: string;
    sequence: number;
    estimatedArrival: string;
    travelTime: number;
    distance: number;
  }>;
  totalDistance: number;
  totalTime: number;
}

export interface TrafficUpdate {
  route: string;
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  estimatedDelay: number;
  alternativeRoutes?: Array<{
    route: string;
    estimatedTime: number;
    distance: number;
  }>;
}

export class RealTimeTrackingService {
  private static locationWatchers: Map<string, number> = new Map();
  private static geofenceCheckers: Map<string, NodeJS.Timeout> = new Map();

  // =====================================================
  // REAL-TIME LOCATION TRACKING
  // =====================================================

  static async startLocationTracking(
    orderId: string,
    serviceProviderId: string,
    updateInterval: number = 30000 // 30 seconds
  ): Promise<void> {
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Stop existing tracking if any
      this.stopLocationTracking(serviceProviderId);

      // Start tracking
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          await this.updateLocation({
            orderId,
            serviceProviderId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            timestamp: new Date().toISOString(),
            status: 'en_route'
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.handleLocationError(orderId, serviceProviderId, error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );

      this.locationWatchers.set(serviceProviderId, watchId);

      // Set up periodic updates for better accuracy
      const intervalId = setInterval(async () => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await this.updateLocation({
              orderId,
              serviceProviderId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || undefined,
              heading: position.coords.heading || undefined,
              timestamp: new Date().toISOString(),
              status: 'en_route'
            });
          },
          (error) => console.error('Periodic location update error:', error)
        );
      }, updateInterval);

      // Store interval ID for cleanup
      this.locationWatchers.set(`${serviceProviderId}_interval`, intervalId as any);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to start location tracking');
    }
  }

  static stopLocationTracking(serviceProviderId: string): void {
    const watchId = this.locationWatchers.get(serviceProviderId);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      this.locationWatchers.delete(serviceProviderId);
    }

    const intervalId = this.locationWatchers.get(`${serviceProviderId}_interval`);
    if (intervalId) {
      clearInterval(intervalId);
      this.locationWatchers.delete(`${serviceProviderId}_interval`);
    }
  }

  private static async updateLocation(locationData: Omit<LocationUpdate, 'id'>): Promise<LocationUpdate> {
    try {
      const { data, error } = await supabase
        .from('location_updates')
        .insert(locationData)
        .select()
        .single();

      if (error) throw error;

      // Send real-time update to subscribers
      await this.broadcastLocationUpdate(data as LocationUpdate);

      // Check geofences
      await this.checkGeofences(locationData.orderId, locationData.latitude, locationData.longitude);

      // Update order status if needed
      await this.updateOrderStatusBasedOnLocation(locationData.orderId, locationData);

      return data as LocationUpdate;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update location');
    }
  }

  private static async handleLocationError(
    orderId: string,
    serviceProviderId: string,
    error: GeolocationPositionError
  ): Promise<void> {
    try {
      let errorMessage = 'Location tracking error';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      // Log error and notify relevant parties
      await supabase
        .from('location_errors')
        .insert({
          order_id: orderId,
          service_provider_id: serviceProviderId,
          error_message: errorMessage,
          error_code: error.code,
          timestamp: new Date().toISOString()
        });

      // Broadcast error to subscribers
      await this.broadcastTrackingError(orderId, errorMessage);
    } catch (error) {
      console.error('Failed to handle location error:', error);
    }
  }

  // =====================================================
  // GEOFENCING
  // =====================================================

  static async createGeofence(geofenceData: Omit<GeofenceArea, 'id'>): Promise<GeofenceArea> {
    try {
      const { data, error } = await supabase
        .from('geofence_areas')
        .insert(geofenceData)
        .select()
        .single();

      if (error) throw error;
      return data as GeofenceArea;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create geofence');
    }
  }

  private static async checkGeofences(
    orderId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    try {
      const { data: geofences, error } = await supabase
        .from('geofence_areas')
        .select('*')
        .eq('order_id', orderId)
        .eq('is_active', true);

      if (error) throw error;

      for (const geofence of geofences || []) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          geofence.latitude,
          geofence.longitude
        );

        const isInside = distance <= geofence.radius;

        if (isInside) {
          await this.handleGeofenceEntry(orderId, geofence);
        }
      }
    } catch (error: any) {
      console.error('Failed to check geofences:', error);
    }
  }

  private static async handleGeofenceEntry(orderId: string, geofence: GeofenceArea): Promise<void> {
    try {
      // Log geofence entry
      await supabase
        .from('geofence_events')
        .insert({
          order_id: orderId,
          geofence_id: geofence.id,
          event_type: 'entry',
          timestamp: new Date().toISOString()
        });

      // Update order status based on geofence type
      let newStatus = '';
      switch (geofence.type) {
        case 'pickup':
          newStatus = 'arrived_pickup';
          break;
        case 'delivery':
        case 'service_location':
          newStatus = 'arrived';
          break;
      }

      if (newStatus) {
        await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);
      }

      // Send notification
      await this.broadcastGeofenceEvent(orderId, geofence, 'entry');
    } catch (error: any) {
      console.error('Failed to handle geofence entry:', error);
    }
  }

  // =====================================================
  // ROUTE OPTIMIZATION
  // =====================================================

  static async optimizeRoute(
    serviceProviderId: string,
    orders: RouteOptimization['orders'],
    startLocation?: { latitude: number; longitude: number }
  ): Promise<RouteOptimization> {
    try {
      // Simple route optimization algorithm
      // In production, use Google Maps Directions API or similar
      const optimizedRoute = await this.calculateOptimizedRoute(orders, startLocation);

      const routeOptimization: RouteOptimization = {
        serviceProviderId,
        orders,
        optimizedRoute,
        totalDistance: optimizedRoute.reduce((sum, route) => sum + route.distance, 0),
        totalTime: optimizedRoute.reduce((sum, route) => sum + route.travelTime, 0)
      };

      // Save optimization result
      await supabase
        .from('route_optimizations')
        .insert({
          service_provider_id: serviceProviderId,
          route_data: routeOptimization,
          created_at: new Date().toISOString()
        });

      return routeOptimization;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to optimize route');
    }
  }

  private static async calculateOptimizedRoute(
    orders: RouteOptimization['orders'],
    startLocation?: { latitude: number; longitude: number }
  ): Promise<RouteOptimization['optimizedRoute']> {
    // Simple nearest neighbor algorithm
    // In production, use more sophisticated algorithms
    const unvisited = [...orders];
    const route: RouteOptimization['optimizedRoute'] = [];
    let currentLocation = startLocation;

    let sequence = 1;
    while (unvisited.length > 0) {
      let nearest = unvisited[0];
      let nearestIndex = 0;
      let shortestDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const distance = currentLocation
          ? this.calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              unvisited[i].location.latitude,
              unvisited[i].location.longitude
            )
          : 0;

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearest = unvisited[i];
          nearestIndex = i;
        }
      }

      // Calculate estimated arrival time
      const travelTime = shortestDistance / 40 * 60; // Assuming 40km/h average speed
      const baseTime = route.length > 0 
        ? new Date(route[route.length - 1].estimatedArrival).getTime()
        : Date.now();
      const estimatedArrival = new Date(baseTime + travelTime * 60000).toISOString();

      route.push({
        orderId: nearest.orderId,
        sequence,
        estimatedArrival,
        travelTime,
        distance: shortestDistance
      });

      currentLocation = nearest.location;
      unvisited.splice(nearestIndex, 1);
      sequence++;
    }

    return route;
  }

  // =====================================================
  // TRAFFIC AND ETA UPDATES
  // =====================================================

  static async getTrafficUpdate(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<TrafficUpdate> {
    try {
      // In production, integrate with Google Maps Traffic API or similar
      // For now, return mock data
      const baseTime = this.calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      ) / 40 * 60; // minutes

      const congestionLevel: TrafficUpdate['congestionLevel'] = 
        Math.random() > 0.7 ? 'high' : 
        Math.random() > 0.4 ? 'medium' : 'low';

      const delayMultiplier = {
        'low': 1.0,
        'medium': 1.3,
        'high': 1.6,
        'severe': 2.0
      };

      const estimatedDelay = baseTime * (delayMultiplier[congestionLevel] - 1);

      return {
        route: `${origin.latitude},${origin.longitude} to ${destination.latitude},${destination.longitude}`,
        congestionLevel,
        estimatedDelay,
        alternativeRoutes: [
          {
            route: 'Alternative Route 1',
            estimatedTime: baseTime * 1.1,
            distance: this.calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude) * 1.1
          }
        ]
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get traffic update');
    }
  }

  static async updateETAForOrder(orderId: string): Promise<void> {
    try {
      // Get current location and destination
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          latest_location:location_updates (
            latitude,
            longitude,
            timestamp
          )
        `)
        .eq('id', orderId)
        .single();

      if (!order || !order.latest_location) return;

      // Calculate ETA based on current location and destination
      const destination = {
        latitude: order.delivery_latitude || order.service_latitude,
        longitude: order.delivery_longitude || order.service_longitude
      };

      if (!destination.latitude || !destination.longitude) return;

      const trafficUpdate = await this.getTrafficUpdate(
        {
          latitude: order.latest_location.latitude,
          longitude: order.latest_location.longitude
        },
        destination
      );

      const distance = this.calculateDistance(
        order.latest_location.latitude,
        order.latest_location.longitude,
        destination.latitude,
        destination.longitude
      );

      const estimatedTravelTime = (distance / 40) * 60; // minutes
      const adjustedTime = estimatedTravelTime + trafficUpdate.estimatedDelay;
      const eta = new Date(Date.now() + adjustedTime * 60000).toISOString();

      // Update order with new ETA
      await supabase
        .from('orders')
        .update({ 
          estimated_arrival: eta,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      // Broadcast ETA update
      await this.broadcastETAUpdate(orderId, eta, trafficUpdate);
    } catch (error: any) {
      console.error('Failed to update ETA:', error);
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static async updateOrderStatusBasedOnLocation(
    orderId: string,
    locationData: Omit<LocationUpdate, 'id'>
  ): Promise<void> {
    try {
      // Get order details to determine appropriate status
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) return;

      // Update order status based on location and current status
      let newStatus = order.status;
      
      if (order.status === 'confirmed' && locationData.status === 'en_route') {
        newStatus = 'service_provider_en_route';
      } else if (locationData.status === 'arrived') {
        newStatus = 'service_provider_arrived';
      } else if (locationData.status === 'on_site') {
        newStatus = 'in_progress';
      }

      if (newStatus !== order.status) {
        await supabase
          .from('orders')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
    }
  }

  // =====================================================
  // REAL-TIME BROADCASTING
  // =====================================================

  private static async broadcastLocationUpdate(locationUpdate: LocationUpdate): Promise<void> {
    try {
      await supabase.channel('location_tracking').send({
        type: 'broadcast',
        event: 'location_update',
        payload: locationUpdate
      });
    } catch (error) {
      console.error('Failed to broadcast location update:', error);
    }
  }

  private static async broadcastGeofenceEvent(
    orderId: string,
    geofence: GeofenceArea,
    eventType: 'entry' | 'exit'
  ): Promise<void> {
    try {
      await supabase.channel('location_tracking').send({
        type: 'broadcast',
        event: 'geofence_event',
        payload: { orderId, geofence, eventType, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to broadcast geofence event:', error);
    }
  }

  private static async broadcastETAUpdate(
    orderId: string,
    eta: string,
    trafficUpdate: TrafficUpdate
  ): Promise<void> {
    try {
      await supabase.channel('location_tracking').send({
        type: 'broadcast',
        event: 'eta_update',
        payload: { orderId, eta, trafficUpdate, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to broadcast ETA update:', error);
    }
  }

  private static async broadcastTrackingError(orderId: string, errorMessage: string): Promise<void> {
    try {
      await supabase.channel('location_tracking').send({
        type: 'broadcast',
        event: 'tracking_error',
        payload: { orderId, errorMessage, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to broadcast tracking error:', error);
    }
  }

  // =====================================================
  // SUBSCRIPTION MANAGEMENT
  // =====================================================

  static subscribeToLocationTracking(
    orderId: string,
    callbacks: {
      onLocationUpdate?: (update: LocationUpdate) => void;
      onGeofenceEvent?: (event: any) => void;
      onETAUpdate?: (update: any) => void;
      onTrackingError?: (error: any) => void;
    }
  ) {
    const channel = supabase.channel(`location_tracking_${orderId}`);

    // Subscribe to location updates
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'location_updates',
      filter: `order_id=eq.${orderId}`
    }, (payload) => {
      callbacks.onLocationUpdate?.(payload.new as LocationUpdate);
    });

    // Subscribe to broadcast events
    channel.on('broadcast', { event: 'geofence_event' }, (payload) => {
      if (payload.payload.orderId === orderId) {
        callbacks.onGeofenceEvent?.(payload.payload);
      }
    });

    channel.on('broadcast', { event: 'eta_update' }, (payload) => {
      if (payload.payload.orderId === orderId) {
        callbacks.onETAUpdate?.(payload.payload);
      }
    });

    channel.on('broadcast', { event: 'tracking_error' }, (payload) => {
      if (payload.payload.orderId === orderId) {
        callbacks.onTrackingError?.(payload.payload);
      }
    });

    return channel.subscribe();
  }

  static async getOrderLocationHistory(orderId: string): Promise<LocationUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('location_updates')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data as LocationUpdate[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get location history');
    }
  }

  static async getCurrentServiceProviderLocation(serviceProviderId: string): Promise<LocationUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('location_updates')
        .select('*')
        .eq('service_provider_id', serviceProviderId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as LocationUpdate;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get current location');
    }
  }
}

export default RealTimeTrackingService;
