import React from 'react';
import ProfileScreen from '../../src/screens/business/ProfileScreen';
import ModernCustomerProfileScreen from '../../src/screens/customer/ModernCustomerProfileScreen';
import ModernOnboardingScreen from '../../src/screens/onboarding/ModernOnboardingScreen';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileTabScreen() {
  const { user } = useAuthStore();

  // If no user is logged in, show onboarding
  if (!user) {
    return <ModernOnboardingScreen />;
  }

  // If user is a business owner, show business profile
  if (user.profile?.user_type === 'business_owner') {
    return <ProfileScreen />;
  }

  // For customers, show modern customer profile
  return <ModernCustomerProfileScreen />;
}
