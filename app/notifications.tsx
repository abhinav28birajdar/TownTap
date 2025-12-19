import { Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Your booking is confirmed!',
    message: 'Your plumbing service booking has been confirmed for Dec 15, 2025',
    time: '11:00 PM',
    read: false,
    type: 'booking',
  },
  {
    id: '2',
    title: 'Service Provider on the way',
    message: 'John is on the way to your location',
    time: '10:30 PM',
    read: false,
    type: 'tracking',
  },
  {
    id: '3',
    title: 'Payment Successful',
    message: 'Your payment of ₹550 was successful',
    time: '9:00 PM',
    read: true,
    type: 'payment',
  },
  {
    id: '4',
    title: 'Rate your experience',
    message: 'How was your recent service? Please rate it',
    time: '8:00 PM',
    read: true,
    type: 'review',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS);

  const handleNotificationPress = (notification: typeof MOCK_NOTIFICATIONS[0]) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // Navigate based on type
    if (notification.type === 'booking') {
      router.push('/(tabs)/orders' as any);
    } else if (notification.type === 'tracking') {
      router.push('/customer/booking-track' as any);
    } else if (notification.type === 'payment') {
      router.push('/customer/wallet' as any);
    } else if (notification.type === 'review') {
      router.push('/business-reviews/write-review' as any);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'checkmark-circle';
      case 'tracking':
        return 'navigate';
      case 'payment':
        return 'cash';
      case 'review':
        return 'star';
      default:
        return 'notifications';
    }
  };

  const renderNotification = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.avatar, { backgroundColor: item.read ? '#A8D5AB' : '#415D43' }]}>
        <Ionicons name={getNotificationIcon(item.type) as any} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.notificationInfo}>
        <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.notificationTime}>{item.time}</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/search')}
        >
          <Ionicons name="location" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/bookings')}
        >
          <Ionicons name="receipt" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4E7D4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  notificationsList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A8D5AB',
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  unreadNotification: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#415D43',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  notificationTime: {
    fontSize: 12,
    color: '#555',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#415D43',
    marginTop: 4,
  },
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B9FD7',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    backgroundColor: '#6B8E6F',
    borderRadius: 30,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
