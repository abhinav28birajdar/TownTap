// Deno global types for Supabase Edge Functions
declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }
}

export interface Request {
  json(): Promise<any>;
  text(): Promise<string>;
  headers: Headers;
  method: string;
  url: string;
}

export interface Response {
  new (body?: BodyInit | null, init?: ResponseInit): Response;
}

export const serve = (handler: (req: Request) => Promise<Response> | Response) => {
  // This is a stub for TypeScript - actual implementation by Deno
};

export { };

