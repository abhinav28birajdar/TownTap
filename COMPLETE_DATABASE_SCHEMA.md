# TownTap Complete Database Schema

This document contains the complete PostgreSQL database schema for TownTap, a multi-business service marketplace. The schema supports customer bookings, business management, payments, reviews, real-time tracking, and analytics.

## Database Overview

The TownTap database consists of 25+ tables organized into logical modules:
- User Management & Authentication
- Business Management
- Service & Booking System
- Payment & Financial
- Reviews & Ratings
- Communication & Support
- Location & Tracking
- Analytics & Reporting

## Core Tables

### User Management

```sql
-- User profiles extending Supabase auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'business_owner', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User addresses for service delivery
CREATE TABLE user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- home, work, other
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    location_sharing BOOLEAN DEFAULT TRUE,
    preferred_language TEXT DEFAULT 'en',
    preferred_currency TEXT DEFAULT 'INR',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions for analytics
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Business Management

```sql
-- Business categories
CREATE TABLE business_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT, -- Ionicons name
    color TEXT, -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business listings
CREATE TABLE businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES business_categories(id),
    business_type TEXT CHECK (business_type IN ('individual', 'company', 'franchise')),
    registration_number TEXT,
    tax_id TEXT,
    license_number TEXT,
    website_url TEXT,
    logo_url TEXT,
    banner_url TEXT,
    established_year INTEGER,
    employee_count INTEGER,
    service_area_radius DECIMAL(5, 2) DEFAULT 10, -- in km
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business locations
CREATE TABLE business_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business operating hours
CREATE TABLE business_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business photos and gallery
CREATE TABLE business_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    photo_type TEXT CHECK (photo_type IN ('logo', 'banner', 'gallery', 'certificate')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business verification documents
CREATE TABLE business_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('business_license', 'tax_certificate', 'insurance', 'identity_proof')),
    document_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services offered by businesses
CREATE TABLE business_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    base_price DECIMAL(10, 2),
    price_unit TEXT DEFAULT 'fixed' CHECK (price_unit IN ('fixed', 'hourly', 'daily', 'per_item')),
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    duration_minutes INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    requires_visit BOOLEAN DEFAULT TRUE,
    advance_booking_hours INTEGER DEFAULT 24,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service packages and bundles
CREATE TABLE service_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    package_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2),
    validity_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services included in packages
CREATE TABLE package_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID REFERENCES service_packages(id) ON DELETE CASCADE,
    service_id UUID REFERENCES business_services(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Booking & Order System

```sql
-- Customer bookings
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    booking_number TEXT UNIQUE NOT NULL,
    booking_type TEXT DEFAULT 'service' CHECK (booking_type IN ('service', 'package')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Scheduling
    preferred_date DATE NOT NULL,
    preferred_time_start TIME,
    preferred_time_end TIME,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    estimated_duration INTEGER, -- in minutes
    
    -- Location
    service_address_id UUID REFERENCES user_addresses(id),
    service_location_notes TEXT,
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Additional info
    special_instructions TEXT,
    customer_notes TEXT,
    business_notes TEXT,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual items in a booking
CREATE TABLE booking_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    service_id UUID REFERENCES business_services(id),
    package_id UUID REFERENCES service_packages(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking status history for tracking
CREATE TABLE booking_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    change_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service pricing tiers
CREATE TABLE service_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES business_services(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL, -- Basic, Standard, Premium
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    features JSONB, -- Array of features
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Payment & Financial

```sql
-- Payment methods
CREATE TABLE payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL CHECK (method_type IN ('card', 'upi', 'wallet', 'bank_transfer')),
    provider TEXT, -- visa, mastercard, gpay, paytm, etc.
    last_four TEXT,
    card_brand TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    stripe_payment_method_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction records
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    user_id UUID REFERENCES profiles(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'payout', 'fee')),
    payment_method_id UUID REFERENCES payment_methods(id),
    
    -- Amount details
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    platform_fee DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Status and gateway info
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    gateway_provider TEXT, -- stripe, razorpay, etc.
    gateway_transaction_id TEXT,
    gateway_response JSONB,
    
    -- Metadata
    description TEXT,
    failure_reason TEXT,
    refunded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business earnings and payouts
CREATE TABLE business_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    booking_id UUID REFERENCES bookings(id),
    
    -- Earnings breakdown
    gross_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) DEFAULT 0,
    payment_processing_fee DECIMAL(10, 2) DEFAULT 0,
    tax_deducted DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payout info
    payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processed', 'failed')),
    payout_date DATE,
    payout_reference TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout requests
CREATE TABLE payout_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    bank_account_id UUID REFERENCES business_bank_accounts(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    processing_fee DECIMAL(10, 2) DEFAULT 0,
    gateway_payout_id TEXT,
    failure_reason TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business bank accounts for payouts
CREATE TABLE business_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    account_holder_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    bank_branch TEXT,
    ifsc_code TEXT NOT NULL,
    account_type TEXT CHECK (account_type IN ('savings', 'current')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Reviews & Ratings

```sql
-- Customer reviews
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Rating details
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    
    -- Review content
    title TEXT,
    review_text TEXT,
    photos JSONB, -- Array of photo URLs
    
    -- Moderation
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    
    -- Response
    business_response TEXT,
    business_response_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business rating aggregations (for performance)
CREATE TABLE business_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
    
    -- Overall stats
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    
    -- Rating distribution
    rating_5_count INTEGER DEFAULT 0,
    rating_4_count INTEGER DEFAULT 0,
    rating_3_count INTEGER DEFAULT 0,
    rating_2_count INTEGER DEFAULT 0,
    rating_1_count INTEGER DEFAULT 0,
    
    -- Detailed averages
    avg_quality DECIMAL(3, 2) DEFAULT 0,
    avg_punctuality DECIMAL(3, 2) DEFAULT 0,
    avg_professionalism DECIMAL(3, 2) DEFAULT 0,
    avg_value DECIMAL(3, 2) DEFAULT 0,
    
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Review helpfulness votes
CREATE TABLE review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- User reports for inappropriate content
CREATE TABLE user_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES profiles(id),
    reported_business_id UUID REFERENCES businesses(id),
    reported_review_id UUID REFERENCES reviews(id),
    report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'inappropriate', 'fraud', 'harassment', 'fake_review', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Communication & Support

```sql
-- Conversation threads
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    subject TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages within conversations
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'location', 'system')),
    content TEXT,
    media_url TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_system_message BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'review', 'promotion', 'system', 'message')),
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,
    image_url TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets
CREATE TABLE support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    category TEXT NOT NULL CHECK (category IN ('booking_issue', 'payment_problem', 'technical_issue', 'account_help', 'general_inquiry')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')),
    assigned_to UUID REFERENCES profiles(id),
    resolution TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ sections and articles
CREATE TABLE faq_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faq_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords JSONB,
    view_count INTEGER DEFAULT 0,
    is_helpful_count INTEGER DEFAULT 0,
    is_not_helpful_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Location & Tracking

```sql
-- Real-time location tracking
CREATE TABLE user_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(8, 2),
    altitude DECIMAL(8, 2),
    speed DECIMAL(8, 2),
    heading DECIMAL(8, 2),
    address_summary TEXT,
    tracking_type TEXT CHECK (tracking_type IN ('manual', 'automatic', 'live_tracking')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service areas for businesses
CREATE TABLE service_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    area_type TEXT CHECK (area_type IN ('city', 'district', 'custom_polygon', 'radius')),
    center_latitude DECIMAL(10, 8),
    center_longitude DECIMAL(11, 8),
    radius_km DECIMAL(8, 2),
    polygon_coordinates JSONB, -- GeoJSON polygon
    additional_charges DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery tracking for services
CREATE TABLE delivery_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES profiles(id),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    estimated_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    distance_to_customer DECIMAL(8, 2), -- in km
    status TEXT DEFAULT 'on_the_way' CHECK (status IN ('assigned', 'on_the_way', 'arrived', 'in_service', 'completed')),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

### Analytics & Reporting

```sql
-- Business analytics aggregations
CREATE TABLE business_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Booking metrics
    total_bookings INTEGER DEFAULT 0,
    confirmed_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    
    -- Financial metrics
    gross_revenue DECIMAL(10, 2) DEFAULT 0,
    net_revenue DECIMAL(10, 2) DEFAULT 0,
    total_fees DECIMAL(10, 2) DEFAULT 0,
    
    -- Customer metrics
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2),
    
    -- Operational metrics
    average_response_time INTEGER, -- in minutes
    average_service_duration INTEGER, -- in minutes
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- Platform-wide analytics
CREATE TABLE platform_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    new_signups INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    
    -- Business metrics
    total_businesses INTEGER DEFAULT 0,
    new_businesses INTEGER DEFAULT 0,
    active_businesses INTEGER DEFAULT 0,
    
    -- Transaction metrics
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    platform_revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- Geographic metrics
    top_cities JSONB,
    top_categories JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App usage events for detailed analytics
CREATE TABLE app_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id),
    event_name TEXT NOT NULL,
    event_category TEXT,
    properties JSONB,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- User-related indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default);

-- Business-related indexes
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_active ON businesses(is_active);
CREATE INDEX idx_businesses_verified ON businesses(is_verified);
CREATE INDEX idx_business_services_business ON business_services(business_id);
CREATE INDEX idx_business_locations_business ON business_locations(business_id);

-- Booking-related indexes
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_business ON bookings(business_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(preferred_date);
CREATE INDEX idx_booking_items_booking ON booking_items(booking_id);

-- Financial indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_business_earnings_business ON business_earnings(business_id);

-- Communication indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Location indexes
CREATE INDEX idx_user_locations_user ON user_locations(user_id);
CREATE INDEX idx_user_locations_booking ON user_locations(booking_id);
CREATE INDEX idx_business_locations_coordinates ON business_locations(latitude, longitude);

-- Review indexes
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);

-- Analytics indexes
CREATE INDEX idx_business_analytics_business_date ON business_analytics(business_id, date);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(date);
CREATE INDEX idx_app_events_user_date ON app_events(user_id, created_at);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ... enable on all other tables

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- User addresses: Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- Businesses: Business owners can manage their businesses
CREATE POLICY "Business owners can manage their businesses" ON businesses
    FOR ALL USING (auth.uid() = owner_id);

-- Bookings: Customers and business owners can view their bookings
CREATE POLICY "Customers can view their bookings" ON bookings
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Business owners can view their bookings" ON bookings
    FOR SELECT USING (auth.uid() = (SELECT owner_id FROM businesses WHERE id = business_id));

-- Reviews: Public read, customer can create/edit own reviews
CREATE POLICY "Reviews are publicly readable" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can manage own reviews" ON reviews
    FOR ALL USING (auth.uid() = customer_id);
```

### Functions and Triggers

```sql
-- Function to update business ratings when review is added/updated
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO business_ratings (business_id, total_reviews, average_rating)
    SELECT 
        NEW.business_id,
        COUNT(*),
        AVG(overall_rating)
    FROM reviews 
    WHERE business_id = NEW.business_id
    ON CONFLICT (business_id) 
    DO UPDATE SET
        total_reviews = EXCLUDED.total_reviews,
        average_rating = EXCLUDED.average_rating,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update business ratings
CREATE TRIGGER trigger_update_business_rating
    AFTER INSERT OR UPDATE OF overall_rating ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_business_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Initial Data Seeding

```sql
-- Insert default business categories
INSERT INTO business_categories (name, description, icon, color) VALUES
('Home Services', 'Plumbing, electrical, carpentry, and home repairs', 'home-outline', '#6366F1'),
('Cleaning', 'House cleaning, office cleaning, deep cleaning services', 'sparkles-outline', '#10B981'),
('Beauty & Wellness', 'Salon services, spa treatments, personal grooming', 'flower-outline', '#EC4899'),
('Food & Catering', 'Event catering, meal preparation, food delivery', 'restaurant-outline', '#F59E0B'),
('Technology', 'Computer repair, phone service, IT support', 'laptop-outline', '#8B5CF6'),
('Automotive', 'Car service, bike repair, vehicle maintenance', 'car-outline', '#EF4444'),
('Education', 'Tutoring, skill training, educational services', 'school-outline', '#059669'),
('Healthcare', 'Home healthcare, nursing, therapy services', 'medical-outline', '#DC2626'),
('Photography', 'Event photography, product shoots, portraits', 'camera-outline', '#7C3AED'),
('Transportation', 'Moving services, courier, delivery', 'car-sport-outline', '#0891B2'),
('Event Services', 'Event planning, decoration, entertainment', 'calendar-outline', '#DB2777'),
('Fitness', 'Personal training, yoga, fitness coaching', 'fitness-outline', '#16A34A'),
('Pet Services', 'Pet grooming, walking, veterinary care', 'paw-outline', '#C2410C'),
('Gardening', 'Landscaping, plant care, garden maintenance', 'leaf-outline', '#65A30D');

-- Insert FAQ categories
INSERT INTO faq_categories (name, description, icon, sort_order) VALUES
('Getting Started', 'Basic information about using TownTap', 'play-circle-outline', 1),
('Bookings', 'Questions about booking services', 'calendar-outline', 2),
('Payments', 'Payment methods and billing questions', 'card-outline', 3),
('Business Owners', 'Information for service providers', 'business-outline', 4),
('Account & Privacy', 'Account management and privacy settings', 'shield-outline', 5),
('Technical Support', 'Technical issues and troubleshooting', 'build-outline', 6);
```

## Database Configuration

### Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Supabase Setup Commands

```bash
# Initialize Supabase
supabase init

# Start local development
supabase start

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts
```

This comprehensive database schema provides:

1. **Scalable Architecture**: Designed to handle thousands of businesses and millions of bookings
2. **Real-time Capabilities**: Location tracking, live notifications, and instant messaging
3. **Financial Management**: Complete payment processing, earnings tracking, and payout system
4. **Analytics & Insights**: Comprehensive reporting for businesses and platform analytics
5. **Security**: Row-level security ensuring data privacy and access control
6. **Performance**: Optimized indexes for fast queries across all major use cases

The schema is production-ready and can be deployed to Supabase with minimal configuration changes.