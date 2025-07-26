import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../config/constants';
import { useAuthStore } from '../stores/authStore';

// Auth Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import CategorySelectionScreen from '../screens/auth/CategorySelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Customer Screens
import AIAssistantScreen from '../screens/customer/AIAssistantScreen';
import BusinessDetailScreen from '../screens/customer/BusinessDetailScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';
import OrderScreen from '../screens/customer/OrderScreen';
import CustomerProfileScreen from '../screens/customer/ProfileScreen';
import RealTimeCustomerHome from '../screens/customer/RealTimeCustomerHome';

// Business Screens
import AIContentGeneratorScreen from '../screens/business/AIContentGeneratorScreen';
import AnalyticsScreen from '../screens/business/AnalyticsScreen';
import OrderManagementScreen from '../screens/business/OrderManagementScreen';
import BusinessProfileScreen from '../screens/business/ProfileScreen';
import RealTimeBusinessDashboard from '../screens/business/RealTimeBusinessDashboard';

// Shared Screens
import ChatScreen from '../screens/shared/ChatScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import PaymentMethodsScreen from '../screens/shared/PaymentMethodsScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab bar icon component
const TabIcon = ({ icon, color }: { icon: string; color: string }) => (
  <span style={{ fontSize: 24, color }}>{icon}</span>
);

// Customer Tab Navigator
const CustomerTabs = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="CustomerHome"
        component={RealTimeCustomerHome}
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="CustomerOrders"
        component={OrderHistoryScreen}
        options={{
          title: t('navigation.orders'),
          tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color} />,
        }}
      />
      <Tab.Screen
        name="CustomerAI"
        component={AIAssistantScreen}
        options={{
          title: t('navigation.aiAssistant'),
          tabBarIcon: ({ color }) => <TabIcon icon="🤖" color={color} />,
        }}
      />
      <Tab.Screen
        name="CustomerProfile"
        component={CustomerProfileScreen}
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Business Tab Navigator
const BusinessTabs = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="BusinessDashboard"
        component={RealTimeBusinessDashboard}
        options={{
          title: t('navigation.dashboard'),
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <Tab.Screen
        name="BusinessOrders"
        component={OrderManagementScreen}
        options={{
          title: t('navigation.orders'),
          tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color} />,
        }}
      />
      <Tab.Screen
        name="BusinessAI"
        component={AIContentGeneratorScreen}
        options={{
          title: t('navigation.aiContent'),
          tabBarIcon: ({ color }) => <TabIcon icon="✨" color={color} />,
        }}
      />
      <Tab.Screen
        name="BusinessAnalytics"
        component={AnalyticsScreen}
        options={{
          title: t('navigation.analytics'),
          tabBarIcon: ({ color }) => <TabIcon icon="📈" color={color} />,
        }}
      />
      <Tab.Screen
        name="BusinessProfile"
        component={BusinessProfileScreen}
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  const { t } = useTranslation();
  
  // Wrapper components to handle navigation props
  const CategorySelectionWrapper = () => (
    <CategorySelectionScreen onComplete={(userType) => {
      // Navigation will be handled by the CategorySelectionScreen internally
    }} />
  );
  
  const AuthWrapper = () => (
    <AuthScreen 
      userType="customer" 
      onClose={() => {
        // Navigation will be handled by the AuthScreen internally
      }} 
    />
  );
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CategorySelection" component={CategorySelectionWrapper} />
      <Stack.Screen name="Auth" component={AuthWrapper} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

// Main App Stack Navigator
const AppStack = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const isBusinessUser = user?.profile?.user_type === 'business_owner';
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tabs */}
      <Stack.Screen 
        name="MainTabs" 
        component={isBusinessUser ? BusinessTabs : CustomerTabs} 
      />
      
      {/* Shared Screens */}
      <Stack.Screen 
        name="Chat" 
        component={() => <ChatScreen business={{} as any} onClose={() => {}} />}
        options={{
          headerShown: true,
          title: t('navigation.chat'),
          headerStyle: { backgroundColor: COLORS.primary[500] },
          headerTintColor: COLORS.white,
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          headerShown: true,
          title: t('navigation.notifications'),
          headerStyle: { backgroundColor: COLORS.primary[500] },
          headerTintColor: COLORS.white,
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: t('navigation.settings'),
          headerStyle: { backgroundColor: COLORS.primary[500] },
          headerTintColor: COLORS.white,
        }}
      />
      <Stack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen}
        options={{
          headerShown: true,
          title: t('navigation.paymentMethods'),
          headerStyle: { backgroundColor: COLORS.primary[500] },
          headerTintColor: COLORS.white,
        }}
      />
      
      {/* Customer-specific Screens */}
      {!isBusinessUser && (
        <>
          <Stack.Screen 
            name="BusinessDetail" 
            component={BusinessDetailScreen}
            options={{
              headerShown: true,
              title: t('navigation.businessDetail'),
              headerStyle: { backgroundColor: COLORS.primary[500] },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen 
            name="Order" 
            component={OrderScreen}
            options={{
              headerShown: true,
              title: t('navigation.order'),
              headerStyle: { backgroundColor: COLORS.primary[500] },
              headerTintColor: COLORS.white,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { user } = useAuthStore();
  
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
