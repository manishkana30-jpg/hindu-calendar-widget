"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  SupportedLanguage,
  UI_TRANSLATIONS,
  TranslationDictionary,
  translateTerm as translateTermRaw
} from './i18n/translations';

export type AppLanguage = SupportedLanguage;

const PRIMARY_STORAGE_KEY = 'daily_tithi_lang';
const LEGACY_STORAGE_KEY = 'preferred_language';
const OVERRIDE_KEY = 'manual_language_override';
const PRIMARY_EVENT = 'daily-tithi-lang-changed';
const LEGACY_EVENT = 'user-language-changed';

export type Translations = TranslationDictionary;

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = UI_TRANSLATIONS;

/**
 * Returns user's preferred language.
 * Strict Rule: If user has explicitly manually set a preference, that manual preference 
 * permanently overrides browser/GPS detection.
 */
export function getUserPreferredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';

  try {
    const primary = localStorage.getItem(PRIMARY_STORAGE_KEY) as AppLanguage | null;
    if (primary && ['en', 'hi', 'sa', 'mr', 'gu'].includes(primary)) {
      return primary;
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY) as AppLanguage | null;
    if (legacy && ['en', 'hi', 'sa', 'mr', 'gu'].includes(legacy)) {
      return legacy;
    }

    // Auto-detect browser/system language as fallback only if not manually overridden
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('mr')) return 'mr';
    if (browserLang.startsWith('gu')) return 'gu';
    if (browserLang.startsWith('sa')) return 'sa';
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
    localStorage.setItem(PRIMARY_STORAGE_KEY, lang);
    localStorage.setItem(LEGACY_STORAGE_KEY, lang);
    localStorage.setItem(OVERRIDE_KEY, 'true');
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    window.dispatchEvent(new CustomEvent(PRIMARY_EVENT, { detail: { lang } }));
    window.dispatchEvent(new CustomEvent(LEGACY_EVENT, { detail: { lang } }));
  } catch (err) {
    console.error('Failed to save preferred language:', err);
  }
}

/**
 * Toggles between 'en' and 'hi' (or cycles) with manual override guarantee.
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
  t: (key: keyof TranslationDictionary) => string;
  translateTerm: (term: string | undefined | null) => string;
  translations: TranslationDictionary;
} {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    const active = getUserPreferredLanguage();
    setLanguageState(active);

    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: AppLanguage }>;
      if (customEvent.detail?.lang && ['en', 'hi', 'sa', 'mr', 'gu'].includes(customEvent.detail.lang)) {
        setLanguageState(customEvent.detail.lang);
      } else {
        setLanguageState(getUserPreferredLanguage());
      }
    };

    window.addEventListener(PRIMARY_EVENT, handleLanguageChange);
    window.addEventListener(LEGACY_EVENT, handleLanguageChange);
    window.addEventListener('storage', handleLanguageChange);

    return () => {
      window.removeEventListener(PRIMARY_EVENT, handleLanguageChange);
      window.removeEventListener(LEGACY_EVENT, handleLanguageChange);
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

  const t = useCallback((key: keyof TranslationDictionary): string => {
    return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? String(key);
  }, [language]);

  const translateTerm = useCallback((term: string | undefined | null): string => {
    return translateTermRaw(term, language);
  }, [language]);

  return {
    language,
    isHindi: language === 'hi',
    setLanguage: handleSetLanguage,
    toggleLanguage: handleToggleLanguage,
    t,
    translateTerm,
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
  if (language === 'hi' || language === 'sa' || language === 'mr' || language === 'gu') {
    return rule.hindi || rule.english || '';
  }
  return rule.english || rule.hindi || '';
}
