/**
 * State-Diffing and Combined Notification Generator for Vedic Panchang
 * 
 * Monitored Triggers:
 * 1. Tithi change — current lunar day transitions to a new Tithi
 * 2. Panchak period — active/starting (marked with inauspicious status)
 * 3. Festival or Vrat observed on the current date
 * 
 * Notification Logic:
 * - Single combined notification if one or more conditions are met.
 * - Deduplicated against last-notified state stored locally (IndexedDB).
 * - Exact format:
 *     Tithi: <Tithi Name>
 *     Panchak: 🔴 <status> (omitted if no active inauspicious Panchak)
 *     Festival/Vrat: <Name> (omitted if none today)
 * - Notification Title: "Panchang Update"
 */

export interface PanchakStatusInfo {
  isActive: boolean;
  isInauspicious?: boolean;
  type?: string;
  statusText?: string;
  startTimestamp?: number;
  endTimestamp?: number;
}

export interface PanchangCurrentState {
  tithi: string;                     // e.g. "Shukla Navami (9)"
  tithiIndex?: number;
  tithiEndTimestamp?: number;        // when current tithi ends
  nextTithiName?: string;
  panchak: PanchakStatusInfo;
  festivalOrVrat?: string | null;    // name of festival or vrat today, or null
  dateStr: string;                   // YYYY-MM-DD
  timestamp: number;                 // current time in ms
}

export interface LastNotifiedState {
  tithi: string | null;
  isPanchakActive: boolean;
  panchakType: string | null;
  festivalDate: string | null;       // YYYY-MM-DD of the last notified festival/vrat
  festivalOrVrat: string | null;
  lastNotifiedAt: number;            // timestamp in ms
}

export interface CombinedNotificationPayload {
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  renotify: boolean;
  data: {
    url: string;
    tithi: string;
    panchakActive: boolean;
    panchakType: string | null;
    festivalOrVrat: string | null;
    timestamp: number;
    triggers: {
      tithiChanged: boolean;
      panchakStarting: boolean;
      festivalTriggered: boolean;
    };
  };
}

export interface TriggerEvaluationResult {
  shouldNotify: boolean;
  triggers: {
    tithiChanged: boolean;
    panchakStarting: boolean;
    festivalTriggered: boolean;
  };
  payload: CombinedNotificationPayload | null;
  nextNotifiedState: LastNotifiedState;
}

/**
 * Strict 2-3 line notification body formatter:
 * 
 * Tithi: <Tithi Name>
 * Panchak: <status — shown in RED text/highlight only if Panchak is currently active/inauspicious; omit this line entirely if no Panchak>
 * Festival/Vrat: <Name> (omit this line entirely if none today)
 * 
 * Plain push notifications cannot render HTML/CSS color. The red highlight is indicated
 * via the 🔴 emoji marker, with richer red styling clarified in-app.
 */
export function formatPanchangNotificationBody(state: {
  tithi: string;
  panchak?: PanchakStatusInfo | null;
  festivalOrVrat?: string | null;
}): string {
  const lines: string[] = [];

  // Line 1: Tithi (always shown)
  const cleanTithi = state.tithi?.trim() || 'Panchang';
  lines.push(`Tithi: ${cleanTithi}`);

  // Line 2: Panchak (shown in RED indicator only if currently active/inauspicious; omit entirely if no Panchak)
  const isPanchakActive = Boolean(state.panchak?.isActive);
  const isInauspicious = state.panchak?.isInauspicious !== false; // Inauspicious unless explicitly marked false (e.g. Raj Panchak)

  if (isPanchakActive && isInauspicious) {
    const rawType = state.panchak?.type?.trim();
    const rawStatus = state.panchak?.statusText?.trim();

    let panchakStatus = 'Active (Inauspicious)';
    if (rawStatus) {
      panchakStatus = rawStatus.replace(/^[🔴⚠️\s]+/, '');
    } else if (rawType) {
      panchakStatus = rawType.includes('(Inauspicious)') ? rawType : `${rawType} (Inauspicious)`;
    }

    lines.push(`Panchak: 🔴 ${panchakStatus}`);
  }

  // Line 3: Festival/Vrat (omit entirely if none today)
  const cleanFest = state.festivalOrVrat?.trim();
  if (cleanFest && cleanFest.toLowerCase() !== 'none' && cleanFest.toLowerCase() !== 'null') {
    lines.push(`Festival/Vrat: ${cleanFest}`);
  }

  return lines.join('\n');
}

/**
 * State-diffing engine that evaluates current astronomical state against
 * the last-notified record in IndexedDB.
 * 
 * Rules:
 * - Trigger 1: Tithi changed from last notified state.
 * - Trigger 2: Inauspicious Panchak just became active or changed type.
 * - Trigger 3: Festival or Vrat observed on the current date, not yet alerted for today.
 * - If ANY of 1, 2, or 3 are met, returns shouldNotify = true with a SINGLE combined payload.
 * - Deduplicates: returns shouldNotify = false if nothing changed or already alerted.
 */
export function evaluatePanchangNotificationTriggers(
  currentState: PanchangCurrentState,
  lastNotified: LastNotifiedState | null,
  options: { forceNotify?: boolean } = {}
): TriggerEvaluationResult {
  const isPanchakActive = Boolean(currentState.panchak?.isActive);
  const isInauspicious = currentState.panchak?.isInauspicious !== false;
  const currentPanchakInauspicious = isPanchakActive && isInauspicious;
  const currentPanchakType = currentState.panchak?.type || null;

  const currentFestivalOrVrat = currentState.festivalOrVrat?.trim() || null;
  const currentDate = currentState.dateStr;

  // 1. Trigger 1: Tithi Change
  // If first run ever (lastNotified is null), we treat as a change or initial announcement
  const tithiChanged = !lastNotified?.tithi || lastNotified.tithi !== currentState.tithi;

  // 2. Trigger 2: Inauspicious Panchak active/starting
  // Only fires when transitioning into an active inauspicious Panchak period, or type changes
  const panchakStarting = currentPanchakInauspicious && (
    !lastNotified?.isPanchakActive ||
    lastNotified.panchakType !== currentPanchakType
  );

  // 3. Trigger 3: Festival or Vrat observed today
  // Only fires once per calendar date for the day's festival/vrat
  const festivalTriggered = Boolean(currentFestivalOrVrat) && (
    !lastNotified?.festivalDate ||
    lastNotified.festivalDate !== currentDate
  );

  const shouldNotify = options.forceNotify || tithiChanged || panchakStarting || festivalTriggered;

  // Next updated state to persist in IndexedDB
  const nextNotifiedState: LastNotifiedState = {
    tithi: currentState.tithi,
    isPanchakActive: currentPanchakInauspicious,
    panchakType: currentPanchakInauspicious ? currentPanchakType : null,
    festivalDate: currentFestivalOrVrat ? currentDate : (lastNotified?.festivalDate || null),
    festivalOrVrat: currentFestivalOrVrat,
    lastNotifiedAt: currentState.timestamp || Date.now()
  };

  if (!shouldNotify) {
    return {
      shouldNotify: false,
      triggers: {
        tithiChanged: false,
        panchakStarting: false,
        festivalTriggered: false
      },
      payload: null,
      nextNotifiedState
    };
  }

  const body = formatPanchangNotificationBody(currentState);

  const payload: CombinedNotificationPayload = {
    title: 'Panchang Update',
    body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: 'panchang-update-alert',
    renotify: true,
    data: {
      url: '/',
      tithi: currentState.tithi,
      panchakActive: currentPanchakInauspicious,
      panchakType: currentPanchakType,
      festivalOrVrat: currentFestivalOrVrat,
      timestamp: currentState.timestamp || Date.now(),
      triggers: {
        tithiChanged,
        panchakStarting,
        festivalTriggered
      }
    }
  };

  return {
    shouldNotify: true,
    triggers: {
      tithiChanged,
      panchakStarting,
      festivalTriggered
    },
    payload,
    nextNotifiedState
  };
}
