"use client";

import React, { useEffect } from 'react';
import { X, ArrowLeft, Calendar } from 'lucide-react';
import dynamic from 'next/dynamic';
import { LocationCoordinates } from '../../../src/lib/vedic-astronomy';
import { useLanguage } from '../../../src/context/LanguageContext';
import { CalendarFilterTab } from '../MonthlyVedicCalendar';
export type { CalendarFilterTab };

const MonthlyVedicCalendar = dynamic(
  () => import('../MonthlyVedicCalendar').then((mod) => mod.MonthlyVedicCalendar),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <span className="text-xs text-neutral-400 font-mono">Loading Unified Vedic Calendar...</span>
      </div>
    ),
    ssr: false,
  }
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  onSelectDate?: (date: Date) => void;
  initialTab?: CalendarFilterTab;
}

export function TithiMonthModal({ 
  isOpen, 
  onClose, 
  location, 
  onSelectDate,
  initialTab = 'all'
}: Props) {
  const { language, t } = useLanguage();

  // Lock background body scroll strictly while modal is open with guaranteed cleanup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC key listener for accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalTitle = initialTab === 'vrats' ? t('viewFullVratCalendar') : t('almanac30Day');

  return (
    <div 
      onClick={(e) => {
        // Close when clicking the backdrop overlay
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Unified Vedic Calendar and Almanac"
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-none sm:max-w-6xl h-dvh sm:h-auto max-h-dvh sm:max-h-[88dvh] bg-[#070b16] border-0 sm:border border-[#233152] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans animate-in fade-in sm:zoom-in-95 duration-200 overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
        
        {/* Modal Top Navigation Bar */}
        <div className="p-3.5 px-4 sm:px-5 bg-[#090e1a] border-b border-[#1a233a] flex items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {/* Back Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11192e] hover:bg-[#1a2544] border border-[#233152] text-neutral-200 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm shrink-0"
              title={t('home')}
              aria-label={t('home')}
            >
              <ArrowLeft size={14} className="text-orange-400 shrink-0" />
              <span>← {t('home')}</span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider leading-snug">
              <Calendar size={13} className="shrink-0" />
              <span className="break-words">{modalTitle}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-[11px] text-neutral-400 font-medium">
              Location: <strong className="text-neutral-200">{location.name}</strong>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title={t('close')}
              aria-label={t('close')}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Monthly Vedic Calendar Content */}
        <div className="flex-1 w-full min-h-0 overflow-y-auto overscroll-contain touch-pan-x touch-pan-y p-2 sm:p-4 pb-36 sm:pb-28 mb-safe [-webkit-overflow-scrolling:touch]">
          <MonthlyVedicCalendar 
            initialLocation={location} 
            onSelectDate={(d) => {
              if (onSelectDate) onSelectDate(d);
            }}
            embeddedInModal={true}
            initialTab={initialTab}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-4 sm:px-6 bg-[#090e1a] border-t border-[#1a233a] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 shrink-0">
          <div className="break-words min-w-0 leading-snug">{t('shastraAuthority')} • Lahiri Sidereal Ayanamsha</div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors cursor-pointer shadow-md shadow-orange-500/20 active:scale-95 shrink-0"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
}
