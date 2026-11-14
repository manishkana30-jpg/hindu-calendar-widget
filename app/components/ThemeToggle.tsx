"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '@/src/context/ThemeContext';
import { Sun, Moon, Sparkles, Check, ChevronDown } from 'lucide-react';

export function ThemeToggle() {
  const { themeMode, resolvedTheme, setThemeMode, toggleTheme, isDaytimeNow } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isDawn = resolvedTheme === 'dawn';

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* ── Main Theme Trigger Button ── */}
      <div className="flex items-center rounded-xl p-0.5 border transition-all duration-200 shadow-sm bg-amber-50/80 dark:bg-[#0c152a]/80 border-amber-500/30 dark:border-amber-500/30">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDawn ? "Switch to Cosmic Dark Night mode" : "Switch to Dawn Temple Day mode"}
          title={isDawn ? "Dawn Temple Mode active • Click to switch to Cosmic Dark" : "Cosmic Dark Mode active • Click to switch to Dawn Temple"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
            isDawn
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 text-amber-300 hover:text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]'
          }`}
        >
          {isDawn ? (
            <>
              <span className="text-sm leading-none" role="img" aria-label="Dawn Sun">🌅</span>
              <span className="font-outfit font-bold tracking-tight text-[11px] sm:text-xs">
                Dawn
              </span>
            </>
          ) : (
            <>
              <span className="text-sm leading-none" role="img" aria-label="Cosmic Night">🌌</span>
              <span className="font-outfit font-bold tracking-tight text-[11px] sm:text-xs">
                Cosmic
              </span>
            </>
          )}
        </button>

        {/* Dropdown chevron to select mode explicitly (Dawn, Cosmic, Auto) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Theme mode options"
          title="Theme settings (Dawn, Cosmic, Auto)"
          className="p-1.5 rounded-md hover:bg-amber-500/15 text-stone-600 dark:text-amber-300/80 hover:text-stone-900 dark:hover:text-amber-200 transition-colors cursor-pointer"
        >
          <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select color theme"
          className="absolute right-0 mt-1.5 w-56 rounded-2xl p-1.5 z-50 backdrop-blur-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-150 font-sans border bg-white/95 dark:bg-[#0c152a]/95 border-amber-300/60 dark:border-amber-500/30 text-stone-800 dark:text-stone-200"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400/80 font-outfit border-b border-amber-500/15">
            Display Mode
          </div>

          <button
            type="button"
            role="option"
            aria-selected={themeMode === 'dawn'}
            onClick={() => {
              setThemeMode('dawn');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 mt-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              themeMode === 'dawn'
                ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold'
                : 'hover:bg-amber-500/10 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🌅</span>
              <div className="text-left">
                <div className="leading-snug">Dawn Temple</div>
                <div className="text-[10px] font-normal text-stone-500 dark:text-stone-400">Warm ivory daylight theme</div>
              </div>
            </div>
            {themeMode === 'dawn' && <Check size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />}
          </button>

          <button
            type="button"
            role="option"
            aria-selected={themeMode === 'cosmic'}
            onClick={() => {
              setThemeMode('cosmic');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              themeMode === 'cosmic'
                ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold'
                : 'hover:bg-amber-500/10 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🌌</span>
              <div className="text-left">
                <div className="leading-snug">Cosmic Dark</div>
                <div className="text-[10px] font-normal text-stone-500 dark:text-stone-400">Deep jewel-tone night theme</div>
              </div>
            </div>
            {themeMode === 'cosmic' && <Check size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />}
          </button>

          <button
            type="button"
            role="option"
            aria-selected={themeMode === 'auto'}
            onClick={() => {
              setThemeMode('auto');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              themeMode === 'auto'
                ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold'
                : 'hover:bg-amber-500/10 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <div className="text-left">
                <div className="leading-snug">Auto Day / Night</div>
                <div className="text-[10px] font-normal text-stone-500 dark:text-stone-400">
                  {isDaytimeNow ? 'Currently Dawn (Day)' : 'Currently Cosmic (Night)'}
                </div>
              </div>
            </div>
            {themeMode === 'auto' && <Check size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />}
          </button>
        </div>
      )}
    </div>
  );
}
