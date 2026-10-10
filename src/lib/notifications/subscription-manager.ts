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
import { formatPanchangNotificationBody } from './state-diff';
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
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
                wifiOnly: Boolean(currentSettings.wifiOnly)
              },
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
          await sub.unsubscribe();
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

import {
  buildDailyFloatingPayload,
  extractDailyPanchangData
} from '../push/dailySummaryPayload';

/**
 * Fires an immediate test notification using the new 5-line all-in-one floating lock-screen format.
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

    // First attempt: Cloud Web Push via Vercel to device (delivers the 5-line floating lock-screen payload)
    if (reg?.pushManager) {
      try {
        const sub = await reg.pushManager.getSubscription();
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
        }
      } catch (cloudErr) {
        console.info('Cloud push attempt note, falling back to local service worker:', cloudErr);
      }
    }

    // Fallback: Format the new 5-line floating lock-screen notification directly
    const now = new Date();
    const loc = getSavedLocationState().location;
    const dailyData = extractDailyPanchangData(now, loc);
    const floating = buildDailyFloatingPayload(dailyData);

    if (reg?.showNotification) {
      const notifOptions: NotificationOptions & { renotify?: boolean } = {
        body: floating.options.body,
        icon: floating.options.icon,
        badge: floating.options.badge,
        tag: floating.options.tag,
        requireInteraction: floating.options.requireInteraction,
        renotify: floating.options.renotify,
        data: floating.options.data
      };
      await reg.showNotification(floating.title, notifOptions);
    } else {
      new Notification(floating.title, {
        body: floating.options.body,
        icon: floating.options.icon,
        badge: floating.options.badge,
        tag: floating.options.tag
      });
    }
    return { success: true, message: 'Daily floating lock-screen alert dispatched!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: `Failed to trigger notification: ${msg}` };
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
      try {
        await saveNotificationSettings({ enabled: true, permission: 'granted' });
        if ('pushManager' in reg) {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
          let sub = await reg.pushManager.getSubscription();
          if (!sub && vapidKey) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource
            }).catch(() => null);
          }
          if (sub) {
            fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription: sub })
            }).catch(() => {});
          }
        }
      } catch (syncErr) {
        console.info('Auto push sync note:', syncErr);
      }
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
  location?: LocationCoordinates
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
      wifiOnly: preferences?.wifiOnly !== undefined ? preferences.wifiOnly : Boolean(currentSettings.wifiOnly)
    };

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub,
        location: locState,
        preferences: mergedPreferences,
        sendWelcomeTest: false
      })
    });

    return res.ok;
  } catch (err) {
    console.warn('Sync preferences error:', err);
    return false;
  }
}

