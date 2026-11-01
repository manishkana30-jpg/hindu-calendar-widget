"use client";

import { useState, useEffect, useCallback } from 'react';

export type AppLanguage = 'en' | 'hi';

const STORAGE_KEY = 'preferred_language';
const OVERRIDE_KEY = 'manual_language_override';
const EVENT_NAME = 'user-language-changed';

export interface Translations {
  // Brand & Top Navigation
  brandTitle: string;
  brandSubtitle: string;
  live: string;
  liveAstrometry: string;
  installApp: string;
  globalPanchang: string;
  home: string;

  // City & GPS
  useGps: string;
  gpsActive: string;
  detectingGps: string;
  selectCity: string;

  // Sharing
  shareOnWhatsApp: string;
  share: string;
  copiedToClipboard: string;

  // Date Navigation
  prevDay: string;
  nextDay: string;
  liveMode: string;
  resetToLive: string;
  selectDate: string;

  // Card 1: Clock & Sun
  liveClock: string;
  selectedDate: string;
  localSunrise: string;
  sunset: string;
  dayDuration: string;
  nightDuration: string;
  tap24hMuhurat: string;

  // Card 2: Vedic Panchang & Tithi
  today: string;
  masa: string;
  tithi: string;
  tithiEnds: string;
  nextTithi: string;
  starts: string;
  fullAlmanac: string;
  tapFullCalendar: string;

  // Card 3: Observances & Festivals
  todaysObservance: string;
  majorFestival: string;
  vedicObservance: string;
  vratRules: string;
  exploreMonthlyCalendar: string;
  dharmashastraRules: string;
  nityaPanchang: string;
  dailyVedicObservance: string;

  // Five Limbs
  fiveLimbsTitle: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  vaar: string;
  auspiciousAbhijit: string;
  inauspiciousRahuKaal: string;
  panchakStatus: string;
  panchakActive: string;
  panchakFree: string;

  // Tabs
  tabPanchang: string;
  tabChoghadiya: string;
  tabMuhurat: string;
  tabAstrometry: string;

  // Choghadiya
  daytimeChoghadiya: string;
  nighttimeChoghadiya: string;
  auspicious: string;
  inauspicious: string;
  neutral: string;

  // Shastra & Modal Rules
  shastraRuleHeader: string;
  shastraAuthority: string;
  close: string;
  references: string;
  switchLang: string;
  viewEnglish: string;
  viewHindi: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  en: {
    brandTitle: 'Daily Tithi',
    brandSubtitle: 'Live Hindu Calendar & Panchang',
    live: 'Live',
    liveAstrometry: 'Live Astrometry',
    installApp: 'Install App',
    globalPanchang: 'Global Panchang',
    home: 'Home',

    useGps: 'Use GPS',
    gpsActive: 'GPS Active',
    detectingGps: 'Detecting...',
    selectCity: 'Select City Location',

    shareOnWhatsApp: 'Share Panchang on WhatsApp',
    share: 'Share',
    copiedToClipboard: 'Panchang copied to clipboard!',

    prevDay: 'Previous Day',
    nextDay: 'Next Day',
    liveMode: 'Live',
    resetToLive: 'Live Mode',
    selectDate: 'Select Date',

    liveClock: 'LIVE CLOCK',
    selectedDate: 'SELECTED DATE',
    localSunrise: 'Local Sunrise',
    sunset: 'Sunset',
    dayDuration: 'Day Duration',
    nightDuration: 'Night Duration',
    tap24hMuhurat: 'Tap for Full 24-Hour Muhurat Matrix',

    today: 'TODAY',
    masa: 'MASA',
    tithi: 'TITHI',
    tithiEnds: 'Tithi Ends',
    nextTithi: 'Next Tithi',
    starts: 'Starts',
    fullAlmanac: 'Full Almanac',
    tapFullCalendar: 'Tap for Full Calendar & Tithi Timings',

    todaysObservance: "TODAY'S FESTIVAL & VRAT",
    majorFestival: 'MAJOR FESTIVAL',
    vedicObservance: 'VEDIC OBSERVANCE',
    vratRules: 'Vrat Rules',
    exploreMonthlyCalendar: 'Explore Monthly Vrat & Festival Calendar',
    dharmashastraRules: 'Dharmashastra Rules',
    nityaPanchang: 'Nitya Panchang',
    dailyVedicObservance: 'Daily Sacred Vedic Observance',

    fiveLimbsTitle: 'Five Limbs of Vedic Panchang',
    nakshatra: 'Nakshatra',
    yoga: 'Yoga',
    karana: 'Karana',
    vaar: 'Vaar',
    auspiciousAbhijit: 'Auspicious Abhijit Muhurat',
    inauspiciousRahuKaal: 'Inauspicious Rahu Kaal',
    panchakStatus: 'Panchak Status',
    panchakActive: 'Active (Panchak)',
    panchakFree: 'Free (No Active Panchak)',

    tabPanchang: 'Panchang',
    tabChoghadiya: 'Choghadiya',
    tabMuhurat: '24h Muhurat',
    tabAstrometry: 'Astrometry',

    daytimeChoghadiya: 'Daytime Choghadiya (दिन का चौघड़िया)',
    nighttimeChoghadiya: 'Nighttime Choghadiya (रात्रि का चौघड़िया)',
    auspicious: 'Auspicious',
    inauspicious: 'Inauspicious',
    neutral: 'Neutral',

    shastraRuleHeader: 'Shastra Canonical Rule',
    shastraAuthority: 'Surya Siddhanta & Nirnayasindhu',
    close: 'Close',
    references: 'References',
    switchLang: 'हिन्दी में देखें',
    viewEnglish: 'English',
    viewHindi: 'हिन्दी'
  },
  hi: {
    brandTitle: 'डेली तिथि',
    brandSubtitle: 'लाइव हिन्दू पञ्चाङ्ग एवं वैदिक पंचांग',
    live: 'लाइव',
    liveAstrometry: 'लाइव ज्योतिष गणना',
    installApp: 'ऐप इंस्टॉल करें',
    globalPanchang: 'सम्पूर्ण पञ्चाङ्ग',
    home: 'होम',

    useGps: 'GPS का उपयोग करें',
    gpsActive: 'GPS सक्रिय',
    detectingGps: 'स्थान खोज रहे हैं...',
    selectCity: 'शहर का चयन करें',

    shareOnWhatsApp: 'व्हाट्सएप पर शेयर करें',
    share: 'शेयर',
    copiedToClipboard: 'पञ्चाङ्ग क्लिपबोर्ड पर कॉपी हुआ!',

    prevDay: 'पिछला दिन',
    nextDay: 'अगला दिन',
    liveMode: 'लाइव',
    resetToLive: 'लाइव समय',
    selectDate: 'तिथि चुनें',

    liveClock: 'लाइव समय',
    selectedDate: 'चयनित दिनांक',
    localSunrise: 'स्थानीय सूर्योदय',
    sunset: 'सूर्यास्त',
    dayDuration: 'दिनमान',
    nightDuration: 'रात्रिमान',
    tap24hMuhurat: '24-घंटे सम्पूर्ण मुहूर्त तालिका देखें',

    today: 'आज',
    masa: 'मास',
    tithi: 'तिथि',
    tithiEnds: 'तिथि समाप्त',
    nextTithi: 'आगामी तिथि',
    starts: 'प्रारम्भ',
    fullAlmanac: 'सम्पूर्ण पंचांग',
    tapFullCalendar: 'मासिक पंचांग एवं तिथि समय देखें',

    todaysObservance: 'आज का व्रत एवं त्यौहार',
    majorFestival: 'महापर्व',
    vedicObservance: 'वैदिक पर्व',
    vratRules: 'शास्त्र नियम',
    exploreMonthlyCalendar: 'मासिक व्रत एवं त्यौहार कैलेंडर देखें',
    dharmashastraRules: 'धर्मशास्त्र निर्णय',
    nityaPanchang: 'नित्य पञ्चाङ्ग',
    dailyVedicObservance: 'दैनिक वैदिक पूजन एवं नित्य कर्म',

    fiveLimbsTitle: 'पञ्चाङ्ग के पाँच मूल अंग',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    vaar: 'वार',
    auspiciousAbhijit: 'शुभ अभिजित मुहूर्त',
    inauspiciousRahuKaal: 'अशुभ राहु काल',
    panchakStatus: 'पञ्चक स्थिति',
    panchakActive: 'सक्रिय (पञ्चक)',
    panchakFree: 'पञ्चक मुक्त (निर्दोष)',

    tabPanchang: 'पञ्चाङ्ग',
    tabChoghadiya: 'चौघड़िया',
    tabMuhurat: '24-घंटे मुहूर्त',
    tabAstrometry: 'ग्रह स्थिति',

    daytimeChoghadiya: 'दिन का चौघड़िया',
    nighttimeChoghadiya: 'रात्रि का चौघड़िया',
    auspicious: 'शुभ',
    inauspicious: 'अशुभ',
    neutral: 'मध्यम',

    shastraRuleHeader: 'धर्मशास्त्र निर्णय नियम',
    shastraAuthority: 'सूर्यसिद्धान्त एवं निर्णयसिन्धु',
    close: 'बंद करें',
    references: 'शास्त्र सन्दर्भ',
    switchLang: 'View in English',
    viewEnglish: 'English',
    viewHindi: 'हिन्दी'
  }
};

/**
 * Returns user's preferred language.
 * Strict Rule: If user has explicitly manually set a preference, that manual preference 
 * permanently overrides browser/GPS detection.
 */
export function getUserPreferredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'hi') {
      return saved;
    }

    // Auto-detect browser/system language as fallback only if not manually overridden
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (browserLang.startsWith('hi')) {
      return 'hi';
    }
  } catch {
    // LocalStorage or navigator not accessible
  }

  return 'en';
}

/**
 * Sets user's preferred language with strict manual override flag,
 * persists to localStorage, and immediately broadcasts to all active components.
 */
export function setUserPreferredLanguage(lang: AppLanguage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, lang);
    localStorage.setItem(OVERRIDE_KEY, 'true');
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { lang } }));
  } catch (err) {
    console.error('Failed to save preferred language:', err);
  }
}

/**
 * Toggles between 'en' and 'hi' with manual override guarantee.
 */
export function toggleUserPreferredLanguage(): AppLanguage {
  const current = getUserPreferredLanguage();
  const next: AppLanguage = current === 'hi' ? 'en' : 'hi';
  setUserPreferredLanguage(next);
  return next;
}

/**
 * React hook to consume and react to preferred language updates across the application.
 */
export function useUserLanguage(): {
  language: AppLanguage;
  isHindi: boolean;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations) => string;
  translations: Translations;
} {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    // Initial mount sync with localStorage / system
    const active = getUserPreferredLanguage();
    setLanguageState(active);

    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: AppLanguage }>;
      if (customEvent.detail?.lang) {
        setLanguageState(customEvent.detail.lang);
      } else {
        setLanguageState(getUserPreferredLanguage());
      }
    };

    window.addEventListener(EVENT_NAME, handleLanguageChange);
    window.addEventListener('storage', handleLanguageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, handleLanguageChange);
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, []);

  const handleSetLanguage = useCallback((lang: AppLanguage) => {
    setUserPreferredLanguage(lang);
    setLanguageState(lang);
  }, []);

  const handleToggleLanguage = useCallback(() => {
    const next = toggleUserPreferredLanguage();
    setLanguageState(next);
  }, []);

  const t = useCallback((key: keyof Translations): string => {
    return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  }, [language]);

  return {
    language,
    isHindi: language === 'hi',
    setLanguage: handleSetLanguage,
    toggleLanguage: handleToggleLanguage,
    t,
    translations: TRANSLATIONS[language] || TRANSLATIONS.en
  };
}

/**
 * Helper to get the single localized string from a bilingual { hindi, english } object based on user's preferred language.
 */
export function getLocalizedShastraRule(
  rule: { hindi: string; english: string } | undefined,
  language: AppLanguage
): string {
  if (!rule) return '';
  if (language === 'hi') {
    return rule.hindi || rule.english || '';
  }
  return rule.english || rule.hindi || '';
}
