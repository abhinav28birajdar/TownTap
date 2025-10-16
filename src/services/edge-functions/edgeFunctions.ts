import { supabase } from '../../lib/supabase';
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Send a notification via the Supabase Edge Function
 * 
 * @param userId The ID of the user to send the notification to
 * @param title The notification title
 * @param body The notification content
 * @param data Optional additional data to include with the notification
 * @returns Response from the notifications edge function
 */
export const sendNotification = async (
  userId: string, 
  title: string, 
  body: string, 
  data?: Record<string, any>
): Promise<any> => {
  try {
    const { data: response, error } = await supabase.functions.invoke('notifications/send', {
      body: JSON.stringify({
        userId,
        title,
        body,
        data
      })
    });

    if (error) {
      console.error('Error sending notification:', error.message);
      return { success: false, error: error.message };
    }

    return response;
  } catch (error: any) {
    console.error('Error sending notification:', error.message);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

/**
 * Send notifications to multiple users via the Supabase Edge Function
 * 
 * @param userIds Array of user IDs to send the notification to
 * @param title The notification title
 * @param body The notification content
 * @param data Optional additional data to include with the notification
 * @returns Response from the notifications edge function
 */
export const sendBulkNotifications = async (
  userIds: string[], 
  title: string, 
  body: string, 
  data?: Record<string, any>
): Promise<any> => {
  try {
    if (!userIds || userIds.length === 0) {
      return { success: false, error: 'No users specified' };
    }

    const { data: response, error } = await supabase.functions.invoke('notifications/bulk-send', {
      body: JSON.stringify({
        userIds,
        title,
        body,
        data
      })
    });

    if (error) {
      console.error('Error sending bulk notifications:', error.message);
      return { success: false, error: error.message };
    }

    return response;
  } catch (error: any) {
    console.error('Error sending bulk notifications:', error.message);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

/**
 * Register a push notification token for the current user
 * 
 * @param token The device token for push notifications
 * @param platform The device platform ('ios' or 'android')
 * @param deviceId Unique identifier for the device
 * @returns Success or error information
 */
export const registerPushToken = async (
  token: string, 
  platform: 'ios' | 'android', 
  deviceId: string
): Promise<any> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (existingToken) {
      // Token exists, update it
      const { error } = await supabase
        .from('push_tokens')
        .update({
          user_id: user.user.id,
          device_id: deviceId,
          platform,
          is_valid: true,
          updated_at: new Date().toISOString()
        })
        .eq('token', token);

      if (error) {
        throw error;
      }
    } else {
      // Token doesn't exist, insert it
      const { error } = await supabase
        .from('push_tokens')
        .insert({
          user_id: user.user.id,
          token,
          device_id: deviceId,
          platform,
          is_valid: true
        });

      if (error) {
        throw error;
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error registering push token:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

/**
 * Track a user event via the Supabase Edge Function
 * 
 * @param eventType The type of event (e.g. 'app_opened', 'feature_used')
 * @param eventData Additional data associated with the event
 * @returns Response from the user-events edge function
 */
export const trackEvent = async (
  eventType: string, 
  eventData?: Record<string, any>
): Promise<any> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: response, error } = await supabase.functions.invoke('user-events', {
      body: JSON.stringify({
        type: eventType,
        userId: user.user.id,
        data: eventData || {}
      })
    });

    if (error) {
      console.error(`Error tracking event ${eventType}:`, error.message);
      return { success: false, error: error.message };
    }

    return response;
  } catch (error: any) {
    console.error(`Error tracking event ${eventType}:`, error.message);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};