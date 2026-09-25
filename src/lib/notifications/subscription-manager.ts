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
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        let sub = await reg.pushManager.getSubscription();

        if (!sub && vapidPublicKey) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
          });
        }

        if (sub) {
          pushSubscribed = true;
          // Send to server
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub })
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

/**
 * Fires an immediate test notification using the strict 2-3 line combined format.
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
    if (reg?.active) {
      reg.active.postMessage({
        type: 'CHECK_AND_NOTIFY',
        force: true
      });
      return { success: true, message: 'Panchang Update alert dispatched!' };
    }

    // Fallback: fetch from /api/panchang/today and show directly
    const res = await fetch('/api/panchang/today');
    if (res.ok) {
      const data = await res.json();
      const lines: string[] = [];
      lines.push(`Tithi: ${data.instantaneousTithi?.name || 'Panchang'}`);

      if (data.panchak?.isActive && data.panchak?.isInauspicious) {
        const cleanStatus = (data.panchak.statusText || `${data.panchak.type || 'Panchak'} (Inauspicious)`).replace(/^[🔴⚠️\s]+/, '');
        lines.push(`Panchak: 🔴 ${cleanStatus}`);
      }

      if (data.festivalOrVrat) {
        lines.push(`Festival/Vrat: ${data.festivalOrVrat}`);
      }

      if (reg?.showNotification) {
        const notifOptions: NotificationOptions & { renotify?: boolean } = {
          body: lines.join('\n'),
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          tag: 'panchang-combined-alert',
          renotify: true
        };
        await reg.showNotification('Panchang Update', notifOptions);
      } else {
        new Notification('Panchang Update', {
          body: lines.join('\n'),
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          tag: 'panchang-combined-alert'
        });
      }
      return { success: true, message: 'Panchang Update alert dispatched!' };
    }

    return { success: false, message: 'Unable to fetch panchang snapshot for test.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: `Failed to trigger notification: ${msg}` };
  }
}

/**
 * Initializes client-side periodic polling and visibility change listeners.
 * Runs every 15 minutes when the tab is open, and immediately checks when the user returns to the tab.
 */
export function initClientNotificationScheduler(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Register Service Worker
  getOrRegisterServiceWorker().catch(() => {});

  const checkState = async () => {
    const settings = await getNotificationSettings();
    if (!settings.enabled || Notification.permission !== 'granted') return;

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg?.active) {
        reg.active.postMessage({ type: 'CHECK_AND_NOTIFY', force: false });
      }
    }
  };

  // Run on visibility change (when tab regains focus or screen wakes up)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkState().catch(() => {});
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Periodic interval every 15 minutes while tab is active
  const intervalId = setInterval(() => {
    checkState().catch(() => {});
  }, 15 * 60 * 1000);

  // Initial check after 3 seconds of page load
  const timeoutId = setTimeout(() => {
    checkState().catch(() => {});
  }, 3000);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearInterval(intervalId);
    clearTimeout(timeoutId);
  };
}
