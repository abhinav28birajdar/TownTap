// FILE: supabase/functions/_shared/supabaseClient.ts
// PURPOSE: Initializes Supabase clients within Edge Functions. Handles service role key for RLS bypass.
// @ts-nocheck - Deno runtime environment

// @deno-types="npm:@types/node"
import { verify } from 'https://deno.land/x/djwt@v2.9.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET')!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_JWT_SECRET) {
  throw new Error('Missing Supabase Environment Variables for Edge Functions (URL, SERVICE_ROLE_KEY, JWT_SECRET)');
}


export const supabaseServiceRole = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }, 
});

export const supabaseAdmin = supabaseServiceRole;


export const getSupabaseClientForUserRequest = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) throw new Error('Authorization token missing from request.');

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!anonKey) throw new Error('SUPABASE_ANON_KEY environment variable is missing');

  return createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
  });
};

// JWT verification helper
export const verifyUserJwt = async (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(SUPABASE_JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const payload = await verify(token, cryptoKey);
    return payload;
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
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
