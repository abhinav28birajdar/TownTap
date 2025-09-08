<<<<<<< HEAD
<div align="center">
  <img src="/assets/images/icon.png" alt="Town Tap" width="152" height="152">
</div>

# 🏪 TownTap - Local Business Discovery Platform

**Real-time local business discovery with geographic search, AI-powered recommendations, and seamless ordering system.**

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-black.svg)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green.svg)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/abhinav28birajdar/TownTap.git
cd TownTap

# Install dependencies
npm install

# Start the development server
npx expo start

# Choose your platform:
# - Press 'a' for Android
# - Press 'i' for iOS
# - Press 'w' for Web
```

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Supabase Account** (for database and authentication)

## 🗄️ Database Setup

1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Run Database Schema**: Copy and paste the contents of `TOWNTAP_FINAL_FIXED_SCHEMA.sql` into your Supabase SQL Editor
3. **Enable PostGIS**: The schema automatically enables PostGIS extension for geographic queries
4. **Configure Environment**: Update your Supabase credentials in the environment configuration

## 🎯 Features

### 🔍 **Real-time Business Discovery**
- **Geographic Search**: Find businesses within 20km radius using PostGIS
- **Live Updates**: Real-time business status, ratings, and availability
- **Category Filtering**: Filter by restaurants, pharmacy, electronics, etc.
- **Distance Calculation**: Accurate distance calculation with latitude/longitude

### 🏪 **For Business Owners**
- **Business Management**: Register and manage business profiles
- **Order Tracking**: Real-time order management and notifications
- **Analytics Dashboard**: Track revenue, orders, and customer insights
- **Inventory Management**: Manage products and services with real-time updates

### 🛍️ **For Customers**
- **Smart Search**: AI-powered business recommendations
- **Order Placement**: Seamless ordering with real-time tracking
- **Reviews & Ratings**: Rate businesses and read customer reviews
- **Favorites**: Save and organize favorite businesses

### 🎨 **Modern UI/UX**
- **Dark/Light Mode**: Adaptive themes with smooth transitions
- **Responsive Design**: Optimized for all screen sizes
- **Modern Components**: Material Design 3 inspired interface
- **Smooth Animations**: Gesture-based navigation and micro-interactions

## 🏗️ Technical Stack

### **Frontend**
- **React Native** (0.74) - Cross-platform mobile framework
- **Expo** (51) - Development platform and build tools
- **TypeScript** - Type-safe JavaScript development
- **Zustand** - Lightweight state management
- **React Navigation** - Native navigation library

### **Backend & Database**
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Primary database with PostGIS extension
- **Row Level Security** - Database-level security policies
- **Real-time Subscriptions** - Live data synchronization

### **Key Libraries**
- **@react-native-async-storage/async-storage** - Local data persistence
- **expo-location** - GPS and location services
- **react-native-gesture-handler** - Advanced gesture recognition
- **@supabase/supabase-js** - Supabase client library

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── modern/         # Modern design system components
│   └── ui/             # Basic UI elements
├── context/            # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   ├── ModernThemeContext.tsx # Theme management
│   └── OnboardingProvider.tsx # Onboarding flow
├── hooks/              # Custom React hooks
│   └── useLocationBasedRealtime.ts # Location-based real-time data
├── navigation/         # Navigation configuration
├── screens/            # Application screens
│   ├── auth/          # Authentication screens
│   ├── business/      # Business owner screens
│   ├── customer/      # Customer screens
│   └── shared/        # Shared screens
├── services/          # API and external services
├── stores/            # State management stores
├── theme/             # Theme configuration
└── types/             # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables
Create your environment configuration in `src/config/environment.ts`:

```typescript
export const config = {
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  },
  features: {
    enableRealtime: true,
    enableGeographicSearch: true,
  }
};
```

### Database Functions
The app uses the following key database functions:
- `get_nearby_businesses()` - Geographic business search
- `generate_order_number()` - Automatic order numbering
- `update_business_rating()` - Automatic rating calculation

## 🌟 Key Features in Detail

### **Real-time Geographic Search**
- Uses PostGIS ST_DWithin for accurate radius-based search
- Automatically calculates distances between user and businesses
- Supports filtering by category, rating, and business type
- Returns up to 100 businesses sorted by distance and rating

### **Order Management System**
- Automated order number generation (TT + YYYYMMDD + 0001)
- Real-time order status updates
- Support for delivery and pickup options
- Integrated payment status tracking

### **Business Analytics**
- Revenue tracking and reporting
- Customer engagement metrics
- Order volume and trends analysis
- Rating and review management

### **Security & Privacy**
- Row Level Security (RLS) policies on all tables
- Authenticated-only access to sensitive data
- User-specific data access controls
- Secure file upload and storage

## 🚀 Development

### Running the App
```bash
# Start Metro bundler
npx expo start

# Run on specific platform
npx expo run:android    # Android
npx expo run:ios        # iOS
```

### Building for Production
```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both platforms
eas build --platform all
```

### Testing
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test
```

## 🔄 Real-time Features

The app leverages Supabase real-time subscriptions for:
- **Live Business Updates**: Instant updates when businesses change status
- **Order Tracking**: Real-time order status changes
- **New Business Notifications**: Automatic updates when new businesses join
- **Rating Updates**: Live rating and review updates

## 📊 Database Schema

### Core Tables
- **profiles** - User profiles (customers and business owners)
- **businesses** - Business listings with geographic data
- **products** - Product catalog for businesses
- **orders** - Order management with status tracking
- **reviews** - Customer reviews and ratings
- **favorites** - User favorite businesses

### Geographic Features
- PostGIS Point geometry for precise location storage
- Spatial indexing for fast geographic queries
- Distance calculation in kilometers
- Support for location-based filtering

## 🎨 Design System

### Color Scheme
- **Primary**: Modern blue (#3B82F6)
- **Secondary**: Vibrant green (#34D399)
- **Accent**: Warm orange (#F59E0B)
- **Background**: Clean whites and grays
- **Text**: High contrast for accessibility

### Typography
- **Primary Font**: System default (San Francisco/Roboto)
- **Sizes**: Responsive scale from 12px to 32px
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

## 🔒 Security

### Authentication
- Supabase Auth with email/password
- Anonymous authentication for quick start
- Password reset and email verification
- Session management with automatic refresh

### Data Protection
- Row Level Security on all database tables
- API key protection and rotation
- Secure file uploads to Supabase Storage
- Input validation and sanitization

## 📈 Performance

### Optimization Strategies
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Compressed and cached images
- **Database Indexing**: Optimized queries with proper indexes
- **State Management**: Efficient Zustand stores with persistence

### Metrics
- **App Size**: ~50MB (optimized bundle)
- **Load Time**: <3 seconds on average network
- **Database Queries**: Cached and optimized with indexes
- **Real-time Updates**: <100ms latency

## 🚧 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check Supabase configuration
# Verify URL and API keys in environment config
# Ensure database is accessible from your network
```

**Location Services Not Working**
```bash
# Enable location permissions in device settings
# Check GPS/location services are enabled
# Verify app has location permission granted
```

**Real-time Updates Not Received**
```bash
# Check network connectivity
# Verify Supabase real-time is enabled in project settings
# Ensure proper subscription cleanup in useEffect
```

## 🔄 Updates

### Latest Version Features
- ✅ Fixed database function parameter matching
- ✅ Improved onboarding with user type selection
- ✅ Enhanced real-time business discovery
- ✅ Optimized profile loading performance
- ✅ Modern UI components with theme support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Abhinav Birajdar**
- GitHub: [@abhinav28birajdar](https://github.com/abhinav28birajdar)
- LinkedIn: [Abhinav Birajdar](https://linkedin.com/in/abhinav-birajdar)

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Supabase](https://supabase.com/) for the powerful backend-as-a-service
- [React Native](https://reactnative.dev/) community for continuous innovation
- [PostGIS](https://postgis.net/) for geographic database capabilities

---

**Built with ❤️ using React Native, Expo, and Supabase**
=======
-----
>>>>>>> 3e19008e9954047e9764562d063d6d4b07a609a0
