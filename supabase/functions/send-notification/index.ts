// @ts-ignore: Import from URL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Import from URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "../_shared/types"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  action_url?: string;
  send_push?: boolean;
  send_email?: boolean;
  send_sms?: boolean;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: NotificationPayload = await req.json()
    
    // Get user profile and notification preferences
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*, notification_preferences(*)')
      .eq('id', payload.recipient_id)
      .single()

    if (profileError || !profile) {
      throw new Error('User not found')
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        recipient_id: payload.recipient_id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data || {},
        action_url: payload.action_url,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (notificationError) {
      throw notificationError
    }

    // Send push notification if enabled and FCM token exists
    if (payload.send_push !== false && profile.fcm_token && 
        profile.notification_preferences?.push_notifications !== false) {
      
      try {
        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: profile.fcm_token,
            notification: {
              title: payload.title,
              body: payload.message,
              icon: 'ic_notification',
              sound: 'default'
            },
            data: {
              ...payload.data,
              notification_id: notification.id,
              action_url: payload.action_url
            },
            android: {
              priority: 'high',
              notification: {
                channel_id: 'towntap_default',
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
              }
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  'content-available': 1
                }
              }
            }
          })
        })

        const fcmResult = await fcmResponse.json()
        console.log('FCM Response:', fcmResult)

        // Update notification with FCM result
        await supabaseClient
          .from('notifications')
          .update({
            is_sent: fcmResponse.ok,
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id)

      } catch (fcmError) {
        console.error('FCM Error:', fcmError)
      }
    }

    // Send email notification if enabled
    if (payload.send_email && profile.email && 
        profile.notification_preferences?.email_notifications !== false) {
      
      try {
        // Use Supabase's built-in email service or external provider
        const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: profile.email,
            subject: payload.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #007AFF;">${payload.title}</h2>
                <p>${payload.message}</p>
                ${payload.action_url ? `<a href="${payload.action_url}" style="background-color: #007AFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open TownTap</a>` : ''}
                <hr style="margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                  This is an automated message from TownTap. You can manage your notification preferences in the app settings.
                </p>
              </div>
            `
          })
        })

        console.log('Email sent:', emailResponse.ok)
      } catch (emailError) {
        console.error('Email Error:', emailError)
      }
    }

    // Send SMS notification if enabled
    if (payload.send_sms && profile.phone_number && 
        profile.notification_preferences?.sms_notifications === true) {
      
      try {
        // Implement SMS service (Twilio, AWS SNS, etc.)
        const smsMessage = `${payload.title}: ${payload.message}`
        
        // Example with a generic SMS API
        const smsResponse = await fetch(Deno.env.get('SMS_API_URL') ?? '', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SMS_API_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: profile.phone_number,
            message: smsMessage,
            from: 'TownTap'
          })
        })

        console.log('SMS sent:', smsResponse.ok)
      } catch (smsError) {
        console.error('SMS Error:', smsError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_id: notification.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})