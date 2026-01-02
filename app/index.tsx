/**
 * TownTap - Main Entry Point
 * Redirects to appropriate screen based on auth state
 */

import { useAuth } from '@/contexts/auth-context';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const Colors = {
  primary: '#2563EB',
  white: '#FFFFFF',
};

export default function Index() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not logged in - go to auth
    if (!session) {
      router.replace('/auth/sign-in');
      return;
    }

    // Logged in but no profile - complete setup
    if (!profile) {
      router.replace('/auth/role-selection');
      return;
    }

    // Redirect based on user role
    if (profile.role === 'business_owner') {
      router.replace('/business/(tabs)');
    } else {
      router.replace('/customer/(tabs)');
    }
  }, [session, profile, loading]);

  // Show loading while checking auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});
