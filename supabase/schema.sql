-- TownTap Database Schema for Location-based Business Discovery

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- User profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    user_type TEXT CHECK (user_type IN ('customer', 'business_owner')) NOT NULL,
    avatar_url TEXT,
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business categories table
CREATE TABLE business_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default business categories
INSERT INTO business_categories (name, icon, description) VALUES
('Stationary', '📝', 'Stationery shops, office supplies, books'),
('Salon & Beauty', '💇', 'Hair salons, beauty parlors, spas'),
('Bookstore', '📚', 'Book shops, libraries, educational materials'),
('Carpenter', '🔨', 'Furniture making, wood work, repairs'),
('Study Center', '🎓', 'Coaching centers, tuition classes, education'),
('Library', '📖', 'Public libraries, reading rooms'),
('Grocery', '🛒', 'Grocery stores, supermarkets, daily needs'),
('Restaurant', '🍽️', 'Restaurants, cafes, food outlets'),
('Medical', '⚕️', 'Hospitals, clinics, pharmacies'),
('Electronics', '📱', 'Mobile shops, computer stores, electronics'),
('Clothing', '👕', 'Clothing stores, fashion boutiques'),
('Auto Service', '🚗', 'Car service, bike repair, auto parts');

-- Businesses table
CREATE TABLE businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES business_categories(id),
    business_name TEXT NOT NULL,
    description TEXT,
    phone_number TEXT NOT NULL,
    whatsapp_number TEXT,
    email TEXT,
    website_url TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    landmark TEXT,
    business_hours JSONB, -- {"monday": {"open": "09:00", "close": "18:00", "closed": false}, ...}
    services TEXT[], -- Array of services offered
    images TEXT[], -- Array of image URLs
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    images TEXT[], -- Array of review image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, customer_id) -- One review per customer per business
);

-- Customer favorites table
CREATE TABLE favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, business_id)
);

-- Messages/Inquiries table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    customer_phone TEXT,
    customer_name TEXT,
    message_type TEXT CHECK (message_type IN ('inquiry', 'booking', 'general')) DEFAULT 'general',
    status TEXT CHECK (status IN ('new', 'read', 'replied', 'closed')) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business analytics table
CREATE TABLE business_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    calls INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_businesses_location ON businesses USING GIST(location);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_active ON businesses(is_active);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_messages_business ON messages(business_id);
CREATE INDEX idx_messages_status ON messages(status);

-- RLS (Row Level Security) Policies

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage their businesses" ON businesses
    FOR ALL USING (auth.uid() = owner_id);

-- Reviews policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = customer_id);

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = business_id AND b.owner_id = auth.uid()
        )
    );

CREATE POLICY "Customers can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Anyone can create messages" ON messages
    FOR INSERT WITH CHECK (true);

-- Favorites policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can manage their favorites" ON favorites
    FOR ALL USING (auth.uid() = customer_id);

-- Functions for distance calculation
CREATE OR REPLACE FUNCTION get_nearby_businesses(
    user_lat FLOAT,
    user_lng FLOAT,
    radius_km FLOAT DEFAULT 5.0,
    category_filter UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    description TEXT,
    phone_number TEXT,
    address TEXT,
    category_name TEXT,
    category_icon TEXT,
    rating DECIMAL,
    total_reviews INTEGER,
    images TEXT[],
    distance_km FLOAT,
    latitude FLOAT,
    longitude FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.business_name,
        b.description,
        b.phone_number,
        b.address,
        bc.name as category_name,
        bc.icon as category_icon,
        b.rating,
        b.total_reviews,
        b.images,
        ROUND(
            ST_Distance(
                b.location::geometry,
                ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geometry
            ) / 1000, 2
        ) as distance_km,
        ST_Y(b.location::geometry) as latitude,
        ST_X(b.location::geometry) as longitude
    FROM businesses b
    JOIN business_categories bc ON b.category_id = bc.id
    WHERE 
        b.is_active = true
        AND (category_filter IS NULL OR b.category_id = category_filter)
        AND ST_DWithin(
            b.location::geometry,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geometry,
            radius_km * 1000
        )
    ORDER BY distance_km
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update business rating
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses 
    SET 
        rating = (
            SELECT ROUND(AVG(rating), 1) 
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

-- Trigger to automatically update business rating when review is added/updated
CREATE TRIGGER update_business_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_business_rating();

-- Function to track business analytics
CREATE OR REPLACE FUNCTION track_business_view(business_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO business_analytics (business_id, date, views)
    VALUES (business_uuid, CURRENT_DATE, 1)
    ON CONFLICT (business_id, date)
    DO UPDATE SET views = business_analytics.views + 1;
END;
$$ LANGUAGE plpgsql;
