# TownTap Upgrade Guide

## Overview
This document outlines the step-by-step process to upgrade TownTap from Expo SDK 53 to SDK 54, fix dependency conflicts, and modernize the application.

## Pre-Upgrade Checklist

### Prerequisites
- [ ] Node.js 18+ or 20+ installed
- [ ] npm 8+ or yarn 1.22+ installed
- [ ] Expo CLI installed: `npm install -g @expo/cli@latest`
- [ ] EAS CLI installed: `npm install -g eas-cli@latest`
- [ ] Git repository is clean (no uncommitted changes)
- [ ] Create full backup of project

### Environment Verification
```bash
# Check versions
node --version        # Should be 18+ or 20+
npm --version         # Should be 8+
npx expo --version    # Should be 0.24+
eas --version         # Should be latest

# Backup current state
git status
git add .
git commit -m "Pre-upgrade backup"
git tag pre-upgrade-backup
```

## Phase 1: Dependency Resolution (Critical Issues)

### Step 1: Fix Security Vulnerabilities
```bash
# Install with legacy peer deps first
npm install --legacy-peer-deps

# Check vulnerabilities
npm audit

# Fix critical vulnerabilities
npm update babel-traverse
npm update @babel/core @babel/cli
```

### Step 2: Resolve React Version Conflicts
```bash
# Option A: Downgrade @shopify/react-native-skia to compatible version
npm install @shopify/react-native-skia@1.3.11 --legacy-peer-deps

# Option B: Upgrade React (more risky, test thoroughly)
# npm install react@19.0.0 react-dom@19.0.0 --legacy-peer-deps
```

### Step 3: Replace Vulnerable Native Base
```bash
# Remove native-base (has lodash.pick vulnerability)
npm uninstall native-base

# Replace with modern alternative
npm install react-native-paper@5.12.3 --legacy-peer-deps
# OR
npm install @tamagui/core @tamagui/config @tamagui/animations-react-native --legacy-peer-deps
```

## Phase 2: Expo SDK Upgrade

### Step 1: Update Expo SDK
```bash
# Update Expo CLI first
npm install -g @expo/cli@latest

# Upgrade Expo SDK
npx expo install --fix
npx expo upgrade 54

# Update app.json
# Change "sdkVersion": "53.0.0" to "54.0.0"
```

### Step 2: Update Dependencies
```bash
# Install SDK 54 compatible versions
npx expo install expo@54.0.0
npx expo install react-native@0.77.8
npx expo install @expo/vector-icons@14.2.0
npx expo install expo-router@4.2.0

# Update React Navigation
npm install @react-navigation/native@7.2.0 @react-navigation/native-stack@7.4.0 @react-navigation/bottom-tabs@7.5.0 --legacy-peer-deps

# Update other core packages
npx expo install expo-location expo-notifications expo-image-picker expo-haptics expo-auth-session
```

### Step 3: Update Configuration Files

#### app.json Updates
```json
{
  "expo": {
    "sdkVersion": "54.0.0",
    "plugins": [
      "expo-router",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "This app needs access to location for business discovery and delivery tracking."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff",
          "defaultChannel": "default"
        }
      ]
    ]
  }
}
```

#### metro.config.js Updates
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push('sql');

// Configure transformer for better performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
```

## Phase 3: Code Modernization

### Step 1: Consolidate Duplicate Files
```bash
# Remove duplicates (already backed up)
rm src/stores/authStore.ts
rm src/stores/locationStore.ts
rm src/screens/business/ModernBusinessDashboard.tsx

# Rename consolidated versions
mv src/stores/locationStoreNew.ts src/stores/locationStore.ts
```

### Step 2: Fix TypeScript Errors
All TypeScript errors have been automatically fixed in the consolidated codebase.

### Step 3: Update Navigation Structure
The navigation structure has been modernized to use the latest React Navigation v7 patterns.

## Phase 4: Real-time Features Enhancement

### Supabase Real-time Setup
```typescript
// Real-time subscription improvements
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

// Enhanced real-time features
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'orders' },
    (payload) => {
      // Handle real-time order updates
    }
  )
  .subscribe();
```

## Phase 5: Testing & Validation

### Step 1: Run Build Tests
```bash
# Clear cache and test build
npx expo start --clear
npx expo prebuild --clean

# Test on simulator/device
npx expo run:ios
npx expo run:android
```

### Step 2: Smoke Testing
- [ ] App starts without crashes
- [ ] Authentication works (login/signup)
- [ ] Location services work
- [ ] Business discovery functions
- [ ] Real-time updates work
- [ ] Navigation flows work
- [ ] AI features respond

### Step 3: Performance Testing
```bash
# Bundle size analysis
npx expo export
# Check .expo/dist/ folder size

# Memory usage testing
# Use React DevTools Profiler
# Monitor for memory leaks in real-time subscriptions
```

## Phase 6: Deployment

### EAS Build Setup
```bash
# Configure EAS
eas init
eas build:configure

# Update eas.json
{
  "cli": {
    "version": ">= 8.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Build Commands
```bash
# Development build
eas build --platform all --profile development

# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform all
```

## Rollback Plan

If issues occur during upgrade:

```bash
# Rollback to pre-upgrade state
git reset --hard pre-upgrade-backup
npm install --legacy-peer-deps

# Or rollback specific changes
git checkout HEAD~1 -- package.json package-lock.json
npm install --legacy-peer-deps
```

## Post-Upgrade Monitoring

### Key Areas to Monitor
1. **App Stability**: Crash reporting via Sentry/Crashlytics
2. **Performance**: Load times, memory usage
3. **Real-time Features**: Connection stability
4. **User Experience**: Navigation smoothness
5. **AI Features**: Response times and accuracy

### Success Metrics
- [ ] Zero critical crashes in first 24 hours
- [ ] Load time improved or maintained
- [ ] All core features working
- [ ] User engagement maintained
- [ ] Build size within acceptable limits

## Timeline Estimate

- **Dependency Resolution**: 4-6 hours
- **SDK Upgrade**: 6-8 hours  
- **Code Modernization**: 8-12 hours
- **Testing & Validation**: 12-16 hours
- **Deployment Setup**: 4-6 hours

**Total**: 34-48 hours (4-6 working days)

## Support Resources

- [Expo SDK 54 Release Notes](https://blog.expo.dev/expo-sdk-54-0-0-is-now-available-8554ef7ec6d3)
- [React Navigation 7 Migration Guide](https://reactnavigation.org/docs/upgrading-from-6.x)
- [React Native 0.77 Changes](https://github.com/facebook/react-native/releases/tag/v0.77.0)

---

*Generated on September 1, 2025*
