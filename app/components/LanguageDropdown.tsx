"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { SupportedLanguage } from '@/src/lib/i18n/translations';

interface Props {
  className?: string;
}

export function LanguageDropdown({ className = '' }: Props) {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentOption = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const handleSelect = useCallback((code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  }, [setLanguage]);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* ── Dropdown Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language"
        title="Select Application Language"
        className="bg-white/95 dark:bg-[#11192e] hover:bg-amber-50 dark:hover:bg-[#18233f] active:bg-amber-100 dark:active:bg-[#1c294a] border border-amber-400/40 dark:border-[#233152] text-stone-800 dark:text-neutral-100 text-xs rounded-xl px-2.5 py-1.5 inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all duration-150 select-none min-h-[32px]"
      >
        <Globe size={13} className="text-orange-600 dark:text-orange-400 shrink-0" />
        <span className="font-semibold tracking-tight text-stone-800 dark:text-neutral-200">
          {currentOption.nativeName}
        </span>
        <ChevronDown
          size={12}
          className={`text-stone-500 dark:text-neutral-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-orange-600 dark:text-orange-400' : ''
          }`}
        />
      </button>

      {/* ── Dropdown Menu Floating Popup ── */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white/95 dark:bg-[#0c1427] border border-[#d8c7a8] dark:border-[#233152] text-stone-800 dark:text-stone-200 shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.85)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
        >
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-neutral-400 border-b border-[#e2d5bd] dark:border-[#1b2642]">
            Language • भाषा
          </div>
          <div className="py-1">
            {supportedLanguages.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-900 dark:text-orange-300 font-semibold'
                      : 'text-stone-700 dark:text-neutral-300 hover:bg-amber-100/60 dark:hover:bg-[#16223e] hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex flex-col min-w-0 py-0.5">
                    <span className="font-medium text-[13px] leading-snug break-words">
                      {opt.nativeName}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-neutral-400 leading-normal">
                      {opt.label}
                    </span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-orange-600 dark:text-orange-400 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

