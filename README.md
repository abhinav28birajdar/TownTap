# 🏘️ TownTap - Multi-Business Service Marketplace

<div align="center">
  <img src="./assets/icon.png" alt="TownTap Logo" width="120" height="120" style="border-radius: 20px;" />
  
  **Your Complete Local Service Ecosystem**
  
  *Connecting communities with trusted local businesses*
</div>

## 🌟 Overview

TownTap is a comprehensive multi-business service marketplace that connects customers with local service providers across various categories including carpentry, plumbing, electrical work, cleaning services, catering, stationery, groceries, and more. Built with React Native and powered by Supabase, it offers a seamless experience for both customers seeking services and business owners looking to grow their customer base.

## ✨ Key Features

### 🙋‍♂️ For Customers
- **🔍 Smart Discovery**: Find local businesses by category, location, and ratings
- **📅 Easy Booking**: Schedule services with preferred dates and times
- **💳 Flexible Payments**: Cash, UPI (GPay, PhonePe, Paytm), and online options
- **📍 Live Tracking**: Real-time service provider location during appointments
- **⭐ Trust System**: Comprehensive reviews and ratings
- **💬 Communication**: In-app chat and calling with service providers
- **🔖 Favorites**: Save preferred businesses for quick access
- **🔔 Smart Notifications**: Updates on bookings, offers, and service status

### 🏪 For Business Owners
- **📊 Business Dashboard**: Complete overview of orders, earnings, and performance
- **🛠️ Service Management**: Add/edit services, pricing, and availability
- **📱 Order Management**: Accept, track, and complete customer requests
- **💰 Earnings Tracking**: Detailed financial insights and payout management
- **📈 Analytics**: Business performance metrics and customer insights
- **🎯 Customer Engagement**: Direct communication and relationship building
- **✅ Verification System**: Build trust through ID verification and reviews

### 🔐 Security & Trust
- **🔒 Secure Authentication**: Multi-factor authentication and OTP verification
- **🆔 ID Verification**: KYC process for business owners
- **🔐 Data Protection**: End-to-end encryption and secure payment processing
- **🛡️ Fraud Prevention**: Advanced security measures and user reporting

## 🛠️ Technical Stack

### Frontend (Mobile App)
- **Framework**: React Native + Expo (SDK 52+)
- **Language**: TypeScript with strict type checking
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + TanStack Query
- **UI/UX**: Custom components with consistent design system
- **Maps**: React Native Maps + Expo Location
- **Payments**: Stripe React Native + UPI integrations
- **Real-time**: WebSocket connections for live tracking
- **Storage**: Expo Secure Store + AsyncStorage

### Backend Infrastructure
- **BaaS**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Authentication**: JWT-based with refresh tokens
- **File Storage**: Supabase Storage for images/documents
- **Real-time**: Supabase Realtime for live updates
- **Edge Functions**: Serverless functions for business logic

### Third-Party Services
- **Payments**: Stripe, Razorpay, UPI
- **SMS/OTP**: Twilio, Firebase Auth
- **Maps**: Google Maps Platform
- **Push Notifications**: Expo Notifications
- **Analytics**: Custom dashboard + Google Analytics

## 📱 App Architecture

```
TownTap/
├── 🎯 Authentication Flow
│   ├── Splash Screen
│   ├── Welcome/Onboarding
│   ├── Role Selection
│   ├── Sign In/Sign Up
│   ├── OTP Verification
│   └── Password Recovery
├── 👤 Customer Experience
│   ├── Home Dashboard
│   ├── Search & Discovery
│   ├── Business Profiles
│   ├── Service Booking
│   ├── Order Tracking
│   ├── Payment Processing
│   ├── Reviews & Ratings
│   └── Profile Management
├── 🏪 Business Owner Panel
│   ├── Business Dashboard
│   ├── Service Management
│   ├── Order Management
│   ├── Customer Communication
│   ├── Analytics & Insights
│   ├── Earnings & Payouts
│   └── Business Settings
├── ⚙️ System Features
│   ├── Settings & Preferences
│   ├── Support & Help
│   ├── Privacy & Security
│   └── Error Handling
└── 🔧 Utilities
    ├── Loading States
    ├── Offline Support
    ├── Force Updates
    └── Maintenance Mode
```

## 🗃️ Database Schema

### Core Tables
```sql
-- User Management
profiles, user_addresses, user_preferences, user_sessions

-- Business Management  
businesses, business_categories, business_services, business_hours, 
business_photos, business_verifications

-- Order & Booking System
bookings, booking_items, booking_status_history, service_pricing

-- Payment & Financial
transactions, payment_methods, business_earnings, payout_requests

-- Communication & Support
messages, conversations, notifications, support_tickets

-- Reviews & Trust
reviews, business_ratings, user_reports, verification_documents

-- Location & Tracking
user_locations, business_locations, service_areas, delivery_tracking
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- Supabase account
- Google Cloud Platform account (for Maps)
- Stripe account (for payments)

### Quick Setup
```bash
# Clone repository
git clone https://github.com/your-username/towntap.git
cd towntap

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npx expo start

# Run on devices
npx expo run:android
npx expo run:ios
```

### Environment Configuration
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Services
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_SERVICES_JSON=path-to-google-services.json

# Payment Gateways
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Communication
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
```

## 🎨 Design System

### Color Palette
```typescript
// Primary Colors
primary: '#6366F1',        // Indigo
primaryDark: '#4F46E5',    // Dark Indigo  
primaryLight: '#818CF8',   // Light Indigo

// Secondary Colors
secondary: '#EC4899',      // Pink
accent: '#10B981',         // Emerald
warning: '#F59E0B',        // Amber
error: '#EF4444',          // Red
success: '#10B981',        // Green

// Neutral Colors
background: '#FFFFFF',     // White
backgroundGray: '#F9FAFB', // Light Gray
card: '#FFFFFF',           // White
border: '#E5E7EB',         // Gray
text: '#111827',           // Dark Gray
textSecondary: '#6B7280',  // Medium Gray
textLight: '#9CA3AF',      // Light Gray
```

### Typography Scale
```typescript
// Font Sizes
xs: 12,    // Small labels
sm: 14,    // Body text
md: 16,    // Default text
lg: 18,    // Subheadings
xl: 20,    // Headings
xxl: 24,   // Large headings
xxxl: 32,  // Display text

// Font Weights
light: '300',
normal: '400',
medium: '500',
semibold: '600',
bold: '700',
extrabold: '800',
```

## 📊 Features Breakdown

### Authentication System (8 pages)
- Splash screen with app branding
- Welcome screen with feature highlights
- Onboarding slides for user education
- Role selection (Customer/Business Owner)
- Sign in with email/phone/social
- Sign up with validation
- OTP verification for security
- Password recovery flow

### Customer Features (15 pages)
- Personalized home dashboard
- Advanced search and filters
- Category-based discovery
- Interactive map view
- Detailed business profiles
- Service comparison
- Real-time booking
- Multiple payment options
- Live order tracking
- Review and rating system

### Business Features (12 pages)
- Comprehensive business dashboard
- Service and inventory management
- Order processing workflow
- Customer relationship tools
- Financial tracking and analytics
- Marketing and promotion tools

### Support System (10 pages)
- In-app help and FAQ
- Live customer support
- Feedback and reporting
- Privacy and security controls
- Account management tools

## 🔄 Real-time Features

### For Customers
- **Live Order Tracking**: See service provider location in real-time
- **Instant Messaging**: Chat with service providers
- **Status Updates**: Real-time booking status changes
- **Push Notifications**: Order updates and promotional offers

### For Business Owners
- **Order Alerts**: Instant notification of new bookings
- **Customer Location**: Navigate to customer address
- **Earnings Updates**: Real-time revenue tracking
- **Customer Messages**: Instant chat notifications

## 💳 Payment Integration

### Supported Methods
1. **Digital Payments**
   - UPI (GPay, PhonePe, Paytm)
   - Credit/Debit Cards
   - Net Banking
   - Digital Wallets

2. **Cash Payments**
   - Cash on Delivery/Service
   - Pay after service completion

3. **Business Payments**
   - Subscription plans for premium features
   - Commission-based revenue model
   - Instant payouts to business accounts

## 📈 Business Model

### Revenue Streams
1. **Service Commission**: Percentage of transaction value
2. **Subscription Plans**: Premium features for businesses
3. **Advertisement**: Promoted business listings
4. **Lead Generation**: Qualified customer referrals

### Pricing Strategy
- **Customers**: Free to use with no hidden charges
- **Basic Business**: Free with standard commission
- **Premium Business**: Monthly subscription with reduced commission
- **Enterprise**: Custom pricing for large businesses

## 🔒 Security & Privacy

### Data Protection
- **Encryption**: All data encrypted in transit and at rest
- **Privacy Controls**: User data ownership and control
- **Compliance**: GDPR, CCPA compliance ready
- **Audit Logs**: Complete activity tracking

### Trust & Safety
- **Identity Verification**: KYC for business owners
- **Background Checks**: Criminal record verification
- **Insurance**: Service guarantee and liability coverage
- **Dispute Resolution**: Built-in mediation system

## 🚀 Production Deployment

### Mobile App Distribution
```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### Backend Infrastructure
- **Database**: Supabase Production tier
- **CDN**: Global content distribution
- **Monitoring**: Real-time error tracking
- **Backup**: Automated daily backups
- **Scaling**: Auto-scaling server instances

## 📱 Device Support

### Minimum Requirements
- **iOS**: 12.0+ (iPhone 6s and newer)
- **Android**: API level 23+ (Android 6.0+)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 100MB app size, 500MB data

### Supported Features
- **Geolocation**: GPS and network location
- **Camera**: Photo capture for profiles/documents
- **Push Notifications**: Real-time alerts
- **Biometrics**: Fingerprint/Face ID authentication
- **Offline Mode**: Basic functionality without internet

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test thoroughly
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📞 Support & Contact

- **Documentation**: [docs.towntap.com](https://docs.towntap.com)
- **Email Support**: support@towntap.com
- **Business Inquiries**: business@towntap.com
- **Bug Reports**: [GitHub Issues](https://github.com/your-username/towntap/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/towntap/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Community** for the amazing framework
- **Expo Team** for developer-friendly tools
- **Supabase** for powerful backend infrastructure
- **Contributors** who help improve TownTap
- **Local Businesses** who inspire our mission

---

<div align="center">
  <strong>Built with ❤️ for local communities</strong>
  
  **Version 1.0.0** | **Last Updated: November 2025** | **Status: 🚀 Production Ready**
  
  [Download on App Store](https://apps.apple.com) | [Get it on Google Play](https://play.google.com)
</div>