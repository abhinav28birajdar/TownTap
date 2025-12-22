import { LoadingScreen } from '@/components/ui/loading-screen';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-url-polyfill/auto';

// Import real-time and API key services
import { useRealtime } from '@/hooks/use-realtime';
import { apiKeyHelpers, apiKeyManager } from '@/lib/api-key-manager';
import '@/lib/env-validator'; // Validate environment on app start
import { notificationService } from '@/lib/notification-service';
import { isAppConfigured } from '@/lib/secure-config-manager';
import { initializeSupabase } from '@/lib/supabase';

function RootLayoutNav() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [servicesInitialized, setServicesInitialized] = useState(false);

  // Initialize real-time features
  const realtime = useRealtime({
    enableBookings: true,
    enableMessages: true,
    enableReviews: true,
    enableBusinessUpdates: true,
    enablePresence: false,
    autoReconnect: true,
  });

  // Failsafe: Force initialization after 5 seconds to prevent infinite loading
  useEffect(() => {
    const failsafeTimer = setTimeout(() => {
      if (!servicesInitialized) {
        console.warn('⏱️ Initialization timeout - forcing completion');
        setServicesInitialized(true);
      }
    }, 5000);

    return () => clearTimeout(failsafeTimer);
  }, [servicesInitialized]);

  // Initialize services
  useEffect(() => {
    let mounted = true;

    const initializeServices = async () => {
      try {
        console.log('🚀 Initializing app services...');

        // Check if app is configured
        const configured = await isAppConfigured();
        if (!configured) {
          console.log('⚙️ App not configured - user needs to set up config');
          if (mounted) {
            setServicesInitialized(true);
          }
          return;
        }

        // Initialize Supabase with secure config
        const supabaseReady = await initializeSupabase();
        if (supabaseReady) {
          console.log('✅ Supabase initialized');
        } else {
          console.warn('⚠️ Supabase initialization failed');
          if (mounted) {
            setServicesInitialized(true);
          }
          return;
        }

        // Initialize API key manager
        const apiKeyInitialized = await apiKeyManager.initialize();
        if (apiKeyInitialized) {
          await apiKeyHelpers.initializeCommonKeys();
          console.log('✅ API Key Manager ready');
        }

        // Request notification permissions
        const notificationPermissions = await notificationService.requestPermissions();
        if (notificationPermissions) {
          console.log('✅ Notification permissions granted');
        } else {
          console.warn('⚠️ Notification permissions denied');
        }

        // Register for push notifications (only if projectId is configured)
        const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
        if (projectId && projectId.trim() !== '' && projectId !== 'your-project-id') {
          const pushToken = await notificationService.registerForPushNotifications();
          if (pushToken) {
            console.log('✅ Push token obtained:', pushToken.substring(0, 20) + '...');
          }
        } else {
          console.log('ℹ️ Push notifications disabled - no project ID configured');
        }

        if (mounted) {
          setServicesInitialized(true);
        }

        console.log('✅ All services initialized successfully');
      } catch (error) {
        console.error('❌ Service initialization failed:', error);
        if (mounted) {
          setServicesInitialized(true); // Continue even if some services fail
        }
      }
    };

    initializeServices();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle app state changes for better real-time management
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground
        realtime.clearBadgeCount();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Wait for component to mount before allowing navigation
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only navigate when auth is ready and navigation is ready
    if (!isNavigationReady || loading || !servicesInitialized) {
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';
    const inSettings = segments[0] === 'settings';
    const inConfigSetup = segments[0] === 'config-setup';
    const inWelcome = segments[0] === 'welcome';
    const inBusinessOwner = segments[0] === 'business-owner';
    const inCustomer = segments[0] === 'customer';

    // Check if app is configured (async check done earlier)
    isAppConfigured().then((configured) => {
      if (!configured && !inConfigSetup) {
        router.replace('/config-setup');
        return;
      }

      // Allow access to tabs, business-owner, and customer routes even without session (for demo mode)
      // If user is on welcome screen, don't interfere with navigation
      if (inWelcome) {
        return;
      }

      if (!session && !inAuthGroup && !inConfigSetup && !inTabs && !inBusinessOwner && !inCustomer) {
        router.replace('/welcome');
      } else if (session && !profile && !inAuthGroup) {
        router.replace('/auth/role-selection');
      } else if (session && profile && !inTabs && segments[0] !== 'settings' && segments[0] !== 'business' && segments[0] !== 'business-owner' && segments[0] !== 'customer' && segments[0] !== 'profile' && segments[0] !== 'notifications' && segments[0] !== 'modal') {
        router.replace('/(tabs)/home');
      }
    });
  }, [session, profile, segments, loading, isNavigationReady, servicesInitialized]);

  if (loading || !isNavigationReady || !servicesInitialized) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <OfflineIndicator />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="config-setup" />
        <Stack.Screen name="debug" options={{ headerShown: true, title: 'Debug Info' }} />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/role-selection" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="business/[id]" />
        
        {/* Business Owner Routes */}
        <Stack.Screen name="business-owner/(tabs)" />
        <Stack.Screen name="business-owner/dashboard" />
        <Stack.Screen name="business-owner/notifications" />
        <Stack.Screen name="business-owner/profile" />
        <Stack.Screen name="business-owner/add-product" />
        <Stack.Screen name="business-owner/add-service" />
        <Stack.Screen name="business-owner/orders" />
        <Stack.Screen name="business-owner/services" />
        <Stack.Screen name="business-owner/analytics" />
        <Stack.Screen name="business-owner/customers" />
        <Stack.Screen name="business-owner/customer-details" />
        <Stack.Screen name="business-owner/order-details" />
        <Stack.Screen name="business-owner/earnings" />
        <Stack.Screen name="business-owner/revenue-reports" />
        <Stack.Screen name="business-owner/calendar" />
        <Stack.Screen name="business-owner/pricing-management" />
        <Stack.Screen name="business-owner/service-categories" />
        
        {/* Customer Routes */}
        <Stack.Screen name="customer/dashboard" />
        <Stack.Screen name="customer/search" />
        <Stack.Screen name="customer/bookings" />
        <Stack.Screen name="customer/favorites" />
        <Stack.Screen name="customer/notifications" />
        <Stack.Screen name="customer/notifications-list" />
        <Stack.Screen name="customer/profile" />
        <Stack.Screen name="customer/orders" />
        <Stack.Screen name="customer/history" />
        <Stack.Screen name="customer/order-details" />
        <Stack.Screen name="customer/order-history" />
        <Stack.Screen name="customer/booking" />
        <Stack.Screen name="customer/booking-track" />
        <Stack.Screen name="customer/booking-tracking" />
        <Stack.Screen name="customer/booking-confirmation" />
        <Stack.Screen name="customer/location" />
        <Stack.Screen name="customer/tracking" />
        <Stack.Screen name="customer/addresses" />
        <Stack.Screen name="customer/add-address" />
        <Stack.Screen name="customer/payment-methods" />
        <Stack.Screen name="customer/wallet" />
        <Stack.Screen name="customer/reviews" />
        <Stack.Screen name="customer/advanced-search" />
        <Stack.Screen name="customer/map-view" />
        <Stack.Screen name="customer/loyalty-program" />
        <Stack.Screen name="customer/notification-preferences" />
        <Stack.Screen name="customer/help-support" />
        
        {/* Category Routes */}
        <Stack.Screen name="category/[category]" />
        
        {/* Messages Routes */}
        <Stack.Screen name="messages/index" />
        <Stack.Screen name="messages/chat/[id]" />
        
        {/* Review Routes */}
        <Stack.Screen name="business-reviews/[businessId]" />
        <Stack.Screen name="business-reviews/write-review" />
        
        {/* Booking Routes */}
        <Stack.Screen name="booking/select-service" />
        <Stack.Screen name="booking/booking-form" />
        <Stack.Screen name="booking/confirmation" />
        <Stack.Screen name="booking/success" />
        
        {/* Profile & Settings Routes */}
        <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/edit-simple" />
        <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
        <Stack.Screen name="settings/advanced" options={{ headerShown: true, title: 'Advanced Settings' }} />
        <Stack.Screen name="settings/theme" />
        <Stack.Screen name="settings/language" />
        <Stack.Screen name="settings/about" />
        <Stack.Screen name="settings/privacy" />
        <Stack.Screen name="settings/terms" />
        <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      
      {/* Toast notifications */}
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}