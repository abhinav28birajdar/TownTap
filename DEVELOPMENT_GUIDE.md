# TownTap Development Guide

## Project Overview

TownTap is a hyperlocal business discovery and ordering platform built with React Native, Expo, and Supabase. The application connects customers with nearby businesses and service providers.

## Architecture

### Frontend Stack
- **React Native**: Mobile app framework
- **Expo Router**: File-based navigation
- **TypeScript**: Type safety and better development experience
- **Zustand**: State management
- **Moti**: Animations and transitions
- **Expo**: Development platform and tools

### Backend Stack
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Database with PostGIS for location features
- **Row Level Security**: Data security and user permissions
- **Real-time subscriptions**: Live updates

## Project Structure

```
TownTap/
├── src/                           # Main source code
│   ├── components/                # Reusable UI components
│   │   ├── modern/               # Enhanced components with animations
│   │   ├── animations/           # Animation utilities
│   │   └── ui/                   # Basic UI components
│   ├── screens/                  # App screens organized by feature
│   │   ├── auth/                 # Authentication screens
│   │   ├── customer/             # Customer-specific screens
│   │   ├── business/             # Business owner screens
│   │   └── shared/               # Shared screens
│   ├── stores/                   # Zustand state management
│   │   ├── auth-store.ts         # Authentication state
│   │   ├── locationStore.ts      # Location and business discovery
│   │   └── cartStore.ts          # Shopping cart state
│   ├── services/                 # Business logic and API calls
│   │   ├── aiService.ts          # AI-powered features
│   │   ├── businessService.ts    # Business-related operations
│   │   └── locationService.ts    # Location and maps
│   ├── hooks/                    # Custom React hooks
│   ├── navigation/               # Navigation configuration
│   ├── context/                  # React context providers
│   ├── theme/                    # Theme and styling
│   ├── types/                    # TypeScript type definitions
│   └── lib/                      # Utility libraries
├── app/                          # Expo Router pages
├── assets/                       # Static assets (images, fonts)
├── scripts/                      # Development and maintenance scripts
├── database.sql                  # Complete Supabase schema
└── babel.config.js               # Babel configuration with path aliases
```

## Key Features

### Customer Features
1. **Location-based Discovery**: Find nearby businesses using GPS
2. **Category Browsing**: Browse by business categories
3. **Search & Filters**: Advanced search with filters
4. **Order Management**: Place and track orders
5. **Real-time Chat**: Communicate with businesses
6. **Reviews & Ratings**: Rate and review businesses
7. **Favorites**: Save favorite businesses
8. **Multiple Addresses**: Manage delivery addresses

### Business Features
1. **Business Dashboard**: Manage business profile and settings
2. **Product/Service Management**: Add and manage offerings
3. **Order Processing**: Receive and process customer orders
4. **Analytics**: View business performance metrics
5. **Customer Communication**: Chat with customers
6. **AI Content Generation**: Generate descriptions and marketing content

### Technical Features
1. **Offline Support**: Basic functionality without internet
2. **Real-time Updates**: Live order status and chat
3. **Push Notifications**: Order updates and promotional messages
4. **Geolocation**: Precise location tracking with PostGIS
5. **Multi-language**: Support for multiple languages

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd TownTap
   npm install
   ```

2. **Environment Setup**
   Create `.env` file with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
   ```

3. **Database Setup**
   - Create a new Supabase project
   - Run the SQL script from `database.sql` in Supabase SQL Editor
   - Configure RLS policies if needed

4. **Start Development**
   ```bash
   npm run dev          # Start with clean cache
   npm start            # Regular start
   npm run clean-start  # Fix JSX issues and start clean
   ```

## Development Commands

### Primary Commands
- `npm start` - Start Expo development server
- `npm run dev` - Start with clean cache
- `npm run android` - Open on Android device/emulator
- `npm run ios` - Open on iOS simulator (macOS only)

### Maintenance Commands
- `npm run cleanup` - Remove duplicate and empty files
- `npm run optimize` - Optimize project structure
- `npm run final-cleanup` - Complete project cleanup
- `npm run fix-jsx` - Fix JSX syntax issues in node_modules

### Build Commands
- `npm run build` - Build for production
- `npm run prebuild` - Generate native projects

## State Management

### Auth Store (`auth-store.ts`)
Handles user authentication, profile management, and onboarding.

```typescript
// Usage example
const { user, isAuthenticated, loading } = useAuth();
const { signInWithEmail, signOut } = useAuthActions();
```

### Location Store (`locationStore.ts`)
Manages location permissions, current location, and business discovery.

```typescript
// Usage example
const store = useLocationStore();
const businesses = await store.getNearbyBusinesses({
  location: { latitude: 23.2599, longitude: 77.4126 },
  filters: { radius_km: 10, category: 'restaurant' }
});
```

### Cart Store (`cartStore.ts`)
Manages shopping cart state and order processing.

## Component Architecture

### Modern Components
Enhanced components with animations and theme support:
- `ModernButton` - Interactive buttons with haptic feedback
- `ModernCard` - Animated cards with shadows
- `ModernInput` - Form inputs with validation
- `AnimatedPressable` - Pressable with scale animations
- `StaggeredList` - List with staggered animations

### Theme System
Comprehensive theming with light/dark mode support:
```typescript
// Using theme
const { theme, isDark, toggleTheme } = useTheme();
```

## Database Schema

The `database.sql` file contains the complete PostgreSQL schema with:
- User profiles and authentication
- Business management
- Product and service catalogs
- Order processing
- Payment and wallet system
- Reviews and ratings
- Real-time chat
- Location-based search with PostGIS

## API Integration

### Supabase Integration
- Authentication with email/phone
- Real-time subscriptions for orders and chat
- File storage for images
- Geolocation queries with PostGIS

### Third-party Services
- Google Maps API for location services
- Payment gateway integration (Razorpay)
- Push notifications via Firebase

## Testing

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Testing Strategy
- Unit tests for utilities and services
- Component tests with React Native Testing Library
- Integration tests for critical user flows
- E2E tests with Detox

## Deployment

### Development Build
```bash
npx expo build:android
npx expo build:ios
```

### Production Build
1. Configure app.json with production settings
2. Update environment variables
3. Build and submit to app stores

### Database Deployment
1. Set up production Supabase project
2. Run database.sql script
3. Configure environment variables
4. Set up monitoring and backups

## Troubleshooting

### Common Issues

1. **Bundle errors with JSX**
   ```bash
   npm run fix-jsx
   npm run clean-start
   ```

2. **Location not working**
   - Check permissions in app settings
   - Verify Google Maps API key
   - Test on physical device

3. **Supabase connection issues**
   - Verify environment variables
   - Check Supabase project status
   - Review RLS policies

4. **Build failures**
   ```bash
   npx expo install --fix
   npm run clean-start
   ```

### Performance Optimization

1. **Bundle size**
   - Use dynamic imports for large components
   - Optimize images and assets
   - Remove unused dependencies

2. **Rendering performance**
   - Use React.memo for expensive components
   - Implement virtualization for long lists
   - Optimize state updates

3. **Database performance**
   - Use proper indexes
   - Optimize PostGIS queries
   - Implement pagination

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write tests for new features

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run tests and linting
4. Create pull request with description
5. Address review feedback
6. Merge after approval

### Pull Request Template
- Describe changes and motivation
- Include screenshots for UI changes
- List any breaking changes
- Update documentation if needed

## Resources

### Documentation
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Supabase](https://supabase.com/docs)
- [PostGIS](https://postgis.net/documentation/)

### Community
- [React Native Community](https://github.com/react-native-community)
- [Expo Discord](https://discord.gg/4gtbPAdpaE)
- [Supabase Discord](https://discord.supabase.com/)

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and optimize database queries
- Monitor app performance and errors
- Update documentation
- Run security audits

### Monitoring
- Set up error tracking (Sentry)
- Monitor API usage and performance
- Track user analytics
- Monitor database performance
- Set up uptime monitoring
