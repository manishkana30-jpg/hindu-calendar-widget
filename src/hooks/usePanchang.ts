"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LocationCoordinates,
  PanchangData,
  PRESET_LOCATIONS,
  TITHIS,
  formatUtcDateToLocalTime,
  resolveTimezoneOffset,
  ChoghadiyaSlot
} from '../lib/vedic-astronomy';
import {
  DailyTithiResolution
} from '../lib/tithi-resolver';
import {
  getActivePanchakStatus,
  calculateActive30Muhurat,
  Active30MuhuratResult,
  PanchakEntry
} from '../lib/dharmashastra-rules';
import {
  getHolidayAndEclipseDetails,
  HolidayAndEclipseDetails
} from '../lib/eclipses-and-holidays';
import { usePanchangAutoSync } from './usePanchangAutoSync';

// Comprehensive timezone mapping for city and country lookup fallbacks
export const CITY_TIMEZONE_MAP: Record<string, string> = {
  // Major Indian Cities
  'new delhi': 'Asia/Kolkata',
  'mumbai': 'Asia/Kolkata',
  'bengaluru': 'Asia/Kolkata',
  'varanasi': 'Asia/Kolkata',
  'varanasi (kashi)': 'Asia/Kolkata',
  'ayodhya': 'Asia/Kolkata',
  'ujjain': 'Asia/Kolkata',
  'haridwar': 'Asia/Kolkata',
  'kolkata': 'Asia/Kolkata',
  'chennai': 'Asia/Kolkata',
  'hyderabad': 'Asia/Kolkata',
  'ahmedabad': 'Asia/Kolkata',
  'pune': 'Asia/Kolkata',
  'jaipur': 'Asia/Kolkata',
  'lucknow': 'Asia/Kolkata',
  'kanpur': 'Asia/Kolkata',
  'patna': 'Asia/Kolkata',
  'indore': 'Asia/Kolkata',
  'mathura': 'Asia/Kolkata',
  'surat': 'Asia/Kolkata',
  'nagpur': 'Asia/Kolkata',
  'chandigarh': 'Asia/Kolkata',
  'guwahati': 'Asia/Kolkata',
  'kochi': 'Asia/Kolkata',

  // Nepal (45-min offset UTC+5:45)
  'kathmandu': 'Asia/Kathmandu',
  'pokhara': 'Asia/Kathmandu',

  // International Cities
  'london': 'Europe/London',
  'new york': 'America/New_York',
  'toronto': 'America/Toronto',
  'san francisco': 'America/Los_Angeles',
  'los angeles': 'America/Los_Angeles',
  'chicago': 'America/Chicago',
  'dubai': 'Asia/Dubai',
  'singapore': 'Asia/Singapore',
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Melbourne',
  'tokyo': 'Asia/Tokyo',
  'paris': 'Europe/Paris',
  'berlin': 'Europe/Berlin',

  // Country-level Fallbacks
  'nepal': 'Asia/Kathmandu',
  'india': 'Asia/Kolkata',
  'united kingdom': 'Europe/London',
  'uk': 'Europe/London',
  'united states': 'America/New_York',
  'usa': 'America/New_York',
  'canada': 'America/Toronto',
  'united arab emirates': 'Asia/Dubai',
  'uae': 'Asia/Dubai',
  'australia': 'Australia/Sydney',
  'japan': 'Asia/Tokyo',
  'france': 'Europe/Paris',
  'germany': 'Europe/Berlin'
};

export function isValidIanaTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function resolveIanaTimezone(location: LocationCoordinates): string {
  if (location.ianaTimezone && isValidIanaTimezone(location.ianaTimezone)) {
    return location.ianaTimezone;
  }

  const nameKey = (location.name || '').toLowerCase().trim();
  if (CITY_TIMEZONE_MAP[nameKey] && isValidIanaTimezone(CITY_TIMEZONE_MAP[nameKey])) {
    return CITY_TIMEZONE_MAP[nameKey];
  }

  const cleanName = nameKey.replace(/\s*\([^)]*\)/g, '').trim();
  if (CITY_TIMEZONE_MAP[cleanName] && isValidIanaTimezone(CITY_TIMEZONE_MAP[cleanName])) {
    return CITY_TIMEZONE_MAP[cleanName];
  }

  const countryKey = (location.country || '').toLowerCase().trim();
  if (CITY_TIMEZONE_MAP[countryKey] && isValidIanaTimezone(CITY_TIMEZONE_MAP[countryKey])) {
    return CITY_TIMEZONE_MAP[countryKey];
  }

  const regionKey = (location.regionName || '').toLowerCase().trim();
  if (CITY_TIMEZONE_MAP[regionKey] && isValidIanaTimezone(CITY_TIMEZONE_MAP[regionKey])) {
    return CITY_TIMEZONE_MAP[regionKey];
  }

  return 'Asia/Kolkata';
}

export function getObserverWallClockInfo(date: Date, ianaTimezone: string, tzOffsetHours: number) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    let h = 0, m = 0, s = 0;
    for (const p of parts) {
      if (p.type === 'hour') h = parseInt(p.value, 10);
      if (p.type === 'minute') m = parseInt(p.value, 10);
      if (p.type === 'second') s = parseInt(p.value, 10);
    }
    if (h === 24) h = 0;
    return {
      hours: h,
      minutes: m,
      seconds: s,
      totalMinutes: h * 60 + m + s / 60,
      totalSeconds: h * 3600 + m * 60 + s
    };
  } catch {
    const utcMs = date.getTime();
    const localMs = utcMs + tzOffsetHours * 3600000;
    const d = new Date(localMs);
    const h = d.getUTCHours();
    const m = d.getUTCMinutes();
    const s = d.getUTCSeconds();
    return {
      hours: h,
      minutes: m,
      seconds: s,
      totalMinutes: h * 60 + m + s / 60,
      totalSeconds: h * 3600 + m * 60 + s
    };
  }
}

export interface ObserverState {
  lat: number;
  lng: number;
  city: string;
  timezone: string;
  tzOffset: number;
  elevation: number;
  country: string;
  regionName: string;
  formattedTzOffset: string;
}

export interface SolarHorizonState {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  dinamanSeconds: number;
  ratrimanSeconds: number;
  sunriseFormatted: string;
  sunsetFormatted: string;
  dayLengthMinutes: number;
  nightLengthMinutes: number;
}

export interface TithiDetailsState {
  udayaTithi: {
    index: number;
    name: string;
    pureName: string;
    paksha: 'Shukla' | 'Krishna';
    deity: string;
    endTime: string;
    endDate?: Date | null;
  };
  currentTithi: {
    index: number;
    name: string;
    paksha: 'Shukla' | 'Krishna';
    percentageElapsed: number;
    endTime: string;
  };
  amantaMasa: string;
  purnimantaMasa: string;
  masaDisplay: string;
  pahar: string;
  dayOfWeekName: string;
  isVriddhi: boolean;
  isKshaya: boolean;
  nextTithiName: string;
  newTithiStartTime: string;
  newTithiObservedWhen: string;
  currentTithiEndTime: string;
  isPreSunrise: boolean;
}

export interface ActiveMuhuratState {
  currentMuhurat: Active30MuhuratResult | null;
  currentChoghadiya: ChoghadiyaSlot | null;
  timeRemainingSeconds: number;
  remainingString: string;
  quality: 'HIGHLY AUSPICIOUS' | 'AUSPICIOUS' | 'MODERATE' | 'INAUSPICIOUS';
  nature: string;
  progressPercent: number;
  title: string;
  deity: string;
  activity: string;
  windowString: string;
  isDaytime: boolean;
}

export interface ObservancesState {
  festivalToday: PanchangData['todayFestival'];
  panchak: {
    isActive: boolean;
    panchak: PanchakEntry | null;
    nextPanchak?: PanchakEntry;
    displayTitle: string;
    displaySubtitle: string;
    badgeText: string;
    badgeColor: string;
  };
  upcomingObservance: PanchangData['upcomingFestival'];
  holidayDetails: HolidayAndEclipseDetails;
}

export interface PanchangState {
  observer: ObserverState;
  selectedDate: Date;
  liveTime: Date;
  targetInstant: Date;
  isLiveMode: boolean;
  isMounted: boolean;
  displayTime: string;
  displayDate: string;
  solarHorizon: SolarHorizonState;
  tithiDetails: TithiDetailsState;
  activeMuhurat: ActiveMuhuratState;
  observances: ObservancesState;
  panchang: PanchangData;
  tithiResolution: DailyTithiResolution;
  // State Mutators & Controls
  setObserver: (location: LocationCoordinates) => void;
  setSelectedDate: (date: Date) => void;
  prevDay: () => void;
  nextDay: () => void;
  setDateFromInput: (dateStr: string) => void;
  resetToLive: () => void;
  setLiveMode: (isLive: boolean) => void;
  forceSync: () => void;
}

export interface UsePanchangOptions {
  initialLocation?: LocationCoordinates;
  initialDate?: Date;
  isLiveMode?: boolean;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = [
  'Ravivara (रविवार)',
  'Somavara (सोमवार)',
  'Mangalavara (मंगलवार)',
  'Budhavara (बुधवार)',
  'Guruvara (गुरुवार)',
  'Shukravara (शुक्रवार)',
  'Shanivara (शनिवार)'
];

/**
 * Single Source of Truth (SSOT) Cascading Panchang Hook
 * 
 * Guarantees strict downward cascade:
 * [ GPS Observer Coordinates (lat, lng, elevation, timezone) ]
 *   ▼
 * [ Solar Horizon Engine (Exact Local Topocentric Sunrise & Sunset) ]
 *   ▼
 * [ Card 1: Sacred Time (Gregorian + Civil) ] & [ Card 2: Udaya Tithi & Masa ]
 *   ▼
 * [ Card 3: Active Muhurat & Timing (Dinaman/Ratriman Partitioning & Live Window Matching) ]
 *   ▼
 * [ Cards 4, 5, 6: Festival, Panchak Radar, Upcoming Observance ]
 */
export function usePanchang(options: UsePanchangOptions = {}): PanchangState {
  const [observerLocation, setObserverLocation] = useState<LocationCoordinates>(
    () => options.initialLocation || PRESET_LOCATIONS[0]
  );
  const [isLiveMode, setIsLiveModeState] = useState<boolean>(
    () => options.isLiveMode !== undefined ? options.isLiveMode : true
  );
  const [selectedDate, setSelectedDateState] = useState<Date>(
    () => options.initialDate || new Date()
  );

  // Auto-sync reactive engine with dual-trigger sunrise & tithi conclusion, visibility listeners, drift mitigation
  const {
    currentTime: liveTime,
    panchang,
    tithiResolution,
    isMounted,
    forceSync
  } = usePanchangAutoSync({
    location: observerLocation,
    isLiveMode,
    customDate: selectedDate,
    elevationMeters: observerLocation.elevation || 0
  });

  // Effective Target Instant (live clock or user-selected calendar inspection date)
  const targetInstant = isLiveMode ? liveTime : selectedDate;

  // IANA timezone & numeric offset resolution
  const ianaTz = useMemo(() => resolveIanaTimezone(observerLocation), [observerLocation]);
  const tzOffset = useMemo(
    () => resolveTimezoneOffset(targetInstant, { ...observerLocation, ianaTimezone: ianaTz }),
    [targetInstant, observerLocation, ianaTz]
  );

  // Formatted UTC Offset (e.g. UTC+5:30 or UTC-4:00)
  const formattedTzOffset = useMemo(() => {
    const sign = tzOffset >= 0 ? '+' : '-';
    const hours = Math.trunc(Math.abs(tzOffset));
    const mins = Math.round((Math.abs(tzOffset) % 1) * 60);
    return `UTC${sign}${hours}:${String(mins).padStart(2, '0')}`;
  }, [tzOffset]);

  // Observer State object
  const observer: ObserverState = useMemo(() => ({
    lat: observerLocation.latitude,
    lng: observerLocation.longitude,
    city: observerLocation.name,
    timezone: ianaTz,
    tzOffset,
    elevation: observerLocation.elevation || 0,
    country: observerLocation.country || 'India',
    regionName: observerLocation.regionName || 'Calcutta',
    formattedTzOffset
  }), [observerLocation, ianaTz, tzOffset, formattedTzOffset]);

  // Observer wall clock info (decouples from client machine's host OS timezone)
  const wallClock = useMemo(
    () => getObserverWallClockInfo(targetInstant, ianaTz, tzOffset),
    [targetInstant, ianaTz, tzOffset]
  );

  // ── Step 1: Solar Horizon Engine ──
  const solarHorizon: SolarHorizonState = useMemo(() => {
    const sunrise = panchang.sunriseDate;
    const sunset = panchang.sunsetDate;
    const nextSunrise = new Date(tithiResolution.nextSunrise);

    const dinamanSeconds = Math.max(0, Math.floor((sunset.getTime() - sunrise.getTime()) / 1000));
    const ratrimanSeconds = Math.max(0, Math.floor((nextSunrise.getTime() - sunset.getTime()) / 1000));
    const dayLengthMinutes = Math.max(0, Math.round((sunset.getTime() - sunrise.getTime()) / 60000));
    const nightLengthMinutes = Math.max(0, Math.round((nextSunrise.getTime() - sunset.getTime()) / 60000));

    return {
      sunrise,
      sunset,
      nextSunrise,
      dinamanSeconds,
      ratrimanSeconds,
      sunriseFormatted: panchang.sunrise,
      sunsetFormatted: panchang.sunset,
      dayLengthMinutes,
      nightLengthMinutes
    };
  }, [panchang, tithiResolution.nextSunrise]);

  // ── Step 2: Card 1 (Gregorian & Solar Anchor) Formatting ──
  const displayTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: isLiveMode ? '2-digit' : undefined,
        hour12: true,
        timeZone: ianaTz
      }).format(targetInstant);
    } catch {
      return panchang.timeFormatted;
    }
  }, [targetInstant, isLiveMode, ianaTz, panchang.timeFormatted]);

  const displayDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: ianaTz
      }).format(targetInstant);
    } catch {
      return panchang.dateString;
    }
  }, [targetInstant, ianaTz, panchang.dateString]);

  // ── Step 3: Card 2 (Vedic Day & Udaya Tithi) Synchronization ──
  const tithiDetails: TithiDetailsState = useMemo(() => {
    const isPreSun = Boolean(tithiResolution.isPreSunrise ?? panchang.isPreSunrise);
    const currentUdayaIndex = panchang.udayaTithi?.index || panchang.tithi.index || 1;
    const nextTithiIndex = (currentUdayaIndex % 30) + 1;
    const nextTithiObj = TITHIS[(nextTithiIndex - 1) % 30];
    const nextTithiName = nextTithiObj?.name || `Tithi ${nextTithiIndex}`;

    // Format new Tithi start date & time: "date • time AM/PM according to gregorian"
    const transitionUtc = panchang.udayaTithi?.endDate || panchang.instantaneousTithi?.endDate;
    let newTithiStartTime = panchang.udayaTithi?.endTime || panchang.tithi.endTime || 'At conclusion';
    if (transitionUtc) {
      const localMs = transitionUtc.getTime() + tzOffset * 3600000;
      const localD = new Date(localMs);
      const dateFormatted = `${localD.getUTCDate()} ${MONTHS_SHORT[localD.getUTCMonth()]} ${localD.getUTCFullYear()}`;
      const timeFormatted = formatUtcDateToLocalTime(transitionUtc, tzOffset);
      newTithiStartTime = `${dateFormatted} • ${timeFormatted}`;
    }
    const currentTithiEndTime = newTithiStartTime;

    // Dharmashastra observation day determination: "date • day/vara"
    let dayOffset = isPreSun ? 0 : 1;
    let anomalySuffix = '';
    if (tithiResolution.isVriddhi) {
      dayOffset = isPreSun ? 1 : 2;
      anomalySuffix = ' (Delayed: Vriddhi)';
    } else if (tithiResolution.isKshaya && tithiResolution.kshayaTithiDetails?.name === nextTithiName) {
      dayOffset = isPreSun ? 0 : 1;
      anomalySuffix = ' (Kshaya — Skipped at Sunrise)';
    }

    const obsDate = new Date(
      targetInstant.getFullYear(),
      targetInstant.getMonth(),
      targetInstant.getDate() + dayOffset,
      12, 0, 0
    );
    const obsDateFormatted = `${obsDate.getDate()} ${MONTHS_SHORT[obsDate.getMonth()]} ${obsDate.getFullYear()}`;
    const obsDayVara = DAY_NAMES[obsDate.getDay()];
    const newTithiObservedWhen = `${obsDateFormatted} • ${obsDayVara}${anomalySuffix}`;

    return {
      udayaTithi: {
        index: panchang.udayaTithi?.index || panchang.tithi.index,
        name: panchang.udayaTithi?.name || panchang.tithi.name,
        pureName: panchang.udayaTithi?.pureName || panchang.tithi.pureName,
        paksha: panchang.udayaTithi?.paksha || panchang.tithi.paksha,
        deity: panchang.udayaTithi?.deity || panchang.tithi.deity,
        endTime: panchang.udayaTithi?.endTime || panchang.tithi.endTime,
        endDate: panchang.udayaTithi?.endDate || null
      },
      currentTithi: {
        index: panchang.instantaneousTithi?.index || panchang.tithi.index,
        name: panchang.instantaneousTithi?.name || panchang.tithi.name,
        paksha: panchang.instantaneousTithi?.paksha || panchang.tithi.paksha,
        percentageElapsed: panchang.instantaneousTithi?.completionPercent || 50,
        endTime: panchang.instantaneousTithi?.endTime || 'Continuous'
      },
      amantaMasa: panchang.hinduMonth,
      purnimantaMasa: panchang.hinduMonth,
      masaDisplay: panchang.masaDisplay,
      pahar: panchang.paharCapsuleText,
      dayOfWeekName: panchang.dayOfWeekName,
      isVriddhi: Boolean(tithiResolution.isVriddhi),
      isKshaya: Boolean(tithiResolution.isKshaya),
      nextTithiName,
      newTithiStartTime,
      newTithiObservedWhen,
      currentTithiEndTime,
      isPreSunrise: isPreSun
    };
  }, [panchang, tithiResolution, tzOffset, targetInstant]);

  // ── Step 4: Card 3 (Active Muhurat & Timing Engine) Synchronization ──
  const activeMuhurat: ActiveMuhuratState = useMemo(() => {
    // Evaluate 30-Muhurat matrix using observer wall-clock minutes
    const current30 = calculateActive30Muhurat(
      panchang.sunrise,
      panchang.sunset,
      targetInstant,
      wallClock.totalMinutes
    );

    const activeChog = panchang.currentChoghadiya;

    // Quality determination
    let quality: ActiveMuhuratState['quality'] = 'AUSPICIOUS';
    if (current30?.nature === 'Highly Auspicious') {
      quality = 'HIGHLY AUSPICIOUS';
    } else if (current30?.nature === 'Auspicious') {
      quality = 'AUSPICIOUS';
    } else if (current30?.nature === 'Moderate') {
      quality = 'MODERATE';
    } else if (current30?.nature === 'Inauspicious') {
      quality = 'INAUSPICIOUS';
    } else if (activeChog?.quality === 'Inauspicious') {
      quality = 'INAUSPICIOUS';
    } else if (activeChog?.quality === 'Auspicious') {
      quality = 'AUSPICIOUS';
    }

    // Mathematical countdown locking: seconds remaining until active window ends
    let timeRemainingSeconds = 0;
    let remainingString = '00m 00s';
    if (current30?.remainingString) {
      remainingString = current30.remainingString;
      const match = current30.remainingString.match(/(\d+)m\s*(\d+)s/);
      if (match) {
        timeRemainingSeconds = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      }
    } else if (activeChog?.remainingString) {
      remainingString = activeChog.remainingString;
      const match = activeChog.remainingString.match(/(\d+)m\s*(\d+)s/);
      if (match) {
        timeRemainingSeconds = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      }
    }

    // Active Muhurat window elapsed percentage (0 - 100%)
    let progressPercent = 50;
    if (current30?.durationMins && current30.durationMins > 0) {
      const totalSec = current30.durationMins * 60;
      const elapsedSec = Math.max(0, totalSec - timeRemainingSeconds);
      progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSec / totalSec) * 100)));
    }

    const title = current30
      ? `Muhurat #${current30.index}: ${current30.name}`
      : (activeChog?.displayName || 'Abhijit Muhurat');

    const windowString = current30
      ? `${current30.startTime} — ${current30.endTime}`
      : (activeChog?.windowString || '06:00 AM — 07:30 AM');

    const deity = current30?.deity || 'Universal Narayana';
    const activity = current30?.activity || (
      quality === 'HIGHLY AUSPICIOUS' || quality === 'AUSPICIOUS'
        ? 'Auspicious: Favorable for Sacred Actions'
        : 'Moderate: Routine Duties'
    );

    return {
      currentMuhurat: current30,
      currentChoghadiya: activeChog,
      timeRemainingSeconds,
      remainingString,
      quality,
      nature: current30?.nature || quality,
      progressPercent,
      title,
      deity,
      activity,
      windowString,
      isDaytime: current30?.period === 'Diurnal (Day)'
    };
  }, [panchang.sunrise, panchang.sunset, panchang.currentChoghadiya, targetInstant, wallClock.totalMinutes]);

  // ── Step 5: Cards 4, 5, 6 (Bottom Row) Synchronization ──
  const observances: ObservancesState = useMemo(() => {
    const festivalToday = panchang.todayFestival;
    const panchak = getActivePanchakStatus(targetInstant, ianaTz);
    const upcomingObservance = panchang.upcomingFestival;
    const holidayDetails = getHolidayAndEclipseDetails(targetInstant, {
      ...observerLocation,
      ianaTimezone: ianaTz,
      timezone: tzOffset
    });

    return {
      festivalToday,
      panchak,
      upcomingObservance,
      holidayDetails
    };
  }, [panchang.todayFestival, panchang.upcomingFestival, targetInstant, ianaTz, observerLocation, tzOffset]);

  // Actions
  const setObserver = useCallback((loc: LocationCoordinates) => {
    setObserverLocation(loc);
  }, []);

  const setSelectedDate = useCallback((d: Date) => {
    setIsLiveModeState(false);
    setSelectedDateState(d);
  }, []);

  const prevDay = useCallback(() => {
    setIsLiveModeState(false);
    setSelectedDateState((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  }, []);

  const nextDay = useCallback(() => {
    setIsLiveModeState(false);
    setSelectedDateState((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return next;
    });
  }, []);

  const setDateFromInput = useCallback((dateStr: string) => {
    if (!dateStr) return;
    const [y, m, d] = dateStr.split('-').map(Number);
    const newDate = new Date(y, m - 1, d, 6, 0, 0);
    setIsLiveModeState(false);
    setSelectedDateState(newDate);
  }, []);

  const resetToLive = useCallback(() => {
    setIsLiveModeState(true);
    const now = new Date();
    setSelectedDateState(now);
    forceSync();
  }, [forceSync]);

  const setLiveMode = useCallback((live: boolean) => {
    setIsLiveModeState(live);
    if (live) {
      const now = new Date();
      setSelectedDateState(now);
      forceSync();
    }
  }, [forceSync]);

  return {
    observer,
    selectedDate,
    liveTime,
    targetInstant,
    isLiveMode,
    isMounted,
    displayTime,
    displayDate,
    solarHorizon,
    tithiDetails,
    activeMuhurat,
    observances,
    panchang,
    tithiResolution,
    setObserver,
    setSelectedDate,
    prevDay,
    nextDay,
    setDateFromInput,
    resetToLive,
    setLiveMode,
    forceSync
  };
}
