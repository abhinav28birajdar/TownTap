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

  // Initialize services
  useEffect(() => {
    let mounted = true;

    const initializeServices = async () => {
      try {
        console.log('🚀 Initializing app services...');

        // Check if app is configured
        const configured = await isAppConfigured();
        if (!configured) {
          console.log('⚙️ App not configured, redirecting to config setup...');
          if (mounted) {
            setServicesInitialized(true);
            router.replace('/config-setup');
          }
          return;
        }

        // Initialize Supabase with secure config
        const supabaseReady = await initializeSupabase();
        if (supabaseReady) {
          console.log('✅ Supabase initialized');
        } else {
          console.warn('⚠️ Supabase initialization failed, redirecting to config...');
          if (mounted) {
            setServicesInitialized(true);
            router.replace('/config-setup');
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

        // Register for push notifications
        const pushToken = await notificationService.registerForPushNotifications();
        if (pushToken) {
          console.log('✅ Push token obtained:', pushToken.substring(0, 20) + '...');
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
    }, 100);

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

    if (!session && !inAuthGroup && segments[0] !== 'welcome' && segments[0] !== 'config-setup') {
      router.replace('/welcome');
    } else if (session && !profile) {
      router.replace('/auth/role-selection');
    } else if (session && profile && !inTabs && !inSettings && segments[0] !== 'business' && segments[0] !== 'profile' && segments[0] !== 'notifications' && segments[0] !== 'modal') {
      router.replace('/(tabs)/home');
    }
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
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/role-selection" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="business/[id]" />
        <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
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