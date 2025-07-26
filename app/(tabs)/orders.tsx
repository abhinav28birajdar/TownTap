import React from 'react';
import PlaceholderScreen from '../../src/components/PlaceholderScreen';
import OrderHistoryScreen from '../../src/screens/customer/OrderHistoryScreen';
import { useAuthStore } from '../../src/stores/authStore';

export default function OrdersScreen() {
  const { user } = useAuthStore();

  // If no user is logged in, show placeholder
  if (!user) {
    return (
      <PlaceholderScreen 
        title="Orders" 
        description="Please login to view your orders"
        icon="📦"
      />
    );
  }

  // If user is a business owner, show order management
  if (user.profile?.user_type === 'business_owner') {
    return (
      <PlaceholderScreen 
        title="Order Management" 
        description="Manage incoming orders from customers"
        icon="📋"
      />
    );
  }

  // For customers, show order history
  return <OrderHistoryScreen />;
}
