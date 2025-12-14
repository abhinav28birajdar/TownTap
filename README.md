# TownTap - Local Services Booking App

## 🚀 Quick Setup (3 Steps Only!)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database (REQUIRED)
**This fixes the "Database error saving new user" error!**

1. Open https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. **Paste** (Ctrl+V) - The SQL is already in your clipboard!
6. Click **RUN** (takes 30-60 seconds)

File: `COMPLETE_DATABASE_SETUP.sql` ✅ Already copied!

### Step 3: Run App
```bash
npm start
# Press 'a' for Android or 'i' for iOS
```

## ✅ What's Included

- 🔐 **Authentication** - Secure signup/login with Supabase
- 📱 **11 Database Tables** - Complete schema with RLS security
- 🎨 **Modern UI** - Green nature-themed design
- ⚡ **Real-time** - Chat & notifications
- 📍 **Location Search** - GPS-based business discovery
- ⭐ **Reviews & Ratings** - Customer feedback system
- 📅 **Bookings** - Complete booking management
- 💳 **Payments** - Stripe integration ready

## 🐛 Troubleshooting

### Error: "Database error saving new user"
**Solution:** Run `COMPLETE_DATABASE_SETUP.sql` in Supabase (Step 2 above)

### App won't start
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

## 📁 Project Structure

```
TownTap/
├── app/                          # Screens (Expo Router)
│   ├── (tabs)/                   # Main tabs (Home, Explore)
│   ├── auth/                     # Sign in/up screens
│   ├── customer/                 # Customer features
│   └── business-owner/           # Business owner features
├── components/ui/                # Reusable UI components
├── lib/                          # Services (Supabase, etc.)
├── stores/                       # State management (Zustand)
└── COMPLETE_DATABASE_SETUP.sql   # 👈 Run this in Supabase!
```

## 📚 Key Files

- **COMPLETE_DATABASE_SETUP.sql** - Single SQL file for entire database
- **CHANGELOG.md** - Complete list of features and changes
- **.env** - Your Supabase credentials (already configured)

## 🎯 Next Steps After Setup

1. ✅ Run SQL in Supabase
2. ✅ Create test account (signup in app)
3. ✅ Browse categories and businesses
4. ✅ Create a booking
5. ✅ Test real-time chat

---

**Built with:** React Native, Expo, Supabase, TypeScript
