// =====================================================
// ENHANCED TOWNTAP - MAIN APPLICATION
// Hyperlocal Business Ecosystem with AI Integration  
// =====================================================

import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import * as SplashScreenModule from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

// Enhanced imports
import { useAuthActions } from './src/stores/auth-store';

// Ignore specific warnings for better development experience
LogBox.ignoreLogs([
  'Warning: AsyncStorage',
  'Warning: componentWillReceiveProps', 
  'Module RCTImageLoader',
  'Warning: Each child in a list should have a unique "key" prop',
  'Demo mode',
  'Reanimated',
]);

// Prevent splash screen from auto-hiding
SplashScreenModule.preventAutoHideAsync().catch(() => {
  /* Ignore error if splash screen is already hidden */
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { initialize } = useAuthActions();

  // Handle app initialization and splash screen hiding
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      try {
        // Initialize auth store
        await initialize();
        // Hide splash screen once everything is ready
        await SplashScreen.hideAsync();
        await SplashScreenModule.hideAsync();
      } catch (error) {
        console.error('App initialization error:', error);
        await SplashScreen.hideAsync();
        await SplashScreenModule.hideAsync();
      }
    }
  }, [fontsLoaded, initialize]);

  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
      SplashScreen.hideAsync().catch(() => {});
      SplashScreenModule.hideAsync().catch(() => {});
    }
  }, [fontError]);

  // Keep splash screen visible until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style="auto" />
        <Slot />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
