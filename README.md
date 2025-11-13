# 🏪 TownTap - Multi-Business Marketplace

A comprehensive React Native mobile application built with Expo and Supabase that connects customers with local businesses for services like carpentry, plumbing, electrical work, gardening, cleaning, catering, and more.

## ✨ Features

### For Customers
- 🔍 **Browse & Search** - Discover local businesses by category, rating, and distance
- 📍 **Location-Based** - Find businesses near you with distance calculation
- 📅 **Easy Booking** - Book services with date/time selection
- 💳 **Multiple Payment Options** - Cash, GPay, PhonePe, Paytm integration
- 🗺️ **Live Tracking** - Real-time order tracking with Google Maps
- ⭐ **Reviews & Ratings** - Read and write reviews for businesses
- 🔔 **Real-time Notifications** - Get updates on booking status
- 📜 **Booking History** - View past and ongoing bookings
- 👤 **Profile Management** - Edit profile, change password, upload photo

### For Business Owners
- 🏢 **Business Dashboard** - Manage bookings and view analytics
- ✅ **Booking Management** - Accept, reject, and update booking status
- 📊 **Earnings & Reports** - Track revenue and booking statistics
- 🛠️ **Service Management** - Add/edit services, pricing, and descriptions
- 📸 **Gallery Management** - Upload business photos
- 📍 **Location Sharing** - Share real-time location for active orders
- ⏰ **Hours Configuration** - Set opening hours and availability

### Additional Features
- 🎨 **Beautiful UI** - Modern, gradient-based design with intuitive navigation
- 🌓 **Dark Mode Ready** - Support for light and dark themes
- 🔐 **Secure Authentication** - Email/password auth with OTP verification
- 🔒 **Row Level Security** - Database security with Supabase RLS
- ⚡ **Real-time Updates** - Live updates using Supabase Realtime
- 📱 **Responsive Design** - Works on all screen sizes

## 🛠️ Tech Stack

### Mobile App
- **Framework:** React Native + Expo (managed workflow)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React Context + TanStack Query
- **UI Components:** Custom components with Expo Linear Gradient
- **Icons:** @expo/vector-icons (Ionicons)
- **Forms:** React Hook Form + Yup validation
- **Maps:** React Native Maps + Expo Location
- **Payments:** Stripe React Native
- **Notifications:** Expo Notifications
- **Storage:** Expo Secure Store, AsyncStorage

### Backend
- **BaaS:** Supabase
  - Authentication (Email/Password, Magic Links)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Realtime Subscriptions
  - Storage (Images/Files)
  - Edge Functions (Serverless)
  
### Payment Integration
- **Stripe** - For online payments
- **UPI** - GPay, PhonePe, Paytm (via Stripe or native integration)

## 📁 Project Structure

```
TownTap/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── home.tsx              # Home screen with business listings
│   │   ├── explore.tsx           # Search and explore
│   │   └── index.tsx             # Default tab screen
│   ├── auth/                     # Authentication screens
│   │   ├── sign-in.tsx           # Sign in screen
│   │   ├── sign-up.tsx           # Sign up screen
│   │   ├── role-selection.tsx    # Role selection (Customer/Business)
│   │   └── forgot-password.tsx   # Password reset
│   ├── business/                 # Business-related screens
│   │   └── [id].tsx              # Business detail screen
│   ├── booking/                  # Booking screens
│   │   ├── create.tsx            # Create booking
│   │   └── track.tsx             # Live tracking
│   ├── profile/                  # Profile screens
│   │   ├── edit.tsx              # Edit profile
│   │   └── change-password.tsx   # Change password
│   ├── _layout.tsx               # Root layout with auth
│   └── welcome.tsx               # Welcome/onboarding
├── components/                   # Reusable components
│   └── ui/                       # UI components
│       ├── button.tsx            # Custom button component
│       ├── input.tsx             # Custom input component
│       ├── business-card.tsx     # Business card component
│       └── loading-screen.tsx    # Loading indicator
├── contexts/                     # React contexts
│   └── auth-context.tsx          # Authentication context
├── lib/                          # Libraries and utilities
│   ├── supabase.ts               # Supabase client setup
│   ├── database.types.ts         # TypeScript database types
│   └── api.ts                    # API functions
├── constants/                    # App constants
│   ├── colors.ts                 # Color palette
│   ├── spacing.ts                # Spacing and typography
│   └── theme.ts                  # Theme configuration
├── assets/                       # Static assets
│   ├── images/                   # Images
│   └── fonts/                    # Custom fonts
├── SUPABASE_SETUP.md             # Complete Supabase setup guide
├── .env.example                  # Environment variables template
└── package.json                  # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Supabase account
- Stripe account (for payments)
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   cd "e:\programming\React Native\TownTap"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your keys:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
   ```

4. **Set up Supabase**
   
   Follow the complete setup guide in `SUPABASE_SETUP.md`:
   - Create tables and schema
   - Set up Row Level Security policies
   - Create indexes
   - Set up storage buckets
   - Deploy Edge Functions
   - Insert initial data (categories)

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run on device/emulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📱 App Usage

### First Time Setup

1. **Launch the app** - You'll see the welcome screen
2. **Choose role** - Select "Customer" or "Business Owner"
3. **Sign up** - Create an account with email and password
4. **Grant permissions** - Allow location and notification access
5. **Explore** - Start browsing businesses!

### For Customers

1. **Home Screen** - Browse businesses by category
2. **Business Profile** - View details, services, and reviews
3. **Book Service** - Select service, date/time, and payment method
4. **Track Order** - Watch real-time location updates
5. **Complete & Review** - Rate your experience

### For Business Owners

1. **Register Business** - Complete business profile
2. **Add Services** - Create service listings with pricing
3. **Manage Bookings** - Accept/reject incoming requests
4. **Update Status** - Mark orders as in-progress or completed
5. **Share Location** - Enable live tracking for customers

## 🎨 Color Scheme

The app uses a modern, vibrant color palette:

- **Primary:** Indigo (#6366F1)
- **Secondary:** Pink (#EC4899)
- **Accent:** Green (#10B981)
- **Success:** Green (#10B981)
- **Warning:** Amber (#F59E0B)
- **Error:** Red (#EF4444)
- **Star Rating:** Yellow (#FBBF24)

## 🔐 Authentication Flow

```
Welcome Screen
    ↓
Role Selection (Customer/Business Owner)
    ↓
Sign Up / Sign In
    ↓
Main App (Tabs)
```

## 📊 Database Schema

See `SUPABASE_SETUP.md` for complete schema details.

Key tables:
- `profiles` - User profiles and roles
- `categories` - Business categories
- `businesses` - Business listings
- `services` - Services offered by businesses
- `bookings` - Customer bookings/orders
- `reviews` - Customer reviews and ratings
- `locations` - Real-time location tracking
- `notifications` - Push notifications
- `transactions` - Payment records

## 🔔 Real-time Features

The app uses Supabase Realtime for:
- **Live location tracking** - See business location updates
- **Booking status updates** - Get notified when status changes
- **New notifications** - Receive instant notifications
- **Chat messages** - Real-time messaging (future feature)

## 💳 Payment Integration

### Supported Methods
1. **Cash on Delivery**
2. **Online Payment** (via Stripe)
   - Credit/Debit Cards
   - UPI (GPay, PhonePe, Paytm)
   - Net Banking
   - Wallets

### Payment Flow
```
Select Payment Method → Create Payment Intent (Edge Function) 
→ Process Payment → Update Transaction → Update Booking Status
```

## 📍 Location & Maps

- Uses **Google Maps** for displaying business locations
- **Haversine formula** for distance calculation
- **Live tracking** with periodic location updates
- **Geolocation** for finding nearby businesses

## 🧪 Testing

Run tests:
```bash
npm test
```

Test coverage:
```bash
npm run test:coverage
```

## 📦 Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

### Using EAS Build (Recommended)
```bash
eas build --platform android
eas build --platform ios
```

## 🚀 Deployment

### Mobile App
- **Android:** Google Play Store via EAS Submit
- **iOS:** Apple App Store via EAS Submit

### Backend
- **Supabase:** Hosted automatically
- **Edge Functions:** Deploy via Supabase CLI

## 🔧 Configuration

### App Config (`app.json`)
- App name, version, and metadata
- Permissions (location, notifications, camera)
- Splash screen and icon
- Platform-specific settings

### TypeScript Config
- Strict type checking enabled
- Path aliases configured (`@/`)

## 📝 Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For help and support:
- Check `SUPABASE_SETUP.md` for backend issues
- Review Expo documentation
- Check Supabase logs in dashboard
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] In-app chat between customers and businesses
- [ ] Multi-language support (Hindi, regional languages)
- [ ] Loyalty points and referral system
- [ ] Push notification preferences
- [ ] Offline mode with data sync
- [ ] Business analytics dashboard
- [ ] Admin web dashboard
- [ ] Coupon and promo codes
- [ ] Subscription plans for businesses
- [ ] Advanced search filters

## 👥 Authors

Built with ❤️ for connecting local businesses with customers.

## 🙏 Acknowledgments

- Expo team for amazing framework
- Supabase for powerful backend
- React Native community
- All contributors

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** 🚧 In Development

For questions or feedback, please open an issue!