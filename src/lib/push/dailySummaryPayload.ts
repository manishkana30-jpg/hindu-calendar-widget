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
  silent?: boolean;
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
 * Builds the compact, glanceable lock-screen notification payload.
 *
 * Designed to fit completely within mobile notification shade and lock-screen
 * budgets without truncation on Android, iOS Web Push, and Windows.
 */
export function buildDailyFloatingPayload(data: DailyPanchangData): DailyFloatingPayloadResult {
  // Title (Max 38 chars)
  const titleRaw = `🌸 Daily Tithi • ${data.vara}, ${data.day} ${data.month}`;
  const title = clampLine(titleRaw, 38);

  // Line 1: ✨ Tithi: {TithiName} (upto {EndTime})
  const line1Raw = `✨ Tithi: ${data.tithiName} (upto ${data.tithiEndTime})`;
  const line1 = clampLine(line1Raw, 48);

  // Line 2: ⚡ Shubh: {Start}–{End} • ⚠️ Rahu: {Start}–{End}
  const line2Raw = `⚡ Shubh: ${data.auspiciousStart}–${data.auspiciousEnd} • ⚠️ Rahu: ${data.rahuStart}–${data.rahuEnd}`;
  const line2 = clampLine(line2Raw, 52);

  // Line 3: 🛡️ Panchak: {Status} • ☀️ Sun: {SunRise}–{SunSet}
  const line3Raw = `🛡️ Panchak: ${data.panchakStatus} • ☀️ Sun: ${data.sunrise}–${data.sunset}`;
  const line3 = clampLine(line3Raw, 48);

  const lines = [
    line1,
    line2,
    line3
  ];

  const body = lines.join('\n');

  return {
    title,
    options: {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'daily-tithi-panchang',      // Canonical tag: automatically replaces older notifications
      requireInteraction: true,        // Keeps notification visible on lock screen
      renotify: true,                  // Alerts device on fresh delivery
      silent: false,                   // Informs Android not to demote to silent channel
      vibrate: [200, 100, 200],
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
