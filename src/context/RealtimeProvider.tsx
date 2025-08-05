import { RealtimeChannel } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface RealtimeContextType {
  isConnected: boolean;
  businessUpdates: number;
  orderUpdates: number;
  notificationUpdates: number;
  subscribeToBusinessUpdates: () => void;
  subscribeToOrderUpdates: () => void;
  subscribeToNotifications: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
}

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [businessUpdates, setBusinessUpdates] = useState(0);
  const [orderUpdates, setOrderUpdates] = useState(0);
  const [notificationUpdates, setNotificationUpdates] = useState(0);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  useEffect(() => {
    // Global realtime connection status
    const statusChannel = supabase
      .channel('connection-status')
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('🔗 TownTap Realtime Connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.log('🔌 TownTap Realtime Disconnected');
        }
      });

    setChannels(prev => [...prev, statusChannel]);

    return () => {
      // Cleanup all channels on unmount
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      console.log('🧹 Cleaned up all realtime channels');
    };
  }, []);

  const subscribeToBusinessUpdates = () => {
    const businessChannel = supabase
      .channel('business-updates')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'businesses'
        },
        (payload: any) => {
          console.log('🏪 Business Update:', payload.eventType);
          setBusinessUpdates(prev => prev + 1);
          
          // Trigger UI refresh
          if (payload.eventType === 'INSERT') {
            console.log('✨ New business registered:', payload.new.business_name);
          } else if (payload.eventType === 'UPDATE') {
            console.log('📝 Business updated:', payload.new.business_name);
          }
        }
      )
      .subscribe();

    setChannels(prev => [...prev, businessChannel]);
  };

  const subscribeToOrderUpdates = () => {
    const orderChannel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload: any) => {
          console.log('📦 Order Update:', payload.eventType, payload.new?.status);
          setOrderUpdates(prev => prev + 1);
          
          // Trigger UI refresh
          if (payload.eventType === 'INSERT') {
            console.log('🛒 New order created:', payload.new.order_number);
          } else if (payload.eventType === 'UPDATE') {
            console.log('📋 Order status updated:', payload.new.order_number, payload.new.status);
          }
        }
      )
      .subscribe();

    setChannels(prev => [...prev, orderChannel]);
  };

  const subscribeToNotifications = () => {
    const notificationChannel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload: any) => {
          console.log('🔔 New Notification:', payload.new.title);
          setNotificationUpdates(prev => prev + 1);
        }
      )
      .subscribe();

    setChannels(prev => [...prev, notificationChannel]);
  };

  const value: RealtimeContextType = {
    isConnected,
    businessUpdates,
    orderUpdates,
    notificationUpdates,
    subscribeToBusinessUpdates,
    subscribeToOrderUpdates,
    subscribeToNotifications,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
