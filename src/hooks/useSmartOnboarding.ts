"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { urlBase64ToUint8Array, isMatchingApplicationServerKey } from '../lib/notifications/subscription-manager';
import { requestGpsLocation, getSavedLocationState } from '../lib/location-service';
import { saveNotificationSettings } from '../lib/notifications/idb-storage';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export interface SmartOnboardingState {
  isReady: boolean;
  isSubscribed: boolean;
  isStandalone: boolean;
  isLoading: boolean;
  showIosTooltip: boolean;
  error: string | null;
  startOnboarding: () => Promise<boolean>;
  dismissIosTooltip: () => void;
}

const DEFAULT_VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';

/**
 * useSmartOnboarding Hook
 * 
 * Manages platform-aware notification onboarding without UI pop-in or disappearing flicker:
 * 1. Initializes with `isReady = false` so UI components never render prematurely.
 * 2. If Notification.permission is 'granted', silently reconciles and verifies active subscription
 *    against Supabase PostgreSQL before confirming `isSubscribed = true`.
 * 3. Detects iOS Safari vs PWA Standalone vs Android/Desktop.
 * 4. Chains GPS Acquisition → Notification Permission → Web Push VAPID Registration → Backend Sync.
 */
export function useSmartOnboarding(): SmartOnboardingState {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showIosTooltip, setShowIosTooltip] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  // 1. Platform Detection Helpers
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

  // 2. Dismiss iOS tooltip helper
  const dismissIosTooltip = useCallback(() => {
    setShowIosTooltip(false);
  }, []);

  // 3. Robust Initial Subscription & Backend Synchronization Check on Mount
  useEffect(() => {
    isMountedRef.current = true;

    // Safety timeout: Ensure UI becomes ready within 3000ms even on slow mobile SW registrations
    const timeoutTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setIsReady(true);
      }
    }, 3000);

    async function checkAndSyncInitialState() {
      if (typeof window === 'undefined') {
        if (isMountedRef.current) setIsReady(true);
        return;
      }

      const standalone = checkIsStandalone();
      if (isMountedRef.current) {
        setIsStandalone(standalone);
      }

      // If browser doesn't support notifications or service workers, finalize as unsubscribed
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (isMountedRef.current) {
          setIsSubscribed(false);
          setIsReady(true);
        }
        return;
      }

      // If permission is not granted, user is definitely unsubscribed
      if (Notification.permission !== 'granted') {
        if (isMountedRef.current) {
          setIsSubscribed(false);
          setIsReady(true);
        }
        return;
      }

      // Permission is 'granted': Verify active push subscription in Service Worker
      try {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();

        // If no subscription exists in pushManager despite permission being granted
        if (!sub) {
          if (isMountedRef.current) {
            setIsSubscribed(false);
            setIsReady(true);
          }
          return;
        }

        // Subscription exists: verify VAPID applicationServerKey matches current key
        const existingKey = sub.options?.applicationServerKey;
        const keyMatches = isMatchingApplicationServerKey(existingKey, DEFAULT_VAPID_PUBLIC_KEY);

        if (!keyMatches) {
          console.info('[Smart Onboarding] Stale VAPID key detected during mount check. Rotating...');
          await sub.unsubscribe().catch(() => {});
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY) as unknown as BufferSource
          }).catch(() => null);

          if (!sub) {
            if (isMountedRef.current) {
              setIsSubscribed(false);
              setIsReady(true);
            }
            return;
          }
        }

        // Extract encryption keys explicitly
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

        // Silent background sync with backend (/api/push/subscribe) to guarantee Supabase presence
        const activeLocation = getSavedLocationState().location;
        const timezone =
          activeLocation.ianaTimezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          'Asia/Kolkata';

        const syncRes = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
          })
        }).catch(() => null);

        if (syncRes && syncRes.ok) {
          await saveNotificationSettings({
            enabled: true,
            permission: 'granted',
            pushSubscribed: true
          });
          if (isMountedRef.current) {
            setIsSubscribed(true);
          }
        } else {
          // If server sync failed, keep as unsubscribed so user can re-trigger
          if (isMountedRef.current) {
            setIsSubscribed(false);
          }
        }
      } catch (checkErr) {
        console.warn('[Smart Onboarding] Mount verification notice:', checkErr);
        if (isMountedRef.current) {
          setIsSubscribed(false);
        }
      } finally {
        if (isMountedRef.current) {
          setIsReady(true);
        }
      }
    }

    checkAndSyncInitialState();

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutTimer);
    };
  }, []);

  // 4. Primary Onboarding Orchestrator (User-Initiated)
  const startOnboarding = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    setError(null);

    const isIOS = checkIsIOS();
    const isStandalone = checkIsStandalone();

    // ── Phase A: iOS Safari Browser Handling ──
    // Apple WebKit requires PWAs to run from the Home Screen (standalone) for Web Push.
    if (isIOS && !isStandalone) {
      setShowIosTooltip(true);
      return false;
    }

    setIsLoading(true);

    try {
      // ── Phase B: Chain Step 1 — Geolocation Acquisition ──
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
            ? 'Notifications are blocked in your browser settings. Please allow notifications to continue.'
            : 'Notification permission was not granted.'
        );
      }

      // ── Phase D: Chain Step 3 — Service Worker & Web Push Registration ──
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push messaging is not supported on this browser.');
      }

      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();

      // Check for stale key rotation
      if (sub) {
        const existingKey = sub.options?.applicationServerKey;
        if (!isMatchingApplicationServerKey(existingKey, DEFAULT_VAPID_PUBLIC_KEY)) {
          console.info('[Smart Onboarding] Rotating stale subscription key...');
          await sub.unsubscribe().catch(() => {});
          sub = null;
        }
      }

      // Create fresh subscription with current VAPID public key
      if (!sub) {
        const appServerKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY) as unknown as BufferSource;
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
    isReady,
    isSubscribed,
    isStandalone,
    isLoading,
    showIosTooltip,
    error,
    startOnboarding,
    dismissIosTooltip
  };
}
