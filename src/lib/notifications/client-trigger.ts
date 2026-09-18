import { calculatePanchang, PRESET_LOCATIONS } from '../vedic-astronomy';

export interface PushNotificationResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Triggers an immediate, live Tithi notification directly to the user's device screen.
 * Handles permission requests, Service Worker registration, and fallback to window.Notification.
 */
export async function pushTestTithiNotification(): Promise<PushNotificationResult> {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Cannot push notification in SSR mode.' };
  }

  if (!('Notification' in window)) {
    return { 
      success: false, 
      message: 'Browser does not support notifications.', 
      error: 'NOT_SUPPORTED' 
    };
  }

  // 1. Request notification permission if not yet granted
  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch (permErr) {
      console.error('Permission request error:', permErr);
    }
  }

  if (permission !== 'granted') {
    return { 
      success: false, 
      message: 'Notification permission was denied or dismissed. Please allow notifications in your browser settings.', 
      error: 'PERMISSION_DENIED' 
    };
  }

  // 2. Compute exact live Vedic Panchang for current moment
  const now = new Date();
  const location = PRESET_LOCATIONS[0]; // Baseline New Delhi coordinates
  const panchang = calculatePanchang(now, location);

  const choghadiyaInfo = panchang.currentChoghadiya 
    ? `${panchang.currentChoghadiya.name} (${panchang.currentChoghadiya.nature.toLowerCase()})` 
    : 'Auspicious';

  const title = `🕉️ Today's Tithi: ${panchang.tithi.name}`;
  const body = `${panchang.masaDisplay} • Active until ${panchang.tithi.endTime} • Choghadiya: ${choghadiyaInfo} • 100% Offline`;

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: 'test-tithi-notification',
    renotify: true,
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // 3. Dispatch via Service Worker (preferred for PWA reliability on Android & Windows)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(title, options);
        return { 
          success: true, 
          message: `Pushed "${title}" to your screen!` 
        };
      }
    } catch (swErr) {
      console.warn('Service Worker showNotification failed, falling back to Notification API:', swErr);
    }
  }

  // 4. Fallback to standard window.Notification constructor
  try {
    new Notification(title, options);
    return { 
      success: true, 
      message: `Pushed "${title}" to your screen!` 
    };
  } catch (err: any) {
    console.error('window.Notification instantiation error:', err);
    return { 
      success: false, 
      message: 'Failed to instantiate notification on this device.', 
      error: err?.message || 'UNKNOWN_ERROR' 
    };
  }
}
