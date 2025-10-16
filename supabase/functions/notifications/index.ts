// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const SUPABASE_URL = Deno?.env?.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const FCM_SERVER_KEY = Deno?.env?.get("FCM_SERVER_KEY") || "";

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface SendNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface BulkSendNotificationPayload {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Main handler for notification endpoints
serve(async (req: Request) => {
  try {
    // Parse URL to get the path
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Handle different endpoints
    if (path === "send") {
      return await handleSendNotification(req);
    } else if (path === "bulk-send") {
      return await handleBulkSendNotification(req);
    } else {
      return new Response(JSON.stringify({ 
        error: "Endpoint not found" 
      }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" } 
      });
    }
  } catch (error) {
    // Log and return any errors
    console.error("Error in notifications function:", error);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});

// Handler for sending a notification to a single user
async function handleSendNotification(req: Request): Promise<Response> {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ 
      error: "Method not allowed" 
    }), { 
      status: 405, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Get auth token from request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized: Missing or invalid authorization token" 
    }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  const token = authHeader.split(" ")[1];
  
  // Verify auth token
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !userData.user) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized: Invalid token" 
    }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Parse request body
  const payload: SendNotificationPayload = await req.json();
  
  // Validate payload
  if (!payload.userId || !payload.title || !payload.body) {
    return new Response(JSON.stringify({ 
      error: "Bad request: Missing required fields" 
    }), { 
      status: 400, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Only admins can send notifications to other users
  if (payload.userId !== userData.user.id) {
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();
    
    const isAdmin = userRoles?.role === "admin";
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ 
        error: "Forbidden: Cannot send notifications to other users" 
      }), { 
        status: 403, 
        headers: { "Content-Type": "application/json" } 
      });
    }
  }

  // Send the notification
  const result = await sendNotification(payload);

  return new Response(JSON.stringify(result), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
}

// Handler for sending notifications to multiple users
async function handleBulkSendNotification(req: Request): Promise<Response> {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ 
      error: "Method not allowed" 
    }), { 
      status: 405, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Get auth token from request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized: Missing or invalid authorization token" 
    }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  const token = authHeader.split(" ")[1];
  
  // Verify auth token
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !userData.user) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized: Invalid token" 
    }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Parse request body
  const payload: BulkSendNotificationPayload = await req.json();
  
  // Validate payload
  if (!payload.userIds || !Array.isArray(payload.userIds) || payload.userIds.length === 0 || !payload.title || !payload.body) {
    return new Response(JSON.stringify({ 
      error: "Bad request: Missing required fields" 
    }), { 
      status: 400, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Only allow admins to send bulk notifications
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .single();
    
  const isAdmin = userRoles?.role === "admin";
  
  if (!isAdmin) {
    return new Response(JSON.stringify({ 
      error: "Forbidden: Only admins can send bulk notifications" 
    }), { 
      status: 403, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Send the notifications
  const results = await Promise.all(payload.userIds.map(userId => {
    return sendNotification({
      userId,
      title: payload.title,
      body: payload.body,
      data: payload.data
    });
  }));

  // Count successes and failures
  const successCount = results.filter(result => result.success).length;
  const failureCount = results.length - successCount;

  return new Response(JSON.stringify({ 
    success: true, 
    results: {
      total: results.length,
      success: successCount,
      failure: failureCount
    }
  }), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
}

// Function to send a notification to a user
async function sendNotification(payload: SendNotificationPayload): Promise<Record<string, any>> {
  try {
    // Get user's push notification tokens
    const { data: tokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("token, platform")
      .eq("user_id", payload.userId)
      .is("is_valid", true);

    if (tokensError) {
      throw new Error(`Failed to fetch push tokens: ${tokensError.message}`);
    }

    // Record notification in the database
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        recipient_id: payload.userId,
        title: payload.title,
        content: payload.body,
        type: payload.data?.type || "general",
        data: payload.data || {},
        is_read: false
      })
      .select()
      .single();

    if (notificationError) {
      throw new Error(`Failed to record notification: ${notificationError.message}`);
    }

    // If no tokens, still return success as we've recorded the notification
    if (!tokens || tokens.length === 0) {
      return { 
        success: true, 
        message: "Notification recorded, but user has no registered devices",
        notification_id: notification.id
      };
    }

    // Send push notifications to all user devices
    const pushResults = await Promise.all(tokens.map(async (token: { platform: string; token: string }) => {
      try {
        const fcmPayload = createFcmPayload(token.platform, token.token, payload, notification.id);
        return await sendFcmNotification(fcmPayload);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to send to token ${token.token}:`, error);
        return { success: false, token: token.token, error: errorMessage };
      }
    }));

    // Check for any successful deliveries
    const anySuccess = pushResults.some((result: { success: boolean }) => result.success);

    return { 
      success: true,
      notification_id: notification.id,
      push_results: {
        devices_attempted: tokens.length,
        devices_succeeded: pushResults.filter((result: { success: boolean }) => result.success).length,
        any_push_delivered: anySuccess
      }
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending notification:", error);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Create FCM payload based on platform
function createFcmPayload(platform: string, token: string, notification: SendNotificationPayload, notificationId: string): Record<string, any> {
  // Base FCM payload
  const payload: Record<string, any> = {
    to: token,
    priority: "high",
    data: {
      ...notification.data,
      notification_id: notificationId,
      click_action: "FLUTTER_NOTIFICATION_CLICK"
    }
  };

  // Add notification object
  payload.notification = {
    title: notification.title,
    body: notification.body
  };

  // Add platform specific configurations
  if (platform === "ios") {
    payload.notification.sound = "default";
    payload.content_available = true;
    payload.mutable_content = true;
    payload.notification.badge = "1"; // This will be modified by the app
  } else if (platform === "android") {
    payload.data.sound = "default";
    payload.data.channel_id = notification.data?.channel_id || "default_channel";
    payload.android = {
      priority: "high",
      notification: {
        sound: "default",
        notification_priority: "PRIORITY_HIGH",
        default_sound: true,
        default_vibrate_timings: true,
        visibility: "PRIVATE"
      }
    };
  }

  return payload;
}

// Send FCM notification
async function sendFcmNotification(payload: Record<string, any>): Promise<Record<string, any>> {
  try {
    if (!FCM_SERVER_KEY) {
      throw new Error("FCM_SERVER_KEY not configured");
    }

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `key=${FCM_SERVER_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`FCM error: ${responseData.error || JSON.stringify(responseData)}`);
    }

    // If message_id is present, the message was sent successfully
    if (responseData.results && responseData.results.length > 0) {
      const result = responseData.results[0];
      
      if (result.error) {
        // Handle specific FCM errors
        if (result.error === "NotRegistered" || result.error === "InvalidRegistration") {
          // Mark the token as invalid in the database
          await invalidateToken(payload.to);
        }
        
        return { success: false, error: result.error };
      }
      
      return { success: true, message_id: result.message_id };
    }

    return { success: true, response: responseData };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending FCM notification:", error);
    return { success: false, error: errorMessage };
  }
}

// Mark a token as invalid in the database
async function invalidateToken(token: string): Promise<void> {
  try {
    await supabase
      .from("push_tokens")
      .update({ is_valid: false })
      .eq("token", token);
  } catch (error: unknown) {
    console.error("Error invalidating token:", error);
  }
}