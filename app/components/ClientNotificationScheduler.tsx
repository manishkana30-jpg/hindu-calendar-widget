"use client";

import { useEffect } from 'react';
import {
  initClientNotificationScheduler,
  autoSyncPushSubscription
} from '@/src/lib/notifications/subscription-manager';

/**
 * ClientNotificationScheduler
 * 
 * Automatically reconciles Web Push subscriptions with the Supabase Server-Sent
 * pipeline on application mount:
 * 1. Checks if Notification.permission === 'granted'.
 * 2. Compares active subscription's applicationServerKey against NEXT_PUBLIC_VAPID_PUBLIC_KEY.
 * 3. Gracefully renews stale or missing subscriptions with current VAPID keys.
 * 4. Synchronizes endpoint, encryption keys, coordinates, and timezone to Supabase PostgreSQL.
 * 5. Safely bypasses push registration on iOS when outside PWA standalone mode.
 */
export function ClientNotificationScheduler() {
  useEffect(() => {
    // 1. Initialize background sync lifecycle
    const cleanupScheduler = initClientNotificationScheduler();

    // 2. Perform silent auto-resubscription and key reconciliation
    autoSyncPushSubscription().catch((err) => {
      console.warn('[Push Sync] Auto-resubscription warning:', err);
    });

    // 3. Sync returning subscriber session to visitor_logs
    if (typeof window !== 'undefined' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      fetch('/api/log-visitor/sync', { method: 'POST' }).catch(() => {});
    }

    return () => {
      cleanupScheduler();
    };
  }, []);

  return null;
}
