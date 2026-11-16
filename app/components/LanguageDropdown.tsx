"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { SupportedLanguage } from '@/src/lib/i18n/translations';

interface Props {
  className?: string;
}

const LANG_CODE_MAP: Record<string, string> = {
  en: 'ENG',
  hi: 'HIN',
  mr: 'MAR',
  gu: 'GUJ',
  sa: 'SAN',
};

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
  const shortLangCode = LANG_CODE_MAP[language] || (currentOption.label || language).slice(0, 3).toUpperCase();

  const handleSelect = useCallback((code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  }, [setLanguage]);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* ── Dropdown Trigger Button (Compact 3-letter badge) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language"
        title={`Language: ${currentOption.label} (${shortLangCode})`}
        className="bg-[#11192e] hover:bg-[#18233f] active:bg-[#1c294a] border border-[#233152] text-neutral-100 text-xs rounded-xl px-2.5 py-2 inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all duration-150 select-none min-h-[44px]"
      >
        <Globe size={14} className="text-orange-400 shrink-0" />
        <span className="font-bold tracking-wider font-mono text-neutral-200 uppercase text-xs">
          {shortLangCode}
        </span>
        <ChevronDown
          size={12}
          className={`text-neutral-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-orange-400' : ''
          }`}
        />
      </button>

      {/* ── Dropdown Menu Floating Popup ── */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#0c1427] border border-[#233152] shadow-[0_16px_40px_rgba(0,0,0,0.85)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
        >
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-[#1b2642]">
            Language • भाषा
          </div>
          <div className="py-1">
            {supportedLanguages.map((opt) => {
              const isSelected = opt.code === language;
              const codeBadge = LANG_CODE_MAP[opt.code] || opt.code.slice(0, 3).toUpperCase();
              return (
                <button
                  key={opt.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full text-left px-3 py-2.5 min-h-[44px] text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500/15 text-orange-300 font-semibold'
                      : 'text-neutral-300 hover:bg-[#16223e] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] font-bold text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/25 shrink-0">
                      {codeBadge}
                    </span>
                    <div className="flex flex-col min-w-0 py-0.5">
                      <span className="font-medium text-[13px] leading-snug break-words">
                        {opt.nativeName}
                      </span>
                      <span className="text-[10px] text-neutral-400 leading-normal">
                        {opt.label}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-orange-400 shrink-0 ml-1" />
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

