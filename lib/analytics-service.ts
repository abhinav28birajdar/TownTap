import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface BusinessView {
  businessId: string;
  userId?: string;
  timestamp: Date;
  source?: string;
}

export interface BookingEvent {
  bookingId: string;
  businessId: string;
  customerId: string;
  action: 'created' | 'confirmed' | 'cancelled' | 'completed';
  timestamp: Date;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isFlushingQueue = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeSession() {
    try {
      // Load queued events from storage
      const stored = await AsyncStorage.getItem('@towntap:analytics_queue');
      if (stored) {
        this.eventQueue = JSON.parse(stored);
        this.flushQueue();
      }
    } catch (error) {
      console.error('Failed to initialize analytics session:', error);
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  async trackEvent(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);
    await this.saveQueue();

    // Flush queue if it's getting large
    if (this.eventQueue.length >= 10) {
      this.flushQueue();
    }
  }

  async trackBusinessView(businessId: string, source?: string) {
    await this.trackEvent('business_view', {
      businessId,
      source,
    });

    // Also update business analytics in database
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase.rpc('increment_business_view', {
        p_business_id: businessId,
        p_date: today,
      } as any);

      if (error) {
        console.error('Failed to update business analytics:', error);
      }
    } catch (error) {
      console.error('Error tracking business view:', error);
    }
  }

  async trackBooking(event: BookingEvent) {
    await this.trackEvent('booking_event', {
      bookingId: event.bookingId,
      businessId: event.businessId,
      customerId: event.customerId,
      action: event.action,
    });
  }

  async trackSearch(query: string, filters?: Record<string, any>, resultsCount?: number) {
    await this.trackEvent('search', {
      query,
      filters,
      resultsCount,
    });
  }

  async trackScreenView(screenName: string, params?: Record<string, any>) {
    await this.trackEvent('screen_view', {
      screenName,
      params,
    });
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem('@towntap:analytics_queue', JSON.stringify(this.eventQueue));
    } catch (error) {
      console.error('Failed to save analytics queue:', error);
    }
  }

  private async flushQueue() {
    if (this.isFlushingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.isFlushingQueue = true;

    try {
      // Send events to backend/analytics service
      // For now, just log them (you can integrate with Firebase Analytics, Mixpanel, etc.)
      console.log('📊 Analytics Events:', this.eventQueue);

      // Clear the queue
      this.eventQueue = [];
      await AsyncStorage.removeItem('@towntap:analytics_queue');
    } catch (error) {
      console.error('Failed to flush analytics queue:', error);
    } finally {
      this.isFlushingQueue = false;
    }
  }

  async flush() {
    await this.flushQueue();
  }
}

export const analyticsService = new AnalyticsService();
