-- Enhanced TownTap Database Schema - Ultimate Complete Implementation
-- Complete PostgreSQL + PostGIS schema for the TownTap hyperlocal marketplace

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ========================================
-- Core Tables
-- ========================================

-- 1. public.profiles table: Unified user profiles for customer, business, admin, staff
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    email text UNIQUE NOT NULL,
    phone_number text UNIQUE,
    user_type text NOT NULL CHECK (user_type IN ('customer', 'business', 'admin', 'staff')),
    fcm_token text,
    locale text DEFAULT 'en' NOT NULL,
    profile_picture_url text,
    wallet_balance numeric DEFAULT 0.0 NOT NULL,
    loyalty_points numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for profiles
CREATE UNIQUE INDEX idx_profiles_email ON public.profiles (email);
CREATE UNIQUE INDEX idx_profiles_phone_number ON public.profiles (phone_number) WHERE phone_number IS NOT NULL;

-- 2. public.businesses table: Detailed business profiles
CREATE TABLE public.businesses (
    id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    business_name text UNIQUE NOT NULL,
    logo_url text,
    banner_url text,
    description text,
    address_line1 text,
    address_line2 text,
    city text NOT NULL,
    state text,
    zip_code text,
    latitude double precision,
    longitude double precision,
    geojson_point geometry(Point, 4326),
    contact_phone text,
    operating_hours jsonb DEFAULT '{}'::jsonb NOT NULL,
    delivery_radius_km numeric,
    service_area_polygon geometry(Polygon, 4326),
    min_order_value numeric,
    delivery_charge numeric DEFAULT 0.0 NOT NULL,
    business_type text NOT NULL CHECK (business_type IN ('type_a', 'type_b', 'type_c')),
    specialized_categories text[] DEFAULT ARRAY[]::text[] NOT NULL,
    is_approved boolean DEFAULT FALSE NOT NULL,
    status text DEFAULT 'pending_approval' NOT NULL CHECK (status IN ('active', 'inactive', 'suspended', 'pending_approval')),
    avg_rating numeric DEFAULT 0.0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    bank_account_info_encrypted text,
    payout_enabled boolean DEFAULT FALSE NOT NULL,
    gstin text,
    business_license_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for businesses
CREATE INDEX idx_businesses_geojson_point ON public.businesses USING GIST (geojson_point);
CREATE INDEX idx_businesses_status_approved ON public.businesses (is_approved, status);
CREATE INDEX idx_businesses_name ON public.businesses (business_name);

-- 3. public.categories table: Global categories
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    icon_url text,
    description text,
    interaction_type text NOT NULL CHECK (interaction_type IN ('type_a', 'type_b', 'type_c')),
    is_active boolean DEFAULT TRUE NOT NULL,
    parent_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent_id ON public.categories (parent_category_id);

-- 4. public.products table: Items for Type A businesses
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    image_urls text[],
    price numeric NOT NULL,
    discount_price numeric,
    stock_quantity integer,
    unit text NOT NULL,
    is_available boolean DEFAULT TRUE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    variant_options jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_products_business_id ON public.products (business_id);
CREATE INDEX idx_products_category_id ON public.products (category_id);
CREATE INDEX idx_products_available_stock ON public.products (is_available, stock_quantity);

-- 5. public.services table: Services for Type B businesses
CREATE TABLE public.services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    image_urls text[],
    base_price numeric,
    estimated_time_mins integer,
    is_available boolean DEFAULT TRUE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    pricing_model text NOT NULL CHECK (pricing_model IN ('fixed', 'per_hour', 'per_visit_callout_fee', 'quote_required', 'variable_quote')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_services_business_id ON public.services (business_id);
CREATE INDEX idx_services_category_id ON public.services (category_id);

-- ========================================
-- Transaction Tables
-- ========================================

-- 6. public.payments table: Central payment records
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid,
    service_request_id uuid,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    currency text DEFAULT 'INR' NOT NULL,
    provider text NOT NULL,
    method text NOT NULL CHECK (method IN ('CARD', 'NETBANKING', 'UPI_COLLECT', 'UPI_INTENT', 'WALLET', 'COD_COLLECTED', 'ADMIN_TOPUP', 'LOYALTY_REDEMPTION', 'CASH_ON_SITE')),
    status text NOT NULL CHECK (status IN ('pending', 'successful', 'failed', 'refunded', 'authorized', 'captured')),
    gateway_reference_id text UNIQUE,
    gateway_response_code text,
    webhook_payload jsonb,
    error_details jsonb,
    transaction_type text NOT NULL CHECK (transaction_type IN ('order_payment', 'service_payment', 'wallet_topup', 'payout_settlement', 'refund_payout')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_payments_user_id ON public.payments (user_id);
CREATE INDEX idx_payments_order_id ON public.payments (order_id);
CREATE INDEX idx_payments_gateway_id ON public.payments (gateway_reference_id);

-- 7. public.orders table: Product orders
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    total_amount numeric NOT NULL,
    delivery_charge numeric DEFAULT 0.0 NOT NULL,
    platform_commission_amount numeric DEFAULT 0.0 NOT NULL,
    order_status text DEFAULT 'pending' NOT NULL CHECK (order_status IN ('pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'completed', 'cancelled_by_customer', 'cancelled_by_business', 'payment_failed', 'refunded', 'disputed', 'pickup_confirmed')),
    payment_status text DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'authorized', 'captured')),
    payment_method text NOT NULL CHECK (payment_method IN ('CARD', 'NETBANKING', 'UPI_COLLECT', 'UPI_INTENT', 'WALLET', 'COD')),
    delivery_option text NOT NULL CHECK (delivery_option IN ('delivery', 'pickup', 'dine_in')),
    delivery_address jsonb NOT NULL,
    customer_notes text,
    pickup_time_slot text,
    delivery_eta timestamp with time zone,
    assigned_staff_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    current_staff_location geometry(Point, 4326),
    payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX idx_orders_business_id ON public.orders (business_id);
CREATE INDEX idx_orders_status ON public.orders (order_status);
CREATE INDEX idx_orders_payment_status ON public.orders (payment_status);

-- Add foreign key constraint for payments.order_id after orders table is created
ALTER TABLE public.payments ADD CONSTRAINT fk_payments_order_id FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- 8. public.order_items table: Order line items
CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    product_details jsonb NOT NULL,
    quantity integer NOT NULL,
    price_at_order numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items (product_id);

-- 9. public.service_requests table: Service bookings
CREATE TABLE public.service_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
    service_details_snapshot jsonb NOT NULL,
    problem_description text,
    photos_urls text[],
    videos_urls text[],
    service_address jsonb NOT NULL,
    latitude double precision,
    longitude double precision,
    geojson_point geometry(Point, 4326),
    preferred_date date NOT NULL,
    preferred_time_slot text,
    request_status text DEFAULT 'pending' NOT NULL CHECK (request_status IN ('pending', 'accepted', 'rejected_by_business', 'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled_by_customer', 'cancelled_by_business', 'disputed')),
    quoted_price numeric,
    actual_charge numeric,
    assigned_staff_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    payment_status text DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'authorized', 'captured')),
    payment_method text CHECK (payment_method IN ('CARD', 'NETBANKING', 'UPI_COLLECT', 'UPI_INTENT', 'WALLET', 'CASH_ON_SITE')),
    payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_service_requests_customer_id ON public.service_requests (customer_id);
CREATE INDEX idx_service_requests_business_id ON public.service_requests (business_id);
CREATE INDEX idx_service_requests_status ON public.service_requests (request_status);
CREATE INDEX idx_service_requests_geojson_point ON public.service_requests USING GIST (geojson_point);

-- Add foreign key constraint for payments.service_request_id
ALTER TABLE public.payments ADD CONSTRAINT fk_payments_service_request_id FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON DELETE SET NULL;

-- 10. public.inquiries table: Type C inquiries
CREATE TABLE public.inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    inquiry_type text NOT NULL,
    details text,
    attachments_urls text[],
    budget_range text,
    preferred_contact_method text NOT NULL CHECK (preferred_contact_method IN ('Phone Call', 'Email', 'In-App Chat')),
    preferred_contact_time text,
    inquiry_status text DEFAULT 'new' NOT NULL CHECK (inquiry_status IN ('new', 'reviewed', 'contacted_by_business', 'proposal_sent', 'closed_success', 'closed_fail', 'archived')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_inquiries_customer_id ON public.inquiries (customer_id);
CREATE INDEX idx_inquiries_business_id ON public.inquiries (business_id);
CREATE INDEX idx_inquiries_status ON public.inquiries (inquiry_status);

-- ========================================
-- Supporting Tables
-- ========================================

-- 11. public.wallet_transactions table: Wallet transaction history
CREATE TABLE public.wallet_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    amount numeric NOT NULL,
    description text,
    related_entity_type text CHECK (related_entity_type IN ('order', 'deposit', 'refund', 'service_request', 'loyalty_redemption')),
    related_entity_id uuid,
    payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions (user_id);
CREATE INDEX idx_wallet_transactions_entity_id ON public.wallet_transactions (related_entity_id);

-- 12. public.reviews table: Business reviews
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    service_request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    media_urls text[],
    is_approved boolean DEFAULT FALSE NOT NULL,
    sentiment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_reviews_business_id ON public.reviews (business_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews (customer_id);
CREATE INDEX idx_reviews_rating_business_id ON public.reviews (business_id, rating);

-- 13. public.notifications table: Push notifications
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    notification_type text NOT NULL CHECK (notification_type IN ('order_status', 'new_message', 'promo', 'system_alert', 'low_stock', 'payout_status', 'new_review', 'loyalty_update', 'referral_bonus')),
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    is_read boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_recipient_id ON public.notifications (recipient_profile_id);
CREATE INDEX idx_notifications_read_status ON public.notifications (recipient_profile_id, is_read);

-- 14. public.saved_addresses table: Customer saved addresses
CREATE TABLE public.saved_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    label text NOT NULL CHECK (label IN ('Home', 'Work', 'Other')),
    full_address text NOT NULL,
    address_line1 text,
    address_line2 text,
    city text NOT NULL,
    state text,
    zip_code text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    is_default boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_saved_addresses_profile_id_label ON public.saved_addresses (profile_id, label);
CREATE INDEX idx_saved_addresses_profile_id ON public.saved_addresses (profile_id);

-- 15. public.payment_methods table: Stored payment methods
CREATE TABLE public.payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider text NOT NULL CHECK (provider IN ('RAZORPAY', 'STRIPE')),
    card_type text,
    last4 text,
    expiry_month text,
    expiry_year text,
    card_fingerprint text,
    payment_token text UNIQUE,
    is_default boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_payment_methods_profile_id_token ON public.payment_methods (profile_id, payment_token);

-- ========================================
-- AI & Analytics Tables
-- ========================================

-- 16. public.ai_prompts_history table: AI interaction history
CREATE TABLE public.ai_prompts_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    feature_type text NOT NULL CHECK (feature_type IN ('content_gen', 'customer_ai', 'insights_gen', 'interaction_suggest')),
    input_prompt text NOT NULL,
    ai_response text,
    meta_data jsonb,
    cost numeric DEFAULT 0.0 NOT NULL,
    language text DEFAULT 'en' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_ai_prompts_history_profile_id ON public.ai_prompts_history (profile_id);
CREATE INDEX idx_ai_prompts_history_feature_type ON public.ai_prompts_history (feature_type);

-- 17. public.business_analytics_metrics table: Business analytics
CREATE TABLE public.business_analytics_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    date_period date NOT NULL,
    period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    total_revenue numeric DEFAULT 0.0 NOT NULL,
    total_orders_count integer DEFAULT 0 NOT NULL,
    total_service_requests_count integer DEFAULT 0 NOT NULL,
    new_customers_count integer DEFAULT 0 NOT NULL,
    average_order_value numeric DEFAULT 0.0 NOT NULL,
    avg_customer_rating numeric DEFAULT 0.0 NOT NULL,
    cancellation_rate numeric DEFAULT 0.0 NOT NULL,
    top_products_json jsonb,
    top_services_json jsonb,
    hourly_demand_profile jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_business_metrics_unique_period ON public.business_analytics_metrics (business_id, date_period, period_type);
CREATE INDEX idx_business_metrics_business_id_date ON public.business_analytics_metrics (business_id, date_period DESC);

-- 18. public.ai_content_library table: AI generated content
CREATE TABLE public.ai_content_library (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    content_type text NOT NULL CHECK (content_type IN ('PROMOTIONAL_CAPTION', 'OFFER_HEADLINE', 'PRODUCT_DESCRIPTION')),
    platform text NOT NULL,
    tone text NOT NULL,
    language text NOT NULL,
    generated_text text NOT NULL,
    notes text,
    is_favorite boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_ai_content_library_business_id ON public.ai_content_library (business_id);
CREATE INDEX idx_ai_content_library_favorite ON public.ai_content_library (business_id, is_favorite DESC);

-- ========================================
-- Loyalty & Staff Tables
-- ========================================

-- 19. public.customer_loyalty table: Business-specific loyalty
CREATE TABLE public.customer_loyalty (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    points numeric DEFAULT 0.0 NOT NULL,
    last_activity timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_customer_loyalty_unique ON public.customer_loyalty (customer_id, business_id);
CREATE INDEX idx_customer_loyalty_customer_id ON public.customer_loyalty (customer_id);
CREATE INDEX idx_customer_loyalty_business_id ON public.customer_loyalty (business_id);

-- 20. public.coupons table: Business promotions
CREATE TABLE public.coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    code text UNIQUE NOT NULL,
    type text NOT NULL CHECK (type IN ('percentage_discount', 'flat_discount')),
    value numeric NOT NULL,
    min_order_value numeric,
    max_discount_amount numeric,
    usage_limit integer,
    uses_count integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT TRUE NOT NULL,
    applies_to_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_coupons_business_id_code ON public.coupons (business_id, code);
CREATE INDEX idx_coupons_expiration ON public.coupons (expires_at);

-- 21. public.staff_members table: Business staff
CREATE TABLE public.staff_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    roles text[] DEFAULT ARRAY[]::text[] NOT NULL,
    is_active boolean DEFAULT TRUE NOT NULL,
    hourly_rate numeric,
    current_location geometry(Point, 4326),
    status text DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'on_task', 'on_break')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_staff_members_unique_business_profile ON public.staff_members (profile_id, business_id);

-- 22. public.payouts table: Business payouts
CREATE TABLE public.payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'processing', 'successful', 'failed', 'cancelled')),
    start_period timestamp with time zone NOT NULL,
    end_period timestamp with time zone NOT NULL,
    total_commission_deducted numeric DEFAULT 0.0 NOT NULL,
    transaction_fees_deducted numeric DEFAULT 0.0 NOT NULL,
    razorpay_payout_id text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_payouts_business_id ON public.payouts (business_id);
CREATE INDEX idx_payouts_status ON public.payouts (status);

-- ========================================
-- Triggers & Functions
-- ========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach triggers to all tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_saved_addresses_updated_at BEFORE UPDATE ON public.saved_addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_business_analytics_metrics_updated_at BEFORE UPDATE ON public.business_analytics_metrics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_content_library_updated_at BEFORE UPDATE ON public.ai_content_library FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customer_loyalty_updated_at BEFORE UPDATE ON public.customer_loyalty FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to update business geojson_point from lat/lng
CREATE OR REPLACE FUNCTION update_business_geojson_point()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geojson_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_geojson_point_trigger 
    BEFORE INSERT OR UPDATE ON public.businesses 
    FOR EACH ROW EXECUTE PROCEDURE update_business_geojson_point();

-- Function to update service request geojson_point from lat/lng
CREATE OR REPLACE FUNCTION update_service_request_geojson_point()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geojson_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_request_geojson_point_trigger 
    BEFORE INSERT OR UPDATE ON public.service_requests 
    FOR EACH ROW EXECUTE PROCEDURE update_service_request_geojson_point();

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for profiles (users can see their own profile)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Business profiles are public for discovery
CREATE POLICY "Anyone can view approved businesses" ON public.businesses FOR SELECT USING (is_approved = true AND status = 'active');
CREATE POLICY "Business owners can manage their business" ON public.businesses FOR ALL USING (auth.uid() = id);

-- Categories are public
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);

-- Products are visible for approved businesses
CREATE POLICY "Anyone can view available products" ON public.products 
FOR SELECT USING (
    is_available = true AND 
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND is_approved = true AND status = 'active'
    )
);
CREATE POLICY "Business owners can manage their products" ON public.products 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND auth.uid() = businesses.id
    )
);

-- Services are visible for approved businesses
CREATE POLICY "Anyone can view available services" ON public.services 
FOR SELECT USING (
    is_available = true AND 
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND is_approved = true AND status = 'active'
    )
);
CREATE POLICY "Business owners can manage their services" ON public.services 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND auth.uid() = businesses.id
    )
);

-- Orders: customers can see their orders, businesses can see orders for their business
CREATE POLICY "Customers can view their orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Businesses can view their orders" ON public.orders FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Businesses can update their orders" ON public.orders FOR UPDATE USING (auth.uid() = business_id);

-- Order items follow order permissions
CREATE POLICY "Users can view order items for accessible orders" ON public.order_items 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = order_id AND (auth.uid() = customer_id OR auth.uid() = business_id)
    )
);

-- Service requests: similar to orders
CREATE POLICY "Customers can view their service requests" ON public.service_requests FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Businesses can view their service requests" ON public.service_requests FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Customers can create service requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Businesses can update their service requests" ON public.service_requests FOR UPDATE USING (auth.uid() = business_id);

-- Inquiries: similar pattern
CREATE POLICY "Customers can view their inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Businesses can view their inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Customers can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Businesses can update their inquiries" ON public.inquiries FOR UPDATE USING (auth.uid() = business_id);

-- Reviews are publicly viewable but only customers can create them
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Notifications: users can only see their own
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_profile_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_profile_id);

-- Saved addresses: users can only access their own
CREATE POLICY "Users can manage their saved addresses" ON public.saved_addresses FOR ALL USING (auth.uid() = profile_id);

-- Payment methods: users can only access their own
CREATE POLICY "Users can manage their payment methods" ON public.payment_methods FOR ALL USING (auth.uid() = profile_id);

-- Wallet transactions: users can only see their own
CREATE POLICY "Users can view their wallet transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- AI and analytics: business owners only
CREATE POLICY "Business owners can access AI features" ON public.ai_prompts_history FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Business owners can view their analytics" ON public.business_analytics_metrics 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND auth.uid() = businesses.id
    )
);
CREATE POLICY "Business owners can manage AI content" ON public.ai_content_library 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND auth.uid() = businesses.id
    )
);

-- Loyalty: customers can view their loyalty data
CREATE POLICY "Customers can view their loyalty data" ON public.customer_loyalty FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Businesses can view loyalty for their customers" ON public.customer_loyalty 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND auth.uid() = businesses.id
    )
);

-- Coupons: businesses manage their own, customers can view active ones
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true AND expires_at > now());
CREATE POLICY "Business owners can manage their coupons" ON public.coupons 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND auth.uid() = businesses.id
    )
);

-- Staff: business owners can manage their staff
CREATE POLICY "Business owners can manage their staff" ON public.staff_members 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND auth.uid() = businesses.id
    )
);
CREATE POLICY "Staff can view their own record" ON public.staff_members FOR SELECT USING (auth.uid() = profile_id);

-- Payouts: business owners can view their payouts
CREATE POLICY "Business owners can view their payouts" ON public.payouts 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND auth.uid() = businesses.id
    )
);

-- Payments: users can see payments they made, businesses can see payments they received
CREATE POLICY "Users can view their payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Businesses can view payments they received" ON public.payments FOR SELECT USING (auth.uid() = business_id);

-- ========================================
-- Sample Data Inserts
-- ========================================

-- Insert sample categories
INSERT INTO public.categories (name, icon_url, description, interaction_type) VALUES
('Restaurants', '/icons/restaurant.svg', 'Food delivery and dining', 'type_a'),
('Grocery Stores', '/icons/grocery.svg', 'Groceries and essentials', 'type_a'),
('Electronics', '/icons/electronics.svg', 'Electronic items and gadgets', 'type_a'),
('Plumbing', '/icons/plumbing.svg', 'Plumbing services and repairs', 'type_b'),
('Electrical', '/icons/electrical.svg', 'Electrical services and repairs', 'type_b'),
('Cleaning', '/icons/cleaning.svg', 'Home and office cleaning services', 'type_b'),
('Real Estate', '/icons/realestate.svg', 'Property buying, selling, renting', 'type_c'),
('Travel', '/icons/travel.svg', 'Travel planning and booking', 'type_c'),
('Legal Services', '/icons/legal.svg', 'Legal consultation and services', 'type_c'),
('Healthcare', '/icons/healthcare.svg', 'Medical consultation and services', 'type_b'),
('Automotive', '/icons/automotive.svg', 'Car services and repairs', 'type_b'),
('Beauty & Wellness', '/icons/beauty.svg', 'Beauty and wellness services', 'type_b');

-- Insert some sample operating hours JSON structure
-- This is just for reference - actual business registration will insert real data
COMMENT ON COLUMN public.businesses.operating_hours IS 'JSON structure: {"Monday": {"open": "09:00", "close": "22:00", "is_closed": false}, "Tuesday": {...}, ...}';
COMMENT ON COLUMN public.products.variant_options IS 'JSON structure: [{"name": "Size", "values": ["Small", "Medium", "Large"]}, {"name": "Flavor", "values": ["Vanilla", "Chocolate"]}]';
COMMENT ON COLUMN public.order_items.product_details IS 'Snapshot of product: {"name": "Product Name", "price": 100, "image_url": "...", "variant_selected": {"Size": "Medium"}}';
