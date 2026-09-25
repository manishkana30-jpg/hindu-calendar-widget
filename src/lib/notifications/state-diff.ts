/**
 * State-Diffing and Combined Notification Generator for Vedic Panchang
 * 
 * Monitored Triggers:
 * 1. Tithi change — current lunar day transitions to a new Tithi (Primary Focus)
 * 2. Inauspicious Panchak period — active/starting (Roga, Agni, Chora, Mrityu only; Nirdosh & Raj excluded)
 * 3. Major Festival or Ekadashi Vrat observed on the current date
 * 
 * Notification Format (Option B - Inline Horizontal Glanceability for Mobile & Desktop):
 *   Tithi: <Tithi Name> [ • 🔴 Panchak: <Status>] [ • Festival: <Name>]
 * 
 * Title: "Panchang Update"
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
  festivalOrVrat?: string | null;    // name of major festival or vrat today, or null
  isMajorFestival?: boolean;
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
 * Checks whether an active Panchak is truly inauspicious per Vedic Dharmashastra.
 * 
 * Prohibited / Inauspicious Panchaks:
 * - Mrityu Panchak (Saturday start - severe danger/crises)
 * - Agni Panchak (Tuesday start - fire/weapon hazards)
 * - Chora Panchak (Friday start - theft/financial losses)
 * - Roga Panchak (Sunday start - illness/physical afflictions)
 * 
 * Auspicious / Benign Panchaks (Strictly EXCLUDED from warnings):
 * - Raja / Nripa Panchak (Monday start - highly auspicious for governance & assets)
 * - Nirdosha Panchak (Wednesday & Thursday start - benign and fault-free)
 */
export function isPanchakTrulyInauspicious(panchak?: PanchakStatusInfo | null): boolean {
  if (!panchak || !panchak.isActive) return false;

  const typeLower = (panchak.type || '').toLowerCase();
  const statusLower = (panchak.statusText || '').toLowerCase();

  // Nirdosh and Raj Panchak are auspicious / fault-free -> NEVER alert them
  if (
    typeLower.includes('nirdosh') ||
    typeLower.includes('raja') ||
    typeLower.includes('raj ') ||
    typeLower === 'raj panchak' ||
    statusLower.includes('nirdosh') ||
    statusLower.includes('raja') ||
    panchak.isInauspicious === false
  ) {
    return false;
  }

  // Canonical inauspicious Panchaks
  return (
    typeLower.includes('mrityu') ||
    typeLower.includes('agni') ||
    typeLower.includes('chora') ||
    typeLower.includes('roga') ||
    panchak.isInauspicious === true
  );
}

/**
 * Option B: Single-Line Horizontal Glanceable Formatter for Mobile & Desktop.
 * 
 * Prevents mobile notification shade from cutting off text after line 1.
 * Focus remains primarily on Tithi:
 *   Tithi: <Tithi Name> [ • 🔴 Panchak: <Status>] [ • Festival: <Name>]
 */
export function formatPanchangNotificationBody(state: {
  tithi: string;
  panchak?: PanchakStatusInfo | null;
  festivalOrVrat?: string | null;
}): string {
  const parts: string[] = [];

  // 1. Primary Focus: Tithi (always first and prominent)
  const cleanTithi = state.tithi?.trim() || 'Panchang';
  parts.push(`Tithi: ${cleanTithi}`);

  // 2. Panchak: ONLY if genuinely inauspicious (omits Nirdosh & Raj Panchak)
  if (isPanchakTrulyInauspicious(state.panchak)) {
    const rawType = state.panchak?.type?.trim();
    const cleanType = rawType ? rawType.replace(/^[🔴⚠️\s]+/, '') : 'Inauspicious';
    parts.push(`🔴 Panchak: ${cleanType}`);
  }

  // 3. Major Festival / Vrat (omitted if none today or minor)
  const cleanFest = state.festivalOrVrat?.trim();
  if (cleanFest && cleanFest.toLowerCase() !== 'none' && cleanFest.toLowerCase() !== 'null') {
    parts.push(`Festival: ${cleanFest}`);
  }

  return parts.join(' • ');
}

/**
 * State-diffing engine that evaluates current astronomical state against
 * the last-notified record in IndexedDB.
 */
export function evaluatePanchangNotificationTriggers(
  currentState: PanchangCurrentState,
  lastNotified: LastNotifiedState | null,
  options: { forceNotify?: boolean } = {}
): TriggerEvaluationResult {
  const currentPanchakInauspicious = isPanchakTrulyInauspicious(currentState.panchak);
  const currentPanchakType = currentPanchakInauspicious ? (currentState.panchak?.type || null) : null;

  const currentFestivalOrVrat = currentState.festivalOrVrat?.trim() || null;
  const currentDate = currentState.dateStr;

  // 1. Trigger 1: Tithi Change (Primary Focus)
  const tithiChanged = !lastNotified?.tithi || lastNotified.tithi !== currentState.tithi;

  // 2. Trigger 2: Inauspicious Panchak active/starting (Nirdosh/Raj ignored)
  const panchakStarting = currentPanchakInauspicious && (
    !lastNotified?.isPanchakActive ||
    lastNotified.panchakType !== currentPanchakType
  );

  // 3. Trigger 3: Major Festival or Ekadashi Vrat observed today
  const festivalTriggered = Boolean(currentFestivalOrVrat) && (
    !lastNotified?.festivalDate ||
    lastNotified.festivalDate !== currentDate
  );

  const shouldNotify = options.forceNotify || tithiChanged || panchakStarting || festivalTriggered;

  // Next state to persist in IndexedDB
  const nextNotifiedState: LastNotifiedState = {
    tithi: currentState.tithi,
    isPanchakActive: currentPanchakInauspicious,
    panchakType: currentPanchakType,
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
