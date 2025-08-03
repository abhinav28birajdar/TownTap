-- ================================================================
-- 🚀 COMPLETE REAL-TIME BUSINESS DISCOVERY DATABASE
-- ================================================================
-- This is the SINGLE SQL file for complete TownTap application
-- Run this script in Supabase SQL Editor to set up everything

-- Enable PostGIS extension for location services
CREATE EXTENSION IF NOT EXISTS postgis;

-- ================================================================
-- 🏢 BUSINESS CATEGORIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert comprehensive business categories
INSERT INTO business_categories (name, icon, description) VALUES 
  ('Plumber', '🔧', 'Plumbing services and repairs'),
  ('Electrician', '⚡', 'Electrical installations and repairs'),
  ('Carpenter', '🔨', 'Carpentry and woodwork services'),
  ('Mechanic', '🔧', 'Vehicle repair and maintenance'),
  ('Painter', '🎨', 'Painting and decoration services'),
  ('Cleaner', '🧹', 'Cleaning and housekeeping services'),
  ('Gardener', '🌱', 'Gardening and landscaping services'),
  ('Cook', '👨‍🍳', 'Cooking and catering services'),
  ('Tutor', '📚', 'Educational and tutoring services'),
  ('Doctor', '👨‍⚕️', 'Medical and healthcare services'),
  ('Lawyer', '⚖️', 'Legal consultation services'),
  ('Accountant', '💼', 'Financial and accounting services'),
  ('Tailor', '✂️', 'Tailoring and alteration services'),
  ('Barber', '💇‍♂️', 'Hair cutting and grooming services'),
  ('Photographer', '📸', 'Photography and videography services'),
  ('Driver', '🚗', 'Transportation and delivery services'),
  ('Security', '🛡️', 'Security and protection services'),
  ('Technician', '🔧', 'Technical repair and maintenance'),
  ('Consultant', '💡', 'Professional consultation services'),
  ('Delivery', '📦', 'Delivery and courier services'),
  ('Fitness', '💪', 'Fitness and personal training'),
  ('Beauty', '💄', 'Beauty and cosmetic services'),
  ('Pet Care', '🐕', 'Pet grooming and care services'),
  ('Construction', '🏗️', 'Construction and building services'),
  ('Real Estate', '🏠', 'Property and real estate services')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 🏪 BUSINESSES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES business_categories(id),
  category_name VARCHAR(100),
  owner_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  services TEXT[],
  price_range VARCHAR(50),
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);

-- ================================================================
-- 👥 CUSTOMERS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  current_location GEOGRAPHY(POINT, 4326),
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  address TEXT,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for customer location
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- ================================================================
-- 📋 SERVICE REQUESTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  customer_id UUID REFERENCES customers(id),
  service_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  customer_location GEOGRAPHY(POINT, 4326) NOT NULL,
  customer_address TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'pending',
  estimated_price DECIMAL(10, 2),
  actual_price DECIMAL(10, 2),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for service requests
CREATE INDEX IF NOT EXISTS idx_service_requests_business ON service_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

-- ================================================================
-- 🔄 LOCATION TRACKING TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS customer_location_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for location tracking
CREATE INDEX IF NOT EXISTS idx_location_tracking_customer ON customer_location_tracking(customer_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_timestamp ON customer_location_tracking(timestamp);

-- ================================================================
-- 📊 BUSINESS INTERACTIONS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS business_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  customer_id UUID REFERENCES customers(id),
  interaction_type VARCHAR(50) NOT NULL, -- 'view', 'call', 'request'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for interactions
CREATE INDEX IF NOT EXISTS idx_business_interactions_business ON business_interactions(business_id);
CREATE INDEX IF NOT EXISTS idx_business_interactions_customer ON business_interactions(customer_id);

-- ================================================================
-- 🚀 REAL-TIME FUNCTIONS
-- ================================================================

-- Function to get nearby businesses within radius
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

-- ================================================================
-- 📊 SAMPLE DATA
-- ================================================================

-- Insert sample businesses for testing
INSERT INTO businesses (
  business_name, category_name, owner_name, phone, email, address,
  latitude, longitude, location, description, services, price_range, rating
) VALUES 
  ('Quick Fix Plumbing', 'Plumber', 'John Smith', '+91-9876543210', 'john@quickfix.com', '123 Main St, Delhi',
   28.6139, 77.2090, ST_GeogFromText('POINT(77.2090 28.6139)'), 
   'Professional plumbing services', ARRAY['Pipe repair', 'Drain cleaning'], '₹500-2000', 4.5),
   
  ('Bright Electric', 'Electrician', 'Mike Johnson', '+91-9876543211', 'mike@bright.com', '456 Park Ave, Mumbai',
   19.0760, 72.8777, ST_GeogFromText('POINT(72.8777 19.0760)'),
   'Expert electrical services', ARRAY['Wiring', 'Fan installation'], '₹800-3000', 4.2),
   
  ('Wood Masters', 'Carpenter', 'David Wilson', '+91-9876543212', 'david@wood.com', '789 Oak St, Bangalore',
   12.9716, 77.5946, ST_GeogFromText('POINT(77.5946 12.9716)'),
   'Custom carpentry work', ARRAY['Furniture', 'Cabinets'], '₹1500-5000', 4.7),
   
  ('Auto Care Center', 'Mechanic', 'Robert Brown', '+91-9876543213', 'robert@auto.com', '321 Speed Way, Chennai',
   13.0827, 80.2707, ST_GeogFromText('POINT(80.2707 13.0827)'),
   'Complete auto repair', ARRAY['Engine repair', 'Oil change'], '₹1000-8000', 4.3),
   
  ('Color Perfect', 'Painter', 'Lisa Davis', '+91-9876543214', 'lisa@color.com', '654 Art Lane, Kolkata',
   22.5726, 88.3639, ST_GeogFromText('POINT(88.3639 22.5726)'),
   'Professional painting services', ARRAY['Interior', 'Exterior'], '₹2000-10000', 4.6);

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
-- ✅ SETUP COMPLETE
-- ================================================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '🚀 TownTap Database Setup Complete!';
  RAISE NOTICE '📊 Tables created: business_categories, businesses, customers, service_requests, customer_location_tracking, business_interactions';
  RAISE NOTICE '🔍 Functions created: get_nearby_businesses(), search_businesses()';
  RAISE NOTICE '📱 Sample data inserted: 25 business categories, 5 sample businesses';
  RAISE NOTICE '🔐 Row Level Security enabled with proper policies';
  RAISE NOTICE '🔔 Real-time subscriptions enabled';
  RAISE NOTICE '✅ Ready for real-time business discovery within 20km radius!';
END $$;
