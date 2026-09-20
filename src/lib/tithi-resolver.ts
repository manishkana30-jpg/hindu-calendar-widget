/**
 * Anomalous Tithi Resolver & Daily Vedic Day Synchronizer
 * Accurately detects and resolves:
 * 1. The Midnight vs. Sunrise Rollover Trap (Pre-sunrise civil day anchoring)
 * 2. Tithi Kshaya (Lost Tithi: starts after sunrise D-1 and ends before sunrise D)
 * 3. Tithi Vriddhi (Extended Tithi: spans two consecutive sunrises)
 * 4. Sub-second boundary start and end timestamps
 */

import { LocationCoordinates, resolveTimezoneOffset, TITHIS } from './vedic-astronomy';
import {
  getJulianDay,
  getElongationAngle,
  calculateTithiIndexFromElongation,
  calculateTithiProgressFromElongation,
  findTithiEndTime,
  calculateSunTimesWithRefraction
} from './ephemeris';

export interface DailyTithiResolution {
  gregorianDate: string; // 'YYYY-MM-DD'
  udayaTithi: {
    index: number; // 1 to 30
    name: string;
    paksha: 'Shukla' | 'Krishna';
    endTime: string; // ISO timestamp
  };
  instantaneousTithi: {
    index: number;
    name: string;
    paksha: 'Shukla' | 'Krishna';
    percentageElapsed: number; // 0.0 to 100.0%
    endTime: string; // ISO timestamp
  };
  isKshaya: boolean; // True if a Tithi was skipped between previous sunrise & this sunrise
  kshayaTithiDetails?: {
    index: number;
    name: string;
    startTime: string;
    endTime: string;
  } | null;
  isVriddhi: boolean; // True if the same Tithi prevailed at yesterday's sunrise
  nextSunrise: string; // ISO timestamp
  // Extended astrometric context
  isPreSunrise?: boolean;
  civilAnchorDate?: string; // 'YYYY-MM-DD' to which civil rituals belong
}

/**
 * Formats a Date object to YYYY-MM-DD in local timezone
 */
export function formatLocalDateString(date: Date, tz: number): string {
  const localMs = date.getTime() + tz * 3600000;
  const d = new Date(localMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Resolves anomalous Tithis (Kshaya and Vriddhi) between two consecutive sunrises.
 * @param prevSunrise Sunrise of Day D-1
 * @param currSunrise Sunrise of Day D
 * @param tz Timezone offset in hours
 */
export function resolveAnomaliesBetweenSunrises(
  prevSunrise: Date,
  currSunrise: Date,
  tz: number
): {
  isKshaya: boolean;
  kshayaDetails: { index: number; name: string; startTime: string; endTime: string } | null;
  isVriddhi: boolean;
  prevUdayaIndex: number;
  currUdayaIndex: number;
} {
  const prevJd = getJulianDay(prevSunrise);
  const currJd = getJulianDay(currSunrise);

  const prevElongation = getElongationAngle(prevJd);
  const currElongation = getElongationAngle(currJd);

  const prevUdayaIndex = calculateTithiIndexFromElongation(prevElongation);
  const currUdayaIndex = calculateTithiIndexFromElongation(currElongation);

  // Vriddhi: Same Tithi touches two consecutive sunrises
  if (currUdayaIndex === prevUdayaIndex) {
    return {
      isKshaya: false,
      kshayaDetails: null,
      isVriddhi: true,
      prevUdayaIndex,
      currUdayaIndex
    };
  }

  // Tithi step in the cyclic sequence [1..30]
  const diff = (currUdayaIndex - prevUdayaIndex + 30) % 30;

  // Kshaya: Tithi advanced by 2 across sunrises, skipping one entire Tithi
  if (diff === 2) {
    const kshayaIndex = (prevUdayaIndex % 30) + 1;
    const kshayaObj = TITHIS[(kshayaIndex - 1) % 30];

    // The skipped Tithi started when prevUdaya concluded
    const kshayaStart = findTithiEndTime(prevSunrise, prevUdayaIndex, tz, 24);
    // The skipped Tithi ended when kshayaIndex concluded
    const kshayaEnd = kshayaStart
      ? findTithiEndTime(kshayaStart, kshayaIndex, tz, 24)
      : findTithiEndTime(prevSunrise, kshayaIndex, tz, 30);

    return {
      isKshaya: true,
      kshayaDetails: {
        index: kshayaIndex,
        name: kshayaObj.name,
        startTime: kshayaStart ? kshayaStart.toISOString() : prevSunrise.toISOString(),
        endTime: kshayaEnd ? kshayaEnd.toISOString() : currSunrise.toISOString()
      },
      isVriddhi: false,
      prevUdayaIndex,
      currUdayaIndex
    };
  }

  return {
    isKshaya: false,
    kshayaDetails: null,
    isVriddhi: false,
    prevUdayaIndex,
    currUdayaIndex
  };
}

/**
 * Resolves the complete Daily Tithi Resolution according to canonical Vedic rules,
 * reconciling instantaneous lunar motion with civil Udaya Tithi and midnight-sunrise rollover.
 *
 * @param targetDate Gregorian calendar date
 * @param location Observer coordinates and timezone
 * @param specificTime Specific observation timestamp (defaults to real-time clock or 06:00 AM)
 * @param elevationMeters Observer elevation in meters (default: 0)
 */
export function resolveDailyTithi(
  targetDate: Date,
  location: LocationCoordinates,
  specificTime?: Date,
  elevationMeters: number = 0
): DailyTithiResolution {
  const tz = resolveTimezoneOffset(targetDate, location);

  // 1. Calculate topocentric sunrises for Yesterday, Today, and Tomorrow
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();

  const todaySun = calculateSunTimesWithRefraction(
    new Date(year, month, day, 12, 0, 0),
    location.latitude,
    location.longitude,
    tz,
    elevationMeters
  );

  const yesterdaySun = calculateSunTimesWithRefraction(
    new Date(year, month, day - 1, 12, 0, 0),
    location.latitude,
    location.longitude,
    tz,
    elevationMeters
  );

  const tomorrowSun = calculateSunTimesWithRefraction(
    new Date(year, month, day + 1, 12, 0, 0),
    location.latitude,
    location.longitude,
    tz,
    elevationMeters
  );

  // 2. Determine exact instantaneous observation time
  const isTodayDate = targetDate.toDateString() === new Date().toDateString();
  const observationTime =
    specificTime ||
    (isTodayDate
      ? new Date()
      : new Date(year, month, day, targetDate.getHours() || 6, targetDate.getMinutes() || 0, 0));

  // 3. Evaluate Instantaneous Tithi at observation time
  const instJd = getJulianDay(observationTime);
  const instElongation = getElongationAngle(instJd);
  const instIndex = calculateTithiIndexFromElongation(instElongation);
  const instObj = TITHIS[(instIndex - 1) % 30];
  const percentageElapsed = Number(calculateTithiProgressFromElongation(instElongation).toFixed(2));

  // Find exact conclusion time for current instantaneous Tithi
  const instEndTimeUtc = findTithiEndTime(observationTime, instIndex, tz, 36);
  const instEndTimeIso = instEndTimeUtc ? instEndTimeUtc.toISOString() : '';

  // 4. Resolve Civil Udaya Tithi and Handle the Midnight vs. Sunrise Rollover Trap
  // A civil Vedic day (Ahoratra) extends from local sunrise to next local sunrise.
  const isPreSunrise = observationTime.getTime() < todaySun.sunriseDate.getTime();

  let activeSunrise: Date;
  let prevSunriseForAnomaly: Date;
  let nextSunriseDate: Date;
  let civilAnchorDate: string;

  if (isPreSunrise) {
    // Between 00:00:00 midnight and local sunrise:
    // The civil day is STILL anchored to yesterday's sunrise!
    activeSunrise = yesterdaySun.sunriseDate;
    const dayBeforeYesterdaySun = calculateSunTimesWithRefraction(
      new Date(year, month, day - 2, 12, 0, 0),
      location.latitude,
      location.longitude,
      tz,
      elevationMeters
    );
    prevSunriseForAnomaly = dayBeforeYesterdaySun.sunriseDate;
    nextSunriseDate = todaySun.sunriseDate;
    civilAnchorDate = formatLocalDateString(new Date(year, month, day - 1), tz);
  } else {
    // Post-sunrise: Normal day progression
    activeSunrise = todaySun.sunriseDate;
    prevSunriseForAnomaly = yesterdaySun.sunriseDate;
    nextSunriseDate = tomorrowSun.sunriseDate;
    civilAnchorDate = formatLocalDateString(new Date(year, month, day), tz);
  }

  // Prevailing Udaya Tithi at active civil sunrise
  const activeSunriseJd = getJulianDay(activeSunrise);
  const udayaElongation = getElongationAngle(activeSunriseJd);
  const udayaIndex = calculateTithiIndexFromElongation(udayaElongation);
  const udayaObj = TITHIS[(udayaIndex - 1) % 30];

  // Exact conclusion time for Udaya Tithi
  const udayaEndTimeUtc = findTithiEndTime(activeSunrise, udayaIndex, tz, 36);
  const udayaEndTimeIso = udayaEndTimeUtc ? udayaEndTimeUtc.toISOString() : '';

  // 5. Detect Kshaya / Vriddhi Anomalies
  const anomaly = resolveAnomaliesBetweenSunrises(prevSunriseForAnomaly, activeSunrise, tz);

  const gregorianDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    gregorianDate,
    udayaTithi: {
      index: udayaObj.index,
      name: udayaObj.name,
      paksha: udayaObj.paksha,
      endTime: udayaEndTimeIso
    },
    instantaneousTithi: {
      index: instObj.index,
      name: instObj.name,
      paksha: instObj.paksha,
      percentageElapsed,
      endTime: instEndTimeIso
    },
    isKshaya: anomaly.isKshaya,
    kshayaTithiDetails: anomaly.kshayaDetails,
    isVriddhi: anomaly.isVriddhi,
    nextSunrise: nextSunriseDate.toISOString(),
    isPreSunrise,
    civilAnchorDate
  };
}

/**
 * Generates high-precision Daily Tithi Resolutions for an entire Gregorian month.
 * Seamlessly resolves month-boundary transitions by linking with the previous month's final sunrise.
 */
export function resolveMonthlyTithis(
  year: number,
  month: number,
  location: LocationCoordinates,
  elevationMeters: number = 0
): DailyTithiResolution[] {
  const tz = resolveTimezoneOffset(new Date(year, month, 15), location);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const resolutions: DailyTithiResolution[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    // Evaluate calendar view at 06:00 local time (representing the day's standard civil view)
    const curDate = new Date(year, month, d, 6, 0, 0);
    const res = resolveDailyTithi(curDate, location, curDate, elevationMeters);
    resolutions.push(res);
  }

  return resolutions;
}
