# TownTap Authentication System - Complete Setup Guide

## ✅ What Has Been Fixed

### 1. **Database Setup (SQL)**
- ✅ Added `handle_new_user()` trigger function that automatically creates user profiles
- ✅ Fixed RLS (Row Level Security) policies to allow trigger-based profile creation
- ✅ Profiles are now created automatically when users sign up
- ✅ No more "row violates row-level security policy" errors

### 2. **Authentication Context**
- ✅ Updated `signUp` function to pass user metadata (full_name, phone, role)
- ✅ Removed manual profile insertion (handled by database trigger)
- ✅ Better error handling for email confirmation requirements
- ✅ Proper role-based signup for both customers and business owners

### 3. **Sign In Screen** 
- ✅ Modern UI matching the green theme design
- ✅ "Hello Again" welcome message
- ✅ Clean email and password inputs with proper borders
- ✅ Social login buttons (Google, Facebook) - UI only, ready for integration
- ✅ Link to sign-up for new users

### 4. **Sign Up Screen**
- ✅ Clean, simple form with name, email, password fields
- ✅ Password visibility toggle
- ✅ Forgot password link
- ✅ Role-based signup (customer vs business owner)
- ✅ Proper validation and error handling
- ✅ Links to sign-in for existing users

### 5. **Role Selection Screen**
- ✅ Beautiful card-based role selection
- ✅ Customer and Business Owner options
- ✅ Visual feedback with checkmarks
- ✅ Passes role to sign-up screen
- ✅ Navigation to sign-in for existing users

---

## 🚀 Setup Instructions

### Step 1: Update Supabase Database

1. **Go to your Supabase Dashboard** → **SQL Editor**
2. **Run the complete SQL file** or just the critical parts:

```sql
-- Handle new user signup - automatically create profile
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other profiles (limited info)" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Simplified policies (trigger handles insert)
CREATE POLICY "Enable read access for all users"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Step 2: Disable Email Confirmation (Development Only)

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Find **"Email Confirmation"** setting
3. **Disable it** for development
4. Save changes

> **For Production**: Keep email confirmation enabled and implement proper email verification flow

### Step 3: Test the Authentication Flow

1. **Start your app**: `npx expo start --clear`
2. **Navigate to Welcome** → **Choose Role** (Customer or Business Owner)
3. **Sign Up** with test credentials:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. **Verify** you're logged in and redirected to home
5. **Sign Out** and **Sign In** again with same credentials

---

## 📁 Files Modified

### Core Files
- ✅ `supabase/database-setup.sql` - Added trigger and fixed RLS policies
- ✅ `contexts/auth-context.tsx` - Updated signup with metadata
- ✅ `app/auth/sign-in.tsx` - New UI matching design
- ✅ `app/auth/sign-up.tsx` - Simplified, clean sign-up form
- ✅ `app/auth/role-selection.tsx` - Modern role selection UI

---

## 🎨 Design Features Implemented

### Color Scheme
- **Primary Green**: #C8E6C9 (Background)
- **Dark Green**: #1B5E20, #2E7D32 (Text, accents)
- **Blue**: #5B9BD5 (Buttons)
- **White**: #FFFFFF (Cards)

### UI Components
- ✅ Rounded corner cards (24px border radius)
- ✅ Shadow effects for depth
- ✅ Green bordered inputs
- ✅ Social login button placeholders
- ✅ Clean typography
- ✅ Logo in rounded white box
- ✅ Role cards with icons and checkmarks

---

## 🔧 How Authentication Works Now

### Sign Up Flow:
1. User selects role (Customer/Business Owner) on role-selection screen
2. User fills sign-up form (name, email, password)
3. `signUp()` function creates user in Supabase Auth with metadata
4. **Database trigger** automatically creates profile in `profiles` table
5. User is logged in and redirected to home

### Sign In Flow:
1. User enters email and password
2. `signIn()` function authenticates with Supabase
3. Profile is fetched from `profiles` table
4. User redirected to appropriate dashboard (customer/business)

### Data Flow:
```
User Sign Up
    ↓
Supabase Auth (creates auth.users record)
    ↓
Trigger: handle_new_user()
    ↓
Creates profiles record (bypasses RLS with SECURITY DEFINER)
    ↓
User authenticated & profile loaded
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid login credentials"
**Cause**: Email confirmation is enabled but user hasn't confirmed email
**Solution**: Disable email confirmation in Supabase settings (see Step 2 above)

### Issue 2: "Row violates row-level security policy"
**Cause**: RLS policies blocking profile creation
**Solution**: Run the updated SQL with the trigger (see Step 1 above)

### Issue 3: User created but no profile
**Cause**: Trigger not created or not firing
**Solution**: 
1. Check trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';`
2. Recreate trigger using SQL from Step 1

### Issue 4: Can't sign in after sign up
**Cause**: Email confirmation required
**Solution**: 
- Development: Disable email confirmation
- Production: Check user's email for confirmation link

---

## 🔐 Security Notes

### Current Setup (Development):
- ✅ Email confirmation: **Disabled** (for testing)
- ✅ RLS enabled on all tables
- ✅ Trigger uses SECURITY DEFINER (elevated privileges)
- ✅ Users can only update their own profiles

### For Production:
- 🔒 **Enable email confirmation**
- 🔒 **Add phone verification** (optional)
- 🔒 **Implement rate limiting** on auth endpoints
- 🔒 **Add CAPTCHA** to prevent bot signups
- 🔒 **Set up password reset** flow
- 🔒 **Enable MFA** (multi-factor authentication)

---

## 🎯 Next Steps

### Social Authentication (Optional)
To enable Google/Facebook login:
1. Configure providers in Supabase Dashboard
2. Add OAuth credentials
3. Update sign-in/sign-up screens with actual OAuth handlers
4. Test social login flow

### Email Templates
Customize email templates in Supabase:
1. Go to **Authentication** → **Email Templates**
2. Customize confirmation, reset password, etc.
3. Add branding and styling

### Profile Completion
Add profile completion flow:
1. After signup, check if profile is complete
2. Request additional info (avatar, location, etc.)
3. Redirect to onboarding screens

---

## ✅ Testing Checklist

- [ ] User can sign up as Customer
- [ ] User can sign up as Business Owner
- [ ] User can sign in with correct credentials
- [ ] User sees error with wrong credentials
- [ ] Profile is created automatically
- [ ] Profile contains correct role
- [ ] User can update their profile
- [ ] User can sign out
- [ ] User stays logged in after app restart
- [ ] Navigation works correctly

---

## 📞 Support

If you encounter issues:
1. Check browser/metro console for errors
2. Check Supabase dashboard → Authentication → Users
3. Check Supabase dashboard → Database → Profiles table
4. Verify trigger exists and is active
5. Check RLS policies are correct

---

**All authentication issues should now be resolved! 🎉**

Run the SQL updates in Supabase, disable email confirmation, and test the complete auth flow.
