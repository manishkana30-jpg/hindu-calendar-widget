"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  isPushManagerSupported,
  isServiceWorkerSupported,
  urlBase64ToUint8Array
} from '../lib/push/register-sw';
import { LocationCoordinates, PRESET_LOCATIONS } from '../lib/vedic-astronomy';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isLoading: boolean;
  isSendingTest: boolean;
  error: string | null;
  isIOS: boolean;
  isStandalone: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestAlert: () => Promise<boolean>;
}

export function usePushNotifications(customLocation?: LocationCoordinates): PushNotificationState {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  // 1. Safe Environment & Platform Detection on Mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const iosDevice = /iP(hone|od|ad)/.test(ua);
    const nav = window.navigator as NavigatorWithStandalone;
    const standaloneMode = iosDevice && Boolean(nav.standalone);

    setIsIOS(iosDevice);
    setIsStandalone(standaloneMode);

    const supported = isPushManagerSupported();
    setIsSupported(supported);

    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);

    // Passive inspection of existing subscription on mount (NO subscribe calls in useEffect!)
    if (supported && isServiceWorkerSupported()) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((existingSub) => {
          setIsSubscribed(Boolean(existingSub));
        })
        .catch(() => {
          setIsSubscribed(false);
        });
    }
  }, []);

  /**
   * Helper to fetch or read the VAPID Public Key.
   */
  const getVapidPublicKey = useCallback(async (): Promise<string | null> => {
    const envKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (envKey) return envKey;

    try {
      const res = await fetch('/api/push/subscribe', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = (await res.json()) as { publicKey?: string | null };
        return data.publicKey || null;
      }
    } catch (err: unknown) {
      console.warn('Could not fetch VAPID public key from /api/push/subscribe:', err);
    }
    return null;
  }, []);

  /**
   * User-Gesture Enforced Subscription.
   * MUST be invoked directly from an onClick user gesture.
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    setIsLoading(true);
    setError(null);

    try {
      // Step A: Request notification permission
      let perm: NotificationPermission = Notification.permission;
      if (perm === 'default') {
        perm = await Notification.requestPermission();
        setPermission(perm);
      }

      if (perm !== 'granted') {
        setError(
          perm === 'denied'
            ? 'Notifications are blocked at the OS level. Enable them in your device settings.'
            : 'Notification permission was not granted.'
        );
        setIsLoading(false);
        return false;
      }

      // Step B: Ensure Service Worker is registered
      const reg = await registerServiceWorker('/sw.js', '/');
      if (!reg) {
        throw new Error('Service Worker failed to register.');
      }

      // Step C: Retrieve VAPID Public Key
      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        throw new Error('Push Server VAPID Public Key is not configured.');
      }

      // Step D: Create PushSubscription
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const appServerKey = urlBase64ToUint8Array(publicKey) as unknown as BufferSource;
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey
        });
      }

      // Step E: Store in Server KV Store
      const loc = customLocation || PRESET_LOCATIONS[0];
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          location: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            timezone: loc.timezone,
            ianaTimezone: loc.ianaTimezone,
            name: loc.name
          }
        })
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Server registration failed with HTTP ${res.status}`);
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to enable notifications';
      console.error('Subscription error:', err);
      setError(msg);
      setIsLoading(false);
      return false;
    }
  }, [customLocation, getVapidPublicKey]);

  /**
   * Unsubscribes the device and notifies the server.
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    setIsLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();

        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint })
        }).catch(() => {});
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(msg);
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Sends a real end-to-end Test Alert via the server to prove the push round-trip works.
   */
  const sendTestAlert = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    setIsSendingTest(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        // If not subscribed yet, attempt to subscribe first
        const ok = await subscribe();
        if (!ok) {
          throw new Error('Subscription required before sending test notification.');
        }
        sub = await reg.pushManager.getSubscription();
      }

      if (!sub) {
        throw new Error('No active push subscription found on device.');
      }

      const loc = customLocation || PRESET_LOCATIONS[0];
      const res = await fetch('/api/push/daily-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTest: true,
          subscription: sub.toJSON(),
          location: loc
        })
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Server rejected test notification request.');
      }

      setIsSendingTest(false);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Test alert failed';
      console.error('Send test alert error:', err);
      setError(msg);
      setIsSendingTest(false);
      return false;
    }
  }, [customLocation, subscribe]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    isSendingTest,
    error,
    isIOS,
    isStandalone,
    subscribe,
    unsubscribe,
    sendTestAlert
  };
}
