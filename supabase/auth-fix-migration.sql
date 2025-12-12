-- ============================================
-- TOWNTAP AUTHENTICATION FIX - MIGRATION
-- ============================================
-- Run this in Supabase SQL Editor to fix authentication issues
-- This adds automatic profile creation and fixes RLS policies
-- ============================================

-- 1. Create function to automatically create profiles on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it instead
    UPDATE public.profiles
    SET
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
      phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
      role = COALESCE(NEW.raw_user_meta_data->>'role', role::text)::user_role,
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger to fire on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Drop old RLS policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other profiles (limited info)" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- 4. Create new simplified RLS policies
-- Allow all users to read profiles (limited data exposure controlled by app)
CREATE POLICY "Enable read access for all users"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if trigger was created successfully
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- Check RLS policies on profiles table
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ AUTHENTICATION FIX COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '  ✅ Trigger function created';
  RAISE NOTICE '  ✅ Automatic profile creation enabled';
  RAISE NOTICE '  ✅ RLS policies updated';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Disable email confirmation (Development only)';
  RAISE NOTICE '     Authentication > Settings > Confirm email: OFF';
  RAISE NOTICE '  2. Test signup with a new user';
  RAISE NOTICE '  3. Verify profile is created automatically';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
