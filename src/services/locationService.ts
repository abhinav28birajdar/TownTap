import * as Location from 'expo-location';
import { isSupabaseConfigured, mockBusinessCategories, mockBusinesses, supabase } from '../lib/supabase';
import type {
    Business,
    BusinessCategory,
    BusinessSearchParams,
    Location as LocationType,
    NearbyBusinessesResponse
} from '../types/index_location';

export class LocationService {
  
  /**
   * Request location permissions from the user
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get current location of the user
   */
  static async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      // Return Mumbai coordinates as fallback
      return {
        latitude: 19.0760,
        longitude: 72.8777,
      };
    }
  }  /**
   * Get address from coordinates (Reverse Geocoding)
   */
  static async getAddressFromCoordinates(
    latitude: number, 
    longitude: number
  ): Promise<string> {
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result) {
        const addressParts = [
          result.name,
          result.street,
          result.city,
          result.region,
          result.postalCode,
        ].filter(Boolean);

        return addressParts.join(', ');
      }

      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  /**
   * Get coordinates from address (Forward Geocoding)
   */
  static async getCoordinatesFromAddress(address: string): Promise<LocationType | null> {
    try {
      const results = await Location.geocodeAsync(address);
      
      if (results.length > 0) {
        return {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points in kilometers
   */
  static calculateDistance(
    point1: LocationType, 
    point2: LocationType
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * 
      Math.cos(this.toRadians(point2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return parseFloat(distance.toFixed(2));
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get nearby businesses based on user location
   */
  static async getNearbyBusinesses(
    params: BusinessSearchParams
  ): Promise<NearbyBusinessesResponse> {
    try {
      if (!isSupabaseConfigured()) {
        // Return mock data for demo
        const { location, filters = {}, limit = 20 } = params;
        let filteredBusinesses = [...mockBusinesses];

        // Apply category filter
        if (filters.category_id) {
          filteredBusinesses = filteredBusinesses.filter(
            business => business.category_id === filters.category_id
          );
        }

        // Calculate distances and apply radius filter
        const businessesWithDistance = filteredBusinesses.map(business => {
          const distance = this.calculateDistance(location, business.location);
          return { ...business, distance_km: distance };
        }).filter(business => 
          business.distance_km <= (filters.radius_km || 5)
        ).sort((a, b) => a.distance_km - b.distance_km);

        return {
          businesses: businessesWithDistance.slice(0, limit),
          total_count: businessesWithDistance.length,
          radius_km: filters.radius_km || 5,
          center_location: location,
        };
      }

      const { location, filters = {}, limit = 20 } = params;
      const { 
        category_id, 
        radius_km = 5, 
        city, 
        rating_min, 
        is_verified 
      } = filters;

      // Use the database function for nearby businesses
      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_km,
        category_filter: category_id || null,
        limit_count: limit,
      });

      if (error) {
        throw error;
      }

      // Apply additional filters if needed
      let filteredBusinesses = data || [];

      if (city) {
        filteredBusinesses = filteredBusinesses.filter(
          (business: any) => 
            business.city?.toLowerCase().includes(city.toLowerCase())
        );
      }

      if (rating_min) {
        filteredBusinesses = filteredBusinesses.filter(
          (business: any) => business.rating >= rating_min
        );
      }

      if (is_verified !== undefined) {
        filteredBusinesses = filteredBusinesses.filter(
          (business: any) => business.is_verified === is_verified
        );
      }

      // Transform the data to match our Business interface
      const businesses: Business[] = filteredBusinesses.map((business: any) => ({
        id: business.id,
        owner_id: '', // Not included in the function response
        category_id: '', // Not included in the function response
        business_name: business.business_name,
        description: business.description,
        phone_number: business.phone_number,
        whatsapp_number: '', // Not included in the function response
        email: '', // Not included in the function response
        website_url: '', // Not included in the function response
        location: {
          latitude: business.latitude,
          longitude: business.longitude,
        },
        address: business.address,
        city: '', // Not included in the function response
        state: '', // Not included in the function response
        pincode: '', // Not included in the function response
        landmark: '', // Not included in the function response
        business_hours: {}, // Not included in the function response
        services: [], // Not included in the function response
        images: business.images || [],
        rating: business.rating || 0,
        total_reviews: business.total_reviews || 0,
        is_verified: false, // Not included in the function response
        is_active: true,
        created_at: '',
        updated_at: '',
        distance_km: business.distance_km,
        category: {
          id: '',
          name: business.category_name,
          icon: business.category_icon,
          description: '',
          created_at: '',
        },
      }));

      return {
        businesses,
        total_count: businesses.length,
        radius_km,
        center_location: location,
      };
    } catch (error) {
      console.error('Error getting nearby businesses:', error);
      return {
        businesses: [],
        total_count: 0,
        radius_km: params.filters?.radius_km || 5,
        center_location: params.location,
      };
    }
  }

  /**
   * Get all business categories
   */
  static async getBusinessCategories(): Promise<BusinessCategory[]> {
    try {
      if (!isSupabaseConfigured()) {
        // Return mock data for demo
        return mockBusinessCategories;
      }

      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting business categories:', error);
      // Return mock data as fallback
      return mockBusinessCategories;
    }
  }

  /**
   * Search businesses by name or description
   */
  static async searchBusinesses(
    query: string,
    location: LocationType,
    filters?: {
      category_id?: string;
      radius_km?: number;
    }
  ): Promise<Business[]> {
    try {
      const searchParams: BusinessSearchParams = {
        location,
        filters: {
          ...filters,
          radius_km: filters?.radius_km || 10, // Expand search radius for text search
        },
        limit: 50,
      };

      const nearbyResult = await this.getNearbyBusinesses(searchParams);
      
      // Filter by search query
      const searchResults = nearbyResult.businesses.filter(business => 
        business.business_name.toLowerCase().includes(query.toLowerCase()) ||
        business.description?.toLowerCase().includes(query.toLowerCase()) ||
        business.services?.some(service => 
          service.toLowerCase().includes(query.toLowerCase())
        )
      );

      return searchResults;
    } catch (error) {
      console.error('Error searching businesses:', error);
      return [];
    }
  }

  /**
   * Track business view for analytics
   */
  static async trackBusinessView(businessId: string): Promise<void> {
    try {
      await supabase.rpc('track_business_view', {
        business_uuid: businessId,
      });
    } catch (error) {
      console.error('Error tracking business view:', error);
    }
  }

  /**
   * Get business details by ID
   */
  static async getBusinessById(businessId: string): Promise<Business | null> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          category:business_categories(*),
          owner:profiles(*)
        `)
        .eq('id', businessId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      // Track the view
      this.trackBusinessView(businessId);

      // Transform the data
      const business: Business = {
        ...data,
        location: {
          latitude: data.location ? parseFloat(data.location.coordinates[1]) : 0,
          longitude: data.location ? parseFloat(data.location.coordinates[0]) : 0,
        },
        category: data.category,
        owner: data.owner,
      };

      return business;
    } catch (error) {
      console.error('Error getting business by ID:', error);
      return null;
    }
  }
}
