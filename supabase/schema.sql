-- TownTap Complete Database Schema
-- This file contains all the SQL needed to set up the TownTap application database

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 2. ENUMS
-- ============================================================================

-- User types
CREATE TYPE user_type AS ENUM ('customer', 'business_owner', 'business_staff', 'admin', 'staff');

-- Business interaction types
CREATE TYPE business_interaction_type AS ENUM ('type_a', 'type_b', 'type_c');

-- Business status
CREATE TYPE business_status AS ENUM ('pending_approval', 'active', 'inactive', 'suspended');

-- Payment methods
CREATE TYPE payment_method AS ENUM ('CARD', 'NETBANKING', 'UPI_COLLECT', 'UPI_INTENT', 'WALLET', 'COD', 'CASH_ON_SITE');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded', 'authorized', 'captured');

-- Order status
CREATE TYPE order_status AS ENUM (
  'pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 
  'delivered', 'completed', 'cancelled_by_customer', 'cancelled_by_business', 
  'payment_failed', 'refunded', 'disputed'
);

-- Service request status
CREATE TYPE service_request_status AS ENUM (
  'pending', 'accepted', 'rejected_by_business', 'quoted', 'scheduled', 
  'in_progress', 'completed', 'cancelled_by_customer', 'cancelled_by_business', 'disputed'
);

-- Inquiry status
CREATE TYPE inquiry_status AS ENUM ('new', 'reviewed', 'contacted_by_business', 'proposal_sent', 'closed_success', 'closed_fail', 'archived');

-- App language
CREATE TYPE app_language AS ENUM ('en', 'hi', 'es', 'fr');

-- Notification types
CREATE TYPE notification_type AS ENUM ('order_status', 'new_message', 'promo', 'system_alert', 'low_stock', 'payout_status', 'new_review');

-- Staff roles
CREATE TYPE staff_role AS ENUM ('manager', 'delivery_driver', 'service_technician', 'cashier');

-- Message types
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'location', 'order_update');

-- Conversation status
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'closed');

-- Wallet transaction types
CREATE TYPE wallet_transaction_type AS ENUM ('CREDIT', 'DEBIT');

-- Related entity types
CREATE TYPE related_entity_type AS ENUM ('order', 'deposit', 'refund', 'service_request', 'loyalty_redemption');

-- AI content types  
CREATE TYPE ai_content_type AS ENUM ('PROMOTIONAL_CAPTION', 'OFFER_HEADLINE', 'PRODUCT_DESCRIPTION', 'RESPONSE_TEMPLATE', 'REMINDER_MESSAGE', 'PERFORMANCE_SUMMARY', 'CHAT_RESPONSE');

-- AI tones
CREATE TYPE ai_tone AS ENUM ('FESTIVE', 'FORMAL', 'CASUAL', 'URGENT', 'EMPATHETIC', 'PROFESSIONAL', 'CONVERSATIONAL');

-- AI platforms
CREATE TYPE ai_platform AS ENUM ('INSTAGRAM', 'WHATSAPP', 'FACEBOOK', 'WEBSITE', 'EMAIL', 'SMS', 'IN_APP_CHAT', 'OTHER');

-- Pricing models
CREATE TYPE pricing_model AS ENUM ('fixed', 'per_hour', 'per_visit_callout_fee', 'quote_required');

-- Delivery options
CREATE TYPE delivery_option AS ENUM ('delivery', 'pickup', 'dine_in');

-- ============================================================================
-- 3. CORE TABLES
-- ============================================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  user_type user_type NOT NULL DEFAULT 'customer',
  fcm_token TEXT,
  locale app_language DEFAULT 'en',
  profile_picture_url TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  loyalty_points INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product categories
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon_url TEXT,
  description TEXT,
  interaction_type business_interaction_type NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  parent_category_id UUID REFERENCES product_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business profiles
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),
  contact_phone TEXT NOT NULL,
  business_type business_interaction_type NOT NULL,
  specialized_categories TEXT[] DEFAULT '{}',
  operating_hours JSONB,
  logo_url TEXT,
  banner_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  status business_status DEFAULT 'pending_approval',
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  bank_account_info_encrypted TEXT,
  payout_enabled BOOLEAN DEFAULT FALSE,
  delivery_radius_km DECIMAL(5,2),
  service_area_polygon GEOGRAPHY,
  min_order_value DECIMAL(8,2),
  delivery_charge DECIMAL(6,2),
  gstin TEXT,
  business_license_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff members
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  roles staff_role[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  current_location GEOGRAPHY(POINT, 4326),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'on_task', 'on_break')),
  hourly_rate DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, profile_id)
);

-- Products
CREATE TABLE shop_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',
  price DECIMAL(8,2) NOT NULL,
  discount_price DECIMAL(8,2),
  stock_quantity INTEGER,
  unit TEXT NOT NULL DEFAULT 'piece',
  is_available BOOLEAN DEFAULT TRUE,
  category_id UUID REFERENCES product_categories(id),
  variant_options JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE shop_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',
  base_price DECIMAL(8,2),
  estimated_time_mins INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  category_id UUID REFERENCES product_categories(id),
  pricing_model pricing_model DEFAULT 'fixed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_charge DECIMAL(6,2) DEFAULT 0.00,
  platform_commission_amount DECIMAL(8,2) DEFAULT 0.00,
  order_status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method,
  delivery_option delivery_option NOT NULL,
  delivery_address JSONB NOT NULL,
  customer_notes TEXT,
  pickup_time_slot TEXT,
  delivery_eta TIMESTAMPTZ,
  assigned_staff_id UUID REFERENCES staff_members(id),
  current_staff_location GEOGRAPHY(POINT, 4326),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES shop_products(id),
  service_id UUID REFERENCES shop_services(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_order DECIMAL(8,2) NOT NULL,
  variant_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((product_id IS NOT NULL AND service_id IS NULL) OR (product_id IS NULL AND service_id IS NOT NULL))
);

-- Service requests
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  service_id UUID REFERENCES shop_services(id),
  service_details_snapshot JSONB,
  problem_description TEXT,
  photos_urls TEXT[] DEFAULT '{}',
  videos_urls TEXT[] DEFAULT '{}',
  service_address JSONB NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT,
  request_status service_request_status DEFAULT 'pending',
  quoted_price DECIMAL(8,2),
  actual_charge DECIMAL(8,2),
  assigned_staff_id UUID REFERENCES staff_members(id),
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  inquiry_type TEXT NOT NULL,
  details TEXT,
  attachments_urls TEXT[] DEFAULT '{}',
  budget_range TEXT,
  preferred_contact_method TEXT,
  preferred_contact_time TEXT,
  inquiry_status inquiry_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  subject TEXT,
  status conversation_status DEFAULT 'active',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, business_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  attachments TEXT[] DEFAULT '{}',
  order_id UUID REFERENCES orders(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  service_request_id UUID REFERENCES service_requests(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID REFERENCES business_profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  provider TEXT NOT NULL,
  method TEXT NOT NULL,
  status payment_status DEFAULT 'pending',
  gateway_reference_id TEXT,
  webhook_payload JSONB,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((order_id IS NOT NULL AND service_request_id IS NULL) OR (order_id IS NULL AND service_request_id IS NOT NULL))
);

-- Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  gateway_reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type wallet_transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  related_entity_type related_entity_type,
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  order_id UUID REFERENCES orders(id),
  service_request_id UUID REFERENCES service_requests(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_profile_id UUID NOT NULL REFERENCES profiles(id),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI saved content
CREATE TABLE ai_saved_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  content_type ai_content_type NOT NULL,
  platform ai_platform NOT NULL,
  tone ai_tone NOT NULL,
  language app_language DEFAULT 'en',
  generated_text TEXT NOT NULL,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Location-based indexes
CREATE INDEX idx_business_profiles_location ON business_profiles USING GIST (location);
CREATE INDEX idx_service_requests_location ON service_requests USING GIST (location);
CREATE INDEX idx_staff_members_location ON staff_members USING GIST (current_location);

-- Frequently queried indexes
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_business_profiles_owner_id ON business_profiles(owner_id);
CREATE INDEX idx_business_profiles_status ON business_profiles(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX idx_service_requests_business_id ON service_requests(business_id);
CREATE INDEX idx_service_requests_status ON service_requests(request_status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_profile_id, is_read);
CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_shop_products_business_id ON shop_products(business_id);
CREATE INDEX idx_shop_services_business_id ON shop_services(business_id);

-- Full-text search indexes
CREATE INDEX idx_business_profiles_search ON business_profiles USING GIN (to_tsvector('english', business_name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_shop_products_search ON shop_products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_shop_services_search ON shop_services USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- 5. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_products_updated_at BEFORE UPDATE ON shop_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_services_updated_at BEFORE UPDATE ON shop_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update location geography from lat/lng
CREATE OR REPLACE FUNCTION update_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_location BEFORE INSERT OR UPDATE ON business_profiles FOR EACH ROW EXECUTE FUNCTION update_location_from_coordinates();
CREATE TRIGGER update_service_request_location BEFORE INSERT OR UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_location_from_coordinates();

-- Trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_trigger AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Trigger to update business rating
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*) INTO avg_rating, review_count
  FROM reviews 
  WHERE business_id = COALESCE(NEW.business_id, OLD.business_id);
  
  UPDATE business_profiles 
  SET avg_rating = COALESCE(avg_rating, 0.00), 
      total_reviews = review_count,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_rating_trigger AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_saved_content ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable by business owners" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE owner_id = auth.uid())
);

-- Business profiles policies
CREATE POLICY "Anyone can view active businesses" ON business_profiles FOR SELECT USING (status = 'active');
CREATE POLICY "Business owners can manage their business" ON business_profiles FOR ALL USING (owner_id = auth.uid());

-- Staff members policies
CREATE POLICY "Business owners can manage staff" ON staff_members FOR ALL USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Staff can view own record" ON staff_members FOR SELECT USING (profile_id = auth.uid());

-- Products policies
CREATE POLICY "Anyone can view available products" ON shop_products FOR SELECT USING (is_available = true);
CREATE POLICY "Business owners can manage products" ON shop_products FOR ALL USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);

-- Services policies
CREATE POLICY "Anyone can view available services" ON shop_services FOR SELECT USING (is_available = true);
CREATE POLICY "Business owners can manage services" ON shop_services FOR ALL USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);

-- Orders policies
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Business owners can view business orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Customers can create orders" ON orders FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Business owners can update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);

-- Order items policies
CREATE POLICY "Order items visible to order participants" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_id 
    AND (o.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM business_profiles bp WHERE bp.id = o.business_id AND bp.owner_id = auth.uid()
    ))
  )
);

-- Service requests policies
CREATE POLICY "Customers can view own service requests" ON service_requests FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Business owners can view business service requests" ON service_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Customers can create service requests" ON service_requests FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Business owners can update service requests" ON service_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (
  customer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid()
  )
);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Business owners can view business payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT TO authenticated;
CREATE POLICY "Customers can create reviews" ON reviews FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers can update own reviews" ON reviews FOR UPDATE USING (customer_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (recipient_profile_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (recipient_profile_id = auth.uid());

-- Wallet transactions policies
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions FOR SELECT USING (user_id = auth.uid());

-- AI saved content policies
CREATE POLICY "Business owners can manage AI content" ON ai_saved_content FOR ALL USING (
  EXISTS (SELECT 1 FROM business_profiles WHERE id = business_id AND owner_id = auth.uid())
);

-- ============================================================================
-- 7. USEFUL FUNCTIONS
-- ============================================================================

-- Function to get nearby businesses
CREATE OR REPLACE FUNCTION get_nearby_businesses(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km DECIMAL DEFAULT 10,
  business_type_filter business_interaction_type DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  distance_km DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  avg_rating DECIMAL,
  total_reviews INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.business_name,
    ROUND((ST_Distance(bp.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)) / 1000)::DECIMAL, 2) as distance_km,
    bp.latitude,
    bp.longitude,
    bp.avg_rating,
    bp.total_reviews
  FROM business_profiles bp
  WHERE bp.status = 'active'
    AND ST_DWithin(bp.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326), radius_km * 1000)
    AND (business_type_filter IS NULL OR bp.business_type = business_type_filter)
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search businesses by text
CREATE OR REPLACE FUNCTION search_businesses(search_term TEXT)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  description TEXT,
  avg_rating DECIMAL,
  total_reviews INTEGER,
  city TEXT,
  state TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.business_name,
    bp.description,
    bp.avg_rating,
    bp.total_reviews,
    bp.city,
    bp.state
  FROM business_profiles bp
  WHERE bp.status = 'active'
    AND (
      to_tsvector('english', bp.business_name || ' ' || COALESCE(bp.description, '')) 
      @@ plainto_tsquery('english', search_term)
      OR bp.business_name ILIKE '%' || search_term || '%'
    )
  ORDER BY bp.avg_rating DESC, bp.total_reviews DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate order total with delivery
CREATE OR REPLACE FUNCTION calculate_order_total(order_id_param UUID)
RETURNS TABLE (
  subtotal DECIMAL,
  delivery_charge DECIMAL,
  platform_commission DECIMAL,
  total DECIMAL
) AS $$
DECLARE
  order_record orders%ROWTYPE;
  items_total DECIMAL;
BEGIN
  SELECT * INTO order_record FROM orders WHERE id = order_id_param;
  
  SELECT COALESCE(SUM(price_at_order * quantity), 0) INTO items_total
  FROM order_items WHERE order_id = order_id_param;
  
  RETURN QUERY
  SELECT 
    items_total as subtotal,
    order_record.delivery_charge,
    order_record.platform_commission_amount as platform_commission,
    items_total + order_record.delivery_charge as total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample product categories
INSERT INTO product_categories (name, interaction_type, description) VALUES
('Food & Beverages', 'type_a', 'Restaurant and food delivery'),
('Home Services', 'type_b', 'Cleaning, repair, and maintenance'),
('Health & Beauty', 'type_c', 'Salon, spa, and wellness services'),
('Retail', 'type_a', 'Shopping and retail goods'),
('Professional Services', 'type_b', 'Legal, accounting, consulting');

-- The profiles will be created automatically when users sign up through auth
-- Business profiles, products, services, and other data will be created by users

-- ============================================================================
-- 9. REAL-TIME SUBSCRIPTIONS
-- ============================================================================

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;

-- ============================================================================
-- 10. STORAGE POLICIES
-- ============================================================================

-- Bucket policies for file uploads (run these in Supabase dashboard)
-- These are comments for manual setup:

-- Create buckets:
-- - business-logos
-- - business-banners  
-- - product-images
-- - service-images
-- - user-avatars
-- - message-attachments
-- - review-media

-- Sample storage policies:
-- CREATE POLICY "Business owners can upload logos" ON storage.objects FOR INSERT 
-- WITH CHECK (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view business logos" ON storage.objects FOR SELECT 
-- USING (bucket_id = 'business-logos');

-- Repeat similar patterns for other buckets

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- This completes the comprehensive database schema for TownTap.
-- To apply this schema:
-- 1. Run this script in your Supabase SQL editor
-- 2. Set up storage buckets and policies in the Supabase dashboard
-- 3. Configure real-time subscriptions as needed
-- 4. Test with sample data