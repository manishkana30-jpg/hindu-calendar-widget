"use client";

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useUserLanguage } from '../../src/lib/user-language';

interface Props {
  variant?: 'navbar' | 'widget';
  className?: string;
}

export function LanguageToggleButton({ variant = 'navbar', className = '' }: Props) {
  const { language, setLanguage } = useUserLanguage();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe SSR placeholder to prevent hydration flicker
  const activeLang = mounted ? language : 'en';

  if (variant === 'widget') {
    return (
      <div 
        role="group" 
        aria-label="Preferred Language"
        className={`inline-flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-white/10 shadow-sm shrink-0 ${className}`}
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          title="Switch webapp language to English"
          aria-pressed={activeLang === 'en'}
          className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeLang === 'en'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('hi')}
          title="वेबसाइट की भाषा बदलकर हिन्दी करें"
          aria-pressed={activeLang === 'hi'}
          className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeLang === 'hi'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          हिन्दी
        </button>
      </div>
    );
  }

  // Navbar Variant (Default) — sits right near the twinkling "Live" indicator
  return (
    <div 
      role="group" 
      aria-label="Select Preferred Language"
      className={`inline-flex items-center gap-1 p-0.5 sm:p-1 rounded-full bg-[#11192e] border border-[#233152] shadow-sm shrink-0 ${className}`}
    >
      <div className="pl-1.5 pr-0.5 text-amber-400 flex items-center justify-center shrink-0">
        <Globe size={13} className="text-amber-400" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        title="Switch display language to English"
        aria-pressed={activeLang === 'en'}
        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer active:scale-95 ${
          activeLang === 'en'
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        title="वेबसाइट की भाषा बदलकर हिन्दी करें"
        aria-pressed={activeLang === 'hi'}
        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer active:scale-95 ${
          activeLang === 'hi'
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
