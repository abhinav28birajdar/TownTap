-- =====================================================
-- TOWNTAP - SINGLE DATABASE SETUP
-- Complete database schema for TownTap React Native App
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_type TEXT DEFAULT 'customer' CHECK (user_type IN ('customer', 'business_owner', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business categories
CREATE TABLE public.business_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.business_categories(id),
    business_type TEXT DEFAULT 'type_a' CHECK (business_type IN ('type_a', 'type_b', 'type_c')),
    
    -- Contact information
    email TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    website_url TEXT,
    
    -- Location data
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT 'Madhya Pradesh',
    pincode TEXT,
    landmark TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    
    -- Business details
    opening_hours JSONB,
    is_open BOOLEAN DEFAULT true,
    delivery_available BOOLEAN DEFAULT false,
    pickup_available BOOLEAN DEFAULT true,
    
    -- Media
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_images TEXT[],
    
    -- Ratings and reviews
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products/Services table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT,
    subcategory TEXT,
    
    -- Media
    image_url TEXT,
    images TEXT[],
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER,
    
    -- Product details
    unit TEXT DEFAULT 'piece',
    weight DECIMAL(8,2),
    dimensions JSONB,
    variants JSONB,
    
    -- SEO and tags
    tags TEXT[],
    sku TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id),
    business_id UUID REFERENCES public.businesses(id),
    order_number TEXT UNIQUE NOT NULL,
    
    -- Order details
    order_type TEXT DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup', 'service')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled')),
    
    -- Financial details
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Delivery details
    delivery_address JSONB,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    
    -- Additional details
    special_instructions TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    product_name TEXT NOT NULL, -- Store product name at time of order
    product_details JSONB, -- Store product details at time of order
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id),
    business_id UUID REFERENCES public.businesses(id),
    order_id UUID REFERENCES public.orders(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    images TEXT[],
    
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default business categories
INSERT INTO public.business_categories (name, description, icon) VALUES
('Restaurant', 'Food and dining services', '🍽️'),
('Grocery', 'Grocery stores and markets', '🛒'),
('Pharmacy', 'Medical and health services', '💊'),
('Electronics', 'Electronics and gadgets', '📱'),
('Clothing', 'Fashion and apparel', '👕'),
('Services', 'Professional services', '⚙️'),
('Beauty', 'Beauty and wellness', '💄'),
('Education', 'Educational services', '📚'),
('Automotive', 'Vehicle services', '🚗'),
('Home & Garden', 'Home improvement and gardening', '🏠');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'TT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby businesses
CREATE OR REPLACE FUNCTION public.get_nearby_businesses(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    description TEXT,
    category TEXT,
    business_type TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    rating DECIMAL,
    review_count INTEGER,
    is_open BOOLEAN,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.business_name,
        b.description,
        COALESCE(bc.name, 'Unknown') as category,
        b.business_type,
        b.address,
        b.city,
        b.phone,
        b.email,
        b.rating,
        b.review_count,
        b.is_open,
        b.latitude,
        b.longitude,
        ROUND(
            ST_Distance(
                ST_Point(user_lng, user_lat)::geography,
                ST_Point(b.longitude, b.latitude)::geography
            ) / 1000, 2
        ) as distance_km
    FROM public.businesses b
    LEFT JOIN public.business_categories bc ON b.category_id = bc.id
    WHERE 
        b.is_active = true
        AND b.latitude IS NOT NULL 
        AND b.longitude IS NOT NULL
        AND ST_DWithin(
            ST_Point(user_lng, user_lat)::geography,
            ST_Point(b.longitude, b.latitude)::geography,
            radius_km * 1000
        )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to update business location
CREATE OR REPLACE FUNCTION public.update_business_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_Point(NEW.longitude, NEW.latitude);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate order numbers (using a proper trigger function)
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_number();

-- Update business location
CREATE TRIGGER update_business_location_trigger
    BEFORE INSERT OR UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.update_business_location();

-- =====================================================
-- INDEXES
-- =====================================================

-- Geographic indexes
CREATE INDEX IF NOT EXISTS idx_businesses_location ON public.businesses USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_businesses_lat_lng ON public.businesses (latitude, longitude);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_businesses_active ON public.businesses (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses (category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses (owner_id);
CREATE INDEX IF NOT EXISTS idx_products_business ON public.products (business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders (business_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews (business_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Anyone can view active businesses" ON public.businesses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage own business" ON public.businesses
    FOR ALL USING (auth.uid() = owner_id);

-- Products policies
CREATE POLICY "Anyone can view available products" ON public.products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Business owners can manage own products" ON public.products
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Business owners can update orders" ON public.orders
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        )
    );

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON public.order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM public.orders 
            WHERE customer_id = auth.uid() OR 
            business_id IN (
                SELECT id FROM public.businesses WHERE owner_id = auth.uid()
            )
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample businesses in Bhopal
INSERT INTO public.businesses (
    business_name,
    description,
    category_id,
    business_type,
    email,
    phone,
    address,
    city,
    pincode,
    latitude,
    longitude,
    is_active,
    is_verified,
    rating
) VALUES
('Bhopal Sweets Center', 'Traditional sweets and snacks', 
 (SELECT id FROM public.business_categories WHERE name = 'Restaurant'), 
 'type_a', 'contact@bhopalsweets.com', '+91-9876543210',
 'MP Nagar Zone 1, Bhopal', 'Bhopal', '462011', 23.2599, 77.4126, true, true, 4.5),

('City Medical Store', 'Complete pharmacy and medical supplies',
 (SELECT id FROM public.business_categories WHERE name = 'Pharmacy'),
 'type_a', 'info@citymedical.com', '+91-9876543211', 
 'New Market, Bhopal', 'Bhopal', '462001', 23.2599, 77.4126, true, true, 4.2),

('Tech World Electronics', 'Latest electronics and gadgets',
 (SELECT id FROM public.business_categories WHERE name = 'Electronics'),
 'type_a', 'sales@techworld.com', '+91-9876543212',
 'DB City Mall, Bhopal', 'Bhopal', '462023', 23.2599, 77.4126, true, true, 4.3),

('Fresh Grocery Mart', 'Fresh vegetables, fruits and daily essentials',
 (SELECT id FROM public.business_categories WHERE name = 'Grocery'),
 'type_a', 'orders@freshmart.com', '+91-9876543213',
 'Arera Colony, Bhopal', 'Bhopal', '462016', 23.2599, 77.4126, true, true, 4.1),

('Style Studio', 'Fashion clothing and accessories',
 (SELECT id FROM public.business_categories WHERE name = 'Clothing'),
 'type_a', 'hello@stylestudio.com', '+91-9876543214',
 'Bittan Market, Bhopal', 'Bhopal', '462001', 23.2599, 77.4126, true, true, 4.4);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'TownTap database setup completed successfully!';
    RAISE NOTICE 'Sample businesses added for Bhopal';
    RAISE NOTICE 'Geographic search functions are ready';
    RAISE NOTICE 'Realtime subscriptions enabled';
END $$;
