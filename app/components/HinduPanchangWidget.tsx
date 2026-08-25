"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, MapPin, ChevronDown, MoreVertical, X,
  Clock, Sun, Compass, Hourglass, Calendar, Moon,
  CheckCircle2, ChevronRight, ChevronLeft, Star, Flame, Layers,
  ShieldAlert, ShieldCheck, ArrowUpRight, Share2
} from 'lucide-react';
import { 
  calculatePanchang, 
  PRESET_LOCATIONS, 
  LocationCoordinates, 
  PanchangData 
} from '../../src/lib/vedic-astronomy';
import { getActivePanchakStatus } from '../../src/lib/dharmashastra-rules';
import { TithiMonthModal } from './modals/TithiMonthModal';
import { DailyMuhuratModal } from './modals/DailyMuhuratModal';
import { TodayFestivalModal } from './modals/TodayFestivalModal';
import { PanchakModal } from './modals/PanchakModal';
import { UpcomingFestivalsModal } from './modals/UpcomingFestivalsModal';

interface HinduPanchangWidgetProps {
  onShareClick?: () => void;
}

export function HinduPanchangWidget({ onShareClick }: HinduPanchangWidgetProps = {}) {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>(PRESET_LOCATIONS[0]);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'panchang' | 'choghadiya' | 'muhurat' | 'astrometry'>('panchang');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Modal states for click interactions
  const [isTithiModalOpen, setIsTithiModalOpen] = useState<boolean>(false);
  const [isMuhuratModalOpen, setIsMuhuratModalOpen] = useState<boolean>(false);
  const [isTodayFestivalModalOpen, setIsTodayFestivalModalOpen] = useState<boolean>(false);
  const [isPanchakModalOpen, setIsPanchakModalOpen] = useState<boolean>(false);
  const [isUpcomingFestivalsModalOpen, setIsUpcomingFestivalsModalOpen] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Live timer tick every second when isLiveMode is true
  useEffect(() => {
    if (!isLiveMode) return;
    const timer = setInterval(() => {
      setSelectedDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isLiveMode]);

  // Click-outside handler to close dropdown menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handlePrevDay = () => {
    setIsLiveMode(false);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    setIsLiveMode(false);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    const newDate = new Date(y, m - 1, d, 6, 0, 0);
    setIsLiveMode(false);
    setSelectedDate(newDate);
  };

  const handleResetToLive = () => {
    setIsLiveMode(true);
    setSelectedDate(new Date());
  };

  const panchang: PanchangData = calculatePanchang(selectedDate, selectedLocation, isLiveMode ? new Date() : selectedDate);
  const panchakStatus = getActivePanchakStatus(selectedDate);

  if (isDismissed) {
    return (
      <div className="text-center py-6">
        <button
          onClick={() => setIsDismissed(false)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0e1629] border border-[#233152] text-orange-400 text-sm font-semibold hover:bg-[#152038] transition-all shadow-xl"
        >
          <Sparkles size={16} /> Open Vedic Live Panchang Widget
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-5xl mx-auto rounded-3xl bg-[#090e1a] border border-[#1a233a] shadow-2xl p-4 sm:p-6 text-left transition-all duration-300 font-sans">
        
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#161f36]">
          
          {/* Left Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Vedic Live Engine Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11192e] border border-[#233152] text-[#f59e0b] text-xs font-semibold tracking-tight shadow-sm">
              <Sparkles size={13} className="text-[#f59e0b] animate-pulse" />
              <span>Vedic Astronomical Engine</span>
            </div>

            {/* Location Dropdown Pill */}
            <div className="relative inline-flex items-center">
              <MapPin size={13} className="absolute left-3 text-[#f59e0b] pointer-events-none" />
              <select
                aria-label="Select City Location"
                value={selectedLocation.name}
                onChange={(e) => {
                  const loc = PRESET_LOCATIONS.find(l => l.name === e.target.value);
                  if (loc) setSelectedLocation(loc);
                }}
                className="pl-8 pr-7 py-1 bg-[#11192e] hover:bg-[#16213d] border border-[#233152] rounded-full text-xs font-medium text-neutral-200 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"
              >
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name} className="bg-[#0e1629] text-white">
                    {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 text-neutral-400 pointer-events-none" />
            </div>

            {/* Subtitle / Center Coordinates info */}
            <span className="hidden md:inline-block text-neutral-400 text-xs font-normal">
              Center ({selectedLocation.latitude > 0 ? `${selectedLocation.latitude}°N` : `${Math.abs(selectedLocation.latitude)}°S`}, {selectedLocation.longitude > 0 ? `${selectedLocation.longitude}°E` : `${Math.abs(selectedLocation.longitude)}°W`})
            </span>

          </div>

          {/* Right Menu & Close Controls */}
          <div className="flex items-center gap-2">
            {onShareClick && (
              <button
                onClick={onShareClick}
                title="Share Widget"
                aria-label="Share Widget"
                className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] flex items-center justify-center text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
              >
                <Share2 size={13} />
              </button>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="More Options"
                aria-label="More Options"
                className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <MoreVertical size={13} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-10 w-56 bg-[#0e1629] border border-[#233152] rounded-2xl shadow-2xl py-2 z-30 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => { setIsTithiModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-[#1a2542] hover:text-white flex items-center gap-2"
                  >
                    <Calendar size={14} className="text-orange-400" />
                    Monthly Tithi Almanac
                  </button>
                  <button
                    onClick={() => { setIsMuhuratModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-[#1a2542] hover:text-white flex items-center gap-2"
                  >
                    <Clock size={14} className="text-emerald-400" />
                    Daily 24h Muhurat Matrix
                  </button>
                  <button
                    onClick={() => { setIsPanchakModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-[#1a2542] hover:text-white flex items-center gap-2"
                  >
                    <ShieldAlert size={14} className="text-amber-400" />
                    Panchak Calendar for Any Year
                  </button>
                  <button
                    onClick={() => { setShowDetails(!showDetails); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-[#1a2542] hover:text-white flex items-center gap-2 border-t border-[#1a2542] mt-1 pt-2"
                  >
                    <Layers size={14} className="text-orange-400" />
                    {showDetails ? 'Collapse Detailed View' : 'Expand Detailed View'}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              title="Minimize Widget"
              aria-label="Close Widget"
              className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

        </div>

        {/* ── Interactive Date & Year Navigator Bar (Travel to Any Date/Month/Year) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-3 border-b border-[#161f36]/70 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="px-2.5 py-1.5 rounded-xl bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] text-neutral-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft size={14} />
              <span>Prev Day</span>
            </button>

            {/* Native Date Input Picker (Supports Any Year, Month & Date) */}
            <div className="relative inline-flex items-center">
              <input
                type="date"
                value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                onChange={handleDateChange}
                aria-label="Pick Any Date and Year"
                className="px-3 py-1.5 bg-[#11192e] hover:bg-[#16213d] border border-[#233152] rounded-xl text-xs font-bold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="px-2.5 py-1.5 rounded-xl bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] text-neutral-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Next Day"
            >
              <span>Next Day</span>
              <ChevronRight size={14} />
            </button>

            {/* Live Clock / Today Reset Pill */}
            <button
              onClick={handleResetToLive}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isLiveMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/40 animate-pulse'
              }`}
              title={isLiveMode ? 'Live Clock Active' : 'Click to reset to real-time Today'}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-ping' : 'bg-orange-400'}`}></span>
              <span>{isLiveMode ? 'Live Real-Time' : '🔄 Return to Live Today'}</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-mono">
            {isLiveMode ? 'Perpetual Live Ephemeris Engine' : `Inspecting Date: ${selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
          </div>
        </div>

        {/* ── Main Top 3-Card Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
          
          {/* COLUMN 1: GREGORIAN LIVE CLOCK CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090e1a] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#ea580c] text-[11px] font-bold tracking-wider uppercase">
                  <Clock size={13} className="text-[#ea580c]" />
                  <span>{isLiveMode ? 'GREGORIAN LIVE CLOCK' : 'SELECTED DATE VIEW'}</span>
                </div>
                {!isLiveMode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Custom Date
                  </span>
                )}
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight my-2">
                {isLiveMode ? panchang.timeFormatted : (selectedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || '06:00 AM')}
              </div>

              <div className="text-neutral-300 text-sm font-medium mb-4">
                {panchang.dateString}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="bg-[#11192e] border border-[#233152] px-2.5 py-1 rounded-lg font-semibold text-neutral-300">
                {selectedLocation.regionName} • UTC{selectedLocation.timezone >= 0 ? `+${Math.floor(selectedLocation.timezone)}:${selectedLocation.timezone % 1 !== 0 ? '30' : '00'}` : `${selectedLocation.timezone}:00`}
              </span>
              <span className="text-neutral-300 font-medium flex items-center gap-1.5 ml-1">
                <span>🌅 {panchang.sunrise}</span>
                <span className="text-neutral-600">•</span>
                <span>🌇 {panchang.sunset}</span>
              </span>
            </div>
          </div>

          {/* COLUMN 2: VEDIC PANCHANG CARD (CLICKABLE -> OPENS MONTHLY TITHI CALENDAR) */}
          <div 
            onClick={() => setIsTithiModalOpen(true)}
            role="button"
            tabIndex={0}
            title="Click to open Monthly Calendar of Tithis & Dharmashastra Rules"
            className="p-4 sm:p-5 rounded-2xl bg-[#0e1629]/80 hover:bg-[#121c33] border border-[#1e2942] hover:border-orange-500/60 flex flex-col justify-between shadow-lg cursor-pointer transition-all group relative"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[#f59e0b] text-[11px] font-bold tracking-wider uppercase">
                  <Sun size={13} className="text-[#f59e0b]" />
                  <span>VEDIC PANCHANG</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-200 text-xs font-bold">
                    {panchang.dayOfWeekName}
                  </span>
                  <ArrowUpRight size={13} className="text-neutral-500 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <div className="text-xl sm:text-2xl font-extrabold text-[#f59e0b] font-mono tracking-tight my-2 group-hover:text-amber-300 transition-colors">
                {panchang.ishtaKaal.ghatiFormatted}
              </div>

              <div className="text-base font-bold text-white leading-tight">
                {panchang.tithi.name}
              </div>

              <div className="text-xs text-neutral-300 mt-1">
                Masa: <span className="font-semibold text-white">{panchang.masaDisplay}</span>
              </div>

              <div className="text-[11px] text-neutral-400 mt-0.5 mb-3">
                Vikram Samvat {panchang.vikramSamvat} • Shaka Samvat {panchang.shakaSamvat}
              </div>
            </div>

            <div className="flex items-center">
              <div className="border border-[#233152] bg-[#0b1222] px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-200 flex items-center gap-2 w-fit">
                <Compass size={13} className="text-[#f59e0b]" />
                <span>{panchang.paharCapsuleText}</span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: ACTIVE MUHURAT & TIMING CARD (CLICKABLE -> OPENS COMPLETE DAILY MUHURAT) */}
          <div 
            onClick={() => setIsMuhuratModalOpen(true)}
            role="button"
            tabIndex={0}
            title="Click to open Daily Muhurat for Complete Day & Dharmashastra Rules"
            className="p-4 sm:p-5 rounded-2xl bg-[#0e1629]/80 hover:bg-[#121c33] border border-[#1e2942] hover:border-emerald-500/60 flex flex-col justify-between shadow-lg cursor-pointer transition-all group relative"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-neutral-400 text-[11px] font-bold tracking-wider uppercase group-hover:text-neutral-300 transition-colors">
                  ACTIVE MUHURAT &amp; TIMING
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`border px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    panchang.currentChoghadiya?.nature === 'AUSPICIOUS'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : panchang.currentChoghadiya?.nature === 'NEUTRAL'
                      ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                  }`}>
                    {panchang.currentChoghadiya?.nature === 'AUSPICIOUS' ? (
                      <CheckCircle2 size={11} className="text-emerald-400" />
                    ) : panchang.currentChoghadiya?.nature === 'NEUTRAL' ? (
                      <Sparkles size={11} className="text-yellow-300" />
                    ) : (
                      <ShieldAlert size={11} className="text-rose-400" />
                    )}
                    <span>{panchang.currentChoghadiya?.nature || 'AUSPICIOUS'}</span>
                  </span>
                  <ArrowUpRight size={13} className="text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <div className={`text-2xl font-extrabold my-2 leading-tight transition-colors ${
                panchang.currentChoghadiya?.nature === 'AUSPICIOUS'
                  ? 'text-white group-hover:text-emerald-300'
                  : panchang.currentChoghadiya?.nature === 'NEUTRAL'
                  ? 'text-white group-hover:text-yellow-300'
                  : 'text-rose-300 group-hover:text-rose-200'
              }`}>
                {panchang.currentChoghadiya?.displayName || 'Labh Choghadiya'}
              </div>

              <div className="text-xs text-neutral-300 mb-3">
                {panchang.currentChoghadiya?.periodType || 'Night'} Choghadiya ({panchang.currentChoghadiya?.planet || 'Mercury'})
              </div>

              <div className="text-xs text-neutral-200 font-semibold mb-1">
                Window: <span className="font-mono text-neutral-100">{panchang.currentChoghadiya?.windowString || '08:14 PM — 09:37 PM'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-[#f59e0b] flex items-center gap-1.5">
                <Hourglass size={14} className="text-[#f59e0b] animate-spin" style={{ animationDuration: '6s' }} />
                <span>Remaining: <span className="font-mono">{panchang.currentChoghadiya?.remainingString || '77m 12s'}</span></span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-semibold group-hover:text-emerald-300 transition-colors">
                ⏳ 24h Muhurats →
              </span>
            </div>
          </div>

        </div>

        {/* ── Bottom 3-Card Row (Today Vrat, Panchak, Upcoming Festival) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          
          {/* BOTTOM LEFT: TODAY'S FESTIVAL / VRAT (CLICKABLE -> OPENS UDAYA TIME, STARTS, ENDS, SHASTRA RULE) */}
          <div 
            onClick={() => setIsTodayFestivalModalOpen(true)}
            role="button"
            tabIndex={0}
            title="Click to view Udaya Time, Starts, Ends & Dharmashastra Determination Rule"
            className="bg-[#0e1629]/70 hover:bg-[#121c33] border border-[#1e2942] hover:border-amber-500/60 rounded-2xl p-4 flex items-center gap-4 shadow-sm cursor-pointer transition-all group"
          >
            <div className="rounded-xl bg-[#1c1810] border border-[#f59e0b]/40 p-3 text-[#f59e0b] flex-shrink-0 group-hover:scale-105 transition-transform">
              <Calendar size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-[#f59e0b] text-[11px] font-bold tracking-wider uppercase">
                  TODAY&apos;S FESTIVAL / VRAT
                </div>
                <ArrowUpRight size={13} className="text-neutral-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="text-base font-bold text-white mt-0.5 truncate group-hover:text-amber-300 transition-colors">
                {panchang.todayFestival.title}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5 truncate">
                {panchang.todayFestival.description}
              </div>
            </div>
          </div>

          {/* MIDDLE: PANCHAK CARD (DYNAMIC ACTIVE CHECKER: ONLY SHOWS ACTIVE PANCHAK WITH DATES/TIMES, OTHERWISE 'No active panchak') */}
          <div 
            onClick={() => setIsPanchakModalOpen(true)}
            role="button"
            tabIndex={0}
            title="Click to open Calendar of Panchaks for Upcoming Months & Years and Dharmashastra Rules"
            className={`bg-[#0e1629]/70 hover:bg-[#121c33] border ${
              panchakStatus.isActive 
                ? (panchakStatus.panchak?.auspiciousness === 'Auspicious' 
                    ? 'border-emerald-500/50 hover:border-emerald-500/80' 
                    : panchakStatus.panchak?.auspiciousness === 'Neutral'
                    ? 'border-yellow-500/50 hover:border-yellow-500/80'
                    : 'border-rose-500/50 hover:border-rose-500/80')
                : 'border-emerald-500/30 hover:border-emerald-500/60'
            } rounded-2xl p-4 flex items-center gap-4 shadow-sm cursor-pointer transition-all group relative`}
          >
            <div className={`rounded-xl ${
              panchakStatus.isActive 
                ? (panchakStatus.panchak?.auspiciousness === 'Auspicious'
                    ? 'bg-[#0f241a] border border-emerald-500/40 text-emerald-400'
                    : panchakStatus.panchak?.auspiciousness === 'Neutral'
                    ? 'bg-[#24210f] border border-yellow-500/40 text-yellow-300'
                    : 'bg-[#241010] border border-rose-500/40 text-rose-400')
                : 'bg-[#0f241a] border border-emerald-500/40 text-emerald-400'
            } p-3 flex-shrink-0 group-hover:scale-105 transition-transform`}>
              {panchakStatus.isActive ? (
                panchakStatus.panchak?.auspiciousness === 'Auspicious' ? <CheckCircle2 size={22} /> :
                panchakStatus.panchak?.auspiciousness === 'Neutral' ? <Sparkles size={22} /> :
                <ShieldAlert size={22} />
              ) : (
                <ShieldCheck size={22} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-amber-400 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1">
                  <span>PANCHAK (पञ्चक)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  panchakStatus.isActive 
                    ? (panchakStatus.panchak?.auspiciousness === 'Auspicious' 
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                        : panchakStatus.panchak?.auspiciousness === 'Neutral'
                        ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400')
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                }`}>
                  {panchakStatus.badgeText}
                </span>
              </div>
              
              {/* Title: Shows Active Panchak or 'No active panchak' */}
              <div className={`text-base font-bold mt-0.5 truncate transition-colors ${
                panchakStatus.isActive 
                  ? (panchakStatus.panchak?.auspiciousness === 'Auspicious'
                      ? 'text-emerald-300 group-hover:text-emerald-200'
                      : panchakStatus.panchak?.auspiciousness === 'Neutral'
                      ? 'text-yellow-300 group-hover:text-yellow-200'
                      : 'text-rose-300 group-hover:text-rose-200')
                  : 'text-white group-hover:text-emerald-300'
              }`}>
                {panchakStatus.isActive && panchakStatus.panchak
                  ? `${panchakStatus.panchak.type}`
                  : 'No active panchak'
                }
              </div>

              {/* Subtitle: Shows exact start & end date-times if active, or next panchak timing if inactive */}
              <div className="text-xs text-neutral-400 mt-0.5 truncate">
                {panchakStatus.isActive && panchakStatus.panchak
                  ? `Starts: ${panchakStatus.panchak.startDate} (${panchakStatus.panchak.startTime}) • Ends: ${panchakStatus.panchak.endDate} (${panchakStatus.panchak.endTime})`
                  : panchakStatus.nextPanchak 
                    ? `Next: ${panchakStatus.nextPanchak.type} (${panchakStatus.nextPanchak.startDate}, ${panchakStatus.nextPanchak.startTime})`
                    : 'No panchak in progress • Shastra Calendar →'
                }
              </div>
            </div>
          </div>

          {/* BOTTOM RIGHT: UPCOMING FESTIVAL / OBSERVANCE (CLICKABLE -> OPENS MONTHLY FESTIVAL CALENDAR) */}
          <div 
            onClick={() => setIsUpcomingFestivalsModalOpen(true)}
            role="button"
            tabIndex={0}
            title="Click to open Monthly Calendar of Upcoming Festivals & Dharmashastra Rules"
            className="bg-[#0e1629]/70 hover:bg-[#121c33] border border-[#1e2942] hover:border-emerald-500/60 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-sm cursor-pointer transition-all group"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="rounded-xl bg-[#092220] border border-emerald-500/40 p-3 text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Moon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-emerald-400 text-[11px] font-bold tracking-wider uppercase flex items-center justify-between">
                  <span>UPCOMING OBSERVANCE</span>
                  <ArrowUpRight size={13} className="text-neutral-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="text-sm font-bold text-white mt-0.5 leading-snug truncate group-hover:text-emerald-300 transition-colors">
                  {panchang.upcomingFestival.title}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5 truncate">
                  {panchang.upcomingFestival.description}
                </div>
              </div>
            </div>

            <span className="bg-[#0c2422] border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0">
              {panchang.upcomingFestival.badge}
            </span>
          </div>

        </div>

        {/* ── Optional Expandable Deep Panchang Details ── */}
        <div className="mt-4 pt-3 border-t border-[#161f36] flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-semibold text-neutral-400 hover:text-orange-400 flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-[#11192e]"
          >
            <Layers size={13} />
            <span>{showDetails ? 'Hide Detailed Limbs & Timeline' : 'View Full 5-Limbs, Muhurats & 24h Choghadiya Timeline'}</span>
            <ChevronRight size={13} className={`transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
          <span className="text-[11px] text-neutral-500 font-mono">
            Swiss Ephemeris • Lahiri Ayanamsha
          </span>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-[#1e2942] space-y-6 animate-in fade-in duration-200">
            
            {/* Tabs header */}
            <div className="flex overflow-x-auto gap-2 pb-2 border-b border-[#1a233a]">
              {[
                { id: 'panchang', label: '5-Limbs of Panchang' },
                { id: 'choghadiya', label: '24h Choghadiya Matrix' },
                { id: 'muhurat', label: 'Shubh & Ashubh Muhurats' },
                { id: 'astrometry', label: 'Surya & Chandra Astrometry' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-[#11192e] text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: 5 Limbs */}
            {activeTab === 'panchang' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-orange-400 font-bold uppercase">1. TITHI</div>
                  <div className="text-sm font-bold text-white mt-1">{panchang.tithi.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Deity: {panchang.tithi.deity}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-orange-400 font-bold uppercase">2. NAKSHATRA</div>
                  <div className="text-sm font-bold text-white mt-1">{panchang.nakshatra.name} ({panchang.nakshatra.devanagari})</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Pada {panchang.nakshatra.pada} • Lord {panchang.nakshatra.lord}</div>
                </div>
                <div className={`p-3.5 rounded-xl bg-[#0e1629] border ${panchang.yoga.nature === 'Shubh' ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-orange-400 font-bold uppercase">3. YOGA</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      panchang.yoga.nature === 'Shubh' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {panchang.yoga.nature === 'Shubh' ? 'AUSPICIOUS (शुभ)' : 'INAUSPICIOUS (अशुभ)'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{panchang.yoga.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">{panchang.yoga.meaning}</div>
                </div>
                <div className={`p-3.5 rounded-xl bg-[#0e1629] border ${panchang.karana.auspicious ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-orange-400 font-bold uppercase">4. KARANA</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      panchang.karana.auspicious ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {panchang.karana.auspicious ? 'AUSPICIOUS (शुभ)' : 'INAUSPICIOUS (अशुभ)'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{panchang.karana.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">{panchang.karana.type}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-orange-400 font-bold uppercase">5. VAAR</div>
                  <div className="text-sm font-bold text-white mt-1">{panchang.vaar.name}</div>
                  <div className="text-[11px] text-amber-400 mt-1">{panchang.vaar.lord}</div>
                </div>
              </div>
            )}

            {/* Tab 2: Choghadiya */}
            {activeTab === 'choghadiya' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-neutral-300 mb-2">☀️ Day Choghadiya (Sunrise to Sunset)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {panchang.dayChoghadiya.map((slot, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border text-xs ${slot.isCurrent ? 'bg-[#1a2542] border-orange-500 ring-1 ring-orange-500' : 'bg-[#0e1629] border-[#1e2942]'}`}>
                        <div className="flex justify-between font-bold text-white">
                          <span>{slot.name}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold border ${
                            slot.nature === 'AUSPICIOUS' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : slot.nature === 'NEUTRAL' 
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>{slot.quality} ({slot.nature === 'AUSPICIOUS' ? 'Auspicious' : slot.nature === 'NEUTRAL' ? 'Neutral' : 'Inauspicious'})</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-1">{slot.startTime} - {slot.endTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-300 mb-2">🌙 Night Choghadiya (Sunset to Next Sunrise)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {panchang.nightChoghadiya.map((slot, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border text-xs ${slot.isCurrent ? 'bg-[#1a2542] border-orange-500 ring-1 ring-orange-500' : 'bg-[#0e1629] border-[#1e2942]'}`}>
                        <div className="flex justify-between font-bold text-white">
                          <span>{slot.name}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold border ${
                            slot.nature === 'AUSPICIOUS' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : slot.nature === 'NEUTRAL' 
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>{slot.quality} ({slot.nature === 'AUSPICIOUS' ? 'Auspicious' : slot.nature === 'NEUTRAL' ? 'Neutral' : 'Inauspicious'})</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-1">{slot.startTime} - {slot.endTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Muhurats */}
            {activeTab === 'muhurat' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0e1629] border border-emerald-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Brahma Muhurat</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AUSPICIOUS</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-emerald-300 mt-1">{panchang.muhurats.brahmaMuhurat.start} - {panchang.muhurats.brahmaMuhurat.end}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-emerald-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Abhijit Muhurat</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AUSPICIOUS</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-emerald-300 mt-1">{panchang.muhurats.abhijitMuhurat.start} - {panchang.muhurats.abhijitMuhurat.end}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-yellow-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-yellow-400 font-bold uppercase">Gulika Kaal</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">NEUTRAL</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-yellow-300 mt-1">{panchang.muhurats.gulikaKaal.start} - {panchang.muhurats.gulikaKaal.end}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-rose-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-rose-400 font-bold uppercase">Rahu Kaal (Avoid)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">INAUSPICIOUS</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-rose-300 mt-1">{panchang.muhurats.rahuKaal.start} - {panchang.muhurats.rahuKaal.end}</div>
                </div>
              </div>
            )}

            {/* Tab 4: Astrometry */}
            {activeTab === 'astrometry' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="font-bold text-amber-400 mb-2">☀️ Surya Astrometry (Solar)</div>
                  <div className="space-y-1 text-neutral-300">
                    <div>Rashi: <span className="font-semibold text-white">{panchang.suryaRashi.name} ({panchang.suryaRashi.degree})</span></div>
                    <div>Day Duration: <span className="font-semibold text-white">{panchang.dayLength}</span></div>
                    <div>Ayana: <span className="font-semibold text-white">{panchang.ayana}</span></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="font-bold text-indigo-400 mb-2">🌙 Chandra Astrometry (Lunar)</div>
                  <div className="space-y-1 text-neutral-300">
                    <div>Rashi: <span className="font-semibold text-white">{panchang.chandraRashi.name} ({panchang.chandraRashi.degree})</span></div>
                    <div>Moon Phase: <span className="font-semibold text-white">{panchang.moonPhaseName} ({panchang.moonIlluminationPercent}%)</span></div>
                    <div>Moonrise / Moonset: <span className="font-semibold text-white">{panchang.moonrise} / {panchang.moonset}</span></div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ── Interactive Modals ── */}
      <TithiMonthModal
        isOpen={isTithiModalOpen}
        onClose={() => setIsTithiModalOpen(false)}
        location={selectedLocation}
      />

      <DailyMuhuratModal
        isOpen={isMuhuratModalOpen}
        onClose={() => setIsMuhuratModalOpen(false)}
        panchang={panchang}
      />

      <TodayFestivalModal
        isOpen={isTodayFestivalModalOpen}
        onClose={() => setIsTodayFestivalModalOpen(false)}
        panchang={panchang}
      />

      <PanchakModal
        isOpen={isPanchakModalOpen}
        onClose={() => setIsPanchakModalOpen(false)}
      />

      <UpcomingFestivalsModal
        isOpen={isUpcomingFestivalsModalOpen}
        onClose={() => setIsUpcomingFestivalsModalOpen(false)}
      />
    </>
  );
}
