// FILE: src/navigation/index.tsx
// PURPOSE: Root navigation component integrating with context providers

import { createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ModernThemeContext';
import { setupNotificationListeners } from '../utils/pushNotifications';

// Navigation stacks
import AuthStack from './AuthStack';
import BusinessStack from './BusinessStack';
import CustomerStack from './CustomerStack';
import OnboardingStack from './OnboardingStack';

// Navigation types
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Create the navigation container ref for push notification navigation
export const navigationRef = createNavigationContainerRef();

const RootNavigator: React.FC = () => {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  // Setup notification listeners when the navigator is ready
  useEffect(() => {
    const unsubscribe = setupNotificationListeners();
    return unsubscribe; // Cleanup on component unmount
  }, []);

  // Show loading screen while auth is initializing
  if (authLoading) {
    return null; // You can return a loading component here
  }

  // Determine which stack to show
  const getInitialStackName = () => {
    if (!user) {
      return 'Auth';
    }

    if (!userProfile?.onboarding_completed) {
      return 'Onboarding';
    }

    switch (userProfile?.user_type) {
      case 'business_owner':
      case 'business_staff':
        return 'Business';
      case 'customer':
      default:
        return 'Customer';
    }
  };

  const initialStackName = getInitialStackName();

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName={initialStackName}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !userProfile?.onboarding_completed ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : userProfile?.user_type === 'business_owner' || userProfile?.user_type === 'business_staff' ? (
        <Stack.Screen name="Business" component={BusinessStack} />
      ) : (
        <Stack.Screen name="Customer" component={CustomerStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
