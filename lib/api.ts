import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

type Category = Database['public']['Tables']['categories']['Row'];
type Business = Database['public']['Tables']['businesses']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Category[];
};

// Businesses
export const getBusinesses = async (categoryId?: string) => {
  let query = supabase
    .from('businesses')
    .select(`
      *,
      categories(name, slug, icon)
    `)
    .eq('is_verified', true);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('avg_rating', { ascending: false });

  if (error) throw error;
  return data;
};

export const getBusinessById = async (id: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      categories(name, slug, icon),
      services(*),
      reviews(*, profiles(full_name, avatar_url))
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const searchBusinesses = async (query: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      categories(name, slug, icon)
    `)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_verified', true)
    .order('avg_rating', { ascending: false });

  if (error) throw error;
  return data;
};

// Services
export const getServicesByBusinessId = async (businessId: string) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId);

  if (error) throw error;
  return data as Service[];
};

// Bookings
export const createBooking = async (booking: Database['public']['Tables']['bookings']['Insert']) => {
  // @ts-ignore
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

export const getCustomerBookings = async (customerId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      businesses(name, phone, address),
      services(title, price)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getBusinessBookings = async (businessId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles(full_name, phone, avatar_url),
      services(title, price)
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
) => {
  // @ts-ignore
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Reviews
export const createReview = async (review: Database['public']['Tables']['reviews']['Insert']) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;

  // Update business avg_rating and total_reviews
  await updateBusinessRating(review.business_id);

  return data;
};

const updateBusinessRating = async (businessId: string) => {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('business_id', businessId);

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    // @ts-ignore
    await supabase
      .from('businesses')
      .update({
        avg_rating: Number(avgRating.toFixed(1)),
        total_reviews: reviews.length,
      })
      .eq('id', businessId);
  }
};

// Notifications
export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
};

// Location tracking
export const updateLocation = async (
  bookingId: string,
  businessId: string,
  latitude: number,
  longitude: number,
  speed?: number,
  accuracy?: number
) => {
  // @ts-ignore
  const { error } = await supabase.from('locations').insert({
    booking_id: bookingId,
    business_id: businessId,
    latitude,
    longitude,
    speed: speed ?? null,
    accuracy: accuracy ?? null,
  });

  if (error) throw error;
};

export const getLatestLocation = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
