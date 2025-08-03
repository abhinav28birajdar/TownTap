-- Real-Time Business Discovery Setup Script
-- Run this in your Supabase SQL Editor

-- First, enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS is working
SELECT PostGIS_Full_Version();

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_business_profiles_location 
ON business_profiles USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_business_profiles_status 
ON business_profiles (status);

CREATE INDEX IF NOT EXISTS idx_business_profiles_category 
ON business_profiles (category_id);

-- Create business_hours table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index for business hours
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_hours_business_day 
ON business_hours (business_id, day_of_week);

-- Create business_stats table for real-time metrics
CREATE TABLE IF NOT EXISTS business_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    customer_count INTEGER DEFAULT 0,
    average_wait_time INTEGER DEFAULT 0, -- in minutes
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index for business stats
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_stats_business 
ON business_stats (business_id);

-- Create customer_interactions table for tracking
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'call', 'visit', 'order'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for interactions
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer 
ON customer_interactions (customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_business 
ON customer_interactions (business_id);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_created 
ON customer_interactions (created_at);

-- Insert sample business hours for testing (if businesses exist)
INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
SELECT 
    id as business_id,
    generate_series(1, 5) as day_of_week, -- Monday to Friday
    '09:00'::TIME as open_time,
    '18:00'::TIME as close_time,
    false as is_closed
FROM business_profiles
WHERE id NOT IN (SELECT DISTINCT business_id FROM business_hours WHERE business_id IS NOT NULL)
LIMIT 10; -- Limit to first 10 businesses to avoid too many inserts

-- Insert weekend hours (shorter hours)
INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
SELECT 
    id as business_id,
    generate_series(0, 6, 6) as day_of_week, -- Sunday and Saturday
    '10:00'::TIME as open_time,
    '16:00'::TIME as close_time,
    false as is_closed
FROM business_profiles
WHERE id NOT IN (SELECT DISTINCT business_id FROM business_hours WHERE day_of_week IN (0, 6))
LIMIT 10;

-- Insert sample business stats
INSERT INTO business_stats (business_id, customer_count, average_wait_time)
SELECT 
    id as business_id,
    FLOOR(RANDOM() * 20) as customer_count, -- 0-19 customers
    FLOOR(RANDOM() * 30) + 5 as average_wait_time -- 5-34 minutes wait time
FROM business_profiles
WHERE id NOT IN (SELECT business_id FROM business_stats WHERE business_id IS NOT NULL)
LIMIT 10;

-- Create triggers to update business_stats.last_updated
CREATE OR REPLACE FUNCTION update_business_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_business_stats_timestamp ON business_stats;
CREATE TRIGGER trigger_update_business_stats_timestamp
    BEFORE UPDATE ON business_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_business_stats_timestamp();

-- Enable real-time for business_stats table
ALTER PUBLICATION supabase_realtime ADD TABLE business_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE business_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_interactions;

-- Create RLS policies for business_stats
ALTER TABLE business_stats ENABLE ROW LEVEL SECURITY;

-- Allow customers to read business stats
CREATE POLICY "Customers can read business stats" ON business_stats
    FOR SELECT USING (true);

-- Allow business owners to update their own stats
CREATE POLICY "Business owners can update own stats" ON business_stats
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

-- Allow business owners to insert their own stats
CREATE POLICY "Business owners can insert own stats" ON business_stats
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

-- Create RLS policies for customer_interactions
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

-- Allow customers to insert their own interactions
CREATE POLICY "Customers can insert own interactions" ON customer_interactions
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Allow customers to read their own interactions
CREATE POLICY "Customers can read own interactions" ON customer_interactions
    FOR SELECT USING (customer_id = auth.uid());

-- Allow business owners to read interactions with their business
CREATE POLICY "Business owners can read business interactions" ON customer_interactions
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

-- Create RLS policies for business_hours
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read business hours
CREATE POLICY "Everyone can read business hours" ON business_hours
    FOR SELECT USING (true);

-- Allow business owners to manage their own hours
CREATE POLICY "Business owners can manage own hours" ON business_hours
    FOR ALL USING (
        business_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

-- Create a function to get real-time business status
CREATE OR REPLACE FUNCTION get_business_realtime_status(business_uuid UUID)
RETURNS TABLE (
    is_open BOOLEAN,
    customer_count INTEGER,
    average_wait_time INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_day INTEGER;
    current_time TIME;
    business_hours_record RECORD;
BEGIN
    -- Get current day and time
    current_day := EXTRACT(DOW FROM NOW()); -- 0 = Sunday, 6 = Saturday
    current_time := NOW()::TIME;
    
    -- Get business hours for today
    SELECT bh.open_time, bh.close_time, bh.is_closed
    INTO business_hours_record
    FROM business_hours bh
    WHERE bh.business_id = business_uuid 
    AND bh.day_of_week = current_day;
    
    -- Get business stats
    SELECT 
        CASE 
            WHEN business_hours_record.is_closed = true THEN false
            WHEN business_hours_record.open_time IS NULL THEN false
            WHEN current_time BETWEEN business_hours_record.open_time AND business_hours_record.close_time THEN true
            ELSE false
        END as is_open,
        COALESCE(bs.customer_count, 0) as customer_count,
        COALESCE(bs.average_wait_time, 15) as average_wait_time,
        COALESCE(bs.last_updated, NOW()) as last_updated
    FROM business_stats bs
    WHERE bs.business_id = business_uuid
    UNION ALL
    SELECT 
        false as is_open,
        0 as customer_count,
        15 as average_wait_time,
        NOW() as last_updated
    WHERE NOT EXISTS (SELECT 1 FROM business_stats WHERE business_id = business_uuid)
    LIMIT 1;
    
    RETURN QUERY
    SELECT 
        CASE 
            WHEN business_hours_record.is_closed = true THEN false
            WHEN business_hours_record.open_time IS NULL THEN false
            WHEN current_time BETWEEN business_hours_record.open_time AND business_hours_record.close_time THEN true
            ELSE false
        END::BOOLEAN,
        COALESCE(bs.customer_count, 0)::INTEGER,
        COALESCE(bs.average_wait_time, 15)::INTEGER,
        COALESCE(bs.last_updated, NOW())::TIMESTAMP WITH TIME ZONE
    FROM business_stats bs
    WHERE bs.business_id = business_uuid
    UNION ALL
    SELECT 
        false::BOOLEAN,
        0::INTEGER,
        15::INTEGER,
        NOW()::TIMESTAMP WITH TIME ZONE
    WHERE NOT EXISTS (SELECT 1 FROM business_stats WHERE business_id = business_uuid)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the setup
SELECT 'PostGIS enabled successfully' as status 
WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis');

SELECT 'Sample data exists' as status, COUNT(*) as business_count
FROM business_profiles;

SELECT 'Business hours configured' as status, COUNT(*) as hours_count
FROM business_hours;

SELECT 'Business stats available' as status, COUNT(*) as stats_count
FROM business_stats;

-- Show sample real-time status
SELECT 
    bp.name,
    bp.id,
    (get_business_realtime_status(bp.id)).*
FROM business_profiles bp
LIMIT 5;
