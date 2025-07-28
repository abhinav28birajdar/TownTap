import React from 'react';
import ModernOrderManagementScreen from '../../src/screens/business/ModernOrderManagementScreen';
import ModernCustomerOrderScreen from '../../src/screens/customer/ModernCustomerOrderScreen';
import { useAuthStore } from '../../src/stores/authStore';

export default function OrdersScreen() {
  const { user } = useAuthStore();

  // If no user is logged in, show customer order screen (they can browse menu)
  if (!user) {
    return <ModernCustomerOrderScreen />;
  }

  // If user is a business owner, show order management
  if (user.profile?.user_type === 'business_owner') {
    return <ModernOrderManagementScreen />;
  }

  // For customers, show order screen for browsing and ordering
  return <ModernCustomerOrderScreen />;
}
