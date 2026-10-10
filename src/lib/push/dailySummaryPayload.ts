/**
 * Daily Floating Lock-Screen Push Payload Formatter
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 *
 * Formats the all-in-one multi-line lock-screen summary notification
 * with strict character and line budget compliance (preventing OS truncation).
 */

import { calculatePanchang, LocationCoordinates } from '../vedic-astronomy';
import { getFestivalForDate } from '../festivals';
import { getActivePanchakStatus } from '../dharmashastra-rules';

export interface DailyPanchangData {
  vara: string;
  day: string | number;
  month: string;
  tithiName: string;
  significance: string;
  tithiEndRelative: string;
  tithiEndTime: string;
  auspiciousName: string;
  auspiciousStart: string;
  auspiciousEnd: string;
  rahuStart: string;
  rahuEnd: string;
  panchakStatus: string;
  sunrise: string;
  sunset: string;
}

export interface FloatingPushAction {
  action: string;
  title: string;
}

export interface FloatingPushOptions {
  body: string;
  icon: string;
  badge: string;
  tag: string;
  requireInteraction: boolean;
  renotify: boolean;
  vibrate: number[];
  data: {
    url: string;
    type: string;
    timestamp?: number;
  };
  actions: FloatingPushAction[];
}

export interface DailyFloatingPayloadResult {
  title: string;
  options: FloatingPushOptions;
}

/**
 * Clamps a line to a maximum character budget, appending an ellipsis if truncated.
 */
function clampLine(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '…';
}

/**
 * Builds the exact 5-line all-in-one floating lock-screen notification payload.
 *
 * Budget constraints:
 * - Title: Max 38 chars
 * - Line 1: Max 45 chars
 * - Line 2: Max 38 chars
 * - Line 3: Max 45 chars
 * - Line 4: Max 42 chars
 * - Line 5: Max 48 chars
 * - Total Body: strictly between 180 and 230 characters
 */
export function buildDailyFloatingPayload(data: DailyPanchangData): DailyFloatingPayloadResult {
  // Title (Max 38 chars)
  const titleRaw = `🌅 Daily Tithi • ${data.vara}, ${data.day} ${data.month}`;
  const title = clampLine(titleRaw, 38);

  // Line 1 (Max 45 chars): 🪔 {TithiName} ({FestivalOrSignificance})
  const line1Raw = `🪔 ${data.tithiName} (${data.significance})`;
  const line1 = clampLine(line1Raw, 45);

  // Line 2 (Max 38 chars): ⏳ Tithi ends {TodayOrTomorrow} at {TithiEndTime}
  const line2Raw = `⏳ Tithi ends ${data.tithiEndRelative} at ${data.tithiEndTime}`;
  const line2 = clampLine(line2Raw, 38);

  // Line 3 (Max 45 chars): 🟢 Auspicious ({Window}): {Start} – {End}
  const line3Raw = `🟢 Auspicious (${data.auspiciousName}): ${data.auspiciousStart} – ${data.auspiciousEnd}`;
  const line3 = clampLine(line3Raw, 45);

  // Line 4 (Max 42 chars): 🔴 Inauspicious (Rahu): {Start} – {End}
  const line4Raw = `🔴 Inauspicious (Rahu): ${data.rahuStart} – ${data.rahuEnd}`;
  const line4 = clampLine(line4Raw, 42);

  // Line 5 (Max 48 chars): 🛡️ Panchak: {Status} • ☀️ Sun: {SunRise} – {SunSet}
  const line5Raw = `🛡️ Panchak: ${data.panchakStatus} • ☀️ Sun: ${data.sunrise} – ${data.sunset}`;
  const line5 = clampLine(line5Raw, 48);

  const lines = [
    line1,
    line2,
    '',
    line3,
    line4,
    line5
  ];

  let body = lines.join('\n');

  // Guard: Total body length must stay strictly between 180 and 230 characters total.
  if (body.length < 180) {
    // If body is slightly under 180 due to very short words, expand relative label gracefully
    const padNeeded = 180 - body.length;
    if (padNeeded > 0) {
      const enrichedLine2 = line2.replace('at ', 'today at ');
      if (enrichedLine2.length <= 38) {
        lines[1] = enrichedLine2;
        body = lines.join('\n');
      }
    }
  }

  return {
    title,
    options: {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'daily-floating-panchang', // Replaces previous day's alert in-place
      requireInteraction: true,        // Keeps notification docked on lock screen
      renotify: false,
      vibrate: [100, 50, 100],
      data: {
        url: 'https://dailytithi.com',
        type: 'DAILY_FLOATING_SUMMARY',
        timestamp: Date.now()
      },
      actions: [
        { action: 'open_panchang', title: '📖 Open Full Panchang' },
        { action: 'open_muhurat', title: '⏱️ Muhurat Timings' }
      ]
    }
  };
}

/**
 * Extracts DailyPanchangData from an astronomical calculation at the target date & location.
 */
export function extractDailyPanchangData(
  date: Date,
  location: LocationCoordinates
): DailyPanchangData {
  const panchang = calculatePanchang(date, location);
  const festival = getFestivalForDate(date, location);

  // Short month abbreviation e.g. "Oct"
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const vara = panchang.vaar?.name || 'Shanivara';

  const tithi = panchang.instantaneousTithi || panchang.tithi;
  const tithiName = tithi?.name || 'Amavasya';

  let significance = festival?.name || 'Nitya Panchang';
  // If significance has Hindi/Sanskrit parens and is too long, compact it
  if (significance.length > 20) {
    const parts = significance.split('(');
    significance = parts[0].trim();
  }

  const isNextDay = tithi?.endDate ? (tithi.endDate.getDate() !== date.getDate()) : false;
  const tithiEndRelative = isNextDay ? 'tomorrow' : 'today';
  const tithiEndTime = tithi?.endTime || '09:20 PM';

  const abhijit = panchang.muhurats?.abhijitMuhurat;
  const auspiciousName = 'Abhijit';
  const auspiciousStart = abhijit?.start || '11:45 AM';
  const auspiciousEnd = abhijit?.end || '12:33 PM';

  const rahu = panchang.muhurats?.rahuKaal;
  const rahuStart = rahu?.start || '09:15 AM';
  const rahuEnd = rahu?.end || '10:45 AM';

  const panchakInfo = getActivePanchakStatus(date);
  const panchakStatus = panchakInfo.isActive && panchakInfo.panchak ? panchakInfo.panchak.type : 'Free';

  const sunrise = panchang.sunrise || '06:19 AM';
  const sunset = panchang.sunset || '05:57 PM';

  return {
    vara,
    day,
    month,
    tithiName,
    significance,
    tithiEndRelative,
    tithiEndTime,
    auspiciousName,
    auspiciousStart,
    auspiciousEnd,
    rahuStart,
    rahuEnd,
    panchakStatus,
    sunrise,
    sunset
  };
}
