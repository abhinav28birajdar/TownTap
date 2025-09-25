// =====================================================
// ENHANCED TOWNTAP - MAIN APPLICATION
// Hyperlocal Business Ecosystem with AI Integration  
// =====================================================

import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

// Initialize i18n
import './src/i18n';

// Context providers
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ModernThemeContext';

// Navigation
import RootNavigator, { navigationRef } from './src/navigation';

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
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore error if splash screen is already hidden */
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Handle app initialization and splash screen hiding
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      try {
        // Hide splash screen once everything is ready
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    }
  }, [fontsLoaded, fontError]);

  // Keep splash screen visible until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <NavigationContainer ref={navigationRef}>
                <StatusBar style="auto" />
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
