/**
 * FILE: supabase/functions/_shared/types.ts
 * PURPOSE: Type definitions for Supabase Edge Functions
 * RESPONSIBILITIES: Provide proper TypeScript types for Deno and Edge Function APIs
 */

// This file is now primarily for shared interfaces and constants,
// as global Deno types are handled by the tsconfig.json settings.

// Common CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client types
export interface SupabaseClient {
  from(table: string): any;
}

// Error handling type
export interface EdgeFunctionError extends Error {
  status?: number;
  code?: string;
}

export default {};
