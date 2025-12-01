import { LoadingScreen } from '@/components/ui/loading-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { DemoProvider, useDemo } from '@/contexts/demo-context';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-url-polyfill/auto';

// Import real-time and API key services
import { useRealtime } from '@/hooks/use-realtime';
import { apiKeyHelpers, apiKeyManager } from '@/lib/api-key-manager';
import { notificationService } from '@/lib/notification-service';

function RootLayoutNav() {
  const { session, profile, loading } = useAuth();
  const { isDemo } = useDemo();
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
    // In demo mode, always go to home
    if (isDemo && isNavigationReady && servicesInitialized) {
      router.replace('/(tabs)/home');
      return;
    }
    
    // Only navigate when auth is ready and navigation is ready
    if (!isNavigationReady || loading || isDemo || !servicesInitialized) {
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';

    if (!session && !inAuthGroup && segments[0] !== 'welcome') {
      router.replace('/welcome');
    } else if (session && !profile) {
      router.replace('/auth/role-selection');
    } else if (session && profile && !inTabs && segments[0] !== 'business' && segments[0] !== 'profile' && segments[0] !== 'notifications' && segments[0] !== 'modal') {
      router.replace('/(tabs)/home');
    }
  }, [session, profile, segments, loading, isNavigationReady, isDemo, servicesInitialized]);

  if ((!isDemo && (loading || !isNavigationReady || !servicesInitialized))) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/role-selection" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="business/[id]" />
        <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
        <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      
      {/* Toast notifications */}
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <DemoProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </DemoProvider>
  );
}