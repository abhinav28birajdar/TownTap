-- ================================================
-- 🚨 CRITICAL: COMPREHENSIVE DATABASE FIX
-- ================================================

-- 1. Fix RLS policies for profiles table
-- ================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create more permissive policies that allow profile creation during signup
CREATE POLICY "Enable read access for own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Enable insert for authenticated users and service role" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.role() = 'service_role' OR
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

-- 2. Create automatic profile creation trigger
-- ================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    user_type,
    avatar_url,
    is_verified,
    email_verified,
    phone_verified,
    date_of_birth,
    gender,
    language_preference,
    notification_preferences,
    referral_code,
    referred_by,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    NULL,
    false,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.phone_confirmed_at IS NOT NULL,
    NULL,
    NULL,
    'en',
    '{"push": true, "email": true, "sms": true}'::jsonb,
    COALESCE(NEW.raw_user_meta_data->>'referral_code', substr(md5(random()::text), 1, 8)),
    NEW.raw_user_meta_data->>'referred_by',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create missing get_nearby_businesses function
-- ================================================

-- Create PostGIS extension if not exists
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create the get_nearby_businesses function
CREATE OR REPLACE FUNCTION public.get_nearby_businesses(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 20,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category_id UUID,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  business_hours JSONB,
  services TEXT[],
  images TEXT[],
  is_verified BOOLEAN,
  is_open BOOLEAN,
  rating DOUBLE PRECISION,
  total_reviews INTEGER,
  delivery_available BOOLEAN,
  delivery_radius DOUBLE PRECISION,
  min_order_amount DOUBLE PRECISION,
  delivery_fee DOUBLE PRECISION,
  estimated_delivery_time INTEGER,
  distance_km DOUBLE PRECISION,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.category_id,
    b.phone,
    b.email,
    b.website_url,
    b.address,
    b.city,
    b.state,
    b.pincode,
    b.latitude,
    b.longitude,
    b.business_hours,
    b.services,
    b.images,
    b.is_verified,
    b.is_open,
    COALESCE(b.rating, 0.0) as rating,
    COALESCE(b.total_reviews, 0) as total_reviews,
    COALESCE(b.delivery_available, false) as delivery_available,
    COALESCE(b.delivery_radius, 5.0) as delivery_radius,
    COALESCE(b.min_order_amount, 0.0) as min_order_amount,
    COALESCE(b.delivery_fee, 0.0) as delivery_fee,
    COALESCE(b.estimated_delivery_time, 30) as estimated_delivery_time,
    -- Calculate distance using Haversine formula
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) AS distance_km,
    b.created_at,
    b.updated_at
  FROM businesses b
  WHERE 
    b.latitude IS NOT NULL 
    AND b.longitude IS NOT NULL
    AND b.is_active = true
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) <= radius_km
    AND (category_filter IS NULL OR b.category_id::text = category_filter)
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Create business analytics functions
-- ================================================

-- Function to get business analytics
CREATE OR REPLACE FUNCTION public.get_business_analytics(business_id UUID)
RETURNS TABLE (
  total_orders BIGINT,
  pending_orders BIGINT,
  completed_orders BIGINT,
  total_revenue DOUBLE PRECISION,
  today_revenue DOUBLE PRECISION,
  avg_order_value DOUBLE PRECISION,
  total_customers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(o.id) as total_orders,
    COUNT(o.id) FILTER (WHERE o.order_status = 'pending') as pending_orders,
    COUNT(o.id) FILTER (WHERE o.order_status = 'completed') as completed_orders,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_status = 'completed'), 0) as total_revenue,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_status = 'completed' AND DATE(o.created_at) = CURRENT_DATE), 0) as today_revenue,
    COALESCE(AVG(o.total_amount) FILTER (WHERE o.order_status = 'completed'), 0) as avg_order_value,
    COUNT(DISTINCT o.customer_id) as total_customers
  FROM orders o
  WHERE o.business_id = get_business_analytics.business_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Fix business categories if missing
-- ================================================

-- Insert default business categories
INSERT INTO business_categories (id, name, description, icon, is_active) VALUES
  (gen_random_uuid(), 'Restaurant', 'Food and dining establishments', '🍽️', true),
  (gen_random_uuid(), 'Retail Store', 'Shopping and retail businesses', '🛍️', true),
  (gen_random_uuid(), 'Services', 'Professional and personal services', '🔧', true),
  (gen_random_uuid(), 'Healthcare', 'Medical and wellness services', '🏥', true),
  (gen_random_uuid(), 'Beauty & Spa', 'Beauty and wellness services', '💄', true),
  (gen_random_uuid(), 'Fitness', 'Gyms and fitness centers', '💪', true),
  (gen_random_uuid(), 'Education', 'Educational institutions and tutoring', '📚', true),
  (gen_random_uuid(), 'Automotive', 'Car services and repairs', '🚗', true),
  (gen_random_uuid(), 'Home Services', 'Cleaning, maintenance, and home improvement', '🏠', true),
  (gen_random_uuid(), 'Entertainment', 'Entertainment and recreational activities', '🎬', true)
ON CONFLICT (name) DO NOTHING;

-- 6. Grant necessary permissions
-- ================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE ON profiles TO anon, authenticated, service_role;
GRANT SELECT ON businesses TO anon, authenticated, service_role;
GRANT SELECT ON business_categories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON businesses TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated, service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_nearby_businesses TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_business_analytics TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_new_user TO service_role;

-- 7. Update existing records
-- ================================================

-- Update businesses table to ensure required fields have defaults
UPDATE businesses 
SET 
  is_active = COALESCE(is_active, true),
  is_verified = COALESCE(is_verified, false),
  is_open = COALESCE(is_open, true),
  rating = COALESCE(rating, 0.0),
  total_reviews = COALESCE(total_reviews, 0),
  delivery_available = COALESCE(delivery_available, false),
  delivery_radius = COALESCE(delivery_radius, 5.0),
  min_order_amount = COALESCE(min_order_amount, 0.0),
  delivery_fee = COALESCE(delivery_fee, 0.0),
  estimated_delivery_time = COALESCE(estimated_delivery_time, 30)
WHERE id IS NOT NULL;

-- ================================================
-- 🎯 VERIFICATION QUERIES
-- ================================================

-- Test the get_nearby_businesses function
-- SELECT * FROM get_nearby_businesses(19.0760, 72.8777, 10) LIMIT 5;

-- Check if policies are working
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- Test profile creation
-- SELECT COUNT(*) FROM profiles;

-- Check business categories
-- SELECT * FROM business_categories WHERE is_active = true;

-- ================================================
-- ✅ SETUP COMPLETE
-- ================================================
