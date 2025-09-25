// =====================================================
// REAL-TIME NOTIFICATIONS EDGE FUNCTION
// =====================================================
// Handles FCM notifications, SMS, and in-app notifications
// @ts-nocheck - Deno runtime environment

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  user_id: string
  title: string
  body: string
  type: 'order_update' | 'payment' | 'promotion' | 'reminder' | 'system'
  data?: Record<string, any>
  channels?: ('push' | 'sms' | 'email')[]
  schedule_at?: string // ISO date string for scheduled notifications
}

interface BulkNotificationRequest {
  user_ids: string[]
  title: string
  body: string
  type: string
  data?: Record<string, any>
  channels?: ('push' | 'sms' | 'email')[]
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    switch (action) {
      case 'send-notification':
        return await sendNotification(req, supabase)
      case 'send-bulk':
        return await sendBulkNotifications(req, supabase)
      case 'update-fcm-token':
        return await updateFCMToken(req, supabase)
      case 'get-notification-history':
        return await getNotificationHistory(req, supabase)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'NOTIFICATION_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function sendNotification(req: Request, supabase: any) {
  const { user_id, title, body, type, data = {}, channels = ['push'], schedule_at }: NotificationRequest = await req.json()

  // Get user details and preferences
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('fcm_token, phone, email, notification_preferences')
    .eq('id', user_id)
    .single()

  if (userError || !user) {
    throw new Error('User not found')
  }

  // Check user preferences
  const preferences = user.notification_preferences || {}
  if (!preferences[type] && type !== 'system') {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification blocked by user preferences'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }

  // Save notification to database
  const { data: notification, error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id,
      title,
      body,
      type,
      data
    })
    .select()
    .single()

  if (notificationError) throw notificationError

  const results = {
    push: false,
    sms: false,
    email: false
  }

  // Send via requested channels
  for (const channel of channels) {
    try {
      switch (channel) {
        case 'push':
          if (user.fcm_token) {
            await sendFCMNotification(user.fcm_token, title, body, data)
            results.push = true
            
            // Update notification record
            await supabase
              .from('notifications')
              .update({ 
                fcm_sent: true, 
                fcm_sent_at: new Date().toISOString() 
              })
              .eq('id', notification.id)
          }
          break
          
        case 'sms':
          if (user.phone) {
            await sendSMSNotification(user.phone, `${title}: ${body}`)
            results.sms = true
          }
          break
          
        case 'email':
          if (user.email) {
            await sendEmailNotification(user.email, title, body)
            results.email = true
          }
          break
      }
    } catch (channelError) {
      console.error(`Failed to send ${channel} notification:`, channelError)
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        notification_id: notification.id,
        delivery_results: results
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function sendBulkNotifications(req: Request, supabase: any) {
  const { user_ids, title, body, type, data = {}, channels = ['push'] }: BulkNotificationRequest = await req.json()

  // Get users with their tokens and preferences
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, fcm_token, phone, email, notification_preferences')
    .in('id', user_ids)

  if (usersError) throw usersError

  const results = {
    total_users: users.length,
    sent_push: 0,
    sent_sms: 0,
    sent_email: 0,
    blocked_by_preferences: 0
  }

  // Send notifications in batches
  const batchSize = 50
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    await Promise.all(batch.map(async (user: any) => {
      try {
        // Check user preferences
        const preferences = user.notification_preferences || {}
        if (!preferences[type] && type !== 'system') {
          results.blocked_by_preferences++
          return
        }

        // Save notification to database
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title,
            body,
            type,
            data
          })

        // Send via requested channels
        for (const channel of channels) {
          switch (channel) {
            case 'push':
              if (user.fcm_token) {
                await sendFCMNotification(user.fcm_token, title, body, data)
                results.sent_push++
              }
              break
            case 'sms':
              if (user.phone) {
                await sendSMSNotification(user.phone, `${title}: ${body}`)
                results.sent_sms++
              }
              break
            case 'email':
              if (user.email) {
                await sendEmailNotification(user.email, title, body)
                results.sent_email++
              }
              break
          }
        }
      } catch (error) {
        console.error(`Failed to send notification to user ${user.id}:`, error)
      }
    }))
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: results
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function sendFCMNotification(fcmToken: string, title: string, body: string, data: Record<string, any>) {
  const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY')
  
  if (!firebaseServerKey) {
    throw new Error('Firebase server key not configured')
  }

  const message = {
    to: fcmToken,
    notification: {
      title,
      body,
      icon: '/assets/icon.png',
      click_action: 'FLUTTER_NOTIFICATION_CLICK'
    },
    data: {
      ...data,
      type: data.type || 'general'
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channel_id: 'towntap_channel'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1
        }
      }
    }
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${firebaseServerKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`FCM Error: ${errorData.error || 'Unknown error'}`)
  }

  return await response.json()
}

async function sendSMSNotification(phone: string, message: string) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioFromNumber = Deno.env.get('TWILIO_FROM_NUMBER')

  if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
    throw new Error('Twilio credentials not configured')
  }

  const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
  
  const formData = new URLSearchParams()
  formData.append('To', phone)
  formData.append('From', twilioFromNumber)
  formData.append('Body', message)

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Twilio Error: ${errorData.message || 'Unknown error'}`)
  }

  return await response.json()
}

async function sendEmailNotification(email: string, subject: string, body: string) {
  // Using Supabase Edge Function for email (or integrate with SendGrid/Resend)
  // This is a placeholder - implement based on your email provider
  console.log(`Email notification to ${email}: ${subject}`)
  
  // Example with SendGrid
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@towntap.com'

  if (!sendGridApiKey) {
    console.warn('SendGrid API key not configured')
    return
  }

  const emailData = {
    personalizations: [{
      to: [{ email }],
      subject
    }],
    from: { email: fromEmail, name: 'TownTap' },
    content: [{
      type: 'text/html',
      value: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #3B82F6;">${subject}</h2>
              <p>${body}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                This is an automated message from TownTap. Please do not reply to this email.
              </p>
            </div>
          </body>
        </html>
      `
    }]
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendGridApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`SendGrid Error: ${errorData}`)
  }
}

async function updateFCMToken(req: Request, supabase: any) {
  const { user_id, fcm_token } = await req.json()

  const { error } = await supabase
    .from('profiles')
    .update({ fcm_token, updated_at: new Date().toISOString() })
    .eq('id', user_id)

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      message: 'FCM token updated successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function getNotificationHistory(req: Request, supabase: any) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('user_id')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  // Mark notifications as read
  await supabase
    .from('notifications')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .eq('is_read', false)

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        notifications,
        total_count: notifications.length,
        has_more: notifications.length === limit
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}
