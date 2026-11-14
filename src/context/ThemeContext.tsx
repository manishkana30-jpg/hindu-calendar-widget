"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'auto' | 'dawn' | 'cosmic';
export type ResolvedTheme = 'dawn' | 'cosmic';

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDaytimeNow: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'dt_theme_mode';

/**
 * Determines whether the current local time is daytime (Dawn Temple: 06:00 to 18:30)
 * or nighttime (Cosmic Dark: 18:30 to 06:00).
 */
export function checkIsDaytime(date: Date = new Date()): boolean {
  const decimalHours = date.getHours() + date.getMinutes() / 60;
  return decimalHours >= 6.0 && decimalHours < 18.5;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('cosmic');
  const [isDaytimeNow, setIsDaytimeNow] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Compute resolved theme given a mode and current time
  const computeTheme = useCallback((mode: ThemeMode): { resolved: ResolvedTheme; isDay: boolean } => {
    const isDay = checkIsDaytime();
    if (mode === 'dawn') return { resolved: 'dawn', isDay };
    if (mode === 'cosmic') return { resolved: 'cosmic', isDay };
    // Auto: daytime is Dawn Temple, nighttime is Cosmic Dark
    return { resolved: isDay ? 'dawn' : 'cosmic', isDay };
  }, []);

  // Synchronize DOM elements (classes, data-theme, theme-color meta, color-scheme meta)
  const applyThemeToDom = useCallback((theme: ResolvedTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (theme === 'cosmic') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'cosmic');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'dawn');
    }

    // Update color-scheme meta
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
    if (colorSchemeMeta) {
      colorSchemeMeta.content = theme === 'cosmic' ? 'dark' : 'light';
    }

    // Update mobile browser status bar / theme-color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (themeColorMeta) {
      themeColorMeta.content = theme === 'cosmic' ? '#090e1a' : '#fcf8f0';
    }
  }, []);

  // Initial client hydration from localStorage or DOM state
  useEffect(() => {
    setIsMounted(true);
    let initialMode: ThemeMode = 'auto';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'dawn' || stored === 'cosmic' || stored === 'auto') {
        initialMode = stored;
      }
    } catch {
      // localStorage may fail in restricted/private modes
    }

    const { resolved, isDay } = computeTheme(initialMode);
    setThemeModeState(initialMode);
    setResolvedTheme(resolved);
    setIsDaytimeNow(isDay);
    applyThemeToDom(resolved);

    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const nextMode = (e.newValue as ThemeMode) || 'auto';
        setThemeModeState(nextMode);
        const next = computeTheme(nextMode);
        setResolvedTheme(next.resolved);
        setIsDaytimeNow(next.isDay);
        applyThemeToDom(next.resolved);
      }
    };
    window.addEventListener('storage', handleStorage);

    // Periodic time check every 60 seconds for smooth sunrise/sunset transitions in auto mode
    const interval = setInterval(() => {
      const isDay = checkIsDaytime();
      setIsDaytimeNow(isDay);
      setThemeModeState((currentMode) => {
        if (currentMode === 'auto') {
          const nextResolved: ResolvedTheme = isDay ? 'dawn' : 'cosmic';
          setResolvedTheme(nextResolved);
          applyThemeToDom(nextResolved);
        }
        return currentMode;
      });
    }, 60000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [computeTheme, applyThemeToDom]);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setThemeModeState(newMode);
    try {
      if (newMode === 'auto') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, newMode);
      }
    } catch {
      // Graceful fallback
    }

    const { resolved, isDay } = computeTheme(newMode);
    setResolvedTheme(resolved);
    setIsDaytimeNow(isDay);
    applyThemeToDom(resolved);
  }, [computeTheme, applyThemeToDom]);

  const toggleTheme = useCallback(() => {
    // If currently resolved is cosmic, switch to dawn; if dawn, switch to cosmic.
    setThemeMode(resolvedTheme === 'cosmic' ? 'dawn' : 'cosmic');
  }, [resolvedTheme, setThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        setThemeMode,
        toggleTheme,
        isDaytimeNow,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
