-- =====================================================
-- TOWNTAP - COMPLETE DATABASE SCHEMA
-- Full-featured database for TownTap React Native App
-- Version: 2.0 - Production Ready
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CORE USER TABLES
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_type TEXT DEFAULT 'customer' CHECK (user_type IN ('customer', 'business_owner', 'admin')),
    
    -- Location preferences
    preferred_city TEXT DEFAULT 'Bhopal',
    preferred_language TEXT DEFAULT 'en',
    
    -- Status fields
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Additional user data
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business categories
CREATE TABLE public.business_categories (
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

-- =====================================================
-- BUSINESS TABLES
-- =====================================================

-- Main businesses table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.business_categories(id),
    business_type TEXT DEFAULT 'type_a' CHECK (business_type IN ('type_a', 'type_b', 'type_c')),
    
    -- Contact information
    email TEXT,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    website_url TEXT,
    
    -- Location data
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Bhopal',
    state TEXT DEFAULT 'Madhya Pradesh',
    country TEXT DEFAULT 'India',
    pincode TEXT,
    landmark TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    
    -- Business operation details
    opening_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "21:00", "closed": false}, "tuesday": {"open": "09:00", "close": "21:00", "closed": false}, "wednesday": {"open": "09:00", "close": "21:00", "closed": false}, "thursday": {"open": "09:00", "close": "21:00", "closed": false}, "friday": {"open": "09:00", "close": "21:00", "closed": false}, "saturday": {"open": "09:00", "close": "21:00", "closed": false}, "sunday": {"open": "10:00", "close": "20:00", "closed": false}}',
    is_open BOOLEAN DEFAULT true,
    delivery_available BOOLEAN DEFAULT false,
    pickup_available BOOLEAN DEFAULT true,
    delivery_radius_km INTEGER DEFAULT 5,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    estimated_delivery_time INTEGER DEFAULT 30, -- in minutes
    
    -- Media and branding
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    
    -- Business metrics
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Business verification and status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
    verification_documents JSONB,
    
    -- SEO and marketing
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    special_offers TEXT,
    announcement TEXT,
    
    -- Business settings
    settings JSONB DEFAULT '{"notifications": {"orders": true, "reviews": true, "promotions": false}, "privacy": {"show_phone": true, "show_email": false}}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business hours table (separate for more flexibility)
CREATE TABLE public.business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN DEFAULT false,
    is_24_hours BOOLEAN DEFAULT false,
    break_start_time TIME,
    break_end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT/SERVICE TABLES
-- =====================================================

-- Product categories
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products/Services
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.product_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- for discounts
    
    -- Product classification
    type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service')),
    category TEXT,
    subcategory TEXT,
    
    -- Media
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    
    -- Availability and inventory
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER,
    track_inventory BOOLEAN DEFAULT false,
    min_stock_alert INTEGER DEFAULT 5,
    
    -- Product specifications
    unit TEXT DEFAULT 'piece',
    weight DECIMAL(8,2),
    dimensions JSONB, -- {"length": 10, "width": 5, "height": 2, "unit": "cm"}
    variants JSONB, -- {"size": ["S", "M", "L"], "color": ["Red", "Blue"]}
    
    -- Pricing and offers
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    
    -- SEO and discoverability
    tags TEXT[] DEFAULT '{}',
    sku TEXT,
    barcode TEXT,
    brand TEXT,
    
    -- Product metrics
    view_count INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    
    -- Additional details
    ingredients TEXT, -- for food items
    allergen_info TEXT,
    nutritional_info JSONB,
    care_instructions TEXT,
    warranty_info TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER MANAGEMENT
-- =====================================================

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id),
    business_id UUID REFERENCES public.businesses(id),
    
    -- Order type and status
    order_type TEXT DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup', 'service', 'dine_in')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled', 'refunded')),
    
    -- Financial details
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Delivery information
    delivery_address JSONB,
    pickup_address JSONB,
    customer_location GEOGRAPHY(POINT, 4326),
    
    -- Timing
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_preparation_time INTEGER, -- in minutes
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_pickup_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    
    -- Payment information
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'failed', 'refunded', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet', 'net_banking')),
    payment_id TEXT,
    transaction_id TEXT,
    
    -- Order details
    special_instructions TEXT,
    delivery_instructions TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    
    -- Customer details (stored for records)
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    
    -- Ratings and feedback
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    business_rating INTEGER CHECK (business_rating >= 1 AND business_rating <= 5),
    business_feedback TEXT,
    
    -- Delivery tracking
    delivery_person_name TEXT,
    delivery_person_phone TEXT,
    tracking_updates JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    
    -- Quantity and pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Product snapshot (preserve product details at time of order)
    product_name TEXT NOT NULL,
    product_description TEXT,
    product_image_url TEXT,
    product_details JSONB,
    variant_details JSONB, -- selected size, color, etc.
    
    -- Special requests
    special_instructions TEXT,
    customizations JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REVIEWS AND RATINGS
-- =====================================================

-- Reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id),
    business_id UUID REFERENCES public.businesses(id),
    product_id UUID REFERENCES public.products(id),
    order_id UUID REFERENCES public.orders(id),
    
    -- Rating and review
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_title TEXT,
    
    -- Media
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    
    -- Review categories
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Review status
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Business response
    business_response TEXT,
    business_response_date TIMESTAMP WITH TIME ZONE,
    
    -- Moderation
    is_moderated BOOLEAN DEFAULT false,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderation_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review helpfulness votes
CREATE TABLE public.review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- =====================================================
-- PROMOTIONAL AND MARKETING
-- =====================================================

-- Coupons and discounts
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Discount details
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_delivery')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    current_usage_count INTEGER DEFAULT 0,
    
    -- Targeting
    applicable_categories TEXT[] DEFAULT '{}',
    applicable_products UUID[] DEFAULT '{}',
    first_time_users_only BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE public.coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES public.coupons(id),
    user_id UUID REFERENCES public.profiles(id),
    order_id UUID REFERENCES public.orders(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS AND TRACKING
-- =====================================================

-- Business analytics
CREATE TABLE public.business_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Order metrics
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    
    -- Customer metrics
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    
    -- Product metrics
    products_sold INTEGER DEFAULT 0,
    top_selling_product_id UUID,
    
    -- Engagement metrics
    profile_views INTEGER DEFAULT 0,
    menu_views INTEGER DEFAULT 0,
    call_clicks INTEGER DEFAULT 0,
    direction_clicks INTEGER DEFAULT 0,
    
    -- Review metrics
    new_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('order', 'review', 'promotion', 'system', 'business')),
    
    -- Notification data
    data JSONB,
    deep_link TEXT,
    image_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    
    -- Targeting
    target_audience TEXT CHECK (target_audience IN ('specific_user', 'all_customers', 'business_owners')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate unique order number
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
        
        -- Prevent infinite loop
        IF counter > 9999 THEN
            new_number := 'TT' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD((EXTRACT(EPOCH FROM NOW()) % 1000)::INTEGER::TEXT, 3, '0');
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Set order number trigger function
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number = public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get nearby businesses with enhanced filtering
CREATE OR REPLACE FUNCTION public.get_nearby_businesses(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km INTEGER DEFAULT 20,
    category_filter TEXT DEFAULT NULL,
    business_type_filter TEXT DEFAULT NULL,
    min_rating DECIMAL DEFAULT 0,
    is_open_only BOOLEAN DEFAULT false
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
        b.total_orders DESC;
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
    -- Calculate average rating and count
    SELECT 
        COALESCE(AVG(rating), 0),
        COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.reviews 
    WHERE business_id = COALESCE(NEW.business_id, OLD.business_id);
    
    -- Update business table
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
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate order numbers
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_number();

-- Update business location
CREATE TRIGGER update_business_location_trigger
    BEFORE INSERT OR UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.update_business_location();

-- Update business rating when reviews change
CREATE TRIGGER update_business_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Geographic indexes
CREATE INDEX IF NOT EXISTS idx_businesses_location ON public.businesses USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_businesses_lat_lng ON public.businesses (latitude, longitude);

-- Business indexes
CREATE INDEX IF NOT EXISTS idx_businesses_active ON public.businesses (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses (category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses (owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON public.businesses (city);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON public.businesses (rating DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON public.businesses (is_featured) WHERE is_featured = true;

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_business ON public.products (business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products (is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('english', name));

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders (business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders (order_date DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items (product_id);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews (business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews (customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews (rating DESC);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications (created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_business_date ON public.business_analytics (business_id, date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

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

-- Business hours policies
CREATE POLICY "Anyone can view business hours" ON public.business_hours
    FOR SELECT USING (true);

CREATE POLICY "Business owners can manage hours" ON public.business_hours
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

-- Product categories policies
CREATE POLICY "Anyone can view product categories" ON public.product_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage categories" ON public.product_categories
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

-- Products policies
CREATE POLICY "Anyone can view available products" ON public.products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Business owners can manage products" ON public.products
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Order participants can update" ON public.orders
    FOR UPDATE USING (
        auth.uid() = customer_id OR
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

-- Order items policies
CREATE POLICY "Order participants can view items" ON public.order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM public.orders 
            WHERE customer_id = auth.uid() OR 
            business_id IN (
                SELECT id FROM public.businesses WHERE owner_id = auth.uid()
            )
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Review authors can update" ON public.reviews
    FOR UPDATE USING (auth.uid() = customer_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert business categories
INSERT INTO public.business_categories (name, description, icon) VALUES
('Restaurant', 'Food and dining establishments', '🍽️'),
('Fast Food', 'Quick service restaurants', '🍔'),
('Cafe & Coffee', 'Coffee shops and cafes', '☕'),
('Bakery', 'Bakeries and pastry shops', '🥖'),
('Grocery Store', 'Supermarkets and grocery stores', '🛒'),
('Pharmacy', 'Medical stores and pharmacies', '💊'),
('Electronics', 'Electronics and gadget stores', '📱'),
('Clothing', 'Fashion and apparel stores', '👕'),
('Beauty & Wellness', 'Salons and wellness centers', '💄'),
('Home Services', 'Home repair and maintenance', '🔧'),
('Education', 'Educational institutions and tutoring', '📚'),
('Automotive', 'Vehicle services and repairs', '🚗'),
('Health & Fitness', 'Gyms and health centers', '💪'),
('Entertainment', 'Entertainment and recreation', '🎬'),
('Professional Services', 'Business and professional services', '💼');

-- Insert sample businesses in Bhopal
INSERT INTO public.businesses (
    business_name,
    description,
    category_id,
    business_type,
    email,
    phone,
    address,
    city,
    pincode,
    latitude,
    longitude,
    is_verified,
    rating,
    delivery_available,
    minimum_order_amount,
    delivery_fee,
    estimated_delivery_time
) VALUES
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

('Tech World Electronics', 'Latest electronics, mobile phones and accessories',
 (SELECT id FROM public.business_categories WHERE name = 'Electronics'),
 'type_a', 'sales@techworld.com', '+919876543213',
 'DB City Mall, Zone 2, Bhopal', 'Bhopal', '462023', 
 23.2599, 77.4126, true, 4.4, false, 0.00, 0.00, 0),

('Fresh Mart Grocery', 'Fresh vegetables, fruits and daily essentials',
 (SELECT id FROM public.business_categories WHERE name = 'Grocery Store'),
 'type_a', 'orders@freshmart.com', '+919876543214',
 'Arera Colony Main Road, Bhopal', 'Bhopal', '462016', 
 23.2599, 77.4126, true, 4.1, true, 200.00, 40.00, 60),

('Style Studio Fashion', 'Trendy clothing and fashion accessories',
 (SELECT id FROM public.business_categories WHERE name = 'Clothing'),
 'type_a', 'hello@stylestudio.com', '+919876543215',
 'Bittan Market, Old City, Bhopal', 'Bhopal', '462001', 
 23.2599, 77.4126, true, 4.0, false, 0.00, 0.00, 0),

('Cafe Mocha House', 'Premium coffee and light snacks',
 (SELECT id FROM public.business_categories WHERE name = 'Cafe & Coffee'),
 'type_a', 'info@mochahouse.com', '+919876543216',
 '10 Number Market, MP Nagar, Bhopal', 'Bhopal', '462011', 
 23.2599, 77.4126, true, 4.6, true, 80.00, 15.00, 20),

('Glow Beauty Salon', 'Professional beauty and wellness services',
 (SELECT id FROM public.business_categories WHERE name = 'Beauty & Wellness'),
 'type_b', 'book@glowsalon.com', '+919876543217',
 'Shahpura, Near TT Nagar, Bhopal', 'Bhopal', '462020', 
 23.2599, 77.4126, true, 4.7, false, 0.00, 0.00, 0);

-- Sample success message
DO $$
BEGIN
    RAISE NOTICE '✅ TownTap database setup completed successfully!';
    RAISE NOTICE '📊 Created comprehensive schema with all features';
    RAISE NOTICE '🏪 Sample businesses added for Bhopal';
    RAISE NOTICE '🔍 Geographic search functions ready (20km radius)';
    RAISE NOTICE '⚡ Realtime subscriptions enabled';
    RAISE NOTICE '🔒 Row Level Security configured';
    RAISE NOTICE '📈 Analytics and reporting ready';
    RAISE NOTICE '🎯 Full e-commerce functionality available';
END $$;
