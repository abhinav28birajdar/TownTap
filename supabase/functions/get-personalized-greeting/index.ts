// @ts-nocheck - Deno runtime environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { generatePersonalizedGreeting } from '../_shared/aiClient.ts';
import { createResponse, handleOptionsRequest, verifyUserJwt } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const user = await verifyUserJwt(req.headers.get('Authorization'));

    
    const { userName, context } = await req.json();

    
    const greeting = await generatePersonalizedGreeting(userName, {
      timeOfDay: context?.timeOfDay,
      lastVisit: context?.lastVisit,
      previousOrders: context?.previousOrders
    });

    return createResponse({ greeting });
  } catch (error: any) {
    console.error('Error in get-personalized-greeting:', error);
    return createResponse(
      { error: error.message },
      error.status || 500
    );
  }
});
