import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuthStore } from '../../stores/authStore';
import { Notification } from '../../types';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Mock notifications - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: user?.id || '',
          type: 'order_confirmed',
          title: 'Order Confirmed',
          body: 'Your order #12345 has been confirmed by Fresh Vegetables Store.',
          is_read: false,
          priority: 'normal',
          action_url: '/orders/12345',
          data: {
            order_id: '12345',
            business_name: 'Fresh Vegetables Store',
          },
          created_at: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          user_id: user?.id || '',
          type: 'promotion',
          title: 'Special Offer',
          body: '20% off on all organic products this weekend!',
          is_read: false,
          priority: 'normal',
          action_url: '/promotions/weekend-sale',
          data: {
            discount: '20%',
            valid_until: '2024-01-21T23:59:59Z',
          },
          created_at: '2024-01-15T09:00:00Z',
        },
        {
          id: '3',
          user_id: user?.id || '',
          type: 'business_update',
          title: 'New Message',
          body: 'You have a new message from Raj Electronics.',
          is_read: true,
          priority: 'normal',
          action_url: '/chat/conv-123',
          data: {
            conversation_id: 'conv-123',
            sender_name: 'Raj Electronics',
          },
          created_at: '2024-01-15T08:45:00Z',
        },
        {
          id: '4',
          user_id: user?.id || '',
          type: 'order_ready',
          title: 'Out for Delivery',
          body: 'Your order is out for delivery and will arrive in 15-20 minutes.',
          is_read: true,
          priority: 'high',
          action_url: '/orders/12344/track',
          data: {
            order_id: '12344',
            estimated_time: '15-20 minutes',
          },
          created_at: '2024-01-14T16:30:00Z',
        },
        {
          id: '5',
          user_id: user?.id || '',
          type: 'order_placed',
          title: 'New Order Received',
          body: 'You have received a new order from customer John Doe.',
          is_read: false,
          priority: 'high',
          action_url: '/business/orders/new',
          data: {
            order_id: '12346',
            customer_name: 'John Doe',
          },
          created_at: '2024-01-15T11:00:00Z',
        },
      ];
      
      // Filter notifications based on user type
      const filteredNotifications = mockNotifications.filter(notification => {
        if (user?.user_type === 'business') {
          return ['order_placed', 'business_update', 'payment_success'].includes(notification.type);
        } else {
          return ['order_confirmed', 'promotion', 'business_update', 'order_ready', 'order_delivered'].includes(notification.type);
        }
      });
      
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert(t('error.title'), t('error.loadingNotifications'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      // Here you would call your API to mark the notification as read
      console.log('Marking notification as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Here you would call your API to mark all notifications as read
      console.log('Marking all notifications as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      t('notifications.deleteTitle'),
      t('notifications.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
              );
              // Here you would call your API to delete the notification
              console.log('Deleting notification:', notificationId);
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type and action_url
    if (notification.action_url) {
      if (notification.action_url.includes('/orders/')) {
        navigation.navigate('OrderHistory');
      } else if (notification.action_url.includes('/chat/')) {
        navigation.navigate('Chat', {
          conversationId: notification.data?.conversation_id,
        });
      } else if (notification.action_url.includes('/business/orders/')) {
        navigation.navigate('OrderManagement');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_confirmed':
      case 'order_placed':
      case 'order_ready':
      case 'order_delivered':
        return 'receipt-outline';
      case 'promotion':
      case 'discount_offer':
        return 'pricetag-outline';
      case 'business_update':
        return 'chatbubble-outline';
      case 'payment_success':
      case 'payment_failed':
        return 'card-outline';
      case 'new_business':
        return 'business-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_confirmed':
      case 'order_placed':
      case 'order_ready':
      case 'order_delivered':
        return '#34C759';
      case 'promotion':
      case 'discount_offer':
        return '#FF9500';
      case 'business_update':
        return '#007AFF';
      case 'payment_success':
        return '#30D158';
      case 'payment_failed':
        return '#FF3B30';
      case 'new_business':
        return '#5856D6';
      default:
        return '#8E8E93';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.is_read
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.is_read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type) + '20' }
        ]}>
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={24}
            color={getNotificationColor(item.type)}
          />
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.title,
              !item.is_read && styles.unreadTitle
            ]}>
              {item.title}
            </Text>
            <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          </View>
          
          <Text style={styles.message} numberOfLines={2}>
            {item.body}
          </Text>
          
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && styles.activeFilterTab
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterTabText,
            filter === 'all' && styles.activeFilterTabText
          ]}>
            {t('notifications.all')} ({notifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'unread' && styles.activeFilterTab
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterTabText,
            filter === 'unread' && styles.activeFilterTabText
          ]}>
            {t('notifications.unread')} ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>
              {filter === 'unread' 
                ? t('notifications.noUnread')
                : t('notifications.noNotifications')
              }
            </Text>
            <Text style={styles.emptySubtitle}>
              {t('notifications.emptyDescription')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  markAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    position: 'relative',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default NotificationsScreen;
