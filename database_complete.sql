-- =====================================================
-- TownTap Complete Database Schema
-- Real-Time Local Business Platform
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA public;

-- Enable Row Level Security globally
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- =====================================================
-- AUTHENTICATION & USER PROFILES
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    user_type TEXT CHECK (user_type IN ('customer', 'business_owner', 'admin')) NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    language_preference TEXT DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{"push": true, "email": true, "sms": true}',
    loyalty_points INTEGER DEFAULT 0,
    membership_tier TEXT DEFAULT 'bronze' CHECK (membership_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer addresses table
CREATE TABLE public.customer_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- Home, Work, Other
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    landmark TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer payment methods
CREATE TABLE public.customer_payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('card', 'upi', 'wallet', 'netbanking')) NOT NULL,
    provider TEXT, -- Visa, Mastercard, GPay, PhonePe, etc.
    token TEXT, -- Encrypted/tokenized payment details
    last_four TEXT, -- Last 4 digits for cards
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BUSINESS MANAGEMENT
-- =====================================================

-- Business categories table
CREATE TABLE public.business_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    parent_id UUID REFERENCES public.business_categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Platform commission percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business subcategories
CREATE TABLE public.business_subcategories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.business_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- Businesses table (complete with all required fields)
CREATE TABLE public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.business_categories(id),
    subcategory_id UUID REFERENCES public.business_subcategories(id),
    
    -- Contact Information
    phone TEXT,
    email TEXT,
    website_url TEXT,
    whatsapp_number TEXT,
    
    -- Location Information
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    pincode TEXT,
    landmark TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location JSONB, -- Store {latitude, longitude}
    service_area_radius INTEGER DEFAULT 20, -- km
    
    -- Business Details
    services TEXT[], -- Array of services offered
    specialties TEXT[], -- Special skills/certifications
    images TEXT[], -- Array of image URLs
    business_hours JSONB DEFAULT '{}',
    about_us TEXT,
    mission_statement TEXT,
    certifications TEXT[],
    
    -- Business Status
    is_open BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    
    -- Rating & Reviews
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    
    -- Delivery Information
    delivery_radius INTEGER DEFAULT 5, -- in kilometers
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_time INTEGER DEFAULT 30, -- in minutes
    emergency_service BOOLEAN DEFAULT false,
    instant_booking BOOLEAN DEFAULT true,
    
    -- Subscription & Billing
    subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Media
    profile_image_url TEXT,
    cover_image_url TEXT,
    gallery_images TEXT[],
    video_urls TEXT[],
    
    -- SEO & Marketing
    seo_title TEXT,
    seo_description TEXT,
    keywords TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business staff/employees
CREATE TABLE public.business_staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'manager', 'staff', 'service_provider')) NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10, 2),
    specializations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, profile_id)
);

-- =====================================================
-- SERVICES & PRODUCTS
-- =====================================================

-- Services offered by businesses
CREATE TABLE public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    subcategory TEXT,
    price DECIMAL(10, 2),
    price_type TEXT CHECK (price_type IN ('fixed', 'hourly', 'quote_based', 'package')) DEFAULT 'fixed',
    duration INTEGER, -- in minutes
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_emergency BOOLEAN DEFAULT false,
    requires_site_visit BOOLEAN DEFAULT false,
    advance_booking_required BOOLEAN DEFAULT false,
    min_advance_hours INTEGER DEFAULT 0,
    max_advance_days INTEGER DEFAULT 30,
    availability_slots JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service variations/add-ons
CREATE TABLE public.service_variations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    type TEXT CHECK (type IN ('addon', 'variation')) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (if applicable)
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sku TEXT UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    images TEXT[],
    weight DECIMAL(8, 2),
    dimensions JSONB, -- {length, width, height}
    is_active BOOLEAN DEFAULT true,
    requires_shipping BOOLEAN DEFAULT true,
    digital_product BOOLEAN DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS & BOOKINGS
-- =====================================================

-- Main orders table for both services and products
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    assigned_staff_id UUID REFERENCES public.business_staff(id),
    order_number TEXT UNIQUE NOT NULL,
    order_type TEXT CHECK (order_type IN ('service', 'product', 'mixed')) NOT NULL,
    
    -- Order Status
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'on_route', 'arrived', 'completed', 'cancelled', 'payment_pending')) DEFAULT 'pending',
    
    -- Booking Information (for services)
    scheduled_date TIMESTAMP WITH TIME ZONE,
    scheduled_time_slot TEXT,
    is_emergency BOOLEAN DEFAULT false,
    requires_quote BOOLEAN DEFAULT false,
    quote_amount DECIMAL(10, 2),
    quote_status TEXT CHECK (quote_status IN ('pending', 'approved', 'rejected')),
    
    -- Service Location
    service_address JSONB NOT NULL,
    service_instructions TEXT,
    customer_location JSONB, -- Current customer location for tracking
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    platform_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment
    payment_method TEXT,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial_refund')) DEFAULT 'pending',
    payment_id TEXT,
    escrow_amount DECIMAL(10, 2), -- For high-value services
    
    -- Timing
    estimated_start_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    estimated_completion_time TIMESTAMP WITH TIME ZONE,
    actual_completion_time TIMESTAMP WITH TIME ZONE,
    
    -- Additional Info
    special_instructions TEXT,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10, 2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items (for both services and products)
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    item_type TEXT CHECK (item_type IN ('service', 'product')) NOT NULL,
    service_id UUID REFERENCES public.services(id),
    product_id UUID REFERENCES public.products(id),
    variation_ids UUID[], -- For service variations/add-ons
    item_name TEXT NOT NULL,
    item_description TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status tracking
CREATE TABLE public.order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    location JSONB, -- GPS coordinates when status was updated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REVIEWS & RATINGS
-- =====================================================

-- Reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    images TEXT[],
    videos TEXT[],
    review_tags TEXT[], -- helpful, professional, on-time, etc.
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    response_from_business TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review helpfulness votes
CREATE TABLE public.review_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- =====================================================
-- MESSAGING & COMMUNICATION
-- =====================================================

-- Chat conversations
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, business_id, order_id)
);

-- Messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'location', 'order_update', 'voice', 'video')) DEFAULT 'text',
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN ('order_update', 'message', 'promotion', 'reminder', 'system')) NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROMOTIONS & MARKETING
-- =====================================================

-- Coupons and discounts
CREATE TABLE public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_delivery')) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1,
    applicable_categories UUID[],
    applicable_services UUID[],
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE public.coupon_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coupon_id, user_id, order_id)
);

-- =====================================================
-- LOYALTY & REFERRALS
-- =====================================================

-- Loyalty transactions
CREATE TABLE public.loyalty_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    transaction_type TEXT CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')) NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral tracking
CREATE TABLE public.referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'rewarded')) DEFAULT 'pending',
    reward_amount DECIMAL(10, 2),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, -- First order that triggered reward
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
-- =====================================================
-- ADDITIONAL TABLES & FEATURES
-- =====================================================

-- Wishlists/Favorites for services
CREATE TABLE public.customer_wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, business_id, service_id)
);

-- Search history for personalized recommendations
CREATE TABLE public.search_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    category_id UUID REFERENCES public.business_categories(id),
    location JSONB,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency contacts for customers
CREATE TABLE public.emergency_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business subscriptions and billing
CREATE TABLE public.business_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan_type TEXT CHECK (plan_type IN ('basic', 'premium', 'enterprise')) NOT NULL,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_method_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform settings and configuration
CREATE TABLE public.platform_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Service indexes
CREATE INDEX idx_services_business ON public.services(business_id);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_emergency ON public.services(is_emergency);

-- Review indexes
CREATE INDEX idx_reviews_business ON public.reviews(business_id);
CREATE INDEX idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_date ON public.reviews(created_at);

-- Notification indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Conversation indexes
CREATE INDEX idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX idx_conversations_business ON public.conversations(business_id);
CREATE INDEX idx_conversations_order ON public.conversations(order_id);

-- Order status history indexes
CREATE INDEX idx_order_status_order ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_date ON public.order_status_history(created_at);

-- =====================================================
-- COMPREHENSIVE RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Anyone can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage their services" ON public.services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

-- Wishlist policies
CREATE POLICY "Customers can manage their wishlists" ON public.customer_wishlists
    FOR ALL USING (auth.uid() = customer_id);

-- Search history policies
CREATE POLICY "Users can manage their search history" ON public.search_history
    FOR ALL USING (auth.uid() = user_id);

-- Emergency contacts policies
CREATE POLICY "Customers can manage their emergency contacts" ON public.emergency_contacts
    FOR ALL USING (auth.uid() = customer_id);

-- Business subscriptions policies
CREATE POLICY "Business owners can view their subscriptions" ON public.business_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

-- Platform settings policies (admin only)
CREATE POLICY "Only admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Public settings are readable by all" ON public.platform_settings
    FOR SELECT USING (is_public = true);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 DECIMAL(10, 8),
    lon1 DECIMAL(11, 8),
    lat2 DECIMAL(10, 8),
    lon2 DECIMAL(11, 8)
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371; -- Earth radius in kilometers
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);
    a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        new_number := 'TT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD((RANDOM() * 9999)::INTEGER::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique order number after 100 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update business rating
CREATE OR REPLACE FUNCTION public.update_business_rating()
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
        )
    WHERE id = NEW.business_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle loyalty points
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
    points_to_award INTEGER;
BEGIN
    -- Award 1 point per rupee spent (configurable)
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        points_to_award := FLOOR(NEW.total_amount);
        
        -- Update user's loyalty points
        UPDATE public.profiles 
        SET loyalty_points = loyalty_points + points_to_award
        WHERE id = NEW.customer_id;
        
        -- Record transaction
        INSERT INTO public.loyalty_transactions (
            user_id,
            order_id,
            transaction_type,
            points,
            description
        ) VALUES (
            NEW.customer_id,
            NEW.id,
            'earned',
            points_to_award,
            'Points earned from order #' || NEW.order_number
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    code TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate referral code only for new profiles
    IF NEW.referral_code IS NULL THEN
        LOOP
            code := UPPER(SUBSTRING(NEW.full_name FROM 1 FOR 3)) || LPAD((RANDOM() * 999)::INTEGER::TEXT, 3, '0');
            
            IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code) THEN
                NEW.referral_code := code;
                EXIT;
            END IF;
            
            counter := counter + 1;
            IF counter > 100 THEN
                -- Fallback to UUID-based code
                NEW.referral_code := 'REF' || REPLACE(uuid_generate_v4()::TEXT, '-', '')::TEXT[1:6];
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for updating business rating when reviews change
CREATE TRIGGER update_business_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

-- Trigger for awarding loyalty points
CREATE TRIGGER award_loyalty_points_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.award_loyalty_points();

-- Trigger for generating referral codes
CREATE TRIGGER generate_referral_code_trigger
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Continue with remaining triggers for updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default business categories
INSERT INTO public.business_categories (name, icon, description, commission_rate) VALUES
('Home Services', '🏠', 'Home maintenance and repair services', 12.0),
('Health & Wellness', '🏥', 'Healthcare and wellness services', 8.0),
('Beauty & Personal Care', '💄', 'Beauty, grooming and personal care', 10.0),
('Food & Dining', '🍽️', 'Food delivery and catering services', 15.0),
('Auto Services', '🚗', 'Vehicle maintenance and repair', 10.0),
('Education & Training', '📚', 'Educational and training services', 8.0),
('Technology Services', '💻', 'IT support and technology services', 12.0),
('Professional Services', '💼', 'Legal, financial and business services', 15.0),
('Event Services', '🎉', 'Event planning and management', 10.0),
('Fitness & Sports', '🏋️', 'Fitness training and sports coaching', 8.0);

-- Insert subcategories for Home Services
INSERT INTO public.business_subcategories (category_id, name, description) 
SELECT id, subcategory, description FROM (
    VALUES 
    ('Plumbing', 'Water supply, drainage, and pipe repairs'),
    ('Electrical', 'Electrical installations and repairs'),
    ('Carpentry', 'Wood work and furniture repair'),
    ('Painting', 'Wall painting and decoration'),
    ('Cleaning', 'Home and office cleaning services'),
    ('Pest Control', 'Pest elimination and prevention'),
    ('Appliance Repair', 'Home appliance maintenance and repair'),
    ('HVAC', 'Heating, ventilation, and air conditioning'),
    ('Landscaping', 'Garden design and maintenance'),
    ('Security Systems', 'Home security installation and monitoring')
) AS subcats(subcategory, description)
CROSS JOIN public.business_categories 
WHERE business_categories.name = 'Home Services';

-- Insert platform settings
INSERT INTO public.platform_settings (key, value, description, is_public) VALUES
('app_version', '"1.0.0"', 'Current app version', true),
('maintenance_mode', 'false', 'Enable maintenance mode', true),
('commission_rates', '{"default": 10, "premium": 8, "enterprise": 5}', 'Commission rates by subscription tier', false),
('loyalty_points_rate', '1', 'Points awarded per rupee spent', false),
('referral_bonus', '100', 'Bonus points for successful referrals', false),
('emergency_service_fee', '50', 'Additional fee for emergency services', true),
('max_search_radius', '50', 'Maximum search radius in kilometers', true),
('min_order_amount', '100', 'Minimum order amount in rupees', true);

-- =====================================================
-- FUNCTIONS FOR REAL-TIME FEATURES
-- =====================================================

-- Function to get nearby businesses
CREATE OR REPLACE FUNCTION public.get_nearby_businesses(
    user_lat DECIMAL(10, 8),
    user_lon DECIMAL(11, 8),
    search_radius INTEGER DEFAULT 20,
    category_filter UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    business_id UUID,
    business_name TEXT,
    distance_km DECIMAL,
    rating DECIMAL(3, 2),
    total_reviews INTEGER,
    is_open BOOLEAN,
    estimated_delivery_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        public.calculate_distance(user_lat, user_lon, b.latitude, b.longitude) as distance,
        b.rating,
        b.total_reviews,
        b.is_open,
        b.estimated_delivery_time
    FROM public.businesses b
    WHERE 
        b.is_verified = true
        AND b.status = 'active'
        AND (category_filter IS NULL OR b.category_id = category_filter)
        AND public.calculate_distance(user_lat, user_lon, b.latitude, b.longitude) <= search_radius
    ORDER BY distance ASC, b.rating DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function for intelligent search with NLP-like capabilities
CREATE OR REPLACE FUNCTION public.search_services(
    search_query TEXT,
    user_lat DECIMAL(10, 8) DEFAULT NULL,
    user_lon DECIMAL(11, 8) DEFAULT NULL,
    search_radius INTEGER DEFAULT 20
)
RETURNS TABLE (
    business_id UUID,
    service_id UUID,
    business_name TEXT,
    service_name TEXT,
    distance_km DECIMAL,
    relevance_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        s.id,
        b.name,
        s.name,
        CASE 
            WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
                public.calculate_distance(user_lat, user_lon, b.latitude, b.longitude)
            ELSE 0
        END as distance,
        (
            CASE WHEN b.name ILIKE '%' || search_query || '%' THEN 3 ELSE 0 END +
            CASE WHEN s.name ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END +
            CASE WHEN s.description ILIKE '%' || search_query || '%' THEN 2 ELSE 0 END +
            CASE WHEN array_to_string(b.services, ' ') ILIKE '%' || search_query || '%' THEN 1 ELSE 0 END
        )::DECIMAL as relevance
    FROM public.businesses b
    JOIN public.services s ON b.id = s.business_id
    WHERE 
        b.is_verified = true
        AND b.status = 'active'
        AND s.is_active = true
        AND (
            b.name ILIKE '%' || search_query || '%'
            OR s.name ILIKE '%' || search_query || '%'
            OR s.description ILIKE '%' || search_query || '%'
            OR array_to_string(b.services, ' ') ILIKE '%' || search_query || '%'
        )
        AND (
            user_lat IS NULL 
            OR user_lon IS NULL 
            OR public.calculate_distance(user_lat, user_lon, b.latitude, b.longitude) <= search_radius
        )
    ORDER BY relevance DESC, distance ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON DATABASE SCHEMA IS 'TownTap - Complete Local Business Platform Database Schema with Real-time capabilities, comprehensive business management, customer features, and advanced analytics. Includes Row Level Security, performance indexes, and utility functions for a scalable platform.';
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

-- Function to update business rating when review is added/updated
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.businesses 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM public.reviews 
            WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM public.reviews 
            WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
        )
    WHERE id = COALESCE(NEW.business_id, OLD.business_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for rating updates
CREATE TRIGGER update_business_rating_on_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

CREATE TRIGGER update_business_rating_on_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

CREATE TRIGGER update_business_rating_on_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert default business categories
INSERT INTO public.business_categories (name, icon, description) VALUES
('Restaurant', '🍽️', 'Food and dining establishments'),
('Grocery', '🛒', 'Grocery stores and supermarkets'),
('Pharmacy', '💊', 'Medical stores and pharmacies'),
('Electronics', '📱', 'Electronics and gadgets stores'),
('Clothing', '👕', 'Fashion and clothing stores'),
('Beauty & Spa', '💄', 'Beauty salons and spa services'),
('Automotive', '🚗', 'Car services and repair shops'),
('Education', '📚', 'Educational services and tutoring'),
('Fitness', '💪', 'Gyms and fitness centers'),
('Home Services', '🏠', 'Home repair and maintenance'),
('Pet Services', '🐕', 'Pet care and veterinary services'),
('Entertainment', '🎬', 'Entertainment and recreation')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'TownTap database schema created successfully!';
    RAISE NOTICE 'Tables created: %', (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name NOT LIKE 'pg_%'
    );
    RAISE NOTICE 'RLS policies enabled on all tables';
    RAISE NOTICE 'Real-time subscriptions configured';
    RAISE NOTICE 'Sample business categories inserted';
END $$;
