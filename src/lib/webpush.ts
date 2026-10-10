/**
 * Server-Side Web Push & VAPID Configuration Manager
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 *
 * Implements strict, environment-driven Web Push (RFC 8292 / VAPID) orchestration.
 * Enforces zero 'any' strict TypeScript types and safe key validation.
 */

import webpush from 'web-push';

export interface VapidCredentials {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export interface WebPushSendResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  isExpiredEndpoint?: boolean;
}

const DEFAULT_SUBJECT = 'mailto:contact@dailytithi.com';

function tryLoadEnvLocal(): void {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Non-filesystem or sandboxed environments
  }
}

/**
 * Validates and retrieves the active server-side VAPID credentials.
 * Supports both standard NEXT_PUBLIC_VAPID_PUBLIC_KEY and fallback VAPID_PUBLIC_KEY.
 */
export function getVapidCredentials(): VapidCredentials | null {
  tryLoadEnvLocal();
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || DEFAULT_SUBJECT;

  if (!publicKey || !privateKey) {
    return null;
  }

  const cleanPublic = publicKey.trim();
  const cleanPrivate = privateKey.trim();

  // Basic sanity check for base64url keys
  if (cleanPublic.length < 32 || cleanPrivate.length < 16) {
    console.error('[WebPush] VAPID credentials fail minimum length sanity checks.');
    return null;
  }

  return {
    publicKey: cleanPublic,
    privateKey: cleanPrivate,
    subject: subject.trim(),
  };
}

/**
 * Returns a fully configured web-push instance ready to dispatch notifications,
 * or null if server-side environment variables are missing or invalid.
 */
export function getWebPushInstance(): typeof webpush | null {
  const creds = getVapidCredentials();

  if (!creds) {
    return null;
  }

  try {
    webpush.setVapidDetails(creds.subject, creds.publicKey, creds.privateKey);
    return webpush;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[WebPush] Failed to initialize web-push VAPID details:', errorMsg);
    return null;
  }
}

/**
 * Returns true if the server is fully configured to sign and dispatch Web Push notifications.
 */
export function isVapidConfigured(): boolean {
  return getWebPushInstance() !== null;
}

/**
 * Returns the public VAPID applicationServerKey string to expose to browser clients for pushManager.subscribe().
 */
export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || null;
}

export interface VapidValidationResult {
  valid: boolean;
  statusCode: number;
  error?: string;
  credentials?: VapidCredentials;
}

/**
 * Validates active VAPID setup and returns structured status (HTTP 200 vs 500).
 */
export function validateVapidSetup(): VapidValidationResult {
  const creds = getVapidCredentials();
  if (!creds) {
    return {
      valid: false,
      statusCode: 500,
      error: 'VAPID credentials unconfigured on server. Please configure NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY, or run "npm run generate-vapid".'
    };
  }
  return {
    valid: true,
    statusCode: 200,
    credentials: creds
  };
}

/**
 * Dispatches a push notification to a target subscription with standardized error handling
 * and automatic classification of expired endpoints (HTTP 404 or 410 Gone).
 */
export async function sendWebPushNotification(
  subscription: webpush.PushSubscription,
  payload: string,
  options?: webpush.RequestOptions
): Promise<WebPushSendResult> {
  const wp = getWebPushInstance();
  if (!wp) {
    return {
      success: false,
      statusCode: 500,
      error: 'VAPID credentials unconfigured on server. Please run "npm run generate-vapid" or configure environment variables.',
    };
  }

  try {
    const response = await wp.sendNotification(subscription, payload, options);
    return {
      success: true,
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    interface WebPushHttpError {
      statusCode?: number;
      message?: string;
      body?: string;
    }

    const pushErr = err as WebPushHttpError;
    const statusCode = pushErr.statusCode;
    const isExpired = statusCode === 404 || statusCode === 410;
    const errorMsg = pushErr.message || 'Web Push dispatch failed';

    return {
      success: false,
      statusCode,
      error: errorMsg,
      isExpiredEndpoint: isExpired,
    };
  }
}

export default webpush;
