-- TownTap Real-Time Application Database Schema
-- This script creates all tables and triggers for real-time functionality

-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ==============================================
-- USER PROFILES AND AUTHENTICATION TABLES
-- ==============================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    user_type TEXT CHECK (user_type IN ('customer', 'business_owner')) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business categories table (must be created before businesses table)
CREATE TABLE public.business_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.business_categories(id),
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_open BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    delivery_radius INTEGER DEFAULT 5, -- in kilometers
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_time INTEGER DEFAULT 30, -- in minutes
    profile_image_url TEXT,
    cover_image_url TEXT,
    business_hours JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer addresses table
CREATE TABLE public.customer_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Home, Work, etc.
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PRODUCT AND CATEGORY TABLES
-- ==============================================

-- Product categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discounted_price DECIMAL(10, 2),
    sku TEXT,
    stock_quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER DEFAULT 10,
    unit TEXT DEFAULT 'piece', -- kg, piece, liter, etc.
    image_urls TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    nutritional_info JSONB DEFAULT '{}',
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    allergens TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 0, -- in minutes
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ORDER AND CART TABLES
-- ==============================================

-- Shopping cart table
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- Orders table
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    order_status TEXT CHECK (order_status IN (
        'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
    )) DEFAULT 'pending',
    payment_status TEXT CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded'
    )) DEFAULT 'pending',
    payment_method TEXT CHECK (payment_method IN (
        'cash', 'card', 'upi', 'wallet'
    )) DEFAULT 'cash',
    
    -- Pricing details
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Delivery details
    delivery_address JSONB NOT NULL,
    delivery_type TEXT CHECK (delivery_type IN ('delivery', 'pickup')) DEFAULT 'delivery',
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    
    -- Special instructions
    special_instructions TEXT,
    customer_notes TEXT,
    business_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    prepared_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Order items table
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- MESSAGING AND COMMUNICATION TABLES
-- ==============================================

-- Messages table for customer-business communication
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    message_type TEXT CHECK (message_type IN (
        'text', 'image', 'order_update', 'system'
    )) DEFAULT 'text',
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN (
        'order_update', 'new_message', 'promotion', 'system'
    )) NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ANALYTICS AND TRACKING TABLES
-- ==============================================

-- Order analytics for businesses
CREATE TABLE public.order_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    avg_order_value DECIMAL(10, 2) DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- Product analytics
CREATE TABLE public.product_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, date)
);

-- ==============================================
-- REVIEWS AND RATINGS TABLES
-- ==============================================

-- Reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    image_urls TEXT[] DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT false,
    business_reply TEXT,
    business_reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, order_id)
);

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'TT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-generate order number
CREATE TRIGGER generate_order_number_trigger 
    BEFORE INSERT ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_order_number();

-- Function to update business analytics on order changes
CREATE OR REPLACE FUNCTION update_business_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily analytics for the business
    INSERT INTO public.order_analytics (
        business_id, 
        date, 
        total_orders, 
        total_revenue
    )
    VALUES (
        NEW.business_id,
        CURRENT_DATE,
        1,
        NEW.total_amount
    )
    ON CONFLICT (business_id, date)
    DO UPDATE SET
        total_orders = order_analytics.total_orders + 1,
        total_revenue = order_analytics.total_revenue + NEW.total_amount;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for order analytics
CREATE TRIGGER update_business_analytics_trigger 
    AFTER INSERT ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_business_analytics();

-- Function to update business rating when review is added
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.businesses 
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
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
$$ language 'plpgsql';

-- Trigger for business rating updates
CREATE TRIGGER update_business_rating_trigger 
    AFTER INSERT OR UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_business_rating();

-- Function to get nearby businesses
CREATE OR REPLACE FUNCTION get_nearby_businesses(
    user_lat DECIMAL(10,8),
    user_lng DECIMAL(11,8),
    radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
    business_id UUID,
    business_name TEXT,
    distance_km DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        ROUND(
            (6371 * acos(
                cos(radians(user_lat)) * 
                cos(radians(b.latitude)) * 
                cos(radians(b.longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * 
                sin(radians(b.latitude))
            ))::DECIMAL(5,2), 2
        ) as distance
    FROM public.businesses b
    WHERE b.latitude IS NOT NULL 
      AND b.longitude IS NOT NULL
      AND b.is_open = true
    HAVING distance <= radius_km
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old cart items (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_cart_items()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.cart_items 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Business owners can manage their business" ON public.businesses FOR ALL USING (
    owner_id = auth.uid()
);
CREATE POLICY "Business owners can insert their business" ON public.businesses FOR INSERT WITH CHECK (
    owner_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'business_owner')
);

-- Business categories policies
CREATE POLICY "Anyone can view business categories" ON public.business_categories FOR SELECT TO authenticated USING (true);

-- Customer addresses policies
CREATE POLICY "Customers can manage own addresses" ON public.customer_addresses FOR ALL USING (customer_id = auth.uid());

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT TO authenticated USING (true);

-- Products policies
CREATE POLICY "Anyone can view available products" ON public.products FOR SELECT TO authenticated USING (is_available = true);
CREATE POLICY "Business owners can manage their products" ON public.products FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
);

-- Cart items policies
CREATE POLICY "Customers can manage own cart" ON public.cart_items FOR ALL USING (customer_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view related orders" ON public.orders FOR SELECT USING (
    customer_id = auth.uid() OR 
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Business owners can update order status" ON public.orders FOR UPDATE USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
);

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON public.order_items FOR SELECT USING (
    order_id IN (
        SELECT id FROM public.orders 
        WHERE customer_id = auth.uid() OR 
              business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    )
);

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Customers can create reviews for their orders" ON public.reviews FOR INSERT WITH CHECK (
    customer_id = auth.uid() AND 
    order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
);

-- ==============================================
-- REAL-TIME SUBSCRIPTIONS SETUP
-- ==============================================

-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;

-- ==============================================
-- SAMPLE DATA FOR TESTING
-- ==============================================

-- Insert sample categories
INSERT INTO public.categories (name, description, icon_url) VALUES
('Grocery', 'Fresh groceries and daily essentials', 'https://example.com/grocery-icon.png'),
('Restaurant', 'Food delivery from restaurants', 'https://example.com/restaurant-icon.png'),
('Pharmacy', 'Medicines and health products', 'https://example.com/pharmacy-icon.png'),
('Electronics', 'Electronics and gadgets', 'https://example.com/electronics-icon.png'),
('Stationary', 'Books, pens, and office supplies', 'https://example.com/stationary-icon.png');

-- Insert sample business categories
INSERT INTO public.business_categories (name, icon, description) VALUES
('Stationary', '📝', 'Stationery shops, office supplies, books'),
('Salon & Beauty', '💇', 'Hair salons, beauty parlors, spas'),
('Bookstore', '📚', 'Book shops, libraries, educational materials'),
('Carpenter', '🔨', 'Furniture making, wood work, repairs'),
('Study Center', '🎓', 'Coaching centers, tuition classes, education'),
('Library', '📖', 'Public libraries, reading rooms'),
('Grocery', '🛒', 'Grocery stores, supermarkets, daily needs'),
('Restaurant', '🍽️', 'Restaurants, cafes, food outlets'),
('Medical', '⚕️', 'Hospitals, clinics, pharmacies'),
('Electronics', '📱', 'Mobile shops, computer stores, electronics');

-- Create indexes for better performance
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_business_id ON public.orders(business_id);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_messages_participants ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_messages_business_id ON public.messages(business_id);
CREATE INDEX idx_products_business_id ON public.products(business_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_businesses_category_id ON public.businesses(category_id);
CREATE INDEX idx_businesses_location ON public.businesses(latitude, longitude);
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_cart_items_customer ON public.cart_items(customer_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_reviews_business ON public.reviews(business_id);
CREATE INDEX idx_products_availability ON public.products(is_available, business_id);

-- Add comments to tables for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.businesses IS 'Business profiles and information';
COMMENT ON TABLE public.orders IS 'Customer orders with real-time status tracking';
COMMENT ON TABLE public.messages IS 'Real-time messaging between customers and businesses';
COMMENT ON TABLE public.notifications IS 'Push notifications for users';
COMMENT ON TABLE public.order_analytics IS 'Daily analytics for business insights';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'TownTap database schema created successfully with real-time support!' AS message;
