// =====================================================
// ENHANCED TOWNTAP - MAIN APPLICATION
// Hyperlocal Business Ecosystem with AI Integration
// =====================================================

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, LogBox, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

// Enhanced imports
import OnboardingScreen from './src/screens/enhanced/OnboardingScreen';
import { useAuthActions, useAuthStore } from './src/stores/auth-store';
import { lightTheme } from './src/theme/enhanced-theme';

// Ignore specific warnings for better development experience
LogBox.ignoreLogs([
  'Warning: AsyncStorage',
  'Warning: componentWillReceiveProps',
  'Module RCTImageLoader',
]);

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Temporary placeholder components
function AuthNavigator() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: lightTheme.colors.background }}>
      <Text style={{ fontSize: 24, color: lightTheme.colors.text }}>Auth Screen</Text>
      <Text style={{ fontSize: 16, color: lightTheme.colors.textSecondary, marginTop: 8 }}>Login/Register functionality coming soon</Text>
    </View>
  );
}

function MainNavigator() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: lightTheme.colors.background }}>
      <Text style={{ fontSize: 24, color: lightTheme.colors.text }}>Customer Dashboard</Text>
      <Text style={{ fontSize: 16, color: lightTheme.colors.textSecondary, marginTop: 8 }}>Enhanced features loading...</Text>
    </View>
  );
}

function BusinessNavigator() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: lightTheme.colors.background }}>
      <Text style={{ fontSize: 24, color: lightTheme.colors.text }}>Business Dashboard</Text>
      <Text style={{ fontSize: 16, color: lightTheme.colors.textSecondary, marginTop: 8 }}>AI-powered business tools loading...</Text>
    </View>
  );
}

function AppContent() {
  const { user, isAuthenticated, onboardingCompleted, userType, loading } = useAuthStore();
  const { initialize } = useAuthActions();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initialize();
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setInitializing(false);
      SplashScreen.hideAsync();
    }
  };

  // Show loading screen during initialization
  if (initializing || loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: lightTheme.colors.background,
      }}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: lightTheme.colors.textSecondary 
        }}>
          Initializing Enhanced TownTap...
        </Text>
      </View>
    );
  }

  // Show onboarding if user is not authenticated or hasn't completed onboarding
  if (!isAuthenticated || !onboardingCompleted) {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }
    
    return (
      <OnboardingScreen 
        onComplete={() => {
          // Onboarding completion is handled within the screen
          console.log('Onboarding completed');
        }} 
      />
    );
  }

  // Show appropriate navigator based on user type
  if (userType === 'business_owner') {
    return <BusinessNavigator />;
  }

  return <MainNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: lightTheme.colors.background,
      }}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: lightTheme.colors.textSecondary 
        }}>
          Loading fonts...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <AppContent />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
