import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Notification, NotificationType } from '../../types';
import { NotificationService } from '../../services/notificationService';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';

// Notification icon mapping based on type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'service_request_status':
    case 'booking_confirmation':
    case 'service_reminder':
      return 'calendar-outline';
    case 'payment_status':
    case 'payout_status':
      return 'wallet-outline';
    case 'new_message':
      return 'chatbubble-outline';
    case 'service_provider_arrival':
      return 'location-outline';
    case 'promo':
      return 'pricetag-outline';
    case 'system_alert':
      return 'alert-circle-outline';
    case 'new_review':
    case 'new_review_response':
      return 'star-outline';
    case 'new_service_request':
    case 'booking_cancelled':
      return 'briefcase-outline';
    case 'low_stock':
      return 'archive-outline';
    case 'business_verification':
      return 'shield-checkmark-outline';
    case 'business_analytics':
      return 'bar-chart-outline';
    case 'area_demand':
      return 'trending-up-outline';
    default:
      return 'notifications-outline';
  }
};

// Get notification color based on type
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'service_request_status':
    case 'booking_confirmation':
    case 'service_reminder':
      return '#4CAF50'; // Green
    case 'payment_status':
    case 'payout_status':
      return '#FF9800'; // Orange
    case 'new_message':
      return '#2196F3'; // Blue
    case 'service_provider_arrival':
      return '#9C27B0'; // Purple
    case 'promo':
      return '#F44336'; // Red
    case 'system_alert':
      return '#F44336'; // Red
    case 'new_review':
    case 'new_review_response':
      return '#FFC107'; // Amber
    case 'new_service_request':
      return '#4CAF50'; // Green
    case 'booking_cancelled':
      return '#F44336'; // Red
    default:
      return '#607D8B'; // Blue Grey
  }
};

// Format notification time
const formatNotificationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return format(date, 'h:mm a');
  } else {
    return formatDistanceToNow(date, { addSuffix: true });
  }
};

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const navigation = useNavigation<any>();

  const handlePress = async () => {
    // Mark as read
    if (!notification.is_read) {
      await NotificationService.markAsRead(notification.id);
    }

    // Navigate if action data is available
    if (notification.action_data?.screen) {
      navigation.navigate(notification.action_data.screen, notification.action_data.params || {});
    }

    // Call custom onPress if provided
    if (onPress) {
      onPress(notification);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        notification.is_read ? styles.read : styles.unread
      ]} 
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) }]}>
        {notification.image_url ? (
          <Image source={{ uri: notification.image_url }} style={styles.image} />
        ) : (
          <Ionicons 
            name={getNotificationIcon(notification.type)} 
            size={20} 
            color="#fff" 
          />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.time}>
            {formatNotificationTime(notification.created_at)}
          </Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  read: {
    backgroundColor: '#fff',
  },
  unread: {
    backgroundColor: '#f5f9ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
});

export default NotificationItem;