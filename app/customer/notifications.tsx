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
  { id: '1', type: 'success', icon: 'checkmark-circle', title: 'Booking Confirmed', message: 'Your plumbing service booking has been confirmed', time: '5 min ago' },
  { id: '2', type: 'info', icon: 'information-circle', title: 'Service Update', message: 'Your service provider is on the way', time: '1 hour ago' },
  { id: '3', type: 'success', icon: 'star', title: 'Service Completed', message: 'Please rate your recent service', time: '2 hours ago' },
  { id: '4', type: 'warning', icon: 'time', title: 'Reminder', message: 'Your appointment is scheduled for tomorrow at 10 AM', time: 'Yesterday' },
  { id: '5', type: 'info', icon: 'gift', title: 'Special Offer', message: 'Get 20% off on your next booking', time: '2 days ago' },
];

export default function CustomerNotificationsScreen() {
  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'info': return '#3B82F6';
      case 'warning': return '#F59E0B';
      default: return '#6B8E6F';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Ionicons name="checkmark-done-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.notificationCard}>
            <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '20' }]}>
              <Ionicons name={item.icon as any} size={24} color={getIconColor(item.type)} />
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B8E6F',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
