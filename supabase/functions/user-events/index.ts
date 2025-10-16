// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const SUPABASE_URL = Deno?.env?.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface EventPayload {
  type: string;
  userId: string;
  data: Record<string, any>;
}

// Main handler for user events
serve(async (req: Request) => {
  try {
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
    const body = await req.json();
    
    // Validate payload
    if (!body.type || !body.userId) {
      return new Response(JSON.stringify({ 
        error: "Bad request: Missing required fields" 
      }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Make sure the authenticated user can only track events for themselves
    // unless they're an admin
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();
      
    const isAdmin = userRoles?.role === "admin";

    if (body.userId !== userData.user.id && !isAdmin) {
      return new Response(JSON.stringify({ 
        error: "Forbidden: Cannot track events for other users" 
      }), { 
        status: 403, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Process the event
    const result = await processEvent(body as EventPayload);

    // Return success response
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) {
    // Log and return any errors
    console.error("Error processing event:", error);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});

// Process different types of events
async function processEvent(payload: EventPayload): Promise<Record<string, any>> {
  console.log(`Processing event: ${payload.type} for user ${payload.userId}`);

  // Store the event
  const { error } = await supabase
    .from("user_events")
    .insert({
      user_id: payload.userId,
      event_type: payload.type,
      event_data: payload.data,
    });

  if (error) {
    throw new Error(`Failed to store event: ${error.message}`);
  }

  // Handle specific event types
  switch (payload.type) {
    case "app_opened":
      return await handleAppOpened(payload);
    case "feature_used":
      return await handleFeatureUsed(payload);
    case "business_viewed":
      return await handleBusinessViewed(payload);
    case "service_requested":
      return await handleServiceRequested(payload);
    case "review_submitted":
      return await handleReviewSubmitted(payload);
    case "search_performed":
      return await handleSearchPerformed(payload);
    default:
      // Generic handling for other event types
      return { success: true, message: "Event recorded" };
  }
}

// Handler for app_opened events
async function handleAppOpened(payload: EventPayload): Promise<Record<string, any>> {
  try {
    // Update the last_seen timestamp for the user
    const { error } = await supabase
      .from("profiles")
      .update({ 
        last_seen: new Date().toISOString(),
        app_open_count: supabase.rpc('increment', { row_id: payload.userId, table_name: 'profiles', column_name: 'app_open_count' })
      })
      .eq("id", payload.userId);

    if (error) {
      throw new Error(`Failed to update last_seen: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling app_opened event:", error);
    return { success: false, error: "Failed to process app_opened event" };
  }
}

// Handler for feature_used events
async function handleFeatureUsed(payload: EventPayload): Promise<Record<string, any>> {
  try {
    const featureId = payload.data?.feature_id;
    const featureName = payload.data?.feature_name;
    
    if (!featureId && !featureName) {
      return { success: false, error: "Missing feature_id or feature_name" };
    }

    // Update feature usage statistics
    if (featureId) {
      const { error } = await supabase
        .from("feature_usage")
        .upsert({
          user_id: payload.userId,
          feature_id: featureId,
          use_count: 1,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'user_id, feature_id',
          ignoreDuplicates: false
        });

      if (error) {
        throw new Error(`Failed to update feature usage: ${error.message}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling feature_used event:", error);
    return { success: false, error: "Failed to process feature_used event" };
  }
}

// Handler for business_viewed events
async function handleBusinessViewed(payload: EventPayload): Promise<Record<string, any>> {
  try {
    const businessId = payload.data?.business_id;
    
    if (!businessId) {
      return { success: false, error: "Missing business_id" };
    }

    // Record business view
    const { error } = await supabase
      .from("business_views")
      .insert({
        business_id: businessId,
        user_id: payload.userId,
        view_time: new Date().toISOString(),
        view_source: payload.data?.source || "app",
        view_duration: payload.data?.duration || null
      });

    if (error) {
      throw new Error(`Failed to record business view: ${error.message}`);
    }

    // Update business view count
    await supabase.rpc('increment_business_views', { 
      business_id_param: businessId 
    });

    return { success: true };
  } catch (error) {
    console.error("Error handling business_viewed event:", error);
    return { success: false, error: "Failed to process business_viewed event" };
  }
}

// Handler for service_requested events
async function handleServiceRequested(payload: EventPayload): Promise<Record<string, any>> {
  try {
    const businessId = payload.data?.business_id;
    const serviceId = payload.data?.service_id;
    
    if (!businessId || !serviceId) {
      return { success: false, error: "Missing business_id or service_id" };
    }

    // Create notification for business owner
    const { data: business } = await supabase
      .from("businesses")
      .select("owner_id")
      .eq("id", businessId)
      .single();

    if (business?.owner_id) {
      // Create notification
      await supabase.from("notifications").insert({
        recipient_id: business.owner_id,
        type: "new_service_request",
        title: "New Service Request",
        content: `You have a new service request from a customer`,
        data: {
          user_id: payload.userId,
          service_id: serviceId,
          request_time: new Date().toISOString()
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling service_requested event:", error);
    return { success: false, error: "Failed to process service_requested event" };
  }
}

// Handler for review_submitted events
async function handleReviewSubmitted(payload: EventPayload): Promise<Record<string, any>> {
  try {
    const businessId = payload.data?.business_id;
    const rating = payload.data?.rating;
    
    if (!businessId || !rating) {
      return { success: false, error: "Missing business_id or rating" };
    }

    // Update business average rating
    await supabase.rpc('update_business_rating', { 
      business_id_param: businessId,
      new_rating: rating
    });

    // Get business owner ID for notification
    const { data: business } = await supabase
      .from("businesses")
      .select("owner_id, name")
      .eq("id", businessId)
      .single();

    if (business?.owner_id) {
      // Get user name
      const { data: user } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", payload.userId)
        .single();

      const userName = user ? `${user.first_name} ${user.last_name}` : "A customer";
      
      // Create notification for business owner
      await supabase.from("notifications").insert({
        recipient_id: business.owner_id,
        type: "new_review",
        title: "New Review",
        content: `${userName} left a ${rating}-star review for ${business.name}`,
        data: {
          user_id: payload.userId,
          business_id: businessId,
          rating: rating,
          review: payload.data?.review || ""
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling review_submitted event:", error);
    return { success: false, error: "Failed to process review_submitted event" };
  }
}

// Handler for search_performed events
async function handleSearchPerformed(payload: EventPayload): Promise<Record<string, any>> {
  try {
    const searchQuery = payload.data?.query;
    const searchCategory = payload.data?.category;
    const searchLocation = payload.data?.location;
    
    if (!searchQuery) {
      return { success: false, error: "Missing search query" };
    }

    // Record search query
    const { error } = await supabase
      .from("search_queries")
      .insert({
        user_id: payload.userId,
        query: searchQuery,
        category: searchCategory || null,
        location: searchLocation || null,
        search_time: new Date().toISOString(),
        result_count: payload.data?.result_count || 0
      });

    if (error) {
      throw new Error(`Failed to record search query: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling search_performed event:", error);
    return { success: false, error: "Failed to process search_performed event" };
  }
}