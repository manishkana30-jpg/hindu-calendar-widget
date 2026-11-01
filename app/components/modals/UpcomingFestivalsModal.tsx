"use client";

import React, { useState, useMemo } from 'react';
import { X, Calendar, BookOpen, Filter, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { LocationCoordinates, PRESET_LOCATIONS } from '../../../src/lib/vedic-astronomy';
import { getUpcomingFestivalsList, UpcomingFestivalResult } from '../../../src/lib/festivals';
import { useLanguage } from '../../../src/context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location?: LocationCoordinates;
  currentDate?: Date;
}

type FilterKey = 'all' | 'ekadashi' | 'pradosh' | 'purnima_amavasya' | 'major';

export function UpcomingFestivalsModal({ isOpen, onClose, location, currentDate }: Props) {
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('all');
  const { language, t, translateTerm, localeCode } = useLanguage();

  const loc = location || PRESET_LOCATIONS[0];

  const allUpcoming: UpcomingFestivalResult[] = useMemo(() => {
    const baseDate = currentDate || new Date();
    return getUpcomingFestivalsList(baseDate, loc, 35, 240);
  }, [currentDate, loc]);

  if (!isOpen) return null;

  const filterOptions: { key: FilterKey; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'ekadashi', label: t('filterEkadashi') },
    { key: 'pradosh', label: t('filterPradosh') },
    { key: 'purnima_amavasya', label: t('filterPurnimaAmavasya') },
    { key: 'major', label: t('filterMajor') },
  ];

  const filteredFestivals = allUpcoming.filter((fest) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'ekadashi') return fest.category === 'Ekadashi';
    if (selectedFilter === 'pradosh') return fest.category === 'Pradosh';
    if (selectedFilter === 'purnima_amavasya') {
      return (
        fest.category === 'Purnima' ||
        fest.category === 'Amavasya' ||
        fest.name.includes('Purnima') ||
        fest.name.includes('Amavasya')
      );
    }
    if (selectedFilter === 'major') return fest.isMajor || fest.category === 'Major Festival';
    return true;
  });

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-none sm:max-w-5xl h-dvh sm:h-auto sm:max-h-[85dvh] bg-[#090e1a] border-0 sm:border border-[#233152] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Calendar size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  {t('viewFullVratCalendar')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {loc.name}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {language === 'hi' 
                  ? 'धर्मशास्त्र निर्णयसिन्धु एवं सूर्यसिद्धान्त आधारित प्रामाणिक गणना'
                  : 'Calculated with Swiss Ephemeris & Canonical Dharmashastra Rules'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0"
            title={t('close')}
            aria-label={t('close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0c1222] border-b border-[#1a233a] flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs text-neutral-400 mr-1 flex items-center gap-1 font-semibold">
            <Filter size={12} />
          </span>
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSelectedFilter(opt.key)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === opt.key
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-[#11192e] text-neutral-400 hover:text-neutral-200 border border-[#233152]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content (Clean Chronological List View) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3 sm:p-5 pb-24 space-y-3 [-webkit-overflow-scrolling:touch]">
          
          {filteredFestivals.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-sm">
              {language === 'hi' ? 'इस श्रेणी में कोई पर्व उपलब्ध नहीं है।' : 'No festivals found in this category.'}
            </div>
          ) : (
            filteredFestivals.map((fest, idx) => {
              const festTitle = translateTerm(language === 'hi' ? fest.hindiName || fest.name : fest.name, language);
              const dateBadgeDay = fest.targetDate.toLocaleDateString(localeCode, { day: 'numeric', month: 'short' });
              const dateBadgeWeekday = fest.targetDate.toLocaleDateString(localeCode, { weekday: 'short' });
              const countdown = fest.daysRemaining === 0 
                ? t('live') 
                : (fest.daysRemaining === 1 ? (language === 'hi' ? 'कल' : 'Tomorrow') : t('inDays').replace('{n}', String(fest.daysRemaining)));

              return (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#0c1222] border border-[#1e2942] hover:border-emerald-500/40 transition-all space-y-2.5 group"
                >
                  {/* Top Row: Date Pill, Title, Category Badge, Countdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#18233c] pb-2.5">
                    <div className="flex items-center gap-3">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center min-w-[54px] px-2 py-1.5 rounded-xl bg-[#11192e] border border-[#233152] shrink-0 text-center">
                        <span className="text-xs font-bold text-white font-grotesk">{dateBadgeDay}</span>
                        <span className="text-[10px] text-neutral-400 font-medium">{dateBadgeWeekday}</span>
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-[#11192e] border border-[#233152] flex items-center justify-center text-lg shrink-0">
                        {fest.icon || '🪔'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            {fest.category}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                            {countdown}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                          {festTitle}
                        </h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right pl-[66px] sm:pl-0 shrink-0">
                      <div className="text-xs font-mono font-bold text-white flex items-center sm:justify-end gap-1.5">
                        <Sparkles size={12} className="text-emerald-400 shrink-0" />
                        <span>{fest.dateFormatted}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{fest.dayOfWeek}</div>
                    </div>
                  </div>

                  {/* Description / Observance */}
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {fest.description}
                  </p>

                  {/* Parana Timing (if available) */}
                  {fest.paranaTime && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
                      <Clock size={12} className="text-amber-400 shrink-0" />
                      <span><strong>{t('paranaTime')}:</strong> {fest.paranaTime}</span>
                    </div>
                  )}

                  {/* Shastra Canonical Rule in Active Language */}
                  {fest.briefRule && (
                    <div className="p-2.5 rounded-xl bg-[#11192e] border border-amber-500/20 text-xs space-y-1">
                      <div className="flex items-center text-amber-300 font-bold text-[11px] gap-1.5">
                        <BookOpen size={12} className="text-amber-400 shrink-0" />
                        <span>{t('shastraRuleHeader')}:</span>
                      </div>
                      <p className="text-neutral-200 leading-relaxed text-[11px]">
                        {language === 'hi'
                          ? (fest.briefRule.hindi || fest.description)
                          : (fest.briefRule.english || fest.description)}
                      </p>
                    </div>
                  )}

                  {/* Shastra References */}
                  {fest.shastraReferences && fest.shastraReferences.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {fest.shastraReferences.map((ref, rIdx) => (
                        <span key={rIdx} className="text-[10px] px-2 py-0.5 rounded bg-[#11192e] text-neutral-400 border border-[#1e2942]">
                          📖 {ref}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div>{t('shastraAuthority')}</div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors cursor-pointer active:scale-95 shadow-md"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
}
