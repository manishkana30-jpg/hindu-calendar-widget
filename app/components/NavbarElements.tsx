"use client";

import React from 'react';
import { useLanguage } from '@/src/context/LanguageContext';

export function NavbarBrand() {
  const { t } = useLanguage();
  return (
    <div className="min-w-0">
      <span className="text-xs sm:text-base font-extrabold tracking-tight text-white block leading-snug break-words">
        {t('brandTitle')}
      </span>
      <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono tracking-wider uppercase block leading-snug break-words">
        {t('brandSubtitle')}
      </span>
    </div>
  );
}

export function LiveAstrometryPill() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#11192e] border border-[#233152] text-xs font-medium text-neutral-300 shadow-sm shrink-0">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <span className="font-mono text-[10px] sm:text-[11px] text-neutral-300 whitespace-nowrap">
        <span className="inline sm:hidden">{t('live')}</span>
        <span className="hidden sm:inline">{t('liveAstrometry')}</span>
      </span>
    </div>
  );
}

