# TownTap 🏪

A complete real-time mobile application connecting local businesses with customers, built with React Native and Supabase.

## ✨ Features

### 🎯 Real-Time Business Dashboard
- Live order tracking and management
- Real-time customer messaging
- Business analytics with live updates
- Revenue tracking and insights

### 👥 Dual User Types
- **Customers**: Browse, order, and communicate with local businesses
- **Business Owners**: Manage operations, orders, and customer relationships

### 🔐 Complete Authentication System
- Secure user registration and login
- User type selection during onboarding
- Profile management for both customers and businesses
- Session persistence across app restarts

### 📱 Modern Mobile Experience
- Clean, intuitive interface
- Real-time updates without refresh
- Smooth navigation and animations
- Support for iOS and Android

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase database:**
   - Run the SQL script in `supabase/database_setup.sql`
   - Enable real-time for all tables

3. **Start the app:**
   ```bash
   npm start
   ```

See `SETUP_INSTRUCTIONS.md` for detailed setup guide.

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Real-time**: Supabase Real-time subscriptions

## 📋 Project Structure

```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation
│   ├── index.tsx      # Main screen (auth/dashboard)
│   ├── explore.tsx    # Explore/Search
│   ├── orders.tsx     # Orders management
│   └── profile.tsx    # User profile
src/
├── components/        # Reusable UI components
├── screens/          # Application screens
│   ├── auth/         # Authentication screens
│   ├── business/     # Business owner screens
│   ├── customer/     # Customer screens
│   └── shared/       # Shared screens
├── stores/           # State management
├── lib/              # Utilities and configurations
└── types/            # TypeScript definitions
supabase/
└── database_setup.sql # Complete database schema
```

## 🎯 User Flow

1. **App Launch** → Category Selection (Customer/Business)
2. **Authentication** → Sign In or Sign Up
3. **Customer Path** → 4-tab interface (Home, Explore, Orders, Profile)
4. **Business Path** → 5-tab interface (Dashboard, Customers, Orders, Business, Profile)

## 🔄 Real-time Features

- Live order status updates
- Real-time business analytics
- Instant messaging between customers and businesses
- Live inventory and business hours updates

## 📊 Database Schema

Complete schema with 15+ tables including:
- User profiles and authentication
- Business information and categories
- Orders and order items
- Real-time messaging system
- Analytics and reporting
- Location-based services

## 🔐 Security

- Row Level Security (RLS) on all database tables
- Secure API endpoints
- Real-time subscription authentication
- Data validation and sanitization

## 🌟 Key Highlights

- **100% Real Data**: No demo users or mock data
- **Production Ready**: Complete authentication and database setup
- **Scalable Architecture**: Built for growth and expansion
- **Modern UI/UX**: Clean, intuitive design
- **Real-time Everything**: Live updates across the entire app

## 📝 License

This project is licensed under the MIT License.
