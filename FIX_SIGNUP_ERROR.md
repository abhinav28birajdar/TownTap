# 🔧 URGENT: Fix Profile Insert Policy

## Problem
Error: `new row violates row-level security policy for table "profiles"`

**Cause:** The profiles table is missing an INSERT policy, so users cannot create their profile during signup.

---

## ✅ Solution: Add INSERT Policy to Supabase

### Option 1: Quick Fix (Recommended)

1. **Open Supabase Dashboard:**
   - Go to: https://app.supabase.com/project/ymcscvhfwnpiqjsszhsa/editor

2. **Open SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run this SQL:**
   ```sql
   -- Add missing INSERT policy for profiles
   CREATE POLICY "Users can insert their own profile"
     ON profiles FOR INSERT
     WITH CHECK (auth.uid() = id);
   ```

4. **Click "Run" button**

5. **Verify it worked:**
   ```sql
   -- Check all policies on profiles table
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

   You should see 4 policies now:
   - ✅ Users can insert their own profile (INSERT)
   - ✅ Users can view their own profile (SELECT)
   - ✅ Users can update their own profile (UPDATE)
   - ✅ Users can view other profiles (SELECT)

---

### Option 2: Run the Fix Script

1. **Go to Supabase SQL Editor**

2. **Copy and paste** the entire content from:
   `supabase/fix-profile-policy.sql`

3. **Click Run**

---

## 🧪 Test the Fix

After applying the fix, try signing up again in your app:

1. Clear app cache: Press `r` in Metro terminal
2. Try signing up with a new email
3. ✅ It should work now!

---

## 📋 What This Policy Does

```sql
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Explanation:**
- `FOR INSERT` - Applies to new row insertions
- `WITH CHECK (auth.uid() = id)` - Only allows users to insert a profile where the profile ID matches their authenticated user ID
- This prevents users from creating profiles for other users
- This is required for the signup flow to work

---

## 🔒 Security Note

This policy is **secure** because:
- Users can only insert profiles for themselves (`auth.uid() = id`)
- The `id` comes from Supabase Auth (can't be faked)
- Users cannot create profiles for other users
- Row Level Security is still enforced

---

## ⚠️ Common Issues

### "Policy already exists"
If you get this error, run this first:
```sql
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
```

Then run the CREATE POLICY statement again.

### Still getting errors?
Check if RLS is enabled:
```sql
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'profiles';
```

Should return: `relrowsecurity = true`

If false, enable it:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## ✅ After the Fix

Your signup flow will work:
1. User signs up with email/password
2. Supabase Auth creates user account
3. App creates profile in profiles table ← **This will now work!**
4. User is redirected to home screen

---

**Run the SQL fix now and your signup will work immediately!** 🚀
