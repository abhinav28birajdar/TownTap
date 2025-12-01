import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import Toast from 'react-native-toast-message';
import { notificationService } from '../lib/notification-service';
import { BookingRow, BusinessRow, MessageRow, RealtimeConfig, realtimeService, ReviewRow } from '../lib/realtime-service';
import { useAppStore } from '../stores/app-store';
import { useAuthStore } from '../stores/auth-store';
import { useBusinessStore } from '../stores/business-store';

interface UseRealtimeOptions {
  enableBookings?: boolean;
  enableMessages?: boolean;
  enableReviews?: boolean;
  enableBusinessUpdates?: boolean;
  enablePresence?: boolean;
  autoReconnect?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { user } = useAuthStore();
  const { addNotification, updateConnectionStatus } = useAppStore();
  const { currentBusiness, updateBusinessData, addBooking, updateBooking, removeBooking } = useBusinessStore();
  
  const appStateRef = useRef(AppState.currentState);
  const subscriptionsRef = useRef<string[]>([]);

  const {
    enableBookings = true,
    enableMessages = true,
    enableReviews = true,
    enableBusinessUpdates = true,
    enablePresence = false,
    autoReconnect = true,
  } = options;

  /**
   * Real-time configuration
   */
  const realtimeConfig: RealtimeConfig = {
    onConnect: useCallback(() => {
      updateConnectionStatus('connected');
      console.log('✅ Real-time connected');
    }, [updateConnectionStatus]),

    onDisconnect: useCallback(() => {
      updateConnectionStatus('disconnected');
      console.log('❌ Real-time disconnected');
    }, [updateConnectionStatus]),

    onError: useCallback((error: Error) => {
      updateConnectionStatus('error');
      console.error('🚨 Real-time error:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Real-time updates temporarily unavailable',
        position: 'top',
        visibilityTime: 3000,
      });
    }, [updateConnectionStatus]),
  };

  /**
   * Subscribe to user bookings
   */
  const subscribeToUserBookings = useCallback(() => {
    if (!user?.id || !enableBookings) return;

    const channelName = `user-bookings-${user.id}`;
    subscriptionsRef.current.push(channelName);

    realtimeService.subscribeToUserBookings(
      user.id,
      {
        onInsert: (booking: BookingRow) => {
          console.log('📝 New booking received:', booking);
          
          // Add to local state
          addBooking(booking);
          
          // Show notification
          notificationService.showBookingNotification(booking, 'new');
          
          // Add app notification
          addNotification({
            id: `booking-${booking.id}`,
            type: 'booking',
            title: 'New Booking',
            message: `Booking request for ${new Date(booking.booking_date).toLocaleDateString()}`,
            data: { bookingId: booking.id },
            timestamp: new Date().toISOString(),
          });

          Toast.show({
            type: 'success',
            text1: '🎉 New Booking',
            text2: `Booking request received`,
            position: 'top',
          });
        },

        onUpdate: (booking: BookingRow) => {
          console.log('📋 Booking updated:', booking);
          
          // Update local state
          updateBooking(booking.id, booking);
          
          // Show notification for status changes
          notificationService.showBookingNotification(booking, 'updated');
          
          Toast.show({
            type: 'info',
            text1: '📋 Booking Updated',
            text2: `Status: ${booking.status}`,
            position: 'top',
          });
        },

        onDelete: (bookingId: string) => {
          console.log('❌ Booking cancelled:', bookingId);
          
          // Remove from local state
          removeBooking(bookingId);
          
          Toast.show({
            type: 'error',
            text1: '❌ Booking Cancelled',
            text2: 'A booking has been cancelled',
            position: 'top',
          });
        },
      },
      realtimeConfig
    );
  }, [user?.id, enableBookings, addBooking, updateBooking, removeBooking, addNotification, realtimeConfig]);

  /**
   * Subscribe to business bookings (for business owners)
   */
  const subscribeToBusinessBookings = useCallback(() => {
    if (!currentBusiness?.id || !enableBookings) return;

    const channelName = `business-bookings-${currentBusiness.id}`;
    subscriptionsRef.current.push(channelName);

    realtimeService.subscribeToBusinessBookings(
      currentBusiness.id,
      {
        onInsert: (booking: BookingRow) => {
          console.log('🏢 New business booking:', booking);
          
          addBooking(booking);
          notificationService.showBookingNotification(booking, 'new');
          
          addNotification({
            id: `business-booking-${booking.id}`,
            type: 'booking',
            title: 'New Customer Booking',
            message: `New booking from customer`,
            data: { bookingId: booking.id, businessId: currentBusiness.id },
            timestamp: new Date().toISOString(),
          });

          Toast.show({
            type: 'success',
            text1: '🎉 New Customer Booking',
            text2: 'A customer has made a booking',
            position: 'top',
          });
        },

        onUpdate: (booking: BookingRow) => {
          console.log('🏢 Business booking updated:', booking);
          updateBooking(booking.id, booking);
          
          Toast.show({
            type: 'info',
            text1: '📋 Booking Updated',
            text2: `Booking status changed to ${booking.status}`,
            position: 'top',
          });
        },

        onDelete: (bookingId: string) => {
          console.log('🏢 Business booking cancelled:', bookingId);
          removeBooking(bookingId);
          
          Toast.show({
            type: 'info',
            text1: 'Booking Cancelled',
            text2: 'A customer cancelled their booking',
            position: 'top',
          });
        },
      },
      realtimeConfig
    );
  }, [currentBusiness?.id, enableBookings, addBooking, updateBooking, removeBooking, addNotification, realtimeConfig]);

  /**
   * Subscribe to chat messages
   */
  const subscribeToChatMessages = useCallback((bookingId: string) => {
    if (!enableMessages) return;

    const channelName = `chat-${bookingId}`;
    subscriptionsRef.current.push(channelName);

    realtimeService.subscribeToChatMessages(
      bookingId,
      {
        onNewMessage: (message: MessageRow) => {
          console.log('💬 New message:', message);
          
          // Only show notification if message is not from current user
          if (message.sender_id !== user?.id) {
            notificationService.showMessageNotification(message, 'Customer'); // You might want to fetch sender name
            
            addNotification({
              id: `message-${message.id}`,
              type: 'message',
              title: 'New Message',
              message: message.content || 'You have a new message',
              data: { messageId: message.id, bookingId },
              timestamp: new Date().toISOString(),
            });

            Toast.show({
              type: 'info',
              text1: '💬 New Message',
              text2: message.content || 'You have a new message',
              position: 'top',
            });
          }
        },

        onMessageUpdate: (message: MessageRow) => {
          console.log('💬 Message updated:', message);
          // Handle message updates (e.g., read status, edits)
        },

        onMessageDelete: (messageId: string) => {
          console.log('💬 Message deleted:', messageId);
          // Handle message deletion
        },
      },
      realtimeConfig
    );

    return () => {
      realtimeService.unsubscribe(channelName);
    };
  }, [user?.id, enableMessages, addNotification, realtimeConfig]);

  /**
   * Subscribe to business updates
   */
  const subscribeToBusinessUpdates = useCallback(() => {
    if (!currentBusiness?.id || !enableBusinessUpdates) return;

    const channelName = `business-${currentBusiness.id}`;
    subscriptionsRef.current.push(channelName);

    realtimeService.subscribeToBusinessUpdates(
      currentBusiness.id,
      {
        onUpdate: (business: BusinessRow) => {
          console.log('🏢 Business updated:', business);
          updateBusinessData(business);
          
          Toast.show({
            type: 'info',
            text1: '🏢 Business Updated',
            text2: 'Your business profile has been updated',
            position: 'top',
          });
        },

        onStatusChange: (business: BusinessRow) => {
          console.log('🏢 Business status changed:', business);
          updateBusinessData(business);
          
          notificationService.showBusinessUpdateNotification(business, 'status_change');
          
          Toast.show({
            type: business.is_open ? 'success' : 'info',
            text1: business.is_open ? '🟢 Business Open' : '🔴 Business Closed',
            text2: `Your business is now ${business.is_open ? 'open' : 'closed'}`,
            position: 'top',
          });
        },
      },
      realtimeConfig
    );
  }, [currentBusiness?.id, enableBusinessUpdates, updateBusinessData, realtimeConfig]);

  /**
   * Subscribe to business reviews
   */
  const subscribeToBusinessReviews = useCallback(() => {
    if (!currentBusiness?.id || !enableReviews) return;

    const channelName = `reviews-${currentBusiness.id}`;
    subscriptionsRef.current.push(channelName);

    realtimeService.subscribeToBusinessReviews(
      currentBusiness.id,
      {
        onNewReview: (review: ReviewRow) => {
          console.log('⭐ New review:', review);
          
          notificationService.showReviewNotification(review, 'Customer'); // You might want to fetch customer name
          
          addNotification({
            id: `review-${review.id}`,
            type: 'review',
            title: 'New Review',
            message: `You received a ${review.rating}-star review`,
            data: { reviewId: review.id, businessId: currentBusiness.id },
            timestamp: new Date().toISOString(),
          });

          const rating = '⭐'.repeat(Math.floor(review.rating || 0));
          Toast.show({
            type: 'success',
            text1: `${rating} New Review`,
            text2: `You received a ${review.rating}-star review`,
            position: 'top',
          });
        },

        onReviewUpdate: (review: ReviewRow) => {
          console.log('⭐ Review updated:', review);
          // Handle review updates
        },
      },
      realtimeConfig
    );
  }, [currentBusiness?.id, enableReviews, addNotification, realtimeConfig]);

  /**
   * Subscribe to presence (online users)
   */
  const subscribeToPresence = useCallback((roomId: string) => {
    if (!user?.id || !enablePresence) return;

    const channelName = `presence-${roomId}`;
    subscriptionsRef.current.push(channelName);

    realtimeService.subscribeToPresence(
      roomId,
      user.id,
      {
        name: user.full_name || 'User',
        role: user.role || 'customer',
        avatar: user.avatar_url || undefined,
      },
      {
        onJoin: (users) => {
          console.log('👋 Users joined:', users);
        },
        
        onLeave: (users) => {
          console.log('👋 Users left:', users);
        },
        
        onSync: () => {
          console.log('👥 Presence synced');
        },
      },
      realtimeConfig
    );

    return () => {
      realtimeService.unsubscribe(channelName);
    };
  }, [user, enablePresence, realtimeConfig]);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('📱 App foregrounded - reconnecting real-time');
        
        // Clear badge count when app becomes active
        notificationService.clearBadgeCount();
        
        // Reconnect if auto-reconnect is enabled
        if (autoReconnect && realtimeService.getConnectionStatus() !== 'open') {
          // Re-establish subscriptions
          subscribeToUserBookings();
          subscribeToBusinessBookings();
          subscribeToBusinessUpdates();
          subscribeToBusinessReviews();
        }
      } else if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        console.log('📱 App backgrounded');
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [autoReconnect, subscribeToUserBookings, subscribeToBusinessBookings, subscribeToBusinessUpdates, subscribeToBusinessReviews]);

  /**
   * Initialize subscriptions
   */
  useEffect(() => {
    if (!user?.id) {
      console.log('👤 No user - skipping real-time subscriptions');
      return;
    }

    console.log('🚀 Initializing real-time subscriptions for user:', user.id);

    // Subscribe to relevant channels based on user role and options
    subscribeToUserBookings();
    
    if (user.role === 'business_owner') {
      subscribeToBusinessBookings();
      subscribeToBusinessUpdates();
      subscribeToBusinessReviews();
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      subscriptionsRef.current.forEach(channelName => {
        realtimeService.unsubscribe(channelName);
      });
      subscriptionsRef.current = [];
    };
  }, [
    user?.id,
    user?.role,
    subscribeToUserBookings,
    subscribeToBusinessBookings,
    subscribeToBusinessUpdates,
    subscribeToBusinessReviews,
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clean up notification service
      notificationService.cleanup();
      
      // Unsubscribe from all channels
      realtimeService.unsubscribeAll();
    };
  }, []);

  return {
    // Connection status
    connectionStatus: realtimeService.getConnectionStatus(),
    activeChannels: realtimeService.getActiveChannelsCount(),
    
    // Subscribe functions
    subscribeToChatMessages,
    subscribeToPresence,
    
    // Utility functions
    broadcast: realtimeService.broadcast.bind(realtimeService),
    unsubscribe: realtimeService.unsubscribe.bind(realtimeService),
    unsubscribeAll: realtimeService.unsubscribeAll.bind(realtimeService),
    
    // Notification functions
    showNotification: notificationService.showNotification.bind(notificationService),
    updateNotificationPreferences: notificationService.updatePreferences.bind(notificationService),
    getNotificationPreferences: notificationService.getPreferences.bind(notificationService),
    clearBadgeCount: notificationService.clearBadgeCount.bind(notificationService),
  };
}

export default useRealtime;