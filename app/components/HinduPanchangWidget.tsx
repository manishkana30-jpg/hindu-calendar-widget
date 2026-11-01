"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Sparkles, MapPin, ChevronDown, X,
  Clock, Sun, Compass, Hourglass, Calendar, Moon,
  CheckCircle2, ChevronRight, ChevronLeft, Star, Flame, Layers,
  ShieldAlert, ShieldCheck, ArrowUpRight, Bell, Code2, RotateCcw,
  Share2, Check, Globe
} from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { translateTerm as translateTermRaw, SupportedLanguage } from '@/src/lib/i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';
import { LanguageDropdown } from './LanguageDropdown';
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
import { FiveLimbsModal, LimbTabType } from './modals/FiveLimbsModal';
import { TodayFestivalModal } from './modals/TodayFestivalModal';
import { PanchakModal } from './modals/PanchakModal';
import { UpcomingFestivalsModal } from './modals/UpcomingFestivalsModal';
import { NotificationSettingsModal } from './modals/NotificationSettingsModal';
import { WhatsAppIcon } from './WhatsAppShareButton';
import { EmbedWidgetModal } from '../../src/components/EmbedWidgetModal';
import { sharePanchang, buildShareDataFromPanchang, formatPanchangShareText } from '../../src/lib/utils/sharePanchang';
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
  selectedDateFallback: Date,
  localeCode: string = 'en-IN'
): string {
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat(localeCode, {
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
    return fallbackLiveTime || date.toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }
  return selectedDateFallback.toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit', hour12: true }) || '06:00 AM';
}

function formatDateForLocation(
  date: Date,
  timeZone: string | undefined,
  fallbackDateString: string,
  localeCode: string = 'en-IN'
): string {
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat(localeCode, {
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

  return fallbackDateString || date.toLocaleDateString(localeCode, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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

// Localized Masa calculation according to region/GPS latitude and user language
function getLocalizedMasaString(
  location: LocationCoordinates,
  amantaMonth: string,
  purnimantaMonth: string,
  vikramSamvat: number,
  shakaSamvat: number,
  lang: SupportedLanguage = 'en',
  purnimantaLabel: string = 'Purnimanta',
  amantaLabel: string = 'Amanta'
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

  const masaAmantaTr = translateTermRaw(cleanAmanta, lang);
  const masaPurnimantaTr = translateTermRaw(cleanPurnimanta, lang);

  if (isNorthIndia) {
    return `${masaPurnimantaTr} (${purnimantaLabel}) · VS ${vikramSamvat}`;
  } else {
    return `${masaAmantaTr} (${amantaLabel}) · Shaka ${shakaSamvat}`;
  }
}

// Shortened Tithi string output (e.g. "Shukla 1 (Pratipada)")
function formatShortenedTithi(tithiIndex: number, lang: SupportedLanguage = 'en', fallbackName?: string): string {
  const tithiObj = TITHIS[(tithiIndex - 1) % 30];
  if (!tithiObj) return fallbackName || 'Tithi';

  const paksha = translateTermRaw(tithiObj.paksha, lang);
  const pakshaDay = ((tithiIndex - 1) % 15) + 1;
  const pureName = translateTermRaw(tithiObj.pureName, lang);

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
  const { language, isHindi, t, translateTerm, localeCode } = useLanguage();

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
    isLiveMode: true,
    localeCode
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
  }, [initialLocation, setObserver]);

  // Periodic update of "Last updated" indicator every 30 seconds with strict clearInterval cleanup
  useEffect(() => {
    const updateTime = () => {
      try {
        const raw = localStorage.getItem('panchang_last_updated');
        if (raw) {
          setLastUpdatedTime(formatLastUpdatedTime(Number(raw)));
        }
      } catch {
        // Guard against restricted storage access
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<WidgetTabType>('panchang');

  // Smooth scroll / tab jump to 5-Limbs of Panchang with safe mobile positioning
  const handleFiveLimbsClick = (initialLimb?: LimbTabType) => {
    if (initialLimb) {
      openLimbModal(initialLimb);
      return;
    }
    // On mobile screens, open modal directly for superior responsive UX
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      openLimbModal('tithi');
      return;
    }
    setShowDetails(true);
    setActiveTab('panchang');
    setTimeout(() => {
      const el = document.getElementById('five-limbs-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  // Smooth scroll / tab jump to Muhurat section
  const handleMuhuratClick = () => {
    setShowDetails(true);
    setActiveTab('muhurat');
    setTimeout(() => {
      const el = document.getElementById('muhurat-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Modal states for click interactions
  const [isTithiModalOpen, setIsTithiModalOpen] = useState<boolean>(false);
  const [isMuhuratModalOpen, setIsMuhuratModalOpen] = useState<boolean>(false);
  const [isFiveLimbsModalOpen, setIsFiveLimbsModalOpen] = useState<boolean>(false);
  const [activeLimbForModal, setActiveLimbForModal] = useState<LimbTabType>('tithi');
  const [isTodayFestivalModalOpen, setIsTodayFestivalModalOpen] = useState<boolean>(false);
  const [isPanchakModalOpen, setIsPanchakModalOpen] = useState<boolean>(false);
  const [isUpcomingFestivalsModalOpen, setIsUpcomingFestivalsModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);

  const openLimbModal = (limb: LimbTabType = 'tithi') => {
    setActiveLimbForModal(limb);
    setIsFiveLimbsModalOpen(true);
  };

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

  // Localized Masa & Shortened Tithi with dynamic language translation
  const localizedMasa = getLocalizedMasaString(
    selectedLocation,
    panchang.amantaMonth || panchang.masaDisplay,
    panchang.purnimantaMonth || panchang.masaDisplay,
    panchang.vikramSamvat,
    panchang.shakaSamvat,
    language,
    t('purnimanta'),
    t('amanta')
  );

  const shortenedTithi = formatShortenedTithi(
    panchang.udayaTithi?.index || panchang.tithi.index,
    language,
    panchang.udayaTithi?.name || panchang.tithi.name
  );

  const nextTithiIndex = (((panchang.udayaTithi?.index || panchang.tithi.index || 1) % 30) + 1);
  const shortNextTithi = formatShortenedTithi(nextTithiIndex, language, nextTithiName);

  // Formatted date string for native date input (YYYY-MM-DD)
  const selectedDateYyyyMmDd = useMemo(() => {
    const d = selectedDate;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  // Actions wired directly to SSOT
  const handlePrevDay = prevDay;
  const handleNextDay = nextDay;
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFromInput(e.target.value);
  };
  const handleResetToLive = resetToLive;

  // Native Web Share API with clipboard fallback & WhatsApp direct link
  const [shareToast, setShareToast] = useState<string | null>(null);
  const shareToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const shareDataObj = buildShareDataFromPanchang(
        selectedDate,
        panchang,
        activeMuhurat,
        panchakStatus?.badgeText || panchakStatus?.displayTitle || ''
      );
      const formattedText = formatPanchangShareText(shareDataObj);
      const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://dailytithi.com';

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ title: 'Daily Tithi — Vedic Panchang', text: formattedText, url: appUrl })
      ) {
        try {
          await navigator.share({
            title: 'Daily Tithi — Vedic Panchang',
            text: formattedText,
            url: appUrl
          });
          return;
        } catch (err: unknown) {
          if ((err as Error)?.name === 'AbortError') return;
        }
      }

      // Open WhatsApp directly with the formatted Panchang card
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;
      const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!win && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(formattedText);
        if (shareToastTimeoutRef.current) clearTimeout(shareToastTimeoutRef.current);
        setShareToast('Link copied to clipboard!');
        shareToastTimeoutRef.current = setTimeout(() => setShareToast(null), 2500);
      }
    } catch {
      const fallbackUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `🌅 Daily Tithi — Vedic Panchang & Muhurat\n${typeof window !== 'undefined' ? window.location.href : 'https://dailytithi.com'}`
      )}`;
      window.open(fallbackUrl, '_blank');
    }
  }, [selectedDate, panchang, activeMuhurat, panchakStatus]);

  useEffect(() => {
    return () => {
      if (shareToastTimeoutRef.current) clearTimeout(shareToastTimeoutRef.current);
    };
  }, []);

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
      <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-2.5 sm:p-5 text-left transition-all duration-300 font-sans relative overflow-x-hidden touch-pan-y">
        {/* Subtle celestial observatory ambient background lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-0" />
        
        {/* ── Consolidated Top Control Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/10 text-xs relative z-30 mb-2.5">
          {/* Left Group: Location / GPS Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
            {/* 1. City Dropdown */}
            <div className="relative inline-flex items-center min-w-0 shrink-0">
              <MapPin size={12} className="absolute left-2.5 text-amber-400 pointer-events-none z-10" />
              <select
                aria-label={t('selectCity')}
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
                className="pl-7 pr-6 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/30 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-sm max-w-[130px] sm:max-w-[180px] truncate"
              >
                {ALL_LOCATIONS.map((loc) => (
                  <option key={`${loc.name}-${loc.country}`} value={loc.name} className="bg-slate-900 text-white">
                    {loc.name} ({loc.country})
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none z-10" />
            </div>

            {/* 2. Precision GPS Button */}
            <button
              type="button"
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
              title={t('useGps')}
              aria-label={t('useGps')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-sm font-sans shrink-0 ${
                locationSource === 'gps'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 text-amber-300 hover:text-white border border-white/10 hover:border-amber-500/30'
              }`}
            >
              <MapPin size={11} className={isGpsDetecting ? 'animate-spin text-amber-400' : (locationSource === 'gps' ? 'text-emerald-400' : 'text-amber-400')} />
              <span>{isGpsDetecting ? t('detectingGps') : (locationSource === 'gps' ? t('gpsActive') : t('useGps'))}</span>
            </button>
          </div>

          {/* Right Group: Date Picker / Live, Global Language Dropdown, Share, Install */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end ml-auto shrink-0">
            {/* 3. Date Picker & Live Indicator */}
            <div className="inline-flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={handlePrevDay}
                aria-label={t('prevDay')}
                title={t('prevDay')}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>

              <input
                type="date"
                value={selectedDateYyyyMmDd}
                onChange={handleDateChange}
                aria-label={t('selectDate')}
                title={t('selectDate')}
                className="bg-transparent text-[11px] font-mono text-slate-200 cursor-pointer focus:outline-none px-1 py-0.5 max-w-[105px]"
              />

              <button
                type="button"
                onClick={handleNextDay}
                aria-label={t('nextDay')}
                title={t('nextDay')}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>

              {/* Live Status Pill / Reset Button */}
              {isLiveMode ? (
                <div 
                  title={t('live')}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold select-none shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>{t('live')}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResetToLive}
                  title={t('resetToLive')}
                  aria-label={t('resetToLive')}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold cursor-pointer transition-all shrink-0"
                >
                  <RotateCcw size={10} className="text-amber-400 shrink-0" />
                  <span>{t('live')}</span>
                </button>
              )}
            </div>

            {/* 4. Global Language Dropdown */}
            <LanguageDropdown />

            {/* 5. Share Icon Button */}
            <div className="relative inline-flex items-center">
              <button
                type="button"
                onClick={handleShare}
                title={t('shareOnWhatsApp')}
                aria-label={t('shareOnWhatsApp')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 hover:text-white transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] active:scale-95 cursor-pointer shrink-0 min-h-[32px]"
              >
                <Share2 size={13} className="text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">{t('share')}</span>
              </button>

              {shareToast && (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute -top-8 right-0 z-50 whitespace-nowrap px-2.5 py-1 rounded-lg bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-[10px] font-medium shadow-xl flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-150 pointer-events-none"
                >
                  <Check size={11} className="text-emerald-400 shrink-0" />
                  <span>{shareToast}</span>
                </div>
              )}
            </div>

            {/* 6. Install App Button (only when not installed) */}
            <PWAInstallButton />
          </div>
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
            className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-[#1e2d4f] hover:border-orange-500/40 flex flex-col justify-between shadow-xl cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group relative min-w-0"
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] sm:text-[11px] font-bold font-outfit tracking-wider uppercase group-hover:text-amber-300 transition-colors min-w-0">
                  <Clock size={12} className="text-amber-400 shrink-0" />
                  <span className="truncate">{isLiveMode ? t('liveClock') : t('selectedDate')}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 group-hover:border-orange-400/50 transition-all">
                    <Calendar size={11} className="text-orange-400 shrink-0" />
                    <span>{t('almanac30Day')}</span>
                    <ChevronRight size={12} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </span>
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
                      <span className="text-slate-400 text-[9px] shrink-0 font-sans">{t('nextHoliday')}</span>
                      <strong className="text-white truncate font-semibold font-sans min-w-0">{translateTerm(holidayDetails.upcomingHoliday.title, language)}</strong>
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
                        {holidayDetails.eclipseInfo.activeEclipse?.nameHindi || t('eclipseToday')} • {t('sutakActive')}
                      </span>
                    ) : (
                      <span className="break-words whitespace-normal text-[10px] text-slate-300">
                        {t('noEclipseToday')}
                        {holidayDetails.eclipseInfo.nextEclipse && (
                          <span className="text-slate-400 ml-1">
                            • {t('nextHoliday')} {translateTerm(holidayDetails.eclipseInfo.nextEclipse.nameHindi, language)}
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

            {/* Cohesive Sunrise/Sunset and Value-Driven Tap Micro-CTA Footer */}
            <div className="pt-2 border-t border-[#1e2d4f] mt-auto space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2 text-xs min-w-0">
                <div className="px-2 py-0.5 rounded-full bg-slate-950/70 border border-white/10 flex items-center gap-2 text-[10px] font-medium text-slate-200 font-grotesk tabular-nums shrink-0">
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
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-outfit shrink-0">
                  {t('almanac30Day')}
                </span>
              </div>

              {/* Value-Driven Tap Micro-CTA */}
              <div className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[11px] font-semibold font-outfit transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={12} className="text-orange-400 shrink-0" />
                  <span className="truncate">{t('tapFullCalendar')}</span>
                </div>
                <ChevronRight size={13} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
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
            className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-amber-500/35 hover:border-orange-500/60 shadow-[0_0_25px_rgba(245,158,11,0.1)] hover:shadow-[0_0_35px_rgba(245,158,11,0.18)] flex flex-col justify-between cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group relative font-sans overflow-hidden min-w-0"
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
                    {translateTerm(panchang.dayOfWeekName, language)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold font-outfit uppercase tracking-widest bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 shrink-0">
                    {t('today')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 group-hover:border-orange-400/50 transition-all">
                    <Calendar size={11} className="text-orange-400 shrink-0" />
                    <span>{t('fullAlmanac')}</span>
                    <ChevronRight size={12} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </span>
                </div>
              </div>

              {/* 2: Localized Masa Pill (Task 5: North Purnimanta vs South/West Amanta) */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-0">
                <span className="text-[9px] font-extrabold font-outfit text-amber-400/90 tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                  {t('masa')}
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
                      {isHindi ? 'आज की औदयिक तिथि' : t('tithi')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {tithiResolution.isVriddhi && (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-500/40 text-[8px] font-extrabold font-outfit uppercase">
                        {translateTerm('Vriddhi', language)}
                      </span>
                    )}
                    {tithiResolution.isKshaya && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-500/40 text-[8px] font-extrabold font-outfit uppercase">
                        {translateTerm('Kshaya', language)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Shortened Tithi Name & Badges */}
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
                      ✨ {translateTerm('Ekadashi', language)}
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b101e]/80 border border-amber-500/20 text-[11px] font-grotesk tabular-nums shadow-sm min-w-0">
                  <Clock size={11} className="text-amber-400 shrink-0" />
                  <span className="font-sans text-slate-400 font-medium text-[10px] shrink-0">{t('tithiEnds')}:</span>
                  <span className="font-bold text-white tracking-tight truncate text-[11px]">
                    {currentTithiEndTime}
                  </span>
                </div>
              </div>

              {/* 4: Compact Horizontal / Single-Line Next Tithi Box (Task 4) */}
              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 space-y-1 text-[11px] min-w-0">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">{t('nextTithi')}:</span>
                  <span className="font-serif font-devanagari font-bold text-amber-300 text-right text-[11px] truncate min-w-0">
                    {shortNextTithi}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">{t('starts')}:</span>
                  <span className="font-mono tabular-nums text-slate-200 text-right text-[10px] truncate min-w-0">
                    {newTithiStartTime}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">{t('vratRules')}:</span>
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

            {/* 6: Value-Driven Tap Micro-CTA Footer */}
            <div className="mt-2 pt-2 border-t border-[#1e2d4f] relative z-10 min-w-0">
              <div className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/35 group-hover:border-orange-400/70 text-orange-200 group-hover:text-white text-[11px] font-semibold font-outfit tracking-wide transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={12} className="text-orange-400 shrink-0" />
                  <span className="truncate">{t('tapFullCalendar')}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-grotesk">
                    Exact End Times
                  </span>
                  <ChevronRight size={13} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: CURRENTLY ACTIVE VEDIC MUHURAT CARD */}
          <div 
            id="muhurat-card"
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
            aria-label="View Daily 24-Hour Muhurats and Choghadiya"
            title="Click to view Daily 30 Muhurats & Choghadiya"
            className="scroll-mt-28 p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-[#1e2d4f] hover:border-orange-500/40 flex flex-col justify-between shadow-xl cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group relative overflow-hidden min-w-0"
          >
            <div className="min-w-0">
              {/* Header: Label + Nature Badge (Clicking opens DailyMuhuratModal) */}
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <div className="text-slate-400 text-[10px] sm:text-[11px] font-bold font-outfit tracking-wider uppercase group-hover:text-slate-300 transition-colors flex items-center gap-1 min-w-0">
                  <span className="truncate">{t('tabMuhurat')}</span>
                  <span className="text-[8px] px-1 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-serif font-devanagari font-semibold hidden sm:inline shrink-0">
                    धर्मशास्त्र सम्मत
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
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
                      {activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious'
                        ? t('auspicious').toUpperCase()
                        : activeVedicMuhurat?.nature === 'Moderate'
                        ? t('neutral').toUpperCase()
                        : t('inauspicious').toUpperCase()}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] font-semibold font-outfit shadow-sm shrink-0 group-hover:bg-orange-500/25 group-hover:border-orange-400/50 transition-all">
                    <Clock size={11} className="text-orange-400 shrink-0" />
                    <span>30 Muhurats</span>
                    <ChevronRight size={12} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </span>
                </div>
              </div>

              {/* Main Active Vedic Muhurat Title & Deity */}
              <div className="my-1.5 leading-snug">
                <div className={`text-base sm:text-lg font-bold font-outfit truncate ${
                  (activeVedicMuhurat?.nature === 'Highly Auspicious' || activeVedicMuhurat?.nature === 'Auspicious')
                    ? 'text-white group-hover:text-emerald-300'
                    : activeVedicMuhurat?.nature === 'Moderate'
                    ? 'text-white group-hover:text-amber-300'
                    : 'text-rose-400 group-hover:text-rose-300'
                }`}>
                  {activeVedicMuhurat
                    ? `Muhurat #${activeVedicMuhurat.index}: ${translateTerm(activeVedicMuhurat.name, language)}`
                    : translateTerm(panchang.currentChoghadiya?.displayName || 'Abhijit Muhurat', language)}
                </div>
                {activeVedicMuhurat?.deity && (
                  <div className="text-xs text-neutral-300 mt-0.5 truncate">
                    • {t('ruler')}: <strong className="text-white font-serif font-devanagari">{translateTerm(activeVedicMuhurat.deity, language)}</strong>
                  </div>
                )}
              </div>

              {/* Timing Window & Expiry Pill */}
              <div className="flex items-center justify-between text-xs text-slate-300 font-mono tabular-nums mb-1.5">
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock size={11} className="text-amber-400 shrink-0" />
                  <span>{activeVedicMuhurat ? `${activeVedicMuhurat.startTime} — ${activeVedicMuhurat.endTime}` : (panchang.currentChoghadiya?.windowString || '08:14 PM — 09:37 PM')}</span>
                </span>
                <span className="text-[10px] text-amber-400 font-semibold font-sans">
                  {language === 'en' ? 'Expires in' : (language === 'hi' ? 'समाप्ति:' : (language === 'sa' ? 'समाप्तिः' : (language === 'mr' ? 'उरलेला वेळ:' : 'સમાપ્તિ:')))} <span className="font-mono">{activeVedicMuhurat?.remainingString || panchang.currentChoghadiya?.remainingString || '45m'}</span>
                </span>
              </div>

              {/* Shastric Activity & Guidance Banner */}
              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 text-[11px] text-slate-300 mb-2">
                <span className="text-amber-400 font-semibold">
                  {language === 'en' ? 'Activity & Guidance:' : (language === 'hi' ? 'कार्य एवं मार्गदर्शन:' : (language === 'sa' ? 'कार्यं मार्गदर्शनं च:' : (language === 'mr' ? 'कार्य व मार्गदर्शन:' : 'કાર્ય અને માર્ગદર્શન:')))}
                </span>{' '}
                <span className="text-neutral-200">{activeVedicMuhurat?.activity || 'Favorable for auspicious beginnings, prayers, and sacred deeds.'}</span>
              </div>

              {/* Styled Active Muhurat Progress Bar */}
              <div className="w-full mb-1">
                <div className="flex items-center justify-between text-[9px] font-grotesk tabular-nums mb-0.5 text-slate-400">
                  <span className="flex items-center gap-1 font-sans text-slate-400">
                    <Hourglass size={10} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    {language === 'en' ? 'Active Muhurat Progress' : (language === 'hi' ? 'सक्रिय मुहूर्त प्रगति' : (language === 'sa' ? 'सक्रियमुहूर्तप्रगतिः' : (language === 'mr' ? 'सक्रिय मुहूर्त प्रगती' : 'સક્રિય મુહૂર્ત પ્રગતિ')))}
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
            </div>

            {/* Value-Driven Tap Micro-CTA Footer */}
            <div className="mt-2 pt-2 border-t border-[#1e2d4f] relative z-10 min-w-0">
              <div className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/35 group-hover:border-orange-400/70 text-orange-200 group-hover:text-white text-[11px] font-semibold font-outfit tracking-wide transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Clock size={12} className="text-orange-400 shrink-0" />
                  <span className="truncate">{t('tap24hMuhurat')}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-grotesk">
                    +30 Muhurats
                  </span>
                  <ChevronRight size={13} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
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
            className={`p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border ${
              panchang.todayFestival.isMajor 
                ? 'border-amber-500/40 hover:border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                : 'border-[#1e2d4f] hover:border-orange-500/40'
            } flex flex-col justify-between cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group relative font-sans shadow-xl min-w-0`}
          >
            <div className="space-y-2 relative z-10 min-w-0">
              {/* Header row: Label + Festive Badge + Action Pill */}
              <div className="flex items-center justify-between gap-1.5 min-w-0 pb-1.5 border-b border-white/5">
                <div className="text-orange-400 text-[10px] font-bold font-outfit tracking-wider uppercase flex items-center gap-1.5 min-w-0">
                  <span className="truncate">{t('todaysObservance')}</span>
                  {panchang.todayFestival.isMajor && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-950/60 border border-amber-500/40 text-amber-300 uppercase shrink-0 font-outfit">
                      {t('majorFestival')}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 group-hover:border-orange-400/50 transition-all shrink-0">
                  <Sparkles size={11} className="text-orange-400 shrink-0" />
                  <span>{t('vratRules')}</span>
                  <ChevronRight size={12} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </span>
              </div>

              {/* Main content */}
              <div className="flex items-start gap-2.5 min-w-0 pt-0.5">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 p-2 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center w-10 h-10">
                  {panchang.todayFestival.icon ? (
                    <span className="text-xl leading-none select-none">{panchang.todayFestival.icon}</span>
                  ) : (
                    <Calendar size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold transition-colors font-sans break-words whitespace-normal leading-snug min-w-0 ${
                    panchang.todayFestival.isMajor ? 'text-amber-200 group-hover:text-amber-100' : 'text-white group-hover:text-amber-300'
                  }`}>
                    {translateTerm(panchang.todayFestival.title, language)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 break-words whitespace-normal font-sans line-clamp-2 min-w-0">
                    {language === 'hi'
                      ? (panchang.todayFestival.briefRule?.hindi || panchang.todayFestival.description)
                      : (panchang.todayFestival.briefRule?.english || panchang.todayFestival.description)}
                  </div>
                </div>
              </div>
            </div>

            {/* Value-Driven Tap Micro-CTA Footer */}
            <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] relative z-10 min-w-0">
              <div className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/35 group-hover:border-orange-400/70 text-orange-200 group-hover:text-white text-[11px] font-semibold font-outfit tracking-wide transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={12} className="text-orange-400 shrink-0" />
                  <span className="truncate">{t('exploreMonthlyCalendar')}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-grotesk">
                    {t('dharmashastraRules')}
                  </span>
                  <ChevronRight size={13} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
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
            className={`p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border ${
              panchakStatus.isActive 
                ? 'border-red-500/40 hover:border-red-400/70 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                : 'border-[#1e2d4f] hover:border-teal-500/40 shadow-xl'
            } flex flex-col justify-between cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group relative font-sans min-w-0`}
          >
            <div className="space-y-2 relative z-10 min-w-0">
              {/* Header row: Label + Badge + Action Pill */}
              <div className="flex items-center justify-between gap-1.5 min-w-0 pb-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-amber-400 text-[10px] font-bold font-outfit tracking-wider uppercase truncate">
                    {t('panchakStatus')}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold font-outfit uppercase shrink-0 ${
                    panchakStatus.isActive 
                      ? 'text-red-400 bg-red-950/60 border border-red-500/40 animate-pulse'
                      : 'text-teal-400 bg-teal-950/50 border border-teal-500/30'
                  }`}>
                    {panchakStatus.badgeText}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-semibold font-outfit shadow-sm group-hover:bg-teal-500/25 group-hover:border-teal-400/50 transition-all shrink-0">
                  <ShieldCheck size={11} className="text-teal-400 shrink-0" />
                  <span>{language === 'en' ? 'Multi-Year' : (language === 'hi' ? 'बहु-वर्षीय' : (language === 'sa' ? 'बहुवर्षीयम्' : (language === 'mr' ? 'अनेक वर्षांचे' : 'બહુ-વર્ષીય')))}</span>
                  <ChevronRight size={12} className="text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </span>
              </div>

              {/* Main content */}
              <div className="flex items-start gap-2.5 min-w-0 pt-0.5">
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
                  <div className={`text-sm font-bold transition-colors font-sans break-words whitespace-normal leading-snug min-w-0 ${
                    panchakStatus.isActive 
                      ? 'text-red-400 group-hover:text-red-300'
                      : 'text-white group-hover:text-teal-300'
                  }`}>
                    {panchakStatus.isActive && panchakStatus.panchak
                      ? translateTerm(panchakStatus.panchak.type, language)
                      : t('panchakFree')
                    }
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 break-words whitespace-normal font-sans line-clamp-2 min-w-0">
                    {panchakStatus.isActive && panchakStatus.panchak
                      ? (isHindi ? panchakStatus.panchak.briefEffects.hindi : `Starts: ${panchakStatus.panchak.startDate} (${panchakStatus.panchak.startTime}) • Ends: ${panchakStatus.panchak.endDate} (${panchakStatus.panchak.endTime})`)
                      : panchakStatus.nextPanchak 
                        ? `${language === 'en' ? 'Next:' : (language === 'hi' ? 'अगला:' : (language === 'sa' ? 'आगामी:' : (language === 'mr' ? 'पुढील:' : 'આગામી:')))} ${translateTerm(panchakStatus.nextPanchak.type, language)} (${panchakStatus.nextPanchak.startDate})`
                        : (language === 'en' ? 'No panchak in progress • Auspicious' : (language === 'hi' ? 'कोई पञ्चक दोष नहीं • सभी शुभ कार्य प्रशस्त' : (language === 'sa' ? 'न कोऽपि पञ्चकदोषः • सर्वे शुभकार्याः प्रशस्ताः' : (language === 'mr' ? 'कोणताही पंचक दोष नाही • सर्व कार्ये शुभ' : 'કોઈ પંચક દોષ નથી • બધા શુભ કાર્યો ઉત્તમ'))))
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Value-Driven Tap Micro-CTA Footer */}
            <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] relative z-10 min-w-0">
              <div className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 hover:from-teal-500/25 hover:to-emerald-500/25 border border-teal-500/35 group-hover:border-teal-400/70 text-teal-200 group-hover:text-white text-[11px] font-semibold font-outfit tracking-wide transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={12} className="text-teal-400 shrink-0" />
                  <span className="truncate">{language === 'en' ? "Tap for Multi-Year Panchak Calendar & Dos/Don'ts" : (language === 'hi' ? 'बहु-वर्षीय पञ्चक कैलेंडर एवं शास्त्र नियम' : (language === 'sa' ? 'बहुवर्षीयपञ्चकदिनदर्शिका शास्त्रनियमाः च' : (language === 'mr' ? 'बहु-वर्षीय पंचक दिनदर्शिका व शास्त्र नियम' : 'બહુ-વર્ષીય પંચક કેલેન્ડર અને શાસ્ત્ર નિયમો')))}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-grotesk">
                    {language === 'en' ? '2025–2030 Guidance' : (language === 'hi' ? '२०२५-२०३० मार्गदर्शन' : (language === 'sa' ? '२०२५-२०३० मार्गदर्शनम्' : (language === 'mr' ? '२०२५-२०३० मार्गदर्शन' : '૨૦૨૫-૨૦૩૦ માર્ગદર્શન')))}
                  </span>
                  <ChevronRight size={13} className="text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
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
            className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-[#1e2d4f] hover:border-emerald-500/40 shadow-xl flex flex-col justify-between cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group relative font-sans min-w-0"
          >
            <div className="space-y-2 relative z-10 min-w-0">
              {/* Header row: Label + Days pill + Action badge */}
              <div className="flex items-center justify-between gap-1.5 min-w-0 pb-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-emerald-400 text-[10px] font-bold font-outfit tracking-wider uppercase truncate">
                    {t('upcomingFestivals').toUpperCase()}
                  </span>
                  <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded text-[8px] font-extrabold font-outfit uppercase shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                    {panchang.upcomingFestival.daysText || panchang.upcomingFestival.badge}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold font-outfit shadow-sm group-hover:bg-emerald-500/25 group-hover:border-emerald-400/50 transition-all shrink-0">
                  <Calendar size={11} className="text-emerald-400 shrink-0" />
                  <span>{t('viewAllFestivals')}</span>
                  <ChevronRight size={12} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </span>
              </div>

              {/* Main content */}
              <div className="flex items-start gap-2.5 min-w-0 pt-0.5">
                <div className="rounded-xl bg-slate-950/60 border border-white/10 p-2 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center w-10 h-10">
                  {panchang.upcomingFestival.icon ? (
                    <span className="text-xl leading-none select-none">{panchang.upcomingFestival.icon}</span>
                  ) : (
                    <Moon size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white leading-snug break-words whitespace-normal group-hover:text-emerald-300 transition-colors font-sans min-w-0">
                    {translateTerm(panchang.upcomingFestival.title, language)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 break-words whitespace-normal font-sans line-clamp-2 min-w-0">
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
            </div>

            {/* Value-Driven Tap Micro-CTA Footer */}
            <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] relative z-10 min-w-0">
              <div className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 border border-emerald-500/35 group-hover:border-emerald-400/70 text-emerald-200 group-hover:text-white text-[11px] font-semibold font-outfit tracking-wide transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{t('exploreMonthlyCalendar')}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-grotesk">
                    {language === 'en' ? 'Next 12 Months' : (language === 'hi' ? 'आगामी १२ माह' : (language === 'sa' ? 'आगामिद्वादशमासाः' : (language === 'mr' ? 'पुढील १२ महिने' : 'આગામી ૧૨ મહિના')))}
                  </span>
                  <ChevronRight size={13} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Optional Expandable Deep Panchang Details ── */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900/60 font-outfit"
          >
            <Layers size={13} />
            <span>
              {showDetails
                ? (language === 'en' ? 'Hide Detailed Limbs & Timeline' : (language === 'hi' ? 'विस्तृत अंग एवं समयरेखा छुपाएं' : (language === 'sa' ? 'विस्तृताङ्गानि समयरेखां च गोपयतु' : (language === 'mr' ? 'सविस्तर अंगे व टाइमलाइन लपवा' : 'વિગતવાર અંગો અને સમયરેખા છુપાવો'))))
                : (language === 'en' ? 'View Full 5-Limbs, Muhurats & 24h Choghadiya Timeline' : (language === 'hi' ? 'संपूर्ण पञ्चाङ्ग, मुहूर्त एवं २४ घंटे चौघड़िया देखें' : (language === 'sa' ? 'सम्पूर्णपञ्चाङ्गं मुहूर्तान् २४होरा चौघडिया च पश्यन्तु' : (language === 'mr' ? 'संपूर्ण पंचांग, मुहूर्त व २४ तास चौघडिया पहा' : 'સંપૂર્ણ પંચાંગ, મુહૂર્ત અને ૨૪ કલાક ચોઘડિયા જુઓ'))))}
            </span>
            <ChevronRight size={13} className={`transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
          <span className="text-[11px] text-slate-400 font-grotesk tabular-nums">
            Swiss Ephemeris • Lahiri Ayanamsha
          </span>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-6 animate-in fade-in duration-200 relative z-10">
            
            {/* Tabs header */}
            <div className="relative">
              <div 
                className="flex overflow-x-auto gap-2 pb-2.5 pt-0.5 border-b border-white/10 scroll-smooth snap-x snap-proximity overscroll-x-contain horizontal-tabs-scroll [-webkit-overflow-scrolling:touch]"
                style={{ touchAction: 'pan-x pan-y' }}
              >
                {[
                  { id: 'panchang', label: t('fiveLimbsTitle') },
                  { id: 'choghadiya', label: t('tabChoghadiya') },
                  { id: 'muhurat', label: t('tabMuhurat') },
                  { id: 'astrometry', label: t('tabAstrometry') },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      if (tab.id === 'muhurat') {
                        handleMuhuratClick();
                      } else {
                        setActiveTab(tab.id as WidgetTabType);
                      }
                    }}
                    className={`shrink-0 snap-start px-3.5 py-1.5 rounded-xl text-xs font-bold font-outfit transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                      activeTab === tab.id
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 1: 5 Limbs */}
            {activeTab === 'panchang' && (
              <div 
                id="five-limbs-section"
                className="scroll-mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
              >
                {/* 1. TITHI CARD */}
                <div 
                  onClick={() => openLimbModal('tithi')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('tithi'); }}}
                  title="Click to view deep Tithi attributes and deity"
                  aria-label="View Tithi details"
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-[#1e2d4f] hover:border-orange-500/40 cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold font-outfit uppercase gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="truncate">1. {t('tithi').toUpperCase()}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                        <span>{language === 'en' ? 'Deity' : (language === 'hi' ? 'देवता' : (language === 'sa' ? 'देवता' : (language === 'mr' ? 'देवता' : 'દેવતા')))}</span>
                        <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white font-serif font-devanagari group-hover:text-amber-200 transition-colors truncate">{translateTerm(panchang.tithi.name, language)}</div>
                    <div className="text-[11px] text-slate-400 font-sans truncate">{language === 'en' ? 'Deity' : (language === 'hi' ? 'देवता' : (language === 'sa' ? 'देवता' : (language === 'mr' ? 'देवता' : 'દેવતા')))}: {translateTerm(panchang.tithi.deity, language)}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{language === 'en' ? 'Tap for Tithi Attributes & Deity' : (language === 'hi' ? 'तिथी के गुण एवं देवता विस्तार देखें' : (language === 'sa' ? 'तिथिलक्षणानि देवतां च पश्यन्तु' : (language === 'mr' ? 'तिथीचे गुणधर्म व देवता पहा' : 'તિથિના ગુણો અને દેવતા જુઓ')))}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 2. NAKSHATRA CARD */}
                <div 
                  onClick={() => openLimbModal('nakshatra')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('nakshatra'); }}}
                  title="Click to view deep Nakshatra pada, lord and symbol"
                  aria-label="View Nakshatra details"
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-[#1e2d4f] hover:border-orange-500/40 cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold font-outfit uppercase gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="truncate">2. {t('nakshatra').toUpperCase()}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                        <span>{language === 'en' ? 'Pada & Lord' : (language === 'hi' ? 'चरण एवं स्वामी' : (language === 'sa' ? 'पादः स्वामी च' : (language === 'mr' ? 'चरण व स्वामी' : 'ચરણ અને સ્વામી')))}</span>
                        <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white font-serif font-devanagari group-hover:text-amber-200 transition-colors truncate">{translateTerm(panchang.nakshatra.name, language)} {panchang.nakshatra.devanagari && language === 'en' ? `(${panchang.nakshatra.devanagari})` : ''}</div>
                    <div className="text-[11px] text-slate-400 font-sans truncate">{language === 'en' ? 'Pada' : (language === 'hi' ? 'चरण' : (language === 'sa' ? 'पादः' : (language === 'mr' ? 'चरण' : 'ચરણ')))} {panchang.nakshatra.pada} • {t('ruler')} {translateTerm(panchang.nakshatra.lord, language)}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{language === 'en' ? 'Tap for Planetary & Nakshatra Details' : (language === 'hi' ? 'ग्रह एवं नक्षत्र विस्तार देखें' : (language === 'sa' ? 'ग्रहाणां नक्षत्राणां च विवरणं पश्यन्तु' : (language === 'mr' ? 'ग्रह व नक्षत्र तपशील पहा' : 'ગ્રહ અને નક્ષત્ર વિગતો જુઓ')))}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 3. YOGA CARD */}
                <div 
                  onClick={() => openLimbModal('yoga')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('yoga'); }}}
                  title="Click to view deep Yoga meaning and auspiciousness"
                  aria-label="View Yoga details"
                  className={`p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border ${
                    panchang.yoga.nature === 'Shubh' ? 'border-emerald-500/35 hover:border-emerald-400/60' : 'border-rose-500/35 hover:border-rose-400/60'
                  } cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex justify-between items-center gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="text-[10px] text-amber-400 font-bold font-outfit uppercase truncate">3. {t('yoga').toUpperCase()}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border font-outfit uppercase shrink-0 ${
                          panchang.yoga.nature === 'Shubh' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                        }`}>
                          {panchang.yoga.nature === 'Shubh' ? t('auspicious').toUpperCase() : t('inauspicious').toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                          <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white font-serif font-devanagari group-hover:text-amber-200 transition-colors truncate">{translateTerm(panchang.yoga.name, language)}</div>
                    <div className="text-[11px] text-slate-400 font-sans truncate">{panchang.yoga.meaning}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{language === 'en' ? 'Tap for Yoga Astrological Meaning' : (language === 'hi' ? 'योग फल एवं फलित विस्तार देखें' : (language === 'sa' ? 'योगफलितं विवरणं च पश्यन्तु' : (language === 'mr' ? 'योगाचे फलित व महत्त्व पहा' : 'યોગનું ફળ અને મહત્વ જુઓ')))}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 4. KARANA CARD */}
                <div 
                  onClick={() => openLimbModal('karana')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('karana'); }}}
                  title="Click to view Karana category and ruling lord"
                  aria-label="View Karana details"
                  className={`p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border ${
                    panchang.karana.auspicious ? 'border-emerald-500/35 hover:border-emerald-400/60' : 'border-rose-500/35 hover:border-rose-400/60'
                  } cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex justify-between items-center gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="text-[10px] text-amber-400 font-bold font-outfit uppercase truncate">4. {t('karana').toUpperCase()}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border font-outfit uppercase shrink-0 ${
                          panchang.karana.auspicious ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                        }`}>
                          {panchang.karana.auspicious ? t('auspicious').toUpperCase() : t('inauspicious').toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                          <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white font-serif font-devanagari group-hover:text-amber-200 transition-colors truncate">{translateTerm(panchang.karana.name, language)}</div>
                    <div className="text-[11px] text-slate-400 font-sans truncate">{panchang.karana.type}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{language === 'en' ? 'Tap for Karana Category & Ruling Lord' : (language === 'hi' ? 'करण प्रकार एवं स्वामी विस्तार देखें' : (language === 'sa' ? 'करणप्रकारं स्वामिनं च पश्यन्तु' : (language === 'mr' ? 'करण प्रकार व स्वामी पहा' : 'કરણ પ્રકાર અને સ્વામી જુઓ')))}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 5. VAAR CARD */}
                <div 
                  onClick={() => openLimbModal('vaar')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('vaar'); }}}
                  title="Click to view Vaar ruler and civil Ahoratra span"
                  aria-label="View Vaar details"
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-[#1e2d4f] hover:border-orange-500/40 cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold font-outfit uppercase gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="truncate">5. {t('vaar').toUpperCase()}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                        <span>{t('ruler')}</span>
                        <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white font-serif font-devanagari group-hover:text-amber-200 transition-colors truncate">{translateTerm(panchang.vaar.name, language)}</div>
                    <div className="text-[11px] text-amber-400 font-sans truncate">{translateTerm(panchang.vaar.lord, language)}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{language === 'en' ? 'Tap for Vaar Ruler & Civil Span' : (language === 'hi' ? 'वार स्वामी एवं अहोरात्र विस्तार देखें' : (language === 'sa' ? 'वारस्वामिनम् अहोरात्रविस्तारं च पश्यन्तु' : (language === 'mr' ? 'वार स्वामी व अहोरात्र तपशील पहा' : 'વાર સ્વામી અને અહોરાત્ર વિગત જુઓ')))}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Choghadiya */}
            {activeTab === 'choghadiya' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 font-outfit">☀️ {t('daytimeChoghadiya')}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {panchang.dayChoghadiya.map((slot, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border text-xs ${slot.isCurrent ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-950/60 border-white/10'}`}>
                        <div className="flex justify-between font-bold text-white">
                          <span className="font-serif font-devanagari">{translateTerm(slot.name, language)}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold border font-outfit ${
                            slot.nature === 'AUSPICIOUS' 
                              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                              : slot.nature === 'NEUTRAL' 
                              ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' 
                              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                          }`}>{translateTerm(slot.quality, language)} ({slot.nature === 'AUSPICIOUS' ? t('auspicious') : slot.nature === 'NEUTRAL' ? t('neutral') : t('inauspicious')})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-grotesk font-mono tabular-nums mt-1">{slot.startTime} - {slot.endTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 font-outfit">🌙 {t('nighttimeChoghadiya')}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {panchang.nightChoghadiya.map((slot, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border text-xs ${slot.isCurrent ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-950/60 border-white/10'}`}>
                        <div className="flex justify-between font-bold text-white">
                          <span className="font-serif font-devanagari">{translateTerm(slot.name, language)}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold border font-outfit ${
                            slot.nature === 'AUSPICIOUS' 
                              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                              : slot.nature === 'NEUTRAL' 
                              ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' 
                              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                          }`}>{translateTerm(slot.quality, language)} ({slot.nature === 'AUSPICIOUS' ? t('auspicious') : slot.nature === 'NEUTRAL' ? t('neutral') : t('inauspicious')})</span>
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
              <div 
                id="muhurat-section"
                className="scroll-mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                {/* 1. BRAHMA MUHURAT */}
                <div 
                  onClick={() => setIsMuhuratModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsMuhuratModalOpen(true); }}}
                  title="Click to view all 30 Vedic Muhurats"
                  aria-label="View Brahma Muhurat and All 30 Muhurats"
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-emerald-500/35 hover:border-emerald-400/60 cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between items-center gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase font-outfit truncate">{translateTerm('Brahma Muhurat', language)}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-outfit uppercase">{t('auspicious').toUpperCase()}</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                          <span>{language === 'en' ? '30 Muhurats' : (language === 'hi' ? '३० मुहूर्त' : (language === 'sa' ? '३० मुहूर्ताः' : (language === 'mr' ? '३० मुहूर्त' : '૩૦ મુહૂર્ત')))}</span>
                          <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold font-grotesk font-mono tabular-nums text-emerald-300 mt-1">{panchang.muhurats.brahmaMuhurat.start} - {panchang.muhurats.brahmaMuhurat.end}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{t('tap24hMuhurat')}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 2. ABHIJIT MUHURAT */}
                <div 
                  onClick={() => setIsMuhuratModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsMuhuratModalOpen(true); }}}
                  title="Click to view all 30 Vedic Muhurats"
                  aria-label="View Abhijit Muhurat and All 30 Muhurats"
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-emerald-500/35 hover:border-emerald-400/60 cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between items-center gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase font-outfit truncate">{translateTerm('Abhijit Muhurat', language)}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-outfit uppercase">{t('auspicious').toUpperCase()}</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                          <span>{language === 'en' ? '30 Muhurats' : (language === 'hi' ? '३० मुहूर्त' : (language === 'sa' ? '३० मुहूर्ताः' : (language === 'mr' ? '३० मुहूर्त' : '૩૦ મુહૂર્ત')))}</span>
                          <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold font-grotesk font-mono tabular-nums text-emerald-300 mt-1">{panchang.muhurats.abhijitMuhurat.start} - {panchang.muhurats.abhijitMuhurat.end}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{t('tap24hMuhurat')}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 3. GULIKA KAAL */}
                <div 
                  onClick={() => setIsMuhuratModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsMuhuratModalOpen(true); }}}
                  title="Click to view all 30 Vedic Muhurats"
                  aria-label="View Gulika Kaal and All 30 Muhurats"
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-amber-500/35 hover:border-amber-400/60 cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between items-center gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="text-[10px] text-amber-400 font-bold uppercase font-outfit truncate">{translateTerm('Gulika Kaal', language)}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-950/60 border border-amber-500/30 text-amber-300 font-outfit uppercase">{t('neutral').toUpperCase()}</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                          <span>{language === 'en' ? '30 Muhurats' : (language === 'hi' ? '३० मुहूर्त' : (language === 'sa' ? '३० मुहूर्ताः' : (language === 'mr' ? '३० मुहूर्त' : '૩૦ મુહૂર્ત')))}</span>
                          <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold font-grotesk font-mono tabular-nums text-amber-300 mt-1">{panchang.muhurats.gulikaKaal.start} - {panchang.muhurats.gulikaKaal.end}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{t('tap24hMuhurat')}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 4. RAHU KAAL */}
                <div 
                  onClick={() => setIsMuhuratModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsMuhuratModalOpen(true); }}}
                  title="Click to view all 30 Vedic Muhurats"
                  aria-label="View Rahu Kaal and All 30 Muhurats"
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#090e1a] to-[#0f172a] border border-rose-500/35 hover:border-rose-400/60 cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between shadow-lg min-w-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between items-center gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="text-[10px] text-rose-400 font-bold uppercase font-outfit truncate">{translateTerm('Rahu Kaal', language)}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-950/60 border border-rose-500/30 text-rose-300 font-outfit uppercase">{t('inauspicious').toUpperCase()}</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-semibold font-outfit shadow-sm group-hover:bg-orange-500/25 transition-all shrink-0">
                          <span>{language === 'en' ? '30 Muhurats' : (language === 'hi' ? '३० मुहूर्त' : (language === 'sa' ? '३० मुहूर्ताः' : (language === 'mr' ? '३० मुहूर्त' : '૩૦ મુહૂર્ત')))}</span>
                          <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold font-grotesk font-mono tabular-nums text-rose-300 mt-1">{panchang.muhurats.rahuKaal.start} - {panchang.muhurats.rahuKaal.end}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4f] min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 group-hover:border-orange-400/60 text-orange-200 group-hover:text-white text-[10px] font-semibold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="truncate">{t('tap24hMuhurat')}</span>
                      <ChevronRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Astrometry */}
            {activeTab === 'astrometry' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="font-bold text-amber-400 mb-2 font-outfit">☀️ {language === 'en' ? 'Surya Astrometry (Solar)' : (language === 'hi' ? 'सूर्य खगोलीय स्थिति (सौर)' : (language === 'sa' ? 'सूर्यखगोलीयस्थितिः (सौरम्)' : (language === 'mr' ? 'सूर्य खगोलीय स्थिती (सौर)' : 'સૂર્ય ખગોળીય સ્થિતિ (સૌર)')))}</div>
                  <div className="space-y-1 text-slate-300">
                    <div>{t('sunSign')}: <span className="font-semibold text-white">{translateTerm(panchang.suryaRashi.name, language)} ({panchang.suryaRashi.degree})</span></div>
                    <div>{t('dayDuration')}: <span className="font-semibold text-white font-grotesk tabular-nums">{panchang.dayLength}</span></div>
                    <div>{t('ayana')}: <span className="font-semibold text-white">{translateTerm(panchang.ayana, language)}</span></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="font-bold text-indigo-400 mb-2 font-outfit">🌙 {language === 'en' ? 'Chandra Astrometry (Lunar)' : (language === 'hi' ? 'चन्द्र खगोलीय स्थिति (चान्द्र)' : (language === 'sa' ? 'चन्द्रखगोलीयस्थितिः (चान्द्रम्)' : (language === 'mr' ? 'चंद्र खगोलीय स्थिती (चांद्र)' : 'ચંદ્ર ખગોળીય સ્થિતિ (ચાંદ્ર)')))}</div>
                  <div className="space-y-1 text-slate-300">
                    <div>{t('moonSign')}: <span className="font-semibold text-white">{translateTerm(panchang.chandraRashi.name, language)} ({panchang.chandraRashi.degree})</span></div>
                    <div>{language === 'en' ? 'Moon Phase' : (language === 'hi' ? 'चन्द्र कला' : (language === 'sa' ? 'चन्द्रकला' : (language === 'mr' ? 'चंद्र कला' : 'ચંદ્ર કળા')))}: <span className="font-semibold text-white">{translateTerm(panchang.moonPhaseName, language)} ({panchang.moonIlluminationPercent}%)</span></div>
                    <div>{language === 'en' ? 'Moonrise / Moonset' : (language === 'hi' ? 'चन्द्रोदय / चन्द्रास्त' : (language === 'sa' ? 'चन्द्रोदयः / चन्द्रास्तः' : (language === 'mr' ? 'चंद्रोदय / चंद्रास्त' : 'ચંદ્રોદય / ચંદ્રાસ્ત')))}: <span className="font-semibold text-white font-grotesk tabular-nums">{panchang.moonrise} / {panchang.moonset}</span></div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── Widget Bottom Utility Footer ── */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2 text-[11px] text-slate-400 relative z-10">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
            Surya Siddhanta &amp; Swiss Ephemeris Engine (DE431)
          </span>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">
            Lahiri Ayanamsha
          </span>
        </div>

      </div>

      {/* ── Interactive Modals ── */}
      {/* Embed on Your Site: modal container */}
      <EmbedWidgetModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        defaultCity={selectedLocation.name}
      />
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

      <FiveLimbsModal
        isOpen={isFiveLimbsModalOpen}
        onClose={() => setIsFiveLimbsModalOpen(false)}
        panchang={panchang}
        initialLimb={activeLimbForModal}
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

      {/* ── Background Notification System: Settings Modal ── */}
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

    </>
  );
}
