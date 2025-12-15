-- ============================================================================
-- TOWNTAP - COMPLETE DATABASE SCHEMA FOR SUPABASE
-- Multi-Category Service Booking Application
-- Version: 1.0.0
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS & CUSTOM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('customer', 'business_owner', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'banned');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE business_status AS ENUM ('pending', 'active', 'inactive', 'suspended', 'rejected');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'rejected', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'wallet', 'net_banking');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE notification_type AS ENUM ('order', 'payment', 'message', 'review', 'promotion', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'location', 'document');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE transaction_type AS ENUM ('booking', 'refund', 'withdrawal', 'credit', 'debit');
CREATE TYPE dispute_status AS ENUM ('open', 'in_review', 'resolved', 'closed');
CREATE TYPE recurring_frequency AS ENUM ('weekly', 'biweekly', 'monthly');

-- ============================================================================
-- USERS TABLE (Extends Supabase Auth)
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    status user_status NOT NULL DEFAULT 'active',
    gender gender_type,
    date_of_birth DATE,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE,
    push_token TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    image_url TEXT,
    color_code VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BUSINESSES TABLE
-- ============================================================================

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    business_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website TEXT,
    
    -- Address information
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Location for geospatial queries
    location GEOGRAPHY(POINT, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Business details
    status business_status DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Service area (in kilometers)
    service_radius INTEGER DEFAULT 10,
    
    -- Business documents
    business_license_url TEXT,
    gst_number VARCHAR(15),
    gst_certificate_url TEXT,
    pan_number VARCHAR(10),
    
    -- Bank details
    bank_account_number VARCHAR(50),
    bank_ifsc_code VARCHAR(11),
    bank_account_holder_name VARCHAR(255),
    bank_name VARCHAR(100),
    
    -- Settings
    auto_accept_orders BOOLEAN DEFAULT FALSE,
    instant_booking_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BUSINESS WORKING HOURS
-- ============================================================================

CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day day_of_week NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, day)
);

-- ============================================================================
-- BUSINESS GALLERY
-- ============================================================================

CREATE TABLE business_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SERVICES TABLE
-- ============================================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    final_price DECIMAL(10, 2) GENERATED ALWAYS AS (base_price - (base_price * discount_percentage / 100)) STORED,
    
    -- Service details
    duration INTEGER, -- in minutes
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Stats
    total_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, slug)
);

-- ============================================================================
-- CUSTOMER ADDRESSES
-- ============================================================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50), -- Home, Work, Other
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Location
    location GEOGRAPHY(POINT, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BOOKINGS/ORDERS TABLE
-- ============================================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Parties involved
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
    
    -- Service details
    address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
    
    -- Timing
    booking_date DATE NOT NULL,
    booking_time_slot TIME NOT NULL,
    estimated_duration INTEGER, -- in minutes
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status order_status DEFAULT 'pending',
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    service_fee DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    
    -- Additional info
    special_instructions TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Emergency booking
    is_emergency BOOLEAN DEFAULT FALSE,
    
    -- Recurring
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_parent_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BOOKING ITEMS (Services in a booking)
-- ============================================================================

CREATE TABLE booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    service_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RECURRING BOOKINGS
-- ============================================================================

CREATE TABLE recurring_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    frequency recurring_frequency NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    next_booking_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT, -- Business owner response
    responded_at TIMESTAMP WITH TIME ZONE,
    is_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- ============================================================================
-- REVIEW PHOTOS
-- ============================================================================

CREATE TABLE review_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FAVORITES/WISHLIST
-- ============================================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- ============================================================================
-- PAYMENTS & TRANSACTIONS
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Parties
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    business_id UUID REFERENCES businesses(id) ON DELETE RESTRICT,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Transaction details
    type transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method,
    status payment_status DEFAULT 'pending',
    
    -- Payment gateway details
    gateway_transaction_id VARCHAR(255),
    gateway_name VARCHAR(50), -- razorpay, stripe, etc.
    gateway_response JSONB,
    
    -- Additional info
    description TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WALLET
-- ============================================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    total_earned DECIMAL(10, 2) DEFAULT 0.00,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WITHDRAWAL REQUESTS
-- ============================================================================

CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_notes TEXT,
    transaction_id UUID REFERENCES transactions(id)
);

-- ============================================================================
-- PAYMENT METHODS (Saved Cards/UPI)
-- ============================================================================

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type payment_method NOT NULL,
    
    -- Card details (encrypted/tokenized)
    card_last4 VARCHAR(4),
    card_brand VARCHAR(20),
    card_expiry_month INTEGER,
    card_expiry_year INTEGER,
    
    -- UPI
    upi_id VARCHAR(255),
    
    -- Gateway token
    gateway_token TEXT,
    
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CHAT CONVERSATIONS
-- ============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, business_id)
);

-- ============================================================================
-- MESSAGES
-- ============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    attachment_url TEXT,
    status message_status DEFAULT 'sent',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    priority notification_priority DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    
    -- Deep linking
    action_url TEXT,
    action_data JSONB,
    
    -- Related entities
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROMOTIONAL OFFERS
-- ============================================================================

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Discount details
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2),
    min_order_amount DECIMAL(10, 2),
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Usage limits
    max_uses INTEGER,
    max_uses_per_user INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    
    -- Applicability
    applicable_categories UUID[] DEFAULT '{}',
    applicable_businesses UUID[] DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- OFFER USAGE
-- ============================================================================

CREATE TABLE offer_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- REFERRALS
-- ============================================================================

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    
    -- Rewards
    referrer_reward DECIMAL(10, 2) DEFAULT 0.00,
    referee_reward DECIMAL(10, 2) DEFAULT 0.00,
    
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referee_id)
);

-- ============================================================================
-- LOYALTY POINTS
-- ============================================================================

CREATE TABLE loyalty_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- earned, redeemed
    description TEXT,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUPPORT TICKETS
-- ============================================================================

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    priority notification_priority DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DISPUTES
-- ============================================================================

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    raised_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    evidence_urls TEXT[],
    status dispute_status DEFAULT 'open',
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SEARCH HISTORY
-- ============================================================================

CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- APP SETTINGS
-- ============================================================================

CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BANNERS & PROMOTIONS
-- ============================================================================

CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    action_url TEXT,
    action_type VARCHAR(50), -- navigation, external_link
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_phone ON users(phone);

-- Businesses indexes
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_location ON businesses USING GIST(location);
CREATE INDEX idx_businesses_online ON businesses(is_online) WHERE is_online = TRUE;
CREATE INDEX idx_businesses_rating ON businesses(average_rating DESC);

-- Services indexes
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_services_featured ON services(is_featured) WHERE is_featured = TRUE;

-- Bookings indexes
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_business ON bookings(business_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);
CREATE INDEX idx_bookings_number ON bookings(booking_number);

-- Reviews indexes
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- Transactions indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_business ON transactions(business_id);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_status ON messages(status) WHERE status != 'read';

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- Full text search indexes
CREATE INDEX idx_businesses_search ON businesses USING GIN(to_tsvector('english', business_name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_services_search ON services USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update business rating after review
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses
    SET 
        average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE business_id = NEW.business_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id)
    WHERE id = NEW.business_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_rating_after_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- Function to update service rating
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE services s
    SET average_rating = (
        SELECT AVG(r.rating)::DECIMAL(3,2)
        FROM reviews r
        JOIN booking_items bi ON bi.booking_id = r.booking_id
        WHERE bi.service_id = s.id
    )
    WHERE id IN (
        SELECT service_id FROM booking_items WHERE booking_id = NEW.booking_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_rating_after_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_service_rating();

-- Function to increment total orders for business
CREATE OR REPLACE FUNCTION increment_business_orders()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE businesses
        SET 
            total_orders = total_orders + 1,
            total_revenue = total_revenue + NEW.total_amount
        WHERE id = NEW.business_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_business_orders_on_completion
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION increment_business_orders();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Businesses policies (public read, owner write)
CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT USING (status = 'active');

CREATE POLICY "Business owners can update own business" ON businesses
    FOR ALL USING (auth.uid() = owner_id);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Business owners can manage own services" ON services
    FOR ALL USING (
        business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    );

-- Bookings policies
CREATE POLICY "Customers can view own bookings" ON bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Business owners can view bookings for their business" ON bookings
    FOR SELECT USING (
        business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    );

-- Addresses policies
CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (user_id = auth.uid());

-- Reviews policies (public read, customer write)
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their bookings" ON reviews
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE customer_id = auth.uid() OR 
                  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Favorites policies
CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- SEED DATA FOR CATEGORIES
-- ============================================================================

INSERT INTO categories (name, slug, description, color_code, sort_order) VALUES
('Plumbing', 'plumbing', 'Professional plumbing services for your home and office', '#3498db', 1),
('Electrical', 'electrical', 'Licensed electricians for all electrical work', '#f39c12', 2),
('Carpentry', 'carpentry', 'Expert carpenters for furniture and repairs', '#8e44ad', 3),
('Painting', 'painting', 'Professional painting services', '#e74c3c', 4),
('Home Cleaning', 'home-cleaning', 'Deep cleaning and regular home cleaning', '#2ecc71', 5),
('AC Repair', 'ac-repair', 'AC installation, repair and maintenance', '#1abc9c', 6),
('Pest Control', 'pest-control', 'Eliminate pests from your property', '#34495e', 7),
('Appliance Repair', 'appliance-repair', 'Repair services for home appliances', '#e67e22', 8),
('Beauty & Salon', 'beauty-salon', 'Beauty services at your doorstep', '#9b59b6', 9),
('Automotive', 'automotive', 'Car and bike repair services', '#95a5a6', 10),
('Moving & Storage', 'moving-storage', 'Professional moving and packing services', '#c0392b', 11),
('Gardening', 'gardening', 'Lawn care and gardening services', '#27ae60', 12);

-- ============================================================================
-- SEED DATA FOR APP SETTINGS
-- ============================================================================

INSERT INTO app_settings (key, value, description) VALUES
('tax_percentage', '18', 'GST/Tax percentage for services'),
('service_fee_percentage', '5', 'Platform service fee percentage'),
('minimum_withdrawal_amount', '500', 'Minimum amount for business withdrawal'),
('referral_reward_amount', '100', 'Reward amount for successful referrals'),
('cancellation_window_hours', '2', 'Hours before booking for free cancellation'),
('emergency_service_surcharge', '50', 'Additional charge for emergency services'),
('max_service_radius_km', '50', 'Maximum service radius in kilometers');

-- ============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    ) / 1000; -- Return in kilometers
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby businesses
CREATE OR REPLACE FUNCTION get_nearby_businesses(
    user_lat DECIMAL,
    user_lon DECIMAL,
    radius_km INTEGER DEFAULT 10,
    category_filter UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    business_name VARCHAR,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.business_name,
        (ST_Distance(
            b.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
        ) / 1000)::DECIMAL(10,2) as distance_km
    FROM businesses b
    WHERE 
        b.status = 'active'
        AND b.is_online = TRUE
        AND ST_DWithin(
            b.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
            radius_km * 1000
        )
        AND (category_filter IS NULL OR b.category_id = category_filter)
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR AS $$
DECLARE
    new_number VARCHAR;
BEGIN
    new_number := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('booking_number_seq')::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for booking numbers
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;

-- Function to generate unique transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS VARCHAR AS $$
DECLARE
    new_number VARCHAR;
BEGIN
    new_number := 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('transaction_number_seq')::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for transaction numbers
CREATE SEQUENCE IF NOT EXISTS transaction_number_seq START 1;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active bookings view
CREATE OR REPLACE VIEW active_bookings_view AS
SELECT 
    b.*,
    u.full_name as customer_name,
    u.phone as customer_phone,
    bus.business_name,
    bus.phone as business_phone,
    a.address_line1 || ', ' || a.city as address
FROM bookings b
JOIN users u ON b.customer_id = u.id
JOIN businesses bus ON b.business_id = bus.id
JOIN addresses a ON b.address_id = a.id
WHERE b.status IN ('pending', 'accepted', 'on_the_way', 'in_progress');

-- Business dashboard stats view
CREATE OR REPLACE VIEW business_dashboard_stats AS
SELECT 
    b.id as business_id,
    COUNT(DISTINCT CASE WHEN bk.created_at::date = CURRENT_DATE THEN bk.id END) as today_orders,
    COALESCE(SUM(CASE WHEN bk.created_at::date = CURRENT_DATE THEN bk.total_amount END), 0) as today_revenue,
    COUNT(DISTINCT CASE WHEN bk.status = 'pending' THEN bk.id END) as pending_orders,
    COUNT(DISTINCT bk.customer_id) as total_customers,
    b.average_rating,
    b.total_reviews
FROM businesses b
LEFT JOIN bookings bk ON bk.business_id = b.id
GROUP BY b.id, b.average_rating, b.total_reviews;

-- ============================================================================
-- GRANTS (Adjust based on your Supabase setup)
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE booking_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE transaction_number_seq TO authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Notes for deployment:
-- 1. Run this script in your Supabase SQL editor
-- 2. Enable realtime for tables: messages, bookings, notifications
-- 3. Set up storage buckets for: avatars, business-photos, service-images, review-photos
-- 4. Configure Supabase Auth settings
-- 5. Set up Edge Functions for payment processing
-- 6. Configure email templates for notifications
