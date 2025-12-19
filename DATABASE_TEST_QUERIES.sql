-- ============================================
-- TOWNTAP - QUICK TEST QUERIES
-- ============================================
-- Run these queries after setup to verify everything works
-- Copy individual queries to Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VERIFY SETUP
-- ============================================

-- Check all tables exist (should return 18 tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check all enums exist (should return 5 enums)
SELECT typname as enum_name
FROM pg_type 
WHERE typtype = 'e' 
  AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;

-- Check RLS is enabled on all tables (should return 18 rows with rowsecurity = true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check triggers (should show multiple triggers)
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check indexes (should show many indexes)
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 2. CHECK SEED DATA
-- ============================================

-- View all categories (should return 8 categories)
SELECT * FROM categories ORDER BY display_order;

-- Count categories
SELECT COUNT(*) as total_categories FROM categories;

-- ============================================
-- 3. TEST SAMPLE DATA INSERTION
-- ============================================

-- Note: These are test queries. Actual user creation happens through Supabase Auth.
-- You can test with your actual signup, but here are manual test examples:

-- Check if any profiles exist
SELECT id, email, full_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if any businesses exist
SELECT 
  b.id,
  b.name,
  c.name as category,
  b.city,
  b.status,
  b.average_rating,
  b.total_reviews
FROM businesses b
LEFT JOIN categories c ON b.category_id = c.id
ORDER BY b.created_at DESC
LIMIT 10;

-- Check if any bookings exist
SELECT 
  b.id,
  b.booking_date,
  b.booking_time,
  b.status,
  b.total_amount
FROM bookings b
ORDER BY b.created_at DESC
LIMIT 10;

-- ============================================
-- 4. TEST QUERIES (Common App Operations)
-- ============================================

-- Find active businesses by category
SELECT 
  b.id,
  b.name,
  b.city,
  b.average_rating,
  b.total_reviews,
  c.name as category_name
FROM businesses b
JOIN categories c ON b.category_id = c.id
WHERE b.status = 'active'
  AND c.name = 'Plumbing'
ORDER BY b.average_rating DESC
LIMIT 20;

-- Get business with services
SELECT 
  b.name as business_name,
  s.name as service_name,
  s.price,
  s.duration_minutes
FROM businesses b
LEFT JOIN services s ON s.business_id = b.id
WHERE b.status = 'active'
  AND s.is_active = true
ORDER BY b.name, s.name;

-- Get user's recent bookings
-- (Replace 'user-uuid-here' with actual user ID from auth.users)
SELECT 
  b.booking_date,
  b.booking_time,
  b.status,
  b.total_amount,
  bus.name as business_name,
  s.name as service_name
FROM bookings b
JOIN businesses bus ON b.business_id = bus.id
LEFT JOIN services s ON b.service_id = s.id
-- WHERE b.customer_id = 'user-uuid-here' -- Uncomment and add actual UUID
ORDER BY b.booking_date DESC, b.booking_time DESC
LIMIT 10;

-- Get business ratings and reviews
SELECT 
  r.rating,
  r.comment,
  r.created_at,
  p.full_name as customer_name
FROM reviews r
JOIN profiles p ON r.customer_id = p.id
-- WHERE r.business_id = 'business-uuid-here' -- Uncomment and add actual UUID
ORDER BY r.created_at DESC
LIMIT 20;

-- Get unread notifications count per user
SELECT 
  user_id,
  COUNT(*) as unread_count
FROM notifications
WHERE is_read = false
GROUP BY user_id
ORDER BY unread_count DESC;

-- Get popular categories (by business count)
SELECT 
  c.name as category_name,
  COUNT(b.id) as business_count
FROM categories c
LEFT JOIN businesses b ON b.category_id = c.id AND b.status = 'active'
GROUP BY c.id, c.name
ORDER BY business_count DESC;

-- ============================================
-- 5. TEST PROXIMITY SEARCH (Location-based)
-- ============================================

-- Find businesses within 5km of a location
-- Replace lat/lng with actual coordinates (e.g., Mumbai: 19.0760, 72.8777)
SELECT 
  b.name,
  b.city,
  b.address,
  b.average_rating,
  earth_distance(
    ll_to_earth(b.latitude, b.longitude),
    ll_to_earth(19.0760, 72.8777)
  ) / 1000 as distance_km
FROM businesses b
WHERE b.status = 'active'
  AND b.latitude IS NOT NULL
  AND b.longitude IS NOT NULL
  AND earth_distance(
    ll_to_earth(b.latitude, b.longitude),
    ll_to_earth(19.0760, 72.8777)
  ) < 5000 -- 5km in meters
ORDER BY distance_km ASC
LIMIT 20;

-- ============================================
-- 6. PERFORMANCE CHECKS
-- ============================================

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage (run after app has been used for a while)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================
-- 7. DATA INTEGRITY CHECKS
-- ============================================

-- Check for orphaned records (bookings without valid business)
SELECT COUNT(*) as orphaned_bookings
FROM bookings b
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE id = b.business_id);

-- Check for orphaned records (services without valid business)
SELECT COUNT(*) as orphaned_services
FROM services s
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE id = s.business_id);

-- Check for businesses without owner
SELECT COUNT(*) as businesses_without_owner
FROM businesses b
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = b.owner_id);

-- Check for reviews without valid booking
SELECT COUNT(*) as reviews_without_booking
FROM reviews r
WHERE r.booking_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM bookings WHERE id = r.booking_id);

-- Verify rating calculations match
SELECT 
  b.id,
  b.name,
  b.average_rating as stored_rating,
  b.total_reviews as stored_count,
  COALESCE(AVG(r.rating), 0) as calculated_rating,
  COUNT(r.id) as calculated_count
FROM businesses b
LEFT JOIN reviews r ON r.business_id = b.id
GROUP BY b.id, b.name, b.average_rating, b.total_reviews
HAVING b.average_rating != COALESCE(AVG(r.rating), 0)
   OR b.total_reviews != COUNT(r.id);

-- ============================================
-- 8. SECURITY CHECKS (RLS Policies)
-- ============================================

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 9. REALTIME SUBSCRIPTION TEST
-- ============================================

-- Check which tables have replication enabled
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 10. CLEANUP QUERIES (Use Carefully!)
-- ============================================

-- Delete old notifications (older than 30 days)
-- DELETE FROM notifications 
-- WHERE created_at < NOW() - INTERVAL '30 days'
--   AND is_read = true;

-- Archive old completed bookings (optional - create archive table first)
-- INSERT INTO bookings_archive 
-- SELECT * FROM bookings 
-- WHERE status = 'completed' 
--   AND created_at < NOW() - INTERVAL '90 days';

-- Delete archived bookings (only after archiving!)
-- DELETE FROM bookings 
-- WHERE status = 'completed' 
--   AND created_at < NOW() - INTERVAL '90 days';

-- ============================================
-- SUCCESS!
-- ============================================
-- If all queries above run without errors, your database is working correctly!
-- 
-- Next Steps:
-- 1. Test user signup in your app
-- 2. Create a business listing
-- 3. Make a test booking
-- 4. Send a test message
-- 5. Monitor the queries in Supabase Dashboard → Logs
-- ============================================
