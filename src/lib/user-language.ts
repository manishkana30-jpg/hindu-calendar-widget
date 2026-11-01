"use client";

import { useState, useEffect } from 'react';

export type AppLanguage = 'en' | 'hi';

const STORAGE_KEY = 'preferred_language';
const EVENT_NAME = 'user-language-changed';

/**
 * Returns the user's preferred language.
 * Defaults to 'hi' if browser locale is Hindi ('hi', 'hi-IN'), otherwise 'en'.
 * Stored explicitly in localStorage if changed by user.
 */
export function getUserPreferredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'hi') {
      return saved;
    }

    // Auto-detect browser/system language
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
 * Sets user's preferred language, persists to localStorage, and broadcasts to all active components.
 */
export function setUserPreferredLanguage(lang: AppLanguage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { lang } }));
  } catch (err) {
    console.error('Failed to save preferred language:', err);
  }
}

/**
 * Toggles between 'en' and 'hi'.
 */
export function toggleUserPreferredLanguage(): AppLanguage {
  const current = getUserPreferredLanguage();
  const next: AppLanguage = current === 'hi' ? 'en' : 'hi';
  setUserPreferredLanguage(next);
  return next;
}

/**
 * React hook to consume and react to preferred language updates across the entire application.
 */
export function useUserLanguage(): {
  language: AppLanguage;
  isHindi: boolean;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
} {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    // Initial mount sync with localStorage/navigator
    setLanguageState(getUserPreferredLanguage());

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

  const handleSetLanguage = (lang: AppLanguage) => {
    setUserPreferredLanguage(lang);
    setLanguageState(lang);
  };

  const handleToggleLanguage = () => {
    const next = toggleUserPreferredLanguage();
    setLanguageState(next);
  };

  return {
    language,
    isHindi: language === 'hi',
    setLanguage: handleSetLanguage,
    toggleLanguage: handleToggleLanguage
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
