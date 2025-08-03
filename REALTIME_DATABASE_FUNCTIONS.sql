-- ================================================================
-- 🚀 REAL-TIME BUSINESS DISCOVERY DATABASE FUNCTIONS
-- ================================================================

-- 1. Enhanced get_nearby_businesses function with real-time features
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_nearby_businesses_realtime(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 20,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  include_closed BOOLEAN DEFAULT FALSE,
  real_time BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category_id UUID,
  category_name TEXT,
  category_icon TEXT,
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
  is_accepting_orders BOOLEAN,
  is_temporarily_closed BOOLEAN,
  rating DOUBLE PRECISION,
  total_reviews INTEGER,
  delivery_available BOOLEAN,
  delivery_radius DOUBLE PRECISION,
  min_order_amount DOUBLE PRECISION,
  delivery_fee DOUBLE PRECISION,
  estimated_delivery_time INTEGER,
  current_customer_count INTEGER,
  average_wait_time INTEGER,
  distance_km DOUBLE PRECISION,
  is_realtime_open BOOLEAN,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  current_day INTEGER;
  current_time TIME;
BEGIN
  -- Get current day and time for real-time checking
  current_day := EXTRACT(DOW FROM NOW()); -- 0 = Sunday, 1 = Monday, etc.
  current_time := NOW()::TIME;

  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.category_id,
    COALESCE(bc.name, 'Other') as category_name,
    COALESCE(bc.icon, '🏪') as category_icon,
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
    COALESCE(b.is_accepting_orders, true) as is_accepting_orders,
    COALESCE(b.is_temporarily_closed, false) as is_temporarily_closed,
    COALESCE(b.rating, 0.0) as rating,
    COALESCE(b.total_reviews, 0) as total_reviews,
    COALESCE(b.delivery_available, false) as delivery_available,
    COALESCE(b.delivery_radius, 5.0) as delivery_radius,
    COALESCE(b.min_order_amount, 0.0) as min_order_amount,
    COALESCE(b.delivery_fee, 0.0) as delivery_fee,
    COALESCE(b.estimated_delivery_time, 30) as estimated_delivery_time,
    
    -- Current customer count (orders in progress)
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM orders o 
      WHERE o.business_id = b.id 
      AND o.order_status IN ('confirmed', 'preparing', 'ready')
    ), 0) as current_customer_count,
    
    -- Average wait time (last 24 hours)
    COALESCE((
      SELECT AVG(EXTRACT(EPOCH FROM (o.completed_at - o.created_at))/60)::INTEGER
      FROM orders o 
      WHERE o.business_id = b.id 
      AND o.order_status = 'completed'
      AND o.created_at >= NOW() - INTERVAL '24 hours'
    ), 30) as average_wait_time,
    
    -- Calculate distance using Haversine formula
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) AS distance_km,
    
    -- Real-time open status
    CASE 
      WHEN real_time THEN (
        EXISTS (
          SELECT 1 FROM business_hours bh 
          WHERE bh.business_id = b.id 
          AND bh.day_of_week = current_day
          AND bh.is_open = true
          AND current_time BETWEEN bh.open_time AND bh.close_time
        ) AND b.is_accepting_orders = true AND b.is_temporarily_closed = false
      )
      ELSE b.is_open
    END as is_realtime_open,
    
    NOW() as last_updated,
    b.created_at,
    b.updated_at
    
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
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
    AND (
      include_closed = true OR 
      (
        CASE 
          WHEN real_time THEN (
            EXISTS (
              SELECT 1 FROM business_hours bh 
              WHERE bh.business_id = b.id 
              AND bh.day_of_week = current_day
              AND bh.is_open = true
              AND current_time BETWEEN bh.open_time AND bh.close_time
            ) AND b.is_accepting_orders = true AND b.is_temporarily_closed = false
          )
          ELSE b.is_open
        END
      )
    )
  ORDER BY 
    -- Prioritize open businesses
    CASE 
      WHEN real_time THEN (
        EXISTS (
          SELECT 1 FROM business_hours bh 
          WHERE bh.business_id = b.id 
          AND bh.day_of_week = current_day
          AND bh.is_open = true
          AND current_time BETWEEN bh.open_time AND bh.close_time
        ) AND b.is_accepting_orders = true AND b.is_temporarily_closed = false
      )
      ELSE b.is_open
    END DESC,
    -- Then by distance
    distance_km ASC,
    -- Then by rating
    COALESCE(b.rating, 0) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Search businesses with real-time filtering
-- ================================================================

CREATE OR REPLACE FUNCTION public.search_businesses_realtime(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  search_query TEXT,
  radius_km DOUBLE PRECISION DEFAULT 20,
  category_filter TEXT DEFAULT NULL,
  only_open BOOLEAN DEFAULT TRUE,
  limit_count INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category_name TEXT,
  phone TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating DOUBLE PRECISION,
  total_reviews INTEGER,
  is_realtime_open BOOLEAN,
  distance_km DOUBLE PRECISION,
  relevance_score DOUBLE PRECISION
) AS $$
DECLARE
  current_day INTEGER;
  current_time TIME;
BEGIN
  current_day := EXTRACT(DOW FROM NOW());
  current_time := NOW()::TIME;

  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    COALESCE(bc.name, 'Other') as category_name,
    b.phone,
    b.address,
    b.latitude,
    b.longitude,
    COALESCE(b.rating, 0.0) as rating,
    COALESCE(b.total_reviews, 0) as total_reviews,
    
    -- Real-time open status
    (
      EXISTS (
        SELECT 1 FROM business_hours bh 
        WHERE bh.business_id = b.id 
        AND bh.day_of_week = current_day
        AND bh.is_open = true
        AND current_time BETWEEN bh.open_time AND bh.close_time
      ) AND b.is_accepting_orders = true AND b.is_temporarily_closed = false
    ) as is_realtime_open,
    
    -- Distance calculation
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) AS distance_km,
    
    -- Relevance score based on text similarity
    (
      CASE 
        WHEN LOWER(b.name) LIKE LOWER('%' || search_query || '%') THEN 10.0
        ELSE 0.0
      END +
      CASE 
        WHEN LOWER(b.description) LIKE LOWER('%' || search_query || '%') THEN 5.0
        ELSE 0.0
      END +
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM unnest(b.services) AS service 
          WHERE LOWER(service) LIKE LOWER('%' || search_query || '%')
        ) THEN 7.0
        ELSE 0.0
      END +
      CASE 
        WHEN LOWER(bc.name) LIKE LOWER('%' || search_query || '%') THEN 3.0
        ELSE 0.0
      END
    ) as relevance_score
    
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE 
    b.is_active = true
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) <= radius_km
    AND (category_filter IS NULL OR b.category_id::text = category_filter)
    AND (
      LOWER(b.name) LIKE LOWER('%' || search_query || '%') OR
      LOWER(b.description) LIKE LOWER('%' || search_query || '%') OR
      EXISTS (
        SELECT 1 FROM unnest(b.services) AS service 
        WHERE LOWER(service) LIKE LOWER('%' || search_query || '%')
      ) OR
      LOWER(bc.name) LIKE LOWER('%' || search_query || '%')
    )
    AND (
      only_open = false OR 
      (
        EXISTS (
          SELECT 1 FROM business_hours bh 
          WHERE bh.business_id = b.id 
          AND bh.day_of_week = current_day
          AND bh.is_open = true
          AND current_time BETWEEN bh.open_time AND bh.close_time
        ) AND b.is_accepting_orders = true AND b.is_temporarily_closed = false
      )
    )
  ORDER BY 
    relevance_score DESC,
    is_realtime_open DESC,
    distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Get businesses by category with real-time data
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_businesses_by_category_realtime(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  category_uuid TEXT,
  radius_km DOUBLE PRECISION DEFAULT 20,
  limit_count INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  phone TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating DOUBLE PRECISION,
  total_reviews INTEGER,
  is_realtime_open BOOLEAN,
  current_customer_count INTEGER,
  estimated_delivery_time INTEGER,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  current_day INTEGER;
  current_time TIME;
BEGIN
  current_day := EXTRACT(DOW FROM NOW());
  current_time := NOW()::TIME;

  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.phone,
    b.address,
    b.latitude,
    b.longitude,
    COALESCE(b.rating, 0.0) as rating,
    COALESCE(b.total_reviews, 0) as total_reviews,
    
    -- Real-time open status
    (
      EXISTS (
        SELECT 1 FROM business_hours bh 
        WHERE bh.business_id = b.id 
        AND bh.day_of_week = current_day
        AND bh.is_open = true
        AND current_time BETWEEN bh.open_time AND bh.close_time
      ) AND b.is_accepting_orders = true AND b.is_temporarily_closed = false
    ) as is_realtime_open,
    
    -- Current customer count
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM orders o 
      WHERE o.business_id = b.id 
      AND o.order_status IN ('confirmed', 'preparing', 'ready')
    ), 0) as current_customer_count,
    
    COALESCE(b.estimated_delivery_time, 30) as estimated_delivery_time,
    
    -- Distance calculation
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) AS distance_km
    
  FROM businesses b
  WHERE 
    b.is_active = true
    AND b.category_id::text = category_uuid
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) <= radius_km
  ORDER BY 
    is_realtime_open DESC,
    distance_km ASC,
    rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Get popular businesses with real-time data
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_popular_businesses(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 20,
  time_period TEXT DEFAULT '24h',
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category_name TEXT,
  phone TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating DOUBLE PRECISION,
  total_reviews INTEGER,
  is_realtime_open BOOLEAN,
  order_count_period INTEGER,
  popularity_score DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  time_interval INTERVAL;
  current_day INTEGER;
  current_time TIME;
BEGIN
  -- Convert time period to interval
  CASE time_period
    WHEN '1h' THEN time_interval := INTERVAL '1 hour';
    WHEN '6h' THEN time_interval := INTERVAL '6 hours';
    WHEN '24h' THEN time_interval := INTERVAL '24 hours';
    WHEN '7d' THEN time_interval := INTERVAL '7 days';
    ELSE time_interval := INTERVAL '24 hours';
  END CASE;

  current_day := EXTRACT(DOW FROM NOW());
  current_time := NOW()::TIME;

  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    COALESCE(bc.name, 'Other') as category_name,
    b.phone,
    b.address,
    b.latitude,
    b.longitude,
    COALESCE(b.rating, 0.0) as rating,
    COALESCE(b.total_reviews, 0) as total_reviews,
    
    -- Real-time open status
    (
      EXISTS (
        SELECT 1 FROM business_hours bh 
        WHERE bh.business_id = b.id 
        AND bh.day_of_week = current_day
        AND bh.is_open = true
        AND current_time BETWEEN bh.open_time AND bh.close_time
      ) AND b.is_accepting_orders = true AND b.is_temporarily_closed = false
    ) as is_realtime_open,
    
    -- Order count in the specified period
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM orders o 
      WHERE o.business_id = b.id 
      AND o.created_at >= NOW() - time_interval
    ), 0) as order_count_period,
    
    -- Popularity score (weighted by orders, views, and rating)
    (
      COALESCE((
        SELECT COUNT(*) * 2.0 
        FROM orders o 
        WHERE o.business_id = b.id 
        AND o.created_at >= NOW() - time_interval
      ), 0) +
      COALESCE((
        SELECT COUNT(*) * 1.0 
        FROM business_interactions bi 
        WHERE bi.business_id = b.id 
        AND bi.interaction_type = 'view'
        AND bi.timestamp >= NOW() - time_interval
      ), 0) +
      COALESCE(b.rating * 10, 0)
    ) as popularity_score,
    
    -- Distance calculation
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) AS distance_km
    
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE 
    b.is_active = true
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(b.latitude))
      )
    ) <= radius_km
  ORDER BY 
    popularity_score DESC,
    is_realtime_open DESC,
    distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Create necessary tables for real-time tracking
-- ================================================================

-- User locations table for real-time tracking
CREATE TABLE IF NOT EXISTS user_locations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business interactions table for analytics
CREATE TABLE IF NOT EXISTS business_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'call', 'direction', 'order')),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to businesses table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'is_accepting_orders') THEN
    ALTER TABLE businesses ADD COLUMN is_accepting_orders BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'is_temporarily_closed') THEN
    ALTER TABLE businesses ADD COLUMN is_temporarily_closed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 6. Create indexes for better performance
-- ================================================================

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIST (ST_Point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_businesses_active_category ON businesses (is_active, category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_accepting_orders ON businesses (is_accepting_orders, is_temporarily_closed);

-- Index for real-time queries
CREATE INDEX IF NOT EXISTS idx_business_hours_realtime ON business_hours (business_id, day_of_week, is_open);
CREATE INDEX IF NOT EXISTS idx_orders_business_status ON orders (business_id, order_status, created_at);
CREATE INDEX IF NOT EXISTS idx_user_locations_updated ON user_locations (updated_at);
CREATE INDEX IF NOT EXISTS idx_business_interactions_timestamp ON business_interactions (business_id, timestamp);

-- 7. Grant permissions
-- ================================================================

GRANT EXECUTE ON FUNCTION get_nearby_businesses_realtime TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_businesses_realtime TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_businesses_by_category_realtime TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_popular_businesses TO anon, authenticated, service_role;

GRANT ALL ON user_locations TO authenticated, service_role;
GRANT ALL ON business_interactions TO authenticated, service_role;

-- 8. Enable Row Level Security
-- ================================================================

ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for user_locations
CREATE POLICY "Users can manage their own location" ON user_locations
  FOR ALL USING (auth.uid() = user_id);

-- Policies for business_interactions
CREATE POLICY "Users can insert their own interactions" ON business_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions" ON business_interactions
  FOR SELECT USING (auth.uid() = user_id);

-- Business owners can view interactions with their businesses
CREATE POLICY "Business owners can view their business interactions" ON business_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b 
      WHERE b.id = business_interactions.business_id 
      AND b.owner_id = auth.uid()
    )
  );

-- ================================================================
-- ✅ REAL-TIME BUSINESS DISCOVERY SETUP COMPLETE
-- ================================================================
