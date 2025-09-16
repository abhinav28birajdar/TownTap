import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  // =====================================================
  // ORDER REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToOrderUpdates(
    userId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `order-updates-${userId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${userId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_history',
          filter: `order_id=in.(select id from orders where customer_id = '${userId}')`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  static subscribeToBusinessOrderUpdates(
    businessId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `business-orders-${businessId}`;
    
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `business_id=eq.${businessId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // =====================================================
  // MESSAGE REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToUserMessages(
    userId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `user-messages-${userId}`;
    
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `recipient_id=eq.${userId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `recipient_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  static subscribeToOrderMessages(
    orderId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `order-messages-${orderId}`;
    
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // =====================================================
  // NOTIFICATION REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToNotifications(
    userId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `notifications-${userId}`;
    
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // =====================================================
  // BUSINESS REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToBusinessUpdates(
    businessId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `business-updates-${businessId}`;
    
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'businesses',
          filter: `id=eq.${businessId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `business_id=eq.${businessId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `business_id=eq.${businessId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // =====================================================
  // PAYMENT REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToPaymentUpdates(
    userId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `payment-updates-${userId}`;
    
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `payer_id=eq.${userId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // =====================================================
  // SERVICE REQUEST REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToServiceRequestUpdates(
    userId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `service-requests-${userId}`;
    
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
          filter: `customer_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  static unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  static unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  static getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  // =====================================================
  // PRESENCE (USER ONLINE STATUS)
  // =====================================================

  static subscribeToUserPresence(
    userId: string,
    onJoin: (key: string, currentPresences: any, newPresences: any) => void,
    onLeave: (key: string, currentPresences: any, leftPresences: any) => void
  ): RealtimeChannel {
    const channelName = `presence-${userId}`;
    
    this.unsubscribe(channelName);
    
    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => onJoin(key, [], newPresences))
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => onLeave(key, [], leftPresences))
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  // =====================================================
  // BROADCAST (REAL-TIME EVENTS)
  // =====================================================

  static broadcastOrderStatusUpdate(orderId: string, status: string, userId: string): void {
    const channel = supabase.channel(`order-broadcast-${orderId}`);
    channel.send({
      type: 'broadcast',
      event: 'order_status_update',
      payload: {
        order_id: orderId,
        status,
        updated_by: userId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static broadcastLocationUpdate(userId: string, location: { latitude: number; longitude: number }): void {
    const channel = supabase.channel(`location-broadcast-${userId}`);
    channel.send({
      type: 'broadcast',
      event: 'location_update',
      payload: {
        user_id: userId,
        location,
        timestamp: new Date().toISOString(),
      },
    });
  }
}