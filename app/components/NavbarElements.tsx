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

