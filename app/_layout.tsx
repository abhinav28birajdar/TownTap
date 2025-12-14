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
      if (!session && !inAuthGroup && !inWelcome && !inConfigSetup && !inTabs && !inBusinessOwner && !inCustomer) {
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
        <Stack.Screen name="config-setup" />
        <Stack.Screen name="debug" options={{ headerShown: true, title: 'Debug Info' }} />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/role-selection" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="business/[id]" />
        
        {/* Business Owner Routes */}
        <Stack.Screen name="business-owner/dashboard" />
        <Stack.Screen name="business-owner/notifications" />
        <Stack.Screen name="business-owner/profile" />
        <Stack.Screen name="business-owner/add-product" />
        <Stack.Screen name="business-owner/orders" />
        <Stack.Screen name="business-owner/services" />
        <Stack.Screen name="business-owner/analytics" />
        <Stack.Screen name="business-owner/customers" />
        
        {/* Customer Routes */}
        <Stack.Screen name="customer/dashboard" />
        <Stack.Screen name="customer/search" />
        <Stack.Screen name="customer/bookings" />
        <Stack.Screen name="customer/favorites" />
        <Stack.Screen name="customer/notifications" />
        <Stack.Screen name="customer/profile" />
        <Stack.Screen name="customer/orders" />
        <Stack.Screen name="customer/history" />
        <Stack.Screen name="customer/booking" />
        <Stack.Screen name="customer/location" />
        <Stack.Screen name="customer/tracking" />
        
        {/* Category Routes */}
        <Stack.Screen name="category/[category]" />
        
        {/* Messages Routes */}
        <Stack.Screen name="messages/index" />
        <Stack.Screen name="messages/chat/[id]" />
        
        <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
        <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
        <Stack.Screen name="settings/advanced" options={{ headerShown: true, title: 'Advanced Settings' }} />
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