"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Clock, Sun, Moon, Sparkles
} from 'lucide-react';
import { PanchangData } from '../../../src/lib/vedic-astronomy';
import { COMPLETE_MUHURATS_LIST } from '../../../src/lib/dharmashastra-rules';
import { useLanguage } from '../../../src/context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  panchang: PanchangData;
}

// Helper to parse "05:56 AM" into total minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 360; // fallback 6:00 AM
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Helper to format minutes from midnight into "05:56 AM"
function formatMinutesToTime(totalMins: number): string {
  let normalized = Math.round(totalMins) % 1440;
  if (normalized < 0) normalized += 1440;
  let hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  return `${pad(hours)}:${pad(mins)} ${period}`;
}

type MuhuratTabType = 'all30' | 'choghadiya' | 'shubhAshubh';

export function DailyMuhuratModal({ isOpen, onClose, panchang }: Props) {
  const [activeTab, setActiveTab] = useState<MuhuratTabType>('all30');
  const [liveNow, setLiveNow] = useState<Date>(() => new Date());
  const { language, t, translateTerm, localeCode } = useLanguage();

  // Second-by-second Gregorian Live Clock Ticker
  useEffect(() => {
    if (!isOpen) return;
    setLiveNow(new Date());
    const interval = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

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
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Format Gregorian Live Clock values using active language locale
  const liveDateFormatted = useMemo(() => {
    try {
      return liveNow.toLocaleDateString(localeCode, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return liveNow.toDateString();
    }
  }, [liveNow, localeCode]);

  const liveTimeFormatted = useMemo(() => {
    try {
      return liveNow.toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return liveNow.toTimeString();
    }
  }, [liveNow, localeCode]);

  if (!isOpen) return null;

  // Calculate current minutes from midnight using live clock
  const currentMinutes = liveNow.getHours() * 60 + liveNow.getMinutes() + liveNow.getSeconds() / 60;

  // Parse sunrise & sunset
  const sunriseMin = parseTimeToMinutes(panchang.sunrise);
  const sunsetMin = parseTimeToMinutes(panchang.sunset);
  
  // 15 Day Muhurats calculation
  const dayLengthMin = sunsetMin >= sunriseMin ? sunsetMin - sunriseMin : (sunsetMin + 1440) - sunriseMin;
  const daySlotDuration = dayLengthMin / 15;

  // 15 Night Muhurats calculation
  const nextSunriseMin = sunriseMin;
  const nightLengthMin = (1440 - sunsetMin) + nextSunriseMin;
  const nightSlotDuration = nightLengthMin / 15;

  // Anchor dates to the Vedic Day (Ahoratra)
  const isPreSunrise = currentMinutes < sunriseMin;

  const baseVedicDate = new Date(liveNow);
  if (isPreSunrise) {
    baseVedicDate.setDate(baseVedicDate.getDate() - 1);
  }
  const nextVedicDate = new Date(baseVedicDate);
  nextVedicDate.setDate(nextVedicDate.getDate() + 1);

  const formatGregorianDate = (d: Date) => {
    try {
      return d.toLocaleDateString(localeCode, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return d.toDateString();
    }
  };

  const baseDateStr = formatGregorianDate(baseVedicDate);
  const nextDateStr = formatGregorianDate(nextVedicDate);

  // Build Day Muhurats
  const dayMuhuratsWithTimes = COMPLETE_MUHURATS_LIST.filter(m => m.period === 'Diurnal').map((m, idx) => {
    const sMin = sunriseMin + idx * daySlotDuration;
    const eMin = sMin + daySlotDuration;
    const startTimeStr = formatMinutesToTime(sMin);
    const endTimeStr = formatMinutesToTime(eMin);
    const isCurrent = currentMinutes >= sMin && currentMinutes < eMin;
    const dateStr = baseDateStr;

    return {
      ...m,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationMins: Math.round(daySlotDuration),
      isCurrent
    };
  });

  // Build Night Muhurats
  const nightMuhuratsWithTimes = COMPLETE_MUHURATS_LIST.filter(m => m.period === 'Nocturnal').map((m, idx) => {
    const sMin = sunsetMin + idx * nightSlotDuration;
    const eMin = sMin + nightSlotDuration;
    const startTimeStr = formatMinutesToTime(sMin);
    const endTimeStr = formatMinutesToTime(eMin);
    
    const isPostMidnight = sMin >= 1440;
    const dateStr = isPostMidnight ? nextDateStr : baseDateStr;

    const normS = sMin % 1440;
    const normE = eMin % 1440;
    let isCurrent = false;
    if (normS < normE) {
      isCurrent = currentMinutes >= normS && currentMinutes < normE;
    } else {
      isCurrent = currentMinutes >= normS || currentMinutes < normE;
    }

    return {
      ...m,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationMins: Math.round(nightSlotDuration),
      isCurrent
    };
  });

  // Unified list of 11 Shubh and Ashubh Windows
  const shubhAshubhList = [
    { name: 'Brahma Muhurat', nature: 'Auspicious', start: panchang.muhurats.brahmaMuhurat.start, end: panchang.muhurats.brahmaMuhurat.end },
    { name: 'Abhijit Muhurat', nature: 'Highly Auspicious', start: panchang.muhurats.abhijitMuhurat.start, end: panchang.muhurats.abhijitMuhurat.end },
    { name: 'Amrit Kaal', nature: 'Auspicious', start: panchang.muhurats.amritKaal.start, end: panchang.muhurats.amritKaal.end },
    { name: 'Vijaya Muhurat', nature: 'Auspicious', start: panchang.muhurats.vijayaMuhurat.start, end: panchang.muhurats.vijayaMuhurat.end },
    { name: 'Godhuli Muhurat', nature: 'Auspicious', start: panchang.muhurats.godhuliMuhurat.start, end: panchang.muhurats.godhuliMuhurat.end },
    { name: 'Sayahna Sandhya', nature: 'Moderate', start: panchang.muhurats.sayahnaSandhya.start, end: panchang.muhurats.sayahnaSandhya.end },
    { name: 'Gulika Kaal', nature: 'Moderate', start: panchang.muhurats.gulikaKaal.start, end: panchang.muhurats.gulikaKaal.end },
    { name: 'Rahu Kaal', nature: 'Inauspicious', start: panchang.muhurats.rahuKaal.start, end: panchang.muhurats.rahuKaal.end },
    { name: 'Yamaganda', nature: 'Inauspicious', start: panchang.muhurats.yamaganda.start, end: panchang.muhurats.yamaganda.end },
    { name: 'Dur Muhurat', nature: 'Inauspicious', start: panchang.muhurats.durMuhurat.start, end: panchang.muhurats.durMuhurat.end },
    { name: 'Varjyam', nature: 'Inauspicious', start: panchang.muhurats.varjyam.start, end: panchang.muhurats.varjyam.end },
  ];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t('muhuratMatrix')}
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-none sm:max-w-5xl h-dvh sm:h-auto sm:max-h-[85dvh] bg-[#090e1a] border-0 sm:border border-[#233152] rounded-none sm:rounded-3xl shadow-2xl flex flex-col font-sans overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] overflow-hidden">
        
        {/* ── Top Header ── */}
        <div className="p-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  {t('muhuratMatrix')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
                  {t('all30Muhurats')}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                <strong className="text-neutral-200">{panchang.dateString}</strong> • <strong className="text-orange-400">{panchang.location.name}</strong> ({panchang.sunrise} — {panchang.sunset})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Clock Display Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-[#080d1a] border border-[#233152] flex items-center gap-2 text-xs shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider hidden sm:inline">{t('liveClock')}:</span>
              <span className="font-mono font-extrabold text-emerald-300 text-xs">
                {liveDateFormatted} • {liveTimeFormatted}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label={t('close')}
              className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── High-Visibility Clickable Navigation Tabs ── */}
        <div className="p-2 sm:px-6 bg-[#0c1222] border-b border-[#1a233a] shrink-0">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-[#080d1a] p-1.5 rounded-2xl border border-[#1e2942]">
            {[
              { id: 'all30', label: t('all30Muhurats') },
              { id: 'choghadiya', label: t('tabChoghadiya') },
              { id: 'shubhAshubh', label: t('shubhAshubhWindows') },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MuhuratTabType)}
                className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all text-center flex flex-col items-center justify-center cursor-pointer active:scale-98 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400'
                    : 'bg-[#11192e] text-neutral-300 hover:bg-[#18233d] hover:text-white border border-[#233152]'
                }`}
              >
                <span className="leading-snug break-words w-full">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content (Structured Table-Only Views with Dual Scroll) ── */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-6 pb-24 space-y-6 [-webkit-overflow-scrolling:touch]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >

          {/* ── TAB 1: ALL 30 MUHURATS (TABLE-ONLY VIEW) ── */}
          {activeTab === 'all30' && (
            <div className="space-y-6">
              
              {/* 15 Diurnal (Day) Muhurats Table */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 font-outfit">
                    <Sun size={16} className="text-amber-400 shrink-0" />
                    <span>{t('dayMuhurats')}</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                    {panchang.sunrise} — {panchang.sunset} ({Math.round(daySlotDuration)}m each)
                  </span>
                </div>

                <div className="relative w-full max-h-[380px] sm:max-h-[440px] overflow-x-auto overflow-y-auto overscroll-contain touch-pan-x touch-pan-y [-webkit-overflow-scrolling:touch] rounded-2xl border border-[#1a2542] bg-[#090e1a] shadow-inner">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] font-bold uppercase tracking-wider text-orange-300/90">
                      <tr>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colMuhurat')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colNature')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colStartTime')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colEndTime')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colStatusDuration')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#162038] text-xs sm:text-sm">
                      {dayMuhuratsWithTimes.map((m) => {
                        const isAuspicious = m.nature === 'Highly Auspicious' || m.nature === 'Auspicious';
                        const isModerate = m.nature === 'Moderate';
                        return (
                          <tr 
                            key={m.index}
                            className={`transition-colors ${
                              m.isCurrent 
                                ? 'bg-orange-500/10 border-l-4 border-l-orange-500 font-semibold text-white' 
                                : 'hover:bg-[#11192e]/60 text-slate-300'
                            }`}
                          >
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500 text-xs shrink-0">#{m.index}</span>
                                <div className="min-w-0">
                                  <div className="font-bold text-white font-devanagari leading-snug">
                                    {translateTerm(m.name, language)}
                                  </div>
                                  {m.deity && (
                                    <div className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
                                      {t('colDeity')}: {translateTerm(m.deity, language)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border font-outfit uppercase ${
                                isAuspicious 
                                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
                                  : isModerate 
                                  ? 'bg-amber-950/70 border-amber-500/40 text-amber-300' 
                                  : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                              }`}>
                                {translateTerm(m.nature, language)}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                              {m.startTime}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                              {m.endTime}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              {m.isCurrent ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse inline-flex items-center gap-1 font-outfit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                  {t('activeNow')}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs tabular-nums">
                                  {m.durationMins}m
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 15 Nocturnal (Night) Muhurats Table */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 font-outfit">
                    <Moon size={16} className="text-indigo-400 shrink-0" />
                    <span>{t('nightMuhurats')}</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                    {panchang.sunset} — {panchang.sunrise} ({Math.round(nightSlotDuration)}m each)
                  </span>
                </div>

                <div className="relative w-full max-h-[380px] sm:max-h-[440px] overflow-x-auto overflow-y-auto overscroll-contain touch-pan-x touch-pan-y [-webkit-overflow-scrolling:touch] rounded-2xl border border-[#1a2542] bg-[#090e1a] shadow-inner">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] font-bold uppercase tracking-wider text-orange-300/90">
                      <tr>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colMuhurat')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colNature')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colStartTime')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colEndTime')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colStatusDuration')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#162038] text-xs sm:text-sm">
                      {nightMuhuratsWithTimes.map((m) => {
                        const isAuspicious = m.nature === 'Highly Auspicious' || m.nature === 'Auspicious';
                        const isModerate = m.nature === 'Moderate';
                        return (
                          <tr 
                            key={m.index}
                            className={`transition-colors ${
                              m.isCurrent 
                                ? 'bg-orange-500/10 border-l-4 border-l-orange-500 font-semibold text-white' 
                                : 'hover:bg-[#11192e]/60 text-slate-300'
                            }`}
                          >
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500 text-xs shrink-0">#{m.index}</span>
                                <div className="min-w-0">
                                  <div className="font-bold text-white font-devanagari leading-snug">
                                    {translateTerm(m.name, language)}
                                  </div>
                                  {m.deity && (
                                    <div className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
                                      {t('colDeity')}: {translateTerm(m.deity, language)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border font-outfit uppercase ${
                                isAuspicious 
                                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
                                  : isModerate 
                                  ? 'bg-amber-950/70 border-amber-500/40 text-amber-300' 
                                  : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                              }`}>
                                {translateTerm(m.nature, language)}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                              {m.startTime}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                              {m.endTime}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              {m.isCurrent ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse inline-flex items-center gap-1 font-outfit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                  {t('activeNow')}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs tabular-nums">
                                  {m.durationMins}m
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ── TAB 2: 24H CHOGHADIYA (TABLE-ONLY VIEW) ── */}
          {activeTab === 'choghadiya' && (
            <div className="space-y-6">
              
              {/* Day Choghadiya Table */}
              <div>
                <h4 className="text-xs font-bold text-neutral-300 mb-2.5 flex items-center gap-1.5 font-outfit">
                  <Sun size={14} className="text-amber-400 shrink-0" />
                  <span>{t('daytimeChoghadiya')} ({panchang.sunrise} — {panchang.sunset})</span>
                </h4>

                <div className="relative w-full max-h-[380px] sm:max-h-[440px] overflow-x-auto overflow-y-auto overscroll-contain touch-pan-x touch-pan-y [-webkit-overflow-scrolling:touch] rounded-2xl border border-[#1a2542] bg-[#090e1a] shadow-inner">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] font-bold uppercase tracking-wider text-orange-300/90">
                      <tr>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colMuhurat')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colNature')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colStartTime')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colEndTime')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colStatusDuration')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#162038] text-xs sm:text-sm">
                      {panchang.dayChoghadiya.map((chog, i) => {
                        const isAuspicious = chog.nature === 'AUSPICIOUS';
                        const isNeutral = chog.nature === 'NEUTRAL';
                        return (
                          <tr 
                            key={i} 
                            className={`transition-colors ${
                              chog.isCurrent 
                                ? 'bg-orange-500/10 border-l-4 border-l-orange-500 font-semibold text-white' 
                                : 'hover:bg-[#11192e]/60 text-slate-300'
                            }`}
                          >
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="font-bold text-white font-devanagari leading-snug">
                                {translateTerm(chog.name, language)}
                              </div>
                              {chog.ruler && (
                                <div className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
                                  {t('ruler')}: {translateTerm(chog.ruler, language)}
                                </div>
                              )}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border font-outfit uppercase ${
                                isAuspicious 
                                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
                                  : isNeutral 
                                  ? 'bg-amber-950/70 border-amber-500/40 text-amber-300' 
                                  : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                              }`}>
                                {translateTerm(chog.quality, language)}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                              {chog.startTime}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                              {chog.endTime}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              {chog.isCurrent ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse inline-flex items-center gap-1 font-outfit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                  {t('activeNow')}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs tabular-nums">
                                  1.5h
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Night Choghadiya Table */}
              <div>
                <h4 className="text-xs font-bold text-neutral-300 mb-2.5 flex items-center gap-1.5 font-outfit">
                  <Moon size={14} className="text-indigo-400 shrink-0" />
                  <span>{t('nighttimeChoghadiya')} ({panchang.sunset} — {panchang.sunrise})</span>
                </h4>

                <div className="relative w-full max-h-[380px] sm:max-h-[440px] overflow-x-auto overflow-y-auto overscroll-contain touch-pan-x touch-pan-y [-webkit-overflow-scrolling:touch] rounded-2xl border border-[#1a2542] bg-[#090e1a] shadow-inner">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] font-bold uppercase tracking-wider text-orange-300/90">
                      <tr>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colMuhurat')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colNature')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colStartTime')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colEndTime')}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{t('colStatusDuration')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#162038] text-xs sm:text-sm">
                      {panchang.nightChoghadiya.map((chog, i) => {
                        const isAuspicious = chog.nature === 'AUSPICIOUS';
                        const isNeutral = chog.nature === 'NEUTRAL';
                        return (
                          <tr 
                            key={i} 
                            className={`transition-colors ${
                              chog.isCurrent 
                                ? 'bg-orange-500/10 border-l-4 border-l-orange-500 font-semibold text-white' 
                                : 'hover:bg-[#11192e]/60 text-slate-300'
                            }`}
                          >
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="font-bold text-white font-devanagari leading-snug">
                                {translateTerm(chog.name, language)}
                              </div>
                              {chog.ruler && (
                                <div className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
                                  {t('ruler')}: {translateTerm(chog.ruler, language)}
                                </div>
                              )}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border font-outfit uppercase ${
                                isAuspicious 
                                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
                                  : isNeutral 
                                  ? 'bg-amber-950/70 border-amber-500/40 text-amber-300' 
                                  : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                              }`}>
                                {translateTerm(chog.quality, language)}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                              {chog.startTime}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                              {chog.endTime}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              {chog.isCurrent ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse inline-flex items-center gap-1 font-outfit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                  {t('activeNow')}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs tabular-nums">
                                  1.5h
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ── TAB 3: SHUBH & ASHUBH WINDOWS (TABLE-ONLY VIEW) ── */}
          {activeTab === 'shubhAshubh' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-300 font-outfit flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400 shrink-0" />
                  <span>{t('shubhAshubhWindows')}</span>
                </span>
                <span className="text-xs text-neutral-400">
                  {panchang.sunrise} — {panchang.sunset}
                </span>
              </div>

              <div className="relative w-full max-h-[380px] sm:max-h-[440px] overflow-x-auto overflow-y-auto overscroll-contain touch-pan-x touch-pan-y [-webkit-overflow-scrolling:touch] rounded-2xl border border-[#1a2542] bg-[#090e1a] shadow-inner">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] font-bold uppercase tracking-wider text-orange-300/90">
                    <tr>
                      <th className="px-3.5 py-3 whitespace-nowrap">{t('colMuhurat')}</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">{t('colNature')}</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">{t('colStartTime')}</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">{t('colEndTime')}</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">{t('colStatusDuration')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162038] text-xs sm:text-sm">
                    {shubhAshubhList.map((item, idx) => {
                      const isAuspicious = item.nature === 'Highly Auspicious' || item.nature === 'Auspicious';
                      const isModerate = item.nature === 'Moderate';
                      return (
                        <tr 
                          key={idx}
                          className="hover:bg-[#11192e]/60 text-slate-300 transition-colors"
                        >
                          <td className="px-3.5 py-3 whitespace-nowrap font-bold text-white font-devanagari">
                            {translateTerm(item.name, language)}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border font-outfit uppercase ${
                              isAuspicious 
                                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
                                : isModerate 
                                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300' 
                                : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                            }`}>
                              {translateTerm(item.nature, language)}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                            {item.start}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap font-mono font-medium text-slate-200 tabular-nums">
                            {item.end}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap font-mono text-xs text-slate-400 tabular-nums">
                            —
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div>Authority: <strong className="text-slate-200 font-serif font-devanagari">Muhurta Chintamani & Choghadiya Shastra</strong></div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors cursor-pointer active:scale-95 shadow-md shadow-orange-500/20"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
}
