"use client";

import React, { useState } from 'react';
import { 
  X, Clock, BookOpen, Sun, Moon, CheckCircle2, 
  AlertTriangle, Hourglass, Sparkles, Star, Shield, ArrowUpRight
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

export function DailyMuhuratModal({ isOpen, onClose, panchang }: Props) {
  const [activeTab, setActiveTab] = useState<'all30' | 'choghadiya' | 'shubhAshubh'>('all30');

  if (!isOpen) return null;

  // Calculate current time in minutes
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

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

  // Build Day Muhurats with exact dates, start time, end time
  const dayMuhuratsWithTimes = COMPLETE_MUHURATS_LIST.filter(m => m.period === 'Diurnal (Day)').map((m, idx) => {
    const sMin = sunriseMin + idx * daySlotDuration;
    const eMin = sMin + daySlotDuration;
    const startTimeStr = formatMinutesToTime(sMin);
    const endTimeStr = formatMinutesToTime(eMin);
    const isCurrent = currentMinutes >= sMin && currentMinutes < eMin;
    const dateStr = panchang.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return {
      ...m,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationMins: Math.round(daySlotDuration),
      isCurrent
    };
  });

  // Build Night Muhurats with exact dates, start time, end time
  const nextDayDate = new Date(panchang.date);
  nextDayDate.setDate(nextDayDate.getDate() + 1);
  const nextDayDateStr = nextDayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const todayDateStr = panchang.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const nightMuhuratsWithTimes = COMPLETE_MUHURATS_LIST.filter(m => m.period === 'Nocturnal (Night)').map((m, idx) => {
    const sMin = sunsetMin + idx * nightSlotDuration;
    const eMin = sMin + nightSlotDuration;
    const startTimeStr = formatMinutesToTime(sMin);
    const endTimeStr = formatMinutesToTime(eMin);
    
    // Check if slot falls on next day after midnight
    const isNextDay = sMin >= 1440 || (sMin % 1440) < sunriseMin;
    const dateStr = isNextDay ? nextDayDateStr : todayDateStr;

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

  // Currently active 30-Muhurat
  const active30Muhurat = [...dayMuhuratsWithTimes, ...nightMuhuratsWithTimes].find(m => m.isCurrent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* ── Top Header ── */}
        <div className="p-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between flex-shrink-0">
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

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── ⭐ DEDICATED PROMINENT ACTIVE MUHURAT & TIMING HERO BANNER (FIXED & COMPACT) ── */}
        <div className={`p-3 sm:px-6 sm:py-2.5 bg-gradient-to-r from-[#0d1c33] via-[#10223d] to-[#0d1c33] border-b ${
          panchang.currentChoghadiya?.nature === 'AUSPICIOUS'
            ? 'border-emerald-500/30'
            : panchang.currentChoghadiya?.nature === 'NEUTRAL'
            ? 'border-yellow-500/30'
            : 'border-rose-500/30'
        } flex flex-wrap items-center justify-between gap-2.5 shadow-inner flex-shrink-0`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl border flex-shrink-0 animate-pulse ${
              panchang.currentChoghadiya?.nature === 'AUSPICIOUS'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : panchang.currentChoghadiya?.nature === 'NEUTRAL'
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              {panchang.currentChoghadiya?.nature === 'AUSPICIOUS' ? (
                <Sparkles size={16} />
              ) : panchang.currentChoghadiya?.nature === 'NEUTRAL' ? (
                <Star size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold tracking-wider uppercase ${
                  panchang.currentChoghadiya?.nature === 'AUSPICIOUS'
                    ? 'text-emerald-400'
                    : panchang.currentChoghadiya?.nature === 'NEUTRAL'
                    ? 'text-yellow-300'
                    : 'text-rose-400'
                }`}>
                  CURRENTLY ACTIVE MUHURAT &amp; TIMING
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                  panchang.currentChoghadiya?.nature === 'AUSPICIOUS'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : panchang.currentChoghadiya?.nature === 'NEUTRAL'
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {panchang.currentChoghadiya?.nature === 'AUSPICIOUS' && '✅ AUSPICIOUS (शुभ)'}
                  {panchang.currentChoghadiya?.nature === 'NEUTRAL' && '⚡ NEUTRAL (मध्यम)'}
                  {panchang.currentChoghadiya?.nature === 'INAUSPICIOUS' && '⚠️ INAUSPICIOUS (अशुभ)'}
                </span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>{panchang.currentChoghadiya?.displayName || 'Labh Choghadiya'}</span>
                <span className="text-xs text-neutral-300 font-normal hidden sm:inline">
                  ({panchang.currentChoghadiya?.periodType} Choghadiya • {panchang.currentChoghadiya?.ruler})
                </span>
              </div>
            </div>
          </div>

          {/* Active Timing Window & Countdown Pill */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-[#090e1a] border border-[#233152] text-xs">
              <span className="text-[10px] text-neutral-400 uppercase font-bold mr-1.5">Window:</span>
              <span className="font-mono font-bold text-white text-xs">
                {panchang.currentChoghadiya?.windowString || '08:14 PM — 09:37 PM'}
              </span>
            </div>

            <div className="px-3 py-1 rounded-xl bg-[#090e1a] border border-amber-500/40 text-xs flex items-center gap-1.5">
              <Hourglass size={12} className="text-amber-400 animate-spin" />
              <span className="text-[10px] text-amber-400 uppercase font-bold hidden sm:inline">Remaining:</span>
              <span className="font-mono font-extrabold text-amber-300 text-xs">
                {panchang.currentChoghadiya?.remainingString || '77m 12s'}
              </span>
            </div>
          </div>
        </div>

        {/* ── 🔘 HIGH-VISIBILITY CLICKABLE NAVIGATION TABS (PROMINENT PILLS - NEVER HIDDEN) ── */}
        <div className="p-2.5 sm:px-6 bg-[#0c1222] border-b border-[#1a233a] flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#080d1a] p-1.5 rounded-2xl border border-[#1e2942]">
            {[
              { id: 'all30', label: '🌟 All 30 Day & Night Muhurats', sub: 'Dates & Exact Times' },
              { id: 'choghadiya', label: '🕉️ 24h Day & Night Choghadiya', sub: '8 Day + 8 Night Slots' },
              { id: 'shubhAshubh', label: '⚖️ Shubh vs Ashubh Windows', sub: 'Auspicious & Inauspicious' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all text-center flex flex-col items-center justify-center cursor-pointer active:scale-98 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400'
                    : 'bg-[#11192e] text-neutral-300 hover:bg-[#18233d] hover:text-white border border-[#233152]'
                }`}
              >
                <span className="leading-tight">{tab.label}</span>
                <span className={`text-[10px] font-medium mt-0.5 ${activeTab === tab.id ? 'text-amber-100' : 'text-neutral-400'}`}>
                  {tab.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          
          {/* Brief Bilingual Dharmashastra Rule */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0e1629] to-orange-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider mb-1.5">
              <BookOpen size={15} />
              <span>📜 Dharmashastra Determination Rule (मुहूर्त निर्णय शास्त्र नियम)</span>
            </div>
            <div className="space-y-1 text-neutral-200">
              <p>
                <strong className="text-amber-300">हिंदी:</strong> २४ घण्टों को ३० मुहूर्तों में बांटा गया है। मध्याह्न का ८वाँ &apos;अभिजित मुहूर्त&apos; समस्त दोषों का नाश करता है, जबकि राहुकाल में शुभ कार्य वर्जित हैं (मुहूर्तचिन्तामणि)।
              </p>
              <p className="text-neutral-300">
                <strong className="text-amber-300">English:</strong> A 24-hour cycle is divided into 30 Muhurats. Midday 8th &apos;Abhijit Muhurat&apos; neutralizes all astrological flaws, while Rahu Kaal must strictly be avoided for new beginnings (Muhurta Chintamani).
              </p>
            </div>
          </div>

          {/* ── TAB 1: ALL 30 MUHURATS WITH EXACT DATES, START & END TIMES ── */}
          {activeTab === 'all30' && (
            <div className="space-y-6">
              
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

                <div className="rounded-2xl border border-[#1e2942] overflow-hidden bg-[#0c1222]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#11192e] text-neutral-300 border-b border-[#1e2942]">
                        <tr>
                          <th className="p-3 font-bold">#</th>
                          <th className="p-3 font-bold">Date</th>
                          <th className="p-3 font-bold">Start Time</th>
                          <th className="p-3 font-bold">End Time</th>
                          <th className="p-3 font-bold">Muhurat Name</th>
                          <th className="p-3 font-bold">Presiding Deity</th>
                          <th className="p-3 font-bold">Nature</th>
                          <th className="p-3 font-bold">Activity &amp; Guidance</th>
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
                            <td className="p-3 whitespace-nowrap text-neutral-300 font-medium">
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
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] border border-amber-500/30">
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
              </div>

              {/* 15 Nocturnal (Night) Muhurats */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Moon size={16} className="text-indigo-300" />
                    <span>15 Nocturnal (Night) Muhurats (रात्रि के १५ मुहूर्त)</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                    🌇 {panchang.sunset} to 🌅 {panchang.sunrise} ({Math.round(nightSlotDuration)} mins each)
                  </span>
                </div>

                <div className="rounded-2xl border border-[#1e2942] overflow-hidden bg-[#0c1222]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#11192e] text-neutral-300 border-b border-[#1e2942]">
                        <tr>
                          <th className="p-3 font-bold">#</th>
                          <th className="p-3 font-bold">Date</th>
                          <th className="p-3 font-bold">Start Time</th>
                          <th className="p-3 font-bold">End Time</th>
                          <th className="p-3 font-bold">Muhurat Name</th>
                          <th className="p-3 font-bold">Presiding Deity</th>
                          <th className="p-3 font-bold">Nature</th>
                          <th className="p-3 font-bold">Activity &amp; Guidance</th>
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
                            <td className="p-3 whitespace-nowrap text-neutral-300 font-medium">
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
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] border border-indigo-500/30">
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
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AUSPICIOUS (शुभ)</span>
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
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">NEUTRAL (मध्यम)</span>
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
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">INAUSPICIOUS (अशुभ)</span>
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
          <div>Authority: <strong>Muhurta Chintamani &amp; Choghadiya Shastra</strong></div>
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
