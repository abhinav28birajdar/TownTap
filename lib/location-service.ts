import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { apiKeyManager } from './api-key-manager';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends LocationCoordinates {
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface AddressComponents {
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface GeocodeResult extends LocationCoordinates, AddressComponents {}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  coordinates: LocationCoordinates;
  types: string[];
  rating?: number;
  vicinity?: string;
  openingHours?: {
    openNow: boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  photos?: string[];
}

export interface SearchFilters {
  radius?: number; // in meters
  types?: string[];
  minRating?: number;
  openNow?: boolean;
  priceLevel?: number[];
}

interface LocationServiceConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  distanceFilter: number;
}

class LocationService {
  private currentLocation: LocationData | null = null;
  private watchSubscription: Location.LocationSubscription | null = null;
  private readonly LOCATION_CACHE_KEY = 'cached_location';
  private readonly LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_CONFIG: LocationServiceConfig = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    distanceFilter: 10,
  };

  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.warn('Foreground location permission not granted');
        return false;
      }

      // For background location (optional)
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted');
      }

      console.log('✅ Location permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location with caching
   */
  async getCurrentLocation(config?: Partial<LocationServiceConfig>): Promise<LocationData | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }

      // Check cached location first
      const cachedLocation = await this.getCachedLocation();
      if (cachedLocation) {
        this.currentLocation = cachedLocation;
        return cachedLocation;
      }

      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: finalConfig.enableHighAccuracy 
          ? Location.Accuracy.High 
          : Location.Accuracy.Balanced,
        timeInterval: finalConfig.maximumAge,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

      // Cache the location
      await this.cacheLocation(locationData);
      this.currentLocation = locationData;

      console.log('✅ Location obtained:', locationData.latitude, locationData.longitude);
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start watching location changes
   */
  async startLocationUpdates(
    callback: (location: LocationData) => void,
    config?: Partial<LocationServiceConfig>
  ): Promise<boolean> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          return false;
        }
      }

      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: finalConfig.enableHighAccuracy 
            ? Location.Accuracy.High 
            : Location.Accuracy.Balanced,
          timeInterval: finalConfig.timeout,
          distanceInterval: finalConfig.distanceFilter,
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          };

          this.currentLocation = locationData;
          this.cacheLocation(locationData);
          callback(locationData);
        }
      );

      console.log('✅ Location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting location updates:', error);
      return false;
    }
  }

  /**
   * Stop watching location changes
   */
  async stopLocationUpdates(): Promise<void> {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
      console.log('🛑 Location tracking stopped');
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: LocationCoordinates, point2: LocationCoordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else if (distanceInMeters < 10000) {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    } else {
      return `${Math.round(distanceInMeters / 1000)}km`;
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    try {
      const results = await Location.geocodeAsync(address);
      
      return results.map((result) => ({
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: address, // Expo doesn't provide formatted address in geocoding
      }));
    } catch (error) {
      console.error('Error geocoding address:', error);
      return [];
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(coordinates: LocationCoordinates): Promise<AddressComponents | null> {
    try {
      const results = await Location.reverseGeocodeAsync(coordinates);
      
      if (results.length > 0) {
        const result = results[0];
        return {
          streetNumber: result.streetNumber || undefined,
          street: result.street || undefined,
          city: result.city || undefined,
          state: result.region || undefined,
          country: result.country || undefined,
          postalCode: result.postalCode || undefined,
          formattedAddress: this.formatAddress(result),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Search for nearby places using Google Places API
   */
  async searchNearbyPlaces(
    coordinates: LocationCoordinates,
    query: string,
    filters?: SearchFilters
  ): Promise<PlaceDetails[]> {
    try {
      const apiKey = await apiKeyManager.getKeyByName('google-maps', 'google');
      if (!apiKey) {
        throw new Error('Google Maps API key not found');
      }

      const radius = filters?.radius || 5000; // Default 5km
      const type = filters?.types?.[0] || '';
      
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${coordinates.latitude},${coordinates.longitude}&` +
        `radius=${radius}&` +
        `keyword=${encodeURIComponent(query)}&` +
        (type ? `type=${type}&` : '') +
        `key=${apiKey.key}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Places API error: ${data.status}`);
      }

      return data.results.map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        formattedAddress: place.vicinity,
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        types: place.types,
        rating: place.rating,
        vicinity: place.vicinity,
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
        } : undefined,
        photos: place.photos ? place.photos.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey.key}`
        ) : undefined,
      }));
    } catch (error) {
      console.error('Error searching nearby places:', error);
      return [];
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const apiKey = await apiKeyManager.getKeyByName('google-maps', 'google');
      if (!apiKey) {
        throw new Error('Google Maps API key not found');
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${placeId}&` +
        `fields=name,formatted_address,geometry,rating,opening_hours,photos,types&` +
        `key=${apiKey.key}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Place Details API error: ${data.status}`);
      }

      const place = data.result;
      return {
        placeId: place.place_id,
        name: place.name,
        formattedAddress: place.formatted_address,
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        types: place.types,
        rating: place.rating,
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
          periods: place.opening_hours.periods,
        } : undefined,
        photos: place.photos ? place.photos.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey.key}`
        ) : undefined,
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(
    input: string,
    coordinates?: LocationCoordinates,
    radius?: number
  ): Promise<Array<{ description: string; placeId: string }>> {
    try {
      const apiKey = await apiKeyManager.getKeyByName('google-maps', 'google');
      if (!apiKey) {
        throw new Error('Google Maps API key not found');
      }

      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(input)}&` +
        `key=${apiKey.key}`;

      if (coordinates && radius) {
        url += `&location=${coordinates.latitude},${coordinates.longitude}&radius=${radius}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        return [];
      }

      return data.predictions.map((prediction: any) => ({
        description: prediction.description,
        placeId: prediction.place_id,
      }));
    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error);
      return [];
    }
  }

  /**
   * Check if a location is within a specified radius of another location
   */
  isWithinRadius(
    center: LocationCoordinates,
    point: LocationCoordinates,
    radiusInMeters: number
  ): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radiusInMeters;
  }

  /**
   * Get cached location
   */
  private async getCachedLocation(): Promise<LocationData | null> {
    try {
      const cached = await AsyncStorage.getItem(this.LOCATION_CACHE_KEY);
      if (!cached) return null;

      const locationData: LocationData & { cacheTime: number } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - locationData.cacheTime > this.LOCATION_CACHE_DURATION) {
        await AsyncStorage.removeItem(this.LOCATION_CACHE_KEY);
        return null;
      }

      // Remove cache time before returning
      const { cacheTime, ...location } = locationData;
      return location;
    } catch (error) {
      console.error('Error getting cached location:', error);
      return null;
    }
  }

  /**
   * Cache location data
   */
  private async cacheLocation(location: LocationData): Promise<void> {
    try {
      const locationWithCache = {
        ...location,
        cacheTime: Date.now(),
      };
      
      await AsyncStorage.setItem(
        this.LOCATION_CACHE_KEY,
        JSON.stringify(locationWithCache)
      );
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  /**
   * Format address from reverse geocoding result
   */
  private formatAddress(result: Location.LocationGeocodedAddress): string {
    const parts = [
      result.streetNumber,
      result.street,
      result.city,
      result.region,
      result.country,
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Get current cached location without making new request
   */
  get cachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Clear location cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.LOCATION_CACHE_KEY);
      this.currentLocation = null;
      console.log('📍 Location cache cleared');
    } catch (error) {
      console.error('Error clearing location cache:', error);
    }
  }
}

// Create and export singleton instance
export const locationService = new LocationService();

export default locationService;