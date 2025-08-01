import { Session } from '@supabase/supabase-js';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ModernThemeProvider } from './src/context/ModernThemeContext';
import { useSupabaseErrorHandler } from './src/hooks/useSupabaseErrorHandler';
import { supabase } from './src/lib/supabase';
import { AppNavigation } from './src/navigation/AppNavigation';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { SplashScreen as CustomSplashScreen } from './src/screens/shared/SplashScreen';

// Prevent auto-hiding the splash screen
SplashScreen.preventAutoHideAsync();

// Enhanced TownTap Omnichannel Ecosystem - Root App Component
export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Initialize Supabase error handling
  useSupabaseErrorHandler();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        // Check if user needs onboarding
        if (!session) {
          const hasSeenOnboarding = await checkOnboardingStatus();
          setShowOnboarding(!hasSeenOnboarding);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (event === 'SIGNED_IN') {
          setShowOnboarding(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setAppReady(true);
        SplashScreen.hideAsync();
      }, 1000);
    }
  }, [fontsLoaded, isLoading]);

  const checkOnboardingStatus = async (): Promise<boolean> => {
    // Check AsyncStorage or user preferences for onboarding status
    try {
      // For now, return false to always show onboarding for new users
      return false;
    } catch {
      return false;
    }
  };

  // Show splash screen while loading
  if (!fontsLoaded || isLoading || !appReady) {
    return <CustomSplashScreen />;
  }

  // Show onboarding for new users
  if (!session && showOnboarding) {
    return (
      <SafeAreaProvider>
        <ModernThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
            <StatusBar style="light" />
          </GestureHandlerRootView>
        </ModernThemeProvider>
      </SafeAreaProvider>
    );
  }

  // Main app navigation
  return (
    <SafeAreaProvider>
      <ModernThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigation 
            session={session} 
            onShowOnboarding={() => setShowOnboarding(true)} 
          />
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      </ModernThemeProvider>
    </SafeAreaProvider>
  );
}
