/**
 * Secure VAPID Configuration Manager
 * 
 * Enforces strict environment variable usage:
 * - In production: NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are strictly mandatory.
 * - In development/testing: Provides sandboxed keys with security warnings.
 */

import webpush, {
  getVapidCredentials as getCentralVapidCredentials,
  getWebPushInstance,
  isVapidConfigured,
  VapidCredentials
} from '@/src/lib/webpush';

export type { VapidCredentials };

// Development fallback keys used only in local development when unconfigured
const DEV_FALLBACK_PUBLIC = 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
const DEV_FALLBACK_PRIVATE = 'skKieBAhF18DZxm85wT2ZNBrZZVhdK8-84mh3syKYfM';
const DEFAULT_SUBJECT = 'mailto:contact@dailytithi.com';

export function getVapidCredentials(): VapidCredentials | null {
  const central = getCentralVapidCredentials();
  if (central) return central;

  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL SECURITY ERROR: VAPID_PRIVATE_KEY or NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable is missing in production.');
    return null;
  }

  // Development only fallback
  return {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEV_FALLBACK_PUBLIC,
    privateKey: process.env.VAPID_PRIVATE_KEY || DEV_FALLBACK_PRIVATE,
    subject: process.env.VAPID_SUBJECT || DEFAULT_SUBJECT,
  };
}

export function configureWebPush(): boolean {
  const instance = getWebPushInstance();
  if (instance) return true;

  const creds = getVapidCredentials();
  if (!creds) return false;

  try {
    webpush.setVapidDetails(creds.subject, creds.publicKey, creds.privateKey);
    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to configure webpush VAPID details:', errorMsg);
    return false;
  }
}

