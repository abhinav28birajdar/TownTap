-- TownTap - SQL Deletion Operations
-- This file contains all deletion operations for the TownTap application

-- 1. Delete a specific user and cascade to related tables
DELETE FROM users 
WHERE id = :user_id;

-- 2. Delete a specific business and related data
DELETE FROM businesses 
WHERE id = :business_id;

-- 3. Delete all data for a specific user (including business, orders, etc.)
DELETE FROM users 
WHERE email = :user_email;

-- 4. Delete orders older than a specified date
DELETE FROM orders 
WHERE created_at < :cutoff_date;

-- 5. Delete products from a specific business
DELETE FROM products 
WHERE business_id = :business_id;

-- 6. Delete all reviews below a certain rating
DELETE FROM reviews 
WHERE rating < :min_rating;

-- 7. Delete inactive users (no activity in the last year)
DELETE FROM users 
WHERE last_active_at < CURRENT_DATE - INTERVAL '1 year';

-- 8. Delete all data related to a specific location
DELETE FROM businesses 
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
  :radius
);

-- 9. Delete expired promotional content
DELETE FROM promotions 
WHERE end_date < CURRENT_DATE;

-- 10. Full database reset (for development purposes only)
-- WARNING: This will delete all application data
-- DO NOT run in production without proper authorization
-- Uncomment to use:
/*
TRUNCATE TABLE users, businesses, products, orders, reviews, chats, 
  notifications, services, promotions, analytics RESTART IDENTITY CASCADE;
*/
