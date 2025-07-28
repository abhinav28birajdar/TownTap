import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../../src/context/ModernThemeContext';
import ModernBusinessDashboardScreen from '../../src/screens/business/ModernBusinessDashboardScreen';
import ModernHomeScreen from '../../src/screens/customer/ModernHomeScreen';
import ModernOnboardingScreen from '../../src/screens/onboarding/ModernOnboardingScreen';
import { useAuthStore } from '../../src/stores/authStore';

export default function HomeScreen() {
  const { user, loading, checkAuth, hasCompletedOnboarding } = useAuthStore();
  const { theme } = useTheme();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [checkAuth]);

  // Show loading screen while initializing
  if (isInitializing || loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ 
          marginTop: 16, 
          color: theme.colors.text,
          fontSize: 16 
        }}>
          Loading TownTap...
        </Text>
      </View>
    );
  }

  // Show onboarding screen for first-time users or not logged in
  if (!hasCompletedOnboarding || !user) {
    return <ModernOnboardingScreen />;
  }

  // If user is a business owner, show business dashboard
  if (user.profile?.user_type === 'business_owner') {
    return <ModernBusinessDashboardScreen />;
  }

  // Default to customer home screen
  return <ModernHomeScreen />;
}
