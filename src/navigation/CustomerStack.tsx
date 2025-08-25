// FILE: src/navigation/CustomerStack.tsx
// PURPOSE: Customer app navigation with bottom tabs and modal screens

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Customer screens
import AIAssistantScreen from '../screens/customer/AIAssistantScreen';
import BusinessDetailScreen from '../screens/customer/BusinessDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import ChatScreen from '../screens/customer/ChatScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import ExploreScreen from '../screens/customer/ExploreScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

// Navigation types
import { CustomerStackParamList, CustomerTabParamList } from '../types';

const Stack = createNativeStackNavigator<CustomerStackParamList>();
const Tab = createBottomTabNavigator<CustomerTabParamList>();

// Customer Tab Navigator
const CustomerTabs: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Explore':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: t.navigation.home,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ 
          title: t.navigation.explore,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ 
          title: t.navigation.orders,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: t.navigation.profile,
        }}
      />
    </Tab.Navigator>
  );
};

// Customer Stack Navigator
const CustomerStack: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="CustomerTabs" 
        component={CustomerTabs} 
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="BusinessDetail" 
        component={BusinessDetailScreen}
        options={{ 
          title: t.screens.businessDetail,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ 
          title: t.screens.productDetail,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ 
          title: t.screens.cart,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ 
          title: t.screens.checkout,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="OrderTracking" 
        component={OrderTrackingScreen}
        options={{ 
          title: t.screens.orderTracking,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ 
          title: t.screens.chat,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="AIAssistant" 
        component={AIAssistantScreen}
        options={{ 
          title: t.screens.aiAssistant,
          headerBackTitle: t.common.back,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default CustomerStack;
