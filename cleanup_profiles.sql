-- Clean up duplicate profiles and fix database issues
-- Run this in your Supabase SQL editor

-- 1. Check for duplicate profiles
SELECT id, COUNT(*) as profile_count 
FROM public.profiles 
GROUP BY id 
HAVING COUNT(*) > 1;

-- 2. If duplicates exist, keep only the latest one (optional - be careful!)
/*
WITH ranked_profiles AS (
  SELECT id, created_at, 
         ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as rn
  FROM public.profiles
),
profiles_to_delete AS (
  SELECT id, created_at 
  FROM ranked_profiles 
  WHERE rn > 1
)
DELETE FROM public.profiles 
WHERE (id, created_at) IN (
  SELECT id, created_at FROM profiles_to_delete
);
*/

-- 3. Ensure the trigger function handles duplicates gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- Profile already exists, don't create another one
    RETURN NEW;
  END IF;
  
  -- Create new profile
  INSERT INTO public.profiles (id, full_name, user_type, email_verified, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NEW.phone
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists (race condition), do nothing
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add a unique constraint to prevent duplicates (if not already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_pkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- 5. Check auth.users and profiles alignment
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.full_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 6. Show any users without profiles
SELECT 'Users without profiles found:' as status, COUNT(*) as count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
