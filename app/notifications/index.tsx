import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'promo' | 'system' | 'reminder' | 'review';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
  color: string;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your home cleaning service has been confirmed for tomorrow at 10:00 AM',
    timestamp: '2 min ago',
    read: false,
    icon: 'calendar',
    color: '#4CAF50',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Successful',
    message: 'Payment of ₹499 received for booking #BKG-2024-1234',
    timestamp: '15 min ago',
    read: false,
    icon: 'card',
    color: '#2196F3',
  },
  {
    id: '3',
    type: 'promo',
    title: '50% OFF on First Booking!',
    message: 'Use code FIRST50 to get 50% off on your first service booking',
    timestamp: '1 hour ago',
    read: false,
    icon: 'pricetag',
    color: '#FF9800',
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Upcoming Service Tomorrow',
    message: 'Don\'t forget! Your plumbing service is scheduled for tomorrow at 2:00 PM',
    timestamp: '3 hours ago',
    read: true,
    icon: 'alarm',
    color: '#9C27B0',
  },
  {
    id: '5',
    type: 'review',
    title: 'Rate Your Experience',
    message: 'How was your AC repair service? Leave a review to help others',
    timestamp: '1 day ago',
    read: true,
    icon: 'star',
    color: '#FFC107',
  },
  {
    id: '6',
    type: 'system',
    title: 'App Update Available',
    message: 'A new version of TownTap is available with exciting new features',
    timestamp: '2 days ago',
    read: true,
    icon: 'download',
    color: '#607D8B',
  },
  {
    id: '7',
    type: 'booking',
    title: 'Service Completed',
    message: 'Your electrical repair service has been completed successfully',
    timestamp: '3 days ago',
    read: true,
    icon: 'checkmark-circle',
    color: '#4CAF50',
  },
  {
    id: '8',
    type: 'promo',
    title: 'Weekend Special!',
    message: 'Get 30% off on all cleaning services this weekend only',
    timestamp: '4 days ago',
    read: true,
    icon: 'gift',
    color: '#E91E63',
  },
];

const filterOptions = [
  { id: 'all', label: 'All', icon: 'notifications' },
  { id: 'booking', label: 'Bookings', icon: 'calendar' },
  { id: 'payment', label: 'Payments', icon: 'card' },
  { id: 'promo', label: 'Promos', icon: 'pricetag' },
  { id: 'system', label: 'System', icon: 'settings' },
];

export default function NotificationsListScreen() {
  const colors = useColors();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const filteredNotifications = notifications.filter((n) =>
    selectedFilter === 'all' ? true : n.type === selectedFilter
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setShowOptions(false);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setShowOptions(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    // Navigate to detail
    router.push(`/notifications/${notification.id}` as any);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedNotification(null);
  };

  const groupNotificationsByDate = () => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const earlier: Notification[] = [];

    filteredNotifications.forEach((n) => {
      if (n.timestamp.includes('min') || n.timestamp.includes('hour')) {
        today.push(n);
      } else if (n.timestamp.includes('1 day')) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  };

  const groupedNotifications = groupNotificationsByDate();

  const renderNotificationItem = (item: Notification) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.notificationCard,
        {
          backgroundColor: colors.card,
          borderLeftColor: item.read ? 'transparent' : item.color,
          borderLeftWidth: item.read ? 0 : 3,
        },
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => setSelectedNotification(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, !item.read && styles.unreadTitle]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          {!item.read && (
            <View style={[styles.unreadDot, { backgroundColor: item.color }]} />
          )}
        </View>
        <ThemedText
          style={[styles.message, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.message}
        </ThemedText>
        <ThemedText style={[styles.timestamp, { color: colors.textSecondary }]}>
          {item.timestamp}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => setSelectedNotification(item.id)}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: Notification[]) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title}
        </ThemedText>
        {data.map(renderNotificationItem)}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowOptions(true)}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    selectedFilter === filter.id ? colors.primary + '15' : colors.card,
                  borderColor:
                    selectedFilter === filter.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={selectedFilter === filter.id ? colors.primary : colors.textSecondary}
              />
              <ThemedText
                style={[
                  styles.filterText,
                  { color: selectedFilter === filter.id ? colors.primary : colors.text },
                ]}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
              <Ionicons name="notifications-off" size={48} color={colors.border} />
            </View>
            <ThemedText style={styles.emptyTitle}>No Notifications</ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              You're all caught up! Check back later for updates.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {renderSection('Today', groupedNotifications.today)}
            {renderSection('Yesterday', groupedNotifications.yesterday)}
            {renderSection('Earlier', groupedNotifications.earlier)}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Options Modal */}
      <Modal visible={showOptions} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={[styles.optionsModal, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleMarkAllRead}
            >
              <Ionicons name="checkmark-done" size={22} color={colors.primary} />
              <ThemedText style={styles.optionText}>Mark all as read</ThemedText>
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptions(false);
                router.push('/settings/notifications');
              }}
            >
              <Ionicons name="settings" size={22} color={colors.text} />
              <ThemedText style={styles.optionText}>Notification settings</ThemedText>
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleClearAll}
            >
              <Ionicons name="trash" size={22} color={colors.error} />
              <ThemedText style={[styles.optionText, { color: colors.error }]}>
                Clear all notifications
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Single Notification Options Modal */}
      <Modal visible={!!selectedNotification} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedNotification(null)}
        >
          <View style={[styles.optionsModal, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                const notification = notifications.find((n) => n.id === selectedNotification);
                if (notification) handleNotificationPress(notification);
                setSelectedNotification(null);
              }}
            >
              <Ionicons name="eye" size={22} color={colors.text} />
              <ThemedText style={styles.optionText}>View details</ThemedText>
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.id === selectedNotification ? { ...n, read: true } : n
                  )
                );
                setSelectedNotification(null);
              }}
            >
              <Ionicons name="checkmark" size={22} color={colors.primary} />
              <ThemedText style={styles.optionText}>Mark as read</ThemedText>
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleDeleteNotification(selectedNotification!)}
            >
              <Ionicons name="trash" size={22} color={colors.error} />
              <ThemedText style={[styles.optionText, { color: colors.error }]}>
                Delete notification
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterSection: {
    paddingVertical: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
  },
  moreButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    width: width - 60,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  optionText: {
    fontSize: 16,
  },
  optionDivider: {
    height: 1,
    marginHorizontal: 16,
  },
});
