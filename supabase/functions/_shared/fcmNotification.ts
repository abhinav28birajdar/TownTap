// FILE: supabase/functions/_shared/fcmNotification.ts
// PURPOSE: Contains the logic to send a push notification via FCM HTTP v1 API.
// @ts-nocheck - Deno runtime environment

// Helper function for authenticating with Google services
async function getGoogleAuthToken(serviceAccountJson: string): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  const jwtPayload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    iat: Math.floor(Date.now() / 1000),
  };

  // Create the JWT
  const encodedHeader = btoa(JSON.stringify(jwtHeader)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import the private key
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyData,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const signedJwt = `${unsignedToken}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  
  return tokenData.access_token;
}

/**
 * Sends a push notification to a specific device using its FCM token.
 */
export async function sendFCMNotification(
  fcmToken: string, 
  title: string, 
  body: string, 
  data: { [key: string]: string } = {}
): Promise<boolean> {
  const firebaseConfigJson = Deno.env.get('FIREBASE_ADMIN_CONFIG');
  if (!firebaseConfigJson) {
    console.error('FIREBASE_ADMIN_CONFIG secret is not set.');
    return false;
  }

  try {
    const projectId = JSON.parse(firebaseConfigJson).project_id;
    const accessToken = await getGoogleAuthToken(firebaseConfigJson);
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    
    const message = {
      message: {
        token: fcmToken,
        notification: { 
          title, 
          body 
        },
        data: data, // Custom data payload for navigation
        android: {
          notification: {
            sound: 'default',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            channel_id: 'high_importance_channel'
          }
        },
        apns: { // iOS specific settings
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'content-available': 1,
              category: 'GENERAL'
            }
          }
        }
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('FCM send error:', errorData);
      return false;
    } else {
      console.log('Successfully sent notification to token:', fcmToken);
      return true;
    }
  } catch (error) {
    console.error('Error in sendFCMNotification:', error);
    return false;
  }
}

/**
 * Sends notifications to multiple FCM tokens
 */
export async function sendBulkFCMNotifications(
  tokens: string[], 
  title: string, 
  body: string, 
  data: { [key: string]: string } = {}
): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    tokens.map(token => sendFCMNotification(token, title, body, data))
  );

  const success = results.filter(result => result.status === 'fulfilled' && result.value).length;
  const failed = results.length - success;

  return { success, failed };
}