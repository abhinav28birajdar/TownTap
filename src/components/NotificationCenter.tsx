import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Notification, NotificationType } from '../types';
import { NotificationService } from '../services/notificationService';
import { notificationStore } from '../stores/notificationStore';
import NotificationItem from './ui/NotificationItem';

interface NotificationCenterProps {
  userId: string;
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onClose }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');

  const { notifications, unreadCount } = notificationStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      await NotificationService.fetchAllNotifications(userId);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await NotificationService.fetchAllNotifications(userId);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    await NotificationService.markAllAsRead(userId);
  };

  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter((notification: Notification) => notification.type === activeFilter);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#c5c5c5" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        We'll notify you when there are updates or new messages
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerButtons}>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.actionButtonText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'all' && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[
              styles.filterText, 
              activeFilter === 'all' && styles.activeFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'new_service_request' && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter('new_service_request')}
          >
            <Text style={[
              styles.filterText, 
              activeFilter === 'new_service_request' && styles.activeFilterText
            ]}>
              Requests
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'new_message' && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter('new_message')}
          >
            <Text style={[
              styles.filterText, 
              activeFilter === 'new_message' && styles.activeFilterText
            ]}>
              Messages
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'payment_status' && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter('payment_status')}
          >
            <Text style={[
              styles.filterText, 
              activeFilter === 'payment_status' && styles.activeFilterText
            ]}>
              Payments
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'service_request_status' && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter('service_request_status')}
          >
            <Text style={[
              styles.filterText, 
              activeFilter === 'service_request_status' && styles.activeFilterText
            ]}>
              Service Status
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'promo' && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter('promo')}
          >
            <Text style={[
              styles.filterText, 
              activeFilter === 'promo' && styles.activeFilterText
            ]}>
              Promos
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              onPress={(notification: Notification) => {
                if (notification.action_data?.screen) {
                  navigation.navigate(
                    notification.action_data.screen, 
                    notification.action_data.params || {}
                  );
                  if (onClose) onClose();
                }
              }}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={renderEmptyComponent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  actionButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#f5f5f5',
  },
  activeFilterChip: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    color: '#616161',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#424242',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default NotificationCenter;