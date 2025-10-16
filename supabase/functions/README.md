# Supabase Edge Functions Documentation

This directory contains Edge Functions for the TownTap application.

## What Are Edge Functions?

Supabase Edge Functions are server-side TypeScript functions that run on Deno at the edge, close to your users. They provide a way to run secure server-side code without managing infrastructure.

## Functions Overview

### 1. `stripe-webhook`

Handles all Stripe webhooks for payment processing, subscription management, and related notifications.

**Endpoints:**
- `POST /` - Processes Stripe webhook events

**Environment Variables Required:**
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SIGNING_SECRET` - Secret for validating Stripe webhook signatures
- `SUPABASE_URL` - URL of your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for Supabase admin operations

### 2. `user-events`

Tracks and processes user events and activities within the application.

**Endpoints:**
- `POST /` - Records user events and performs related actions

**Environment Variables Required:**
- `SUPABASE_URL` - URL of your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for Supabase admin operations

### 3. `notifications`

Manages sending push notifications to users.

**Endpoints:**
- `POST /send` - Send notification to a single user
- `POST /bulk-send` - Send notifications to multiple users

**Environment Variables Required:**
- `SUPABASE_URL` - URL of your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for Supabase admin operations
- `FCM_SERVER_KEY` - Firebase Cloud Messaging server key

## Local Development

1. Install Supabase CLI if not already installed:
   ```
   npm install -g supabase
   ```

2. Link your project (if not already linked):
   ```
   supabase link --project-ref <your-project-ref>
   ```

3. Start the Functions development server:
   ```
   supabase functions serve
   ```

4. Test functions locally:
   ```
   curl -i --location --request POST 'http://localhost:54321/functions/v1/user-events' \
   --header 'Authorization: Bearer <JWT>' \
   --header 'Content-Type: application/json' \
   --data-raw '{"type":"app_opened","userId":"user123","data":{}}'
   ```

## Deployment

Deploy all functions:

```
supabase functions deploy
```

Deploy a specific function:

```
supabase functions deploy stripe-webhook
supabase functions deploy user-events
supabase functions deploy notifications
```

## Secrets Management

Set secrets for your functions:

```
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
supabase secrets set FCM_SERVER_KEY=AAAA...
```

## TypeScript Types

The `types` directory contains TypeScript type definitions for the Deno environment and URL imports used in Edge Functions.