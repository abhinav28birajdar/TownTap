import { LoadingScreen } from '@/components/ui/loading-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import 'react-native-url-polyfill/auto';

function RootLayoutNav() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Wait for component to mount before allowing navigation
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only navigate when auth is ready and navigation is ready
    if (!isNavigationReady || loading) {
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
  }, [session, profile, segments, loading, isNavigationReady]);

  if (loading || !isNavigationReady) {
    return <LoadingScreen />;
  }

  return (
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
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}