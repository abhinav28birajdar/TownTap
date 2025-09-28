import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function BookingScreen() {
  const { businessId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Service</Text>
      <Text style={styles.message}>Booking for business: {businessId}</Text>
      <Text style={styles.note}>Booking functionality coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});