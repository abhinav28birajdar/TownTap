-- =============================================================================
-- TOWNTAP COMPLETE DATABASE SETUP - SINGLE FILE
-- Version: 2.0
-- Description: Complete database schema with all tables, policies, functions
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================================================
-- PROFILES TABLE AND TRIGGERS
-- =============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    user_type TEXT NOT NULL DEFAULT 'customer' CHECK (user_type IN ('customer', 'business_owner', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- BUSINESS TABLES
-- =============================================================================

-- Business categories
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.business_categories(id),
    category TEXT, -- Legacy field
    phone TEXT,
    phone_number TEXT, -- Additional phone field
    email TEXT,
    website TEXT,
    website_url TEXT, -- Additional website field
    address TEXT,
    landmark TEXT, -- Added landmark field
    city TEXT,
    state TEXT,
    postal_code TEXT,
    pincode TEXT, -- Additional pincode field
    whatsapp_number TEXT, -- Added whatsapp field
    services TEXT[], -- Added services array
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    business_hours JSONB DEFAULT '{}',
    images TEXT[],
    image_url TEXT,
    logo_url TEXT,
    banner_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_open BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,
    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_radius DECIMAL(5, 2) DEFAULT 5.0,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0.0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.0,
    estimated_delivery_time INTEGER DEFAULT 30,
    social_media JSONB DEFAULT '{}',
    tags TEXT[],
    features TEXT[],
    payment_methods TEXT[],
    license_number TEXT,
    tax_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update location geography when lat/long changes
CREATE OR REPLACE FUNCTION update_business_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_location
    BEFORE INSERT OR UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_business_location();

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    sku TEXT,
    barcode TEXT,
    images TEXT[],
    image_url TEXT,
    weight DECIMAL(10, 3),
    dimensions JSONB,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_digital BOOLEAN DEFAULT FALSE,
    requires_shipping BOOLEAN DEFAULT TRUE,
    shipping_weight DECIMAL(10, 3),
    shipping_dimensions JSONB,
    tags TEXT[],
    variants JSONB DEFAULT '[]',
    nutritional_info JSONB,
    allergens TEXT[],
    preparation_time INTEGER DEFAULT 0,
    calories INTEGER,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ORDER MANAGEMENT
-- =============================================================================

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
    order_type TEXT DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup', 'dine_in')),
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    tax_amount DECIMAL(10, 2) DEFAULT 0.0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.0,
    discount_amount DECIMAL(10, 2) DEFAULT 0.0,
    tip_amount DECIMAL(10, 2) DEFAULT 0.0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    currency TEXT DEFAULT 'INR',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    payment_method TEXT,
    payment_id TEXT,
    delivery_address JSONB,
    delivery_instructions TEXT,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    pickup_time TIMESTAMP WITH TIME ZONE,
    special_instructions TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_rated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = 'TT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(EXTRACT(EPOCH FROM NOW())::BIGINT % 100000, 5, '0');
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    customizations JSONB DEFAULT '{}',
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PAYMENT SYSTEM
-- =============================================================================

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL,
    payment_gateway TEXT,
    gateway_transaction_id TEXT,
    gateway_payment_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    failure_reason TEXT,
    gateway_response JSONB,
    refund_amount DECIMAL(10, 2) DEFAULT 0.0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- MESSAGING AND NOTIFICATIONS
-- =============================================================================

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'location', 'order_update')),
    content TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- REVIEWS AND RATINGS
-- =============================================================================

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    reply TEXT,
    reply_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PROMOTIONAL SYSTEM
-- =============================================================================

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_delivery')),
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0.0,
    maximum_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    applicable_categories TEXT[],
    applicable_products UUID[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ANALYTICS AND INSIGHTS
-- =============================================================================

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    event_category TEXT,
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    device_info JSONB,
    location_data GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business insights table
CREATE TABLE IF NOT EXISTS public.business_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0.0,
    total_customers INTEGER DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0.0,
    popular_products JSONB DEFAULT '[]',
    peak_hours JSONB DEFAULT '{}',
    customer_satisfaction DECIMAL(3, 2) DEFAULT 0.0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- =============================================================================
-- UTILITY TABLES
-- =============================================================================

-- App settings
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id TEXT,
    device_type TEXT,
    app_version TEXT,
    os_version TEXT,
    fcm_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Businesses indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON public.businesses USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON public.businesses(is_active, is_open);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON public.businesses(rating DESC);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Business categories (public read)
CREATE POLICY "Anyone can view business categories" ON public.business_categories
    FOR SELECT TO authenticated, anon USING (is_active = true);

-- Businesses policies
CREATE POLICY "Anyone can view active businesses" ON public.businesses
    FOR SELECT TO authenticated, anon USING (is_active = true);

CREATE POLICY "Business owners can manage their businesses" ON public.businesses
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create businesses" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Products policies
CREATE POLICY "Anyone can view available products" ON public.products
    FOR SELECT TO authenticated, anon USING (is_available = true);

CREATE POLICY "Business owners can manage their products" ON public.products
    FOR ALL USING (auth.uid() IN (
        SELECT owner_id FROM public.businesses WHERE id = business_id
    ));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
    );

CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Business owners can update their orders" ON public.orders
    FOR UPDATE USING (
        auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Customers can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = customer_id);

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert business categories
INSERT INTO public.business_categories (name, description, icon, color) VALUES
('Restaurant', 'Food and dining establishments', 'restaurant', '#FF6B6B'),
('Grocery', 'Grocery stores and supermarkets', 'storefront', '#4ECDC4'),
('Pharmacy', 'Pharmacies and medical stores', 'medical', '#45B7D1'),
('Electronics', 'Electronics and gadgets', 'phone-portrait', '#96CEB4'),
('Fashion', 'Clothing and accessories', 'shirt', '#FFEAA7'),
('Beauty', 'Beauty and personal care', 'brush', '#DDA0DD'),
('Home & Garden', 'Home improvement and gardening', 'home', '#98D8C8'),
('Services', 'Various local services', 'construct', '#F7DC6F')
ON CONFLICT (name) DO NOTHING;

-- Insert app settings
INSERT INTO public.app_settings (key, value, description, is_public) VALUES
('default_delivery_radius', '10', 'Default delivery radius in kilometers', true),
('min_order_amount', '100', 'Minimum order amount in INR', true),
('default_delivery_fee', '30', 'Default delivery fee in INR', true),
('max_delivery_distance', '25', 'Maximum delivery distance in kilometers', true),
('app_maintenance', 'false', 'App maintenance mode', true),
('featured_businesses_limit', '10', 'Number of featured businesses to show', false),
('search_radius_options', '[5, 10, 15, 20, 25]', 'Available search radius options', true)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    ) / 1000; -- Convert to kilometers
END;
$$ LANGUAGE plpgsql;

-- Function to update business rating
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.businesses 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM public.reviews 
            WHERE business_id = NEW.business_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE business_id = NEW.business_id
        ),
        updated_at = NOW()
    WHERE id = NEW.business_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_business_rating();

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
    user_id UUID,
    title TEXT,
    body TEXT,
    type TEXT DEFAULT 'general',
    data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (user_id, title, body, type, data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby businesses
CREATE OR REPLACE FUNCTION get_nearby_businesses(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km DECIMAL DEFAULT 10,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    business_name TEXT,
    description TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    rating DECIMAL,
    total_reviews INTEGER,
    is_open BOOLEAN,
    delivery_available BOOLEAN,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km DECIMAL,
    image_url TEXT,
    logo_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.business_name,
        b.description,
        COALESCE(bc.name, b.category) as category,
        b.address,
        b.city,
        COALESCE(b.phone_number, b.phone) as phone,
        b.email,
        b.rating,
        b.total_reviews,
        b.is_open,
        b.delivery_available,
        b.latitude,
        b.longitude,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            b.location
        ) / 1000 as distance_km,
        b.image_url,
        b.logo_url
    FROM public.businesses b
    LEFT JOIN public.business_categories bc ON b.category_id = bc.id
    WHERE 
        b.is_active = true
        AND b.latitude IS NOT NULL 
        AND b.longitude IS NOT NULL
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            b.location,
            radius_km * 1000
        )
        AND (category_filter IS NULL OR bc.name ILIKE '%' || category_filter || '%' OR b.category ILIKE '%' || category_filter || '%')
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to register new business
CREATE OR REPLACE FUNCTION register_business(
    owner_id UUID,
    business_data JSONB
)
RETURNS UUID AS $$
DECLARE
    business_id UUID;
    location_point GEOGRAPHY;
BEGIN
    -- Create location point if coordinates provided
    IF business_data->>'latitude' IS NOT NULL AND business_data->>'longitude' IS NOT NULL THEN
        location_point := ST_SetSRID(
            ST_MakePoint(
                (business_data->>'longitude')::DECIMAL,
                (business_data->>'latitude')::DECIMAL
            ), 
            4326
        );
    END IF;
    
    -- Insert business
    INSERT INTO public.businesses (
        owner_id,
        business_name,
        description,
        category_id,
        phone,
        phone_number,
        email,
        website_url,
        address,
        landmark,
        city,
        state,
        pincode,
        whatsapp_number,
        services,
        latitude,
        longitude,
        location,
        business_hours
    ) VALUES (
        owner_id,
        business_data->>'business_name',
        business_data->>'description',
        (business_data->>'category_id')::UUID,
        business_data->>'phone_number',
        business_data->>'phone_number',
        business_data->>'email',
        business_data->>'website_url',
        business_data->>'address',
        business_data->>'landmark',
        business_data->>'city',
        business_data->>'state',
        business_data->>'pincode',
        business_data->>'whatsapp_number',
        ARRAY(SELECT jsonb_array_elements_text(business_data->'services')),
        (business_data->'location'->>'latitude')::DECIMAL,
        (business_data->'location'->>'longitude')::DECIMAL,
        location_point,
        business_data->'business_hours'
    ) RETURNING id INTO business_id;
    
    -- Send notification to owner
    PERFORM send_notification(
        owner_id,
        'Business Registered!',
        'Your business ' || (business_data->>'business_name') || ' has been successfully registered.',
        'business_registration',
        jsonb_build_object('business_id', business_id)
    );
    
    RETURN business_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get business dashboard data
CREATE OR REPLACE FUNCTION get_business_dashboard(business_owner_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    business_count INTEGER;
    total_orders INTEGER;
    total_revenue DECIMAL;
    pending_orders INTEGER;
BEGIN
    -- Get business count
    SELECT COUNT(*) INTO business_count
    FROM public.businesses
    WHERE owner_id = business_owner_id AND is_active = true;
    
    -- Get order statistics
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_amount), 0),
        COUNT(*) FILTER (WHERE status = 'pending')
    INTO total_orders, total_revenue, pending_orders
    FROM public.orders o
    JOIN public.businesses b ON o.business_id = b.id
    WHERE b.owner_id = business_owner_id;
    
    result := jsonb_build_object(
        'business_count', business_count,
        'total_orders', total_orders,
        'total_revenue', total_revenue,
        'pending_orders', pending_orders,
        'last_updated', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'TownTap Database Setup Complete!';
    RAISE NOTICE 'Tables created: %, Functions: %, Policies: %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
        (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public'),
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public');
END $$;
