"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, MapPin, ChevronDown, X,
  Clock, Sun, Compass, Hourglass, Calendar, Moon,
  CheckCircle2, ChevronRight, ChevronLeft, Star, Flame, Layers,
  ShieldAlert, ShieldCheck, ArrowUpRight, Bell, Code2, RotateCcw
} from 'lucide-react';
import { 
  calculatePanchang, 
  PRESET_LOCATIONS, 
  LocationCoordinates, 
  PanchangData,
  TITHIS,
  formatUtcDateToLocalTime
} from '../../src/lib/vedic-astronomy';
import { usePanchangAutoSync } from '../../src/hooks/usePanchangAutoSync';
import { usePanchang } from '../../src/hooks/usePanchang';
import { CITIES } from '../../src/lib/cities';
import { getActivePanchakStatus, calculateActive30Muhurat } from '../../src/lib/dharmashastra-rules';
import { TithiMonthModal } from './modals/TithiMonthModal';
import { DailyMuhuratModal } from './modals/DailyMuhuratModal';
import { TodayFestivalModal } from './modals/TodayFestivalModal';
import { PanchakModal } from './modals/PanchakModal';
import { UpcomingFestivalsModal } from './modals/UpcomingFestivalsModal';
import { NotificationSettingsModal } from './modals/NotificationSettingsModal';
import { NotificationPermissionBanner } from './NotificationPermissionBanner';
import { WhatsAppIcon } from './WhatsAppShareButton';
import { EmbedWidgetModal } from '../../src/components/EmbedWidgetModal';
import { sharePanchang, buildShareDataFromPanchang } from '../../src/lib/utils/sharePanchang';
import {
  getSavedLocationState,
  requestGpsLocation,
  checkHasMovedSignificantly,
  persistLocationState
} from '../../src/lib/location-service';
import { formatLastUpdatedTime } from '../../src/lib/panchang-cache';
import { getHolidayAndEclipseDetails } from '../../src/lib/eclipses-and-holidays';


const CITY_LOCATIONS: LocationCoordinates[] = CITIES.map(c => ({
  name: `${c.name}`,
  country: c.country,
  latitude: c.latitude,
  longitude: c.longitude,
  timezone: c.timezone,
  ianaTimezone: c.ianaTimezone,
  regionName: c.state
}));

// Comprehensive timezone mapping for city and country lookup fallbacks
const CITY_TIMEZONE_MAP: Record<string, string> = {
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

function isValidIanaTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function resolveIanaTimezone(location: LocationCoordinates): string | undefined {
  if (location.ianaTimezone && isValidIanaTimezone(location.ianaTimezone)) {
    return location.ianaTimezone;
  }

  const nameKey = (location.name || '').toLowerCase().trim();
  if (CITY_TIMEZONE_MAP[nameKey] && isValidIanaTimezone(CITY_TIMEZONE_MAP[nameKey])) {
    return CITY_TIMEZONE_MAP[nameKey];
  }

  // Strip parentheses e.g. "Varanasi (Kashi)" -> "varanasi"
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

  return undefined;
}

function formatTimeForLocation(
  date: Date,
  timeZone: string | undefined,
  isLive: boolean,
  fallbackLiveTime: string,
  selectedDateFallback: Date
): string {
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: isLive ? '2-digit' : undefined,
        hour12: true,
        timeZone
      }).format(date);
    } catch {
      // Fall through to graceful fallback
    }
  }

  if (isLive) {
    return fallbackLiveTime || date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }
  return selectedDateFallback.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || '06:00 AM';
}

function formatDateForLocation(
  date: Date,
  timeZone: string | undefined,
  fallbackDateString: string
): string {
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone
      }).format(date);
    } catch {
      // Fall through to graceful fallback
    }
  }

  return fallbackDateString || date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const ALL_LOCATIONS: LocationCoordinates[] = [
  ...PRESET_LOCATIONS,
  {
    name: 'Kathmandu',
    country: 'Nepal',
    latitude: 27.7172,
    longitude: 85.3240,
    timezone: 5.75,
    ianaTimezone: 'Asia/Kathmandu',
    regionName: 'Bagmati'
  },
  ...CITY_LOCATIONS.filter(cl => !PRESET_LOCATIONS.some(pl => pl.name.toLowerCase().startsWith(cl.name.toLowerCase())) && cl.name.toLowerCase() !== 'kathmandu')
];

// Localized Masa calculation according to region/GPS latitude (Task 5)
function getLocalizedMasaString(
  location: LocationCoordinates,
  amantaMonth: string,
  purnimantaMonth: string,
  vikramSamvat: number,
  shakaSamvat: number
): string {
  const region = (location.regionName || '').toLowerCase();
  const city = (location.name || '').toLowerCase();

  // Gujarat and Maharashtra follow Amanta tradition
  const isGujaratOrMaharashtra = 
    region.includes('gujarat') || region.includes('maharashtra') ||
    city.includes('mumbai') || city.includes('pune') || 
    city.includes('nagpur') || city.includes('ahmedabad') || 
    city.includes('surat') || city.includes('vadodara') ||
    city.includes('rajkot');

  // North India: Latitude >= 21.5°N, excluding Gujarat/Maharashtra
  const isNorthIndia = location.latitude >= 21.5 && !isGujaratOrMaharashtra;

  const cleanAmanta = (amantaMonth || '').split('(')[0].trim() || 'Masa';
  const cleanPurnimanta = (purnimantaMonth || '').split('(')[0].trim() || 'Masa';

  if (isNorthIndia) {
    return `${cleanPurnimanta} (Purnimanta) · VS ${vikramSamvat}`;
  } else {
    return `${cleanAmanta} (Amanta) · Shaka ${shakaSamvat}`;
  }
}

// Shortened Tithi string output (e.g. "Shukla 1 (Pratipada)") (Task 5)
function formatShortenedTithi(tithiIndex: number, fallbackName?: string): string {
  const tithiObj = TITHIS[(tithiIndex - 1) % 30];
  if (!tithiObj) return fallbackName || 'Tithi';

  const paksha = tithiObj.paksha;
  const pakshaDay = ((tithiIndex - 1) % 15) + 1;
  const pureName = tithiObj.pureName;

  return `${paksha} ${pakshaDay} (${pureName})`;
}

export function HinduPanchangWidget({ initialLocation }: { initialLocation?: LocationCoordinates }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>(
    initialLocation || PRESET_LOCATIONS[0]
  );
  type WidgetTabType = 'panchang' | 'choghadiya' | 'muhurat' | 'astrometry';

  const [locationSource, setLocationSource] = useState<'gps' | 'dropdown' | 'fallback'>('fallback');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const [isGpsDetecting, setIsGpsDetecting] = useState<boolean>(false);

  // Single Source of Truth (SSOT) Cascading Panchang Hook
  const {
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
  } = usePanchang({
    initialLocation: selectedLocation,
    isLiveMode: true
  });

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setObserver(initialLocation);
      return;
    }

    const saved = getSavedLocationState();
    if (saved?.location) {
      setSelectedLocation(saved.location);
      setObserver(saved.location);
      setLocationSource(saved.source);
    }

    // Re-check location on app open if user moved > 50 km or changed timezone
    if (saved?.source === 'gps' && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const moved = checkHasMovedSignificantly(
            saved.location,
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (moved) {
            requestGpsLocation().then((res) => {
              if (res.success && res.location) {
                setSelectedLocation(res.location);
                setObserver(res.location);
                setLocationSource('gps');
              }
            });
          }
        },
        () => {},
        { timeout: 8000, maximumAge: 300000 }
      );
    }

    const interval = setInterval(() => {
      const raw = localStorage.getItem('panchang_last_updated');
      if (raw) {
        setLastUpdatedTime(formatLastUpdatedTime(Number(raw)));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [initialLocation, setObserver]);

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<WidgetTabType>('panchang');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Modal states for click interactions
  const [isTithiModalOpen, setIsTithiModalOpen] = useState<boolean>(false);
  const [isMuhuratModalOpen, setIsMuhuratModalOpen] = useState<boolean>(false);
  const [isTodayFestivalModalOpen, setIsTodayFestivalModalOpen] = useState<boolean>(false);
  const [isPanchakModalOpen, setIsPanchakModalOpen] = useState<boolean>(false);
  const [isUpcomingFestivalsModalOpen, setIsUpcomingFestivalsModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // SSOT reactive bindings for Cards 1 through 6
  const panchakStatus = observances.panchak;
  const activeTimezone = observer.timezone;
  const activeVedicMuhurat = activeMuhurat.currentMuhurat;
  const holidayDetails = observances.holidayDetails;
  const formattedTzOffset = observer.formattedTzOffset;
  const nextTithiName = tithiDetails.nextTithiName;
  const newTithiStartTime = tithiDetails.newTithiStartTime;
  const currentTithiEndTime = tithiDetails.currentTithiEndTime;
  const newTithiObservedWhen = tithiDetails.newTithiObservedWhen;
  const muhuratProgress = activeMuhurat.progressPercent;
  const isPreSunrise = tithiDetails.isPreSunrise;

  // Localized Masa & Shortened Tithi (Task 5)
  const localizedMasa = getLocalizedMasaString(
    selectedLocation,
    panchang.amantaMonth || panchang.masaDisplay,
    panchang.purnimantaMonth || panchang.masaDisplay,
    panchang.vikramSamvat,
    panchang.shakaSamvat
  );

  const shortenedTithi = formatShortenedTithi(
    panchang.udayaTithi?.index || panchang.tithi.index,
    panchang.udayaTithi?.name || panchang.tithi.name
  );

  const nextTithiIndex = (((panchang.udayaTithi?.index || panchang.tithi.index || 1) % 30) + 1);
  const shortNextTithi = formatShortenedTithi(nextTithiIndex, nextTithiName);

  // Actions wired directly to SSOT
  const handlePrevDay = prevDay;
  const handleNextDay = nextDay;
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFromInput(e.target.value);
  };
  const handleResetToLive = resetToLive;

  // Click-outside handler to close dropdown menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  if (isDismissed) {
    return (
      <div className="text-center py-6">
        <button
          onClick={() => setIsDismissed(false)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/30 text-amber-400 text-sm font-semibold transition-all shadow-xl font-outfit"
        >
          <Sparkles size={16} /> Open Vedic Live Panchang Widget
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-2.5 sm:p-5 text-left transition-all duration-300 font-sans relative overflow-hidden">
        {/* Subtle celestial observatory ambient background lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-0" />
        
        {/* ── Compact Consolidated Header Row (Task 1: GPS, City, Date Controls, Live Clock) ── */}
        {/* ── Compact Consolidated Header Row (City, GPS, Date Controls) ── */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-slate-900/60 rounded-2xl border border-white/10 text-xs relative z-10 mb-2">
          {/* 1. Location Dropdown Pill */}
          <div className="relative inline-flex items-center min-w-0">
            <MapPin size={11} className="absolute left-2.5 text-amber-400 pointer-events-none" />
            <select
              aria-label="Select City Location"
              value={selectedLocation.name}
              onChange={(e) => {
                const loc = ALL_LOCATIONS.find(l => l.name === e.target.value);
                if (loc) {
                  const resolvedTz = resolveIanaTimezone(loc);
                  const updated = resolvedTz && resolvedTz !== loc.ianaTimezone ? { ...loc, ianaTimezone: resolvedTz } : loc;
                  setSelectedLocation(updated);
                  setObserver(updated);
                  setLocationSource('dropdown');
                  persistLocationState(updated, 'dropdown');
                }
              }}
              className="pl-6 pr-5 py-1 bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/30 rounded-xl text-[11px] sm:text-xs font-medium text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-sm max-w-[130px] sm:max-w-[175px] truncate"
            >
              {ALL_LOCATIONS.map((loc) => (
                <option key={`${loc.name}-${loc.country}`} value={loc.name} className="bg-slate-900 text-white">
                  {loc.name} ({loc.country})
                </option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2 text-slate-400 pointer-events-none" />
          </div>

          {/* 2. GPS Detection Button */}
          <button
            onClick={async () => {
              setIsGpsDetecting(true);
              try {
                const res = await requestGpsLocation();
                if (res.success && res.location) {
                  setSelectedLocation(res.location);
                  setObserver(res.location);
                  setLocationSource('gps');
                }
              } finally {
                setIsGpsDetecting(false);
              }
            }}
            title="Detect your exact coordinates via GPS"
            aria-label="Detect GPS Location"
            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-sm font-sans shrink-0 ${
              locationSource === 'gps'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-slate-900/90 hover:bg-slate-800/90 text-amber-300 hover:text-white border border-white/10 hover:border-amber-500/30'
            }`}
          >
            <MapPin size={11} className={isGpsDetecting ? 'animate-spin text-amber-400' : (locationSource === 'gps' ? 'text-emerald-400' : 'text-amber-400')} />
            <span>{isGpsDetecting ? 'Detecting...' : (locationSource === 'gps' ? 'GPS Active' : 'Use GPS')}</span>
          </button>

          {/* 3. Date Controls (Positioned directly adjacent to GPS Active) */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            {/* Prev Day Button */}
            <button
              onClick={handlePrevDay}
              className="p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/30 text-slate-300 hover:text-white transition-colors flex items-center gap-0.5 cursor-pointer font-sans text-[11px] sm:text-xs shrink-0"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft size={13} />
              <span className="hidden xs:inline">Prev</span>
            </button>

            {/* Native Date Input Picker ("Date Dropbox") */}
            <div className="relative inline-flex items-center min-w-0">
              <input
                type="date"
                value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                onChange={handleDateChange}
                aria-label="Pick Any Date and Year"
                className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/30 rounded-xl text-[11px] sm:text-xs font-bold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm font-grotesk"
              />
            </div>

            {/* Next Day Button */}
            <button
              onClick={handleNextDay}
              className="p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/30 text-slate-300 hover:text-white transition-colors flex items-center gap-0.5 cursor-pointer font-sans text-[11px] sm:text-xs shrink-0"
              title="Next Day"
              aria-label="Next Day"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* 4. Reset to Today (Shown ONLY when non-today date selected; no redundant live blink) */}
          {!isLiveMode && (
            <button
              onClick={handleResetToLive}
              className="px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold font-outfit bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 border border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer shrink-0 ml-auto sm:ml-0"
              title="Reset to Today"
              aria-label="Reset to Today"
            >
              <RotateCcw size={11} />
              <span>Today</span>
            </button>
          )}
        </div>

        {/* ── Main Top 3-Card Row (Task 4: Compact Above-The-Fold Layout) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 pt-2.5 relative z-10">
          
          {/* COLUMN 1: GREGORIAN LIVE CLOCK CARD */}
          <div 
            onClick={() => setIsTithiModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsTithiModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isTithiModalOpen}
            title="Click to open Full Monthly Calendar & Almanac"
            aria-label="Open Full Monthly Calendar & Almanac"
            className="p-3 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 flex flex-col justify-between shadow-xl cursor-pointer transition-all duration-300 group relative active:scale-[0.99] min-w-0"
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] sm:text-[11px] font-bold font-outfit tracking-wider uppercase group-hover:text-amber-300 transition-colors min-w-0">
                  <Clock size={12} className="text-amber-400 shrink-0" />
                  <span className="truncate">{isLiveMode ? 'LIVE CLOCK' : 'SELECTED DATE'}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold font-outfit bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                    <Calendar size={9} />
                    <span>Almanac</span>
                  </span>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Metallic gradient tabular-nums clock */}
              <div 
                className="text-2xl sm:text-3xl font-extrabold font-grotesk font-mono tracking-tight my-1 bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tabular-nums select-all"
                aria-label={`Current time: ${displayTime}`}
              >
                <span aria-hidden="true" suppressHydrationWarning>
                  {displayTime}
                </span>
              </div>

              <div className="text-slate-300 text-xs font-medium mb-1.5 flex items-center justify-between font-sans gap-1 min-w-0">
                <span className="truncate min-w-0">{displayDate}</span>
                <span className="text-[10px] text-amber-300/90 font-medium font-sans shrink-0">
                  {selectedLocation.regionName}
                </span>
              </div>

              {/* ── HOLIDAYS & ECLIPSE STATUS SECTION ── */}
              <div className="space-y-1 mb-1.5 min-w-0">
                
                {/* 1. Today's Holiday Status */}
                <div className={`p-1.5 rounded-xl border text-[11px] flex items-center justify-between gap-1.5 transition-all min-w-0 ${
                  holidayDetails.todayHoliday.isHoliday
                    ? 'bg-amber-950/60 border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-950/60 border-white/10 text-slate-300'
                }`}>
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-xs select-none shrink-0">{holidayDetails.todayHoliday.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-white break-words whitespace-normal font-sans">
                        {holidayDetails.todayHoliday.title}
                      </div>
                      {holidayDetails.todayHoliday.subtitle && (
                        <div className="text-[9px] text-slate-400 break-words whitespace-normal font-sans">
                          {holidayDetails.todayHoliday.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-1 py-0.5 rounded text-[8px] font-extrabold shrink-0 border font-outfit ${
                    holidayDetails.todayHoliday.isHoliday
                      ? 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}>
                    {holidayDetails.todayHoliday.badge}
                  </span>
                </div>

                {/* 2. Upcoming Holiday */}
                {holidayDetails.upcomingHoliday && (
                  <div className="px-2 py-1 rounded-xl bg-slate-950/60 border border-white/10 text-[10px] flex items-center justify-between gap-1.5 min-w-0">
                    <div className="flex items-center gap-1 min-w-0 flex-1 text-slate-300">
                      <span className="text-amber-400 select-none shrink-0">{holidayDetails.upcomingHoliday.icon}</span>
                      <span className="text-slate-400 text-[9px] shrink-0 font-sans">Next:</span>
                      <strong className="text-white truncate font-semibold font-sans min-w-0">{holidayDetails.upcomingHoliday.title}</strong>
                    </div>
                    <span className="text-[9px] text-amber-300 font-grotesk font-mono font-bold whitespace-nowrap bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 shrink-0 tabular-nums">
                      {holidayDetails.upcomingHoliday.daysText}
                    </span>
                  </div>
                )}

                {/* 3. Astronomical Eclipse Status */}
                <div className={`px-2 py-1 rounded-xl border text-[10px] flex items-center justify-between gap-1.5 min-w-0 ${
                  holidayDetails.eclipseInfo.hasEclipseToday
                    ? 'bg-rose-950/60 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse'
                    : 'bg-slate-950/40 border-white/5 text-slate-400'
                }`}>
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 font-sans">
                    <span className="shrink-0">{holidayDetails.eclipseInfo.hasEclipseToday ? '🌑' : '✨'}</span>
                    {holidayDetails.eclipseInfo.hasEclipseToday ? (
                      <span className="font-extrabold text-rose-300 break-words whitespace-normal text-[10px]">
                        {holidayDetails.eclipseInfo.activeEclipse?.nameHindi || 'Eclipse Today'} • Sutak
                      </span>
                    ) : (
                      <span className="break-words whitespace-normal text-[10px] text-slate-300">
                        No Eclipse Today
                        {holidayDetails.eclipseInfo.nextEclipse && (
                          <span className="text-slate-400 ml-1">
                            • Next: {holidayDetails.eclipseInfo.nextEclipse.nameHindi}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {holidayDetails.eclipseInfo.nextEclipse && !holidayDetails.eclipseInfo.hasEclipseToday && (
                    <span className="text-[9px] text-slate-400 font-grotesk font-mono tabular-nums whitespace-nowrap shrink-0">
                      {holidayDetails.eclipseInfo.nextEclipse.daysText}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Cohesive sunrise/sunset pill */}
            <div className="flex items-center justify-between gap-2 pt-2 text-xs border-t border-white/10 mt-auto min-w-0">
              <div className="px-2 py-1 rounded-full bg-slate-950/60 border border-white/10 flex items-center gap-2 text-[10px] font-medium text-slate-200 font-grotesk tabular-nums">
                <span className="flex items-center gap-1">
                  <Sun size={11} className="text-amber-400 shrink-0" />
                  <span>{panchang.sunrise}</span>
                </span>
                <span className="text-slate-600 select-none">•</span>
                <span className="flex items-center gap-1">
                  <Moon size={11} className="text-indigo-400 shrink-0" />
                  <span>{panchang.sunset}</span>
                </span>
              </div>
              <div className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold font-outfit text-amber-300 group-hover:bg-amber-500/20 group-hover:border-amber-400/50 transition-all flex items-center gap-0.5 shrink-0">
                <Calendar size={9} />
                <span>Details</span>
                <ArrowUpRight size={9} />
              </div>
            </div>
          </div>

          {/* COLUMN 2: VEDIC PANCHANG CARD */}
          <div 
            onClick={() => setIsTithiModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsTithiModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isTithiModalOpen}
            title="Click to open Monthly Calendar of Tithis, Ekadashis & Dharmashastra Rules"
            aria-label="Open Vedic Monthly Calendar and Udaya Tithi Almanac"
            className="p-3 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-amber-500/35 hover:border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.1)] hover:shadow-[0_0_35px_rgba(245,158,11,0.18)] flex flex-col justify-between cursor-pointer transition-all duration-300 group relative active:scale-[0.99] font-sans overflow-hidden min-w-0"
          >
            {/* Subtle ambient radial backdrop glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/12 via-purple-950/20 to-transparent" />

            <div className="space-y-2 relative z-10 min-w-0">
              {/* 1: Day of Week & Today Badge */}
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0">
                    <Sun size={13} />
                  </div>
                  <span className="font-serif font-devanagari text-amber-300 text-sm font-semibold tracking-tight truncate">
                    {panchang.dayOfWeekName}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold font-outfit uppercase tracking-widest bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 shrink-0">
                  TODAY
                </span>
              </div>

              {/* 2: Localized Masa Pill (Task 5: North Purnimanta vs South/West Amanta) */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-0">
                <span className="text-[9px] font-extrabold font-outfit text-amber-400/90 tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                  MASA
                </span>
                <span className="font-serif font-devanagari font-medium text-amber-100 text-xs truncate break-words whitespace-normal min-w-0">
                  {localizedMasa}
                </span>
              </div>

              {/* 3: Today's Tithi Header & Badge */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <Sparkles size={11} className="text-amber-400/80 shrink-0" />
                    <span className="text-[9px] font-extrabold font-outfit tracking-wider uppercase text-amber-400/90 truncate">
                      TODAY&apos;S TITHI (DHARMASHASTRA)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {tithiResolution.isVriddhi && (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-500/40 text-[8px] font-extrabold font-outfit uppercase">
                        Vriddhi
                      </span>
                    )}
                    {tithiResolution.isKshaya && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-500/40 text-[8px] font-extrabold font-outfit uppercase">
                        Kshaya
                      </span>
                    )}
                  </div>
                </div>

                {/* Shortened Tithi Name (Task 5) & Badges */}
                <div className="flex items-center gap-2 flex-wrap py-0.5 min-w-0">
                  <h3 className="text-base sm:text-lg font-serif font-devanagari font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 tracking-tight leading-snug group-hover:from-amber-100 group-hover:to-yellow-300 transition-colors drop-shadow break-words whitespace-normal min-w-0">
                    {shortenedTithi}
                  </h3>
                  {panchang.tithi.index === 15 && (
                    <span className="text-lg drop-shadow-[0_0_12px_rgba(251,191,36,0.7)] select-none animate-pulse shrink-0" title="Purnima (Full Moon)">🌕</span>
                  )}
                  {panchang.tithi.index === 30 && (
                    <span className="text-lg drop-shadow-[0_0_12px_rgba(168,85,247,0.5)] select-none shrink-0" title="Amavasya (New Moon)">🌑</span>
                  )}
                  {(panchang.tithi.index === 11 || panchang.tithi.index === 26) && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-extrabold font-outfit shrink-0">
                      ✨ Ekadashi
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b101e]/80 border border-amber-500/20 text-[11px] font-grotesk tabular-nums shadow-sm min-w-0">
                  <Clock size={11} className="text-amber-400 shrink-0" />
                  <span className="font-sans text-slate-400 font-medium text-[10px] shrink-0">Ends:</span>
                  <span className="font-bold text-white tracking-tight truncate text-[11px]">
                    {currentTithiEndTime}
                  </span>
                </div>
              </div>

              {/* 4: Compact Horizontal / Single-Line Next Tithi Box (Task 4) */}
              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 space-y-1 text-[11px] min-w-0">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">Next Tithi:</span>
                  <span className="font-serif font-devanagari font-bold text-amber-300 text-right text-[11px] truncate min-w-0">
                    {shortNextTithi}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">Starts:</span>
                  <span className="font-mono tabular-nums text-slate-200 text-right text-[10px] truncate min-w-0">
                    {newTithiStartTime}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">Observed:</span>
                  <span className="font-semibold text-emerald-300 text-right text-[10px] truncate min-w-0">
                    {newTithiObservedWhen}
                  </span>
                </div>
              </div>

              {/* 5: Pahar (Single-line) */}
              <div className="flex items-center justify-between text-[11px] py-0.5 px-0.5 min-w-0">
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 font-sans shrink-0">
                  <Compass size={11} className="text-amber-400 shrink-0" />
                  <span>Pahar:</span>
                </span>
                <span className="font-medium text-slate-200 font-grotesk tabular-nums text-[10px] bg-slate-950/80 border border-white/10 px-2 py-0.5 rounded shadow-sm truncate min-w-0">
                  {panchang.paharCapsuleText}
                </span>
              </div>
            </div>

            {/* 6: Compact Link for Open Calendar */}
            <div className="mt-2 pt-2 border-t border-white/10 relative z-10">
              <div className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 hover:from-amber-500/25 hover:to-amber-500/25 border border-amber-500/30 group-hover:border-amber-400/70 text-amber-300 group-hover:text-amber-200 text-[11px] font-bold font-outfit tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-sm">
                <Calendar size={12} className="text-amber-400" />
                <span>Open 30-Day Almanac</span>
                <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* COLUMN 3: ACTIVE MUHURAT & TIMING CARD */}
          <div 
            onClick={() => setIsMuhuratModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsMuhuratModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isMuhuratModalOpen}
            title="Click to view 24h Muhurat Matrix & Choghadiya"
            aria-label="Open Daily Muhurat Timetable and Choghadiya Matrix"
            className="p-3 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 flex flex-col justify-between shadow-xl cursor-pointer transition-all duration-300 group relative active:scale-[0.99] overflow-hidden min-w-0"
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <div className="text-slate-400 text-[10px] sm:text-[11px] font-bold font-outfit tracking-wider uppercase group-hover:text-slate-300 transition-colors flex items-center gap-1 min-w-0">
                  <span className="truncate">ACTIVE MUHURAT</span>
                  <span className="text-[8px] px-1 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-serif font-devanagari font-semibold hidden sm:inline shrink-0">
                    धर्मशास्त्र
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-outfit flex items-center gap-1 ${
                    (activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious')
                      ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : activeVedicMuhurat?.nature === 'Moderate'
                      ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      : 'bg-rose-950/60 border border-rose-500/30 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                  }`}>
                    {(activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious') ? (
                      <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                    ) : activeVedicMuhurat?.nature === 'Moderate' ? (
                      <Sparkles size={10} className="text-amber-400 shrink-0" />
                    ) : (
                      <ShieldAlert size={10} className="text-rose-400 shrink-0" />
                    )}
                    <span>
                      {activeVedicMuhurat?.nature === 'Highly Auspicious' ? 'HIGHLY AUSPICIOUS' :
                       activeVedicMuhurat?.nature === 'Auspicious' ? 'AUSPICIOUS' :
                       activeVedicMuhurat?.nature === 'Moderate' ? 'MODERATE' : 'INAUSPICIOUS'}
                    </span>
                  </span>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </div>
              </div>

              {/* Main Active Vedic Muhurat Title */}
              <div className={`text-sm sm:text-base font-semibold my-1.5 leading-snug transition-colors break-words whitespace-normal font-outfit min-w-0 ${
                (activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious')
                  ? 'text-white group-hover:text-emerald-300'
                  : activeVedicMuhurat?.nature === 'Moderate'
                  ? 'text-white group-hover:text-amber-300'
                  : 'text-rose-400 group-hover:text-rose-300'
              }`}>
                {activeVedicMuhurat ? `Muhurat #${activeVedicMuhurat.index}: ${activeVedicMuhurat.name}` : (panchang.currentChoghadiya?.displayName || 'Abhijit Muhurat')}
              </div>

              {/* Shastric Guidance Banner */}
              <div className={`p-1.5 rounded-xl text-[11px] font-medium border mb-1.5 w-full min-w-0 ${
                (activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious')
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.10)]'
                  : activeVedicMuhurat?.nature === 'Moderate'
                  ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.10)]'
                  : 'bg-rose-950/60 border border-rose-500/30 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.10)]'
              }`}>
                <div className="flex items-start gap-1.5 min-w-0">
                  <span className="shrink-0 text-xs leading-none mt-0.5 select-none">
                    {(activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious') ? '🌟' : activeVedicMuhurat?.nature === 'Moderate' ? '⚡' : '⚠️'}
                  </span>
                  <span className="leading-snug break-words whitespace-normal text-[10px] font-semibold flex-1 font-sans min-w-0">
                    {activeVedicMuhurat?.activity || (activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious' ? 'Auspicious: Favorable for Sacred Actions' : 'Moderate: Routine Duties')}
                  </span>
                </div>
              </div>

              {/* Styled Active Muhurat Progress Bar */}
              <div className="w-full my-1.5">
                <div className="flex items-center justify-between text-[9px] font-grotesk tabular-nums mb-0.5 text-slate-400">
                  <span className="flex items-center gap-1 font-sans text-slate-400">
                    <Hourglass size={10} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    Window Progress
                  </span>
                  <span className="font-bold text-slate-200">{muhuratProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      (activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious')
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : activeVedicMuhurat?.nature === 'Moderate'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                    }`}
                    style={{ width: `${muhuratProgress}%` }}
                  />
                </div>
              </div>

              {/* Structured Timing & Deity Matrix Details Box */}
              <div className="p-2 rounded-xl bg-slate-950/60 border border-white/10 space-y-1 text-[11px] min-w-0">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">Deity:</span>
                  <span className="font-serif font-devanagari font-bold text-white text-right break-words whitespace-normal text-[10px] truncate min-w-0">
                    {activeVedicMuhurat?.deity || 'Universal'}
                  </span>
                </div>

                {panchang.currentChoghadiya && (
                  <div className="flex items-center justify-between gap-1.5 min-w-0">
                    <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">Choghadiya:</span>
                    <span className="font-semibold text-slate-200 text-right break-words whitespace-normal font-sans text-[10px] truncate min-w-0">
                      {panchang.currentChoghadiya.displayName}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-white/10 gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">Window:</span>
                  <span className="font-mono tabular-nums text-slate-100 font-semibold text-right text-[10px] truncate min-w-0">
                    {activeVedicMuhurat ? `${activeVedicMuhurat.startTime} — ${activeVedicMuhurat.endTime}` : (panchang.currentChoghadiya?.windowString || '08:14 PM — 09:37 PM')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 flex-wrap gap-1.5 min-w-0">
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1 shrink-0 font-sans">
                <Hourglass size={12} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Expires in <span className="font-mono tabular-nums">{activeVedicMuhurat?.remainingString || panchang.currentChoghadiya?.remainingString || '45m 00s'}</span></span>
              </div>
              <div className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-bold font-outfit text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] group-hover:border-emerald-400/50 transition-all flex items-center gap-1 shrink-0">
                <span>24h Matrix</span>
                <ArrowUpRight size={10} />
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom 3-Card Row (Task 4: Immediately Visible Above/Near Fold) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2.5 relative z-10">
          
          {/* BOTTOM LEFT: TODAY'S FESTIVAL / VRAT */}
          <div 
            onClick={() => setIsTodayFestivalModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsTodayFestivalModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isTodayFestivalModalOpen}
            title="Click to view Udaya Time, Starts, Ends & Dharmashastra Determination Rule"
            aria-label="View Today's Festival and Observance Details"
            className={`bg-slate-900/70 backdrop-blur-xl border ${
              panchang.todayFestival.isMajor 
                ? 'border-amber-500/40 hover:border-amber-400/70 bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-amber-950/10 shadow-[0_0_20px_rgba(245,158,11,0.06)]'
                : 'border-white/10 hover:border-amber-500/30'
            } rounded-2xl p-3 flex items-center gap-2.5 shadow-xl cursor-pointer transition-all duration-300 group active:scale-[0.99] min-w-0`}
          >
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 p-2 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center w-10 h-10">
              {panchang.todayFestival.icon ? (
                <span className="text-xl leading-none select-none">{panchang.todayFestival.icon}</span>
              ) : (
                <Calendar size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="text-orange-400 text-[10px] font-bold font-outfit tracking-wider uppercase flex items-center gap-1 min-w-0">
                  <span className="truncate">TODAY&apos;S FESTIVAL</span>
                  {panchang.todayFestival.isMajor && (
                    <span className="px-1 py-0.5 rounded text-[8px] font-extrabold bg-amber-950/60 border border-amber-500/30 text-amber-300 uppercase shrink-0 font-outfit">
                      Festive
                    </span>
                  )}
                </div>
                <ArrowUpRight size={12} className="text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
              </div>
              <div className={`text-sm font-bold mt-0.5 transition-colors font-sans break-words whitespace-normal min-w-0 ${
                panchang.todayFestival.isMajor ? 'text-amber-200 group-hover:text-amber-100' : 'text-white group-hover:text-amber-300'
              }`}>
                {panchang.todayFestival.title}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between font-sans min-w-0 gap-1">
                <span className="break-words whitespace-normal min-w-0">{panchang.todayFestival.description}</span>
                <span className="hidden sm:inline text-[9px] text-amber-400/80 font-semibold group-hover:text-amber-300 transition-colors shrink-0 font-outfit">
                  Rules →
                </span>
              </div>
            </div>
          </div>

          {/* MIDDLE: PANCHAK CARD */}
          <div 
            onClick={() => setIsPanchakModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsPanchakModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isPanchakModalOpen}
            title="Click to open Calendar of Panchaks for Upcoming Months & Years and Dharmashastra Rules"
            aria-label="View Multi-Year Panchak Calendar and Guidelines"
            className={`bg-slate-900/70 backdrop-blur-xl border ${
              panchakStatus.isActive 
                ? 'border-red-500/40 hover:border-red-400/70'
                : 'border-white/10 hover:border-amber-500/30'
            } rounded-2xl p-3 flex items-center gap-2.5 shadow-xl cursor-pointer transition-all duration-300 group relative active:scale-[0.99] min-w-0`}
          >
            <div className={`rounded-xl ${
              panchakStatus.isActive 
                ? 'text-red-400 bg-red-950/60 border border-red-500/40 animate-pulse'
                : 'text-teal-400 bg-teal-950/50 border border-teal-500/30'
            } p-2 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center w-10 h-10`}>
              {panchakStatus.isActive ? (
                <ShieldAlert size={18} />
              ) : (
                <ShieldCheck size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="text-amber-400 text-[10px] font-bold font-outfit tracking-wider uppercase flex items-center gap-1 min-w-0">
                  <span>PANCHAK <span className="font-serif font-devanagari font-normal">(पञ्चक)</span></span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-outfit shrink-0 ${
                  panchakStatus.isActive 
                    ? 'text-red-400 bg-red-950/60 border border-red-500/40 animate-pulse'
                    : 'text-teal-400 bg-teal-950/50 border border-teal-500/30'
                }`}>
                  {panchakStatus.badgeText}
                </span>
              </div>
              
              {/* Title: Shows Active Panchak or 'No active panchak' */}
              <div className={`text-sm font-bold mt-0.5 transition-colors font-sans break-words whitespace-normal min-w-0 ${
                panchakStatus.isActive 
                  ? 'text-red-400 group-hover:text-red-300'
                  : 'text-white group-hover:text-teal-300'
              }`}>
                {panchakStatus.isActive && panchakStatus.panchak
                  ? `${panchakStatus.panchak.type}`
                  : 'No active panchak'
                }
              </div>

              {/* Subtitle: Shows exact start & end date-times if active, or next panchak timing if inactive */}
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between font-sans min-w-0 gap-1">
                <span className="break-words whitespace-normal min-w-0">
                  {panchakStatus.isActive && panchakStatus.panchak
                    ? `Starts: ${panchakStatus.panchak.startDate} (${panchakStatus.panchak.startTime}) • Ends: ${panchakStatus.panchak.endDate} (${panchakStatus.panchak.endTime})`
                    : panchakStatus.nextPanchak 
                      ? `Next: ${panchakStatus.nextPanchak.type} (${panchakStatus.nextPanchak.startDate}, ${panchakStatus.nextPanchak.startTime})`
                      : 'No panchak in progress • Auspicious'
                  }
                </span>
                <span className="hidden sm:inline text-[9px] text-teal-300 font-semibold group-hover:text-teal-200 transition-colors shrink-0 font-outfit">
                  Calendar →
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM RIGHT: UPCOMING FESTIVAL / OBSERVANCE */}
          <div 
            onClick={() => setIsUpcomingFestivalsModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsUpcomingFestivalsModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isUpcomingFestivalsModalOpen}
            title="Click to open Monthly Calendar of Upcoming Festivals & Dharmashastra Rules"
            aria-label="View Upcoming Vedic Festivals and Observances"
            className="bg-slate-900/70 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-2.5 shadow-xl cursor-pointer transition-all duration-300 group active:scale-[0.99] min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="rounded-xl bg-slate-950/60 border border-white/10 p-2 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center w-10 h-10">
                {panchang.upcomingFestival.icon ? (
                  <span className="text-xl leading-none select-none">{panchang.upcomingFestival.icon}</span>
                ) : (
                  <Moon size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-emerald-400 text-[10px] font-bold font-outfit tracking-wider uppercase flex items-center justify-between gap-1">
                  <span className="truncate">UPCOMING OBSERVANCE</span>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                </div>
                <div className="text-sm font-bold text-white mt-0.5 leading-snug break-words whitespace-normal group-hover:text-emerald-300 transition-colors font-sans min-w-0">
                  {panchang.upcomingFestival.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 break-words whitespace-normal font-sans min-w-0">
                  {panchang.upcomingFestival.dateFormatted ? (
                    <span>
                      <strong className="text-emerald-400 font-medium font-grotesk">{panchang.upcomingFestival.dateFormatted}</strong>
                      {panchang.upcomingFestival.description && (
                        <span> • {panchang.upcomingFestival.description.replace(/^[^•]+•\s*/, '')}</span>
                      )}
                    </span>
                  ) : (
                    panchang.upcomingFestival.description
                  )}
                </div>
              </div>
            </div>

            <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-lg text-[9px] font-bold font-outfit shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              {panchang.upcomingFestival.daysText || panchang.upcomingFestival.badge}
            </span>
          </div>

        </div>

        {/* ── Optional Expandable Deep Panchang Details ── */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900/60 font-outfit"
          >
            <Layers size={13} />
            <span>{showDetails ? 'Hide Detailed Limbs & Timeline' : 'View Full 5-Limbs, Muhurats & 24h Choghadiya Timeline'}</span>
            <ChevronRight size={13} className={`transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
          <span className="text-[11px] text-slate-400 font-grotesk tabular-nums">
            Swiss Ephemeris • Lahiri Ayanamsha
          </span>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-6 animate-in fade-in duration-200 relative z-10">
            
            {/* Tabs header */}
            <div className="flex overflow-x-auto gap-2 pb-2 border-b border-white/10">
              {[
                { id: 'panchang', label: '5-Limbs of Panchang' },
                { id: 'choghadiya', label: '24h Choghadiya Matrix' },
                { id: 'muhurat', label: 'Shubh & Ashubh Muhurats' },
                { id: 'astrometry', label: 'Surya & Chandra Astrometry' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as WidgetTabType)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-outfit transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: 5 Limbs */}
            {activeTab === 'panchang' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="text-[10px] text-amber-400 font-bold font-outfit uppercase">1. TITHI</div>
                  <div className="text-sm font-bold text-white mt-1 font-serif font-devanagari">{panchang.tithi.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">Deity: {panchang.tithi.deity}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="text-[10px] text-amber-400 font-bold font-outfit uppercase">2. NAKSHATRA</div>
                  <div className="text-sm font-bold text-white mt-1 font-serif font-devanagari">{panchang.nakshatra.name} ({panchang.nakshatra.devanagari})</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">Pada {panchang.nakshatra.pada} • Lord {panchang.nakshatra.lord}</div>
                </div>
                <div className={`p-3.5 rounded-xl bg-slate-950/60 border ${panchang.yoga.nature === 'Shubh' ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-amber-400 font-bold font-outfit uppercase">3. YOGA</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-outfit ${
                      panchang.yoga.nature === 'Shubh' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                    }`}>
                      {panchang.yoga.nature === 'Shubh' ? 'AUSPICIOUS (शुभ)' : 'INAUSPICIOUS (अशुभ)'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1 font-serif font-devanagari">{panchang.yoga.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">{panchang.yoga.meaning}</div>
                </div>
                <div className={`p-3.5 rounded-xl bg-slate-950/60 border ${panchang.karana.auspicious ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-amber-400 font-bold font-outfit uppercase">4. KARANA</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-outfit ${
                      panchang.karana.auspicious ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                    }`}>
                      {panchang.karana.auspicious ? 'AUSPICIOUS (शुभ)' : 'INAUSPICIOUS (अशुभ)'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1 font-serif font-devanagari">{panchang.karana.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">{panchang.karana.type}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="text-[10px] text-amber-400 font-bold font-outfit uppercase">5. VAAR</div>
                  <div className="text-sm font-bold text-white mt-1 font-serif font-devanagari">{panchang.vaar.name}</div>
                  <div className="text-[11px] text-amber-400 mt-1 font-sans">{panchang.vaar.lord}</div>
                </div>
              </div>
            )}

            {/* Tab 2: Choghadiya */}
            {activeTab === 'choghadiya' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 font-outfit">☀️ Day Choghadiya (Sunrise to Sunset)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {panchang.dayChoghadiya.map((slot, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border text-xs ${slot.isCurrent ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-950/60 border-white/10'}`}>
                        <div className="flex justify-between font-bold text-white">
                          <span className="font-serif font-devanagari">{slot.name}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold border font-outfit ${
                            slot.nature === 'AUSPICIOUS' 
                              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                              : slot.nature === 'NEUTRAL' 
                              ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' 
                              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                          }`}>{slot.quality} ({slot.nature === 'AUSPICIOUS' ? 'Auspicious' : slot.nature === 'NEUTRAL' ? 'Neutral' : 'Inauspicious'})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-grotesk font-mono tabular-nums mt-1">{slot.startTime} - {slot.endTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 font-outfit">🌙 Night Choghadiya (Sunset to Next Sunrise)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {panchang.nightChoghadiya.map((slot, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border text-xs ${slot.isCurrent ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-950/60 border-white/10'}`}>
                        <div className="flex justify-between font-bold text-white">
                          <span className="font-serif font-devanagari">{slot.name}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold border font-outfit ${
                            slot.nature === 'AUSPICIOUS' 
                              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                              : slot.nature === 'NEUTRAL' 
                              ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' 
                              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                          }`}>{slot.quality} ({slot.nature === 'AUSPICIOUS' ? 'Auspicious' : slot.nature === 'NEUTRAL' ? 'Neutral' : 'Inauspicious'})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-grotesk font-mono tabular-nums mt-1">{slot.startTime} - {slot.endTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Muhurats */}
            {activeTab === 'muhurat' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase font-outfit">Brahma Muhurat</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-outfit">AUSPICIOUS</span>
                  </div>
                  <div className="text-sm font-bold font-grotesk font-mono tabular-nums text-emerald-300 mt-1">{panchang.muhurats.brahmaMuhurat.start} - {panchang.muhurats.brahmaMuhurat.end}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase font-outfit">Abhijit Muhurat</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-outfit">AUSPICIOUS</span>
                  </div>
                  <div className="text-sm font-bold font-grotesk font-mono tabular-nums text-emerald-300 mt-1">{panchang.muhurats.abhijitMuhurat.start} - {panchang.muhurats.abhijitMuhurat.end}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-amber-400 font-bold uppercase font-outfit">Gulika Kaal</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 font-outfit">NEUTRAL</span>
                  </div>
                  <div className="text-sm font-bold font-grotesk font-mono tabular-nums text-amber-300 mt-1">{panchang.muhurats.gulikaKaal.start} - {panchang.muhurats.gulikaKaal.end}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-rose-400 font-bold uppercase font-outfit">Rahu Kaal (Avoid)</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950/60 border border-rose-500/30 text-rose-300 font-outfit">INAUSPICIOUS</span>
                  </div>
                  <div className="text-sm font-bold font-grotesk font-mono tabular-nums text-rose-300 mt-1">{panchang.muhurats.rahuKaal.start} - {panchang.muhurats.rahuKaal.end}</div>
                </div>
              </div>
            )}

            {/* Tab 4: Astrometry */}
            {activeTab === 'astrometry' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="font-bold text-amber-400 mb-2 font-outfit">☀️ Surya Astrometry (Solar)</div>
                  <div className="space-y-1 text-slate-300">
                    <div>Rashi: <span className="font-semibold text-white">{panchang.suryaRashi.name} ({panchang.suryaRashi.degree})</span></div>
                    <div>Day Duration: <span className="font-semibold text-white font-grotesk tabular-nums">{panchang.dayLength}</span></div>
                    <div>Ayana: <span className="font-semibold text-white">{panchang.ayana}</span></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="font-bold text-indigo-400 mb-2 font-outfit">🌙 Chandra Astrometry (Lunar)</div>
                  <div className="space-y-1 text-slate-300">
                    <div>Rashi: <span className="font-semibold text-white">{panchang.chandraRashi.name} ({panchang.chandraRashi.degree})</span></div>
                    <div>Moon Phase: <span className="font-semibold text-white">{panchang.moonPhaseName} ({panchang.moonIlluminationPercent}%)</span></div>
                    <div>Moonrise / Moonset: <span className="font-semibold text-white font-grotesk tabular-nums">{panchang.moonrise} / {panchang.moonset}</span></div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ── Interactive Modals ── */}
      <TithiMonthModal
        isOpen={isTithiModalOpen}
        onClose={() => setIsTithiModalOpen(false)}
        location={selectedLocation}
        onSelectDate={(d) => {
          setSelectedDate(d);
          setIsTithiModalOpen(false);
        }}
      />

      <DailyMuhuratModal
        isOpen={isMuhuratModalOpen}
        onClose={() => setIsMuhuratModalOpen(false)}
        panchang={panchang}
      />

      <TodayFestivalModal
        isOpen={isTodayFestivalModalOpen}
        onClose={() => setIsTodayFestivalModalOpen(false)}
        panchang={panchang}
      />

      <PanchakModal
        isOpen={isPanchakModalOpen}
        onClose={() => setIsPanchakModalOpen(false)}
      />

      <UpcomingFestivalsModal
        isOpen={isUpcomingFestivalsModalOpen}
        onClose={() => setIsUpcomingFestivalsModalOpen(false)}
        location={selectedLocation}
        currentDate={selectedDate}
      />

      {/* ── Background Notification System: Graceful Banner & Settings Modal ── */}
      <NotificationPermissionBanner
        onOpenSettings={() => setIsNotificationModalOpen(true)}
      />

      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        currentLocation={selectedLocation}
        onLocationChange={(newLoc) => {
          setSelectedLocation(newLoc);
          setLocationSource('gps');
        }}
        currentTithiName={panchang.instantaneousTithi?.name || panchang.tithi.name}
        panchakStatus={{
          isActive: panchakStatus.isActive,
          isInauspicious: panchakStatus.isActive && panchakStatus.panchak?.auspiciousness !== 'Auspicious',
          type: panchakStatus.panchak?.type,
          statusText: panchakStatus.isActive
            ? `${panchakStatus.panchak?.type || 'Panchak'} (Inauspicious)`
            : undefined
        }}
        festivalOrVratName={panchang.festivals && panchang.festivals.length > 0 ? panchang.festivals[0] : null}
      />

      <EmbedWidgetModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        defaultCity={selectedLocation.name}
      />

    </>
  );
}
