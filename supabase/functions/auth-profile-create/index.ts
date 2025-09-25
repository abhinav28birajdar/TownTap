// @ts-nocheck
// FILE: supabase/functions/auth-profile-create/index.ts
// PURPOSE: HTTP/Webhook Triggered Function. Automatically creates a corresponding 'public.profiles' entry
// whenever a new user signs up in Supabase Auth (auth.users table).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createResponse, handleOptionsRequest, supabaseServiceRole } from '../_shared/supabaseClient.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptionsRequest();
  if (req.method !== 'POST') return createResponse({ error: 'Method Not Allowed' }, 405);

  try {
    const payload = await req.json();

    // Check if it's an 'INSERT' event on 'auth.users' table
    if (payload.type === 'INSERT' && payload.table === 'auth.users' && payload.record) {
      const newUser = payload.record;

      // Extract details including 'user_type' and 'full_name' from 'raw_user_meta_data'
      const userMetadata = newUser.raw_user_meta_data || {};
      
      const profileData = {
        id: newUser.id,
        email: newUser.email,
        phone_number: newUser.phone || null,
        full_name: userMetadata.full_name || null,
        user_type: userMetadata.user_type || 'customer',
        profile_picture_url: userMetadata.profile_picture_url || null,
        created_at: newUser.created_at,
        updated_at: newUser.created_at,
      };

      // Insert into public.profiles table using service_role client to bypass RLS
      const { data, error } = await supabaseServiceRole
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile in public.profiles for user:', newUser.id, 'Error:', error.message);
        return createResponse({ error: `Failed to create profile: ${error.message}` }, 500);
      }

      console.log(`Profile created for user ${newUser.id} as type ${profileData.user_type}.`);
      return createResponse({ message: 'Profile created successfully', profile: data }, 200);

    } else if (payload.type === 'UPDATE' && payload.table === 'auth.users' && payload.record) {
      // Handle profile updates if certain auth.users changes should propagate to public.profiles
      return createResponse({ message: 'Auth user update event acknowledged (no profile update)' }, 200);

    } else if (payload.type === 'DELETE' && payload.table === 'auth.users' && payload.old_record) {
      // Deletion of user from auth.users. The RLS should handle cascade delete if FK is set with ON DELETE CASCADE.
      console.log('Auth user delete event detected for user ID:', payload.old_record.id);
      return createResponse({ message: 'Auth user deletion event acknowledged' }, 200);
    }

    return createResponse({ message: 'Event received, no action taken for this type of event.' }, 200);

  } catch (error: any) {
    console.error('Auth Profile Create Edge Function error:', error.message, error.stack);
    return createResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
});
