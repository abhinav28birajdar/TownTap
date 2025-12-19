import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'promotion' | 'reminder' | 'update' | 'review';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    type: 'navigate' | 'dismiss';
    destination?: string;
  };
  image?: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your Deep Home Cleaning service has been confirmed for Dec 28, 10:00 AM.',
    timestamp: '2 hours ago',
    read: false,
    action: { type: 'navigate', destination: '/booking/confirmation-detail' },
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Successful',
    message: '₹1,907 paid successfully for booking #BK-2024-1234.',
    timestamp: '3 hours ago',
    read: false,
    action: { type: 'navigate', destination: '/customer/bookings' },
  },
  {
    id: '3',
    type: 'promotion',
    title: '🎉 Special Offer!',
    message: 'Get 30% OFF on all cleaning services this weekend. Use code: CLEAN30',
    timestamp: '5 hours ago',
    read: true,
    image: 'https://via.placeholder.com/100',
    action: { type: 'navigate', destination: '/customer/offers' },
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Upcoming Service',
    message: 'Reminder: You have AC Service scheduled for tomorrow at 11:00 AM.',
    timestamp: '1 day ago',
    read: true,
    action: { type: 'navigate', destination: '/customer/bookings' },
  },
  {
    id: '5',
    type: 'review',
    title: 'Rate Your Experience',
    message: 'How was your Plumbing Service? Share your feedback!',
    timestamp: '2 days ago',
    read: true,
    action: { type: 'navigate', destination: '/customer/my-reviews' },
  },
  {
    id: '6',
    type: 'update',
    title: 'Provider En Route',
    message: 'Rajesh Kumar is on the way to your location. ETA: 15 mins.',
    timestamp: '2 days ago',
    read: true,
    action: { type: 'navigate', destination: '/booking/service-tracking' },
  },
];

const notificationSettings = [
  { id: 'booking', label: 'Booking Updates', description: 'Confirmations, cancellations, changes', enabled: true },
  { id: 'payment', label: 'Payment Alerts', description: 'Payment success, refunds, failures', enabled: true },
  { id: 'promotion', label: 'Promotions & Offers', description: 'Discounts, special deals, new services', enabled: true },
  { id: 'reminder', label: 'Service Reminders', description: 'Upcoming booking reminders', enabled: true },
  { id: 'review', label: 'Review Requests', description: 'Rate your completed services', enabled: false },
  { id: 'marketing', label: 'Marketing Updates', description: 'News, tips, and recommendations', enabled: false },
];

export default function NotificationsCenterScreen() {
  const colors = useColors();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState(notificationSettings);
  const [filter, setFilter] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return { name: 'calendar', color: colors.primary };
      case 'payment': return { name: 'card', color: colors.success };
      case 'promotion': return { name: 'gift', color: colors.warning };
      case 'reminder': return { name: 'alarm', color: colors.info };
      case 'update': return { name: 'notifications', color: colors.primary };
      case 'review': return { name: 'star', color: '#FFB800' };
      default: return { name: 'notifications', color: colors.textSecondary };
    }
  };

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    // Navigate if action exists
    if (notification.action?.destination) {
      router.push(notification.action.destination as any);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          { backgroundColor: colors.card },
          !item.read && { borderLeftWidth: 3, borderLeftColor: colors.primary }
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.notificationIcon, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name as any} size={22} color={icon.color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <ThemedText style={[styles.notificationTitle, !item.read && { fontWeight: '700' }]}>
              {item.title}
            </ThemedText>
            {!item.read && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
          </View>
          <ThemedText style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </ThemedText>
          <ThemedText style={[styles.notificationTime, { color: colors.textSecondary }]}>
            {item.timestamp}
          </ThemedText>
        </View>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.notificationImage} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Notification Center</ThemedText>
        <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="notifications" size={20} color={colors.primary} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>{notifications.length}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Total</ThemedText>
          </View>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="mail-unread" size={20} color={colors.info} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>{unreadCount}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Unread</ThemedText>
          </View>
        </View>
        <TouchableOpacity style={[styles.markAllButton, { backgroundColor: colors.primary + '15' }]}>
          <ThemedText style={[styles.markAllText, { color: colors.primary }]}>Mark All Read</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'booking', label: 'Bookings' },
          { key: 'payment', label: 'Payments' },
          { key: 'promotion', label: 'Offers' },
          { key: 'reminder', label: 'Reminders' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterTab,
              filter === item.key && { backgroundColor: colors.primary }
            ]}
            onPress={() => setFilter(item.key)}
          >
            <ThemedText style={[
              styles.filterText,
              { color: filter === item.key ? '#FFF' : colors.textSecondary }
            ]}>
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Notifications</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              You're all caught up! New notifications will appear here.
            </ThemedText>
          </View>
        }
      />

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Notification Settings</ThemedText>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Push Notifications */}
              <View style={[styles.settingSection, { backgroundColor: colors.background }]}>
                <View style={styles.settingSectionHeader}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="notifications" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.settingSectionInfo}>
                    <ThemedText style={styles.settingSectionTitle}>Push Notifications</ThemedText>
                    <ThemedText style={[styles.settingSectionDesc, { color: colors.textSecondary }]}>
                      Receive push notifications on your device
                    </ThemedText>
                  </View>
                  <Switch
                    value={true}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              </View>

              {/* Individual Settings */}
              <ThemedText style={styles.settingsGroupTitle}>Notification Types</ThemedText>
              {settings.map((setting) => (
                <View key={setting.id} style={[styles.settingItem, { backgroundColor: colors.background }]}>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingLabel}>{setting.label}</ThemedText>
                    <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>
                      {setting.description}
                    </ThemedText>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              ))}

              {/* Quiet Hours */}
              <ThemedText style={styles.settingsGroupTitle}>Quiet Hours</ThemedText>
              <View style={[styles.quietHoursCard, { backgroundColor: colors.background }]}>
                <View style={styles.quietHoursHeader}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.warning + '15' }]}>
                    <Ionicons name="moon" size={22} color={colors.warning} />
                  </View>
                  <View style={styles.quietHoursInfo}>
                    <ThemedText style={styles.quietHoursTitle}>Do Not Disturb</ThemedText>
                    <ThemedText style={[styles.quietHoursDesc, { color: colors.textSecondary }]}>
                      Mute notifications during set hours
                    </ThemedText>
                  </View>
                  <Switch
                    value={false}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                  />
                </View>
                <View style={styles.timeRangeRow}>
                  <TouchableOpacity style={[styles.timeButton, { backgroundColor: colors.card }]}>
                    <ThemedText style={[styles.timeLabel, { color: colors.textSecondary }]}>From</ThemedText>
                    <ThemedText style={styles.timeValue}>10:00 PM</ThemedText>
                  </TouchableOpacity>
                  <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
                  <TouchableOpacity style={[styles.timeButton, { backgroundColor: colors.card }]}>
                    <ThemedText style={[styles.timeLabel, { color: colors.textSecondary }]}>To</ThemedText>
                    <ThemedText style={styles.timeValue}>7:00 AM</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Email & SMS */}
              <ThemedText style={styles.settingsGroupTitle}>Other Channels</ThemedText>
              <View style={[styles.channelCard, { backgroundColor: colors.background }]}>
                <View style={styles.channelItem}>
                  <Ionicons name="mail-outline" size={22} color={colors.textSecondary} />
                  <ThemedText style={styles.channelLabel}>Email Notifications</ThemedText>
                  <Switch
                    value={true}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                  />
                </View>
                <View style={[styles.channelDivider, { backgroundColor: colors.border }]} />
                <View style={styles.channelItem}>
                  <Ionicons name="chatbox-outline" size={22} color={colors.textSecondary} />
                  <ThemedText style={styles.channelLabel}>SMS Notifications</ThemedText>
                  <Switch
                    value={true}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                  />
                </View>
                <View style={[styles.channelDivider, { backgroundColor: colors.border }]} />
                <View style={styles.channelItem}>
                  <Ionicons name="logo-whatsapp" size={22} color={colors.textSecondary} />
                  <ThemedText style={styles.channelLabel}>WhatsApp Updates</ThemedText>
                  <Switch
                    value={false}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              </View>

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 16,
  },
  markAllButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
  },
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  settingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingSectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSectionDesc: {
    fontSize: 13,
  },
  settingsGroupTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
  },
  quietHoursCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  quietHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quietHoursInfo: {
    flex: 1,
    marginLeft: 12,
  },
  quietHoursTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  quietHoursDesc: {
    fontSize: 12,
  },
  timeRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  channelCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  channelLabel: {
    flex: 1,
    fontSize: 15,
  },
  channelDivider: {
    height: 1,
    marginLeft: 50,
  },
});
