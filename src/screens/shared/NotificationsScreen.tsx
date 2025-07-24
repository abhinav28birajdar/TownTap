import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'business';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
  actionRequired?: boolean;
}

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newBusinesses: boolean;
  systemUpdates: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'settings'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered!',
      message: 'Your order from Pizza Palace has been delivered. Enjoy your meal!',
      timestamp: '2024-01-15T19:15:00Z',
      isRead: false,
      icon: '🍕',
      actionRequired: false,
    },
    {
      id: '2',
      type: 'promotion',
      title: '50% Off on First Order',
      message: 'Welcome to TownTap! Use code WELCOME50 to get 50% off on your first order.',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      icon: '🎉',
      actionRequired: true,
    },
    {
      id: '3',
      type: 'business',
      title: 'New Restaurant Nearby',
      message: 'Burger Junction just opened in your area. Check out their grand opening offers!',
      timestamp: '2024-01-14T16:45:00Z',
      isRead: true,
      icon: '🍔',
      actionRequired: false,
    },
    {
      id: '4',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #TP-2024-001235 has been confirmed and is being prepared.',
      timestamp: '2024-01-14T18:20:00Z',
      isRead: true,
      icon: '✅',
      actionRequired: false,
    },
    {
      id: '5',
      type: 'system',
      title: 'App Update Available',
      message: 'A new version of TownTap is available with improved features and bug fixes.',
      timestamp: '2024-01-13T09:00:00Z',
      isRead: true,
      icon: '📱',
      actionRequired: true,
    },
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotions: true,
    newBusinesses: true,
    systemUpdates: true,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Text style={styles.notificationEmoji}>{item.icon}</Text>
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
      
      {item.actionRequired && (
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Take Action</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSettingItem = (
    title: string,
    subtitle: string,
    key: keyof NotificationSettings,
    value: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => updateSetting(key, newValue)}
        trackColor={{ false: '#E9ECEF', true: '#007AFF' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {activeTab === 'all' && unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllButtonText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
        {activeTab === 'settings' && <View style={styles.placeholder} />}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'all' ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔔</Text>
              <Text style={styles.emptyStateTitle}>No Notifications</Text>
              <Text style={styles.emptyStateSubtitle}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
          {/* Notification Types */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Notification Types</Text>
            {renderSettingItem(
              'Order Updates',
              'Get notified about order status changes',
              'orderUpdates',
              settings.orderUpdates
            )}
            {renderSettingItem(
              'Promotions & Offers',
              'Receive special deals and discounts',
              'promotions',
              settings.promotions
            )}
            {renderSettingItem(
              'New Businesses',
              'Learn about new restaurants in your area',
              'newBusinesses',
              settings.newBusinesses
            )}
            {renderSettingItem(
              'System Updates',
              'App updates and important announcements',
              'systemUpdates',
              settings.systemUpdates
            )}
          </View>

          {/* Delivery Methods */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Delivery Methods</Text>
            {renderSettingItem(
              'Push Notifications',
              'Get instant notifications on your device',
              'pushNotifications',
              settings.pushNotifications
            )}
            {renderSettingItem(
              'Email Notifications',
              'Receive notifications via email',
              'emailNotifications',
              settings.emailNotifications
            )}
            {renderSettingItem(
              'SMS Notifications',
              'Get text messages for important updates',
              'smsNotifications',
              settings.smsNotifications
            )}
          </View>

          {/* Quiet Hours */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Quiet Hours</Text>
            <TouchableOpacity style={styles.quietHoursButton}>
              <View style={styles.quietHoursText}>
                <Text style={styles.settingTitle}>Do Not Disturb</Text>
                <Text style={styles.settingSubtitle}>10:00 PM - 8:00 AM</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  markAllButton: {
    padding: 4,
  },
  markAllButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  placeholder: {
    width: 80,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
  },
  notificationBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    position: 'relative',
  },
  unreadNotification: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationEmoji: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 8,
  },
  actionSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsContent: {
    flex: 1,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 16,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  quietHoursButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quietHoursText: {
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    color: '#CED4DA',
    fontWeight: 'bold',
  },
});
