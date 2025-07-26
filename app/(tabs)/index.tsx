import React from 'react';
import CategorySelectionScreen from '../../src/screens/auth/CategorySelectionScreen';
import BusinessDashboardScreen from '../../src/screens/business/BusinessDashboardScreen';
import ThemedHomeScreen from '../../src/screens/customer/ThemedHomeScreen';
import { useAuthStore } from '../../src/stores/authStore';

export default function HomeScreen() {
  const { user } = useAuthStore();

  // If no user is logged in, show the category selection screen
  if (!user) {
    return <CategorySelectionScreen />;
  }

  // If user is a business owner, show business dashboard
  if (user.profile?.user_type === 'business_owner') {
    return <BusinessDashboardScreen />;
  }

  // Default to themed customer home screen
  return <ThemedHomeScreen />;
}
