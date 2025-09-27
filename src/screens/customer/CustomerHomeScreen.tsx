/**
 * FILE: src/screens/customer/CustomerHomeScreen.tsx
 * PURPOSE: Original Customer Home Screen (now redirects to LocalMart)
 * STATUS: Legacy redirect to LocalMartHomeScreen
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function CustomerHomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the enhanced LocalMart home screen
    router.replace('/customer/local-mart-home');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.redirectText}>
        Redirecting to LocalMart...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  redirectText: {
    fontSize: 16,
    color: '#666',
  },
});