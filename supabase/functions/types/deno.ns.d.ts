/**
 * Type definitions for Deno standard modules
 */

declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  const env: Env;
  
  function exit(code?: number): never;

  interface CreateHttpClientOptions {
    fetch?: typeof fetch;
  }
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export interface SupabaseClient {
    from(table: string): any;
    auth: {
      getUser(token?: string): Promise<{ data: { user: any | null }, error: any | null }>;
      signInWithPassword(credentials: { email: string; password: string }): Promise<any>;
      signInWithOtp(credentials: { phone: string }): Promise<any>;
      signUp(credentials: { email: string; password: string; options?: { data?: any } }): Promise<any>;
      signOut(): Promise<{ error: any | null }>;
      getSession(): Promise<{ data: { session: any | null }, error: any | null }>;
      resetPasswordForEmail(email: string): Promise<{ error: any | null }>;
      verifyOtp(params: { phone: string; token: string; type: string }): Promise<any>;
      onAuthStateChange(callback: (event: string, session: any | null) => void): { data: { subscription: any } };
    };
    storage: any;
    rpc(functionName: string, params?: any): any;
    channel(name: string): {
      on(event: string, config: any, callback: (payload: any) => void): any;
      subscribe(): { unsubscribe: () => void };
    };
  }

  export function createClient(supabaseUrl: string, supabaseKey: string, options?: any): SupabaseClient;
}

declare module "https://deno.land/std@0.168.0/crypto/hmac.ts" {
  export function createHmac(algorithm: string, key: string | Uint8Array): {
    update(data: string | Uint8Array): {
      digest(encoding: string): string;
    };
  };
}

// Declare global types needed for the Deno environment
declare global {
  interface Window {
    btoa(data: string): string;
    atob(data: string): string;
  }

  function btoa(data: string): string;
  function atob(data: string): string;

  namespace Deno {
    interface Env {
      get(key: string): string | undefined;
      set(key: string, value: string): void;
      toObject(): { [key: string]: string };
    }
    
    const env: Env;
    
    function exit(code?: number): never;
  }
}

export {};