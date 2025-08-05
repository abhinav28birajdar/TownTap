-- Run this SQL file in your Supabase SQL Editor
-- =====================================================
-- TOWNTAP COMPLETE DATABASE SCHEMA - UPDATED
-- Production-Ready Database for React Native App  
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- DROP EXISTING FUNCTION IF EXISTS (for clean reinstall)
-- =====================================================
DROP FUNCTION IF EXISTS public.get_nearby_businesses(DECIMAL, DECIMAL, INTEGER, TEXT, TEXT, DECIMAL, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS public.get_nearby_businesses(DECIMAL, DECIMAL, INTEGER, TEXT, INTEGER);

-- =====================================================
-- CORE TABLES (IF NOT EXISTS for safety)
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_type TEXT DEFAULT 'customer' CHECK (user_type IN ('customer', 'business_owner', 'admin')),
    preferred_city TEXT DEFAULT 'Bhopal',
    preferred_language TEXT DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business categories
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.business_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.business_categories(id),
    business_type TEXT DEFAULT 'type_a' CHECK (business_type IN ('type_a', 'type_b', 'type_c')),
    email TEXT,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    website_url TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Bhopal',
    state TEXT DEFAULT 'Madhya Pradesh',
    country TEXT DEFAULT 'India',
    pincode TEXT,
    landmark TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    opening_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "21:00", "closed": false}, "tuesday": {"open": "09:00", "close": "21:00", "closed": false}, "wednesday": {"open": "09:00", "close": "21:00", "closed": false}, "thursday": {"open": "09:00", "close": "21:00", "closed": false}, "friday": {"open": "09:00", "close": "21:00", "closed": false}, "saturday": {"open": "09:00", "close": "21:00", "closed": false}, "sunday": {"open": "10:00", "close": "20:00", "closed": false}}',
    is_open BOOLEAN DEFAULT true,
    delivery_available BOOLEAN DEFAULT false,
    pickup_available BOOLEAN DEFAULT true,
    delivery_radius_km INTEGER DEFAULT 5,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    estimated_delivery_time INTEGER DEFAULT 30,
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
    verification_documents JSONB,
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    special_offers TEXT,
    announcement TEXT,
    settings JSONB DEFAULT '{"notifications": {"orders": true, "reviews": true, "promotions": false}, "privacy": {"show_phone": true, "show_email": false}}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products/Services
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service')),
    category TEXT,
    subcategory TEXT,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER,
    track_inventory BOOLEAN DEFAULT false,
    min_stock_alert INTEGER DEFAULT 5,
    unit TEXT DEFAULT 'piece',
    weight DECIMAL(8,2),
    dimensions JSONB,
    variants JSONB,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    sku TEXT,
    barcode TEXT,
    brand TEXT,
    view_count INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    ingredients TEXT,
    allergen_info TEXT,
    nutritional_info JSONB,
    care_instructions TEXT,
    warranty_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id),
    business_id UUID REFERENCES public.businesses(id),
    order_type TEXT DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup', 'service', 'dine_in')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled', 'refunded')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address JSONB,
    pickup_address JSONB,
    customer_location GEOGRAPHY(POINT, 4326),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_preparation_time INTEGER,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_pickup_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'failed', 'refunded', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet', 'net_banking')),
    payment_id TEXT,
    transaction_id TEXT,
    special_instructions TEXT,
    delivery_instructions TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    business_rating INTEGER CHECK (business_rating >= 1 AND business_rating <= 5),
    business_feedback TEXT,
    delivery_person_name TEXT,
    delivery_person_phone TEXT,
    tracking_updates JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    product_name TEXT NOT NULL,
    product_description TEXT,
    product_image_url TEXT,
    product_details JSONB,
    variant_details JSONB,
    special_instructions TEXT,
    customizations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id),
    business_id UUID REFERENCES public.businesses(id),
    product_id UUID REFERENCES public.products(id),
    order_id UUID REFERENCES public.orders(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_title TEXT,
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    business_response TEXT,
    business_response_date TIMESTAMP WITH TIME ZONE,
    is_moderated BOOLEAN DEFAULT false,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('order', 'review', 'promotion', 'system', 'business')),
    data JSONB,
    deep_link TEXT,
    image_url TEXT,
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    target_audience TEXT CHECK (target_audience IN ('specific_user', 'all_customers', 'business_owners')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_delivery')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    current_usage_count INTEGER DEFAULT 0,
    applicable_categories TEXT[] DEFAULT '{}',
    applicable_products UUID[] DEFAULT '{}',
    first_time_users_only BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'TT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        
        IF counter > 9999 THEN
            new_number := 'TT' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD((EXTRACT(EPOCH FROM NOW()) % 1000)::INTEGER::TEXT, 3, '0');
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Set order number
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number = public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ FIXED: Get nearby businesses function with correct parameters
CREATE OR REPLACE FUNCTION public.get_nearby_businesses(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km INTEGER DEFAULT 20,
    category_filter TEXT DEFAULT NULL,
    business_type_filter TEXT DEFAULT NULL,
    min_rating DECIMAL DEFAULT 0,
    is_open_only BOOLEAN DEFAULT false,
    limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    description TEXT,
    category TEXT,
    business_type TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    rating DECIMAL,
    review_count INTEGER,
    total_orders INTEGER,
    is_open BOOLEAN,
    delivery_available BOOLEAN,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km DECIMAL,
    logo_url TEXT,
    estimated_delivery_time INTEGER,
    minimum_order_amount DECIMAL,
    delivery_fee DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.business_name,
        b.description,
        COALESCE(bc.name, 'Unknown') as category,
        b.business_type,
        b.address,
        b.city,
        b.phone,
        b.email,
        b.rating,
        b.review_count,
        b.total_orders,
        b.is_open,
        b.delivery_available,
        b.latitude,
        b.longitude,
        ROUND(
            ST_Distance(
                ST_Point(user_lng, user_lat)::geography,
                ST_Point(b.longitude, b.latitude)::geography
            ) / 1000, 2
        ) as distance_km,
        b.logo_url,
        b.estimated_delivery_time,
        b.minimum_order_amount,
        b.delivery_fee
    FROM public.businesses b
    LEFT JOIN public.business_categories bc ON b.category_id = bc.id
    WHERE 
        b.is_active = true
        AND b.latitude IS NOT NULL 
        AND b.longitude IS NOT NULL
        AND ST_DWithin(
            ST_Point(user_lng, user_lat)::geography,
            ST_Point(b.longitude, b.latitude)::geography,
            radius_km * 1000
        )
        AND (category_filter IS NULL OR bc.name ILIKE '%' || category_filter || '%')
        AND (business_type_filter IS NULL OR b.business_type = business_type_filter)
        AND b.rating >= min_rating
        AND (is_open_only = false OR b.is_open = true)
    ORDER BY 
        b.is_featured DESC,
        distance_km ASC,
        b.rating DESC,
        b.total_orders DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Update business location
CREATE OR REPLACE FUNCTION public.update_business_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_Point(NEW.longitude, NEW.latitude);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update business rating
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    total_reviews INTEGER;
BEGIN
    SELECT 
        COALESCE(AVG(rating), 0),
        COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.reviews 
    WHERE business_id = COALESCE(NEW.business_id, OLD.business_id);
    
    UPDATE public.businesses 
    SET 
        rating = avg_rating,
        review_count = total_reviews,
        total_reviews = total_reviews,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.business_id, OLD.business_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate order numbers
DROP TRIGGER IF EXISTS generate_order_number_trigger ON public.orders;
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_number();

-- Update business location
DROP TRIGGER IF EXISTS update_business_location_trigger ON public.businesses;
CREATE TRIGGER update_business_location_trigger
    BEFORE INSERT OR UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.update_business_location();

-- Update business rating
DROP TRIGGER IF EXISTS update_business_rating_trigger ON public.reviews;
CREATE TRIGGER update_business_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

-- =====================================================
-- INDEXES
-- =====================================================

-- Geographic indexes
DROP INDEX IF EXISTS idx_businesses_location;
CREATE INDEX idx_businesses_location ON public.businesses USING GIST (location);

DROP INDEX IF EXISTS idx_businesses_lat_lng;
CREATE INDEX idx_businesses_lat_lng ON public.businesses (latitude, longitude);

-- Business indexes
DROP INDEX IF EXISTS idx_businesses_active;
CREATE INDEX idx_businesses_active ON public.businesses (is_active) WHERE is_active = true;

DROP INDEX IF EXISTS idx_businesses_category;
CREATE INDEX idx_businesses_category ON public.businesses (category_id);

DROP INDEX IF EXISTS idx_businesses_owner;
CREATE INDEX idx_businesses_owner ON public.businesses (owner_id);

DROP INDEX IF EXISTS idx_businesses_city;
CREATE INDEX idx_businesses_city ON public.businesses (city);

DROP INDEX IF EXISTS idx_businesses_rating;
CREATE INDEX idx_businesses_rating ON public.businesses (rating DESC);

-- Product indexes
DROP INDEX IF EXISTS idx_products_business;
CREATE INDEX idx_products_business ON public.products (business_id);

DROP INDEX IF EXISTS idx_products_available;
CREATE INDEX idx_products_available ON public.products (is_available) WHERE is_available = true;

-- Order indexes
DROP INDEX IF EXISTS idx_orders_customer;
CREATE INDEX idx_orders_customer ON public.orders (customer_id);

DROP INDEX IF EXISTS idx_orders_business;
CREATE INDEX idx_orders_business ON public.orders (business_id);

DROP INDEX IF EXISTS idx_orders_status;
CREATE INDEX idx_orders_status ON public.orders (status);

DROP INDEX IF EXISTS idx_orders_date;
CREATE INDEX idx_orders_date ON public.orders (order_date DESC);

-- Review indexes
DROP INDEX IF EXISTS idx_reviews_business;
CREATE INDEX idx_reviews_business ON public.reviews (business_id);

DROP INDEX IF EXISTS idx_reviews_customer;
CREATE INDEX idx_reviews_customer ON public.reviews (customer_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can create profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can manage own business" ON public.businesses;
DROP POLICY IF EXISTS "Anyone can view available products" ON public.products;
DROP POLICY IF EXISTS "Business owners can manage products" ON public.products;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Business policies
CREATE POLICY "Anyone can view active businesses" ON public.businesses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage own business" ON public.businesses
    FOR ALL USING (auth.uid() = owner_id);

-- Product policies
CREATE POLICY "Anyone can view available products" ON public.products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Business owners can manage products" ON public.products
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

-- Order policies
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Review policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- =====================================================
-- REALTIME
-- =====================================================

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert business categories
INSERT INTO public.business_categories (name, description, icon) VALUES
('Restaurant', 'Food and dining establishments', '🍽️'),
('Fast Food', 'Quick service restaurants', '🍔'),
('Cafe & Coffee', 'Coffee shops and cafes', '☕'),
('Grocery Store', 'Supermarkets and grocery stores', '🛒'),
('Pharmacy', 'Medical stores and pharmacies', '💊'),
('Electronics', 'Electronics and gadget stores', '📱'),
('Clothing', 'Fashion and apparel stores', '👕'),
('Beauty & Wellness', 'Salons and wellness centers', '💄'),
('Home Services', 'Home repair and maintenance', '🔧'),
('Professional Services', 'Business and professional services', '💼')
ON CONFLICT (name) DO NOTHING;

-- Insert sample businesses (fixed to prevent duplicates)
INSERT INTO public.businesses (
    business_name, description, category_id, business_type, email, phone, address, city, pincode,
    latitude, longitude, is_verified, rating, delivery_available, minimum_order_amount, delivery_fee, estimated_delivery_time
) 
SELECT 
    business_name, description, category_id, business_type, email, phone, address, city, pincode,
    latitude, longitude, is_verified, rating, delivery_available, minimum_order_amount, delivery_fee, estimated_delivery_time
FROM (VALUES
    ('Bhopal Sweets & Snacks', 'Traditional sweets, snacks and Indian delicacies', 
     (SELECT id FROM public.business_categories WHERE name = 'Restaurant'), 
     'type_a', 'orders@bhopalsweets.com', '+919876543210',
     'MP Nagar Zone 1, Near BHEL, Bhopal', 'Bhopal', '462011', 
     23.2599, 77.4126, true, 4.5, true, 150.00, 30.00, 45),

    ('Quick Bites Express', 'Fast food and quick meals',
     (SELECT id FROM public.business_categories WHERE name = 'Fast Food'),
     'type_a', 'info@quickbites.com', '+919876543211', 
     'New Market, Zone 2, Bhopal', 'Bhopal', '462001', 
     23.2599, 77.4126, true, 4.2, true, 100.00, 25.00, 30),

    ('City Medical Plus', 'Complete pharmacy and medical supplies',
     (SELECT id FROM public.business_categories WHERE name = 'Pharmacy'),
     'type_a', 'contact@citymedical.com', '+919876543212',
     'Hamidia Road, Near Railway Station, Bhopal', 'Bhopal', '462001', 
     23.2599, 77.4126, true, 4.3, true, 50.00, 20.00, 25),

    ('Fresh Mart Grocery', 'Fresh vegetables, fruits and daily essentials',
     (SELECT id FROM public.business_categories WHERE name = 'Grocery Store'),
     'type_a', 'orders@freshmart.com', '+919876543214',
     'Arera Colony Main Road, Bhopal', 'Bhopal', '462016', 
     23.2599, 77.4126, true, 4.1, true, 200.00, 40.00, 60),

    ('Cafe Mocha House', 'Premium coffee and light snacks',
     (SELECT id FROM public.business_categories WHERE name = 'Cafe & Coffee'),
     'type_a', 'info@mochahouse.com', '+919876543216',
     '10 Number Market, MP Nagar, Bhopal', 'Bhopal', '462011', 
     23.2599, 77.4126, true, 4.6, true, 80.00, 15.00, 20)
) AS new_businesses (business_name, description, category_id, business_type, email, phone, address, city, pincode, latitude, longitude, is_verified, rating, delivery_available, minimum_order_amount, delivery_fee, estimated_delivery_time)
WHERE NOT EXISTS (
    SELECT 1 FROM public.businesses WHERE business_name = new_businesses.business_name
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ TownTap database setup completed successfully!';
    RAISE NOTICE '🏪 Sample businesses added for Bhopal';
    RAISE NOTICE '🔍 Geographic search ready (20km radius)';
    RAISE NOTICE '⚡ Realtime subscriptions enabled';
    RAISE NOTICE '🔒 Row Level Security configured';
    RAISE NOTICE '🔧 Function get_nearby_businesses fixed with all parameters';
END $$;
