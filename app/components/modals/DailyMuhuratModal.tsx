"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Sun, Moon, CheckCircle2, 
  AlertTriangle, Sparkles, LayoutGrid, Table
} from 'lucide-react';
import { PanchangData } from '../../../src/lib/vedic-astronomy';
import { COMPLETE_MUHURATS_LIST } from '../../../src/lib/dharmashastra-rules';

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  if (!isOpen) return null;

  // Format Gregorian Live Clock values
  const liveDateFormatted = liveNow.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const liveTimeFormatted = liveNow.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Calculate current minutes from midnight using live Gregorian clock
  const currentMinutes = liveNow.getHours() * 60 + liveNow.getMinutes() + liveNow.getSeconds() / 60;

  // Parse sunrise & sunset
  const sunriseMin = parseTimeToMinutes(panchang.sunrise);
  const sunsetMin = parseTimeToMinutes(panchang.sunset);
  
  // 15 Day Muhurats calculation
  const dayLengthMin = sunsetMin >= sunriseMin ? sunsetMin - sunriseMin : (sunsetMin + 1440) - sunriseMin;
  const daySlotDuration = dayLengthMin / 15;

  // 15 Night Muhurats calculation
  const nextSunriseMin = sunriseMin; // next morning approximately same
  const nightLengthMin = (1440 - sunsetMin) + nextSunriseMin;
  const nightSlotDuration = nightLengthMin / 15;

  // Anchor dates to the Vedic Day (Ahoratra)
  // A civil Vedic day extends from Sunrise to Next Sunrise.
  // When the current Gregorian time is pre-sunrise (between midnight and today's sunrise),
  // the ongoing Vedic day is anchored to yesterday's sunrise.
  const isPreSunrise = currentMinutes < sunriseMin;

  const baseVedicDate = new Date(liveNow);
  if (isPreSunrise) {
    baseVedicDate.setDate(baseVedicDate.getDate() - 1);
  }
  const nextVedicDate = new Date(baseVedicDate);
  nextVedicDate.setDate(nextVedicDate.getDate() + 1);

  const formatGregorianDate = (d: Date) => d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const baseDateStr = formatGregorianDate(baseVedicDate);
  const nextDateStr = formatGregorianDate(nextVedicDate);

  // Build Day Muhurats with exact dates, start time, end time (Strict Ascending Order: baseDateStr)
  const dayMuhuratsWithTimes = COMPLETE_MUHURATS_LIST.filter(m => m.period === 'Diurnal (Day)').map((m, idx) => {
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

  // Build Night Muhurats with exact dates, start time, end time (Strict Ascending Order: baseDateStr before midnight, nextDateStr after midnight)
  const nightMuhuratsWithTimes = COMPLETE_MUHURATS_LIST.filter(m => m.period === 'Nocturnal (Night)').map((m, idx) => {
    const sMin = sunsetMin + idx * nightSlotDuration;
    const eMin = sMin + nightSlotDuration;
    const startTimeStr = formatMinutesToTime(sMin);
    const endTimeStr = formatMinutesToTime(eMin);
    
    // Check if slot falls after midnight (1440 minutes mark)
    const isPostMidnight = sMin >= 1440;
    // Slots before midnight belong to baseDateStr; slots after midnight advance to nextDateStr
    const dateStr = isPostMidnight ? nextDateStr : baseDateStr;

    // Check if current time falls in this night slot
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

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Daily 24-Hour Muhurat Matrix"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl max-h-[85dvh] bg-[#090e1a] border border-[#233152] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col font-sans overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] overflow-hidden">
        
        {/* ── Top Header ── */}
        <div className="p-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Daily 24-Hour Muhurat Matrix (दैनिक मुहूर्त तालिका)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
                  30 Muhurats
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Calculated for <strong className="text-neutral-200">{panchang.dateString}</strong> at <strong className="text-orange-400">{panchang.location.name}</strong> ({panchang.sunrise} to {panchang.sunset}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Gregorian Live Clock Display Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-[#080d1a] border border-[#233152] flex items-center gap-2 text-xs shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider hidden sm:inline">Live Clock:</span>
              <span className="font-mono font-extrabold text-emerald-300 text-xs">
                {liveDateFormatted} • {liveTimeFormatted}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── 🔘 HIGH-VISIBILITY CLICKABLE NAVIGATION TABS (PROMINENT PILLS - NEVER HIDDEN) ── */}
        <div className="p-2 sm:px-6 bg-[#0c1222] border-b border-[#1a233a] shrink-0">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-[#080d1a] p-1.5 rounded-2xl border border-[#1e2942]">
            {[
              { id: 'all30', label: '🌟 All 30 Muhurats', sub: 'Dates & Exact Times' },
              { id: 'choghadiya', label: '🕉️ 24h Choghadiya', sub: '8 Day + 8 Night Slots' },
              { id: 'shubhAshubh', label: '⚖️ Shubh / Ashubh', sub: 'Auspicious & Inauspicious' },
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
                <span className="leading-tight truncate w-full">{tab.label}</span>
                <span className={`text-[10px] font-medium mt-0.5 hidden sm:inline ${activeTab === tab.id ? 'text-amber-100' : 'text-neutral-400'}`}>
                  {tab.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content (Smooth touch & overscroll containment) ── */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-6 pb-24 space-y-5 [-webkit-overflow-scrolling:touch]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >

          {/* ── TAB 1: ALL 30 MUHURATS WITH EXACT DATES, START & END TIMES ── */}
          {activeTab === 'all30' && (
            <div className="space-y-6">
              
              {/* View Switcher: Cards View (Default) vs Table View */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1222] p-2 sm:px-4 sm:py-2.5 rounded-2xl border border-[#1e2942]">
                <div className="text-xs text-neutral-300 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400 shrink-0" />
                  <span>30 Daily Vedic Muhurats (धर्मशास्त्र सम्मत) with Deity & Guidance</span>
                </div>
                <div className="inline-flex items-center bg-[#080d1a] p-1 rounded-xl border border-[#1e2942] text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-orange-500 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid size={13} />
                    <span>Cards View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-orange-500 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Table size={13} />
                    <span>Table View</span>
                  </button>
                </div>
              </div>

              {/* 15 Diurnal (Day) Muhurats */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sun size={16} className="text-amber-400" />
                    <span>15 Diurnal (Day) Muhurats (दिन के १५ मुहूर्त)</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                    🌅 {panchang.sunrise} to 🌇 {panchang.sunset} ({Math.round(daySlotDuration)} mins each)
                  </span>
                </div>

                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {dayMuhuratsWithTimes.map((m) => (
                      <div 
                        key={m.index}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                          m.isCurrent 
                            ? 'bg-gradient-to-r from-emerald-950/70 via-[#10223d] to-emerald-950/70 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50' 
                            : 'bg-[#0c1222] border-[#1e2942] hover:border-slate-600/60'
                        }`}
                      >
                        {/* Header: Muhurat # & Name + Nature Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-white">
                              Muhurat #{m.index}: <span className="text-amber-300 font-bold">{m.name}</span>
                            </span>
                            {m.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                CURRENTLY ACTIVE (वर्तमान मुहूर्त)
                              </span>
                            )}
                            {m.index === 8 && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] border border-amber-500/30 font-semibold">
                                Abhijit / Midday
                              </span>
                            )}
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                            (m.nature === 'Highly Auspicious' || m.nature === 'Auspicious') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                            m.nature === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {m.nature === 'Highly Auspicious' && '🌟 HIGHLY AUSPICIOUS (परम शुभ)'}
                            {m.nature === 'Auspicious' && 'AUSPICIOUS (शुभ)'}
                            {m.nature === 'Moderate' && '⚡ MODERATE (मध्यम)'}
                            {m.nature === 'Inauspicious' && '⚠️ INAUSPICIOUS (अशुभ)'}
                          </span>
                        </div>

                        {/* Deity & Timing Details */}
                        <div className="text-xs text-neutral-300 mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            • Presiding Deity: <strong className="text-white font-serif font-devanagari">{m.deity}</strong>
                          </span>
                          <span className="text-neutral-400 font-mono text-[11px]">📅 {m.date}</span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#080d1a] border border-[#233152] font-mono font-bold text-emerald-300 text-[11px]">
                            ⏰ {m.startTime} — {m.endTime} ({m.durationMins} mins)
                          </span>
                        </div>

                        {/* Activity & Guidance */}
                        <div className="text-[11px] sm:text-xs text-neutral-300 bg-[#080d1a]/80 p-2 rounded-xl border border-white/5">
                          <span className="text-amber-400 font-semibold">Activity & Guidance:</span> {m.activity}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#1e2942] overflow-hidden bg-[#0c1222]">
                    <div className="overflow-x-auto overscroll-x-contain horizontal-tabs-scroll" style={{ touchAction: 'pan-x pan-y' }}>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#11192e] text-neutral-300 border-b border-[#1e2942]">
                          <tr>
                            <th className="p-3 font-bold">#</th>
                            <th className="p-3 font-bold">Gregorian Date</th>
                            <th className="p-3 font-bold">Start Time</th>
                            <th className="p-3 font-bold">End Time</th>
                            <th className="p-3 font-bold">Vedic Muhurat Name</th>
                            <th className="p-3 font-bold">Presiding Deity</th>
                            <th className="p-3 font-bold">Nature of Muhurat</th>
                            <th className="p-3 font-bold">Activity & Guidance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#18233c] text-neutral-300">
                          {dayMuhuratsWithTimes.map((m) => (
                            <tr 
                              key={m.index} 
                              className={`transition-colors ${
                                m.isCurrent 
                                  ? 'bg-emerald-950/40 text-white font-semibold ring-1 ring-emerald-500/50' 
                                  : 'hover:bg-[#141d33]'
                              }`}
                            >
                              <td className="p-3 font-mono text-neutral-400">
                                <span className="flex items-center gap-1">
                                  {m.index}
                                  {m.isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap text-neutral-200 font-medium font-mono text-[11px]">
                                {m.date}
                              </td>
                              <td className="p-3 whitespace-nowrap font-mono font-bold text-white">
                                {m.startTime}
                              </td>
                              <td className="p-3 whitespace-nowrap font-mono font-bold text-white">
                                {m.endTime}
                              </td>
                              <td className="p-3 whitespace-nowrap font-bold text-white flex items-center gap-1.5">
                                <span>{m.name}</span>
                                {m.index === 8 && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] border border-amber-500/30">
                                    Top Midday
                                  </span>
                                )}
                              </td>
                              <td className="p-3 whitespace-nowrap text-neutral-300">
                                {m.deity}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  (m.nature === 'Highly Auspicious' || m.nature === 'Auspicious') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                  m.nature === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                }`}>
                                  {m.nature}
                                </span>
                              </td>
                              <td className="p-3 text-neutral-400 text-[11px] min-w-[220px]">
                                {m.activity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* 15 Nocturnal (Night) Muhurats */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Moon size={16} className="text-indigo-300" />
                    <span>15 Nocturnal (Night) Muhurats (रात्रि के १५ मुहूर्त)</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                    🌇 {panchang.sunset} to 🌅 {panchang.sunrise} ({Math.round(nightSlotDuration)} mins each)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-2.5 leading-relaxed">
                  ℹ️ <strong className="text-amber-300">Vedic Night (रात्रिमान):</strong> Extends continuously from Sunset to Sunrise. Slots before 12:00 AM midnight belong to the evening calendar date, while slots after 12:00 AM midnight roll over into the morning of the next date as per the Gregorian calendar.
                </p>

                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {nightMuhuratsWithTimes.map((m) => (
                      <div 
                        key={m.index}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                          m.isCurrent 
                            ? 'bg-gradient-to-r from-emerald-950/70 via-[#10223d] to-emerald-950/70 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50' 
                            : 'bg-[#0c1222] border-[#1e2942] hover:border-slate-600/60'
                        }`}
                      >
                        {/* Header: Muhurat # & Name + Nature Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-white">
                              Muhurat #{m.index}: <span className="text-amber-300 font-bold">{m.name}</span>
                            </span>
                            {m.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                CURRENTLY ACTIVE (वर्तमान मुहूर्त)
                              </span>
                            )}
                            {m.index === 28 && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] border border-indigo-500/30 font-semibold">
                                Brahma Kaal
                              </span>
                            )}
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                            (m.nature === 'Highly Auspicious' || m.nature === 'Auspicious') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                            m.nature === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {m.nature === 'Highly Auspicious' && '🌟 HIGHLY AUSPICIOUS (परम शुभ)'}
                            {m.nature === 'Auspicious' && 'AUSPICIOUS (शुभ)'}
                            {m.nature === 'Moderate' && '⚡ MODERATE (मध्यम)'}
                            {m.nature === 'Inauspicious' && '⚠️ INAUSPICIOUS (अशुभ)'}
                          </span>
                        </div>

                        {/* Deity & Timing Details */}
                        <div className="text-xs text-neutral-300 mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            • Presiding Deity: <strong className="text-white font-serif font-devanagari">{m.deity}</strong>
                          </span>
                          <span className="text-neutral-400 font-mono text-[11px]">📅 {m.date}</span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#080d1a] border border-[#233152] font-mono font-bold text-emerald-300 text-[11px]">
                            ⏰ {m.startTime} — {m.endTime} ({m.durationMins} mins)
                          </span>
                        </div>

                        {/* Activity & Guidance */}
                        <div className="text-[11px] sm:text-xs text-neutral-300 bg-[#080d1a]/80 p-2 rounded-xl border border-white/5">
                          <span className="text-amber-400 font-semibold">Activity & Guidance:</span> {m.activity}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#1e2942] overflow-hidden bg-[#0c1222]">
                    <div className="overflow-x-auto overscroll-x-contain horizontal-tabs-scroll" style={{ touchAction: 'pan-x pan-y' }}>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#11192e] text-neutral-300 border-b border-[#1e2942]">
                          <tr>
                            <th className="p-3 font-bold">#</th>
                            <th className="p-3 font-bold">Gregorian Date</th>
                            <th className="p-3 font-bold">Start Time</th>
                            <th className="p-3 font-bold">End Time</th>
                            <th className="p-3 font-bold">Vedic Muhurat Name</th>
                            <th className="p-3 font-bold">Presiding Deity</th>
                            <th className="p-3 font-bold">Nature of Muhurat</th>
                            <th className="p-3 font-bold">Activity & Guidance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#18233c] text-neutral-300">
                          {nightMuhuratsWithTimes.map((m) => (
                            <tr 
                              key={m.index} 
                              className={`transition-colors ${
                                m.isCurrent 
                                  ? 'bg-emerald-950/40 text-white font-semibold ring-1 ring-emerald-500/50' 
                                  : 'hover:bg-[#141d33]'
                              }`}
                            >
                              <td className="p-3 font-mono text-neutral-400">
                                <span className="flex items-center gap-1">
                                  {m.index}
                                  {m.isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap text-neutral-200 font-medium font-mono text-[11px]">
                                {m.date}
                              </td>
                              <td className="p-3 whitespace-nowrap font-mono font-bold text-white">
                                {m.startTime}
                              </td>
                              <td className="p-3 whitespace-nowrap font-mono font-bold text-white">
                                {m.endTime}
                              </td>
                              <td className="p-3 whitespace-nowrap font-bold text-white flex items-center gap-1.5">
                                <span>{m.name}</span>
                                {m.index === 28 && (
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] border border-indigo-500/30">
                                    Brahma Kaal
                                  </span>
                                )}
                              </td>
                              <td className="p-3 whitespace-nowrap text-neutral-300">
                                {m.deity}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  (m.nature === 'Highly Auspicious' || m.nature === 'Auspicious') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                  m.nature === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                }`}>
                                  {m.nature}
                                </span>
                              </td>
                              <td className="p-3 text-neutral-400 text-[11px] min-w-[220px]">
                                {m.activity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── TAB 2: 24H CHOGHADIYA ── */}
          {activeTab === 'choghadiya' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-neutral-300 mb-2.5 flex items-center gap-1.5">
                  <Sun size={14} className="text-amber-400" />
                  <span>Day Choghadiya ({panchang.sunrise} to {panchang.sunset})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {panchang.dayChoghadiya.map((chog, i) => (
                    <div key={i} className={`p-3.5 rounded-xl border ${chog.isCurrent ? 'bg-[#182442] border-orange-500 ring-1 ring-orange-500' : 'bg-[#0c1222] border-[#1e2942]'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white text-xs">{chog.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                          chog.nature === 'AUSPICIOUS' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : chog.nature === 'NEUTRAL' 
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>{chog.quality} ({chog.nature === 'AUSPICIOUS' ? 'Auspicious' : chog.nature === 'NEUTRAL' ? 'Neutral' : 'Inauspicious'})</span>
                      </div>
                      <div className="text-xs font-mono text-neutral-200">{chog.windowString}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Lord: {chog.ruler}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-300 mb-2.5 flex items-center gap-1.5">
                  <Moon size={14} className="text-indigo-300" />
                  <span>Night Choghadiya ({panchang.sunset} to Next Sunrise)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {panchang.nightChoghadiya.map((chog, i) => (
                    <div key={i} className={`p-3.5 rounded-xl border ${chog.isCurrent ? 'bg-[#182442] border-orange-500 ring-1 ring-orange-500' : 'bg-[#0c1222] border-[#1e2942]'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white text-xs">{chog.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                          chog.nature === 'AUSPICIOUS' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : chog.nature === 'NEUTRAL' 
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>{chog.quality} ({chog.nature === 'AUSPICIOUS' ? 'Auspicious' : chog.nature === 'NEUTRAL' ? 'Neutral' : 'Inauspicious'})</span>
                      </div>
                      <div className="text-xs font-mono text-neutral-200">{chog.windowString}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Lord: {chog.ruler}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: SHUBH VS NEUTRAL VS ASHUBH ── */}
          {activeTab === 'shubhAshubh' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* 1. Auspicious (Green) */}
              <div className="p-4 rounded-2xl bg-[#0c1222] border border-emerald-500/40 space-y-2.5">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} /> Auspicious Windows</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AUSPICIOUS (शुभ)</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Brahma Muhurat</span>
                    <span className="font-mono text-emerald-400 font-bold">{panchang.muhurats.brahmaMuhurat.start} - {panchang.muhurats.brahmaMuhurat.end}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Abhijit Muhurat</span>
                    <span className="font-mono text-emerald-400 font-bold">{panchang.muhurats.abhijitMuhurat.start} - {panchang.muhurats.abhijitMuhurat.end}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Amrit Kaal</span>
                    <span className="font-mono text-emerald-400 font-bold">{panchang.muhurats.amritKaal.start} - {panchang.muhurats.amritKaal.end}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Vijaya Muhurat</span>
                    <span className="font-mono text-emerald-400 font-bold">{panchang.muhurats.vijayaMuhurat.start} - {panchang.muhurats.vijayaMuhurat.end}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Godhuli Muhurat</span>
                    <span className="font-mono text-emerald-400 font-bold">{panchang.muhurats.godhuliMuhurat.start} - {panchang.muhurats.godhuliMuhurat.end}</span>
                  </div>
                </div>
              </div>

              {/* 2. Neutral (Yellow) */}
              <div className="p-4 rounded-2xl bg-[#0c1222] border border-yellow-500/40 space-y-2.5">
                <h4 className="text-xs font-bold text-yellow-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Sparkles size={16} /> Neutral Windows</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">NEUTRAL (मध्यम)</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Gulika Kaal</span>
                    <span className="font-mono text-yellow-300 font-bold">{panchang.muhurats.gulikaKaal.start} - {panchang.muhurats.gulikaKaal.end}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Sayahna Sandhya</span>
                    <span className="font-mono text-yellow-300 font-bold">{panchang.muhurats.sayahnaSandhya.start} - {panchang.muhurats.sayahnaSandhya.end}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#090e1a] border border-yellow-500/20 text-[11px] text-neutral-300 mt-2">
                    Gulika Kaal is ruled by Saturn&apos;s son Gulika. Neutral for routine deeds, avoid for auspicious beginnings.
                  </div>
                </div>
              </div>

              {/* 3. Inauspicious (Red) */}
              <div className="p-4 rounded-2xl bg-[#0c1222] border border-rose-500/40 space-y-2.5">
                <h4 className="text-xs font-bold text-rose-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><AlertTriangle size={16} /> Inauspicious Windows</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">INAUSPICIOUS (अशुभ)</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Rahu Kaal (Avoid)</span>
                    <span className="font-mono text-rose-400 font-bold">{panchang.muhurats.rahuKaal.start} - {panchang.muhurats.rahuKaal.end}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Yamaganda</span>
                    <span className="font-mono text-rose-400 font-bold">{panchang.muhurats.yamaganda.start} - {panchang.muhurats.yamaganda.end}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Dur Muhurat</span>
                    <span className="font-mono text-rose-400 font-bold">{panchang.muhurats.durMuhurat.start} - {panchang.muhurats.durMuhurat.end}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#11192e] flex justify-between">
                    <span>Varjyam</span>
                    <span className="font-mono text-rose-400 font-bold">{panchang.muhurats.varjyam.start} - {panchang.muhurats.varjyam.end}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400">
          <div>Authority: <strong>Muhurta Chintamani & Choghadiya Shastra</strong></div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
