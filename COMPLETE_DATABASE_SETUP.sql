-- ================================================================
-- 🚀 COMPLETE TOWNTAP DATABASE SETUP
-- ================================================================
-- Run this entire script in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- ================================================================
-- 🏪 BUSINESS CATEGORIES TABLE
-- ================================================================

DROP TABLE IF EXISTS business_categories CASCADE;
CREATE TABLE business_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT '🏪',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert comprehensive business categories
INSERT INTO business_categories (name, icon, description) VALUES
('Plumber', '🔧', 'Plumbing services and pipe repairs'),
('Electrician', '⚡', 'Electrical repairs and installations'),
('Carpenter', '🔨', 'Wood work and furniture repairs'),
('Painter', '🎨', 'House painting and decoration'),
('General Store', '🏪', 'Grocery and daily essentials'),
('Medical Store', '💊', 'Pharmacy and medical supplies'),
('Restaurant', '🍽️', 'Food and dining services'),
('Cafe', '☕', 'Coffee and light meals'),
('Beauty Salon', '💄', 'Hair and beauty services'),
('Barber Shop', '✂️', 'Hair cutting and grooming'),
('Auto Repair', '🚗', 'Vehicle repair and maintenance'),
('Laundry', '👕', 'Clothing cleaning services'),
('Mobile Repair', '📱', 'Phone and electronics repair'),
('Tailor', '🧵', 'Clothing alterations and stitching'),
('Shoe Repair', '👞', 'Footwear repair services'),
('Home Cleaning', '🧹', 'House cleaning services'),
('Gardening', '🌱', 'Garden maintenance and landscaping'),
('Pet Care', '🐕', 'Pet grooming and veterinary'),
('Tuition', '📚', 'Educational and tutoring services'),
('Gym', '💪', 'Fitness and workout facilities');

-- ================================================================
-- 🏢 BUSINESS PROFILES TABLE
-- ================================================================

DROP TABLE IF EXISTS business_profiles CASCADE;
CREATE TABLE business_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES business_categories(id),
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Location (PostGIS)
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_MakePoint(longitude, latitude)::geography) STORED,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Business Details
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 4.0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Service Details
    service_radius INTEGER DEFAULT 5, -- in kilometers
    average_service_time INTEGER DEFAULT 30, -- in minutes
    price_range VARCHAR(20) DEFAULT 'moderate', -- cheap, moderate, expensive
    accepts_online_booking BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_business_profiles_location ON business_profiles USING GIST (location);
CREATE INDEX idx_business_profiles_category ON business_profiles (category_id);
CREATE INDEX idx_business_profiles_status ON business_profiles (status);
CREATE INDEX idx_business_profiles_owner ON business_profiles (owner_id);
CREATE INDEX idx_business_profiles_rating ON business_profiles (rating DESC);

-- ================================================================
-- 📅 BUSINESS HOURS TABLE
-- ================================================================

DROP TABLE IF EXISTS business_hours CASCADE;
CREATE TABLE business_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_business_hours_unique ON business_hours (business_id, day_of_week);

-- ================================================================
-- 📊 BUSINESS STATS TABLE (Real-time metrics)
-- ================================================================

DROP TABLE IF EXISTS business_stats CASCADE;
CREATE TABLE business_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    current_customers INTEGER DEFAULT 0,
    estimated_wait_time INTEGER DEFAULT 15, -- minutes
    total_orders_today INTEGER DEFAULT 0,
    revenue_today DECIMAL(10,2) DEFAULT 0,
    is_currently_open BOOLEAN DEFAULT false,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_business_stats_unique ON business_stats (business_id);

-- ================================================================
-- 👥 CUSTOMERS TABLE
-- ================================================================

DROP TABLE IF EXISTS customers CASCADE;
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    
    -- Current Location (PostGIS)
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    current_location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        CASE 
            WHEN current_latitude IS NOT NULL AND current_longitude IS NOT NULL 
            THEN ST_MakePoint(current_longitude, current_latitude)::geography 
            ELSE NULL 
        END
    ) STORED,
    
    -- Preferences
    preferred_radius INTEGER DEFAULT 20, -- km
    is_location_enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    last_location_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customers_location ON customers USING GIST (current_location);
CREATE INDEX idx_customers_user ON customers (user_id);

-- ================================================================
-- 📱 SERVICE REQUESTS TABLE
-- ================================================================

DROP TABLE IF EXISTS service_requests CASCADE;
CREATE TABLE service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    
    -- Request Details
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    
    -- Location
    service_latitude DECIMAL(10, 8) NOT NULL,
    service_longitude DECIMAL(11, 8) NOT NULL,
    service_location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_MakePoint(service_longitude, service_latitude)::geography) STORED,
    service_address TEXT NOT NULL,
    
    -- Status and Timing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    estimated_duration INTEGER, -- minutes
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_requests_customer ON service_requests (customer_id);
CREATE INDEX idx_service_requests_business ON service_requests (business_id);
CREATE INDEX idx_service_requests_location ON service_requests USING GIST (service_location);
CREATE INDEX idx_service_requests_status ON service_requests (status);

-- ================================================================
-- 💳 PAYMENTS TABLE
-- ================================================================

DROP TABLE IF EXISTS payments CASCADE;
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Transaction Details
    transaction_id VARCHAR(100),
    gateway_response JSONB,
    
    -- Timestamps
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_service_request ON payments (service_request_id);
CREATE INDEX idx_payments_status ON payments (payment_status);

-- ================================================================
-- ⭐ REVIEWS TABLE
-- ================================================================

DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    
    -- Review Details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Review Categories
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    pricing_rating INTEGER CHECK (pricing_rating >= 1 AND pricing_rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_business ON reviews (business_id);
CREATE INDEX idx_reviews_rating ON reviews (rating DESC);

-- ================================================================
-- 📍 REAL-TIME TRACKING TABLE
-- ================================================================

DROP TABLE IF EXISTS live_tracking CASCADE;
CREATE TABLE live_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    
    -- Live Location
    current_latitude DECIMAL(10, 8) NOT NULL,
    current_longitude DECIMAL(11, 8) NOT NULL,
    current_location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_MakePoint(current_longitude, current_latitude)::geography) STORED,
    
    -- Status
    status VARCHAR(50) DEFAULT 'on_way', -- on_way, arrived, working, completed
    estimated_arrival TIME,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_live_tracking_service_request ON live_tracking (service_request_id);
CREATE INDEX idx_live_tracking_location ON live_tracking USING GIST (current_location);

-- ================================================================
-- 🔧 DATABASE FUNCTIONS
-- ================================================================

-- Function to get nearby businesses with real-time data
CREATE OR REPLACE FUNCTION get_nearby_businesses(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km INTEGER DEFAULT 20,
    category_filter UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    category_name VARCHAR,
    category_icon VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km DECIMAL,
    rating DECIMAL,
    total_reviews INTEGER,
    is_currently_open BOOLEAN,
    current_customers INTEGER,
    estimated_wait_time INTEGER,
    price_range VARCHAR,
    service_radius INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.name,
        bp.description,
        bc.name as category_name,
        bc.icon as category_icon,
        bp.phone,
        bp.email,
        bp.address,
        bp.latitude,
        bp.longitude,
        ROUND(
            ST_Distance(
                ST_MakePoint(user_lng, user_lat)::geography,
                bp.location
            ) / 1000.0, 2
        ) as distance_km,
        bp.rating,
        bp.total_reviews,
        COALESCE(bs.is_currently_open, false) as is_currently_open,
        COALESCE(bs.current_customers, 0) as current_customers,
        COALESCE(bs.estimated_wait_time, 15) as estimated_wait_time,
        bp.price_range,
        bp.service_radius,
        bp.created_at
    FROM business_profiles bp
    LEFT JOIN business_categories bc ON bp.category_id = bc.id
    LEFT JOIN business_stats bs ON bp.id = bs.business_id
    WHERE 
        bp.status = 'active'
        AND ST_DWithin(
            ST_MakePoint(user_lng, user_lat)::geography,
            bp.location,
            radius_km * 1000
        )
        AND (category_filter IS NULL OR bp.category_id = category_filter)
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search businesses with text
CREATE OR REPLACE FUNCTION search_businesses(
    user_lat DECIMAL,
    user_lng DECIMAL,
    search_query TEXT,
    radius_km INTEGER DEFAULT 20,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    category_name VARCHAR,
    category_icon VARCHAR,
    distance_km DECIMAL,
    rating DECIMAL,
    is_currently_open BOOLEAN,
    relevance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.name,
        bp.description,
        bc.name as category_name,
        bc.icon as category_icon,
        ROUND(
            ST_Distance(
                ST_MakePoint(user_lng, user_lat)::geography,
                bp.location
            ) / 1000.0, 2
        ) as distance_km,
        bp.rating,
        COALESCE(bs.is_currently_open, false) as is_currently_open,
        (
            CASE WHEN bp.name ILIKE '%' || search_query || '%' THEN 10 ELSE 0 END +
            CASE WHEN bp.description ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END +
            CASE WHEN bc.name ILIKE '%' || search_query || '%' THEN 8 ELSE 0 END
        ) as relevance_score
    FROM business_profiles bp
    LEFT JOIN business_categories bc ON bp.category_id = bc.id
    LEFT JOIN business_stats bs ON bp.id = bs.business_id
    WHERE 
        bp.status = 'active'
        AND ST_DWithin(
            ST_MakePoint(user_lng, user_lat)::geography,
            bp.location,
            radius_km * 1000
        )
        AND (
            bp.name ILIKE '%' || search_query || '%' OR
            bp.description ILIKE '%' || search_query || '%' OR
            bc.name ILIKE '%' || search_query || '%'
        )
    ORDER BY relevance_score DESC, distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if business is currently open
CREATE OR REPLACE FUNCTION is_business_open(business_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_day INTEGER;
    current_time TIME;
    business_hours_record RECORD;
BEGIN
    current_day := EXTRACT(DOW FROM NOW());
    current_time := NOW()::TIME;
    
    SELECT open_time, close_time, is_closed
    INTO business_hours_record
    FROM business_hours
    WHERE business_id = business_uuid AND day_of_week = current_day;
    
    IF business_hours_record.is_closed = true OR business_hours_record.open_time IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN current_time BETWEEN business_hours_record.open_time AND business_hours_record.close_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update business stats
CREATE OR REPLACE FUNCTION update_business_stats(
    business_uuid UUID,
    customers INTEGER DEFAULT NULL,
    wait_time INTEGER DEFAULT NULL,
    is_open BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO business_stats (business_id, current_customers, estimated_wait_time, is_currently_open, updated_at)
    VALUES (business_uuid, customers, wait_time, is_open, NOW())
    ON CONFLICT (business_id)
    DO UPDATE SET
        current_customers = COALESCE(update_business_stats.customers, business_stats.current_customers),
        estimated_wait_time = COALESCE(update_business_stats.wait_time, business_stats.estimated_wait_time),
        is_currently_open = COALESCE(update_business_stats.is_open, business_stats.is_currently_open),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 🔐 ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tracking ENABLE ROW LEVEL SECURITY;

-- Business Categories - Read only for all
CREATE POLICY "Anyone can read business categories" ON business_categories FOR SELECT USING (true);

-- Business Profiles - Read all, owners can manage their own
CREATE POLICY "Anyone can read active business profiles" ON business_profiles FOR SELECT USING (status = 'active');
CREATE POLICY "Business owners can manage their profiles" ON business_profiles FOR ALL USING (owner_id = auth.uid());

-- Business Hours - Read all, owners can manage their own
CREATE POLICY "Anyone can read business hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "Business owners can manage their hours" ON business_hours FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE owner_id = auth.uid())
);

-- Business Stats - Read all, owners can update their own
CREATE POLICY "Anyone can read business stats" ON business_stats FOR SELECT USING (true);
CREATE POLICY "Business owners can update their stats" ON business_stats FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE owner_id = auth.uid())
);

-- Customers - Users can manage their own data
CREATE POLICY "Users can manage their customer profile" ON customers FOR ALL USING (user_id = auth.uid());

-- Service Requests - Users can see their own requests, businesses can see requests for them
CREATE POLICY "Customers can manage their requests" ON service_requests FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
);
CREATE POLICY "Businesses can view their requests" ON service_requests FOR SELECT USING (
    business_id IN (SELECT id FROM business_profiles WHERE owner_id = auth.uid())
);

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE business_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE live_tracking;

-- ================================================================
-- 📊 SAMPLE DATA INSERTION
-- ================================================================

-- Sample business data with diverse categories and locations
DO $$
DECLARE
    category_ids UUID[];
    sample_locations DECIMAL[][];
    i INTEGER;
    business_id UUID;
BEGIN
    -- Get category IDs
    SELECT ARRAY(SELECT id FROM business_categories ORDER BY name) INTO category_ids;
    
    -- Sample locations around a central point (you can adjust these coordinates)
    sample_locations := ARRAY[
        [19.0760, 72.8777], -- Mumbai coordinates as base
        [19.0896, 72.8656],
        [19.0597, 72.8947],
        [19.1136, 72.8697],
        [19.0176, 72.8562],
        [19.0728, 72.8826],
        [19.0970, 72.9074],
        [19.0412, 72.8688],
        [19.1197, 72.8464],
        [19.0329, 72.8800]
    ];
    
    -- Insert sample businesses
    FOR i IN 1..20 LOOP
        INSERT INTO business_profiles (
            name, 
            description, 
            category_id, 
            phone, 
            latitude, 
            longitude, 
            address,
            rating,
            total_reviews,
            service_radius,
            price_range
        ) VALUES (
            CASE (i % 10)
                WHEN 0 THEN 'QuickFix Plumbing Services'
                WHEN 1 THEN 'ElectroMax Solutions'
                WHEN 2 THEN 'WoodCraft Carpentry'
                WHEN 3 THEN 'ColorPro Painters'
                WHEN 4 THEN 'Daily Needs General Store'
                WHEN 5 THEN 'HealthCare Medical Store'
                WHEN 6 THEN 'Taste Buds Restaurant'
                WHEN 7 THEN 'Fresh Brew Cafe'
                WHEN 8 THEN 'Glamour Beauty Salon'
                ELSE 'Style Cut Barber Shop'
            END || ' #' || i,
            
            CASE (i % 5)
                WHEN 0 THEN 'Professional and reliable service with 10+ years experience'
                WHEN 1 THEN 'Quick response time and quality work guaranteed'
                WHEN 2 THEN 'Affordable prices and excellent customer service'
                WHEN 3 THEN 'Expert technicians and modern equipment'
                ELSE 'Trusted by local community for quality service'
            END,
            
            category_ids[((i % array_length(category_ids, 1)) + 1)],
            '+91' || (9000000000 + i)::TEXT,
            sample_locations[((i % array_length(sample_locations, 1)) + 1)][1] + (RANDOM() - 0.5) * 0.1,
            sample_locations[((i % array_length(sample_locations, 1)) + 1)][2] + (RANDOM() - 0.5) * 0.1,
            'Shop #' || i || ', Local Area, Mumbai, Maharashtra',
            3.5 + (RANDOM() * 1.5),
            (RANDOM() * 100)::INTEGER + 10,
            5 + (RANDOM() * 15)::INTEGER,
            CASE (i % 3)
                WHEN 0 THEN 'cheap'
                WHEN 1 THEN 'moderate'
                ELSE 'expensive'
            END
        ) RETURNING id INTO business_id;
        
        -- Insert business hours (Monday to Saturday)
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time)
        SELECT business_id, generate_series(1, 6), '09:00'::TIME, '19:00'::TIME;
        
        -- Insert Sunday hours (shorter)
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time)
        VALUES (business_id, 0, '10:00'::TIME, '18:00'::TIME);
        
        -- Insert business stats
        INSERT INTO business_stats (business_id, current_customers, estimated_wait_time, is_currently_open)
        VALUES (business_id, (RANDOM() * 10)::INTEGER, (RANDOM() * 30 + 10)::INTEGER, RANDOM() < 0.7);
        
    END LOOP;
END $$;

-- ================================================================
-- ✅ VERIFICATION QUERIES
-- ================================================================

-- Check if everything is set up correctly
SELECT 'Business Categories Created' as status, COUNT(*) as count FROM business_categories;
SELECT 'Sample Businesses Created' as status, COUNT(*) as count FROM business_profiles;
SELECT 'Business Hours Configured' as status, COUNT(*) as count FROM business_hours;
SELECT 'Business Stats Available' as status, COUNT(*) as count FROM business_stats;

-- Test the main function
SELECT 'Nearby Businesses Function Test' as status;
SELECT name, category_name, distance_km, is_currently_open 
FROM get_nearby_businesses(19.0760, 72.8777, 20, NULL, 5);

SELECT '🎉 TownTap Database Setup Complete!' as final_status;
