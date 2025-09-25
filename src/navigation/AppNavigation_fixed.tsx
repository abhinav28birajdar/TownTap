import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import React from 'react';

// Import screens with default imports
import AuthScreen from '../screens/auth/AuthScreen';
import CategorySelectionScreen from '../screens/auth/CategorySelectionScreen';
import DemoLoginScreen from '../screens/auth/DemoLoginScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

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

// Business screens
import AIContentGeneratorScreen from '../screens/business/AIContentGeneratorScreen';
import BusinessAnalyticsScreen from '../screens/business/AnalyticsScreen';
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';
import BusinessOrdersScreen from '../screens/business/BusinessOrdersScreen';
import BusinessProductsScreen from '../screens/business/BusinessProductsScreen';
import BusinessProfileScreen from '../screens/business/BusinessProfileScreen';

import { useModernTheme } from '../context/ModernThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

interface AppNavigationProps {
  session: Session | null;
  onShowOnboarding: () => void;
}

// Customer Tab Navigator
const CustomerTabs = () => {
  const { colors } = useModernTheme();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

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

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.colors?.primary || '#3B82F6',
        tabBarInactiveTintColor: colors.colors?.textSecondary || '#64748B',
        tabBarStyle: {
          backgroundColor: colors.colors?.background || '#FFFFFF',
          borderTopColor: colors.colors?.border || '#E2E8F0',
        },
        headerStyle: {
          backgroundColor: colors.colors?.background || '#FFFFFF',
        },
        headerTintColor: colors.colors?.text || '#1E293B',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Business Tab Navigator
const BusinessTabs = () => {
  const { colors } = useModernTheme();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'speedometer' : 'speedometer-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Products':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'business' : 'business-outline';
              break;
            default:
              iconName = 'speedometer-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.colors?.secondary || '#34D399',
        tabBarInactiveTintColor: colors.colors?.textSecondary || '#64748B',
        tabBarStyle: {
          backgroundColor: colors.colors?.background || '#FFFFFF',
          borderTopColor: colors.colors?.border || '#E2E8F0',
        },
        headerStyle: {
          backgroundColor: colors.colors?.background || '#FFFFFF',
        },
        headerTintColor: colors.colors?.text || '#1E293B',
      })}
    >
      <Tab.Screen name="Dashboard" component={BusinessDashboardScreen} />
      <Tab.Screen name="Orders" component={BusinessOrdersScreen} />
      <Tab.Screen name="Products" component={BusinessProductsScreen} />
      <Tab.Screen name="Analytics" component={BusinessAnalyticsScreen} />
      <Tab.Screen name="Profile" component={BusinessProfileScreen} />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  const { colors } = useModernTheme();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.colors?.background || '#FFFFFF',
        },
        headerTintColor: colors.colors?.text || '#1E293B',
      }}
    >
      <Stack.Screen 
        name="Auth" 
        options={{ headerShown: false }}
      >
        {(props) => <AuthScreen {...props} userType="customer" onClose={() => {}} />}
      </Stack.Screen>
      <Stack.Screen 
        name="DemoLogin" 
        component={DemoLoginScreen}
        options={{ title: 'Demo Login' }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen 
        name="CategorySelection" 
        component={CategorySelectionScreen}
        options={{ title: 'Choose Your Role' }}
      />
    </Stack.Navigator>
  );
};

// Main App Stack Navigator
const AppStack = ({ userType }: { userType: 'customer' | 'business' }) => {
  const { colors } = useModernTheme();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.colors?.background || '#FFFFFF',
        },
        headerTintColor: colors.colors?.text || '#1E293B',
      }}
    >
      {userType === 'customer' ? (
        <>
          <Stack.Screen 
            name="CustomerTabs" 
            component={CustomerTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="BusinessDetail" 
            component={BusinessDetailScreen}
            options={{ title: 'Business Details' }}
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen}
            options={{ title: 'Product Details' }}
          />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen}
            options={{ title: 'Your Cart' }}
          />
          <Stack.Screen 
            name="Checkout" 
            component={CheckoutScreen}
            options={{ title: 'Checkout' }}
          />
          <Stack.Screen 
            name="OrderTracking" 
            component={OrderTrackingScreen}
            options={{ title: 'Track Order' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: 'Chat' }}
          />
          <Stack.Screen 
            name="AIAssistant" 
            component={AIAssistantScreen}
            options={{ title: 'AI Assistant' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="BusinessTabs" 
            component={BusinessTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AIContentGenerator" 
            component={AIContentGeneratorScreen}
            options={{ title: 'AI Content Generator' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main Navigation Component
export const AppNavigation: React.FC<AppNavigationProps> = ({ 
  session, 
  onShowOnboarding 
}) => {
  const { colors } = useModernTheme();

  // For now, default to customer type
  // In a real app, you'd determine this from user profile
  const userType: 'customer' | 'business' = 'customer';

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.colors?.primary || '#3B82F6',
          background: colors.colors?.background || '#FFFFFF',
          card: colors.colors?.surface || '#FFFFFF',
          text: colors.colors?.text || '#1E293B',
          border: colors.colors?.border || '#E2E8F0',
          notification: colors.colors?.error || '#EF4444',
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: 'normal',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: 'bold',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      {session ? (
        <AppStack userType={userType} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};
