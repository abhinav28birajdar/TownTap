import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  data: any;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Demo notifications data
  const demoNotifications: Notification[] = [
    {
      id: '1',
      title: 'Booking Confirmed',
      message: 'Your furniture assembly booking has been confirmed for tomorrow at 2:00 PM',
      type: 'booking',
      read: false,
      created_at: new Date().toISOString(),
      data: { booking_id: '1' }
    },
    {
      id: '2',
      title: 'Service Provider En Route',
      message: 'John from Quick Fix Carpentry is on the way to your location',
      type: 'location',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      data: { booking_id: '2' }
    },
    {
      id: '3',
      title: 'Service Completed',
      message: 'Your plumbing repair service has been completed. Please rate your experience.',
      type: 'completion',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      data: { booking_id: '3' }
    },
    {
      id: '4',
      title: 'New Offer Available',
      message: '20% off on electrical services this week! Book now and save.',
      type: 'promotion',
      read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      data: { promotion_id: 'promo1' }
    },
    {
      id: '5',
      title: 'Payment Received',
      message: 'Payment of $75 for furniture assembly has been processed successfully',
      type: 'payment',
      read: true,
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      data: { transaction_id: 'txn1' }
    }
  ];

  useEffect(() => {
    if (isDemo) {
      setNotifications(demoNotifications);
      setLoading(false);
      return;
    }
    
    loadNotifications();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isDemo]);

  const loadNotifications = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (isDemo) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notifications')
        // @ts-ignore
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error: any) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (isDemo) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      return;
    }
    
    try {
      if (!user?.id) return;

      // @ts-ignore
      const { error } = await supabase
        .from('notifications')
        // @ts-ignore
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (isDemo) {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      return;
    }
    
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'calendar';
      case 'payment':
        return 'card';
      case 'review':
        return 'star';
      case 'message':
        return 'chatbubble';
      default:
        return 'notifications';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.bookingId) {
      console.log('Navigate to booking:', notification.data.bookingId);
    } else if (notification.data?.businessId) {
      router.push(`/business/${notification.data.businessId}` as any);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        style={[
          styles.iconContainer,
          !item.read && styles.unreadIconContainer,
        ]}
      >
        <Ionicons
          name={getNotificationIcon(item.type) as any}
          size={24}
          color={!item.read ? Colors.primary : Colors.textSecondary}
        />
      </View>

      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            !item.read && styles.unreadTitle,
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTime(item.created_at)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => deleteNotification(item.id) },
            ]
          );
        }}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () =>
            unreadCount > 0 ? (
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.markAllButton}
              >
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="notifications-off-outline"
            size={80}
            color={Colors.textLight}
          />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>
            You'll see updates about your bookings here
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadNotifications();
              }}
              colors={[Colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  markAllButton: {
    marginRight: Spacing.md,
  },
  markAllText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#F0F4FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  unreadIconContainer: {
    backgroundColor: '#E0E7FF',
  },
  notificationContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  notificationTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
    color: Colors.text,
  },
  notificationMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});