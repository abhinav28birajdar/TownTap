import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Import i18n configuration
import '../src/i18n';

// Import configuration
import { initializeApp } from '../src/config/app';

// Import stores to initialize
import { useAuthActions } from '../src/stores/authStore';
import { useLocationStore } from '../src/stores/locationStore';

// Import theme provider
import { ThemeProvider, useTheme } from '../src/context/ModernThemeContext';

// Import push notifications
import { setupNotificationListeners } from '../src/utils/pushNotifications';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme, isDark } = useTheme();
  
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { initialize } = useAuthActions();
  const { requestLocationPermission } = useLocationStore();

  useEffect(() => {
    const initializeApplication = async () => {
      try {
        // Initialize app configuration
        const initResult = await initializeApp();
        if (!initResult.success) {
          console.warn('App initialization had issues:', initResult.error);
        }
        
        // Check authentication status
        await initialize();
        
        // Setup push notification listeners
        const unsubscribeNotifications = setupNotificationListeners();
        
        // Request location permission (optional, don't block app)
        try {
          await requestLocationPermission();
        } catch (error) {
          console.log('Location permission not granted, continuing without location');
        }

        // Cleanup function for notifications
        return () => {
          unsubscribeNotifications();
        };
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        if (loaded) {
          SplashScreen.hideAsync();
        }
      }
    };

    if (loaded) {
      initializeApplication();
    }
  }, [loaded, initialize, requestLocationPermission]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
