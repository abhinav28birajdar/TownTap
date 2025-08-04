-- ================================================================
-- 🏢 TOWNTAP - COMPLETE DATABASE SCHEMA
-- Real-time Business Discovery Platform
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ================================================================
-- 🗂️ BUSINESS CATEGORIES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS business_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert business categories
INSERT INTO business_categories (name, description, icon, color, sort_order) VALUES
  ('Plumber', 'Water pipe repairs, installations, and maintenance', 'wrench', '#3B82F6', 1),
  ('Electrician', 'Electrical installations, repairs, and maintenance', 'zap', '#F59E0B', 2),
  ('Carpenter', 'Woodwork, furniture making, and carpentry services', 'hammer', '#8B5CF6', 3),
  ('Painter', 'Interior and exterior painting services', 'brush', '#EC4899', 4),
  ('Mechanic', 'Vehicle repairs and maintenance services', 'car', '#10B981', 5),
  ('Cleaner', 'Home and office cleaning services', 'sparkles', '#06B6D4', 6),
  ('Gardner', 'Landscaping and garden maintenance', 'leaf', '#84CC16', 7),
  ('Mason', 'Construction and masonry work', 'brick', '#EF4444', 8),
  ('Tailor', 'Clothing alterations and custom tailoring', 'scissors', '#F97316', 9),
  ('Barber', 'Hair cutting and grooming services', 'user', '#6366F1', 10),
  ('Beauty Parlor', 'Beauty treatments and cosmetic services', 'star', '#EC4899', 11),
  ('Laundry', 'Clothes washing and dry cleaning', 'droplet', '#14B8A6', 12),
  ('AC Repair', 'Air conditioning repair and maintenance', 'snowflake', '#0EA5E9', 13),
  ('Refrigerator Repair', 'Refrigerator and appliance repair', 'refrigerator', '#8B5CF6', 14),
  ('Mobile Repair', 'Mobile phone and electronics repair', 'smartphone', '#F59E0B', 15),
  ('Computer Repair', 'Computer and laptop repair services', 'monitor', '#6366F1', 16),
  ('TV Repair', 'Television and electronics repair', 'tv', '#10B981', 17),
  ('Locksmith', 'Lock installation and key making', 'key', '#EF4444', 18),
  ('Pest Control', 'Pest extermination and control', 'bug', '#84CC16', 19),
  ('Security Guard', 'Security and protection services', 'shield', '#6B7280', 20),
  ('Driver', 'Personal and commercial driving services', 'truck', '#F97316', 21),
  ('Delivery', 'Package and goods delivery services', 'package', '#06B6D4', 22),
  ('Tutor', 'Educational and tutoring services', 'book', '#8B5CF6', 23),
  ('Nurse', 'Healthcare and nursing services', 'heart', '#EF4444', 24),
  ('Other', 'Other miscellaneous services', 'more-horizontal', '#6B7280', 25)
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 🏪 BUSINESSES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES business_categories(id),
  category_name VARCHAR(100),
  owner_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_GeogFromText('POINT(' || longitude || ' ' || latitude || ')')) STORED,
  description TEXT,
  services TEXT[],
  price_range VARCHAR(50),
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB,
  images TEXT[],
  website VARCHAR(255),
  social_media JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses (category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses (is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses (rating DESC);

-- ================================================================
-- 👥 CUSTOMERS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),
  preferred_categories UUID[],
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for customer lookups
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers (user_id);
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers USING GIST (location);

-- ================================================================
-- 📋 SERVICE REQUESTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES business_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  estimated_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  business_notes TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for service requests
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON service_requests (customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_business ON service_requests (business_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests (status);
CREATE INDEX IF NOT EXISTS idx_service_requests_date ON service_requests (created_at DESC);

-- ================================================================
-- 📍 CUSTOMER LOCATION TRACKING TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS customer_location_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_GeogFromText('POINT(' || longitude || ' ' || latitude || ')')) STORED,
  accuracy DECIMAL(8, 2),
  speed DECIMAL(8, 2),
  heading DECIMAL(5, 2),
  activity_type VARCHAR(50),
  battery_level INTEGER,
  is_background BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for location tracking
CREATE INDEX IF NOT EXISTS idx_location_tracking_customer ON customer_location_tracking (customer_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_location ON customer_location_tracking USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_location_tracking_time ON customer_location_tracking (created_at DESC);

-- ================================================================
-- 🤝 BUSINESS INTERACTIONS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS business_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'call', 'message', 'direction', 'favorite', 'share')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for business interactions
CREATE INDEX IF NOT EXISTS idx_business_interactions_customer ON business_interactions (customer_id);
CREATE INDEX IF NOT EXISTS idx_business_interactions_business ON business_interactions (business_id);
CREATE INDEX IF NOT EXISTS idx_business_interactions_type ON business_interactions (interaction_type);

-- ================================================================
-- 🔍 DATABASE FUNCTIONS
-- ================================================================

-- Function to get nearby businesses
CREATE OR REPLACE FUNCTION get_nearby_businesses(
  customer_lat DECIMAL,
  customer_lng DECIMAL,
  radius_km INTEGER DEFAULT 20,
  category_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  business_name VARCHAR,
  category_id UUID,
  category_name VARCHAR,
  owner_name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  description TEXT,
  services TEXT[],
  price_range VARCHAR,
  rating DECIMAL,
  total_reviews INTEGER,
  is_verified BOOLEAN,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.business_name,
    b.category_id,
    b.category_name,
    b.owner_name,
    b.phone,
    b.email,
    b.address,
    b.latitude,
    b.longitude,
    b.description,
    b.services,
    b.price_range,
    b.rating,
    b.total_reviews,
    b.is_verified,
    ROUND(
      ST_Distance(
        ST_GeogFromText('POINT(' || customer_lng || ' ' || customer_lat || ')'),
        b.location
      ) / 1000, 2
    ) AS distance_km
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE 
    b.is_active = true
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || customer_lng || ' ' || customer_lat || ')'),
      b.location,
      radius_km * 1000
    )
    AND (category_filter IS NULL OR bc.name = category_filter OR b.category_name = category_filter)
  ORDER BY distance_km ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to search businesses by text
CREATE OR REPLACE FUNCTION search_businesses(
  customer_lat DECIMAL,
  customer_lng DECIMAL,
  search_term VARCHAR,
  radius_km INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  business_name VARCHAR,
  category_id UUID,
  category_name VARCHAR,
  owner_name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  description TEXT,
  services TEXT[],
  price_range VARCHAR,
  rating DECIMAL,
  total_reviews INTEGER,
  is_verified BOOLEAN,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.business_name,
    b.category_id,
    b.category_name,
    b.owner_name,
    b.phone,
    b.email,
    b.address,
    b.latitude,
    b.longitude,
    b.description,
    b.services,
    b.price_range,
    b.rating,
    b.total_reviews,
    b.is_verified,
    ROUND(
      ST_Distance(
        ST_GeogFromText('POINT(' || customer_lng || ' ' || customer_lat || ')'),
        b.location
      ) / 1000, 2
    ) AS distance_km
  FROM businesses b
  WHERE 
    b.is_active = true
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || customer_lng || ' ' || customer_lat || ')'),
      b.location,
      radius_km * 1000
    )
    AND (
      b.business_name ILIKE '%' || search_term || '%'
      OR b.category_name ILIKE '%' || search_term || '%'
      OR b.description ILIKE '%' || search_term || '%'
      OR b.address ILIKE '%' || search_term || '%'
    )
  ORDER BY distance_km ASC
  LIMIT 30;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer location
CREATE OR REPLACE FUNCTION update_customer_location(
  p_customer_id UUID,
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_accuracy DECIMAL DEFAULT NULL,
  p_speed DECIMAL DEFAULT NULL,
  p_heading DECIMAL DEFAULT NULL,
  p_activity_type VARCHAR DEFAULT NULL,
  p_battery_level INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update customer's current location
  UPDATE customers 
  SET 
    latitude = p_latitude,
    longitude = p_longitude,
    location = ST_GeogFromText('POINT(' || p_longitude || ' ' || p_latitude || ')'),
    updated_at = NOW()
  WHERE id = p_customer_id;

  -- Insert location tracking record
  INSERT INTO customer_location_tracking (
    customer_id, latitude, longitude, accuracy, speed, heading, 
    activity_type, battery_level
  ) VALUES (
    p_customer_id, p_latitude, p_longitude, p_accuracy, p_speed, 
    p_heading, p_activity_type, p_battery_level
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 📊 SAMPLE DATA
-- ================================================================

-- Insert sample businesses for testing
INSERT INTO businesses (
  business_name, category_name, owner_name, phone, email, address,
  latitude, longitude, description, services, price_range, rating
) VALUES 
  ('Quick Fix Plumbing', 'Plumber', 'John Smith', '+91-9876543210', 'john@quickfix.com', '123 Main St, Delhi',
   28.6139, 77.2090, 'Professional plumbing services', ARRAY['Pipe repair', 'Drain cleaning'], '₹500-2000', 4.5),
   
  ('Bright Electric', 'Electrician', 'Mike Johnson', '+91-9876543211', 'mike@bright.com', '456 Park Ave, Mumbai',
   19.0760, 72.8777, 'Expert electrical services', ARRAY['Wiring', 'Fan installation'], '₹800-3000', 4.2),
   
  ('Wood Masters', 'Carpenter', 'David Wilson', '+91-9876543212', 'david@wood.com', '789 Oak St, Bangalore',
   12.9716, 77.5946, 'Custom carpentry work', ARRAY['Furniture', 'Cabinets'], '₹1500-5000', 4.7),
   
  ('Auto Care Center', 'Mechanic', 'Robert Brown', '+91-9876543213', 'robert@auto.com', '321 Speed Way, Chennai',
   13.0827, 80.2707, 'Complete auto repair', ARRAY['Engine repair', 'Oil change'], '₹1000-8000', 4.3),
   
  ('Color Perfect', 'Painter', 'Lisa Davis', '+91-9876543214', 'lisa@color.com', '654 Art Lane, Kolkata',
   22.5726, 88.3639, 'Professional painting services', ARRAY['Interior', 'Exterior'], '₹2000-10000', 4.6)
ON CONFLICT DO NOTHING;

-- Update category_id based on category_name
UPDATE businesses 
SET category_id = bc.id 
FROM business_categories bc 
WHERE businesses.category_name = bc.name;

-- ================================================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_location_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_interactions ENABLE ROW LEVEL SECURITY;

-- Public read access for business categories
CREATE POLICY "Public can read business categories" ON business_categories
  FOR SELECT USING (true);

-- Public read access for active businesses
CREATE POLICY "Public can read active businesses" ON businesses
  FOR SELECT USING (is_active = true);

-- Customers can manage their own data
CREATE POLICY "Users can manage their customer data" ON customers
  FOR ALL USING (auth.uid() = user_id);

-- Service requests policies
CREATE POLICY "Users can view their service requests" ON service_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = service_requests.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create service requests" ON service_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = service_requests.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

-- Location tracking policies
CREATE POLICY "Users can manage their location tracking" ON customer_location_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = customer_location_tracking.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

-- Business interactions policies
CREATE POLICY "Users can manage their interactions" ON business_interactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = business_interactions.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

-- ================================================================
-- 🔔 REAL-TIME SUBSCRIPTIONS
-- ================================================================

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_location_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE business_interactions;

-- ================================================================
-- ⚡ TRIGGERS FOR AUTOMATIC UPDATES
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_business_categories_updated_at BEFORE UPDATE ON business_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ✅ SETUP COMPLETE
-- ================================================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '🚀 TownTap Database Setup Complete!';
  RAISE NOTICE '📊 Tables created: business_categories, businesses, customers, service_requests, customer_location_tracking, business_interactions';
  RAISE NOTICE '🔍 Functions created: get_nearby_businesses(), search_businesses(), update_customer_location()';
  RAISE NOTICE '📱 Sample data inserted: 25 business categories, 5 sample businesses';
  RAISE NOTICE '🔐 Row Level Security enabled with proper policies';
  RAISE NOTICE '🔔 Real-time subscriptions enabled';
  RAISE NOTICE '⚡ Automatic triggers configured';
  RAISE NOTICE '✅ Ready for real-time business discovery within 20km radius!';
END $$;
