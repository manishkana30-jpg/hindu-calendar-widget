"use client";

import React from 'react';
import { useLanguage } from '@/src/context/LanguageContext';

export function LiveBadge() {
  const { t } = useLanguage();
  return (
    <div 
      title={t('live')}
      aria-label={t('live')}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400/50 text-emerald-300 text-[10px] font-mono font-bold select-none shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
      </span>
      <span className="tracking-wider uppercase text-[9px] font-extrabold leading-none">{t('live')}</span>
    </div>
  );
}

export function NavbarBrand() {
  const { t } = useLanguage();
  return (
    <div className="min-w-0 flex flex-col justify-center">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <span className="text-sm sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 bg-clip-text text-transparent block leading-snug drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)] whitespace-nowrap">
          {t('brandTitle')}
        </span>
        <LiveBadge />
      </div>
      <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase block leading-snug font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 truncate">
        {t('brandSubtitle')}
      </span>
    </div>
  );
}

