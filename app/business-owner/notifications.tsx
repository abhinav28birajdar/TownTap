import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const notifications = [
  { id: '1', title: 'New Order', message: 'You have a new order from John Doe', time: '11:00 PM', icon: 'receipt-outline' },
  { id: '2', title: 'Order Completed', message: 'Order #1234 has been completed', time: '10:30 AM', icon: 'checkmark-circle-outline' },
  { id: '3', title: 'Payment Received', message: 'Payment of ₹850 received', time: '9:15 AM', icon: 'wallet-outline' },
  { id: '4', title: 'New Review', message: 'You received a 5-star review', time: 'Yesterday', icon: 'star-outline' },
  { id: '5', title: 'Service Updated', message: 'Your service listing was updated', time: '2 days ago', icon: 'construct-outline' },
];

export default function BusinessNotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon as any} size={24} color="#4A5F4E" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8E6C9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#C8E6C9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3E2F',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#A8D5AB',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4A5F4E',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B8E6F',
  },
});
