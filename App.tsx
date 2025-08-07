// =====================================================
// ENHANCED TOWNTAP - MAIN APPLICATION
// Hyperlocal Business Ecosystem with AI Integration  
// =====================================================

import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
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
]);

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { initialize } = useAuthActions();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize auth store
        await initialize();
        
        // Hide splash screen once everything is ready
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('App initialization error:', error);
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      }
    };

    initializeApp();
  }, [fontsLoaded, initialize]);

  // Keep splash screen visible until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Slot />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
