-- Quick Database Update Script for TownTap
-- Run this in Supabase SQL Editor to fix current issues

-- Add missing columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[];

-- Create get_nearby_businesses function
CREATE OR REPLACE FUNCTION get_nearby_businesses(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km DECIMAL DEFAULT 10,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    business_name TEXT,
    description TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    rating DECIMAL,
    total_reviews INTEGER,
    is_open BOOLEAN,
    delivery_available BOOLEAN,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km DECIMAL,
    image_url TEXT,
    logo_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.business_name,
        b.description,
        COALESCE(bc.name, b.category) as category,
        b.address,
        b.city,
        COALESCE(b.phone_number, b.phone) as phone,
        b.email,
        b.rating,
        b.total_reviews,
        b.is_open,
        b.delivery_available,
        b.latitude,
        b.longitude,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            b.location
        ) / 1000 as distance_km,
        b.image_url,
        b.logo_url
    FROM public.businesses b
    LEFT JOIN public.business_categories bc ON b.category_id = bc.id
    WHERE 
        b.is_active = true
        AND b.latitude IS NOT NULL 
        AND b.longitude IS NOT NULL
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            b.location,
            radius_km * 1000
        )
        AND (category_filter IS NULL OR bc.name ILIKE '%' || category_filter || '%' OR b.category ILIKE '%' || category_filter || '%')
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for business creation
CREATE POLICY "Authenticated users can create businesses" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Enable realtime for businesses
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
