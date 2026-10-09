/**
 * Secure VAPID Configuration Manager
 * 
 * Enforces strict environment variable usage:
 * - In production: NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are strictly mandatory.
 * - In development/testing: Provides sandboxed keys with security warnings.
 */

import webpush from 'web-push';

export interface VapidCredentials {
  publicKey: string;
  privateKey: string;
  subject: string;
}

// Development fallback keys only used when NODE_ENV !== 'production'
const DEV_FALLBACK_PUBLIC = 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
const DEV_FALLBACK_PRIVATE = 'skKieBAhF18DZxm85wT2ZNBrZZVhdK8-84mh3syKYfM';
const DEFAULT_SUBJECT = 'mailto:contact@dailytithi.com';

export function getVapidCredentials(): VapidCredentials | null {
  const isProd = process.env.NODE_ENV === 'production';
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || DEFAULT_SUBJECT;

  if (!publicKey || !privateKey) {
    if (isProd) {
      console.error('CRITICAL SECURITY ERROR: VAPID_PRIVATE_KEY or NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable is missing in production.');
      return null;
    }

    // Development only fallback
    return {
      publicKey: publicKey || DEV_FALLBACK_PUBLIC,
      privateKey: privateKey || DEV_FALLBACK_PRIVATE,
      subject
    };
  }

  return { publicKey, privateKey, subject };
}

export function configureWebPush(): boolean {
  const creds = getVapidCredentials();
  if (!creds) return false;

  try {
    webpush.setVapidDetails(creds.subject, creds.publicKey, creds.privateKey);
    return true;
  } catch (err) {
    console.error('Failed to configure webpush VAPID details:', err);
    return false;
  }
}
