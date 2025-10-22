// Notification service Edge Function for LocalMart
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  user_ids: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: string;
}

interface SMSRequest {
  phone: string;
  message: string;
  template_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    switch (action) {
      case 'push':
        return await handlePushNotification(req, supabaseClient)
      case 'sms':
        return await handleSMS(req, supabaseClient)
      case 'email':
        return await handleEmail(req, supabaseClient)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function handlePushNotification(req: Request, supabaseClient: any) {
  const { user_ids, title, body, data, type }: NotificationRequest = await req.json()

  // Get FCM tokens for users
  const { data: users, error: usersError } = await supabaseClient
    .from('users')
    .select('id, fcm_token')
    .in('id', user_ids)
    .not('fcm_token', 'is', null)

  if (usersError) {
    throw new Error('Failed to fetch user tokens')
  }

  const fcmTokens = users.map((user: any) => user.fcm_token).filter(Boolean)

  if (fcmTokens.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No valid FCM tokens found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Send push notifications using Expo Push API
  const expoPushToken = Deno.env.get('EXPO_PUSH_TOKEN')
  if (!expoPushToken) {
    throw new Error('Expo push token not configured')
  }

  const notifications = fcmTokens.map(token => ({
    to: token,
    title,
    body,
    data: data || {},
    sound: 'default',
    badge: 1
  }))

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${expoPushToken}`
    },
    body: JSON.stringify(notifications)
  })

  const result = await response.json()

  // Store notifications in database
  const notificationRecords = user_ids.map(user_id => ({
    user_id,
    title,
    body,
    type: type || 'general',
    data: data || {},
    created_at: new Date().toISOString()
  }))

  const { error: insertError } = await supabaseClient
    .from('notifications')
    .insert(notificationRecords)

  if (insertError) {
    console.error('Error storing notifications:', insertError)
  }

  return new Response(
    JSON.stringify({ success: true, result }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleSMS(req: Request, supabaseClient: any) {
  const { phone, message, template_id }: SMSRequest = await req.json()

  const msg91AuthKey = Deno.env.get('MSG91_AUTH_KEY')
  const msg91SenderId = Deno.env.get('MSG91_SENDER_ID') || 'LCLMRT'

  if (!msg91AuthKey) {
    throw new Error('MSG91 credentials not configured')
  }

  // Format phone number (remove +91 if present)
  const formattedPhone = phone.replace(/^\+91/, '').replace(/\D/g, '')

  const smsData = {
    authkey: msg91AuthKey,
    mobiles: formattedPhone,
    message: message,
    sender: msg91SenderId,
    route: 4, // Transactional route
    country: 91,
    ...(template_id && { DLT_TE_ID: template_id })
  }

  const formData = new URLSearchParams()
  Object.entries(smsData).forEach(([key, value]) => {
    formData.append(key, value.toString())
  })

  const response = await fetch('https://api.msg91.com/api/sendhttp.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  })

  const result = await response.text()

  if (response.ok && result.includes('success')) {
    return new Response(
      JSON.stringify({ success: true, message: 'SMS sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else {
    throw new Error(`SMS sending failed: ${result}`)
  }
}

async function handleEmail(req: Request, supabaseClient: any) {
  // Email functionality using SendGrid or similar service
  const emailData = await req.json()
  
  // Placeholder for email implementation
  return new Response(
    JSON.stringify({ success: true, message: 'Email service not implemented yet' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}