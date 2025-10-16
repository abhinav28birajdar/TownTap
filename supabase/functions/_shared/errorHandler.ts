/**
 * _shared/errorHandler.ts
 * Standardized error handling utilities for Edge Functions
 */

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  status: number;
}

export class EdgeFunctionError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status = 400, code?: string, details?: any) {
    super(message);
    this.name = 'EdgeFunctionError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function handleError(error: unknown): ErrorResponse {
  console.error('Edge function error:', error);
  
  if (error instanceof EdgeFunctionError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      status: error.status
    };
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      status: 400
    };
  }
  
  // Unknown error type
  return {
    success: false,
    error: 'Unknown error occurred',
    status: 500
  };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function createErrorResponse(error: unknown): Response {
  const errorData = handleError(error);
  
  return new Response(
    JSON.stringify(errorData),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: errorData.status,
    },
  );
}

export function validateRequiredFields(data: any, fields: string[]): void {
  const missingFields = fields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new EdgeFunctionError(
      `Missing required fields: ${missingFields.join(', ')}`, 
      400, 
      'MISSING_FIELDS',
      { fields: missingFields }
    );
  }
}