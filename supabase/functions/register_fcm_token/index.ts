// FILE: supabase/functions/register_fcm_token/index.ts
// PURPOSE: Securely saves a user's FCM token to their profile.
// @ts-nocheck - Deno runtime environment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.0';
import { createResponse, handleOptionsRequest } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptionsRequest();
  if (req.method !== 'POST') return createResponse({ error: 'Method Not Allowed' }, 405);

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return createResponse({ error: 'Unauthorized: Invalid user token.' }, 401);
    }

    const { fcmToken } = await req.json();
    if (!fcmToken || typeof fcmToken !== 'string') {
      return createResponse({ error: 'fcmToken is missing or invalid.' }, 400);
    }

    // Update the user's profile with the new FCM token
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        fcm_token: fcmToken, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(`Failed to update FCM token for user ${user.id}:`, updateError);
      return createResponse({ error: `Database error: ${updateError.message}` }, 500);
    }

    return createResponse({ 
      message: `FCM token registered successfully for user ${user.id}` 
    }, 200);

  } catch (error: any) {
    console.error('Register FCM token function error:', error.message);
    return createResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
});