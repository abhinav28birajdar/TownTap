import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Business {
  id: string;
  business_name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  phone_number?: string;
  email: string;
  rating: number;
  total_reviews: number;
  is_open: boolean;
  delivery_available: boolean;
  latitude: number;
  longitude: number;
  distance_km: number;
  image_url?: string;
  logo_url?: string;
  landmark?: string;
  website_url?: string;
  pincode?: string;
  whatsapp_number?: string;
  services?: string;
  created_at?: string;
}

export function useLocationBasedRealtime(radiusKm: number = 20) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          // Use default location (Mumbai)
          setUserLocation({ latitude: 19.076, longitude: 72.8777 });
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        console.log('📍 User location obtained:', location.coords);
      } catch (err) {
        console.error('Error getting location:', err);
        // Use default location
        setUserLocation({ latitude: 19.076, longitude: 72.8777 });
      }
    };

    getUserLocation();
  }, []);

  // Load nearby businesses when location is available
  const loadNearbyBusinesses = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Loading businesses within ${radiusKm}km of`, userLocation);

      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: userLocation.latitude,
        user_lng: userLocation.longitude,
        radius_km: radiusKm,
        category_filter: null,
        limit_count: 100
      });

      if (error) {
        console.error('Error loading nearby businesses:', error);
        setError(error.message);
        
        // Fallback: try to get businesses directly from table
        console.log('🔄 Falling back to direct table query...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('businesses')
          .select(`
            id,
            business_name,
            description,
            category,
            address,
            city,
            phone,
            phone_number,
            email,
            rating,
            total_reviews,
            is_open,
            delivery_available,
            latitude,
            longitude,
            image_url,
            logo_url,
            landmark,
            website_url,
            pincode,
            whatsapp_number,
            services,
            created_at
          `)
          .eq('is_active', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .limit(50);

        if (!fallbackError && fallbackData) {
          // Calculate distances manually and filter
          const businessesWithDistance = fallbackData
            .map(business => ({
              ...business,
              distance_km: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                business.latitude,
                business.longitude
              ),
              phone: business.phone_number || business.phone
            }))
            .filter(business => business.distance_km <= radiusKm)
            .sort((a, b) => a.distance_km - b.distance_km);

          setBusinesses(businessesWithDistance);
          console.log(`✅ Fallback: Loaded ${businessesWithDistance.length} nearby businesses`);
          setError(null);
        }
      } else {
        setBusinesses(data || []);
        console.log(`✅ Loaded ${data?.length || 0} nearby businesses`);
      }
    } catch (err: any) {
      console.error('Error in loadNearbyBusinesses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time subscription for businesses
  useEffect(() => {
    if (!userLocation) return;

    loadNearbyBusinesses();

    console.log('📡 Setting up real-time subscription for businesses...');
    
    const channel = supabase
      .channel('businesses-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'businesses',
        },
        async (payload) => {
          console.log('📡 Business real-time update:', payload.eventType, payload);

          if (payload.eventType === 'INSERT') {
            const newBusiness = payload.new;
            
            // Check if new business is within range
            if (newBusiness.latitude && newBusiness.longitude && userLocation) {
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                newBusiness.latitude,
                newBusiness.longitude
              );

              if (distance <= radiusKm) {
                const businessWithDistance: Business = {
                  id: newBusiness.id,
                  business_name: newBusiness.business_name,
                  description: newBusiness.description || '',
                  category: newBusiness.category || '',
                  address: newBusiness.address || '',
                  city: newBusiness.city || '',
                  phone: newBusiness.phone_number || newBusiness.phone || '',
                  email: newBusiness.email || '',
                  rating: newBusiness.rating || 0,
                  total_reviews: newBusiness.total_reviews || 0,
                  is_open: newBusiness.is_open ?? true,
                  delivery_available: newBusiness.delivery_available ?? false,
                  latitude: newBusiness.latitude,
                  longitude: newBusiness.longitude,
                  distance_km: distance,
                  image_url: newBusiness.image_url,
                  logo_url: newBusiness.logo_url,
                  landmark: newBusiness.landmark,
                  website_url: newBusiness.website_url,
                  pincode: newBusiness.pincode,
                  whatsapp_number: newBusiness.whatsapp_number,
                  services: newBusiness.services,
                  created_at: newBusiness.created_at
                };
                
                setBusinesses(current => {
                  // Check if business already exists
                  const exists = current.find(b => b.id === newBusiness.id);
                  if (!exists) {
                    console.log(`✅ New business "${newBusiness.business_name}" added to real-time list (${distance.toFixed(2)}km away)`);
                    return [...current, businessWithDistance].sort((a, b) => a.distance_km - b.distance_km);
                  }
                  return current;
                });
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedBusiness = payload.new;
            
            if (updatedBusiness.latitude && updatedBusiness.longitude && userLocation) {
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                updatedBusiness.latitude,
                updatedBusiness.longitude
              );

              if (distance <= radiusKm) {
                const businessWithDistance: Business = {
                  id: updatedBusiness.id,
                  business_name: updatedBusiness.business_name,
                  description: updatedBusiness.description || '',
                  category: updatedBusiness.category || '',
                  address: updatedBusiness.address || '',
                  city: updatedBusiness.city || '',
                  phone: updatedBusiness.phone_number || updatedBusiness.phone || '',
                  email: updatedBusiness.email || '',
                  rating: updatedBusiness.rating || 0,
                  total_reviews: updatedBusiness.total_reviews || 0,
                  is_open: updatedBusiness.is_open ?? true,
                  delivery_available: updatedBusiness.delivery_available ?? false,
                  latitude: updatedBusiness.latitude,
                  longitude: updatedBusiness.longitude,
                  distance_km: distance,
                  image_url: updatedBusiness.image_url,
                  logo_url: updatedBusiness.logo_url,
                  landmark: updatedBusiness.landmark,
                  website_url: updatedBusiness.website_url,
                  pincode: updatedBusiness.pincode,
                  whatsapp_number: updatedBusiness.whatsapp_number,
                  services: updatedBusiness.services,
                  created_at: updatedBusiness.created_at
                };
                
                setBusinesses(current => 
                  current.map(business => 
                    business.id === updatedBusiness.id ? businessWithDistance : business
                  ).sort((a, b) => a.distance_km - b.distance_km)
                );
                console.log(`📝 Business "${updatedBusiness.business_name}" updated in real-time`);
              } else {
                // Remove if no longer in range
                setBusinesses(current => {
                  const filtered = current.filter(business => business.id !== updatedBusiness.id);
                  if (filtered.length < current.length) {
                    console.log(`🚫 Business "${updatedBusiness.business_name}" removed (out of range)`);
                  }
                  return filtered;
                });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedBusiness = payload.old;
            setBusinesses(current => {
              const filtered = current.filter(business => business.id !== deletedBusiness.id);
              if (filtered.length < current.length) {
                console.log(`🗑️ Business "${deletedBusiness.business_name}" removed (deleted)`);
              }
              return filtered;
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for businesses');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error for businesses');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      console.log('🔌 Disconnected from businesses real-time');
    };
  }, [userLocation, radiusKm]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return {
    businesses,
    userLocation,
    loading,
    error,
    refetch: loadNearbyBusinesses,
  };
}
