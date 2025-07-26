# TownTap - Real-Time Local Business Discovery App

TownTap is a comprehensive real-time application that connects customers with local businesses, featuring live order tracking, real-time messaging, and intelligent business management tools.

## 🚀 Features

### 🏪 **Real-Time Business Dashboard**
- **Live Statistics**: Total messages, new customers, pending orders, and today's revenue
- **Real-Time Updates**: Automatic data updates via Supabase subscriptions
- **Quick Actions**: 
  - Manage Orders
  - Customer Messages  
  - Business Profile
  - Analytics
- **Professional UI**: Clean design with proper theming and responsive layout

### 🔐 **Complete Authentication System**
- **Category Selection**: Users choose between Customer or Business Owner
- **Proper Authentication**: Complete sign up/sign in with user type validation
- **No Demo Mode**: Real authentication system with proper user management
- **User Type Segregation**: Different experiences for customers vs business owners

### 📱 **Customer Experience**
- **Real-Time Home Screen**: Live order tracking and business discovery
- **4-Tab Layout**: Home, Orders, AI Assistant, Profile
- **Live Updates**: Real-time order status and business availability
- **Search Functionality**: Find businesses and products
- **Order Management**: Complete order history with real-time tracking

### 👨‍💼 **Business Management**
- **Real-Time Dashboard**: Live business metrics and customer management
- **Order Management**: Real-time order processing and status updates
- **Customer Communication**: Live messaging with customers
- **Business Profile**: Complete business registration and management
- **Analytics**: Business insights and performance tracking

### ⚡ **Real-Time Features**
- **Live Order Tracking**: Real-time status updates using Supabase subscriptions
- **Instant Messaging**: Real-time communication between customers and businesses
- **Live Business Data**: Real-time business status, availability, and updates
- **Push Notifications**: Instant notifications for orders and messages

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **State Management**: Zustand
- **Navigation**: React Navigation 6
- **UI Components**: Native Base + Custom Components
- **Icons**: Expo Vector Icons
- **Internationalization**: react-i18next
- **Storage**: AsyncStorage

## 📁 Project Structure

```
TownTap/
├── app/                          # Expo Router pages
│   ├── (tabs)/                  # Tab-based navigation
│   │   ├── _layout.tsx         # Tab layout configuration
│   │   ├── index.tsx           # Home tab
│   │   ├── explore.tsx         # Explore tab  
│   │   ├── orders.tsx          # Orders tab
│   │   └── profile.tsx         # Profile tab
│   ├── _layout.tsx             # Root layout
│   └── +not-found.tsx          # 404 page
├── src/
│   ├── components/             # Reusable UI components
│   │   └── ui/                # Basic UI components
│   ├── screens/               # Application screens
│   │   ├── auth/              # Authentication screens
│   │   │   ├── AuthScreen.tsx           # Complete auth with user type
│   │   │   ├── CategorySelectionScreen.tsx  # User type selection
│   │   │   ├── LoginScreen.tsx          # Login form
│   │   │   └── SignUpScreen.tsx         # Registration form
│   │   ├── business/          # Business owner screens
│   │   │   ├── RealTimeBusinessDashboard.tsx  # Live dashboard
│   │   │   ├── ProfileScreen.tsx        # Business profile management
│   │   │   ├── OrderManagementScreen.tsx  # Order processing
│   │   │   └── AnalyticsScreen.tsx      # Business analytics
│   │   ├── customer/          # Customer screens
│   │   │   ├── RealTimeCustomerHome.tsx  # Live customer dashboard
│   │   │   ├── ProfileScreen.tsx         # Customer profile
│   │   │   └── OrderHistoryScreen.tsx    # Order history
│   │   └── shared/            # Shared screens
│   │       ├── OrderHistoryDetailScreen.tsx  # Order details
│   │       ├── PersonalInformationScreen.tsx # User profile editing
│   │       └── SavedAddressesScreen.tsx      # Address management
│   ├── context/               # React contexts
│   │   └── ThemeContext.tsx   # Theme management
│   ├── stores/                # Zustand state stores
│   │   ├── authStore.ts       # Authentication state
│   │   ├── cartStore.ts       # Shopping cart state
│   │   └── locationStore.ts   # Location state
│   ├── lib/                   # External service integrations
│   │   └── supabase.ts        # Supabase client configuration
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Application types
│   ├── navigation/            # Navigation configuration
│   │   └── index.tsx          # Main navigation setup
│   └── i18n/                  # Internationalization
│       ├── index.ts           # i18n configuration
│       ├── en.ts              # English translations
│       └── hi.ts              # Hindi translations
├── supabase/                  # Database configuration
│   └── database_setup.sql     # Complete database schema
└── assets/                    # Static assets
    ├── images/               # App images
    └── fonts/                # Custom fonts
```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User profiles extending Supabase auth.users
- **businesses**: Business information and settings
- **orders**: Customer orders with real-time status tracking
- **order_items**: Individual items within orders
- **messages**: Real-time messaging between customers and businesses
- **notifications**: Push notifications for users
- **customer_addresses**: Saved customer addresses
- **categories**: Business/product categories
- **products**: Business product listings

### Real-Time Features
- **Row Level Security**: Proper data access control
- **Real-Time Subscriptions**: Live updates for orders, messages, and business data
- **Triggers & Functions**: Automated analytics and data updates
- **Analytics Tables**: Business intelligence and reporting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhinav28birajdar/TownTap.git
   cd TownTap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL script in `supabase/database_setup.sql`
   - Update Supabase configuration in `src/lib/supabase.ts`

4. **Configure environment variables**
   ```bash
   # Create .env file with your Supabase credentials
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```

## 📱 Application Flow

### Authentication Flow
1. **Category Selection**: Users choose Customer or Business Owner
2. **Authentication**: Complete sign up/sign in process
3. **Profile Setup**: Users complete their profile information
4. **Main Application**: Access to appropriate dashboard based on user type

### Customer Journey
1. **Real-Time Home**: Browse nearby businesses with live updates
2. **Product Discovery**: Search and filter products/services
3. **Order Placement**: Add items to cart and place orders
4. **Live Tracking**: Real-time order status updates
5. **Communication**: Direct messaging with businesses

### Business Journey  
1. **Dashboard**: Real-time business metrics and overview
2. **Order Management**: Process incoming orders with status updates
3. **Customer Communication**: Respond to customer messages
4. **Profile Management**: Update business information and settings
5. **Analytics**: View business performance and insights

## 🔄 Real-Time Features Implementation

### Supabase Real-Time Subscriptions
```typescript
// Example: Real-time order updates
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders',
    filter: `customer_id=eq.${userId}`
  }, (payload) => {
    // Handle real-time updates
  })
  .subscribe();
```

### Live Dashboard Updates
- **Business Dashboard**: Real-time stats for messages, customers, orders, revenue
- **Customer Home**: Live order tracking and business availability
- **Order Management**: Instant order status changes
- **Messaging**: Real-time chat functionality

## 🎨 UI/UX Features

### Theming
- **Dark/Light Mode**: Complete theme switching
- **Consistent Design**: Unified color scheme and typography
- **Responsive Layout**: Optimized for different screen sizes

### Navigation
- **Tab Navigation**: Clean 4-tab layout for customers
- **Stack Navigation**: Modal screens for detailed views
- **Deep Linking**: Support for navigation via URLs

### User Experience
- **Loading States**: Proper loading indicators
- **Error Handling**: Comprehensive error management
- **Offline Support**: Graceful handling of network issues
- **Accessibility**: Screen reader and accessibility support

## 🔒 Security Features

### Authentication
- **Supabase Auth**: Secure user authentication
- **Row Level Security**: Database-level access control
- **JWT Tokens**: Secure API communication
- **Password Security**: Secure password handling

### Data Protection
- **Input Validation**: Comprehensive form validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Sanitized user inputs
- **Privacy Controls**: User data privacy settings

## 📊 Analytics & Monitoring

### Business Analytics
- **Order Analytics**: Daily/monthly order statistics
- **Revenue Tracking**: Real-time revenue calculations
- **Customer Insights**: New vs returning customers
- **Product Performance**: Best-selling products/services

### Application Monitoring
- **Real-Time Metrics**: Live application performance
- **Error Tracking**: Comprehensive error logging
- **User Behavior**: User interaction analytics
- **Performance Monitoring**: App speed and responsiveness

## 🚀 Deployment

### Production Build
```bash
# Build for production
npx expo build:android
npx expo build:ios
```

### Environment Setup
- **Production Database**: Supabase production instance
- **Environment Variables**: Production configuration
- **App Store Deployment**: iOS App Store and Google Play Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@towntap.com
- **GitHub Issues**: [Create an issue](https://github.com/abhinav28birajdar/TownTap/issues)
- **Documentation**: [Wiki](https://github.com/abhinav28birajdar/TownTap/wiki)

## 🙏 Acknowledgments

- **Supabase**: For providing the real-time backend infrastructure
- **Expo**: For the excellent React Native development platform
- **React Navigation**: For seamless navigation experience
- **Native Base**: For beautiful UI components

---

**TownTap** - Connecting communities through real-time local business discovery 🏪✨
