/**
 * Service Worker Registration & Push Capability Utilities
 * 
 * Safely registers the root-scoped Service Worker and detects device capabilities
 * across modern desktop and mobile browsers.
 */

/**
 * Checks if Service Workers are supported in the current environment.
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Checks if the W3C PushManager API is supported in the current environment.
 */
export function isPushManagerSupported(): boolean {
  return typeof window !== 'undefined' && 'PushManager' in window && isServiceWorkerSupported();
}

/**
 * Registers the Service Worker at root scope ('/').
 * Awaits the active registration ready state.
 */
export async function registerServiceWorker(
  scriptUrl: string = '/sw.js',
  scope: string = '/'
): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(scriptUrl, {
      scope
    });

    // Wait until the service worker is active and controlling the page
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err: unknown) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
}

/**
 * Retrieves the current Service Worker registration if registered.
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    return registration || null;
  } catch (err: unknown) {
    console.warn('Error querying Service Worker registration:', err);
    return null;
  }
}

/**
 * Converts a base64url VAPID public key string into a Uint8Array suitable
 * for PushManager.subscribe({ applicationServerKey }).
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
