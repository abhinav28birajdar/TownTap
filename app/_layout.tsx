import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider } from 'native-base';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Import i18n configuration
import '../src/i18n';

// Import stores to initialize
import { useAuthStore } from '../src/stores/authStore';
import { useLocationStore } from '../src/stores/locationStore';

// Import theme provider
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme, isDark } = useTheme();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.background} />
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { checkAuth } = useAuthStore();
  const { requestLocationPermission } = useLocationStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication status
        await checkAuth();
        
        // Request location permission (optional, don't block app)
        try {
          await requestLocationPermission();
        } catch (error) {
          console.log('Location permission not granted, continuing without location');
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        if (loaded) {
          SplashScreen.hideAsync();
        }
      }
    };

    if (loaded) {
      initializeApp();
    }
  }, [loaded, checkAuth, requestLocationPermission]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
