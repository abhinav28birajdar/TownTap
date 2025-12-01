import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from './database.types';
import { supabase } from './supabase';

type Tables = Database['public']['Tables'];
type BookingRow = Tables['bookings']['Row'];
type BusinessRow = Tables['businesses']['Row'];
type ReviewRow = Tables['reviews']['Row'];
type MessageRow = Tables['messages']['Row'];

export interface RealtimeConfig {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Subscribe to real-time booking updates for a specific user
   */
  subscribeToUserBookings(
    userId: string,
    callbacks: {
      onInsert?: (booking: BookingRow) => void;
      onUpdate?: (booking: BookingRow) => void;
      onDelete?: (bookingId: string) => void;
    },
    config?: RealtimeConfig
  ): RealtimeChannel {
    const channelName = `user-bookings-${userId}`;
    
    // Remove existing channel if it exists
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `customer_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<BookingRow>) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onInsert?.(payload.new);
              break;
            case 'UPDATE':
              callbacks.onUpdate?.(payload.new);
              break;
            case 'DELETE':
              callbacks.onDelete?.(payload.old.id);
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          config?.onConnect?.();
          this.reconnectAttempts = 0;
        } else if (status === 'CHANNEL_ERROR') {
          config?.onError?.(new Error('Failed to subscribe to booking updates'));
          this.handleReconnect(channelName, () => 
            this.subscribeToUserBookings(userId, callbacks, config)
          );
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to real-time business booking updates for business owners
   */
  subscribeToBusinessBookings(
    businessId: string,
    callbacks: {
      onInsert?: (booking: BookingRow) => void;
      onUpdate?: (booking: BookingRow) => void;
      onDelete?: (bookingId: string) => void;
    },
    config?: RealtimeConfig
  ): RealtimeChannel {
    const channelName = `business-bookings-${businessId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`,
        },
        (payload: RealtimePostgresChangesPayload<BookingRow>) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onInsert?.(payload.new);
              break;
            case 'UPDATE':
              callbacks.onUpdate?.(payload.new);
              break;
            case 'DELETE':
              callbacks.onDelete?.(payload.old.id);
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          config?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          config?.onError?.(new Error('Failed to subscribe to business booking updates'));
          this.handleReconnect(channelName, () => 
            this.subscribeToBusinessBookings(businessId, callbacks, config)
          );
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to chat messages between customer and business
   */
  subscribeToChatMessages(
    bookingId: string,
    callbacks: {
      onNewMessage?: (message: MessageRow) => void;
      onMessageUpdate?: (message: MessageRow) => void;
      onMessageDelete?: (messageId: string) => void;
    },
    config?: RealtimeConfig
  ): RealtimeChannel {
    const channelName = `chat-${bookingId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload: RealtimePostgresChangesPayload<MessageRow>) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onNewMessage?.(payload.new);
              break;
            case 'UPDATE':
              callbacks.onMessageUpdate?.(payload.new);
              break;
            case 'DELETE':
              callbacks.onMessageDelete?.(payload.old.id);
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          config?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          config?.onError?.(new Error('Failed to subscribe to chat messages'));
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to business profile updates
   */
  subscribeToBusinessUpdates(
    businessId: string,
    callbacks: {
      onUpdate?: (business: BusinessRow) => void;
      onStatusChange?: (business: BusinessRow) => void;
    },
    config?: RealtimeConfig
  ): RealtimeChannel {
    const channelName = `business-${businessId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'businesses',
          filter: `id=eq.${businessId}`,
        },
        (payload: RealtimePostgresChangesPayload<BusinessRow>) => {
          callbacks.onUpdate?.(payload.new);
          
          // Check if status changed
          if (payload.old.is_open !== payload.new.is_open) {
            callbacks.onStatusChange?.(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          config?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          config?.onError?.(new Error('Failed to subscribe to business updates'));
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to new reviews for a business
   */
  subscribeToBusinessReviews(
    businessId: string,
    callbacks: {
      onNewReview?: (review: ReviewRow) => void;
      onReviewUpdate?: (review: ReviewRow) => void;
    },
    config?: RealtimeConfig
  ): RealtimeChannel {
    const channelName = `reviews-${businessId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `business_id=eq.${businessId}`,
        },
        (payload: RealtimePostgresChangesPayload<ReviewRow>) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onNewReview?.(payload.new);
              break;
            case 'UPDATE':
              callbacks.onReviewUpdate?.(payload.new);
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          config?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          config?.onError?.(new Error('Failed to subscribe to business reviews'));
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to presence updates for online users
   */
  subscribeToPresence(
    roomId: string,
    userId: string,
    userMeta: { name: string; role: string; avatar?: string },
    callbacks: {
      onJoin?: (user: any) => void;
      onLeave?: (user: any) => void;
      onSync?: () => void;
    },
    config?: RealtimeConfig
  ): RealtimeChannel {
    const channelName = `presence-${roomId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        callbacks.onSync?.();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        callbacks.onJoin?.(newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        callbacks.onLeave?.(leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
            ...userMeta,
          });
          config?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          config?.onError?.(new Error('Failed to subscribe to presence updates'));
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Send a broadcast message to all subscribers of a channel
   */
  async broadcast(
    channelName: string,
    event: string,
    payload: any
  ): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  }

  /**
   * Subscribe to broadcast events
   */
  subscribeToBroadcast(
    channelName: string,
    event: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event }, callback)
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(
    channelName: string,
    reconnectCallback: () => void
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        reconnectCallback();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    return supabase.realtime.connection?.state || 'disconnected';
  }

  /**
   * Get active channels count
   */
  getActiveChannelsCount(): number {
    return this.channels.size;
  }

  /**
   * Get channel by name
   */
  getChannel(channelName: string): RealtimeChannel | undefined {
    return this.channels.get(channelName);
  }
}

// Create and export singleton instance
export const realtimeService = new RealtimeService();

// Export types for use in components
export type {
    BookingRow,
    BusinessRow, MessageRow,
    RealtimeChannel, ReviewRow
};

// Utility functions for common real-time operations
export const realtimeUtils = {
  /**
   * Create a unique channel name for user-specific subscriptions
   */
  createUserChannelName: (userId: string, type: string): string => {
    return `user-${userId}-${type}`;
  },

  /**
   * Create a unique channel name for business-specific subscriptions
   */
  createBusinessChannelName: (businessId: string, type: string): string => {
    return `business-${businessId}-${type}`;
  },

  /**
   * Create a unique channel name for booking-specific subscriptions
   */
  createBookingChannelName: (bookingId: string, type: string): string => {
    return `booking-${bookingId}-${type}`;
  },

  /**
   * Parse booking status for real-time updates
   */
  parseBookingStatus: (status: string): {
    color: string;
    displayText: string;
    priority: number;
  } => {
    const statusMap = {
      pending: { color: '#F59E0B', displayText: 'Pending', priority: 1 },
      confirmed: { color: '#10B981', displayText: 'Confirmed', priority: 2 },
      in_progress: { color: '#3B82F6', displayText: 'In Progress', priority: 3 },
      completed: { color: '#059669', displayText: 'Completed', priority: 4 },
      cancelled: { color: '#EF4444', displayText: 'Cancelled', priority: 0 },
    };
    
    return statusMap[status as keyof typeof statusMap] || {
      color: '#64748B',
      displayText: status,
      priority: 0,
    };
  },
};

export default realtimeService;