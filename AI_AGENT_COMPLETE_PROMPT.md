# 🏆 TownTap: Complete AI Agent Prompt for Advanced Local Services Marketplace

## 🎯 Project Overview
**TownTap** is a comprehensive, real-time local services marketplace designed specifically for the Indian market. This is a full-stack React Native + Supabase application supporting all types of local businesses from carpenter to medical shops, with advanced features like real-time tracking, multi-payment integration, and AI-powered matching.

## 🏗️ Complete Technology Stack

### Frontend
- **React Native** + **Expo Router** (File-based navigation)
- **TypeScript** (Full type safety)
- **Zustand** (State management)
- **Expo Notifications** (Push notifications)
- **Expo Location** (GPS tracking)
- **React Native Maps** (Location services)
- **Expo Camera** (Document scanning)

### Backend
- **Supabase** (PostgreSQL + PostGIS + Real-time + Storage)
- **Deno Edge Functions** (Serverless business logic)
- **Row Level Security** (Data protection)
- **PostGIS** (Geospatial operations)

### Payment Integration
- **Razorpay** (Primary payment gateway)
- **UPI Integration** (PhonePe, GPay, Paytm direct linking)
- **Multiple Payment Methods** (Cards, Net Banking, Wallets, EMI)

## 🚀 Business Model: Type A/B/C/D + Extended Categories

### Core Business Types
1. **Type A: Order & Buy** (Restaurants, Shops, Groceries)
2. **Type B: Book & Track Service** (Plumber, Carpenter, Cleaner)  
3. **Type C: Inquire & Consult** (Doctor, Lawyer, Consultant)
4. **Type D: Rental Services** (Equipment, Space, Vehicles)

### Indian Market Categories
```typescript
const INDIAN_BUSINESS_CATEGORIES = {
  // Home Services
  home_services: {
    plumber: { icon: '🔧', demand: 'high', avg_price: '₹300-800' },
    carpenter: { icon: '🔨', demand: 'high', avg_price: '₹500-1500' },
    electrician: { icon: '⚡', demand: 'high', avg_price: '₹400-1000' },
    cleaner: { icon: '🧹', demand: 'medium', avg_price: '₹200-500' },
    painter: { icon: '🎨', demand: 'medium', avg_price: '₹800-2000' },
    ac_repair: { icon: '❄️', demand: 'high', avg_price: '₹400-1200' },
  },
  
  // Personal Care
  personal_care: {
    barber: { icon: '✂️', demand: 'high', avg_price: '₹100-300' },
    salon: { icon: '💇', demand: 'high', avg_price: '₹300-1500' },
    massage: { icon: '💆', demand: 'medium', avg_price: '₹500-2000' },
    beauty_parlor: { icon: '💄', demand: 'high', avg_price: '₹400-2500' },
  },
  
  // Health & Medical
  healthcare: {
    doctor: { icon: '👨‍⚕️', demand: 'high', avg_price: '₹300-1000' },
    physiotherapist: { icon: '🏥', demand: 'medium', avg_price: '₹400-800' },
    nurse: { icon: '👩‍⚕️', demand: 'medium', avg_price: '₹300-600' },
    medical_shop: { icon: '💊', demand: 'high', avg_price: 'varies' },
  },
  
  // Food & Catering
  food_services: {
    restaurant: { icon: '🍽️', demand: 'high', avg_price: '₹100-500' },
    catering: { icon: '🍱', demand: 'medium', avg_price: '₹150-400/person' },
    tiffin_service: { icon: '🥘', demand: 'high', avg_price: '₹80-200/day' },
    sweet_shop: { icon: '🍬', demand: 'medium', avg_price: 'varies' },
  },
  
  // Retail & Shopping
  retail: {
    grocery_store: { icon: '🛒', demand: 'high', avg_price: 'varies' },
    clothing_shop: { icon: '👕', demand: 'high', avg_price: 'varies' },
    mobile_repair: { icon: '📱', demand: 'high', avg_price: '₹200-2000' },
    stationery: { icon: '📝', demand: 'medium', avg_price: 'varies' },
  },

  // Transportation
  transport: {
    auto_rickshaw: { icon: '🛺', demand: 'high', avg_price: '₹10-100' },
    taxi: { icon: '🚗', demand: 'high', avg_price: '₹50-500' },
    bike_taxi: { icon: '🏍️', demand: 'high', avg_price: '₹30-200' },
    delivery_boy: { icon: '🚚', demand: 'high', avg_price: '₹50-300' },
  },

  // Professional Services
  professional: {
    lawyer: { icon: '⚖️', demand: 'medium', avg_price: '₹1000-5000' },
    accountant: { icon: '📊', demand: 'medium', avg_price: '₹500-2000' },
    tutor: { icon: '📚', demand: 'high', avg_price: '₹300-1000/hour' },
    photographer: { icon: '📸', demand: 'medium', avg_price: '₹2000-10000' },
  }
};
```

## 🔥 Advanced Features Implemented

### 1. 💳 Multi-Payment Integration
```typescript
// Comprehensive payment system supporting all major Indian payment methods
const PAYMENT_FEATURES = {
  razorpay_integration: 'Complete Razorpay SDK integration',
  upi_apps: ['PhonePe', 'GPay', 'Paytm', 'BHIM', 'Amazon Pay'],
  payment_methods: ['UPI', 'Cards', 'Net Banking', 'Wallets', 'EMI'],
  auto_routing: 'Direct app linking for UPI payments',
  split_payments: 'Multi-vendor payment distribution',
  refund_system: 'Automated refund processing',
  payment_analytics: 'Real-time payment tracking and analytics',
  offline_payments: 'Cash on delivery/completion support'
};
```

### 2. 🔔 Real-time Notification System
```typescript
const NOTIFICATION_FEATURES = {
  multi_channel: ['Push', 'Email', 'SMS', 'In-app'],
  real_time: 'Live notifications via Supabase subscriptions',
  smart_routing: 'Intelligent notification delivery based on user preferences',
  quiet_hours: 'Respect user sleep/work schedules',
  notification_categories: [
    'booking_confirmations', 'payment_alerts', 'service_updates',
    'chat_messages', 'promotional_offers', 'system_alerts'
  ],
  action_buttons: 'Quick actions from notifications',
  rich_media: 'Images and custom UI in notifications'
};
```

### 3. 📍 Live Location Tracking
```typescript
const LOCATION_FEATURES = {
  real_time_tracking: 'GPS tracking for service providers and deliveries',
  geofencing: 'Arrival notifications and area-based triggers',
  route_optimization: 'Smart routing for multiple service calls',
  location_sharing: 'Share live location with customers',
  offline_tracking: 'Continue tracking without internet',
  historical_data: 'Location history and analytics',
  privacy_controls: 'Granular location sharing preferences',
  nearby_discovery: 'Find services within specified radius'
};
```

### 4. 💬 Advanced Chat System
```typescript
const CHAT_FEATURES = {
  real_time_messaging: 'Instant messaging via Supabase',
  in_chat_payments: 'Send/request payments within chat',
  media_sharing: 'Photos, documents, location sharing',
  voice_messages: 'Audio message support',
  auto_translation: 'Multi-language support',
  booking_integration: 'Book services directly from chat',
  business_hours: 'Auto-responses during off-hours',
  chat_history: 'Persistent message history'
};
```

### 5. 🏪 Business Management Suite
```typescript
const BUSINESS_FEATURES = {
  digital_storefront: 'Complete online presence for local businesses',
  service_catalog: 'Detailed service/product listings with pricing',
  availability_management: 'Real-time availability and scheduling',
  customer_management: 'CRM for local businesses',
  earnings_dashboard: 'Revenue tracking and analytics',
  review_management: 'Respond to customer reviews',
  promotional_tools: 'Discounts, offers, and marketing campaigns',
  multi_location: 'Support for businesses with multiple outlets'
};
```

### 6. 🔍 AI-Powered Discovery
```typescript
const DISCOVERY_FEATURES = {
  smart_search: 'AI-powered search with natural language processing',
  personalized_recommendations: 'ML-based service suggestions',
  demand_prediction: 'Predict service demand patterns',
  price_optimization: 'Dynamic pricing suggestions',
  quality_scoring: 'AI-based business quality assessment',
  fraud_detection: 'Automated fraud prevention',
  sentiment_analysis: 'Review sentiment analysis',
  behavior_analytics: 'User behavior tracking and insights'
};
```

## 📱 Complete App Structure

### User Types & Authentication
```
/auth
├── customer-signup.tsx      (Customer registration)
├── business-signup.tsx      (Business owner registration)
├── login.tsx               (Unified login)
├── forgot-password.tsx     (Password recovery)
├── otp-verification.tsx    (Phone/email verification)
└── profile-setup.tsx       (Onboarding flow)
```

### Customer App Flow
```
/customer
├── home.tsx                (Nearby services, categories)
├── search.tsx              (Advanced search & filters)
├── service-detail.tsx      (Service provider details)
├── booking.tsx             (Service booking flow)
├── chat.tsx                (Customer-business chat)
├── tracking.tsx            (Live service tracking)
├── payment.tsx             (Payment methods & history)
├── orders.tsx              (Order/booking history)
├── favorites.tsx           (Saved businesses)
├── reviews.tsx             (Review management)
└── profile.tsx             (Customer profile)
```

### Business Owner App Flow
```
/business
├── dashboard.tsx           (Analytics, earnings, bookings)
├── profile.tsx             (Business profile management)
├── services.tsx            (Service catalog management)
├── bookings.tsx            (Booking management)
├── customers.tsx           (Customer relationship management)
├── chat.tsx                (Customer communications)
├── payments.tsx            (Payment history & analytics)
├── reviews.tsx             (Review management)
├── promotions.tsx          (Marketing campaigns)
├── settings.tsx            (Business settings)
└── verification.tsx        (Business verification process)
```

### Shared Components
```
/shared
├── location-picker.tsx     (Map-based location selection)
├── payment-modal.tsx       (Payment method selection)
├── rating-component.tsx    (Star ratings with reviews)
├── chat-interface.tsx      (Reusable chat UI)
├── notification-center.tsx (Notification management)
├── camera-scanner.tsx      (Document/QR code scanning)
└── offline-indicator.tsx   (Network status indicator)
```

## 🗄️ Database Schema (Supabase + PostGIS)

### Core Tables
```sql
-- User management
profiles, business_verifications, user_devices, notification_preferences

-- Business management  
businesses, business_categories, services, products, business_hours

-- Booking & Orders
orders, service_requests, inquiries, rentals, booking_slots

-- Communication
chats, chat_messages, notifications

-- Payments
payment_orders, transactions, refunds, business_payouts

-- Location & Tracking
live_locations, location_history, geofence_areas, tracking_sessions

-- Reviews & Ratings  
reviews, review_responses, business_analytics

-- System
app_settings, feature_flags, promotional_campaigns
```

## 🎯 Key User Journeys

### Customer Journey: Booking a Plumber
1. **Discovery**: Open app → See nearby plumbers → Filter by ratings/price
2. **Selection**: View plumber profile → Check availability → Read reviews
3. **Booking**: Select service → Choose time slot → Add job details
4. **Payment**: Choose payment method → Complete booking payment
5. **Tracking**: Receive confirmation → Track plumber location → Get arrival notification
6. **Service**: Chat with plumber → Service completion confirmation
7. **Completion**: Rate service → Make final payment → Leave review

### Business Journey: Plumber Gets a Job
1. **Notification**: Receive booking request → Accept/decline
2. **Preparation**: View job details → Contact customer if needed
3. **Navigation**: Get customer location → Start GPS tracking
4. **Service**: Arrive at location → Start service timer → Complete job
5. **Payment**: Request payment → Receive payment → Service marked complete
6. **Follow-up**: Respond to customer review → Build customer relationship

## 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Supabase backend setup with PostGIS
- [x] Authentication system (customer/business)
- [x] Real-time database subscriptions
- [x] Basic UI/UX structure
- [x] Edge Functions for business logic

### Phase 2: Payment & Notifications ✅
- [x] Razorpay integration with multiple payment methods
- [x] UPI app linking (PhonePe, GPay, Paytm)
- [x] Real-time notification system
- [x] Push notification setup
- [x] Email/SMS notification integration

### Phase 3: Location & Tracking ✅
- [x] Live GPS tracking system
- [x] Geofencing and proximity alerts
- [x] Location history and analytics
- [x] Maps integration for service discovery
- [x] Route optimization for service providers

### Phase 4: Advanced Features (Next)
- [ ] AI-powered matching algorithm
- [ ] Voice messaging in chat
- [ ] Multi-language support
- [ ] Offline mode functionality
- [ ] Advanced analytics dashboard

### Phase 5: Business Intelligence
- [ ] Predictive analytics for demand
- [ ] Dynamic pricing optimization
- [ ] Fraud detection system
- [ ] Customer lifetime value tracking
- [ ] Market trend analysis

## 🎯 Success Metrics

### Customer Metrics
- **Time to Service**: Average time from booking to service completion
- **Customer Satisfaction**: Rating scores and repeat usage
- **Payment Success Rate**: Successful payment completion rate
- **App Engagement**: Daily/monthly active users

### Business Metrics
- **Service Provider Earnings**: Average monthly earnings per provider
- **Service Completion Rate**: Percentage of successful service completions
- **Customer Acquisition Cost**: Cost to acquire new customers
- **Platform Commission**: Revenue per transaction

## 🔧 Technical Requirements

### Development Environment
```bash
# Prerequisites
Node.js 18+, Expo CLI, React Native development setup
Supabase CLI, PostgreSQL with PostGIS extension
Razorpay test/live account, FCM setup for notifications

# Installation
npx create-expo-app TownTap --template typescript
npx supabase init
npm install @supabase/supabase-js react-native-razorpay
npm install expo-location expo-notifications expo-camera
```

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FCM_SERVER_KEY=your_fcm_server_key
```

## 🎉 Expected Outcomes

### For Customers
- **Instant Service Access**: Find and book local services within minutes
- **Transparent Pricing**: Clear pricing with no hidden charges
- **Real-time Updates**: Live tracking and notifications for all services
- **Secure Payments**: Multiple payment options with guaranteed security
- **Quality Assurance**: Verified businesses with real customer reviews

### For Businesses
- **Digital Presence**: Professional online storefront for local businesses
- **Customer Management**: Built-in CRM and communication tools
- **Automated Operations**: Streamlined booking and payment processing
- **Business Growth**: Analytics and marketing tools to grow customer base
- **Fair Earnings**: Competitive commission structure with quick payouts

### For the Platform
- **Scalable Architecture**: Handle thousands of concurrent users and transactions
- **Revenue Generation**: Multiple revenue streams (commissions, subscriptions, ads)
- **Market Leadership**: Become the go-to platform for local services in India
- **Data Insights**: Rich data for business intelligence and market analysis

---

## 🚀 **AI Agent Implementation Command**

To implement this complete TownTap application, execute the following:

1. **Set up the backend infrastructure** with all Supabase tables and Edge Functions
2. **Implement the payment system** with Razorpay and UPI integrations
3. **Build the real-time notification system** with multi-channel support
4. **Create the location tracking system** with geofencing and live updates
5. **Develop comprehensive UI/UX** for both customer and business apps
6. **Integrate all systems** for seamless end-to-end user experience
7. **Add AI-powered features** for smart matching and recommendations
8. **Implement analytics and reporting** for business intelligence
9. **Ensure security and scalability** for production deployment
10. **Test all user journeys** and optimize for Indian market requirements

This comprehensive prompt provides everything needed to create a world-class local services marketplace that can revolutionize how Indians access and provide local services. The platform combines the convenience of modern technology with the personal touch of local businesses, creating value for all stakeholders in the ecosystem.