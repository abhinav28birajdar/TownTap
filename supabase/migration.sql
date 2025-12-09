-- TownTap Database Migration Script
-- This script adds missing fields and tables to match application requirements
-- Run this on your existing Supabase database

-- ============================================
-- 1. ADD MISSING FIELDS TO EXISTING TABLES
-- ============================================

-- Add is_open field to businesses table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'is_open'
  ) THEN
    ALTER TABLE businesses ADD COLUMN is_open BOOLEAN DEFAULT TRUE;
    COMMENT ON COLUMN businesses.is_open IS 'Indicates if business is currently open based on operating hours';
  END IF;
END $$;

-- Add booking_date to bookings table (alternative to scheduled_date + scheduled_time)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'booking_date'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_date TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN bookings.booking_date IS 'Full date-time of booking (alternative to scheduled_date + scheduled_time)';
    
    -- Copy existing data if scheduled_date and scheduled_time exist
    UPDATE bookings 
    SET booking_date = (scheduled_date + scheduled_time) 
    WHERE booking_date IS NULL;
  END IF;
END $$;

-- Ensure profiles table has all required fields
DO $$ 
BEGIN
  -- first_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
    ALTER TABLE profiles ADD COLUMN first_name TEXT;
  END IF;
  
  -- last_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
    ALTER TABLE profiles ADD COLUMN last_name TEXT;
  END IF;
  
  -- date_of_birth
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
  END IF;
  
  -- preferences (JSONB)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
    ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{
      "notifications": true,
      "marketing_emails": false,
      "location_sharing": true,
      "theme": "system",
      "language": "en"
    }'::jsonb;
  END IF;
  
  -- verified_email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified_email') THEN
    ALTER TABLE profiles ADD COLUMN verified_email BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- verified_phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified_phone') THEN
    ALTER TABLE profiles ADD COLUMN verified_phone BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- last_login_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login_at') THEN
    ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- ============================================
-- 2. CREATE MESSAGES TABLE IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read) WHERE read = FALSE;

-- ============================================
-- 3. ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST(location);

-- Businesses indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON businesses(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON businesses(is_verified) WHERE is_verified = TRUE;

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date) WHERE booking_date IS NOT NULL;

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================
-- 4. ADD ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own sent messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables that don't have them
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'businesses', 'services', 'bookings', 'reviews', 'messages')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END$$;

-- Function to update business rating
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE business_id = NEW.business_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE business_id = NEW.business_id
    )
  WHERE id = NEW.business_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update business rating on review insert/update/delete
DROP TRIGGER IF EXISTS update_business_rating_on_review ON reviews;
CREATE TRIGGER update_business_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_business_rating();

-- Function to update last_login_at on profile
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_login_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. ADD VIEWS FOR COMMON QUERIES
-- ============================================

-- View for business with full details
CREATE OR REPLACE VIEW business_details AS
SELECT 
  b.*,
  c.name as category_name,
  c.slug as category_slug,
  p.full_name as owner_name,
  p.email as owner_email,
  ST_X(b.location::geometry) as longitude,
  ST_Y(b.location::geometry) as latitude
FROM businesses b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN profiles p ON b.owner_id = p.id;

-- View for booking with full details
CREATE OR REPLACE VIEW booking_details AS
SELECT 
  bk.*,
  p.full_name as customer_name,
  p.email as customer_email,
  p.phone as customer_phone,
  b.name as business_name,
  b.address as business_address,
  b.phone as business_phone
FROM bookings bk
LEFT JOIN profiles p ON bk.customer_id = p.id
LEFT JOIN businesses b ON bk.business_id = b.id;

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'TownTap database migration completed successfully';
  RAISE NOTICE 'Added: is_open to businesses, booking_date to bookings';
  RAISE NOTICE 'Created: messages table with indexes and RLS policies';
  RAISE NOTICE 'Updated: All required fields on profiles table';
  RAISE NOTICE 'Added: Performance indexes and triggers';
END $$;
