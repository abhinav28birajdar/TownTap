# 🚀 TownTap Quick Start Guide

Follow these steps to get TownTap running on your machine in **under 15 minutes**.

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **npm** or **yarn** package manager
- [ ] **Expo CLI** (`npm install -g expo-cli`)
- [ ] **iOS Simulator** (Mac only) or **Android Emulator** installed
- [ ] **Supabase Account** ([Sign up free](https://supabase.com/))
- [ ] **Google Maps API Key** ([Get one here](https://console.cloud.google.com/))
- [ ] **Stripe Account** (optional, for payments) ([Sign up](https://stripe.com/))

---

## 📦 Step 1: Install Dependencies (2 minutes)

Open terminal in project directory:

```bash
cd "e:\programming\React Native\TownTap"
```

All dependencies are already installed! Verify with:
```bash
npm list --depth=0
```

You should see:
- ✅ @supabase/supabase-js
- ✅ expo-location
- ✅ react-native-maps
- ✅ @tanstack/react-query
- ✅ expo-linear-gradient
- ✅ And 40+ more packages...

---

## 🗄️ Step 2: Set Up Supabase Backend (5 minutes)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com/)
2. Click **"New Project"**
3. Fill in:
   - Project name: `TownTap`
   - Database password: (save this!)
   - Region: (choose closest)
4. Wait 1-2 minutes for project creation

### 2.2 Run Database Setup

1. In Supabase Dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. Open file `SUPABASE_SETUP.md` in your project
4. Copy **entire Database Schema section** (lines 20-150)
5. Paste into SQL Editor and click **"Run"**
6. You should see: "Success. No rows returned"

### 2.3 Enable Row Level Security

1. In SQL Editor, create **New Query**
2. Copy **Row Level Security Policies** from `SUPABASE_SETUP.md` (lines 155-350)
3. Paste and click **"Run"**
4. Success! Your database is secured

### 2.4 Create Indexes

1. New Query
2. Copy **Indexes** section from `SUPABASE_SETUP.md` (lines 355-380)
3. Run it
4. This makes your queries super fast! ⚡

### 2.5 Add Initial Data

1. New Query
2. Copy **Initial Data** section from `SUPABASE_SETUP.md` (lines 515-530)
3. Run it
4. Now you have 10 business categories!

### 2.6 Get Your API Keys

1. Click **"Settings"** → **"API"** in left sidebar
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
3. Keep these safe - you'll need them next!

---

## 🔐 Step 3: Configure Environment Variables (2 minutes)

### 3.1 Create .env file

```bash
# Copy the example file
copy .env.example .env
```

### 3.2 Edit .env file

Open `.env` in your code editor and fill in:

```env
# From Supabase Settings → API
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...your-key-here

# From Google Cloud Console → APIs → Credentials
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your-key-here

# From Stripe Dashboard (optional for now)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...your-key-here

# Environment
EXPO_PUBLIC_APP_ENV=development
```

**Don't have Google Maps key yet?** Skip it for now, add it later when testing maps.

---

## 🏃 Step 4: Run the App (3 minutes)

### 4.1 Start Expo

```bash
npx expo start
```

You'll see a QR code and options.

### 4.2 Choose Your Platform

**For iOS (Mac only):**
```
Press: i
```

**For Android:**
```
Press: a
```

**For Physical Device:**
1. Install **Expo Go** app from App Store/Play Store
2. Scan the QR code
3. App will load on your device!

### 4.3 First Launch

The app will:
1. Show TownTap logo splash screen
2. Open to **Welcome** screen
3. You're ready! 🎉

---

## 🧪 Step 5: Test the App (5 minutes)

### 5.1 Test Authentication

1. Tap **"Get Started"** button
2. Select **"I'm a Customer"**
3. Fill in the sign-up form:
   ```
   Full Name: John Doe
   Email: john@example.com
   Phone: 1234567890
   Password: password123
   ```
4. Tap **"Sign Up"**
5. Success! You're logged in! ✅

### 5.2 Verify in Supabase

1. Go to Supabase Dashboard
2. Click **"Authentication"** → **"Users"**
3. You should see your new user!
4. Click **"Database"** → **"profiles"**
5. Your profile is there too!

### 5.3 Add a Test Business (Optional)

Let's add a business so you can see the home screen in action:

1. Go to Supabase **"SQL Editor"**
2. Run this query:

```sql
-- Get your user ID first
SELECT id, full_name FROM profiles;

-- Copy the ID, then create a test business
INSERT INTO businesses (
  owner_id,
  name,
  description,
  category_id,
  address,
  latitude,
  longitude,
  phone,
  avg_rating,
  total_reviews,
  is_verified
) VALUES (
  'paste-your-user-id-here',
  'Joe''s Carpentry',
  'Expert woodwork and furniture repair services',
  (SELECT id FROM categories WHERE slug = 'carpenter'),
  '123 Main Street, Your City',
  37.7749,
  -122.4194,
  '+1-555-0123',
  4.5,
  25,
  true
);
```

3. Now pull down on home screen to refresh
4. You'll see Joe's Carpentry card! 🏪

---

## 🎨 Step 6: Explore the App

### What's Working Now:

✅ **Welcome Screen**
- Beautiful gradient design
- Feature highlights
- CTA buttons

✅ **Authentication**
- Sign up with role selection
- Sign in
- Profile creation

✅ **Home Screen**
- Greeting with your name
- Notification icon (top right)
- Profile avatar (top right)
- Search bar
- Category filters
- Business cards with ratings
- Distance calculation

### Test These Features:

1. **Categories**: Tap different categories to filter
2. **Profile**: Tap avatar in top right
3. **Notifications**: Tap bell icon
4. **Search**: Tap search bar (goes to Explore)

---

## 🐛 Troubleshooting

### Problem: App won't start

**Solution:**
```bash
# Clear cache and restart
npx expo start --clear
```

### Problem: "Network request failed" error

**Solution:**
1. Check your `.env` file has correct Supabase URL
2. Make sure you're connected to internet
3. Verify Supabase project is active

### Problem: No businesses showing on home screen

**Solution:**
1. Add a test business (see Step 5.3)
2. Make sure `is_verified = true` for the business
3. Pull down on home screen to refresh

### Problem: Location permission not working

**Solution:**
1. iOS: Check Settings → Your App → Location
2. Android: Check App Info → Permissions → Location
3. Grant "While Using App" permission

### Problem: Can't sign in after signing up

**Solution:**
1. Check Supabase Dashboard → Authentication → Email templates
2. Confirm email might be required (check your inbox)
3. For testing, disable email confirmation in Settings → Authentication → Email Auth

---

## 📱 What's Next?

Now that your app is running, you can:

1. **Read** `IMPLEMENTATION_STATUS.md` to see what's complete and what's next
2. **Explore** the code structure in the README
3. **Build** remaining features (Business Detail, Booking, etc.)
4. **Customize** colors and branding in `constants/colors.ts`
5. **Add** more test data in Supabase

---

## 🆘 Need Help?

**Check These Resources:**
- `README.md` - Full documentation
- `SUPABASE_SETUP.md` - Complete backend guide
- `IMPLEMENTATION_STATUS.md` - What's done and what's next

**Common Issues:**
- Clear Expo cache: `npx expo start --clear`
- Reinstall node_modules: `rm -rf node_modules && npm install`
- Check Supabase logs: Dashboard → Logs

**Still stuck?**
- Check Expo logs in terminal
- Look for error messages in app
- Verify all environment variables

---

## ✨ Success!

You now have TownTap running locally! 🎉

**What you've accomplished:**
- ✅ Set up a complete Supabase backend
- ✅ Configured all environment variables
- ✅ Ran the app on simulator/device
- ✅ Created a test user account
- ✅ Explored the home screen

**Total time:** ~15 minutes

**Next steps:** Start building additional features from `IMPLEMENTATION_STATUS.md`!

---

**Happy Coding! 🚀**

Questions? Check the documentation or open an issue.
