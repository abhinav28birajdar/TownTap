# LocalMart - The Ultimate Supabase-Native Hyper-Local Hub

LocalMart 3.0 is a comprehensive React Native Expo application that serves as the digital core for India's small and medium businesses (MSMEs). This advanced hyper-local platform connects customers with local service providers and product vendors while providing businesses with powerful operational tools.

## 🚀 Features

### Customer Features
- **Multi-Modal Discovery**: Find nearby businesses, products, and services
- **Real-time Communication**: Direct chat with business owners
- **Live Tracking**: Real-time location tracking for deliveries and services
- **Multiple Payment Options**: UPI, cards, wallets, COD, and "Pay After Service"
- **AI-Powered Recommendations**: Personalized suggestions based on preferences and history
- **Voice Search**: Seamless voice input for searches
- **Multi-language Support**: English and Hindi support

### Business Features
- **Real-time Operations Hub**: Manage orders, bookings, and services in real-time
- **Live Status Toggle**: Control online/offline visibility to customers
- **Queue Management**: For walk-in services like salons and barbers
- **Staff Management**: Assign roles and track staff activities
- **Financial Insights**: Revenue tracking, commission management, and payout scheduling
- **Marketing Tools**: Create coupons, flash deals, and loyalty programs
- **Live Location Broadcasting**: For delivery and service tracking

### Business Types Supported
- **Type A**: Products/Groceries (restaurants, pharmacies, retail stores)
- **Type B**: Services (salons, clinics, repair services)
- **Type C**: Consultations (lawyers, doctors, tutors)
- **Type D**: Rentals (equipment, vehicles, party supplies)
- **Type E**: Delivery Services (logistics, courier, moving)

## 🛠 Technology Stack

### Frontend (Mobile)
- **React Native Expo** (TypeScript)
- **Expo Router** (File-system based routing)
- **React Native Reanimated** (Animations)
- **Zustand** (State management)
- **React Query** (Data fetching and caching)
- **NativeWind** (Styling)
- **React Hook Form** (Form management)

### Backend (Supabase)
- **PostgreSQL** with PostGIS (Geospatial queries)
- **Supabase Auth** (Authentication)
- **Supabase Realtime** (Live updates)
- **Supabase Storage** (File storage)
- **Supabase Edge Functions** (Serverless logic)
- **Row Level Security** (Data security)

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `expo-location` - Location services
- `expo-notifications` - Push notifications
- `expo-image-picker` - Image/video capture
- `react-native-maps` - Maps integration
- `react-native-gifted-chat` - Chat interface
- `react-native-calendars` - Calendar components
- `react-native-qrcode-svg` - QR code generation

## 📱 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account
- React Native development environment

### 1. Clone the Repository
```bash
git clone <repository-url>
cd towntap
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
EXPO_PUBLIC_MSG91_AUTH_KEY=your_msg91_auth_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Set up Supabase Database
1. Create a new Supabase project
2. Run the SQL script from `supabase-schema.sql` in your Supabase SQL editor
3. Enable the required extensions (PostGIS, pg_trgm, uuid-ossp)
4. Configure RLS policies as defined in the schema

### 5. Start the Development Server
```bash
npm start
```

## 🏗 Project Structure

```
app/
├── (auth)/           # Authentication screens
├── (customer)/       # Customer app screens
├── (business)/       # Business app screens
├── (onboarding)/     # Onboarding flows
├── welcome.tsx       # Welcome/splash screen
└── _layout.tsx       # Root layout

lib/
├── supabase/         # Supabase configuration
├── contexts/         # React contexts
├── stores/           # Zustand stores
├── types/            # TypeScript types
└── utils/            # Utility functions

components/
├── ui/               # Reusable UI components
└── ...               # Feature-specific components
```

## 🔐 Authentication Flow

1. **Welcome Screen**: Choose customer or business registration
2. **Registration**: Email/password with OTP verification
3. **Onboarding**: Complete profile setup
4. **Biometric Auth**: Optional Face ID/Fingerprint setup
5. **Role-based Routing**: Redirect to appropriate app interface

## 🗄️ Database Schema

### Core Tables
- `users` - User profiles extending Supabase auth
- `businesses` - Business profiles and operational data
- `products` - Product catalog for Type A businesses
- `services` - Service offerings for Type B businesses
- `rental_items` - Rental inventory for Type D businesses
- `transactions` - Universal transaction table
- `chat_threads` - Communication channels
- `messages` - Real-time messaging
- `live_locations` - GPS tracking data
- `reviews` - Customer feedback
- `notifications` - Push notifications

### Key Features
- **PostGIS Integration**: Geospatial queries for location-based features
- **Full-text Search**: Using pg_trgm for efficient search
- **Row Level Security**: Granular access control
- **Real-time Subscriptions**: Live updates via Supabase Realtime

## 🎯 Core Workflows

### Customer Journey
1. **Discovery**: Search/browse nearby businesses
2. **Selection**: View business profiles and offerings
3. **Booking/Ordering**: Place orders or book services
4. **Communication**: Chat with business owners
5. **Tracking**: Real-time status updates
6. **Payment**: Multiple payment options
7. **Feedback**: Rate and review services

### Business Journey
1. **Registration**: Business profile setup
2. **Verification**: Document upload and approval
3. **Catalog Management**: Add products/services
4. **Order Management**: Accept and process orders
5. **Communication**: Chat with customers
6. **Service Delivery**: Live location tracking
7. **Payments**: Request and receive payments
8. **Analytics**: Track performance metrics

## 🚀 Deployment

### Mobile App
1. Build with Expo EAS
2. Submit to App Store and Google Play
3. Configure deep linking
4. Set up push notification certificates

### Backend
1. Deploy Edge Functions to Supabase
2. Configure environment variables
3. Set up monitoring and alerts
4. Enable database backups

---

**LocalMart** - Empowering Bharat's Local Businesses 🇮🇳
