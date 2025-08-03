# 🚀 TownTap - Real-Time Business Discovery App
<div align="center">
  <img src="./assets/images/icon.png" alt="SkillBox Logo" width="120" height="120">
  
  **Empowering Learning Through Technology**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-50.0-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.0-green.svg)](https://supabase.com/)
</div>


TownTap is a complete real-time business discovery application that connects customers with local service providers within a 20km radius. Built with React Native, Expo, and Supabase for live location tracking and instant business discovery.

## ✨ Features

- **🌍 Real-Time Location Tracking**: Live GPS tracking with 30-second updates
- **📍 20km Radius Search**: Discover businesses within 20km of your location
- **🏷️ 25+ Service Categories**: Plumber, Electrician, Carpenter, Mechanic, and more
- **🔄 Live Business Updates**: Real-time business availability and status
- **📱 Service Requests**: Instant service request system with live notifications
- **🎨 Modern UI/UX**: Clean, responsive design with dark/light theme support
- **📊 Business Dashboard**: Real-time analytics for business owners
- **🔐 Secure Authentication**: Row-level security with Supabase

## 🚀 Quick Setup

### 1. Database Setup
```sql
-- Run this script in Supabase SQL Editor
-- Copy and paste the content from FINAL_DATABASE_SETUP.sql
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Update src/lib/supabase.ts with your Supabase credentials
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the App
```bash
npx expo start
```

## 📱 App Structure

- **🏠 Home**: Real-time business discovery with live location tracking
- **📋 Requests**: Track your service requests in real-time
- **🌟 Explore**: Browse all service categories and providers
- **🏪 Business**: Register your business to connect with customers
- **📊 Dashboard**: Business analytics and request management
- **👤 Profile**: Account settings and preferences

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + PostGIS)
- **Real-Time**: Supabase Realtime subscriptions
- **Location**: Expo Location with live GPS tracking
- **Navigation**: React Navigation 6
- **UI**: Custom components with Ionicons
- **State**: Zustand for state management

## 📊 Database Schema

The app uses a comprehensive PostgreSQL schema with PostGIS for location services:

- **business_categories**: 25+ service categories with icons
- **businesses**: Complete business profiles with geolocation
- **customers**: Customer profiles with live location tracking
- **service_requests**: Real-time service request system
- **location_tracking**: Live GPS tracking history
- **business_interactions**: Analytics and interaction tracking

## 🔧 Core Functions

- `get_nearby_businesses()`: PostGIS function for 20km radius search
- `search_businesses()`: Full-text search with location filtering
- Real-time subscriptions for live updates
- Row-level security for data protection

## 🎯 Usage

1. **For Customers**:
   - Open the app and allow location permissions
   - Browse nearby businesses in real-time
   - Filter by service categories
   - Send instant service requests
   - Track request status live

2. **For Businesses**:
   - Register your business with location
   - Receive real-time service requests
   - Manage customer interactions
   - View analytics dashboard

## 🔒 Security

- Row-level security (RLS) enabled on all tables
- Secure authentication with Supabase Auth
- Location data encrypted and protected
- Privacy-focused design

## 📈 Real-Time Features

- Live location updates every 30 seconds
- Instant business discovery within 20km
- Real-time service request notifications
- Live status indicators
- Background location tracking

## 🤝 Contributing

This is a complete working application. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Private project - All rights reserved.

---

**🚀 Ready to discover local services in real-time!**
