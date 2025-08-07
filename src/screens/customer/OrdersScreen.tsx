import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { lightTheme } from '../../theme/enhanced-theme';

export default function OrdersScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track your order history</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No Orders Yet</Text>
          <Text style={styles.cardDescription}>
            You haven't placed any orders yet. Start exploring local businesses to place your first order!
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Features Coming Soon</Text>
          <Text style={styles.cardDescription}>
            • Real-time order tracking{'\n'}
            • Order history and receipts{'\n'}
            • Reorder favorites{'\n'}
            • Rate and review orders{'\n'}
            • AI-powered recommendations
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: lightTheme.colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    lineHeight: 20,
  },
});
