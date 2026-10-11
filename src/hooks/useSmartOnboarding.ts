"use client";

import { useState, useEffect, useCallback } from 'react';
import { urlBase64ToUint8Array, isMatchingApplicationServerKey } from '../lib/notifications/subscription-manager';
import { requestGpsLocation, getSavedLocationState } from '../lib/location-service';
import { saveNotificationSettings } from '../lib/notifications/idb-storage';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export interface SmartOnboardingState {
  isSubscribed: boolean;
  isLoading: boolean;
  showIosTooltip: boolean;
  error: string | null;
  startOnboarding: () => Promise<boolean>;
  dismissIosTooltip: () => void;
}

/**
 * useSmartOnboarding Hook
 * 
 * Replaces fragmented notification onboarding with an intelligent, platform-aware flow:
 * 1. Accurately detects iOS Safari vs PWA Standalone vs Android/Desktop.
 * 2. If iOS in normal browser: triggers an "Add to Home Screen" tooltip (does NOT attempt Web Push).
 * 3. Otherwise: Chains GPS Acquisition → Notification Permission → Web Push VAPID Registration → Backend Sync.
 * 4. Automatically detects active subscriptions and hides the prompt once subscribed.
 */
export function useSmartOnboarding(): SmartOnboardingState {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showIosTooltip, setShowIosTooltip] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Check existing subscription status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready
        .then(async (reg) => {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setIsSubscribed(true);
          }
        })
        .catch(() => {
          setIsSubscribed(false);
        });
    }
  }, []);

  // 2. Dismiss iOS tooltip helper
  const dismissIosTooltip = useCallback(() => {
    setShowIosTooltip(false);
  }, []);

  // 3. Platform Detection Helpers
  const checkIsIOS = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
    const isIPadOS = Boolean(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isIOSDevice || isIPadOS;
  }, []);

  const checkIsStandalone = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    const nav = window.navigator as NavigatorWithStandalone;
    const isStandaloneNav = Boolean(nav.standalone);
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    return isStandaloneNav || isStandaloneMedia;
  }, []);

  // 4. Primary Onboarding Orchestrator
  const startOnboarding = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    setError(null);

    const isIOS = checkIsIOS();
    const isStandalone = checkIsStandalone();

    // ── Phase A: iOS Safari Browser Handling ──
    // Apple WebKit (iOS 16.4+) requires PWAs to run from the Home Screen (standalone) for Web Push.
    if (isIOS && !isStandalone) {
      setShowIosTooltip(true);
      return false;
    }

    setIsLoading(true);

    try {
      // ── Phase B: Chain Step 1 — Geolocation Acquisition ──
      // Request accurate GPS coordinates with graceful fallback to saved/dropdown city
      let activeLocation = getSavedLocationState().location;
      try {
        const gpsRes = await requestGpsLocation();
        if (gpsRes.success && gpsRes.location) {
          activeLocation = gpsRes.location;
        }
      } catch (locErr) {
        console.info('[Smart Onboarding] Geolocation fallback used:', locErr);
      }

      // ── Phase C: Chain Step 2 — Notification Permission ──
      if (!('Notification' in window)) {
        throw new Error('Notifications are not supported in this browser.');
      }

      let perm: NotificationPermission = Notification.permission;
      if (perm === 'default') {
        perm = await Notification.requestPermission();
      }

      if (perm !== 'granted') {
        throw new Error(
          perm === 'denied'
            ? 'Notifications are blocked. Please enable them in your device settings.'
            : 'Notification permission was not granted.'
        );
      }

      // ── Phase D: Chain Step 3 — Service Worker & Web Push Registration ──
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push messaging is not supported on this browser.');
      }

      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';

      let sub = await reg.pushManager.getSubscription();

      // Check for stale key rotation
      if (sub) {
        const existingKey = sub.options?.applicationServerKey;
        if (!isMatchingApplicationServerKey(existingKey, vapidPublicKey)) {
          console.info('[Smart Onboarding] Rotating stale subscription key...');
          await sub.unsubscribe().catch(() => {});
          sub = null;
        }
      }

      // Create fresh subscription with current VAPID public key
      if (!sub) {
        const appServerKey = urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource;
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey
        });
      }

      // Extract explicit encryption keys
      let p256dh = '';
      let auth = '';
      try {
        const rawKey = sub.getKey('p256dh');
        const rawAuth = sub.getKey('auth');
        p256dh = rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : '';
        auth = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : '';
      } catch {
        const json = sub.toJSON();
        p256dh = json.keys?.p256dh || '';
        auth = json.keys?.auth || '';
      }

      // ── Phase E: Chain Step 4 — Synchronize with Backend (/api/push/subscribe) ──
      const timezone =
        activeLocation.ianaTimezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'Asia/Kolkata';

      const payload = {
        endpoint: sub.endpoint,
        subscription: {
          endpoint: sub.endpoint,
          keys: { p256dh, auth }
        },
        keys: { p256dh, auth },
        timezone,
        location: {
          latitude: activeLocation.latitude,
          longitude: activeLocation.longitude,
          name: activeLocation.name,
          timezone: activeLocation.timezone,
          ianaTimezone: activeLocation.ianaTimezone
        },
        preferences: {
          dailyNotification: true,
          notificationTime: 'sunrise',
          alertOnTithiChange: true,
          autoUpdate: true,
          sound: true,
          vibration: true
        },
        isActive: true,
        is_active: true
      };

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Server registration returned HTTP ${res.status}`);
      }

      // ── Phase F: Persist Local Settings & Complete ──
      await saveNotificationSettings({
        enabled: true,
        permission: 'granted',
        pushSubscribed: true
      });

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to enable notifications';
      console.error('[Smart Onboarding Error]', err);
      setError(msg);
      setIsLoading(false);
      return false;
    }
  }, [checkIsIOS, checkIsStandalone]);

  return {
    isSubscribed,
    isLoading,
    showIosTooltip,
    error,
    startOnboarding,
    dismissIosTooltip
  };
}
