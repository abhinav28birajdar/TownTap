import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import CategorySelectionScreen from '../../src/screens/auth/CategorySelectionScreen';
import BusinessDashboardScreen from '../../src/screens/business/DashboardScreen';
import CustomerHomeScreen from '../../src/screens/customer/HomeScreen';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
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
        backgroundColor: theme.background
      }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ 
          marginTop: 16, 
          color: theme.text,
          fontSize: 16 
        }}>
          Loading TownTap...
        </Text>
      </View>
    );
  }

  // Show onboarding screen for first-time users
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  // If no user is logged in, show the category selection screen
  if (!user) {
    return <CategorySelectionScreen />;
  }

  // If user is a business owner, show business dashboard
  if (user.profile?.user_type === 'business_owner') {
    return <BusinessDashboardScreen />;
  }

  // Default to customer home screen
  return <CustomerHomeScreen />;
}
