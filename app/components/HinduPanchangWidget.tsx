"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Sparkles, MapPin, ChevronDown, X,
  Clock, Sun, Compass, Calendar, Moon,
  ChevronRight, ChevronLeft, Star, Flame, Layers,
  ShieldAlert, ShieldCheck, ArrowUpRight, Bell, Code2, RotateCcw,
  Share2, Check, Globe, Navigation
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
  formatUtcDateToLocalTime,
  cleanMasaMonthName,
  formatNormalizedPakshaTithi,
  getCivilDateInLocation
} from '../../src/lib/vedic-astronomy';
import { usePanchangAutoSync } from '../../src/hooks/usePanchangAutoSync';
import { usePanchang } from '../../src/hooks/usePanchang';
import { CITIES, getCityCode } from '../../src/lib/cities';
import type { CityConfig } from '../../src/lib/constants/cities';
import { getActivePanchakStatus } from '../../src/lib/dharmashastra-rules';
import { TithiMonthModal, CalendarFilterTab } from './modals/TithiMonthModal';
import { GregorianCalendarModal } from './modals/GregorianCalendarModal';
import { MonthlyMuhuratModal } from './modals/MonthlyMuhuratModal';
import { FiveLimbsModal, LimbTabType } from './modals/FiveLimbsModal';
import { PanchakModal } from './modals/PanchakModal';
import { getUpcomingFestivalsList } from '../../src/lib/festivals';
import { NotificationSettingsModal } from './modals/NotificationSettingsModal';
import { WhatsAppIcon } from './WhatsAppShareButton';
import { EmbedWidgetModal } from '../../src/components/EmbedWidgetModal';
import { sharePanchang, buildShareDataFromPanchang, formatPanchangShareText } from '../../src/lib/utils/sharePanchang';
import {
  getSavedLocationState,
  requestGpsLocation,
  checkHasMovedSignificantly,
  persistLocationState,
  LocationSource
} from '../../src/lib/location-service';
import { formatLastUpdatedTime } from '../../src/lib/panchang-cache';
import { getHolidayAndEclipseDetails } from '../../src/lib/eclipses-and-holidays';
import { 
  calculateDayMuhurat,
  findNextAuspiciousMuhurat,
  ShubhKaryaCategory 
} from '../../src/lib/panchang/monthlyMuhuratEngine';


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

  const cleanAmanta = cleanMasaMonthName(amantaMonth, lang) || 'Masa';
  const cleanPurnimanta = cleanMasaMonthName(purnimantaMonth, lang) || 'Masa';

  if (isNorthIndia) {
    return `${cleanPurnimanta} · ${purnimantaLabel} · VS ${vikramSamvat}`;
  } else {
    return `${cleanAmanta} · ${amantaLabel} · Shaka ${shakaSamvat}`;
  }
}

// Normalized Tithi string output (strict "[Paksha]- [Tithi]", e.g. "Krishna- Saptami" or "Shukla- Pratipada")
function formatShortenedTithi(tithiIndex: number, lang: SupportedLanguage = 'en', fallbackName?: string): string {
  const tithiObj = TITHIS[(tithiIndex - 1) % 30];
  if (!tithiObj) {
    if (!fallbackName) return 'Tithi';
    return formatNormalizedPakshaTithi(undefined, fallbackName, lang);
  }

  return formatNormalizedPakshaTithi(tithiObj.paksha, tithiObj.name, lang, tithiObj.pureName);
}

export interface HinduPanchangWidgetProps {
  initialLocation?: LocationCoordinates;
  initialData?: PanchangData | any;
  initialCity?: CityConfig;
  isCityPage?: boolean;
  initialLanguage?: SupportedLanguage;
}

export function HinduPanchangWidget({
  initialLocation,
  initialData,
  initialCity,
  isCityPage = false,
  initialLanguage,
}: HinduPanchangWidgetProps) {
  // Resolve location from initialCity (typed CityConfig), initialLocation, or default New Delhi
  const resolvedInitialLocation: LocationCoordinates = initialCity
    ? {
        name: `${initialCity.name}, ${initialCity.state}`,
        country: 'India',
        latitude: initialCity.latitude,
        longitude: initialCity.longitude,
        timezone: 5.5,
        ianaTimezone: initialCity.timezone || 'Asia/Kolkata',
        regionName: initialCity.state,
      }
    : (initialLocation || PRESET_LOCATIONS[0]);

  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>(
    resolvedInitialLocation
  );
  type WidgetTabType = 'panchang' | 'astrometry';

  const [locationSource, setLocationSource] = useState<'gps' | 'dropdown' | 'fallback'>('fallback');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const [isGpsDetecting, setIsGpsDetecting] = useState<boolean>(false);
  const { language, setLanguage, isHindi, t, translateTerm, localeCode } = useLanguage();

  useEffect(() => {
    if (initialLanguage && language !== initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage, language, setLanguage]);

  // Single Source of Truth (SSOT) Cascading Panchang Hook
  const {
    observer,
    selectedDate,
    liveTime,
    targetInstant,
    targetDayKey,
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
    initialData,
    isLiveMode: true,
    localeCode
  });

  useEffect(() => {
    // If locked to a dedicated city page route or initialCity is provided, preserve that city
    if ((isCityPage || initialCity) && (initialCity || initialLocation)) {
      const targetLoc = initialCity ? resolvedInitialLocation : initialLocation!;
      setSelectedLocation(targetLoc);
      setObserver(targetLoc);
      return;
    }

    // On client mount, check localStorage for saved user coordinates
    // Smoothly transition state without wiping the server-rendered DOM
    const saved = getSavedLocationState();
    if (saved?.location) {
      const isDiff =
        Math.abs(saved.location.latitude - selectedLocation.latitude) > 0.001 ||
        Math.abs(saved.location.longitude - selectedLocation.longitude) > 0.001;
      if (isDiff) {
        setSelectedLocation(saved.location);
        setObserver(saved.location);
        setLocationSource(saved.source);
      }
    }

    // Auto-detect or refresh GPS location:
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      if (saved?.source === 'gps') {
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
      } else if (typeof navigator.permissions !== 'undefined' && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((status) => {
          if (status.state === 'granted') {
            requestGpsLocation().then((res) => {
              if (res.success && res.location) {
                setSelectedLocation(res.location);
                setObserver(res.location);
                setLocationSource('gps');
              }
            });
          }
        }).catch(() => {});
      }
    }
  }, [initialLocation, isCityPage, setObserver]);

  // Listen to global location changes (e.g. from CitySearchModal or NotificationSettingsModal)
  useEffect(() => {
    const handleLocationChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ location: LocationCoordinates; source?: LocationSource }>;
      if (customEvent.detail?.location) {
        setSelectedLocation(customEvent.detail.location);
        setObserver(customEvent.detail.location);
        if (customEvent.detail.source) {
          setLocationSource(customEvent.detail.source);
        }
      }
    };
    window.addEventListener('locationchange', handleLocationChange);
    return () => window.removeEventListener('locationchange', handleLocationChange);
  }, [setObserver]);

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

  // Open Monthly Shubh Karya Muhurat modal
  const handleMuhuratClick = (category: ShubhKaryaCategory = 'all') => {
    setSelectedMuhuratCategory(category);
    setIsMonthlyMuhuratOpen(true);
  };

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Unified Calendar Modal State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [calendarInitialTab, setCalendarInitialTab] = useState<CalendarFilterTab>('all');
  const openCalendar = useCallback((tab: CalendarFilterTab = 'all') => {
    setCalendarInitialTab(tab);
    setIsCalendarModalOpen(true);
  }, []);

  // Modal states for click interactions
  const [isGregorianCalendarModalOpen, setIsGregorianCalendarModalOpen] = useState<boolean>(false);
  const [isMonthlyMuhuratOpen, setIsMonthlyMuhuratOpen] = useState<boolean>(false);
  const [selectedMuhuratCategory, setSelectedMuhuratCategory] = useState<ShubhKaryaCategory>('all');
  const [isFiveLimbsModalOpen, setIsFiveLimbsModalOpen] = useState<boolean>(false);
  const [activeLimbForModal, setActiveLimbForModal] = useState<LimbTabType>('tithi');
  const [isPanchakModalOpen, setIsPanchakModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);

  const openLimbModal = (limb: LimbTabType = 'tithi') => {
    setActiveLimbForModal(limb);
    setIsFiveLimbsModalOpen(true);
  };

  const menuRef = useRef<HTMLDivElement>(null);

  // SSOT reactive bindings for Cards
  const panchakStatus = observances.panchak;
  const activeTimezone = observer.timezone;
  const holidayDetails = observances.holidayDetails;
  const formattedTzOffset = observer.formattedTzOffset;
  const nextTithiName = tithiDetails.nextTithiName;
  const newTithiStartTime = tithiDetails.newTithiStartTime;
  const currentTithiEndTime = tithiDetails.currentTithiEndTime;
  const newTithiObservedWhen = tithiDetails.newTithiObservedWhen;
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

  // Visual Tithi percentage elapsed & day-transition status for Card 2
  const tithiProgressPercent = useMemo(() => {
    const raw = tithiResolution?.instantaneousTithi?.percentageElapsed 
      ?? panchang?.instantaneousTithi?.completionPercent 
      ?? panchang?.tithi?.completionPercent 
      ?? 0;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }, [tithiResolution, panchang]);

  const tithiStatusLabel = useMemo(() => {
    if (isPreSunrise) {
      return isHindi ? 'सूर्योदय से पूर्व' : 'Pre-Dawn';
    }
    const isTransitioned = Boolean(
      panchang.instantaneousTithi?.name && 
      panchang.udayaTithi?.name && 
      panchang.instantaneousTithi.name !== panchang.udayaTithi.name
    );
    if (isTransitioned) {
      return isHindi ? 'नूतन तिथि सक्रिय' : 'Next Tithi Active';
    }
    return `${isHindi ? 'समाप्त' : 'Ends'} ${currentTithiEndTime}`;
  }, [isPreSunrise, isHindi, panchang, currentTithiEndTime]);

  // Chronological upcoming festivals list for compact list view (memoized by civil date & location)
  const upcomingFestivalsList = useMemo(() => {
    return getUpcomingFestivalsList(targetInstant, selectedLocation, 1, 90);
  }, [targetDayKey, selectedLocation]);

  // Dedicated Gregorian Date formatters (memoized by civil date, timezone & locale)
  const gregorianDayNumber = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeCode, {
        day: '2-digit',
        timeZone: observer.timezone
      }).format(targetInstant);
    } catch {
      return String(targetInstant.getDate()).padStart(2, '0');
    }
  }, [targetDayKey, observer.timezone, localeCode]);

  const gregorianMonthYear = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeCode, {
        month: 'long',
        year: 'numeric',
        timeZone: observer.timezone
      }).format(targetInstant);
    } catch {
      return targetInstant.toLocaleDateString(localeCode, { month: 'long', year: 'numeric' });
    }
  }, [targetDayKey, observer.timezone, localeCode]);

  const gregorianWeekday = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeCode, {
        weekday: 'long',
        timeZone: observer.timezone
      }).format(targetInstant);
    } catch {
      return targetInstant.toLocaleDateString(localeCode, { weekday: 'long' });
    }
  }, [targetDayKey, observer.timezone, localeCode]);

  // Today's Shubh Karya Muhurat calculation for Card 3 (memoized by civil date & location)
  const todayMuhurat = useMemo(() => {
    return calculateDayMuhurat(targetInstant, selectedLocation);
  }, [targetDayKey, selectedLocation]);

  const nextUpcomingMuhurat = useMemo(() => {
    if (todayMuhurat.isAuspiciousDay) return null;
    return findNextAuspiciousMuhurat(targetInstant, selectedLocation);
  }, [todayMuhurat.isAuspiciousDay, targetDayKey, selectedLocation]);

  // Formatted date string for native date input (YYYY-MM-DD) anchored to observer's local civil date
  const selectedDateYyyyMmDd = useMemo(() => {
    const d = isLiveMode ? targetInstant : selectedDate;
    const civil = getCivilDateInLocation(d, observer.tzOffset, observer.timezone);
    return civil.dateKey;
  }, [isLiveMode, targetInstant, selectedDate, observer.tzOffset, observer.timezone]);

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
      const panchakDetail = panchakStatus?.isActive && panchakStatus?.panchak
        ? `${panchakStatus.panchak.type} (${panchakStatus.panchak.startDate} ${panchakStatus.panchak.startTime} – ${panchakStatus.panchak.endDate} ${panchakStatus.panchak.endTime})`
        : 'No active';

      const shareDataObj = buildShareDataFromPanchang(
        selectedDate,
        panchang,
        activeMuhurat,
        panchakDetail
      );
      const formattedText = formatPanchangShareText(shareDataObj);
      const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://dailytithi.com';

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ title: 'Daily Tithi — Vedic Panchang', text: formattedText })
      ) {
        try {
          await navigator.share({
            title: 'Daily Tithi — Vedic Panchang',
            text: formattedText
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
      <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-amber-500/25 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] p-2.5 sm:p-5 text-left transition-all duration-300 font-sans relative overflow-x-hidden touch-pan-y">
        {/* Subtle celestial observatory ambient background lighting */}
        <div className="absolute -top-10 right-1/4 w-96 h-96 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.12)_0%,_transparent_70%)] pointer-events-none -z-0" />
        <div className="absolute top-20 -left-10 w-96 h-96 rounded-full bg-[radial-gradient(circle,_rgba(147,51,234,0.12)_0%,_transparent_70%)] pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-[radial-gradient(circle,_rgba(20,184,166,0.08)_0%,_transparent_70%)] pointer-events-none -z-0" />
        
        {/* ── Consolidated Top Control Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 p-1.5 sm:p-2.5 bg-gradient-to-r from-[#0b1224]/90 via-[#0e162d]/90 to-[#0b1224]/90 backdrop-blur-xl rounded-2xl border border-amber-500/25 text-xs relative z-30 mb-2.5 shadow-md">
          {/* Left Group: Location / GPS Selector & Share Button */}
          <div className="flex items-center gap-1.5 min-w-0">
            {/* 1. City Dropdown with Compact 3-Letter City Code */}
            <div className="relative inline-flex items-center min-w-0 shrink-0">
              <div 
                className="inline-flex items-center gap-1.5 pl-2.5 pr-6 py-2 bg-slate-900/90 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 rounded-xl text-xs font-bold text-amber-100 shadow-sm min-h-[44px] pointer-events-none"
              >
                <MapPin size={13} className="text-amber-400 shrink-0" />
                <span className="font-mono tracking-wider font-extrabold uppercase">
                  {getCityCode(selectedLocation.name)}
                </span>
                <ChevronDown size={12} className="absolute right-2 text-slate-400" />
              </div>
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
                title={`City: ${selectedLocation.name} (${getCityCode(selectedLocation.name)})`}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              >
                {locationSource === 'gps' && !ALL_LOCATIONS.some((l) => l.name === selectedLocation.name) && (
                  <option value={selectedLocation.name} className="bg-slate-900 text-emerald-300 font-bold">
                    📍 [{getCityCode(selectedLocation.name)}] {selectedLocation.name}
                  </option>
                )}
                {ALL_LOCATIONS.map((loc) => (
                  <option key={`${loc.name}-${loc.country}`} value={loc.name} className="bg-slate-900 text-white">
                    [{getCityCode(loc.name)}] {loc.name} ({loc.country})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Precision GPS Symbol Button */}
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
              title={locationSource === 'gps' ? t('gpsActive') : t('useGps')}
              aria-label={locationSource === 'gps' ? t('gpsActive') : t('useGps')}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm shrink-0 active:scale-95 ${
                locationSource === 'gps'
                  ? 'bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 text-amber-300 hover:text-white border border-amber-500/25 hover:border-amber-400'
              }`}
            >
              <Navigation 
                size={16} 
                className={isGpsDetecting ? 'animate-spin text-amber-400' : (locationSource === 'gps' ? 'text-emerald-400 fill-emerald-400' : 'text-amber-400')} 
              />
            </button>

            {/* 3. WhatsApp Share Symbol Button */}
            <div className="relative inline-flex items-center shrink-0">
              <button
                type="button"
                onClick={handleShare}
                title="Share Today's Panchang on WhatsApp"
                aria-label="Share Today's Panchang on WhatsApp"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:via-green-500 hover:to-emerald-500 border border-emerald-400/40 text-white transition-all shadow-[0_0_18px_rgba(16,185,129,0.38)] hover:shadow-[0_0_26px_rgba(16,185,129,0.58)] active:scale-95 cursor-pointer shrink-0"
              >
                <WhatsAppIcon className="w-5 h-5 text-white shrink-0 drop-shadow" />
              </button>

              {shareToast && (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute -top-8 left-0 z-50 whitespace-nowrap px-2.5 py-1 rounded-lg bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-[10px] font-medium shadow-xl flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-150 pointer-events-none"
                >
                  <Check size={11} className="text-emerald-400 shrink-0" />
                  <span>{shareToast}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Group: Date Picker / Live, Global Language Dropdown, Install App */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end ml-auto shrink-0">
            {/* 4. Date Picker & Live Indicator */}
            <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-amber-500/30 shrink-0 shadow-sm">
              <button
                type="button"
                onClick={handlePrevDay}
                aria-label={t('prevDay')}
                title={t('prevDay')}
                className="p-1.5 sm:p-2 min-w-[36px] sm:min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>

              <input
                type="date"
                value={selectedDateYyyyMmDd}
                onChange={handleDateChange}
                aria-label={t('selectDate')}
                title={t('selectDate')}
                className="bg-transparent text-xs sm:text-xs font-mono text-slate-200 cursor-pointer focus:outline-none px-1 py-1 min-h-[44px] max-w-[105px] sm:max-w-[115px]"
              />

              <button
                type="button"
                onClick={handleNextDay}
                aria-label={t('nextDay')}
                title={t('nextDay')}
                className="p-1.5 sm:p-2 min-w-[36px] sm:min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>

              {/* Live Status Pill / Reset Button */}
              {isLiveMode ? (
                <div 
                  title={t('live')}
                  aria-label={t('live')}
                  className="flex items-center justify-center px-2 sm:px-3 py-1 min-h-[44px] rounded-lg bg-emerald-950/90 border border-emerald-400/50 text-emerald-300 text-[10px] font-mono font-bold select-none shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                  <span className="tracking-wider ml-1.5 hidden md:inline">{t('live')}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResetToLive}
                  title={t('resetToLive')}
                  aria-label={t('resetToLive')}
                  className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1 min-h-[44px] rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[10px] font-bold cursor-pointer transition-all shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                >
                  <RotateCcw size={13} className="text-amber-400 shrink-0" />
                  <span className="hidden md:inline">{t('live')}</span>
                </button>
              )}
            </div>

            {/* 5. Global Language Dropdown */}
            <LanguageDropdown />

            {/* 6. Install App Button (only when not installed) */}
            <PWAInstallButton />
          </div>
        </div>

        {/* ── Main Top 3-Card Row (Compact Above-The-Fold Layout) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2.5 relative z-10">
          
          {/* COLUMN 1: GREGORIAN LIVE CLOCK & SOLAR DAYLIGHT CARD */}
          <div 
            onClick={() => setIsGregorianCalendarModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsGregorianCalendarModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isGregorianCalendarModalOpen}
            title="Click to open Full Gregorian Calendar & Holidays"
            aria-label="Open Full Gregorian Calendar & Holidays"
            className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#0a1128] via-[#070e20] to-[#040814] border border-blue-500/35 hover:border-blue-400/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.12)] hover:shadow-[0_0_40px_rgba(59,130,246,0.22)] flex flex-col justify-between cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group relative min-w-0 font-sans"
          >
            <div className="min-w-0">
              {/* Top Header: Live Indicator & Location Timezone Badge */}
              <div className="flex items-center justify-between gap-1.5 min-w-0 mb-2">
                <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] sm:text-[11px] font-bold font-outfit tracking-wider uppercase group-hover:text-cyan-300 transition-colors min-w-0">
                  <Clock size={13} className="text-cyan-400 shrink-0" />
                  <span className="whitespace-nowrap shrink-0">{isLiveMode ? t('liveClock') : t('selectedDate')}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0e1b38] border border-blue-500/30 text-amber-300 text-[10px] font-mono font-medium shadow-sm">
                    <span className="truncate max-w-[120px] sm:max-w-[160px]">{selectedLocation.name}</span>
                    <span className="text-slate-500">•</span>
                    <span>{formattedTzOffset}</span>
                  </span>
                </div>
              </div>

              {/* Prominent Gregorian Hero Day & Date */}
              <div className="flex items-center gap-3 my-2 min-w-0">
                <div className="text-4xl sm:text-5xl font-extrabold font-grotesk tracking-tight text-white tabular-nums drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)] shrink-0">
                  {gregorianDayNumber}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <span className="text-base sm:text-lg font-bold text-amber-300 font-sans leading-snug py-0.5 break-words">
                    {gregorianWeekday}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300 font-medium font-sans leading-snug py-0.5 break-words mt-0.5">
                    {gregorianMonthYear}
                  </span>
                </div>
              </div>

              {/* Metallic gradient tabular-nums clock & Region Name */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#030712]/80 border border-blue-500/25 flex items-center justify-between gap-2 min-w-0 mb-2 shadow-inner">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span 
                    className="text-xl sm:text-2xl font-extrabold font-grotesk font-mono tracking-tight bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-transparent tabular-nums select-all drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    aria-label={`Current time: ${displayTime}`}
                  >
                    <span aria-hidden="true" suppressHydrationWarning>
                      {displayTime}
                    </span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans font-medium shrink-0">
                  {selectedLocation.regionName || selectedLocation.name}
                </span>
              </div>

              {/* Vibrant Sunrise & Sunset Dual Horizon Bar */}
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 my-2 min-w-0">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 shadow-sm group/sun">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-sm shrink-0 shadow-inner group-hover/sun:scale-105 transition-transform">
                    🌅
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400/90 block leading-snug py-0.5 font-outfit">
                      {t('localSunrise')}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold font-grotesk text-white tabular-nums block mt-0.5 tracking-tight whitespace-nowrap shrink-0">
                      {panchang.sunrise}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-orange-500/15 to-rose-500/10 border border-orange-500/30 shadow-sm group/sunset">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-300 text-sm shrink-0 shadow-inner group-hover/sunset:scale-105 transition-transform">
                    🌇
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-orange-400/90 block leading-snug py-0.5 font-outfit">
                      {t('sunset')}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold font-grotesk text-white tabular-nums block mt-0.5 tracking-tight whitespace-nowrap shrink-0">
                      {panchang.sunset}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Holiday Badge: Today's Holiday or Next Upcoming Holiday */}
              {holidayDetails.todayHoliday.isHoliday ? (
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-2 min-w-0 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{holidayDetails.todayHoliday.icon || '🎉'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-emerald-200 break-words min-w-0 leading-snug">
                        {translateTerm(holidayDetails.todayHoliday.title)}
                      </div>
                      <div className="text-[10px] text-emerald-400/80 break-words min-w-0 leading-snug">
                        {holidayDetails.todayHoliday.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 shrink-0">
                    {t('todayHolidayBadge')}
                  </span>
                </div>
              ) : holidayDetails.upcomingHoliday ? (
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#0b1222] border border-[#1e2d4f] flex items-center justify-between gap-2 min-w-0 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{holidayDetails.upcomingHoliday.icon || '📅'}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-neutral-200 break-words min-w-0 leading-snug">
                        <span className="text-neutral-400 mr-1">{t('nextHoliday')}</span>
                        <span>{translateTerm(holidayDetails.upcomingHoliday.title)}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 break-words min-w-0 leading-snug">
                        {holidayDetails.upcomingHoliday.dateFormatted} • {holidayDetails.upcomingHoliday.daysText}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 shrink-0">
                    {holidayDetails.upcomingHoliday.badge || t('publicHoliday')}
                  </span>
                </div>
              ) : (
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#0b1222] border border-[#1e2d4f] flex items-center justify-between gap-2 min-w-0 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">⚪</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-neutral-300 break-words min-w-0 leading-snug">
                        {t('noHolidaysInMonth')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Value-Driven Tap Micro-CTA Footer */}
            <div className="pt-2 border-t border-[#1e2d4f] mt-auto min-w-0">
              <div className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-500/15 border border-blue-500/30 group-hover:border-blue-400/60 text-blue-200 group-hover:text-white text-[11px] font-semibold font-outfit transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={12} className="text-blue-400 shrink-0" />
                  <span className="break-words whitespace-normal leading-snug">{t('tapGregorianCalendar')}</span>
                </div>
                <ChevronRight size={13} className="text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
            </div>
          </div>

          {/* COLUMN 2: VEDIC PANCHANG & UDAYA TITHI CARD (SURYA GOLD CENTERPIECE) */}
          <div 
            onClick={() => openCalendar('all')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCalendar('all');
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isCalendarModalOpen}
            title="Click to open Monthly Calendar of Tithis, Ekadashis & Dharmashastra Rules"
            aria-label="Open Vedic Monthly Calendar and Udaya Tithi Almanac"
            className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#1c0e02] via-[#100702] to-[#060812] border-2 border-amber-500/50 hover:border-amber-400/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.22)] hover:shadow-[0_0_55px_rgba(245,158,11,0.35)] flex flex-col justify-between cursor-pointer select-none transition-all duration-200 active:scale-[0.98] group relative font-sans overflow-hidden min-w-0"
          >
            {/* Luminous ambient radial backdrop glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.22)_0%,_rgba(147,51,234,0.10)_45%,_transparent_75%)]" />

            <div className="space-y-2 relative z-10 min-w-0">
              {/* 1: Day of Week & Today Badge */}
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-amber-500/20 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0 shadow-sm">
                    <Sun size={14} className="animate-spin-slow" />
                  </div>
                  <span className="font-serif font-devanagari text-amber-200 text-sm sm:text-base font-bold tracking-tight leading-snug break-words drop-shadow">
                    {translateTerm(panchang.dayOfWeekName, language)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold font-outfit uppercase tracking-widest bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] shrink-0">
                    {t('today')}
                  </span>
                </div>
              </div>

              {/* 2: Localized Masa Pill (Task 5: North Purnimanta vs South/West Amanta) */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-0">
                <span className="text-[9px] font-extrabold font-outfit text-amber-300 tracking-wider uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-500/40 shrink-0 shadow-sm">
                  {t('masa')}
                </span>
                <span className="font-serif font-devanagari font-semibold text-amber-100 text-xs sm:text-sm break-words whitespace-normal leading-snug min-w-0">
                  {localizedMasa}
                </span>
              </div>

              {/* 3: Today's Tithi Header & Badge */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <Sparkles size={12} className="text-amber-400 shrink-0" />
                    <span className="text-[10px] font-extrabold font-outfit tracking-wider uppercase text-amber-300 leading-snug">
                      {isHindi ? 'आज की औदयिक तिथि' : t('tithi')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {panchang.isPreSunrise && (
                      <span
                        title={isHindi ? `सूर्योदय पूर्व • आज का सूर्योदय: ${panchang.sunrise}` : `Pre-Sunrise • Today's Sunrise: ${panchang.sunrise}`}
                        className="px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-200 border border-sky-500/50 text-[8px] font-extrabold font-outfit uppercase shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                      >
                        {isHindi ? 'सूर्योदय पूर्व' : 'Pre-Dawn'}
                      </span>
                    )}
                    {tithiResolution.isVriddhi && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-200 border border-purple-500/50 text-[8px] font-extrabold font-outfit uppercase shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                        {translateTerm('Vriddhi', language)}
                      </span>
                    )}
                    {tithiResolution.isKshaya && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-200 border border-rose-500/50 text-[8px] font-extrabold font-outfit uppercase shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                        {translateTerm('Kshaya', language)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Shortened Tithi Name & Badges */}
                <div className="flex items-center gap-2 flex-wrap py-0.5 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-serif font-devanagari font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-orange-400 tracking-tight leading-snug group-hover:from-white group-hover:via-amber-200 group-hover:to-orange-300 transition-colors drop-shadow-[0_2px_14px_rgba(245,158,11,0.6)] break-words whitespace-normal min-w-0">
                    {shortenedTithi}
                  </h3>
                  {panchang.tithi.index === 15 && (
                    <span className="text-xl drop-shadow-[0_0_16px_rgba(251,191,36,0.9)] select-none animate-pulse shrink-0" title={translateTerm('Purnima', language)}>🌕</span>
                  )}
                  {panchang.tithi.index === 30 && (
                    <span className="text-xl drop-shadow-[0_0_14px_rgba(168,85,247,0.7)] select-none shrink-0" title={translateTerm('Amavasya', language)}>🌑</span>
                  )}
                  {(panchang.tithi.index === 11 || panchang.tithi.index === 26) && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-400/50 text-emerald-200 font-extrabold font-outfit shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                      ✨ {translateTerm('Ekadashi', language)}
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#170e03] to-[#120a02] border border-amber-500/35 text-[11px] font-grotesk tabular-nums shadow-sm min-w-0">
                  <Clock size={12} className="text-amber-400 shrink-0" />
                  <span className="font-sans text-amber-200/80 font-medium text-[10px] shrink-0">{t('tithiEnds')}:</span>
                  <span className="font-extrabold text-white tracking-tight whitespace-nowrap text-xs leading-snug">
                    {currentTithiEndTime}
                  </span>
                </div>

                {/* Visual Tithi Progress & Day-Transition Timeline */}
                <div className="space-y-1 pt-1 min-w-0" title={`${shortenedTithi} • ${tithiProgressPercent}% ${isHindi ? 'पूर्ण' : 'elapsed'}`}>
                  <div className="flex items-center justify-between text-[10px] font-medium min-w-0">
                    <span className="text-amber-300 font-sans flex items-center gap-1 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                      <span className="text-[10px]">{isHindi ? 'तिथि प्रगति' : 'Elapsed'}:</span>
                      <span className="font-bold font-mono text-white text-[10px]">{tithiProgressPercent}%</span>
                    </span>
                    <span className="text-amber-200/80 font-mono text-[9px] truncate ml-1">
                      {tithiStatusLabel}
                    </span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="w-full h-1.5 rounded-full bg-[#141b2d] overflow-hidden p-0.5 border border-amber-500/25 relative shadow-inner">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                      style={{ width: `${Math.min(100, Math.max(3, tithiProgressPercent))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4: Compact Horizontal / Single-Line Next Tithi Box (Task 4) */}
              <div className="p-2.5 rounded-xl bg-[#090b16]/90 border border-amber-500/25 space-y-1.5 text-[11px] min-w-0 shadow-sm">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-amber-200/70 text-[10px] font-medium font-sans shrink-0">{t('nextTithi')}:</span>
                  <span className="font-serif font-devanagari font-bold text-amber-300 text-right text-xs break-words whitespace-normal leading-snug min-w-0">
                    {shortNextTithi}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">{t('starts')}:</span>
                  <span className="font-mono tabular-nums text-slate-200 text-right text-[10px] whitespace-nowrap shrink-0">
                    {newTithiStartTime}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] font-medium font-sans shrink-0">{t('observed')}:</span>
                  <span className="font-bold text-emerald-300 text-right text-[10px] break-words whitespace-normal leading-snug min-w-0">
                    {newTithiObservedWhen}
                  </span>
                </div>
              </div>

              {/* 5: Pahar (Single-line) */}
              <div className="flex items-center justify-between text-[11px] py-0.5 px-0.5 min-w-0">
                <span className="text-[10px] font-medium text-amber-200/70 flex items-center gap-1 font-sans shrink-0">
                  <Compass size={12} className="text-amber-400 shrink-0" />
                  <span>Pahar:</span>
                </span>
                <span className="font-semibold text-amber-100 font-grotesk tabular-nums text-[10px] bg-slate-950/80 border border-amber-500/25 px-2.5 py-0.5 rounded-md shadow-sm break-words whitespace-normal leading-snug min-w-0">
                  {panchang.paharCapsuleText}
                </span>
              </div>
            </div>

            {/* 6: Value-Driven Tap Micro-CTA Footer */}
            <div className="mt-2 pt-2 border-t border-amber-500/25 relative z-10 min-w-0">
              <div className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/45 group-hover:border-orange-400/80 text-orange-200 group-hover:text-white text-[11px] font-bold font-outfit tracking-wide transition-all flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={12} className="text-amber-400 shrink-0" />
                  <span className="break-words whitespace-normal leading-snug">{t('tapFullCalendar')}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/25 text-amber-200 border border-amber-500/40 font-grotesk">
                    Exact End Times
                  </span>
                  <ChevronRight size={13} className="text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: TODAY'S SHUBH KARYA MUHURAT CARD (AUSPICIOUS JADE & EMERALD) */}
          <div 
            id="today-muhurat-card"
            onClick={() => handleMuhuratClick('all')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMuhuratClick('all');
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isMonthlyMuhuratOpen}
            title={t('viewFullMonthlyMuhurat')}
            aria-label={t('todayShubhKarya')}
            className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#021810] via-[#04120c] to-[#050812] border border-emerald-500/45 hover:border-emerald-400/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.16)] hover:shadow-[0_0_48px_rgba(16,185,129,0.26)] flex flex-col justify-between cursor-pointer select-none transition-all duration-200 active:scale-[0.98] group relative min-w-0 font-sans"
          >
            {/* Luminous ambient radial backdrop glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15)_0%,_transparent_70%)]" />

            <div className="min-w-0 relative z-10">
              {/* Top Header: Label */}
              <div className="flex items-center justify-between gap-1.5 min-w-0 mb-2">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] sm:text-[11px] font-bold font-outfit tracking-wider uppercase group-hover:text-emerald-300 transition-colors min-w-0">
                  <Sparkles size={13} className="text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap shrink-0">{t('todayShubhKarya')}</span>
                </div>
              </div>

              {/* Primary Auspicious Time Window Banner */}
              <div className="my-2 p-2.5 rounded-xl bg-[#021c13]/90 border border-emerald-500/40 shadow-inner flex flex-col gap-1.5 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${todayMuhurat.isAuspiciousDay ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-[10px] font-semibold text-emerald-200/90 uppercase tracking-wider font-outfit truncate">
                      {todayMuhurat.isAuspiciousDay ? (language === 'hi' ? 'शुभ वेला' : 'Shubh Window') : t('generalShubhWindow')}
                    </span>
                  </div>
                  {todayMuhurat.isAuspiciousDay ? (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 shadow-sm shrink-0 font-outfit">
                      {language === 'hi' ? 'शुभ दिवस' : 'Auspicious'}
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-sm shrink-0 font-outfit">
                      {language === 'hi' ? 'अभिजित वेला' : 'Abhijit'}
                    </span>
                  )}
                </div>

                {/* Auspicious Time Windows (Stacked / Wrapped to prevent any card overflow) */}
                {(() => {
                  const rawString = todayMuhurat.bestTimeWindowsString !== '—' 
                    ? todayMuhurat.bestTimeWindowsString 
                    : (todayMuhurat.abhijitString !== '—' ? todayMuhurat.abhijitString : (language === 'hi' ? 'विशेष वेला नहीं' : 'No Major Window'));
                  const timeWindows = rawString.split(',').map(s => s.trim()).filter(Boolean);

                  if (timeWindows.length <= 1) {
                    return (
                      <div className="text-xs sm:text-sm font-extrabold font-grotesk font-mono tracking-tight text-white tabular-nums leading-tight break-words">
                        {rawString}
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-1 w-full min-w-0">
                      {timeWindows.map((tw, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold font-grotesk font-mono tracking-tight text-white tabular-nums bg-[#0b101e] px-2 py-1 rounded-lg border border-white/5 w-fit max-w-full"
                        >
                          <Clock size={11} className="text-emerald-400 shrink-0" />
                          <span className="break-words">{tw}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Auspicious Activities Chips or Next Upcoming Auspicious Teaser */}
              {(todayMuhurat.auspiciousActivities ?? []).length > 0 ? (
                <div className="space-y-1.5 mb-2">
                  <div className="text-[10px] text-emerald-200/80 font-medium font-sans">
                    {language === 'hi' ? 'आज हेतु प्रशस्त कार्य:' : 'Recommended today:'}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(todayMuhurat.auspiciousActivities ?? []).slice(0, 4).map(act => (
                      <button
                        key={act.category}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMuhuratClick(act.category);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${act.colorClass}`}
                      >
                        <span>{act.icon}</span>
                        <span>{language === 'hi' ? act.hindiName : act.name}</span>
                      </button>
                    ))}
                    {(todayMuhurat.specialYogas ?? []).map(yoga => (
                      <span
                        key={yoga}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm"
                      >
                        <span>✨</span>
                        <span>{translateTerm(yoga)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-[#0b1222] border border-[#1e2d4f] min-w-0 mb-2">
                  <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-1">
                    <span className="text-amber-400 font-semibold font-outfit">
                      {todayMuhurat.isRiktaTithi 
                        ? (language === 'hi' ? 'रिक्ता तिथि' : 'Rikta Tithi') 
                        : todayMuhurat.isAmavasya 
                        ? (language === 'hi' ? 'अमावस्या' : 'Amavasya')
                        : todayMuhurat.isBhadra 
                        ? (language === 'hi' ? 'भद्रा काल' : 'Bhadra')
                        : (language === 'hi' ? 'सामान्य दिवस' : 'General Day')}
                    </span>
                    {nextUpcomingMuhurat && (
                      <span className="text-emerald-400 font-medium">
                        {t('nextUpcomingMuhurat')}: {String(nextUpcomingMuhurat.dayNumber).padStart(2, '0')} {new Date(nextUpcomingMuhurat.year, nextUpcomingMuhurat.month - 1, 1).toLocaleDateString(localeCode, { month: 'short' })}
                      </span>
                    )}
                  </div>
                  {nextUpcomingMuhurat && (
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {(nextUpcomingMuhurat.auspiciousActivities ?? []).slice(0, 3).map(act => (
                        <span 
                          key={act.category}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        >
                          <span>{act.icon}</span>
                          <span>{language === 'hi' ? act.hindiName : act.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* High-Visibility Rahu Kaal Avoidance Strip */}
              <div className="flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-rose-950/70 via-red-950/50 to-rose-950/70 border border-rose-500/40 min-w-0 mb-2 shadow-[0_0_12px_rgba(244,63,94,0.18)]">
                <span className="text-[10px] font-bold text-rose-300 flex items-center gap-1.5 font-sans shrink-0">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                  <span>{language === 'hi' ? 'राहु काल (त्याज्य):' : 'Rahu Kaal (Avoid):'}</span>
                </span>
                <span className="font-extrabold text-rose-200 font-grotesk tabular-nums text-xs tracking-tight">
                  {todayMuhurat.rahuKaalString}
                </span>
              </div>
            </div>

            {/* Micro-CTA Footer */}
            <div className="mt-2 pt-2 border-t border-emerald-500/25 relative z-10 min-w-0">
              <div className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600/20 via-teal-600/15 to-emerald-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/40 group-hover:border-emerald-400/80 text-emerald-200 group-hover:text-white text-[11px] font-bold font-outfit tracking-wide transition-all flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={12} className="text-emerald-400 shrink-0" />
                  <span className="break-words whitespace-normal leading-snug">{t('viewFullMonthlyMuhurat')}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 font-grotesk">
                    {t('table30Days')}
                  </span>
                  <ChevronRight size={13} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom 3-Card Row (Task 4: Immediately Visible Above/Near Fold) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2.5 relative z-10">
          
          {/* BOTTOM LEFT: TODAY'S FESTIVAL / VRAT (FESTIVE KESARIYA) */}
          <div 
            className={`p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#1e0f04] via-[#100802] to-[#060812] border ${
              panchang.todayFestival.isMajor 
                ? 'border-amber-400/60 hover:border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.20)]'
                : 'border-orange-500/40 hover:border-orange-400/70 shadow-[0_0_20px_rgba(249,115,22,0.12)]'
            } flex flex-col justify-between relative font-sans min-w-0 transition-all duration-200`}
          >
            <div className="space-y-2 relative z-10 min-w-0">
              {/* Header row: Label + Festive Badge */}
              <div className="flex items-center justify-between gap-1.5 min-w-0 pb-1.5 border-b border-orange-500/20">
                <div className="text-amber-300 text-[10px] font-bold font-outfit tracking-wider uppercase flex items-center gap-1.5 min-w-0">
                  <span className="leading-snug">{t('todaysObservance')}</span>
                  {panchang.todayFestival.isMajor && (
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 uppercase shrink-0 font-outfit shadow-sm">
                      {t('majorFestival')}
                    </span>
                  )}
                </div>
              </div>

              {/* Main content */}
              <div className="flex items-start gap-2.5 min-w-0 pt-0.5">
                <div className="rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/35 p-2 shrink-0 flex items-center justify-center w-10 h-10 select-none">
                  {panchang.todayFestival.icon ? (
                    <span className="text-xl leading-none select-none">{panchang.todayFestival.icon}</span>
                  ) : (
                    <Calendar size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm sm:text-base font-bold font-sans break-words whitespace-normal leading-snug min-w-0 ${
                    panchang.todayFestival.isMajor ? 'text-amber-200 drop-shadow' : 'text-white'
                  }`}>
                    {translateTerm(panchang.todayFestival.title, language)}
                  </div>
                  <div className="text-[11px] text-amber-100/70 mt-0.5 break-words whitespace-normal font-sans line-clamp-2 min-w-0">
                    {language === 'hi'
                      ? (panchang.todayFestival.briefRule?.hindi || panchang.todayFestival.description)
                      : (panchang.todayFestival.briefRule?.english || panchang.todayFestival.description)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2: UPCOMING FESTIVALS COMPACT LIST (CELESTIAL BLUE) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#071324] via-[#050c18] to-[#050812] border border-blue-500/35 hover:border-blue-400/65 shadow-[0_0_30px_rgba(59,130,246,0.12)] hover:shadow-[0_0_40px_rgba(59,130,246,0.22)] flex flex-col justify-between font-sans min-w-0 transition-all duration-200">
            <div className="space-y-2 min-w-0">
              {/* Header row: Label */}
              <div className="flex items-center justify-between gap-1.5 min-w-0 pb-1.5 border-b border-blue-500/20">
                <div className="flex items-center gap-1.5 text-cyan-300 text-[10px] font-bold font-outfit tracking-wider uppercase min-w-0">
                  <Sparkles size={12} className="text-cyan-400 shrink-0" />
                  <span className="leading-snug">{t('upcomingFestivals')}</span>
                </div>
              </div>

              {/* Single Upcoming Observance Display */}
              <div className="rounded-xl bg-[#090e1a] border border-[#1a2542] divide-y divide-[#162038] overflow-hidden">
                {upcomingFestivalsList.length === 0 ? (
                  <div className="p-3 text-center text-xs text-neutral-400 font-sans">
                    {language === 'hi' ? 'कोई आगामी व्रत/त्योहार नहीं' : 'No upcoming festivals found'}
                  </div>
                ) : (
                  upcomingFestivalsList.slice(0, 1).map((fest, idx) => {
                    const festTitle = translateTerm(language === 'hi' ? fest.hindiName || fest.name : fest.name, language);
                    const dateBadgeDay = fest.targetDate.toLocaleDateString(localeCode, { day: 'numeric', month: 'short' });
                    const dateBadgeWeekday = fest.targetDate.toLocaleDateString(localeCode, { weekday: 'short' });
                    const countdown = fest.daysRemaining === 0 
                      ? t('live') 
                      : (fest.daysRemaining === 1 ? (language === 'hi' ? 'कल' : 'Tomorrow') : t('inDays').replace('{n}', String(fest.daysRemaining)));

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2.5 px-3 py-2.5"
                      >
                        {/* Left: Date pill (DD MMM + Weekday) */}
                        <div className="flex flex-col items-center justify-center min-w-[50px] px-2 py-1 rounded-lg bg-slate-900 border border-blue-500/30 shrink-0 text-center shadow-inner">
                          <span className="text-xs font-extrabold text-white font-grotesk leading-none">{dateBadgeDay}</span>
                          <span className="text-[9px] text-amber-300 font-medium mt-0.5">{dateBadgeWeekday}</span>
                        </div>

                        {/* Middle: Title & Category / Description */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-white break-words whitespace-normal leading-snug">
                            {festTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 break-words whitespace-normal leading-snug mt-0.5">
                            {fest.category ? `${fest.category} • ` : ''}{fest.description}
                          </div>
                        </div>

                        {/* Right: Countdown badge */}
                        <div className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shrink-0 shadow-sm shadow-orange-500/40">
                          {countdown}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 3: PANCHAK STATUS CARD (LUMINOUS TEAL OR ALERT CRIMSON) */}
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
            className={`p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b ${
              panchakStatus.isActive 
                ? 'from-[#200808] via-[#140505] to-[#080303] border-red-500/50 hover:border-red-400/80 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                : 'from-[#021c18] via-[#041210] to-[#050812] border-teal-500/45 hover:border-teal-400/75 shadow-[0_0_30px_rgba(20,184,166,0.16)] hover:shadow-[0_0_42px_rgba(20,184,166,0.26)]'
            } flex flex-col justify-between cursor-pointer select-none transition-all duration-200 active:scale-[0.98] group relative font-sans min-w-0`}
          >
            <div className="space-y-2 relative z-10 min-w-0">
              {/* Header row: Label + Badge + Action Pill */}
              <div className="flex items-center justify-between gap-1.5 min-w-0 pb-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-amber-400 text-[10px] font-bold font-outfit tracking-wider uppercase leading-snug">
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
                  <span className="break-words whitespace-normal leading-snug">{language === 'en' ? "Tap for Multi-Year Panchak Calendar & Dos/Don'ts" : (language === 'hi' ? 'बहु-वर्षीय पञ्चक कैलेंडर एवं शास्त्र नियम' : (language === 'sa' ? 'बहुवर्षीयपञ्चकदिनदर्शिका शास्त्रनियमाः च' : (language === 'mr' ? 'बहु-वर्षीय पंचक दिनदर्शिका व शास्त्र नियम' : 'બહુ-વર્ષીય પંચક કેલેન્ડર અને શાસ્ત્ર નિયમો')))}</span>
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
                ? (language === 'en' ? 'Hide 5-Limbs & Astrometry Details' : (language === 'hi' ? '5-अंग एवं खगोलीय विवरण छुपाएं' : (language === 'sa' ? 'पञ्चाङ्गखगोलीयविवरणं गोपयतु' : (language === 'mr' ? '५-अंगे व खगोलीय तपशील लपवा' : '૫-અંગ અને ખગોળીય વિગત છુપાવો'))))
                : (language === 'en' ? 'View Full 5-Limbs & Astrometry Details' : (language === 'hi' ? 'संपूर्ण 5-अंग पञ्चाङ्ग एवं खगोलीय विवरण देखें' : (language === 'sa' ? 'सम्पूर्णपञ्चाङ्गं खगोलीयविवरणं च पश्यन्तु' : (language === 'mr' ? 'संपूर्ण ५-अंग पंचांग व खगोलीय तपशील पहा' : 'સંપૂર્ણ ૫-અંગ પંચાંગ અને ખગોળીય વિગત જુઓ'))))}
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
                  { id: 'astrometry', label: t('tabAstrometry') },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      setActiveTab(tab.id as WidgetTabType);
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
                className="scroll-mt-28 grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3"
              >
                {/* 1. TITHI CARD (SURYA GOLD) */}
                <div 
                  onClick={() => openLimbModal('tithi')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('tithi'); }}}
                  title="Click to view deep Tithi attributes and deity"
                  aria-label="View Tithi details"
                  className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#1c0e02] to-[#070b16] border border-amber-500/40 hover:border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.12)] cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold font-outfit uppercase gap-1 min-w-0 pb-1 border-b border-amber-500/20">
                      <span className="leading-snug">1. {t('tithi').toUpperCase()}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold font-outfit shadow-sm group-hover:bg-amber-500/30 transition-all shrink-0">
                        <span>{language === 'en' ? 'Deity' : (language === 'hi' ? 'देवता' : (language === 'sa' ? 'देवता' : (language === 'mr' ? 'देवता' : 'દેવતા')))}</span>
                        <ChevronRight size={11} className="text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-serif font-devanagari group-hover:text-amber-200 transition-colors break-words whitespace-normal leading-snug">{translateTerm(panchang.tithi.name, language)}</div>
                    <div className="text-[11px] text-amber-200/80 font-sans break-words whitespace-normal leading-snug">{language === 'en' ? 'Deity' : (language === 'hi' ? 'देवता' : (language === 'sa' ? 'देवता' : (language === 'mr' ? 'देवता' : 'દેવતા')))}: {translateTerm(panchang.tithi.deity, language)}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-amber-500/20 min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/25 border border-amber-500/40 group-hover:border-amber-400 text-amber-200 group-hover:text-white text-[10px] font-bold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="break-words whitespace-normal leading-snug">{language === 'en' ? 'Tap for Tithi Attributes & Deity' : (language === 'hi' ? 'तिथी के गुण एवं देवता विस्तार देखें' : (language === 'sa' ? 'तिथिलक्षणानि देवतां च पश्यन्तु' : (language === 'mr' ? 'तिथीचे गुणधर्म व देवता पहा' : 'તિથિના ગુણો અને દેવતા જુઓ')))}</span>
                      <ChevronRight size={11} className="text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 2. NAKSHATRA CARD (MYSTIC AMETHYST) */}
                <div 
                  onClick={() => openLimbModal('nakshatra')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('nakshatra'); }}}
                  title="Click to view deep Nakshatra pada, lord and symbol"
                  aria-label="View Nakshatra details"
                  className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#150a26] to-[#070b16] border border-purple-500/40 hover:border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.12)] cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold font-outfit uppercase gap-1 min-w-0 pb-1 border-b border-purple-500/20">
                      <span className="leading-snug">2. {t('nakshatra').toUpperCase()}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-200 text-[10px] font-bold font-outfit shadow-sm group-hover:bg-purple-500/30 transition-all shrink-0">
                        <span>{language === 'en' ? 'Pada & Lord' : (language === 'hi' ? 'चरण एवं स्वामी' : (language === 'sa' ? 'पादः स्वामी च' : (language === 'mr' ? 'चरण व स्वामी' : 'ચરણ અને સ્વામી')))}</span>
                        <ChevronRight size={11} className="text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-serif font-devanagari group-hover:text-purple-200 transition-colors break-words whitespace-normal leading-snug">{translateTerm(panchang.nakshatra.name, language)}</div>
                    <div className="text-[11px] text-purple-200/80 font-sans break-words whitespace-normal leading-snug">{language === 'en' ? 'Pada' : (language === 'hi' ? 'चरण' : (language === 'sa' ? 'पादः' : (language === 'mr' ? 'चरण' : 'ચરણ')))} {panchang.nakshatra.pada} • {t('ruler')} {translateTerm(panchang.nakshatra.lord, language)}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-purple-500/20 min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-purple-500/20 via-indigo-500/15 to-purple-500/20 hover:from-purple-500/30 hover:to-indigo-500/25 border border-purple-500/40 group-hover:border-purple-400 text-purple-200 group-hover:text-white text-[10px] font-bold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="break-words whitespace-normal leading-snug">{language === 'en' ? 'Tap for Planetary & Nakshatra Details' : (language === 'hi' ? 'ग्रह एवं नक्षत्र विस्तार देखें' : (language === 'sa' ? 'ग्रहाणां नक्षत्राणां च विवरणं पश्यन्तु' : (language === 'mr' ? 'ग्रह व नक्षत्र तपशील पहा' : 'ગ્રહ અને નક્ષત્ર વિગતો જુઓ')))}</span>
                      <ChevronRight size={11} className="text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 3. YOGA CARD (AUSPICIOUS EMERALD) */}
                <div 
                  onClick={() => openLimbModal('yoga')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('yoga'); }}}
                  title="Click to view deep Yoga meaning and auspiciousness"
                  aria-label="View Yoga details"
                  className={`p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#021810] to-[#070b16] border ${
                    panchang.yoga.nature === 'Shubh' ? 'border-emerald-500/45 hover:border-emerald-400/75 shadow-[0_0_20px_rgba(16,185,129,0.14)]' : 'border-rose-500/45 hover:border-rose-400/75 shadow-[0_0_20px_rgba(244,63,94,0.14)]'
                  } cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between min-w-0`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex justify-between items-center gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="text-[10px] text-emerald-300 font-bold font-outfit uppercase leading-snug">3. {t('yoga').toUpperCase()}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border font-outfit uppercase shrink-0 ${
                          panchang.yoga.nature === 'Shubh' ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                        }`}>
                          {panchang.yoga.nature === 'Shubh' ? t('auspicious').toUpperCase() : t('inauspicious').toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold font-outfit shadow-sm group-hover:bg-emerald-500/30 transition-all shrink-0">
                          <ChevronRight size={11} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-serif font-devanagari group-hover:text-emerald-200 transition-colors break-words whitespace-normal leading-snug">{translateTerm(panchang.yoga.name, language)}</div>
                    <div className="text-[11px] text-emerald-200/80 font-sans break-words whitespace-normal leading-snug">{panchang.yoga.meaning}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/20 min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600/20 via-teal-600/15 to-emerald-600/20 hover:from-emerald-600/30 hover:to-teal-600/25 border border-emerald-500/40 group-hover:border-emerald-400 text-emerald-200 group-hover:text-white text-[10px] font-bold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="break-words whitespace-normal leading-snug">{language === 'en' ? 'Tap for Yoga Astrological Meaning' : (language === 'hi' ? 'योग फल एवं फलित विस्तार देखें' : (language === 'sa' ? 'योगफलितं विवरणं च पश्यन्तु' : (language === 'mr' ? 'योगाचे फलित व महत्त्व पहा' : 'યોગનું ફળ અને મહત્વ જુઓ')))}</span>
                      <ChevronRight size={11} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 4. KARANA CARD (CELESTIAL CYAN) */}
                <div 
                  onClick={() => openLimbModal('karana')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('karana'); }}}
                  title="Click to view Karana category and ruling lord"
                  aria-label="View Karana details"
                  className={`p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#041524] to-[#070b16] border ${
                    panchang.karana.auspicious ? 'border-cyan-500/45 hover:border-cyan-400/75 shadow-[0_0_20px_rgba(6,182,212,0.14)]' : 'border-rose-500/45 hover:border-rose-400/75 shadow-[0_0_20px_rgba(244,63,94,0.14)]'
                  } cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between min-w-0`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex justify-between items-center gap-1 min-w-0 pb-1 border-b border-white/5">
                      <span className="text-[10px] text-cyan-300 font-bold font-outfit uppercase leading-snug">4. {t('karana').toUpperCase()}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border font-outfit uppercase shrink-0 ${
                          panchang.karana.auspicious ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                        }`}>
                          {panchang.karana.auspicious ? t('auspicious').toUpperCase() : t('inauspicious').toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold font-outfit shadow-sm group-hover:bg-cyan-500/30 transition-all shrink-0">
                          <ChevronRight size={11} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-serif font-devanagari group-hover:text-cyan-200 transition-colors break-words whitespace-normal leading-snug">{translateTerm(panchang.karana.name, language)}</div>
                    <div className="text-[11px] text-cyan-200/80 font-sans break-words whitespace-normal leading-snug">{panchang.karana.type}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-cyan-500/20 min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-cyan-600/20 via-blue-600/15 to-cyan-600/20 hover:from-cyan-600/30 hover:to-blue-600/25 border border-cyan-500/40 group-hover:border-cyan-400 text-cyan-200 group-hover:text-white text-[10px] font-bold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="break-words whitespace-normal leading-snug">{language === 'en' ? 'Tap for Karana Category & Ruling Lord' : (language === 'hi' ? 'करण प्रकार एवं स्वामी विस्तार देखें' : (language === 'sa' ? 'करणप्रकारं स्वामिनं च पश्यन्तु' : (language === 'mr' ? 'करण प्रकार व स्वामी पहा' : 'કરણ પ્રકાર અને સ્વામી જુઓ')))}</span>
                      <ChevronRight size={11} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* 5. VAAR CARD (SURYA AMBER) */}
                <div 
                  onClick={() => openLimbModal('vaar')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLimbModal('vaar'); }}}
                  title="Click to view Vaar ruler and civil Ahoratra span"
                  aria-label="View Vaar details"
                  className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#1c0f04] to-[#070b16] border border-amber-500/40 hover:border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.12)] cursor-pointer select-none transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold font-outfit uppercase gap-1 min-w-0 pb-1 border-b border-amber-500/20">
                      <span className="leading-snug">5. {t('vaar').toUpperCase()}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[10px] font-bold font-outfit shadow-sm group-hover:bg-amber-500/30 transition-all shrink-0">
                        <span>{t('ruler')}</span>
                        <ChevronRight size={11} className="text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-serif font-devanagari group-hover:text-amber-200 transition-colors break-words whitespace-normal leading-snug">{translateTerm(panchang.vaar.name, language)}</div>
                    <div className="text-[11px] text-amber-200/80 font-sans break-words whitespace-normal leading-snug">{translateTerm(panchang.vaar.lord, language)}</div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-amber-500/20 min-w-0">
                    <div className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/25 border border-amber-500/40 group-hover:border-amber-400 text-amber-200 group-hover:text-white text-[10px] font-bold font-outfit flex items-center justify-between shadow-sm transition-all">
                      <span className="break-words whitespace-normal leading-snug">{language === 'en' ? 'Tap for Vaar Ruler & Civil Span' : (language === 'hi' ? 'वार स्वामी एवं अहोरात्र विस्तार देखें' : (language === 'sa' ? 'वारस्वामिनम् अहोरात्रविस्तारं च पश्यन्तु' : (language === 'mr' ? 'वार स्वामी व अहोरात्र तपशील पहा' : 'વાર સ્વામી અને અહોરાત્ર વિગત જુઓ')))}</span>
                      <ChevronRight size={11} className="text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Astrometry */}

            {activeTab === 'astrometry' && (
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="font-bold text-amber-400 mb-2 font-outfit">☀️ {language === 'en' ? 'Surya Astrometry' : (language === 'hi' ? 'सूर्य खगोलीय स्थिति' : (language === 'sa' ? 'सूर्यखगोलीयस्थितिः' : (language === 'mr' ? 'सूर्य खगोलीय स्थिती' : 'સૂર્ય ખગોળીય સ્થિતિ')))}</div>
                  <div className="space-y-1 text-slate-300">
                    <div>{t('sunSign')}: <span className="font-semibold text-white">{translateTerm(panchang.suryaRashi.name, language)} ({panchang.suryaRashi.degree})</span></div>
                    <div>{t('dayDuration')}: <span className="font-semibold text-white font-grotesk tabular-nums">{panchang.dayLength}</span></div>
                    <div>{t('ayana')}: <span className="font-semibold text-white">{translateTerm(panchang.ayana, language)}</span></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="font-bold text-indigo-400 mb-2 font-outfit">🌙 {language === 'en' ? 'Chandra Astrometry' : (language === 'hi' ? 'चन्द्र खगोलीय स्थिति' : (language === 'sa' ? 'चन्द्रखगोलीयस्थितिः' : (language === 'mr' ? 'चंद्र खगोलीय स्थिती' : 'ચંદ્ર ખગોળીય સ્થિતિ')))}</div>
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
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono break-words whitespace-normal leading-snug min-w-0">
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

      {/* ── Interactive Gregorian Calendar with Holidays Modal ── */}
      <GregorianCalendarModal
        isOpen={isGregorianCalendarModalOpen}
        onClose={() => setIsGregorianCalendarModalOpen(false)}
        selectedDate={targetInstant}
        onSelectDate={(d) => {
          setSelectedDate(d);
        }}
        location={selectedLocation}
      />

      {/* ── Unified Master List Calendar & Almanac Modal ── */}
      <TithiMonthModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        location={selectedLocation}
        initialTab={calendarInitialTab}
        onSelectDate={(d) => {
          setSelectedDate(d);
          setIsCalendarModalOpen(false);
        }}
      />

      <FiveLimbsModal
        isOpen={isFiveLimbsModalOpen}
        onClose={() => setIsFiveLimbsModalOpen(false)}
        panchang={panchang}
        initialLimb={activeLimbForModal}
      />

      <PanchakModal
        isOpen={isPanchakModalOpen}
        onClose={() => setIsPanchakModalOpen(false)}
        location={selectedLocation}
      />

      {/* ── Monthly Day-Wise Shubh Karya Muhurat Modal ── */}
      <MonthlyMuhuratModal
        isOpen={isMonthlyMuhuratOpen}
        onClose={() => setIsMonthlyMuhuratOpen(false)}
        location={selectedLocation}
        selectedDate={targetInstant}
        onSelectDate={(d) => {
          setSelectedDate(d);
        }}
        initialCategory={selectedMuhuratCategory}
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
            ? `${panchakStatus.panchak?.type || 'Panchak'}`
            : undefined
        }}
        festivalOrVratName={panchang.festivals && panchang.festivals.length > 0 ? panchang.festivals[0] : null}
      />

    </>
  );
}
