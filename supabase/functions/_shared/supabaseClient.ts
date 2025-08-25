// FILE: supabase/functions/_shared/supabaseClient.ts
// PURPOSE: Initializes Supabase clients within Edge Functions. Handles service role key for RLS bypass.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET')!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_JWT_SECRET) {
  throw new Error('Missing Supabase Environment Variables for Edge Functions (URL, SERVICE_ROLE_KEY, JWT_SECRET)');
}

// Client for operations requiring elevated permissions (bypassing RLS)
export const supabaseServiceRole = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }, // No session persistence needed server-side
});

// Client for operations performed ON BEHALF of the authenticated user (respects RLS)
export const getSupabaseClientForUserRequest = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) throw new Error('Authorization token missing from request.');

  return createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
  });
};

// Common response helpers for HTTP functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const createResponse = (body: object, status: number = 200, headers: Record<string, string> = {}) => {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...headers },
    status,
  });
};

export const handleOptionsRequest = () => {
  return new Response(null, { headers: corsHeaders, status: 204 });
};
