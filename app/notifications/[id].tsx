import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function NotificationDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock notification data - would be fetched based on id
  const notification = {
    id,
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your home cleaning service has been confirmed for tomorrow at 10:00 AM. Our professional cleaner Sarah will arrive at your location.',
    timestamp: '2 hours ago',
    date: 'Dec 15, 2024',
    read: false,
    icon: 'calendar-outline',
    color: '#4CAF50',
    relatedData: {
      type: 'booking',
      id: 'BKG-2024-1234',
      serviceName: 'Home Deep Cleaning',
      providerName: 'Sarah Johnson',
      providerImage: null,
      date: 'Dec 16, 2024',
      time: '10:00 AM',
      address: '123 Main Street, Apt 4B',
      status: 'confirmed',
    },
    actions: [
      { id: 'view', label: 'View Booking', icon: 'eye', primary: true },
      { id: 'reschedule', label: 'Reschedule', icon: 'calendar', primary: false },
      { id: 'contact', label: 'Contact Provider', icon: 'chatbubbles', primary: false },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return '#FF9800';
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'view':
        router.push(`/booking/confirmation-detail`);
        break;
      case 'reschedule':
        router.push(`/booking/reschedule`);
        break;
      case 'contact':
        router.push(`/chat/${notification.relatedData.id}` as any);
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Notification</ThemedText>
        <TouchableOpacity>
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: notification.color + '20' },
            ]}
          >
            <Ionicons
              name={notification.icon as any}
              size={40}
              color={notification.color}
            />
          </View>
          <ThemedText style={styles.title}>{notification.title}</ThemedText>
          <View style={styles.timestampRow}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.timestamp, { color: colors.textSecondary }]}>
              {notification.timestamp} • {notification.date}
            </ThemedText>
          </View>
        </View>

        {/* Message */}
        <View style={[styles.messageCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.messageText, { color: colors.text }]}>
            {notification.message}
          </ThemedText>
        </View>

        {/* Related Booking Card */}
        {notification.relatedData && (
          <View style={[styles.relatedCard, { backgroundColor: colors.card }]}>
            <View style={styles.relatedHeader}>
              <ThemedText style={styles.relatedTitle}>Related Booking</ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(notification.relatedData.status) + '15' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: getStatusColor(notification.relatedData.status) },
                  ]}
                >
                  {notification.relatedData.status.charAt(0).toUpperCase() +
                    notification.relatedData.status.slice(1)}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Service Info */}
            <View style={styles.serviceRow}>
              <View style={[styles.serviceIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
              </View>
              <View style={styles.serviceInfo}>
                <ThemedText style={styles.serviceName}>
                  {notification.relatedData.serviceName}
                </ThemedText>
                <ThemedText style={[styles.bookingId, { color: colors.textSecondary }]}>
                  {notification.relatedData.id}
                </ThemedText>
              </View>
            </View>

            {/* Provider Info */}
            <View style={styles.providerRow}>
              <View style={[styles.providerAvatar, { backgroundColor: colors.primary + '20' }]}>
                <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                  {notification.relatedData.providerName.charAt(0)}
                </ThemedText>
              </View>
              <View style={styles.providerInfo}>
                <ThemedText style={styles.providerName}>
                  {notification.relatedData.providerName}
                </ThemedText>
                <ThemedText style={[styles.providerRole, { color: colors.textSecondary }]}>
                  Service Provider
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.chatButton, { backgroundColor: colors.primary + '15' }]}
              >
                <Ionicons name="chatbubble" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Details */}
            <View style={[styles.detailsSection, { backgroundColor: colors.background }]}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                  <View>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Date
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {notification.relatedData.date}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                  <View>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Time
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {notification.relatedData.time}
                    </ThemedText>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={[styles.detailItem, { flex: 1 }]}>
                  <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Address
                    </ThemedText>
                    <ThemedText style={styles.detailValue} numberOfLines={1}>
                      {notification.relatedData.address}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <ThemedText style={styles.actionsTitle}>Quick Actions</ThemedText>
          <View style={styles.actionsList}>
            {notification.actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: action.primary ? colors.primary : colors.card,
                    borderColor: action.primary ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleAction(action.id)}
              >
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={action.primary ? '#fff' : colors.text}
                />
                <ThemedText
                  style={[
                    styles.actionText,
                    { color: action.primary ? '#fff' : colors.text },
                  ]}
                >
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Similar Notifications */}
        <View style={styles.similarSection}>
          <ThemedText style={styles.sectionTitle}>Related Notifications</ThemedText>
          {[
            {
              id: '1',
              title: 'Payment Received',
              message: 'Payment of ₹499 received for booking',
              time: '2 hours ago',
              icon: 'card',
              color: '#4CAF50',
            },
            {
              id: '2',
              title: 'Provider Assigned',
              message: 'Sarah Johnson has been assigned to your booking',
              time: '3 hours ago',
              icon: 'person',
              color: '#2196F3',
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.similarCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/notifications/${item.id}` as any)}
            >
              <View style={[styles.similarIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={styles.similarInfo}>
                <ThemedText style={styles.similarTitle}>{item.title}</ThemedText>
                <ThemedText
                  style={[styles.similarMessage, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.message}
                </ThemedText>
              </View>
              <ThemedText style={[styles.similarTime, { color: colors.textSecondary }]}>
                {item.time}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontSize: 13,
  },
  messageCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 24,
  },
  relatedCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 13,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerRole: {
    fontSize: 13,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsSection: {
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsList: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  similarSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  similarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  similarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarInfo: {
    flex: 1,
  },
  similarTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  similarMessage: {
    fontSize: 13,
  },
  similarTime: {
    fontSize: 11,
  },
});
