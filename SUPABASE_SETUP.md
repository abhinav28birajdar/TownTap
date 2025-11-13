# TownTap - Complete Supabase Setup Guide

## 🚀 Quick Start

This document contains all SQL scripts and configuration needed to set up the TownTap backend on Supabase.

## 📋 Table of Contents
1. [Database Schema](#database-schema)
2. [Row Level Security Policies](#row-level-security-policies)
3. [Indexes](#indexes)
4. [Functions & Triggers](#functions--triggers)
5. [Storage Buckets](#storage-buckets)
6. [Edge Functions](#edge-functions)
7. [Initial Data](#initial-data)

---

## Database Schema

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'business_owner', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses Table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  opening_hours JSONB,
  phone TEXT,
  avg_rating NUMERIC(2,1) DEFAULT 0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  total_reviews INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services Table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  duration_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id),
  business_id UUID REFERENCES businesses(id),
  service_id UUID REFERENCES services(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  scheduled_for TIMESTAMPTZ,
  price NUMERIC(10,2),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES profiles(id),
  business_id UUID REFERENCES businesses(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations Table (for real-time tracking)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  business_id UUID REFERENCES businesses(id),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed NUMERIC,
  accuracy NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  amount NUMERIC(10,2),
  provider TEXT,
  provider_payment_id TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Row Level Security Policies

Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Categories Policies (read-only for all)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Businesses Policies
CREATE POLICY "Verified businesses are viewable by everyone"
  ON businesses FOR SELECT
  USING (is_verified = true OR owner_id = auth.uid());

CREATE POLICY "Business owners can insert own business"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update own business"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id);

-- Services Policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Business owners can manage own services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = services.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Bookings Policies
CREATE POLICY "Users can view own bookings as customer"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Business owners can view bookings for their business"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = bookings.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Business owners can update bookings for their business"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = bookings.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.customer_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Locations Policies
CREATE POLICY "Locations for active bookings are viewable by customer"
  ON locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = locations.booking_id
      AND (bookings.customer_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM businesses
             WHERE businesses.id = bookings.business_id
             AND businesses.owner_id = auth.uid()
           ))
    )
  );

CREATE POLICY "Business owners can insert locations for their bookings"
  ON locations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = locations.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Transactions Policies
CREATE POLICY "Users can view transactions for their bookings"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = transactions.booking_id
      AND (bookings.customer_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM businesses
             WHERE businesses.id = bookings.business_id
             AND businesses.owner_id = auth.uid()
           ))
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Indexes

Create indexes for better query performance:

```sql
-- Businesses indexes
CREATE INDEX idx_businesses_category_id ON businesses(category_id);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_verified ON businesses(is_verified);
CREATE INDEX idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX idx_businesses_rating ON businesses(avg_rating DESC);

-- Services indexes
CREATE INDEX idx_services_business_id ON services(business_id);

-- Bookings indexes
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);

-- Locations indexes
CREATE INDEX idx_locations_booking_id ON locations(booking_id);
CREATE INDEX idx_locations_created_at ON locations(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

## Functions & Triggers

Create automated profile creation on signup:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to send notification on booking status change
CREATE OR REPLACE FUNCTION notify_on_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      NEW.customer_id,
      'Booking Status Updated',
      'Your booking status changed to ' || NEW.status,
      'booking_update',
      jsonb_build_object('booking_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_on_booking_status_change();
```

---

## Storage Buckets

Create storage buckets for user avatars and business images:

```sql
-- Create storage buckets (run in Supabase Storage dashboard or via API)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('business-images', 'business-images', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for business images
CREATE POLICY "Business images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-images');

CREATE POLICY "Business owners can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'business-images');
```

---

## Edge Functions

### Create Payment Intent (Stripe Integration)

Create a new Edge Function via Supabase CLI:

```bash
supabase functions new create-payment-intent
```

Then add this code to `supabase/functions/create-payment-intent/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  try {
    const { amount, bookingId } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        booking_id: bookingId,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

Deploy the Edge Function:

```bash
supabase functions deploy create-payment-intent --no-verify-jwt
```

---

## Initial Data

Insert sample categories:

```sql
INSERT INTO categories (name, slug, icon) VALUES
  ('Carpenter', 'carpenter', '🔨'),
  ('Plumber', 'plumber', '🔧'),
  ('Electrician', 'electrician', '⚡'),
  ('Gardener', 'gardener', '🌱'),
  ('Furniture', 'furniture', '🛋️'),
  ('Cleaning', 'cleaning', '✨'),
  ('Stationery', 'stationery', '📚'),
  ('Catering', 'catering', '🍽️'),
  ('Barber', 'barber', '✂️'),
  ('Machine Shop', 'machine-shop', '⚙️');
```

---

## Environment Variables

Add these to your Expo app's `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

Add these to your Supabase Edge Functions secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=your-stripe-secret-key
```

---

## Realtime Configuration

Enable Realtime for these tables in Supabase Dashboard:

1. Go to Database → Replication
2. Enable replication for:
   - `bookings`
   - `locations`
   - `notifications`

---

## Testing the Setup

Test the database with these queries:

```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test inserting a category
INSERT INTO categories (name, slug) 
VALUES ('Test Category', 'test-category');
```

---

## Next Steps

1. ✅ Run all SQL scripts in Supabase SQL Editor
2. ✅ Create storage buckets
3. ✅ Deploy Edge Functions
4. ✅ Add environment variables to your app
5. ✅ Enable Realtime replication
6. ✅ Test authentication flow
7. ✅ Test creating bookings and reviews

---

## Support

For issues, check:
- Supabase Logs in Dashboard
- Edge Function logs: `supabase functions logs create-payment-intent`
- React Native logs: `npx expo start`

---

## Production Checklist

Before going live:

- [ ] Review and test all RLS policies
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Add monitoring and alerts
- [ ] Test payment flow end-to-end
- [ ] Validate all user inputs
- [ ] Set up proper error handling
- [ ] Configure CORS for Edge Functions
- [ ] Add indexes for slow queries
- [ ] Test on both iOS and Android

---

**Last Updated:** November 2025  
**Version:** 1.0.0
