import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { generatePersonalizedGreeting } from '../_shared/aiClient.ts';
import { createResponse, handleOptionsRequest, verifyUserJwt } from '../_shared/supabaseClient.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // Verify user JWT
    const user = await verifyUserJwt(req.headers.get('Authorization'));

    // Parse request body
    const { userName, context } = await req.json();

    // Generate greeting
    const greeting = await generatePersonalizedGreeting(userName, {
      timeOfDay: context?.timeOfDay,
      lastVisit: context?.lastVisit,
      previousOrders: context?.previousOrders
    });

    return createResponse({ greeting });
  } catch (error) {
    console.error('Error in get-personalized-greeting:', error);
    return createResponse(
      { error: error.message },
      error.status || 500
    );
  }
});
