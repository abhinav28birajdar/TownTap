import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

// Auth Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Customer Screens
import AIAssistantScreen from '../screens/customer/AIAssistantScreen';
import BusinessDetailScreen from '../screens/customer/BusinessDetailScreen';
import CustomerHomeScreen from '../screens/customer/HomeScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';
import OrderScreen from '../screens/customer/OrderScreen';
import CustomerProfileScreen from '../screens/customer/ProfileScreen';

// Business Screens
import AIContentGeneratorScreen from '../screens/business/AIContentGeneratorScreen';
import AnalyticsScreen from '../screens/business/AnalyticsScreen';
import BusinessDashboardScreen from '../screens/business/DashboardScreen';
import OrderManagementScreen from '../screens/business/OrderManagementScreen';
import BusinessProfileScreen from '../screens/business/ProfileScreen';

// Shared Screens
import ChatScreen from '../screens/shared/ChatScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

// Store
import { useAuthStore } from '../stores/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AI Assistant') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          height: 88,
          paddingBottom: 34,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={CustomerHomeScreen}
        options={{ title: t('navigation.home') }}
      />
      <Tab.Screen 
        name="AI Assistant" 
        component={AIAssistantScreen}
        options={{ title: t('navigation.aiAssistant') }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrderHistoryScreen}
        options={{ title: t('navigation.orders') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={CustomerProfileScreen}
        options={{ title: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
};

// Business Tab Navigator
const BusinessTabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'AI Tools') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          height: 88,
          paddingBottom: 34,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={BusinessDashboardScreen}
        options={{ title: t('navigation.dashboard') }}
      />
      <Tab.Screen 
        name="AI Tools" 
        component={AIContentGeneratorScreen}
        options={{ title: t('navigation.aiTools') }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrderManagementScreen}
        options={{ title: t('navigation.orders') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={BusinessProfileScreen}
        options={{ title: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
};

// Customer Stack Navigator
const CustomerNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#374151',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="CustomerTabs" 
        component={CustomerTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BusinessDetail" 
        component={BusinessDetailScreen}
        options={{ title: 'Business Details' }}
      />
      <Stack.Screen 
        name="Order" 
        component={OrderScreen}
        options={{ title: 'Place Order' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};

// Business Stack Navigator
const BusinessNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#374151',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="BusinessTabs" 
        component={BusinessTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};

// Main Navigation Component
const Navigation = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // You could return a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.user_type === 'customer' ? (
          <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
        ) : user.user_type === 'business' ? (
          <Stack.Screen name="BusinessApp" component={BusinessNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
