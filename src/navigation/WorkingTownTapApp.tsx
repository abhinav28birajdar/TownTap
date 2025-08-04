// ================================================================
// 🚀 COMPLETE WORKING TOWNTAP APP WITH AUTO-AUTH
// ================================================================

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';

import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ModernThemeProvider, useTheme } from '../context/ModernThemeContext';
import SimpleRealTimeHomeScreen from '../screens/SimpleRealTimeHomeScreen';
import { useAuthStore } from '../stores/mockAuthStore';

const Tab = createBottomTabNavigator();

// Simple Orders Screen
const OrdersScreen: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.placeholderScreen, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
        📋 My Service Requests
      </Text>
      <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
        Your service requests will appear here
      </Text>
      <TouchableOpacity 
        style={[styles.placeholderButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => Alert.alert('Coming Soon', 'Service requests feature coming soon!')}
      >
        <Text style={styles.placeholderButtonText}>View Requests</Text>
      </TouchableOpacity>
    </View>
  );
};

// Simple Profile Screen
const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, signOut } = useAuthStore();
  
  return (
    <View style={[styles.placeholderScreen, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
        👤 Profile Settings
      </Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user.user_metadata?.full_name || 'Test User'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user.email}
          </Text>
          <Text style={[styles.userPhone, { color: theme.colors.textSecondary }]}>
            {user.user_metadata?.phone || '+91 9876543210'}
          </Text>
        </View>
      )}
      
      <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
        Manage your profile and preferences
      </Text>
      
      <TouchableOpacity 
        style={[styles.placeholderButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => Alert.alert('Coming Soon', 'Profile management coming soon!')}
      >
        <Text style={styles.placeholderButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.signOutButton, { borderColor: theme.colors.primary }]}
        onPress={signOut}
      >
        <Text style={[styles.signOutButtonText, { color: theme.colors.primary }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Loading Screen
const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.loadingScreen, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.text }]}>
        🚀 Starting TownTap...
      </Text>
    </View>
  );
};

// Main Tab Navigator
const TabNavigatorContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={SimpleRealTimeHomeScreen}
        options={{
          title: '🏪 TownTap',
          headerShown: false,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'My Requests',
          tabBarLabel: 'Requests',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Component
const WorkingTownTapApp: React.FC = () => {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    // Auto-initialize authentication
    initialize();
  }, []);

  return (
    <ModernThemeProvider>
      <NavigationContainer>
        {loading ? (
          <LoadingScreen />
        ) : user ? (
          <TabNavigatorContent />
        ) : (
          <LoadingScreen />
        )}
      </NavigationContainer>
    </ModernThemeProvider>
  );
};

const styles = StyleSheet.create({
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  placeholderButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
  },
  signOutButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WorkingTownTapApp;
