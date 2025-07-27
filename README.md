# TownTap - Local Business Discovery Platform

A React Native application built with Expo that connects customers with local businesses for ordering products, booking services, and real-time communication.

## 🚀 Features

### For Customers
- Browse local businesses by category
- Order products and book services
- Real-time order tracking
- In-app chat with business owners
- Multiple payment methods
- Order history and reviews

### For Business Owners
- Business dashboard with analytics
- Order management system
- Customer communication tools
- Product/service catalog management
- Real-time notifications
- Business profile management

## 🛠️ Tech Stack

### Frontend
- **React Native** with Expo SDK 53
- **Expo Router** for navigation
- **TypeScript** for type safety
- **Zustand** for state management
- **React Native Safe Area Context** for layout
- **React Native Gesture Handler** for interactions

### Backend
- **Supabase** for database and real-time features
- **PostgreSQL** database with Row Level Security
- **Real-time subscriptions** for live updates
- **Authentication** with JWT tokens

### Additional Features
- **Internationalization** (English/Hindi)
- **Location Services** with expo-location
- **Image Handling** with expo-image
- **Maps Integration** with react-native-maps
- **Animations** with Lottie and Moti

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- Expo Go app (for testing)
- Supabase account

## ⚡ Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhinav28birajdar/TownTap.git
   cd TownTap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL script from `supabase/database.sql`

5. **Start Development Server**
   ```bash
   npx expo start
   ```

6. **Test on Device**
   - Install Expo Go from App Store/Play Store
   - Scan QR code from terminal

## 📁 Project Structure

```
TownTap/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home screen
│   │   ├── explore.tsx          # Business discovery
│   │   ├── orders.tsx           # Order management
│   │   └── profile.tsx          # User profile
│   ├── _layout.tsx              # Root layout
│   └── +not-found.tsx           # 404 page
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Basic UI elements
│   │   └── PlaceholderScreen.tsx
│   ├── screens/                 # Main screens
│   │   ├── auth/               # Authentication screens
│   │   ├── business/           # Business owner screens
│   │   ├── customer/           # Customer screens
│   │   └── shared/             # Shared screens
│   ├── stores/                 # Zustand state management
│   │   ├── authStore.ts        # Authentication state
│   │   ├── cartStore.ts        # Shopping cart state
│   │   └── locationStore.ts    # Location state
│   ├── services/               # API services
│   │   ├── aiService.ts        # AI integration
│   │   └── businessService.ts  # Business operations
│   ├── lib/                    # Core utilities
│   │   └── supabase.ts         # Supabase client
│   ├── context/                # React contexts
│   ├── types/                  # TypeScript definitions
│   ├── i18n/                   # Internationalization
│   └── config/                 # Configuration files
├── assets/                     # Static assets
│   ├── images/                 # App images
│   └── fonts/                  # Custom fonts
├── supabase/
│   ├── database.sql            # Complete database schema
│   └── functions/              # Edge functions
└── components/                 # Expo default components
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User authentication and profiles
- **businesses** - Business information and settings
- **products** - Product catalog
- **services** - Service offerings
- **orders** - Order management
- **chats** - Real-time messaging
- **reviews** - Customer reviews
- **notifications** - Push notifications

All tables include Row Level Security policies for data protection.

## 🔧 Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm run start -- --clear

# Build for production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Install Expo SDK compatible packages
npx expo install --fix
```

## 📱 Building for Production

### Android
```bash
npx eas build --platform android
```

### iOS
```bash
npx eas build --platform ios
```

## 🧪 Testing

The app can be tested using:
- **Expo Go** (development)
- **Development builds** (production features)
- **Web browser** (limited functionality)

## 🌐 Environment Variables

Required environment variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
EXPO_PUBLIC_APP_NAME=TownTap
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=development

# Feature Flags
EXPO_PUBLIC_ENABLE_REALTIME=true
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_NOTIFICATIONS=true

# API Configuration
EXPO_PUBLIC_API_TIMEOUT=10000
EXPO_PUBLIC_MAX_RETRIES=3

# Location Defaults
EXPO_PUBLIC_DEFAULT_LATITUDE=28.6139
EXPO_PUBLIC_DEFAULT_LONGITUDE=77.2090
EXPO_PUBLIC_DEFAULT_RADIUS=5000

# Business Configuration
EXPO_PUBLIC_MIN_ORDER_AMOUNT=100
EXPO_PUBLIC_DEFAULT_DELIVERY_FEE=50
EXPO_PUBLIC_DEFAULT_DELIVERY_TIME=30
```

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- API rate limiting
- Input validation and sanitization
- Secure environment variable handling

## 📈 Performance Optimizations

- Image optimization with Expo Image
- Lazy loading of screens
- Optimized bundle size
- Efficient state management
- Real-time subscription optimization

## 🌍 Internationalization

The app supports multiple languages:
- English (default)
- Hindi

Language files are located in `src/i18n/`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: abhinav28birajdar@gmail.com

## 📱 Screenshots

[Add screenshots of your app here]

---

**TownTap** - Connecting communities, one tap at a time! 🏪📱
