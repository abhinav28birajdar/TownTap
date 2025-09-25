// FILE: supabase/functions/send_fcm_notification/index.ts
// PURPOSE: A callable Edge Function to send a push notification to a specific user.
// @ts-nocheck - Deno runtime environment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendFCMNotification } from '../_shared/fcmNotification.ts';
import { createResponse, handleOptionsRequest, supabaseServiceRole } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptionsRequest();
  if (req.method !== 'POST') return createResponse({ error: 'Method Not Allowed' }, 405);

  try {
    const { recipientId, title, body, data } = await req.json();
    if (!recipientId || !title || !body) {
      return createResponse({ 
        error: 'Missing required fields: recipientId, title, body' 
      }, 400);
    }

    // Fetch the recipient's FCM token from the database
    const { data: profile, error } = await supabaseServiceRole
      .from('profiles')
      .select('fcm_token')
      .eq('id', recipientId)
      .single();

    if (error || !profile || !profile.fcm_token) {
      return createResponse({ 
        error: `User profile or FCM token not found for recipientId: ${recipientId}` 
      }, 404);
    }

    // Send the notification
    const success = await sendFCMNotification(profile.fcm_token, title, body, data || {});

    if (success) {
      return createResponse({ message: 'Notification sent successfully.' }, 200);
    } else {
      return createResponse({ error: 'Failed to send notification.' }, 500);
    }

  } catch (error: any) {
    console.error('Send FCM Notification function error:', error.message);
    return createResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
});