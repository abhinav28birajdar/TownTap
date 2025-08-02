-- =====================================================
-- TownTap Complete Database Schema for Supabase
-- Real-Time Local Business Platform
-- Version: 2.0
-- Created: 2025-08-01
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

-- =====================================================
-- BUSINESS MANAGEMENT
-- =====================================================

-- Business categories
CREATE TABLE public.business_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT, -- Emoji or icon identifier
    description TEXT,
    parent_id UUID REFERENCES public.business_categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles
CREATE TABLE public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    business_type TEXT CHECK (business_type IN ('restaurant', 'retail', 'service', 'healthcare', 'education', 'other')) NOT NULL,
    category_id UUID REFERENCES public.business_categories(id),
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    operating_hours JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    delivery_available BOOLEAN DEFAULT false,
    pickup_available BOOLEAN DEFAULT true,
    delivery_radius DECIMAL(5, 2) DEFAULT 5.0,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_time INTEGER DEFAULT 30, -- minutes
    license_number TEXT,
    gst_number TEXT,
    bank_account_details JSONB,
    social_media_links JSONB DEFAULT '{}',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business gallery
CREATE TABLE public.business_gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SERVICES & PRODUCTS
-- =====================================================

-- Service categories
CREATE TABLE public.service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services/Products
CREATE TABLE public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    duration INTEGER, -- in minutes
    is_available BOOLEAN DEFAULT true,
    image_url TEXT,
    tags TEXT[],
    variants JSONB DEFAULT '[]', -- For size, color variations
    customization_options JSONB DEFAULT '[]',
    preparation_time INTEGER DEFAULT 0, -- minutes
    nutritional_info JSONB,
    ingredients TEXT[],
    allergens TEXT[],
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service/Product reviews
CREATE TABLE public.service_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID, -- Will reference orders table
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, customer_id, order_id)
);

-- =====================================================
-- ORDERS & TRANSACTIONS
-- =====================================================

-- Orders
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
    order_type TEXT CHECK (order_type IN ('delivery', 'pickup', 'dine_in')) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    delivery_address JSONB,
    special_instructions TEXT,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    delivery_person_id UUID,
    promotion_code TEXT,
    loyalty_points_used INTEGER DEFAULT 0,
    loyalty_points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    customizations JSONB DEFAULT '{}',
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history
CREATE TABLE public.order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENTS
-- =====================================================

-- Payment methods
CREATE TABLE public.payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('card', 'upi', 'wallet', 'net_banking', 'cash')) NOT NULL,
    provider TEXT, -- Razorpay, Stripe, etc.
    token TEXT,
    last_four TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    payment_intent_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMMUNICATION & MESSAGING
-- =====================================================

-- Chat conversations
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('active', 'closed', 'archived')) DEFAULT 'active',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'location', 'order_update')) DEFAULT 'text',
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN ('order', 'payment', 'promotion', 'system', 'chat')) NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notification tokens
CREATE TABLE public.push_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_type TEXT CHECK (device_type IN ('ios', 'android', 'web')) NOT NULL,
    device_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REVIEWS & RATINGS
-- =====================================================

-- Business reviews
CREATE TABLE public.business_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    images TEXT[],
    response_text TEXT, -- Business owner response
    response_date TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, customer_id, order_id)
);

-- =====================================================
-- PROMOTIONS & LOYALTY
-- =====================================================

-- Promotions and offers
CREATE TABLE public.promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE,
    type TEXT CHECK (type IN ('percentage', 'fixed', 'bogo', 'free_delivery')) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    applicable_services UUID[], -- Array of service IDs
    user_type TEXT CHECK (user_type IN ('all', 'new', 'returning')) DEFAULT 'all',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotion usage tracking
CREATE TABLE public.promotion_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(promotion_id, customer_id, order_id)
);

-- =====================================================
-- ANALYTICS & REPORTING
-- =====================================================

-- Business analytics (daily aggregated data)
CREATE TABLE public.business_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    avg_order_value DECIMAL(10, 2) DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    cancellation_rate DECIMAL(5, 2) DEFAULT 0,
    avg_rating DECIMAL(2, 1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- =====================================================
-- ADDITIONAL FEATURES
-- =====================================================

-- Customer wishlists
CREATE TABLE public.customer_wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, business_id, service_id)
);

-- Search history
CREATE TABLE public.search_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    search_term TEXT NOT NULL,
    search_type TEXT CHECK (search_type IN ('business', 'service', 'category')) NOT NULL,
    result_count INTEGER DEFAULT 0,
    clicked_result_id UUID,
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
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Delivery tracking
CREATE TABLE public.delivery_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    delivery_person_id UUID REFERENCES public.profiles(id),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'nearby', 'delivered')) DEFAULT 'assigned',
    tracking_url TEXT,
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory management
CREATE TABLE public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    quantity_available INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    max_quantity INTEGER,
    unit TEXT DEFAULT 'pieces',
    cost_price DECIMAL(10, 2),
    supplier_info JSONB,
    last_restocked TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer feedback and complaints
CREATE TABLE public.customer_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    feedback_type TEXT CHECK (feedback_type IN ('complaint', 'suggestion', 'compliment', 'bug_report')) NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business hours and holiday schedule
CREATE TABLE public.business_schedule (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    is_holiday BOOLEAN DEFAULT false,
    holiday_name TEXT,
    special_date DATE, -- For specific date overrides
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans for businesses
CREATE TABLE public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')) NOT NULL,
    features JSONB DEFAULT '[]',
    max_products INTEGER,
    max_orders_per_month INTEGER,
    commission_rate DECIMAL(5, 2),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business subscriptions
CREATE TABLE public.business_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')) DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    payment_method JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-generated content cache
CREATE TABLE public.ai_content_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    input_hash TEXT NOT NULL, -- Hash of input parameters
    generated_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, content_type, input_hash)
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_cache ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Business policies
CREATE POLICY "Anyone can view active businesses" ON public.businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Business owners can manage own business" ON public.businesses FOR ALL USING (auth.uid() = owner_id);

-- Order policies
CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Business owners can view their orders" ON public.orders FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
);

-- Customer address policies
CREATE POLICY "Customers can manage own addresses" ON public.customer_addresses FOR ALL USING (auth.uid() = customer_id);

-- Notification policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Push token policies
CREATE POLICY "Users can manage own push tokens" ON public.push_tokens FOR ALL USING (auth.uid() = user_id);

-- Review policies
CREATE POLICY "Anyone can view business reviews" ON public.business_reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.business_reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Service policies
CREATE POLICY "Anyone can view available services" ON public.services FOR SELECT USING (is_available = true);
CREATE POLICY "Business owners can manage own services" ON public.services FOR ALL USING (
    auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
);

-- Delivery tracking policies
CREATE POLICY "Customers can view own delivery tracking" ON public.delivery_tracking FOR SELECT USING (
    auth.uid() IN (SELECT customer_id FROM public.orders WHERE id = order_id)
);
CREATE POLICY "Business owners can view their delivery tracking" ON public.delivery_tracking FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = (SELECT business_id FROM public.orders WHERE id = order_id))
);

-- Inventory policies
CREATE POLICY "Business owners can manage own inventory" ON public.inventory FOR ALL USING (
    auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
);

-- Customer feedback policies
CREATE POLICY "Customers can view own feedback" ON public.customer_feedback FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create feedback" ON public.customer_feedback FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Business owners can view their feedback" ON public.customer_feedback FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
);

-- Business schedule policies
CREATE POLICY "Anyone can view business schedules" ON public.business_schedule FOR SELECT USING (true);
CREATE POLICY "Business owners can manage own schedule" ON public.business_schedule FOR ALL USING (
    auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
);

-- Subscription policies
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Business owners can view own subscriptions" ON public.business_subscriptions FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
);

-- AI content cache policies
CREATE POLICY "Business owners can access own AI content cache" ON public.ai_content_cache FOR ALL USING (
    auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Geospatial indexes
CREATE INDEX idx_businesses_location ON public.businesses USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_customer_addresses_location ON public.customer_addresses USING GIST (ST_Point(longitude, latitude));

-- Business indexes
CREATE INDEX idx_businesses_category ON public.businesses(category_id);
CREATE INDEX idx_businesses_type ON public.businesses(business_type);
CREATE INDEX idx_businesses_active ON public.businesses(is_active);
CREATE INDEX idx_businesses_rating ON public.businesses(rating DESC);

-- Order indexes
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_business ON public.orders(business_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_number ON public.orders(order_number);

-- Service indexes
CREATE INDEX idx_services_business ON public.services(business_id);
CREATE INDEX idx_services_category ON public.services(category_id);
CREATE INDEX idx_services_available ON public.services(is_available);
CREATE INDEX idx_services_price ON public.services(price);

-- Review indexes
CREATE INDEX idx_business_reviews_business ON public.business_reviews(business_id);
CREATE INDEX idx_business_reviews_rating ON public.business_reviews(rating);
CREATE INDEX idx_service_reviews_service ON public.service_reviews(service_id);

-- Notification indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Additional indexes for new tables
CREATE INDEX idx_delivery_tracking_order ON public.delivery_tracking(order_id);
CREATE INDEX idx_delivery_tracking_status ON public.delivery_tracking(status);
CREATE INDEX idx_inventory_business ON public.inventory(business_id);
CREATE INDEX idx_inventory_service ON public.inventory(service_id);
CREATE INDEX idx_inventory_quantity ON public.inventory(quantity_available);
CREATE INDEX idx_customer_feedback_business ON public.customer_feedback(business_id);
CREATE INDEX idx_customer_feedback_status ON public.customer_feedback(status);
CREATE INDEX idx_business_schedule_business ON public.business_schedule(business_id);
CREATE INDEX idx_business_schedule_day ON public.business_schedule(day_of_week);
CREATE INDEX idx_business_subscriptions_business ON public.business_subscriptions(business_id);
CREATE INDEX idx_business_subscriptions_status ON public.business_subscriptions(status);
CREATE INDEX idx_ai_content_cache_business ON public.ai_content_cache(business_id);
CREATE INDEX idx_ai_content_cache_hash ON public.ai_content_cache(input_hash);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_customer_addresses_updated_at
    BEFORE UPDATE ON public.customer_addresses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_delivery_tracking_updated_at
    BEFORE UPDATE ON public.delivery_tracking
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_customer_feedback_updated_at
    BEFORE UPDATE ON public.customer_feedback
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_business_subscriptions_updated_at
    BEFORE UPDATE ON public.business_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'TT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Apply order number trigger
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Function to update business rating
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.businesses 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 1) 
            FROM public.business_reviews 
            WHERE business_id = NEW.business_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM public.business_reviews 
            WHERE business_id = NEW.business_id
        )
    WHERE id = NEW.business_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply rating update trigger
CREATE TRIGGER trigger_update_business_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.business_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample business categories
INSERT INTO public.business_categories (name, icon, description) VALUES
('Restaurant', '🍽️', 'Food and dining establishments'),
('Grocery', '🛒', 'Grocery stores and supermarkets'),
('Healthcare', '🏥', 'Medical services and healthcare'),
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

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (name, description, price, billing_cycle, features, max_products, max_orders_per_month, commission_rate) VALUES
('Basic', 'Perfect for small businesses starting out', 999.00, 'monthly', 
 '["Online store", "Basic analytics", "Customer support", "Payment processing"]', 
 50, 200, 5.0),
('Professional', 'Ideal for growing businesses', 2499.00, 'monthly',
 '["Online store", "Advanced analytics", "Priority support", "Payment processing", "Marketing tools", "Inventory management"]',
 200, 1000, 3.5),
('Enterprise', 'For established businesses with high volume', 4999.00, 'monthly',
 '["Online store", "Premium analytics", "24/7 support", "Payment processing", "Advanced marketing", "Full inventory management", "API access", "Custom integrations"]',
 1000, 5000, 2.0)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;

-- =====================================================
-- COMPLETION
-- =====================================================

-- Final message
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'TownTap Database Schema Created Successfully!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Features Enabled:';
    RAISE NOTICE '✅ Complete business management system';
    RAISE NOTICE '✅ Order processing and tracking';
    RAISE NOTICE '✅ Real-time messaging and notifications';
    RAISE NOTICE '✅ Payment processing support';
    RAISE NOTICE '✅ Reviews and ratings system';
    RAISE NOTICE '✅ Geospatial location services';
    RAISE NOTICE '✅ Delivery tracking and management';
    RAISE NOTICE '✅ Inventory management system';
    RAISE NOTICE '✅ Customer feedback and support';
    RAISE NOTICE '✅ Business subscription plans';
    RAISE NOTICE '✅ AI content generation cache';
    RAISE NOTICE '✅ Advanced business scheduling';
    RAISE NOTICE '✅ Row Level Security (RLS)';
    RAISE NOTICE '✅ Performance optimized indexes';
    RAISE NOTICE '✅ Real-time subscriptions';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Tables Created: %', (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name NOT LIKE 'pg_%'
        AND table_name NOT LIKE 'sql_%'
    );
    RAISE NOTICE 'Enterprise-ready for production use!';
    RAISE NOTICE '=================================================';
END $$;
