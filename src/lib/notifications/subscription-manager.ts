/**
 * Client-Side Notification & Background Sync Subscription Manager
 * 
 * Handles:
 * 1. Graceful permission request and in-app toggle state persistence.
 * 2. Service Worker registration & Periodic Background Sync setup (every 15–30 min).
 * 3. Web Push subscription fallback (for iOS Safari, Firefox, and closed-browser triggers).
 * 4. Local Panchang cache seeding for zero-network battery efficiency.
 * 5. Tab-active polling fallback (15 min interval + visibilitychange recovery).
 */

import {
  getNotificationSettings,
  saveNotificationSettings,
  saveDailyPanchangCache,
  DailyPanchangCache,
  NotificationSettings
} from './idb-storage';
import { getSavedLocationState } from '../location-service';
import { LocationCoordinates } from '../vedic-astronomy';


export interface NotificationCapabilities {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  serviceWorkerSupported: boolean;
  periodicSyncSupported: boolean;
  pushSupported: boolean;
  isEnabled: boolean;
}

/**
 * Converts a base64 string to a Uint8Array for VAPID applicationServerKey.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Detects whether the current client device is running Apple iOS / iPadOS.
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOSPlatform = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = Boolean(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isIOSPlatform || isIPadOS;
}

/**
 * Detects whether the PWA is installed and running in standalone display mode.
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isStandaloneNav = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return isStandaloneMedia || isStandaloneNav;
}

/**
 * Compares an existing PushSubscription's applicationServerKey against the target VAPID public key.
 * In the Push API, applicationServerKey is returned as an ArrayBuffer.
 */
export function isMatchingApplicationServerKey(
  existingKeyBuffer: ArrayBuffer | null | undefined,
  targetKeyBase64: string
): boolean {
  if (!existingKeyBuffer || !targetKeyBase64) return false;
  try {
    const targetKeyBytes = urlBase64ToUint8Array(targetKeyBase64);
    const existingBytes = new Uint8Array(existingKeyBuffer);

    if (existingBytes.length !== targetKeyBytes.length) {
      return false;
    }

    for (let i = 0; i < existingBytes.length; i++) {
      if (existingBytes[i] !== targetKeyBytes[i]) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks all browser and OS notification capabilities.
 */
export async function checkNotificationCapabilities(): Promise<NotificationCapabilities> {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      permission: 'unsupported',
      serviceWorkerSupported: false,
      periodicSyncSupported: false,
      pushSupported: false,
      isEnabled: false
    };
  }

  const supported = 'Notification' in window;
  const permission = supported ? Notification.permission : 'unsupported';
  const serviceWorkerSupported = 'serviceWorker' in navigator;
  const pushSupported = serviceWorkerSupported && 'PushManager' in window;
  const periodicSyncSupported = serviceWorkerSupported && 'periodicSync' in ServiceWorkerRegistration.prototype;

  const settings = await getNotificationSettings();

  return {
    supported,
    permission,
    serviceWorkerSupported,
    periodicSyncSupported,
    pushSupported,
    isEnabled: settings.enabled && permission === 'granted'
  };
}

/**
 * Registers the Service Worker if not already active.
 */
export async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.warn('Service Worker registration error:', err);
    return null;
  }
}

/**
 * Gracefully requests notification permission and activates:
 * - Periodic Background Sync (15–30 min intervals on Chromium)
 * - Web Push subscription with /api/push/subscribe (fallback for iOS Safari & remote cron)
 */
export async function enableNotificationAlerts(): Promise<{
  success: boolean;
  permission: NotificationPermission;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      success: false,
      permission: 'denied',
      error: 'NOT_SUPPORTED'
    };
  }

  // 1. Request permission with browser prompt
  let perm = Notification.permission;
  if (perm === 'default') {
    try {
      perm = await Notification.requestPermission();
    } catch (reqErr) {
      console.error('Notification.requestPermission failed:', reqErr);
      return { success: false, permission: 'denied', error: 'REQUEST_FAILED' };
    }
  }

  if (perm !== 'granted') {
    await saveNotificationSettings({ enabled: false, permission: perm });
    return { success: false, permission: perm, error: 'PERMISSION_DENIED' };
  }

  // 2. Ensure Service Worker is registered
  const reg = await getOrRegisterServiceWorker();
  let periodicSyncRegistered = false;
  let pushSubscribed = false;

  if (reg) {
    // 3. Register Periodic Background Sync (minInterval: 15 minutes)
    if ('periodicSync' in reg) {
      try {
        const periodicSync = (reg as unknown as { periodicSync: { register: (tag: string, options: { minInterval: number }) => Promise<void> } }).periodicSync;
        await periodicSync.register('panchang-periodic-check', {
          minInterval: 15 * 60 * 1000 // 15 minutes
        });
        periodicSyncRegistered = true;
      } catch (syncErr) {
        console.info('Periodic background sync registration note (requires PWA install or permission on some platforms):', syncErr);
      }
    }

    // 4. Register Web Push Subscription (for iOS Safari fallback or background push)
    if ('pushManager' in reg) {
      try {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
        let sub = await reg.pushManager.getSubscription();

        if (sub) {
          const existingKey = sub.options?.applicationServerKey;
          if (!isMatchingApplicationServerKey(existingKey, vapidPublicKey)) {
            console.info('[Push Setup] Stale VAPID key detected. Replacing subscription...');
            await sub.unsubscribe().catch(() => {});
            sub = null;
          }
        }

        if (!sub && vapidPublicKey) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
          });
        }

        if (sub) {
          pushSubscribed = true;
          // Send to server to register with location and preferences
          const currentLoc = getSavedLocationState().location;
          const currentSettings = await getNotificationSettings();
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: sub,
              location: currentLoc,
              preferences: {
                dailyNotification: currentSettings.dailyNotification !== false,
                notificationTime: currentSettings.notificationTime || 'sunrise',
                alertOnTithiChange: Boolean(currentSettings.alertOnTithiChange),
                autoUpdate: currentSettings.autoUpdate !== false,
                wifiOnly: Boolean(currentSettings.wifiOnly),
                sound: currentSettings.sound !== false,
                vibration: currentSettings.vibration !== false
              },
              isActive: true,
              sendWelcomeTest: true
            })
          }).catch(() => {});
        }
      } catch (pushErr) {
        console.info('Push subscription setup note:', pushErr);
      }
    }

    // Notify active worker of enabled settings
    if (reg.active) {
      reg.active.postMessage({
        type: 'SET_SETTINGS',
        settings: { enabled: true }
      });
    }
  }


  // 5. Persist enabled state in IndexedDB and localStorage
  await saveNotificationSettings({
    enabled: true,
    permission: 'granted',
    periodicSyncRegistered,
    pushSubscribed
  });

  return { success: true, permission: 'granted' };
}

/**
 * Disables background notification alerts and cleans up subscriptions.
 */
export async function disableNotificationAlerts(): Promise<void> {
  await saveNotificationSettings({ enabled: false });

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;

    // Unregister periodic sync if present
    if (reg && 'periodicSync' in reg) {
      try {
        const periodicSync = (reg as unknown as { periodicSync: { unregister: (tag: string) => Promise<void> } }).periodicSync;
        await periodicSync.unregister('panchang-periodic-check');
      } catch {
        // Ignore unregister errors
      }
    }

    // Unsubscribe push
    if (reg && 'pushManager' in reg) {
      try {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const endpoint = sub.endpoint;
          // Mark subscription inactive on backend Supabase table
          await fetch('/api/push/subscribe', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint, isActive: false, is_active: false })
          }).catch(() => {});

          await sub.unsubscribe().catch(() => {});
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint })
          }).catch(() => {});
        }
      } catch {
        // Ignore unsubscribe errors
      }
    }

    // Inform service worker
    if (reg?.active) {
      reg.active.postMessage({
        type: 'SET_SETTINGS',
        settings: { enabled: false }
      });
    }
  } catch (err) {
    console.warn('Error during notification disable:', err);
  }
}

/**
 * Seeds the Service Worker and IndexedDB with today's already calculated panchang data.
 * This guarantees the Service Worker never needs to make a network request when checking state!
 */
export async function seedServiceWorkerCacheFromClient(cacheData: DailyPanchangCache): Promise<void> {
  try {
    await saveDailyPanchangCache(cacheData);

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg?.active) {
        reg.active.postMessage({
          type: 'SEED_CACHE',
          cache: cacheData
        });
      }
    }
  } catch (e) {
    console.warn('Cache seeding note:', e);
  }
}

/**
 * Fires an immediate test notification using the Server-Sent Web Push pipeline.
 * Notifications are strictly received and displayed by the Service Worker push event listener.
 */
export async function triggerImmediateNotificationTest(): Promise<{
  success: boolean;
  message: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, message: 'Notifications are not supported in this browser.' };
  }

  if (Notification.permission !== 'granted') {
    const res = await enableNotificationAlerts();
    if (!res.success) {
      return { success: false, message: 'Notification permission was denied. Please allow notifications in browser settings.' };
    }
  }

  try {
    const reg = await navigator.serviceWorker.ready;

    if (reg?.pushManager) {
      let sub = await reg.pushManager.getSubscription();

      // If no subscription yet, create one
      if (!sub) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
        if (vapidPublicKey) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
          }).catch(() => null);
        }
      }

      if (sub) {
        let pushRes = await fetch('/api/push/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub })
        });
        if (!pushRes.ok && pushRes.status === 404) {
          pushRes = await fetch('/api/push/daily-trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub, isTest: true })
          });
        }
        if (pushRes.ok) {
          return { success: true, message: 'Daily floating lock-screen alert dispatched via Web Push! 🔔' };
        }

        const errData = (await pushRes.json().catch(() => ({}))) as { error?: string; message?: string };
        return {
          success: false,
          message: errData.message || errData.error || `Server returned HTTP ${pushRes.status}`
        };
      }
    }

    return {
      success: false,
      message: 'No active push subscription found on device. Please enable notifications first.'
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: `Failed to trigger notification: ${msg}` };
  }
}

/**
 * Automatically reconciles and re-subscribes Web Push subscriptions on app launch.
 * If notification permission is granted:
 * - Checks if an active PushSubscription exists.
 * - Compares the applicationServerKey against NEXT_PUBLIC_VAPID_PUBLIC_KEY.
 * - If missing or mismatched from a previous VAPID rotation, unsubscribes and creates a fresh subscription.
 * - Immediately POSTs the fresh subscription payload (endpoint, p256dh, auth, coordinates, and timezone) to /api/push/subscribe.
 * - Gracefully handles iOS: Only attempts push subscription if running in standalone mode (display-mode: standalone / navigator.standalone).
 */
export async function autoSyncPushSubscription(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;

  // 1. Silent check: only proceed if permission is already granted
  if (Notification.permission !== 'granted') {
    return false;
  }

  // 2. iOS graceful handling: Web Push is exclusively supported in standalone mode (Add to Home Screen)
  if (isIOS() && !isStandaloneMode()) {
    console.info('[Push Sync] iOS Web Push requires standalone mode (Add to Home Screen). Skipping auto-resubscription.');
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg || !('pushManager' in reg)) return false;

    let vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
    if (!vapidPublicKey) {
      try {
        const res = await fetch('/api/push/subscribe');
        if (res.ok) {
          const data = await res.json();
          if (data.publicKey) vapidPublicKey = data.publicKey;
        }
      } catch {}
    }

    if (!vapidPublicKey) {
      console.warn('[Push Sync] VAPID public key unavailable.');
      return false;
    }

    let sub = await reg.pushManager.getSubscription();
    let needsFreshSubscribe = !sub;

    if (sub) {
      const existingKeyBuffer = sub.options?.applicationServerKey;
      if (!isMatchingApplicationServerKey(existingKeyBuffer, vapidPublicKey)) {
        console.info('[Push Sync] Stale or mismatched VAPID key detected. Unsubscribing old subscription...');
        await sub.unsubscribe().catch(() => {});
        sub = null;
        needsFreshSubscribe = true;
      }
    }

    if (!sub && needsFreshSubscribe) {
      console.info('[Push Sync] Creating fresh Web Push subscription with active VAPID key...');
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
      });
    }

    if (sub) {
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

      const locState = getSavedLocationState().location;
      const currentSettings = await getNotificationSettings();
      const timezone = locState?.ianaTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

      const syncPayload = {
        endpoint: sub.endpoint,
        subscription: {
          endpoint: sub.endpoint,
          keys: { p256dh, auth }
        },
        keys: { p256dh, auth },
        timezone,
        location: locState ? {
          latitude: locState.latitude,
          longitude: locState.longitude,
          name: locState.name,
          timezone: locState.timezone,
          ianaTimezone: locState.ianaTimezone
        } : undefined,
        preferences: {
          dailyNotification: currentSettings.dailyNotification !== false,
          notificationTime: currentSettings.notificationTime || 'sunrise',
          alertOnTithiChange: Boolean(currentSettings.alertOnTithiChange),
          autoUpdate: currentSettings.autoUpdate !== false,
          wifiOnly: Boolean(currentSettings.wifiOnly),
          sound: currentSettings.sound !== false,
          vibration: currentSettings.vibration !== false
        },
        isActive: true,
        is_active: true
      };

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncPayload)
      });

      if (res.ok) {
        await saveNotificationSettings({
          enabled: true,
          permission: 'granted',
          pushSubscribed: true
        });
        console.info('[Push Sync] Successfully synchronized active subscription with Supabase.');
        return true;
      } else {
        console.warn('[Push Sync] /api/push/subscribe returned status', res.status);
        return false;
      }
    }

    return false;
  } catch (err: unknown) {
    console.warn('[Push Sync] Auto-sync exception:', err);
    return false;
  }
}

/**
 * Initializes client-side service worker registration and push subscription synchronization.
 * Note: Unprompted local notification popups have been removed so only the new floating push scheme is active.
 */
export function initClientNotificationScheduler(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Register Service Worker and sync push registration if permission already granted
  getOrRegisterServiceWorker().then(async (reg) => {
    if (reg && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      await autoSyncPushSubscription().catch((err) => {
        console.warn('[Push Sync] Auto-sync failed in scheduler:', err);
      });
    }
  }).catch(() => {});

  // Automatic local polling popups have been removed in favor of the new
  // all-in-one floating lock-screen push notification scheme.
  return () => {};
}

/**
 * Synchronizes updated notification preferences and location coordinates to the server push subscription.
 */
export async function syncPreferencesToBackend(
  preferences?: Partial<NotificationSettings>,
  location?: LocationCoordinates,
  isActive?: boolean
): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg?.pushManager) return false;

    const sub = await reg.pushManager.getSubscription();
    if (!sub) return false;

    const locState = location || getSavedLocationState().location;
    const currentSettings = await getNotificationSettings();

    const mergedPreferences = {
      dailyNotification: preferences?.dailyNotification !== undefined ? preferences.dailyNotification : currentSettings.dailyNotification !== false,
      notificationTime: preferences?.notificationTime || currentSettings.notificationTime || 'sunrise',
      alertOnTithiChange: preferences?.alertOnTithiChange !== undefined ? preferences.alertOnTithiChange : Boolean(currentSettings.alertOnTithiChange),
      autoUpdate: preferences?.autoUpdate !== undefined ? preferences.autoUpdate : currentSettings.autoUpdate !== false,
      wifiOnly: preferences?.wifiOnly !== undefined ? preferences.wifiOnly : Boolean(currentSettings.wifiOnly),
      sound: preferences?.sound !== undefined ? preferences.sound : (currentSettings.sound !== false),
      vibration: preferences?.vibration !== undefined ? preferences.vibration : (currentSettings.vibration !== false),
      quietHoursEnabled: preferences?.quietHoursEnabled !== undefined ? preferences.quietHoursEnabled : Boolean(currentSettings.quietHoursEnabled),
      quietHoursStart: preferences?.quietHoursStart || currentSettings.quietHoursStart || '22:00',
      quietHoursEnd: preferences?.quietHoursEnd || currentSettings.quietHoursEnd || '06:00'
    };

    const activeStatus = isActive !== undefined ? isActive : (currentSettings.enabled !== false);

    // Try PATCH first for fast preferences update in Supabase
    let res = await fetch('/api/push/subscribe', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        subscription: sub,
        location: locState,
        preferences: mergedPreferences,
        isActive: activeStatus,
        is_active: activeStatus
      })
    });

    // Fall back to POST if PATCH returns 404 or 405
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub,
          location: locState,
          preferences: mergedPreferences,
          isActive: activeStatus,
          sendWelcomeTest: false
        })
      });
    }

    return res.ok;
  } catch (err) {
    console.warn('Sync preferences error:', err);
    return false;
  }
}

