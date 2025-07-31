-- =====================================================
-- ADVANCED FEATURES DATABASE SCHEMA
-- TownTap Advanced Features Migration
-- =====================================================

-- AI Search Service Tables
-- =====================================================

-- AI Search Analytics
CREATE TABLE IF NOT EXISTS ai_search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    normalized_query TEXT,
    search_type VARCHAR(50) DEFAULT 'standard',
    results_count INTEGER DEFAULT 0,
    clicked_results INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    search_time_ms INTEGER,
    location_latitude DECIMAL(10,8),
    location_longitude DECIMAL(11,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID,
    type VARCHAR(50) NOT NULL, -- 'trending', 'personalized', 'similar', 'location_based'
    score DECIMAL(5,3) DEFAULT 0,
    reasoning TEXT,
    metadata JSONB DEFAULT '{}',
    is_clicked BOOLEAN DEFAULT false,
    is_converted BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Messaging Tables
-- =====================================================

-- Voice Messages
CREATE TABLE IF NOT EXISTS voice_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    file_size_bytes BIGINT,
    transcription TEXT,
    is_transcribed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Video Calls
CREATE TABLE IF NOT EXISTS video_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    callee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    call_type VARCHAR(20) DEFAULT 'video', -- 'video', 'voice'
    status VARCHAR(20) DEFAULT 'initiated', -- 'initiated', 'ringing', 'active', 'ended', 'missed', 'declined'
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    recording_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Scheduled Messages
CREATE TABLE IF NOT EXISTS scheduled_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    template_id UUID,
    message_content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
    sent_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_content TEXT NOT NULL,
    variables TEXT[], -- Array of variable names like ['customer_name', 'order_id']
    category VARCHAR(100), -- 'welcome', 'order_update', 'promotion', 'reminder'
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Message Reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50) NOT NULL, -- 'like', 'love', 'laugh', 'sad', 'angry', 'thumbs_up', 'thumbs_down'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Real-Time Tracking Tables
-- =====================================================

-- Location Updates
CREATE TABLE IF NOT EXISTS location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(8,2),
    speed DECIMAL(8,2),
    heading DECIMAL(5,1),
    altitude DECIMAL(8,2),
    battery_level INTEGER,
    is_manual BOOLEAN DEFAULT false,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Geofence Areas
CREATE TABLE IF NOT EXISTS geofence_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    center_latitude DECIMAL(10,8) NOT NULL,
    center_longitude DECIMAL(11,8) NOT NULL,
    radius_meters INTEGER NOT NULL,
    shape VARCHAR(20) DEFAULT 'circle', -- 'circle', 'polygon'
    polygon_coordinates JSONB, -- For complex shapes
    trigger_events TEXT[], -- ['enter', 'exit', 'dwell']
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Geofence Events
CREATE TABLE IF NOT EXISTS geofence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geofence_id UUID REFERENCES geofence_areas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    event_type VARCHAR(20) NOT NULL, -- 'enter', 'exit', 'dwell'
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    dwell_time_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Route Optimization
CREATE TABLE IF NOT EXISTS route_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_ids UUID[],
    start_location JSONB NOT NULL, -- {lat, lng, address}
    end_location JSONB,
    waypoints JSONB[], -- Array of {lat, lng, address, order_id}
    optimized_route JSONB, -- Complete route data
    total_distance_km DECIMAL(8,2),
    total_duration_minutes INTEGER,
    traffic_conditions VARCHAR(20), -- 'light', 'moderate', 'heavy'
    route_status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'active', 'completed', 'cancelled'
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Loyalty & Referral Tables
-- =====================================================

-- Loyalty Programs
CREATE TABLE IF NOT EXISTS loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'points', -- 'points', 'visits', 'spending', 'tier'
    is_active BOOLEAN DEFAULT true,
    rules JSONB NOT NULL DEFAULT '{}',
    rewards JSONB DEFAULT '[]',
    tiers JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer Loyalty
CREATE TABLE IF NOT EXISTS customer_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    current_tier VARCHAR(100),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(customer_id, business_id)
);

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'earned', 'redeemed', 'expired', 'bonus', 'adjustment'
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referral Programs
CREATE TABLE IF NOT EXISTS referral_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL, -- 'platform', 'business'
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    referrer_reward JSONB NOT NULL,
    referee_reward JSONB NOT NULL,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) NOT NULL,
    program_id UUID REFERENCES referral_programs(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'expired', 'cancelled'
    order_value DECIMAL(10,2),
    rewards_given BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Coupon Codes
CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount', 'free_shipping', 'buy_one_get_one'
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2),
    max_discount DECIMAL(10,2),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    applicable_categories TEXT[],
    excluded_categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupon Usage
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupon_codes(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    order_value DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer Coupons (assigned coupons)
CREATE TABLE IF NOT EXISTS customer_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coupon_id UUID REFERENCES coupon_codes(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(customer_id, coupon_id)
);

-- Advanced Notification Tables
-- =====================================================

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'email', 'push', 'sms', 'in_app'
    category VARCHAR(50) NOT NULL, -- 'order', 'promotion', 'loyalty', 'referral', 'business', 'system'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables TEXT[], -- Variables that can be replaced in template
    is_active BOOLEAN DEFAULT true,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    in_app_notifications BOOLEAN DEFAULT true,
    categories JSONB DEFAULT '{}',
    quiet_hours JSONB DEFAULT '{}',
    frequency JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notification Messages
CREATE TABLE IF NOT EXISTS notification_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'email', 'push', 'sms', 'in_app'
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'cancelled'
    read_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Push Tokens
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, token)
);

-- In-App Notifications
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notification_messages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- ADDITIONAL SUPPORTING TABLES
-- =====================================================

-- Platform Loyalty (for platform-wide rewards)
CREATE TABLE IF NOT EXISTS platform_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    level VARCHAR(50) DEFAULT 'bronze',
    tier_benefits JSONB DEFAULT '{}',
    join_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wallet Transactions (for cash rewards)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
    description TEXT NOT NULL,
    reference_id UUID, -- Reference to order, referral, etc.
    reference_type VARCHAR(50), -- 'order', 'referral', 'loyalty', 'cashback'
    balance_after DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Service Vouchers (for free service rewards)
CREATE TABLE IF NOT EXISTS service_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    voucher_code VARCHAR(50) UNIQUE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    description TEXT,
    applicable_services TEXT[],
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- AI Search Indexes
CREATE INDEX IF NOT EXISTS idx_ai_search_analytics_user_id ON ai_search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_analytics_created_at ON ai_search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_business_id ON ai_recommendations(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(type);

-- Messaging Indexes
CREATE INDEX IF NOT EXISTS idx_voice_messages_message_id ON voice_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_caller_id ON video_calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_callee_id ON video_calls(callee_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_scheduled_for ON scheduled_messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON scheduled_messages(status);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);

-- Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_location_updates_user_id ON location_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_location_updates_order_id ON location_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_location_updates_created_at ON location_updates(created_at);
CREATE INDEX IF NOT EXISTS idx_geofence_events_geofence_id ON geofence_events(geofence_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_user_id ON geofence_events(user_id);

-- Loyalty Indexes
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_customer_id ON customer_loyalty(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_business_id ON customer_loyalty(business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_business_id ON loyalty_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);

-- Notification Indexes
CREATE INDEX IF NOT EXISTS idx_notification_messages_user_id ON notification_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_status ON notification_messages(status);
CREATE INDEX IF NOT EXISTS idx_notification_messages_scheduled_for ON notification_messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_is_active ON push_tokens(is_active);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update customer loyalty points
CREATE OR REPLACE FUNCTION update_customer_loyalty_points(
    p_customer_id UUID,
    p_business_id UUID,
    p_points_change INTEGER
)
RETURNS void AS $$
BEGIN
    UPDATE customer_loyalty 
    SET 
        total_points = total_points + p_points_change,
        available_points = available_points + p_points_change,
        last_activity = now()
    WHERE customer_id = p_customer_id AND business_id = p_business_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE coupon_codes 
    SET used_count = used_count + 1
    WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371; -- Earth radius in kilometers
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update referral code in profiles
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := UPPER(substring(NEW.name from 1 for 3) || substring(MD5(random()::text) from 1 for 5));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger if referral_code column exists in profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_code') THEN
        DROP TRIGGER IF EXISTS trigger_generate_referral_code ON profiles;
        CREATE TRIGGER trigger_generate_referral_code
            BEFORE INSERT ON profiles
            FOR EACH ROW
            EXECUTE FUNCTION generate_referral_code();
    END IF;
END $$;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE ai_search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_vouchers ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can access their own data)
CREATE POLICY "Users can access their own AI search analytics" ON ai_search_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own AI recommendations" ON ai_recommendations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own voice messages" ON voice_messages FOR ALL USING (auth.uid() IN (SELECT user_id FROM messages WHERE id = message_id));
CREATE POLICY "Users can access their own video calls" ON video_calls FOR ALL USING (auth.uid() = caller_id OR auth.uid() = callee_id);
CREATE POLICY "Users can access their own scheduled messages" ON scheduled_messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can access their own message reactions" ON message_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own location updates" ON location_updates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own geofence events" ON geofence_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own route optimizations" ON route_optimizations FOR ALL USING (auth.uid() = service_provider_id);
CREATE POLICY "Users can access their own loyalty data" ON customer_loyalty FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Users can access their own loyalty transactions" ON loyalty_transactions FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Users can access their own referrals" ON referrals FOR ALL USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
CREATE POLICY "Users can access their own coupon usage" ON coupon_usage FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Users can access their own customer coupons" ON customer_coupons FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Users can access their own notification preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own notification messages" ON notification_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own push tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own in-app notifications" ON in_app_notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own platform loyalty" ON platform_loyalty FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own wallet transactions" ON wallet_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own service vouchers" ON service_vouchers FOR ALL USING (auth.uid() = user_id);

-- Business-related policies
CREATE POLICY "Businesses can access their own templates" ON message_templates FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE id = created_by));
CREATE POLICY "Businesses can access their own geofence areas" ON geofence_areas FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "Businesses can access their own loyalty programs" ON loyalty_programs FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "Businesses can access their own referral programs" ON referral_programs FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "Businesses can access their own coupons" ON coupon_codes FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "Businesses can access their own notification templates" ON notification_templates FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Insert completion record
INSERT INTO public.schema_migrations (version, description, executed_at) 
VALUES ('20241201_advanced_features', 'Advanced Features Schema for TownTap', now())
ON CONFLICT (version) DO UPDATE SET executed_at = now();

SELECT 'Advanced Features Database Schema Migration Completed Successfully!' as status;
