/**
 * Daily Morning Push Notification & 48-Hour Panchang Schedule Engine
 * 
 * Computes:
 * 1. Sunrise-to-Next-Sunrise Complete Day Picture:
 *    - Line 1: Tithi: <Sunrise Tithi> till HH:MM, then <Next Tithi> till HH:MM (up to 3 on Kshaya days)
 *    - Line 2: 🔴 Panchak: <status> from HH:MM to HH:MM (inauspicious only; omitted if none)
 *    - Line 3: Festival/Vrat: <Name> (omitted if none)
 * 2. Next 48 hours forward ephemeris schedule for client caching and zero-network offline use.
 * 3. Exact Tithi-change alert formatter.
 */

import { LocationCoordinates, resolveTimezoneOffset, TITHIS } from '../vedic-astronomy';
import {
  calculateSunTimesWithRefraction,
  getJulianDay,
  getElongationAngle,
  calculateTithiIndexFromElongation,
  findTithiEndTime
} from '../ephemeris';
import { getFestivalForDate } from '../festivals';
import { getActivePanchakStatus } from '../dharmashastra-rules';
import { evaluateEkadashi } from '../dharmashastra-engine';
import { isPanchakTrulyInauspicious } from './state-diff';

export interface SunriseTithiSegment {
  index: number;
  name: string;
  paksha: 'Shukla' | 'Krishna';
  startTimeIso: string;
  endTimeIso: string;
  endTimeFormatted: string; // HH:MM in local timezone
}

export interface DayPanchakWindow {
  isActive: boolean;
  isInauspicious: boolean;
  type?: string;
  startTimeFormatted?: string;
  endTimeFormatted?: string;
  formattedLine?: string; // e.g. "🔴 Panchak: Mrityu Panchak from 14:15 to 06:12"
}

export interface DailyMorningPushPayload {
  title: string;
  body: string;
  lineCount: number;
  tithiLine: string;
  panchakLine?: string | null;
  festivalLine?: string | null;
  sunriseTimeFormatted: string;
  nextSunriseFormatted: string;
  segments: SunriseTithiSegment[];
  data: {
    url: string;
    date: string;
    primaryTithi: string;
    panchakType?: string | null;
    festivalOrVrat?: string | null;
    timestamp: number;
  };
}

export interface ForwardPanchangSchedule {
  dateStr: string;
  location: {
    latitude: number;
    longitude: number;
    timezone: number;
    ianaTimezone?: string;
  };
  generatedAt: number;
  day1: DailyMorningPushPayload;
  day2: DailyMorningPushPayload;
  rawTimeline: {
    sunrises: string[];
    tithiTransitions: Array<{
      tithiIndex: number;
      tithiName: string;
      transitionTimeIso: string;
      transitionTimeFormatted: string;
    }>;
  };
}

/**
 * Formats a Date object to "HH:MM" in the given IANA timezone or numeric offset.
 */
export function formatTimeHHMM(date: Date, timeZone?: string, tzOffsetHours?: number): string {
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone
      }).format(date);
    } catch {
      // Fall through to offset calculation
    }
  }

  const offset = tzOffsetHours ?? 5.5;
  const localMs = date.getTime() + offset * 3600000;
  const d = new Date(localMs);
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Computes the complete Sunrise-to-Next-Sunrise picture for a given date and location.
 * Implements canonical Dharmashastra ephemeris:
 * - Sunrise Tithi is the primary determinant for rituals and festivals.
 * - Captures all 1, 2, or 3 (Kshaya) Tithis occurring before next sunrise.
 * - Captures any inauspicious Panchak window.
 * - Captures premier Festival or Vrat.
 * - Formats into strictly max 3 lines with zero extra text.
 */
export function computeDailyMorningNotification(
  targetDate: Date,
  location: LocationCoordinates,
  elevationMeters: number = 0
): DailyMorningPushPayload {
  const tz = resolveTimezoneOffset(targetDate, location);
  const ianaTz = location.ianaTimezone;

  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const d = targetDate.getDate();

  // Topocentric sunrises for today and tomorrow
  const todaySun = calculateSunTimesWithRefraction(
    new Date(y, m, d, 12, 0, 0),
    location.latitude,
    location.longitude,
    tz,
    elevationMeters
  );

  const tomorrowSun = calculateSunTimesWithRefraction(
    new Date(y, m, d + 1, 12, 0, 0),
    location.latitude,
    location.longitude,
    tz,
    elevationMeters
  );

  const S1 = todaySun.sunriseDate;
  const S2 = tomorrowSun.sunriseDate;

  // 1. Tithi prevailing at sunrise S1 (Udaya Tithi)
  const jd1 = getJulianDay(S1);
  const elongation1 = getElongationAngle(jd1);
  const udayaIndex = calculateTithiIndexFromElongation(elongation1);
  const udayaTithiObj = TITHIS[(udayaIndex - 1) % 30];

  // Exact conclusion of Udaya Tithi
  const E1 = findTithiEndTime(S1, udayaIndex, tz, 36) || S2;
  const E1Formatted = formatTimeHHMM(E1, ianaTz, tz);

  const segments: SunriseTithiSegment[] = [
    {
      index: udayaTithiObj.index,
      name: udayaTithiObj.name,
      paksha: udayaTithiObj.paksha,
      startTimeIso: S1.toISOString(),
      endTimeIso: E1.toISOString(),
      endTimeFormatted: E1Formatted
    }
  ];

  let tithiLine = '';

  // Check if Udaya Tithi ends before next sunrise S2
  if (E1.getTime() < S2.getTime() - 60000) {
    // Second Tithi starts when first ends
    const t2Index = (udayaIndex % 30) + 1;
    const t2Obj = TITHIS[(t2Index - 1) % 30];
    const E2 = findTithiEndTime(E1, t2Index, tz, 36) || S2;
    const E2Formatted = formatTimeHHMM(E2, ianaTz, tz);

    segments.push({
      index: t2Obj.index,
      name: t2Obj.name,
      paksha: t2Obj.paksha,
      startTimeIso: E1.toISOString(),
      endTimeIso: E2.toISOString(),
      endTimeFormatted: E2Formatted
    });

    // Check if second Tithi also concludes before S2 (Kshaya day -> 3 Tithis!)
    if (E2.getTime() < S2.getTime() - 60000) {
      const t3Index = (t2Index % 30) + 1;
      const t3Obj = TITHIS[(t3Index - 1) % 30];
      const E3 = findTithiEndTime(E2, t3Index, tz, 36) || S2;
      const E3Formatted = formatTimeHHMM(E3, ianaTz, tz);

      segments.push({
        index: t3Obj.index,
        name: t3Obj.name,
        paksha: t3Obj.paksha,
        startTimeIso: E2.toISOString(),
        endTimeIso: E3.toISOString(),
        endTimeFormatted: E3Formatted
      });

      // 3 Tithis (Kshaya day)
      tithiLine = `Tithi - ${udayaTithiObj.name} till ${E1Formatted}, then ${t2Obj.name} till ${E2Formatted}, then ${t3Obj.name} till ${E3Formatted}`;
    } else {
      // 2 Tithis (Standard day)
      tithiLine = `Tithi - ${udayaTithiObj.name} till ${E1Formatted}, then ${t2Obj.name} till ${E2Formatted}`;
    }
  } else {
    // 1 Tithi spans the entire sunrise-to-sunrise duration (Tithi Vriddhi)
    tithiLine = `Tithi - ${udayaTithiObj.name} till ${E1Formatted}`;
  }

  // 2. Panchak window between S1 and S2 (active at S1 or starting mid-day before S2)
  const panchakAtS1 = getActivePanchakStatus(S1);
  let dayPanchak: { type?: string; startTimestamp?: number; endTimestamp?: number; auspiciousness?: string } | null = null;

  if (panchakAtS1.isActive && panchakAtS1.panchak) {
    dayPanchak = panchakAtS1.panchak;
  } else if (panchakAtS1.nextPanchak && panchakAtS1.nextPanchak.startTimestamp < S2.getTime()) {
    dayPanchak = panchakAtS1.nextPanchak;
  }

  let panchakLine = 'Panchak - None';
  if (dayPanchak) {
    const isTrulyInauspiciousPanchak = isPanchakTrulyInauspicious({
      isActive: true,
      type: dayPanchak.type,
      statusText: dayPanchak.type,
      isInauspicious: dayPanchak.auspiciousness !== 'Auspicious'
    });

    if (isTrulyInauspiciousPanchak) {
      const rawType = dayPanchak.type || 'Panchak';
      const cleanType = rawType.replace(/^[🔴⚠️\s]+/, '').trim();
      const pStartMs = dayPanchak.startTimestamp;
      const pEndMs = dayPanchak.endTimestamp;

      const pStartFormatted = pStartMs ? formatTimeHHMM(new Date(pStartMs), ianaTz, tz) : formatTimeHHMM(S1, ianaTz, tz);
      const pEndFormatted = pEndMs ? formatTimeHHMM(new Date(pEndMs), ianaTz, tz) : formatTimeHHMM(S2, ianaTz, tz);

      panchakLine = `Panchak - ${cleanType} from ${pStartFormatted} to ${pEndFormatted}`;
    }
  }


  // 3. Festival or Vrat (Sunrise Tithi is the primary determinant)
  const festivalResult = getFestivalForDate(S1, location);
  const ekadashiResult = evaluateEkadashi(S1, location);

  let detectedFestivalName: string | null = null;

  if (festivalResult.isMajor || festivalResult.category === 'Major Festival') {
    detectedFestivalName = festivalResult.name;
  } else if (ekadashiResult.isEkadashiDay) {
    detectedFestivalName = festivalResult.category === 'Ekadashi' ? festivalResult.name : 'Ekadashi Vrat';
  } else if (festivalResult.name && festivalResult.name.toLowerCase() !== 'none' && !festivalResult.name.toLowerCase().includes('nitya panchang')) {
    detectedFestivalName = festivalResult.name;
  }

  const festivalLine = detectedFestivalName
    ? `Vrat/Festival - ${detectedFestivalName}`
    : 'Vrat/Festival - None';

  // 4. Assemble canonical 3 lines
  const lines: string[] = [tithiLine, panchakLine, festivalLine];

  const body = lines.join('\n');
  const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return {
    title: 'Daily Tithi • Panchang Update',
    body,
    lineCount: lines.length,
    tithiLine,
    panchakLine,
    festivalLine,
    sunriseTimeFormatted: formatTimeHHMM(S1, ianaTz, tz),
    nextSunriseFormatted: formatTimeHHMM(S2, ianaTz, tz),
    segments,
    data: {
      url: '/',
      date: dateStr,
      primaryTithi: udayaTithiObj.name,
      panchakType: panchakLine !== 'Panchak - None' ? (dayPanchak?.type || null) : null,
      festivalOrVrat: detectedFestivalName,
      timestamp: Date.now()
    }
  };
}

/**
 * Precomputes the next 48 hours of Panchang schedule ahead of time.
 */
export function compute48HourForecast(
  startDate: Date,
  location: LocationCoordinates,
  elevationMeters: number = 0
): ForwardPanchangSchedule {
  const tz = resolveTimezoneOffset(startDate, location);
  const y = startDate.getFullYear();
  const m = startDate.getMonth();
  const d = startDate.getDate();

  const day1Date = new Date(y, m, d, 6, 0, 0);
  const day2Date = new Date(y, m, d + 1, 6, 0, 0);

  const day1Payload = computeDailyMorningNotification(day1Date, location, elevationMeters);
  const day2Payload = computeDailyMorningNotification(day2Date, location, elevationMeters);

  const tithiTransitions = [...day1Payload.segments, ...day2Payload.segments].map(seg => ({
    tithiIndex: seg.index,
    tithiName: seg.name,
    transitionTimeIso: seg.endTimeIso,
    transitionTimeFormatted: seg.endTimeFormatted
  }));

  const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return {
    dateStr,
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: tz,
      ianaTimezone: location.ianaTimezone
    },
    generatedAt: Date.now(),
    day1: day1Payload,
    day2: day2Payload,
    rawTimeline: {
      sunrises: [day1Payload.sunriseTimeFormatted, day1Payload.nextSunriseFormatted, day2Payload.nextSunriseFormatted],
      tithiTransitions
    }
  };
}

/**
 * Formats an instantaneous Tithi change alert for users who enabled "Also alert me at each Tithi change".
 * Format:
 * "Tithi changed: <New Tithi> (from HH:MM)" (or "Changed at HH:MM" if delivered late)
 * Combined with Panchak/Festival if coinciding.
 */
export function formatTithiChangeAlert(options: {
  newTithiName: string;
  transitionTime: Date;
  isDelayed?: boolean;
  panchakStatus?: { isActive: boolean; type?: string; isInauspicious?: boolean } | null;
  festivalName?: string | null;
  timeZone?: string;
  tzOffset?: number;
}): { title: string; body: string } {
  const timeFormatted = formatTimeHHMM(options.transitionTime, options.timeZone, options.tzOffset);
  const prefix = options.isDelayed
    ? `Tithi changed: ${options.newTithiName} (Changed at ${timeFormatted})`
    : `Tithi changed: ${options.newTithiName} (from ${timeFormatted})`;

  const parts = [prefix];

  if (options.panchakStatus?.isActive && isPanchakTrulyInauspicious(options.panchakStatus)) {
    const rawType = options.panchakStatus.type || 'Panchak';
    const cleanType = rawType.replace(/^[🔴⚠️\s]+/, '').trim();
    parts.push(`🔴 Panchak: ${cleanType}`);
  }

  if (options.festivalName && options.festivalName.toLowerCase() !== 'none') {
    parts.push(`Festival: ${options.festivalName}`);
  }

  return {
    title: 'Panchang Update',
    body: parts.join(' • ')
  };
}
