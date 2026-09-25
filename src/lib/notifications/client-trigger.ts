import { calculatePanchang, PRESET_LOCATIONS } from '../vedic-astronomy';
import { getFestivalForDate } from '../festivals';
import { getActivePanchakStatus } from '../dharmashastra-rules';
import { evaluateEkadashi } from '../dharmashastra-engine';
import { formatPanchangNotificationBody } from './state-diff';
import { NotificationPayload } from './payload-builder';
import { saveLastNotifiedState } from './idb-storage';

export interface PushNotificationResult {
  success: boolean;
  message: string;
  payload?: NotificationPayload;
  error?: string;
}

/**
 * Calculates today's Vedic astrometry and builds the strict 2-3 line combined notification:
 * Title: "Panchang Update"
 * Body:
 * Tithi: <Tithi Name>
 * Panchak: 🔴 <status> (omitted if no active inauspicious Panchak)
 * Festival/Vrat: <Name> (omitted if none today)
 */
export function getDailyNotificationPayloadForDate(date: Date = new Date()): NotificationPayload {
  const location = PRESET_LOCATIONS[0]; // Baseline New Delhi coordinates
  const panchang = calculatePanchang(date, location);
  const festivalResult = getFestivalForDate(date, location);
  const panchakResult = getActivePanchakStatus(date);
  const ekadashiResult = evaluateEkadashi(date, location);

  let festivalOrVrat: string | null = null;

  // Detect Festival or Vrat
  if (festivalResult.isMajor || festivalResult.category === 'Major Festival') {
    festivalOrVrat = festivalResult.name;
  } else if (ekadashiResult.isEkadashiDay) {
    festivalOrVrat = festivalResult.category === 'Ekadashi' ? festivalResult.name : 'Ekadashi Vrat';
  } else if (
    festivalResult.category === 'Vrat' ||
    festivalResult.category === 'Pradosh' ||
    festivalResult.name.toLowerCase().includes('vrat')
  ) {
    festivalOrVrat = festivalResult.name;
  }

  const isInauspicious = panchakResult.isActive && panchakResult.panchak?.auspiciousness !== 'Auspicious';
  const panchakStatus = panchakResult.isActive
    ? (panchakResult.panchak?.type ? `${panchakResult.panchak.type} (Inauspicious)` : 'Active (Inauspicious)')
    : undefined;

  const body = formatPanchangNotificationBody({
    tithi: panchang.instantaneousTithi?.name || panchang.tithi.name,
    panchak: {
      isActive: panchakResult.isActive,
      isInauspicious,
      statusText: panchakStatus
    },
    festivalOrVrat
  });

  return {
    title: 'Panchang Update',
    body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: {
      url: '/'
    }
  };
}

/**
 * Triggers an immediate combined notification directly to the user's screen
 * with strict format and deduplication tracking in IndexedDB.
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

  // 2. Build strict 2-3 line combined payload for current moment
  const now = new Date();
  const payload = getDailyNotificationPayloadForDate(now);

  const options: NotificationOptions & { renotify?: boolean } = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: 'panchang-combined-alert',
    renotify: true,
    data: {
      ...payload.data,
      timestamp: Date.now()
    }
  };

  // 3. Mark notification as shown today in localStorage & IndexedDB
  try {
    const todayStr = now.toISOString().split('T')[0];
    localStorage.setItem('last_panchang_notification_date', todayStr);

    const panchang = calculatePanchang(now, PRESET_LOCATIONS[0]);
    const panchakResult = getActivePanchakStatus(now);
    await saveLastNotifiedState({
      tithi: panchang.instantaneousTithi?.name || panchang.tithi.name,
      isPanchakActive: panchakResult.isActive,
      panchakType: panchakResult.panchak?.type || null,
      festivalDate: todayStr,
      festivalOrVrat: null,
      lastNotifiedAt: Date.now()
    });
  } catch (e) {
    // ignore storage error
  }

  // 4. Dispatch via Service Worker (preferred for PWA reliability on Android, Windows & macOS)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(payload.title, options);
        return { 
          success: true, 
          message: `Dispatched "${payload.title}" to your screen!`,
          payload
        };
      }
    } catch (swErr) {
      console.warn('Service Worker showNotification failed, falling back to Notification API:', swErr);
    }
  }

  // 5. Fallback to standard window.Notification constructor
  try {
    new Notification(payload.title, options);
    return { 
      success: true, 
      message: `Dispatched "${payload.title}" to your screen!`,
      payload
    };
  } catch (err: unknown) {
    console.error('window.Notification instantiation error:', err);
    return { 
      success: false, 
      message: 'Failed to instantiate notification on this device.', 
      error: (err as Error)?.message || 'UNKNOWN_ERROR' 
    };
  }
}

/**
 * Initializes automatic daily notification scheduling on the client.
 */
export function initAutomaticDailyNotifications(): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const todayStr = new Date().toISOString().split('T')[0];
  const lastShown = localStorage.getItem('last_panchang_notification_date');

  // If not shown today, push today's morning notification
  if (lastShown !== todayStr) {
    pushTestTithiNotification().catch((err) => {
      console.log('Daily auto-notification dispatch error:', err);
    });
  }

  // Calculate milliseconds until next morning 06:00 AM
  const now = new Date();
  const nextMorning = new Date(now);
  nextMorning.setHours(6, 0, 0, 0);
  if (now.getTime() >= nextMorning.getTime()) {
    nextMorning.setDate(nextMorning.getDate() + 1);
  }
  const msUntilNextMorning = nextMorning.getTime() - now.getTime();

  // Set timeout to automatically trigger tomorrow at 6:00 AM
  setTimeout(() => {
    pushTestTithiNotification().catch(() => {});
    // Recurring interval every 24 hours thereafter
    setInterval(() => {
      pushTestTithiNotification().catch(() => {});
    }, 24 * 60 * 60 * 1000);
  }, msUntilNextMorning);
}
