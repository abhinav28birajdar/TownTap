-- ==============================================
-- TownTap Database Schema - Comprehensive Setup
-- ==============================================
-- This schema implements a full-featured local business platform
-- with support for Type A/B/C/D business interactions, real-time features,
-- and comprehensive security through Row Level Security (RLS)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==============================================
-- ENUMS & CUSTOM TYPES
-- ==============================================

CREATE TYPE user_type AS ENUM ('customer', 'business', 'admin', 'staff');
CREATE TYPE business_interaction_type AS ENUM ('type_a', 'type_b', 'type_c', 'type_d');
CREATE TYPE business_status AS ENUM ('pending_approval', 'active', 'inactive', 'suspended');
CREATE TYPE payment_method AS ENUM ('CARD', 'NETBANKING', 'UPI_COLLECT', 'UPI_INTENT', 'WALLET', 'COD', 'CASH_ON_SITE');
CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded', 'authorized', 'captured');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'completed', 'cancelled_by_customer', 'cancelled_by_business', 'payment_failed', 'refunded', 'disputed');
CREATE TYPE service_request_status AS ENUM ('pending', 'accepted', 'rejected_by_business', 'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled_by_customer', 'cancelled_by_business', 'disputed');
CREATE TYPE inquiry_status AS ENUM ('new', 'reviewed', 'contacted_by_business', 'proposal_sent', 'closed_success', 'closed_fail', 'archived');
CREATE TYPE notification_type AS ENUM ('service_request_status', 'booking_confirmation', 'service_reminder', 'payment_status', 'service_provider_arrival', 'new_message', 'promo', 'system_alert', 'new_review_response', 'new_service_request', 'booking_cancelled', 'low_stock', 'payout_status', 'new_review', 'business_verification', 'business_analytics', 'area_demand');
CREATE TYPE staff_role AS ENUM ('manager', 'delivery_driver', 'service_technician', 'cashier');

-- ==============================================
-- CORE USER TABLES
-- ==============================================

-- User profiles (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    full_name TEXT,
    user_type user_type DEFAULT 'customer',
    profile_picture_url TEXT,
    current_location GEOGRAPHY(POINT, 4326), -- PostGIS for location
    fcm_token TEXT, -- For push notifications
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Business profiles
CREATE TABLE public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_image_url TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    location_geom GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS location
    service_area_geom GEOGRAPHY(POLYGON, 4326), -- Service area boundary
    service_radius_km DECIMAL(5,2), -- Alternative to polygon for circular service area
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    website_url TEXT,
    whatsapp_number TEXT,
    operating_hours JSONB NOT NULL DEFAULT '{}', -- {day: {open: "09:00", close: "18:00", is_closed: false}}
    delivery_radius_km DECIMAL(5,2),
    min_order_value DECIMAL(10,2),
    delivery_charge DECIMAL(10,2),
    business_category_type business_interaction_type NOT NULL,
    specialized_categories TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_approved BOOLEAN DEFAULT FALSE,
    status business_status DEFAULT 'pending_approval',
    realtime_status TEXT DEFAULT 'offline', -- 'available', 'busy', 'offline'
    avg_rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    verification_documents JSONB DEFAULT '{}',
    bank_account_details JSONB DEFAULT '{}', -- Encrypted bank details
    commission_rate DECIMAL(4,2) DEFAULT 5.00, -- Platform commission percentage
    featured_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories for business classification
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    name_hindi TEXT,
    name_marathi TEXT,
    description TEXT,
    icon_url TEXT,
    banner_url TEXT,
    interaction_type business_interaction_type NOT NULL,
    parent_id UUID REFERENCES public.categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TYPE A: PRODUCTS & ORDERING SYSTEM
-- ==============================================

-- Products for Type A businesses
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id),
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    cost_price DECIMAL(10,2), -- For business analytics
    images TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    unit TEXT DEFAULT 'piece',
    weight_grams DECIMAL(8,2),
    dimensions_cm JSONB, -- {length, width, height}
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    nutritional_info JSONB, -- For food items
    expiry_date DATE, -- For perishable items
    sku TEXT UNIQUE,
    barcode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders for Type A businesses
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL, -- Array of {product_id, quantity, price, name}
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_charges DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    platform_commission DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    payment_transaction_id TEXT,
    delivery_address_geom GEOGRAPHY(POINT, 4326),
    delivery_address JSONB NOT NULL, -- Full address details
    delivery_instructions TEXT,
    delivery_slot TIMESTAMP WITH TIME ZONE,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    delivery_person_id UUID REFERENCES public.profiles(id),
    special_instructions TEXT,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history for tracking
CREATE TABLE public.order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    notes TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TYPE B: SERVICES & BOOKING SYSTEM
-- ==============================================

-- Services for Type B businesses
CREATE TABLE public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id),
    base_price DECIMAL(10,2) NOT NULL,
    price_type TEXT DEFAULT 'fixed', -- 'fixed', 'hourly', 'per_unit'
    estimated_duration_minutes INTEGER,
    images TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT TRUE,
    requires_site_visit BOOLEAN DEFAULT FALSE,
    advance_booking_hours INTEGER DEFAULT 2,
    cancellation_policy TEXT,
    service_area_km DECIMAL(5,2),
    equipment_required TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service requests for Type B businesses
CREATE TABLE public.service_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id),
    request_number TEXT UNIQUE NOT NULL,
    problem_description TEXT NOT NULL,
    service_address_geom GEOGRAPHY(POINT, 4326) NOT NULL,
    service_address JSONB NOT NULL,
    preferred_datetime TIMESTAMP WITH TIME ZONE,
    urgency_level TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'emergency'
    attachments_urls TEXT[] DEFAULT '{}', -- Photos/videos of the problem
    quoted_price DECIMAL(10,2),
    final_charge DECIMAL(10,2),
    status service_request_status DEFAULT 'pending',
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    payment_transaction_id TEXT,
    scheduled_datetime TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    service_person_id UUID REFERENCES public.profiles(id),
    is_live_tracking_active BOOLEAN DEFAULT FALSE,
    work_summary TEXT,
    before_photos TEXT[] DEFAULT '{}',
    after_photos TEXT[] DEFAULT '{}',
    customer_signature_url TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TYPE C: INQUIRIES & CONSULTATION SYSTEM
-- ==============================================

-- Inquiries for Type C businesses
CREATE TABLE public.inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    inquiry_number TEXT UNIQUE NOT NULL,
    inquiry_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    details TEXT NOT NULL,
    budget_range JSONB, -- {min: 0, max: 0, currency: 'INR'}
    timeline TEXT,
    location_preference TEXT,
    attachments_urls TEXT[] DEFAULT '{}',
    status inquiry_status DEFAULT 'new',
    priority_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    assigned_to UUID REFERENCES public.profiles(id),
    proposal_sent_at TIMESTAMP WITH TIME ZONE,
    proposal_details JSONB,
    meeting_scheduled_at TIMESTAMP WITH TIME ZONE,
    followup_required BOOLEAN DEFAULT TRUE,
    conversion_value DECIMAL(12,2), -- If converted to actual business
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TYPE D: RENTAL SYSTEM
-- ==============================================

-- Rental items for Type D businesses
CREATE TABLE public.rental_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id),
    rental_rate DECIMAL(10,2) NOT NULL,
    rate_unit TEXT DEFAULT 'day', -- 'hour', 'day', 'week', 'month'
    deposit_amount DECIMAL(10,2) NOT NULL,
    late_fee_per_day DECIMAL(10,2) DEFAULT 0,
    damage_charges JSONB DEFAULT '{}', -- Predefined damage charge structure
    images TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 1,
    dimensions_info TEXT,
    weight_info TEXT,
    condition_notes TEXT,
    maintenance_schedule JSONB,
    is_available BOOLEAN DEFAULT TRUE,
    location_notes TEXT, -- Where item is stored/picked up
    delivery_available BOOLEAN DEFAULT FALSE,
    pickup_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rental bookings for Type D businesses
CREATE TABLE public.rentals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.rental_items(id) ON DELETE CASCADE,
    rental_number TEXT UNIQUE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    rental_duration_days INTEGER NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_rental_cost DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    late_fees DECIMAL(10,2) DEFAULT 0,
    damage_charges DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_refunded DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'booked', -- 'booked', 'picked_up', 'in_use', 'returned', 'overdue', 'cancelled'
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    pickup_address JSONB,
    delivery_address JSONB,
    condition_before_photos TEXT[] DEFAULT '{}',
    condition_after_photos TEXT[] DEFAULT '{}',
    damage_report TEXT,
    customer_signature_pickup_url TEXT,
    customer_signature_return_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- COMMUNICATION SYSTEM
-- ==============================================

-- Chat conversations
CREATE TABLE public.chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    related_id UUID NOT NULL, -- order_id, service_request_id, inquiry_id, rental_id
    related_type TEXT NOT NULL, -- 'order', 'service_request', 'inquiry', 'rental'
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'voice', 'location', 'payment_request'
    media_url TEXT,
    metadata JSONB DEFAULT '{}', -- For payment requests, location data, etc.
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    reply_to_message_id UUID REFERENCES public.messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- REAL-TIME LOCATION TRACKING
-- ==============================================

-- Live locations for service providers (Type B primarily)
CREATE TABLE public.live_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    service_person_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    location_geom GEOGRAPHY(POINT, 4326) NOT NULL,
    accuracy_meters DECIMAL(6,2),
    heading DECIMAL(5,2), -- Direction in degrees
    speed_kmh DECIMAL(5,2),
    battery_level INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- NOTIFICATION SYSTEM
-- ==============================================

-- Notification preferences
CREATE TABLE public.notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    preferences JSONB NOT NULL DEFAULT '{
        "service_updates": true,
        "chat_messages": true,
        "promotional": false,
        "payments": true,
        "reminders": true,
        "email_notifications": true,
        "push_notifications": true,
        "sms_notifications": false,
        "whatsapp_notifications": false,
        "do_not_disturb": {"enabled": false}
    }',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional data like order_id, etc.
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- REVIEW & RATING SYSTEM
-- ==============================================

-- Reviews
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    related_transaction_id UUID NOT NULL, -- order_id, service_request_id, etc.
    related_type TEXT NOT NULL, -- 'order', 'service_request', 'inquiry', 'rental'
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    media_urls TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE, -- Only verified purchases can review
    is_hidden BOOLEAN DEFAULT FALSE,
    business_response TEXT,
    business_responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- FINANCIAL SYSTEM
-- ==============================================

-- Transactions
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    related_id UUID NOT NULL, -- order_id, service_request_id, etc.
    related_type TEXT NOT NULL,
    customer_id UUID REFERENCES public.profiles(id),
    business_id UUID REFERENCES public.businesses(id),
    amount DECIMAL(12,2) NOT NULL,
    platform_commission DECIMAL(12,2) NOT NULL,
    business_earnings DECIMAL(12,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_gateway_transaction_id TEXT,
    payment_gateway_response JSONB DEFAULT '{}',
    gateway_fees DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts to businesses
CREATE TABLE public.payouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    transaction_ids UUID[] DEFAULT '{}', -- Array of transaction IDs included
    payout_method TEXT DEFAULT 'bank_transfer',
    bank_account_details JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    gateway_payout_id TEXT,
    gateway_response JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ADMIN & ANALYTICS
-- ==============================================

-- Admin audit log
CREATE TABLE public.admin_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'business', 'user', 'transaction', etc.
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform analytics
CREATE TABLE public.platform_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    dimensions JSONB DEFAULT '{}', -- Additional breakdown dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, metric_name, dimensions)
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Geographic indexes
CREATE INDEX idx_businesses_location ON businesses USING GIST (location_geom);
CREATE INDEX idx_businesses_service_area ON businesses USING GIST (service_area_geom);
CREATE INDEX idx_orders_delivery_location ON orders USING GIST (delivery_address_geom);
CREATE INDEX idx_service_requests_location ON service_requests USING GIST (service_address_geom);
CREATE INDEX idx_live_locations_geom ON live_locations USING GIST (location_geom);
CREATE INDEX idx_profiles_location ON profiles USING GIST (current_location);

-- Performance indexes
CREATE INDEX idx_businesses_category_type ON businesses (business_category_type);
CREATE INDEX idx_businesses_status ON businesses (status, is_approved);
CREATE INDEX idx_orders_customer_business ON orders (customer_id, business_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_service_requests_status ON service_requests (status);
CREATE INDEX idx_products_business_available ON products (business_id, is_available);
CREATE INDEX idx_messages_chat_created ON messages (chat_id, created_at DESC);
CREATE INDEX idx_notifications_recipient_read ON notifications (recipient_id, is_read);
CREATE INDEX idx_reviews_business_rating ON reviews (business_id, rating);

-- Full-text search indexes
CREATE INDEX idx_businesses_search ON businesses USING GIN (
    to_tsvector('english', business_name || ' ' || COALESCE(description, ''))
);
CREATE INDEX idx_products_search ON products USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- ==============================================
-- FUNCTIONS & TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    ) / 1000;
END;
$$ language 'plpgsql';

-- Function to update business ratings
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    total_reviews INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(*) 
    INTO avg_rating, total_reviews
    FROM reviews 
    WHERE business_id = COALESCE(NEW.business_id, OLD.business_id) 
    AND is_hidden = FALSE;
    
    UPDATE businesses 
    SET avg_rating = COALESCE(avg_rating, 0),
        total_reviews = total_reviews,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.business_id, OLD.business_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Function to automatically create profile after auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to clean old live locations
CREATE OR REPLACE FUNCTION cleanup_old_live_locations()
RETURNS void AS $$
BEGIN
    DELETE FROM live_locations 
    WHERE created_at < NOW() - INTERVAL '2 hours' 
    OR is_active = FALSE;
END;
$$ language 'plpgsql';

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at 
    BEFORE UPDATE ON businesses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at 
    BEFORE UPDATE ON service_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at 
    BEFORE UPDATE ON inquiries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at 
    BEFORE UPDATE ON rentals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_items_updated_at 
    BEFORE UPDATE ON rental_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for business rating updates
CREATE TRIGGER update_business_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS POLICIES - PROFILES
-- ==============================================

CREATE POLICY "Users can view own profile" ON profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ==============================================
-- RLS POLICIES - BUSINESSES
-- ==============================================

CREATE POLICY "Business owners can manage their business" ON businesses
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Everyone can view approved businesses" ON businesses
    FOR SELECT USING (status = 'active' AND is_approved = TRUE);

CREATE POLICY "Admins can manage all businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ==============================================
-- RLS POLICIES - PRODUCTS & SERVICES
-- ==============================================

CREATE POLICY "Business owners can manage their products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Everyone can view available products" ON products
    FOR SELECT USING (
        is_available = TRUE AND EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND status = 'active' AND is_approved = TRUE
        )
    );

CREATE POLICY "Business owners can manage their services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Everyone can view available services" ON services
    FOR SELECT USING (
        is_available = TRUE AND EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND status = 'active' AND is_approved = TRUE
        )
    );

-- ==============================================
-- RLS POLICIES - ORDERS & TRANSACTIONS
-- ==============================================

CREATE POLICY "Customers can view their orders" ON orders
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Business owners can view their orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can update their orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

-- Similar policies for service_requests, inquiries, rentals...
CREATE POLICY "Customers can manage their service requests" ON service_requests
    FOR ALL USING (auth.uid() = customer_id);

CREATE POLICY "Business owners can manage their service requests" ON service_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

-- ==============================================
-- RLS POLICIES - COMMUNICATION
-- ==============================================

CREATE POLICY "Users can view their chats" ON chats
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages in their chats" ON messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE id = chat_id AND (
                customer_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM businesses 
                    WHERE id = chats.business_id AND owner_id = auth.uid()
                )
            )
        )
    );

-- ==============================================
-- RLS POLICIES - NOTIFICATIONS
-- ==============================================

CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can manage their notification preferences" ON notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- RLS POLICIES - REVIEWS
-- ==============================================

CREATE POLICY "Everyone can view reviews" ON reviews
    FOR SELECT USING (is_hidden = FALSE);

CREATE POLICY "Customers can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Business owners can respond to reviews" ON reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

-- ==============================================
-- RLS POLICIES - LIVE LOCATIONS
-- ==============================================

CREATE POLICY "Service providers can update their location" ON live_locations
    FOR ALL USING (auth.uid() = service_person_id);

CREATE POLICY "Customers can view tracking for their requests" ON live_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_requests 
            WHERE id = request_id AND customer_id = auth.uid()
        )
    );

-- ==============================================
-- RLS POLICIES - CATEGORIES (PUBLIC READ)
-- ==============================================

CREATE POLICY "Everyone can view active categories" ON categories
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ==============================================
-- ADMIN-ONLY POLICIES
-- ==============================================

CREATE POLICY "Admins only" ON admin_audit_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Admins only" ON platform_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ==============================================
-- INITIAL DATA SEEDING
-- ==============================================

-- Insert default categories
INSERT INTO categories (name, name_hindi, description, interaction_type, icon_url, sort_order) VALUES
-- Type A Categories
('Grocery & Food', 'किराना और भोजन', 'Fresh groceries, snacks, and daily essentials', 'type_a', '🛒', 1),
('Pharmacy', 'दवाखाना', 'Medicines, health products, and medical supplies', 'type_a', '💊', 2),
('Bakery & Sweets', 'बेकरी और मिठाई', 'Fresh baked goods, cakes, and traditional sweets', 'type_a', '🧁', 3),
('Books & Stationery', 'किताबें और स्टेशनरी', 'Books, office supplies, and educational materials', 'type_a', '📚', 4),

-- Type B Categories  
('Home Repair', 'घर की मरम्मत', 'Plumbing, electrical, and general home maintenance', 'type_b', '🔧', 10),
('Beauty & Wellness', 'सुंदरता और कल्याण', 'Salon, spa, massage, and wellness services', 'type_b', '💆‍♀️', 11),
('Cleaning Services', 'सफाई सेवाएं', 'House cleaning, deep cleaning, and sanitization', 'type_b', '🧽', 12),
('Tutoring & Education', 'ट्यूशन और शिक्षा', 'Private tutoring, coaching, and skill development', 'type_b', '👨‍🏫', 13),
('Vehicle Services', 'वाहन सेवाएं', 'Car/bike repair, maintenance, and servicing', 'type_b', '🚗', 14),

-- Type C Categories
('Real Estate', 'रियल एस्टेट', 'Property buying, selling, and rental consultations', 'type_c', '🏠', 20),
('Travel & Tourism', 'यात्रा और पर्यटन', 'Trip planning, bookings, and travel consultation', 'type_c', '✈️', 21),
('Event Planning', 'कार्यक्रम योजना', 'Wedding planning, party organization, and event management', 'type_c', '🎉', 22),
('Legal Services', 'कानूनी सेवाएं', 'Legal advice, documentation, and consultation', 'type_c', '⚖️', 23),
('Financial Services', 'वित्तीय सेवाएं', 'Insurance, loans, and financial planning', 'type_c', '💰', 24),

-- Type D Categories
('Costume & Clothing', 'वेशभूषा और कपड़े', 'Wedding wear, costumes, and formal clothing rentals', 'type_d', '👗', 30),
('Equipment Rental', 'उपकरण किराया', 'Construction tools, party equipment, and machinery', 'type_d', '🛠️', 31),
('Vehicle Rental', 'वाहन किराया', 'Bikes, cars, and commercial vehicle rentals', 'type_d', '🚲', 32),
('Event Equipment', 'कार्यक्रम उपकरण', 'Sound systems, decorations, and event supplies', 'type_d', '🎵', 33);

-- ==============================================
-- FINAL SETUP NOTES
-- ==============================================

-- This schema provides:
-- 1. Complete Type A/B/C/D business support
-- 2. Real-time capabilities with PostGIS
-- 3. Comprehensive security through RLS
-- 4. Scalable architecture for growth
-- 5. Full-featured communication system
-- 6. Advanced analytics and reporting
-- 7. Multi-language support foundation
-- 8. Payment and financial management
-- 9. Review and rating system
-- 10. Live location tracking for services

-- Next steps after running this schema:
-- 1. Set up Supabase Edge Functions for business logic
-- 2. Configure Supabase Storage buckets with RLS
-- 3. Set up real-time subscriptions
-- 4. Configure authentication providers
-- 5. Set up payment gateway integrations
-- 6. Configure push notification services

COMMIT;