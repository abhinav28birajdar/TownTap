-- LocalMart Comprehensive Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE user_type_enum AS ENUM ('customer', 'business', 'staff', 'admin');
CREATE TYPE business_status_enum AS ENUM ('online', 'offline', 'busy');
CREATE TYPE transaction_type_enum AS ENUM ('order', 'service', 'consultation', 'rental');
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partial');
CREATE TYPE payment_method_enum AS ENUM ('upi', 'card', 'net_banking', 'wallet', 'cod', 'pay_after_service');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    name TEXT NOT NULL,
    user_type user_type_enum DEFAULT 'customer',
    avatar_url TEXT,
    current_location_geom GEOMETRY(POINT, 4326),
    address JSONB,
    preferences JSONB DEFAULT '{}',
    fcm_token TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_type TEXT[] DEFAULT '{}',
    business_email TEXT,
    business_phone TEXT,
    location_geom GEOMETRY(POINT, 4326) NOT NULL,
    service_area_geom GEOMETRY(POLYGON, 4326),
    address TEXT NOT NULL,
    formatted_address TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    operating_hours JSONB DEFAULT '{}',
    avg_rating DECIMAL(2,1) DEFAULT 0.0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    realtime_status business_status_enum DEFAULT 'offline',
    last_online_at TIMESTAMP WITH TIME ZONE,
    accepts_cod BOOLEAN DEFAULT TRUE,
    accepts_online_payment BOOLEAN DEFAULT TRUE,
    has_offers BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(4,2) DEFAULT 2.50,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    delivery_radius_km INTEGER DEFAULT 5,
    registration_docs_urls TEXT[] DEFAULT '{}',
    bank_details JSONB,
    business_license TEXT,
    gstin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (Type A - Products/Groceries)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10,2) CHECK (discount_price >= 0 AND discount_price <= price),
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 5,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    variants JSONB DEFAULT '{}', -- Colors, sizes, etc.
    specifications JSONB DEFAULT '{}',
    sku TEXT UNIQUE,
    barcode TEXT,
    weight_grams INTEGER,
    dimensions JSONB, -- length, width, height
    expiry_date DATE,
    brand TEXT,
    manufacturer TEXT,
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table (Type B - Services)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    pricing_model TEXT DEFAULT 'fixed' CHECK (pricing_model IN ('fixed', 'hourly', 'custom')),
    estimated_duration INTEGER DEFAULT 60, -- in minutes
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    requires_appointment BOOLEAN DEFAULT TRUE,
    is_queue_based BOOLEAN DEFAULT FALSE,
    advance_booking_days INTEGER DEFAULT 7,
    prerequisites TEXT,
    includes JSONB DEFAULT '{}',
    excludes JSONB DEFAULT '{}',
    service_area_geom GEOMETRY(POLYGON, 4326),
    home_service_available BOOLEAN DEFAULT FALSE,
    home_service_charge DECIMAL(10,2) DEFAULT 0,
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rental items table (Type D - Rentals)
CREATE TABLE rental_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rental_rate DECIMAL(10,2) NOT NULL CHECK (rental_rate >= 0),
    rate_unit TEXT DEFAULT 'hour' CHECK (rate_unit IN ('hour', 'day', 'week', 'month')),
    security_deposit DECIMAL(10,2) DEFAULT 0,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 1 CHECK (stock_quantity >= 0),
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    specifications JSONB DEFAULT '{}',
    condition_description TEXT,
    minimum_rental_period INTEGER DEFAULT 1, -- in rate_unit
    maximum_rental_period INTEGER,
    advance_booking_days INTEGER DEFAULT 7,
    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service schedules and availability
CREATE TABLE service_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER DEFAULT 60, -- in minutes
    buffer_time INTEGER DEFAULT 0, -- break between slots
    max_bookings_per_slot INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (Orders, Bookings, Consultations, Rentals)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    transaction_type transaction_type_enum NOT NULL,
    status transaction_status_enum DEFAULT 'pending',
    items JSONB NOT NULL, -- Array of items with quantities, prices
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    service_charge DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method payment_method_enum,
    customer_notes TEXT,
    business_notes TEXT,
    
    -- Address details
    delivery_address JSONB,
    delivery_location_geom GEOMETRY(POINT, 4326),
    pickup_address JSONB,
    pickup_location_geom GEOMETRY(POINT, 4326),
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    estimated_completion_at TIMESTAMP WITH TIME ZONE,
    actual_completion_at TIMESTAMP WITH TIME ZONE,
    
    -- Service specific
    service_provider_id UUID REFERENCES users(id),
    quoted_price DECIMAL(10,2),
    is_emergency BOOLEAN DEFAULT FALSE,
    
    -- Rental specific
    rental_start_date TIMESTAMP WITH TIME ZONE,
    rental_end_date TIMESTAMP WITH TIME ZONE,
    security_deposit_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Tracking
    preparation_started_at TIMESTAMP WITH TIME ZONE,
    out_for_delivery_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Files and attachments
    attachment_urls TEXT[] DEFAULT '{}',
    invoice_url TEXT,
    proof_of_completion_urls TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat threads for real-time communication
CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_unread_count INTEGER DEFAULT 0,
    business_unread_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for chat
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'payment_request', 'location')),
    media_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews and ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live locations for real-time tracking
CREATE TABLE live_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_geom GEOMETRY(POINT, 4326) NOT NULL,
    accuracy DECIMAL(8,2),
    speed DECIMAL(8,2),
    heading DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Coupons and offers
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    applicable_categories TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User addresses
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- Home, Work, etc.
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    location_geom GEOMETRY(POINT, 4326),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff members (for businesses)
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    hired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- Queue management for services
CREATE TABLE queue_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    queue_number INTEGER NOT NULL,
    estimated_wait_time INTEGER, -- in minutes
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_service', 'completed', 'cancelled')),
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    called_at TIMESTAMP WITH TIME ZONE,
    service_started_at TIMESTAMP WITH TIME ZONE,
    service_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business analytics and metrics
CREATE TABLE business_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    peak_hour INTEGER, -- Hour of day with most activity
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_location ON users USING GIST(current_location_geom);
CREATE INDEX idx_businesses_location ON businesses USING GIST(location_geom);
CREATE INDEX idx_businesses_service_area ON businesses USING GIST(service_area_geom);
CREATE INDEX idx_businesses_status ON businesses(realtime_status);
CREATE INDEX idx_businesses_category ON businesses USING GIN(category_type);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_search ON services USING GIN(search_vector);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_business ON transactions(business_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_live_locations_transaction ON live_locations(transaction_id);
CREATE INDEX idx_live_locations_timestamp ON live_locations(timestamp);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create search vector triggers
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.category, '') || ' ' ||
        COALESCE(NEW.subcategory, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_search_vector 
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
RETURNS FLOAT AS $$
BEGIN
    RETURN ST_Distance(
        ST_GeogFromText('POINT(' || lon1 || ' ' || lat1 || ')'),
        ST_GeogFromText('POINT(' || lon2 || ' ' || lat2 || ')')
    ) / 1000; -- Convert to kilometers
END;
$$ LANGUAGE plpgsql;

-- Function to update business rating
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses 
    SET 
        avg_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE business_id = NEW.business_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE business_id = NEW.business_id
        )
    WHERE id = NEW.business_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data and public business profiles
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Businesses - owners can manage, others can read approved businesses
CREATE POLICY "Business owners can manage their businesses" ON businesses
    FOR ALL USING (auth.uid() = owner_id);
    
CREATE POLICY "Users can read approved businesses" ON businesses
    FOR SELECT USING (is_approved = true);

-- Products/Services - business owners can manage, others can read available items
CREATE POLICY "Business owners can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = products.business_id AND owner_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can read available products" ON products
    FOR SELECT USING (
        is_available = true AND
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = products.business_id AND is_approved = true
        )
    );

-- Similar policies for services and rental_items
CREATE POLICY "Business owners can manage services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = services.business_id AND owner_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can read available services" ON services
    FOR SELECT USING (
        is_available = true AND
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = services.business_id AND is_approved = true
        )
    );

-- Transactions - customers and business owners can access their transactions
CREATE POLICY "Users can access their transactions" ON transactions
    FOR ALL USING (
        auth.uid() = customer_id OR
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = transactions.business_id AND owner_id = auth.uid()
        )
    );

-- Chat and messages - participants can access
CREATE POLICY "Participants can access chat threads" ON chat_threads
    FOR ALL USING (
        auth.uid() = customer_id OR
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = chat_threads.business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Thread participants can access messages" ON messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_threads 
            WHERE id = messages.thread_id AND (
                customer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM businesses 
                    WHERE id = chat_threads.business_id AND owner_id = auth.uid()
                )
            )
        )
    );

-- Notifications - users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- User addresses - users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- Insert some sample data for testing
INSERT INTO users (id, email, name, user_type) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@localmart.com', 'Admin User', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440002', 'customer@test.com', 'Test Customer', 'customer'),
    ('550e8400-e29b-41d4-a716-446655440003', 'business@test.com', 'Test Business Owner', 'business');

-- Insert sample business
INSERT INTO businesses (
    id, owner_id, name, description, category_type, address, 
    location_geom, is_approved, is_verified
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    'Sample Grocery Store',
    'Fresh groceries and daily essentials',
    ARRAY['grocery', 'food'],
    '123 Main Street, Sample City',
    ST_SetSRID(ST_Point(77.5946, 12.9716), 4326), -- Bangalore coordinates
    true,
    true
);

-- Comments and documentation
COMMENT ON TABLE users IS 'Core user profiles extending Supabase auth';
COMMENT ON TABLE businesses IS 'Business profiles and operational data';
COMMENT ON TABLE products IS 'Product catalog for Type A businesses';
COMMENT ON TABLE services IS 'Service offerings for Type B businesses';
COMMENT ON TABLE rental_items IS 'Rental inventory for Type D businesses';
COMMENT ON TABLE transactions IS 'Universal transaction table for all business types';
COMMENT ON TABLE live_locations IS 'Real-time location tracking for delivery/service providers';
COMMENT ON TABLE chat_threads IS 'Communication channels between customers and businesses';
COMMENT ON TABLE queue_items IS 'Queue management for walk-in services';