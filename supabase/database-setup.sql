-- TownTap Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update profiles table to use business_owner instead of business
ALTER TABLE profiles 
ALTER COLUMN user_type TYPE text;

-- Add constraint for user_type values
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('customer', 'business_owner', 'admin'));

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  icon_url text,
  description text,
  interaction_type text NOT NULL CHECK (interaction_type IN ('type_a', 'type_b', 'type_c')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  description text,
  address_line1 text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  contact_phone text NOT NULL,
  operating_hours jsonb,
  delivery_radius_km numeric(5,2),
  business_type text CHECK (business_type IN ('type_a', 'type_b', 'type_c')),
  specialized_categories text[],
  is_approved boolean DEFAULT false,
  status text DEFAULT 'pending',
  avg_rating numeric(3,2) DEFAULT 0.0,
  total_reviews integer DEFAULT 0,
  bank_account_info_encrypted text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_urls text[] DEFAULT '{}',
  price numeric(10,2) NOT NULL,
  discount_price numeric(10,2),
  stock_quantity integer DEFAULT 0,
  unit text DEFAULT 'piece',
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL,
  delivery_charge numeric(10,2) DEFAULT 0,
  platform_commission_amount numeric(10,2) DEFAULT 0,
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  delivery_option text DEFAULT 'delivery' CHECK (delivery_option IN ('delivery', 'pickup')),
  delivery_address_json jsonb,
  order_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  price_at_order numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create services table (for type_b businesses)
CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  base_price numeric(10,2),
  duration_minutes integer,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  problem_description text NOT NULL,
  preferred_date date,
  preferred_time_slot text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  estimated_cost numeric(10,2),
  final_cost numeric(10,2),
  service_address_json jsonb NOT NULL,
  photos text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create inquiries table (for type_c businesses)
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  response text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert sample categories
INSERT INTO categories (name, icon_url, description, interaction_type) VALUES
('Grocery Store', '🛒', 'Daily essentials, groceries, household items', 'type_a'),
('Restaurant', '🍽️', 'Food delivery, dining, catering', 'type_a'),
('Stationary', '📝', 'Books, pens, office supplies', 'type_a'),
('Electronics', '📱', 'Mobile phones, computers, gadgets', 'type_a'),
('Salon & Beauty', '💇', 'Hair styling, beauty treatments', 'type_b'),
('Plumber', '🔧', 'Plumbing services, repairs', 'type_b'),
('Electrician', '⚡', 'Electrical work, repairs', 'type_b'),
('House Cleaning', '🧹', 'Home cleaning services', 'type_b'),
('Doctor', '⚕️', 'Medical consultation, health advice', 'type_c'),
('Lawyer', '⚖️', 'Legal consultation, advice', 'type_c'),
('Financial Advisor', '💰', 'Investment advice, financial planning', 'type_c'),
('Real Estate', '🏠', 'Property consultation, buying/selling', 'type_c')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING gist (ll_to_earth(latitude, longitude));
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for businesses
CREATE POLICY "Businesses are viewable by everyone" ON businesses
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage their businesses" ON businesses
  FOR ALL USING (auth.uid() = owner_id);

-- Create RLS policies for products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage their products" ON products
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM businesses WHERE id = products.business_id
    )
  );

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() IN (
      SELECT owner_id FROM businesses WHERE id = orders.business_id
    )
  );

CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Business owners can update orders for their business" ON orders
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM businesses WHERE id = orders.business_id
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'TownTap database setup completed successfully!' as message;
