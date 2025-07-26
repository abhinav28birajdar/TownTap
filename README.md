# TownTap - Real-Time Local Business Discovery App

TownTap is a comprehensive real-time application that connects customers with local businesses, featuring live order tracking, real-time messaging, and intelligent business management tools.

## 🚀 Features

### For Customers
- **Location-Based Discovery**: Find nearby businesses by category using GPS
- **Smart Search**: Search businesses by name, category, or services
- **Real-Time Messaging**: Chat directly with business owners
- **Call Integration**: Direct calling functionality
- **Category Filtering**: Browse by business type (Restaurant, Salon, Carpenter, etc.)
- **Distance Sorting**: See businesses sorted by proximity

### For Business Owners
- **Business Registration**: Register your business with location mapping
- **Customer Management**: Receive and respond to customer inquiries
- **Dashboard Analytics**: Track customer interactions and business metrics
- **Real-Time Chat**: Communicate with potential customers instantly

## 📱 Demo Features

The app currently runs with comprehensive mock data that demonstrates all core features:

- **10 Business Categories**: Stationary, Salon, Carpenter, Restaurant, Grocery, Medical, Electronics, Fashion, Automotive, Services
- **Location Services**: Uses Mumbai coordinates as fallback when GPS is unavailable
- **Mock Business Data**: 3 sample businesses with realistic information
- **Chat System**: Fully functional messaging interface with mock conversations
- **Business Registration**: Complete form with location picker and validation

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo ~53.0.16
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: Zustand with AsyncStorage persistence
- **Location Services**: expo-location v17.1.0
- **UI Components**: Ionicons, NativeBase
- **Backend Ready**: Supabase PostgreSQL with PostGIS for spatial queries
- **Real-time**: Prepared for Supabase realtime subscriptions

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)
- Physical device (recommended for location testing)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TownTap
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📂 Project Structure

```
TownTap/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab navigation layout
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Home screen router
│   │   ├── explore.tsx           # Explore tab
│   │   ├── orders.tsx            # Orders tab
│   │   ├── profile.tsx           # Profile tab
│   │   └── register.tsx          # Business registration tab
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/               # Reusable UI components
│   ├── screens/                  # Screen components
│   │   ├── auth/                 # Authentication screens
│   │   ├── business/             # Business owner screens
│   │   ├── customer/             # Customer screens
│   │   └── shared/               # Shared screens
│   ├── services/                 # API and business logic
│   ├── stores/                   # Zustand state management
│   ├── types/                    # TypeScript type definitions
│   └── lib/                      # Configuration and utilities
├── supabase/                     # Database schema and functions
└── assets/                       # Images and fonts
```

## 🗄️ Database Setup (Optional)

The app works with mock data by default. To enable full Supabase integration:

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Enable PostGIS extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Run the schema**
   ```bash
   # Copy the contents of supabase/schema.sql
   # Run in your Supabase SQL editor
   ```

4. **Configure environment**
   ```typescript
   // Update src/lib/supabase.ts
   const supabaseUrl = 'your-project-url'
   const supabaseAnonKey = 'your-anon-key'
   ```

## 🎯 Usage

### Customer Flow
1. **Login**: Use demo login or create account
2. **Location Permission**: Grant location access for nearby businesses
3. **Browse**: View businesses by category or search
4. **Interact**: Call or message businesses directly
5. **Chat**: Real-time messaging with business owners

### Business Owner Flow
1. **Register**: Use the register tab to add your business
2. **Location**: Set your business location on the map
3. **Dashboard**: View customer inquiries and analytics
4. **Respond**: Chat with customers in real-time

## 🧪 Testing

The app includes comprehensive mock data for testing all features without backend setup:

- **Location Services**: Falls back to Mumbai coordinates
- **Business Categories**: 10 predefined categories with icons
- **Sample Businesses**: 3 businesses with complete information
- **Chat System**: Mock conversations with realistic data
- **Business Registration**: Full form validation and location mapping

## � Future Enhancements

- **Real-time Notifications**: Push notifications for new messages
- **Payment Integration**: In-app booking and payment system
- **Reviews & Ratings**: Customer feedback system
- **Advanced Analytics**: Business insights and performance metrics
- **Multi-language Support**: Localization for different regions
- **Social Features**: Business sharing and recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team

## 🙏 Acknowledgments

- Expo team for the excellent React Native framework
- Supabase for the backend infrastructure
- Open source community for the amazing libraries

---

**Made with ❤️ for local businesses and their customers**

# TownTap - Real-Time Local Business Platform

TownTap is a comprehensive real-time application that connects customers with local businesses. The platform provides live order tracking, real-time messaging, business analytics, and complete authentication flow.

## 🚀 Features

### 🏠 Customer Features
- **Real-Time Home Screen**: Live order tracking and nearby businesses
- **Live Order Updates**: Real-time status updates for all orders
- **Business Discovery**: Find and browse local businesses
- **AI Assistant**: Get help with orders and recommendations
- **Order History**: View past orders with detailed information
- **Profile Management**: Manage personal information and addresses

### 🏪 Business Features
- **Real-Time Dashboard**: Live statistics and analytics
  - Total messages count
  - New customer tracking
  - Pending orders monitoring
  - Daily revenue tracking
- **Quick Actions**:
  - Manage orders
  - View customer messages
  - Business profile management
  - Analytics dashboard
- **Order Management**: Real-time order processing
- **AI Content Generator**: Generate product descriptions and marketing content
- **Customer Communication**: Real-time messaging with customers
- **Analytics**: Comprehensive business insights

### 🔐 Authentication System
- **Category Selection**: Choose between Customer or Business Owner
- **Complete Auth Flow**: Sign up, sign in, and user type validation
- **User Type Segregation**: Different experiences for customers and business owners
- **Demo Login**: Quick access for testing

### ⚡ Real-Time Features
- **Live Order Tracking**: Real-time order status updates using Supabase subscriptions
- **Instant Messaging**: Real-time chat between customers and businesses
- **Live Business Updates**: Real-time business status and availability
- **Push Notifications**: Instant notifications for order updates and messages

## 🛠 Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL with real-time subscriptions)
- **Navigation**: React Navigation v6
- **State Management**: Zustand stores
- **Styling**: React Native StyleSheet with custom theming
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Real-time subscriptions
- **Internationalization**: i18next

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TownTap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL script in `supabase/database_setup.sql`
   - Update your Supabase configuration in `src/lib/supabase.ts`

4. **Environment Variables**
   Create a `.env` file with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL database with the following main tables:

### Core Tables
- **profiles**: User profiles extending Supabase auth
- **businesses**: Business information and settings
- **categories**: Product categories
- **products**: Business products and services
- **orders**: Customer orders with real-time tracking
- **order_items**: Individual order items
- **messages**: Real-time messaging between users
- **notifications**: Push notifications
- **reviews**: Customer reviews and ratings

### Analytics Tables
- **order_analytics**: Daily business analytics
- **product_analytics**: Product performance metrics

### Features
- **Row Level Security (RLS)**: Secure data access
- **Real-time Subscriptions**: Live data updates
- **Automatic Triggers**: Data consistency and analytics
- **Comprehensive Indexing**: Optimized performance

## 📱 App Structure

```
src/
├── components/           # Reusable UI components
│   └── ui/              # Basic UI components (Button, Card, Input)
├── screens/             # Application screens
│   ├── auth/            # Authentication screens
│   │   ├── AuthScreen.tsx
│   │   ├── CategorySelectionScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SignUpScreen.tsx
│   ├── business/        # Business owner screens
│   │   ├── RealTimeBusinessDashboard.tsx
│   │   ├── OrderManagementScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── customer/        # Customer screens
│   │   ├── RealTimeCustomerHome.tsx
│   │   ├── OrderHistoryScreen.tsx
│   │   ├── AIAssistantScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── shared/          # Shared screens
│       ├── ChatScreen.tsx
│       ├── NotificationsScreen.tsx
│       └── SettingsScreen.tsx
├── stores/              # State management
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── locationStore.ts
├── lib/                 # Utilities and configurations
│   └── supabase.ts
├── navigation/          # Navigation configuration
│   └── index.tsx
└── types/               # TypeScript type definitions
    └── index.ts
```

## 🎯 Key Features Implementation

### Real-Time Dashboard
The business dashboard (`RealTimeBusinessDashboard.tsx`) includes:
- Live statistics with Supabase real-time subscriptions
- Real-time order and message tracking
- Quick action cards for common tasks
- Comprehensive error handling and demo fallbacks

### Authentication Flow
Complete authentication system with:
- Category selection (Customer/Business Owner)
- User type validation and segregation
- Proper auth state management
- Demo login for quick testing

### Real-Time Customer Experience
Customer home screen (`RealTimeCustomerHome.tsx`) features:
- Live order tracking with status updates
- Real-time business discovery
- Instant notifications
- Search functionality

### Database Real-Time Features
- **Order Subscriptions**: Live order status updates
- **Message Subscriptions**: Instant messaging
- **Business Updates**: Real-time business availability
- **Analytics Tracking**: Live business metrics

## 🔧 Configuration

### Theme System
The app includes a comprehensive theming system with:
- Light and dark mode support
- Consistent color palette
- Dynamic theme switching
- Proper contrast ratios

### Navigation Structure
- **Customer Flow**: 4 tabs (Home, Orders, AI Assistant, Profile)
- **Business Flow**: 4 tabs (Dashboard, Orders, AI Content, Profile)
- **Auth Flow**: Category selection → Authentication
- **Stack Navigation**: For detailed screens

## 🚀 Running the App

### Development Server
```bash
# Start the Expo development server
npx expo start

# For specific platforms
npx expo start --ios
npx expo start --android
npx expo start --web
```

### Available Tasks
The project includes a VS Code task for easy development:
- **Start TownTap Development Server**: Runs `npx expo start`

## 📊 Real-Time Features

### Supabase Real-Time Subscriptions
- **Orders Table**: Live order status updates
- **Messages Table**: Instant messaging
- **Businesses Table**: Real-time business updates
- **Notifications Table**: Live notifications

### Error Handling
- Comprehensive error boundaries
- Fallback to demo data when offline
- User-friendly error messages
- Proper loading states

## 🧪 Testing

The app includes comprehensive error handling and demo data for testing:
- Demo login functionality
- Mock data fallbacks
- Real-time subscription testing
- Cross-platform compatibility

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Expo and React Native
- Powered by Supabase for real-time features
- Icons from Ionicons
- UI components with custom theming

---

**TownTap** - Connecting communities through real-time local commerce 🏪📱
