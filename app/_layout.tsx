/**
 * TownTap - Root Layout
 * Main application layout with authentication and navigation
 */

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-url-polyfill/auto';

// Colors
const Colors = {
  primary: '#2563EB',
  white: '#FFFFFF',
};

function RootLayoutNav() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Short delay to ensure navigation is ready
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inPublicGroup = segments[0] === 'public';
    const inOnboarding = segments[0] === 'onboarding';

    // Public routes are always accessible
    if (inPublicGroup) return;

    // Redirect unauthenticated users to auth
    if (!session && !inAuthGroup && !inOnboarding) {
      router.replace('/auth/sign-in');
    }
  }, [session, segments, loading, isReady]);

  if (loading || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Public Routes */}
        <Stack.Screen name="index" />
        <Stack.Screen name="public" />
        
        {/* Auth Routes */}
        <Stack.Screen name="auth" />
        
        {/* Onboarding Routes */}
        <Stack.Screen name="onboarding" />
        
        {/* Customer Routes */}
        <Stack.Screen name="customer" />
        
        {/* Business Routes */}
        <Stack.Screen name="business" />
        
        {/* Admin Routes */}
        <Stack.Screen name="admin" />
        
        {/* Shared Routes */}
        <Stack.Screen name="help" />
        <Stack.Screen name="support" />
        <Stack.Screen name="legal" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="features" />
        <Stack.Screen name="errors" />
        
        {/* Tab Routes */}
        <Stack.Screen name="(tabs)" />
      </Stack>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}