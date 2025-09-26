-- TownTap Database Schema
-- This file contains the complete database schema for the TownTap application
-- Execute these SQL commands in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    user_type TEXT CHECK (user_type IN ('customer', 'business_owner', 'admin')) DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('restaurant', 'retail', 'service', 'healthcare', 'beauty', 'education', 'entertainment', 'professional', 'other')),
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Address information
    address JSONB NOT NULL DEFAULT '{
        "street": "",
        "city": "",
        "state": "",
        "zip_code": "",
        "country": "United States"
    }',
    
    -- Geographic coordinates (using PostGIS)
    location GEOGRAPHY(POINT),
    
    -- Business hours
    hours JSONB NOT NULL DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "wednesday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "thursday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "friday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "saturday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "sunday": {"open": "09:00", "close": "17:00", "is_closed": true}
    }',
    
    -- Social media links
    social_media JSONB DEFAULT '{"facebook": "", "instagram": "", "twitter": ""}',
    
    -- Business tags for search
    tags TEXT[] DEFAULT '{}',
    
    -- Business images
    images TEXT[] DEFAULT '{}',
    logo_url TEXT,
    cover_image_url TEXT,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business reviews table
CREATE TABLE IF NOT EXISTS business_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per user per business
    UNIQUE(business_id, user_id)
);

-- Business favorites table
CREATE TABLE IF NOT EXISTS business_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one favorite per user per business
    UNIQUE(business_id, user_id)
);

-- Business reports table
CREATE TABLE IF NOT EXISTS business_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business orders table (for businesses that accept orders)
CREATE TABLE IF NOT EXISTS business_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    
    -- Order details
    items JSONB NOT NULL DEFAULT '[]',
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Order status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    
    -- Payment information
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    payment_id TEXT,
    
    -- Delivery/pickup information
    fulfillment_type TEXT CHECK (fulfillment_type IN ('pickup', 'delivery')),
    delivery_address JSONB,
    special_instructions TEXT,
    
    -- Timestamps
    estimated_ready_time TIMESTAMP WITH TIME ZONE,
    ready_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business messages/notifications table
CREATE TABLE IF NOT EXISTS business_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('order_update', 'review_response', 'promotion', 'general')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics/tracking tables
CREATE TABLE IF NOT EXISTS business_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    category TEXT,
    location GEOGRAPHY(POINT),
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_owner_id ON business_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_category ON business_profiles(category);
CREATE INDEX IF NOT EXISTS idx_business_profiles_is_active ON business_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_business_profiles_is_featured ON business_profiles(is_featured);
CREATE INDEX IF NOT EXISTS idx_business_profiles_created_at ON business_profiles(created_at);

-- Spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_business_profiles_location ON business_profiles USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_business_reviews_business_id ON business_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_user_id ON business_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_rating ON business_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_business_favorites_business_id ON business_favorites(business_id);
CREATE INDEX IF NOT EXISTS idx_business_favorites_user_id ON business_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_business_orders_business_id ON business_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_business_orders_customer_id ON business_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_business_orders_status ON business_orders(status);
CREATE INDEX IF NOT EXISTS idx_business_orders_created_at ON business_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_business_messages_business_id ON business_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_business_messages_user_id ON business_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_business_messages_is_read ON business_messages(is_read);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_business_views_business_id ON business_views(business_id);
CREATE INDEX IF NOT EXISTS idx_business_views_created_at ON business_views(created_at);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_reviews_updated_at BEFORE UPDATE ON business_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_reports_updated_at BEFORE UPDATE ON business_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_orders_updated_at BEFORE UPDATE ON business_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Business profiles policies
CREATE POLICY "Anyone can view active businesses" ON business_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Business owners can manage their businesses" ON business_profiles FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Business owners can insert their business" ON business_profiles FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Business reviews policies
CREATE POLICY "Anyone can view reviews" ON business_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews" ON business_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can insert reviews" ON business_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Business favorites policies
CREATE POLICY "Users can view their own favorites" ON business_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON business_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their favorites" ON business_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Business reports policies
CREATE POLICY "Users can view their own reports" ON business_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can insert reports" ON business_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Business orders policies
CREATE POLICY "Customers can view their orders" ON business_orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Business owners can view orders for their business" ON business_orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Customers can insert orders" ON business_orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Business owners can update orders for their business" ON business_orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);

-- Business messages policies
CREATE POLICY "Users can view their messages" ON business_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Business owners can view messages for their business" ON business_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Business owners can insert messages" ON business_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);

-- User notifications policies
CREATE POLICY "Users can view their notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Business views policies
CREATE POLICY "Anyone can insert business views" ON business_views FOR INSERT WITH CHECK (true);

-- Search queries policies
CREATE POLICY "Users can insert search queries" ON search_queries FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create functions for business statistics
CREATE OR REPLACE FUNCTION get_business_stats(business_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_views', COALESCE((SELECT COUNT(*) FROM business_views WHERE business_id = business_uuid), 0),
        'monthly_views', COALESCE((SELECT COUNT(*) FROM business_views WHERE business_id = business_uuid AND created_at >= NOW() - INTERVAL '30 days'), 0),
        'total_reviews', COALESCE((SELECT COUNT(*) FROM business_reviews WHERE business_id = business_uuid), 0),
        'average_rating', COALESCE((SELECT AVG(rating) FROM business_reviews WHERE business_id = business_uuid), 0),
        'favorite_count', COALESCE((SELECT COUNT(*) FROM business_favorites WHERE business_id = business_uuid), 0),
        'total_orders', COALESCE((SELECT COUNT(*) FROM business_orders WHERE business_id = business_uuid), 0),
        'monthly_orders', COALESCE((SELECT COUNT(*) FROM business_orders WHERE business_id = business_uuid AND created_at >= NOW() - INTERVAL '30 days'), 0)
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search businesses with location
CREATE OR REPLACE FUNCTION search_businesses(
    search_query TEXT DEFAULT NULL,
    search_category TEXT DEFAULT NULL,
    user_lat DOUBLE PRECISION DEFAULT NULL,
    user_lng DOUBLE PRECISION DEFAULT NULL,
    search_radius_meters INTEGER DEFAULT 10000,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    business_name TEXT,
    description TEXT,
    category TEXT,
    address JSONB,
    location GEOGRAPHY,
    distance_meters DOUBLE PRECISION,
    rating DOUBLE PRECISION,
    review_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.business_name,
        bp.description,
        bp.category,
        bp.address,
        bp.location,
        CASE 
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND bp.location IS NOT NULL
            THEN ST_Distance(bp.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326))
            ELSE NULL
        END as distance_meters,
        COALESCE(AVG(br.rating), 0) as rating,
        COUNT(br.id) as review_count
    FROM business_profiles bp
    LEFT JOIN business_reviews br ON bp.id = br.business_id
    WHERE 
        bp.is_active = true
        AND (search_query IS NULL OR (
            bp.business_name ILIKE '%' || search_query || '%' 
            OR bp.description ILIKE '%' || search_query || '%'
            OR search_query = ANY(bp.tags)
        ))
        AND (search_category IS NULL OR bp.category = search_category)
        AND (
            user_lat IS NULL OR user_lng IS NULL OR bp.location IS NULL
            OR ST_DWithin(
                bp.location, 
                ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326), 
                search_radius_meters
            )
        )
    GROUP BY bp.id, bp.business_name, bp.description, bp.category, bp.address, bp.location, bp.created_at
    ORDER BY 
        CASE 
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND bp.location IS NOT NULL
            THEN ST_Distance(bp.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326))
            ELSE 0
        END ASC,
        bp.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default categories and sample data (optional - remove in production)
-- This is just for development/testing purposes

-- Sample user profiles
INSERT INTO user_profiles (id, email, first_name, last_name, display_name, user_type) VALUES
(uuid_generate_v4(), 'john.customer@example.com', 'John', 'Doe', 'John Doe', 'customer'),
(uuid_generate_v4(), 'jane.business@example.com', 'Jane', 'Smith', 'Jane Smith', 'business_owner')
ON CONFLICT (email) DO NOTHING;

-- Note: In production, remove the sample data and only keep the schema and functions