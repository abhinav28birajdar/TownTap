import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ModernThemeProvider } from './src/context/ModernThemeContext';
import { OnboardingProvider, useOnboarding } from './src/context/OnboardingProvider';
import { AppNavigation } from './src/navigation/AppNavigation';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { session } = useAuth();
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigation 
        session={session} 
        onShowOnboarding={() => {/* Handle showing onboarding again if needed */}} 
      />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [loaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ModernThemeProvider>
        <OnboardingProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </OnboardingProvider>
      </ModernThemeProvider>
    </SafeAreaProvider>
  );
}
