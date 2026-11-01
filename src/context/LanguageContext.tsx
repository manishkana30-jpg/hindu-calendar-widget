"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  TranslationDictionary,
  UI_TRANSLATIONS,
  translateTerm as translateTermRaw
} from '../lib/i18n/translations';

const PRIMARY_STORAGE_KEY = 'daily_tithi_lang';
const LEGACY_STORAGE_KEY = 'preferred_language';
const OVERRIDE_KEY = 'manual_language_override';
const PRIMARY_EVENT = 'daily-tithi-lang-changed';
const LEGACY_EVENT = 'user-language-changed';

export interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationDictionary) => string;
  translateTerm: (term: string | undefined | null, targetLang?: SupportedLanguage) => string;
  localeCode: string;
  isHindi: boolean;
  translations: TranslationDictionary;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getSavedLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';

  try {
    const primary = localStorage.getItem(PRIMARY_STORAGE_KEY) as SupportedLanguage | null;
    if (primary && ['en', 'hi', 'sa', 'mr', 'gu'].includes(primary)) {
      return primary;
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY) as SupportedLanguage | null;
    if (legacy && ['en', 'hi', 'sa', 'mr', 'gu'].includes(legacy)) {
      return legacy;
    }

    // Browser language fallback only if not manually overridden
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('mr')) return 'mr';
    if (browserLang.startsWith('gu')) return 'gu';
    if (browserLang.startsWith('sa')) return 'sa';
  } catch {
    // Storage access restricted
  }

  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  // Synchronize on mount and update document html lang
  useEffect(() => {
    const initialLang = getSavedLanguage();
    setLanguageState(initialLang);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = initialLang;
    }

    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: SupportedLanguage }>;
      if (customEvent.detail?.lang && ['en', 'hi', 'sa', 'mr', 'gu'].includes(customEvent.detail.lang)) {
        setLanguageState(customEvent.detail.lang);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = customEvent.detail.lang;
        }
      } else {
        const updated = getSavedLanguage();
        setLanguageState(updated);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = updated;
        }
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

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PRIMARY_STORAGE_KEY, newLang);
        localStorage.setItem(LEGACY_STORAGE_KEY, newLang);
        localStorage.setItem(OVERRIDE_KEY, 'true');
        document.documentElement.lang = newLang;

        window.dispatchEvent(new CustomEvent(PRIMARY_EVENT, { detail: { lang: newLang } }));
        window.dispatchEvent(new CustomEvent(LEGACY_EVENT, { detail: { lang: newLang } }));
      } catch (err) {
        console.error('Failed to persist language preference:', err);
      }
    }
  }, []);

  const t = useCallback(
    (key: keyof TranslationDictionary): string => {
      return (
        UI_TRANSLATIONS[language]?.[key] ??
        UI_TRANSLATIONS.en[key] ??
        String(key)
      );
    },
    [language]
  );

  const translateTerm = useCallback(
    (term: string | undefined | null, targetLang?: SupportedLanguage): string => {
      return translateTermRaw(term, targetLang || language);
    },
    [language]
  );

  const activeOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((opt) => opt.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      translateTerm,
      localeCode: activeOption.localeCode,
      isHindi: language === 'hi',
      translations: UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, translateTerm, activeOption]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for non-provider SSR or test environments
    const fallbackLang: SupportedLanguage = 'en';
    const activeOption = SUPPORTED_LANGUAGES[0];
    return {
      language: fallbackLang,
      setLanguage: () => {},
      t: (key: keyof TranslationDictionary) => UI_TRANSLATIONS.en[key] ?? String(key),
      translateTerm: (term: string | undefined | null, targetLang?: SupportedLanguage) => {
        if (!term) return '';
        return translateTermRaw(term, targetLang || fallbackLang);
      },
      localeCode: activeOption.localeCode,
      isHindi: false,
      translations: UI_TRANSLATIONS.en,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
}
