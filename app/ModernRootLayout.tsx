import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Import modern theme provider
import { ThemeProvider, useTheme } from '../src/context/ModernThemeContext';

// Import stores
import { useAuthStore } from '../src/stores/authStore';

// Import screens
import ModernOnboardingScreen from '../src/screens/onboarding/ModernOnboardingScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AuthenticatedLayout() {
  const { theme, isDark } = useTheme();
  
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
    </GestureHandlerRootView>
  );
}

function UnauthenticatedLayout() {
  const { theme, isDark } = useTheme();
  const { login } = useAuthStore();

  const handleOnboardingComplete = (userType: 'customer' | 'business_owner') => {
    // The authentication will be handled in the onboarding screen
    // This callback is for any additional logic after successful auth
    console.log('User authenticated as:', userType);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ModernOnboardingScreen onComplete={handleOnboardingComplete} />
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
    </GestureHandlerRootView>
  );
}

function LoadingScreen() {
  const { theme } = useTheme();
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center' 
    }}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
      }}>
        <Text style={{
          fontSize: 32,
          color: theme.colors.buttonText,
        }}>🏪</Text>
      </View>
      <Text style={{
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
      }}>
        TownTap
      </Text>
      <Text style={{
        ...theme.typography.body1,
        color: theme.colors.textSecondary,
      }}>
        Loading your local community...
      </Text>
    </View>
  );
}

function RootLayoutContent() {
  const { user, loading, checkAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [checkAuth]);

  // Show loading screen while initializing
  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  // Show onboarding if user is not authenticated
  if (!user) {
    return <UnauthenticatedLayout />;
  }

  // Show main app if user is authenticated
  return <AuthenticatedLayout />;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
