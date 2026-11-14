"use client";

import React from 'react';
import { useLanguage } from '@/src/context/LanguageContext';

export function NavbarBrand() {
  const { t } = useLanguage();
  return (
    <div className="min-w-0">
      <span className="text-sm sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-amber-800 via-orange-700 to-amber-900 dark:from-amber-200 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent block leading-snug break-words drop-shadow-[0_1px_8px_rgba(234,88,12,0.15)] dark:drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)]">
        {t('brandTitle')}
      </span>
      <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase block leading-snug break-words font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-700 to-orange-800 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-300">
        {t('brandSubtitle')}
      </span>
    </div>
  );
}

