"use client";

import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Sparkles, Sun, Moon, LayoutGrid, List, Info, Clock, 
  MapPin, X, BookOpen, Compass
} from 'lucide-react';
import { 
  LocationCoordinates, 
  PRESET_LOCATIONS, 
  getMonthVedicCalendar, 
  MonthCalendarDay 
} from '../../src/lib/vedic-astronomy';

interface MonthlyVedicCalendarProps {
  initialLocation?: LocationCoordinates;
  onSelectDate?: (date: Date) => void;
  embeddedInModal?: boolean;
}

export function MonthlyVedicCalendar({
  initialLocation,
  onSelectDate,
  embeddedInModal = false
}: MonthlyVedicCalendarProps) {
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [location, setLocation] = useState<LocationCoordinates>(initialLocation || PRESET_LOCATIONS[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDayDetail, setSelectedDayDetail] = useState<MonthCalendarDay | null>(null);

  // Synchronize with initialLocation if changed from outside
  React.useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  const monthNames = [
    'January (पौष / माघ)', 'February (माघ / फाल्गुन)', 'March (फाल्गुन / चैत्र)',
    'April (चैत्र / वैशाख)', 'May (वैशाख / ज्येष्ठ)', 'June (ज्येष्ठ / आषाढ़)',
    'July (आषाढ़ / श्रावण)', 'August (श्रावण / भाद्रपद)', 'September (भाद्रपद / आश्विन)',
    'October (आश्विन / कार्तिक)', 'November (कार्तिक / मार्गशीर्ष)', 'December (मार्गशीर्ष / पौष)'
  ];

  const monthNamesEnglish = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysOfWeekHindi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  // High-precision calendar days calculation for the month
  const calendarDays = getMonthVedicCalendar(currentYear, currentMonth, location);

  // Calculate day-of-week offset for the 1st of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const handleDayClick = (day: MonthCalendarDay) => {
    setSelectedDayDetail(day);
    if (onSelectDate) {
      onSelectDate(day.date);
    }
  };

  return (
    <div className={`w-full bg-[#070b16] text-neutral-100 rounded-3xl border border-[#1a233a] shadow-2xl overflow-hidden font-sans ${embeddedInModal ? 'border-none p-0' : 'p-4 sm:p-6'}`}>
      
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#162038]">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex-shrink-0">
            <CalendarIcon size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Monthly Vedic Calendar
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Udaya Tithi Engine
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {monthNamesEnglish[currentMonth]} {currentYear} • Nirayana Lahiri Ayanamsha • {location.name}
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Location */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Location Selector */}
          <div className="relative inline-flex items-center text-xs">
            <MapPin size={12} className="absolute left-2.5 text-orange-400 pointer-events-none" />
            <select
              value={location.name}
              onChange={(e) => {
                const loc = PRESET_LOCATIONS.find(l => l.name === e.target.value);
                if (loc) setLocation(loc);
              }}
              aria-label="Select Location for Monthly Calendar"
              className="pl-7 pr-6 py-1.5 bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] rounded-xl text-xs font-semibold text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-[#090e1a] text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle (Grid vs List) */}
          <div className="flex items-center bg-[#0e1629] p-0.5 rounded-xl border border-[#233152]">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Grid View (मासिक ग्रिड)"
            >
              <LayoutGrid size={13} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="List View (तालिका सूची)"
            >
              <List size={13} />
              <span>List</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── Navigation & Selectors Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 border-b border-[#162038]">
        
        {/* Prev / Month / Year / Next */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Month Dropdown */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
            aria-label="Select Month"
            className="px-3 py-1.5 bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] rounded-xl text-xs font-bold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm"
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx} className="bg-[#090e1a] text-white">
                {name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
            aria-label="Select Year"
            className="px-3 py-1.5 bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] rounded-xl text-xs font-bold text-orange-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm"
          >
            {Array.from({ length: 41 }, (_, i) => 2010 + i).map(yr => (
              <option key={yr} value={yr} className="bg-[#090e1a] text-white">
                Year {yr}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>

          {/* Quick Jump to Today's Month */}
          <button
            onClick={handleResetToCurrentMonth}
            className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all cursor-pointer ml-1 active:scale-95"
          >
            Today / Current Month
          </button>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-neutral-400">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300">
            🌕 Purnima (Full Moon)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
            🌑 Amavasya (New Moon)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            ✨ Ekadashi Vrat
          </span>
        </div>

      </div>

      {/* ── Canonical Dharmashastra Rule Banner ── */}
      <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#121a30] via-[#0d1424] to-[#121a30] border border-[#233152] flex items-start gap-3 text-xs">
        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 flex-shrink-0 mt-0.5">
          <BookOpen size={16} />
        </div>
        <div className="space-y-0.5">
          <div className="text-white font-bold flex items-center gap-2">
            <span>Canonical Udaya Tithi Determination Rule (औदयिक तिथि शास्त्र नियम)</span>
          </div>
          <p className="text-neutral-300 leading-relaxed text-[11px]">
            <strong className="text-orange-400">Surya Siddhanta &amp; Nirnayasindhu:</strong> The Tithi prevailing at local Sunrise (<span className="text-amber-300 font-semibold">Udaya Tithi</span>) governs the entire religious and civil day. The exact Tithi End Time indicates when the Moon-Sun angle traverses the 12° threshold.
          </p>
        </div>
      </div>

      {/* ── View 1: Standard Monthly Grid View ── */}
      {viewMode === 'grid' && (
        <div className="space-y-2">
          
          {/* Weekday Header Row */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold text-neutral-400 py-1.5">
            {daysOfWeekShort.map((day, idx) => (
              <div key={day} className="py-1 px-0.5">
                <span className={idx === 0 ? 'text-red-400' : 'text-neutral-300'}>{day}</span>
                <span className="block text-[10px] text-neutral-500 font-normal">{daysOfWeekHindi[idx]}</span>
              </div>
            ))}
          </div>

          {/* 7-Column Grid Matrix */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            
            {/* Blank leading slots for month offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="min-h-[100px] sm:min-h-[125px] rounded-2xl bg-[#090e1a]/40 border border-[#141d33]/40 opacity-30"
              />
            ))}

            {/* Actual Days of the Month */}
            {calendarDays.map((day) => {
              const isPurnima = day.udayaTithi.isPurnima;
              const isAmavasya = day.udayaTithi.isAmavasya;
              const isEkadashi = day.udayaTithi.isEkadashi;
              const isToday = day.isToday;

              return (
                <div
                  key={day.dayNumber}
                  onClick={() => handleDayClick(day)}
                  role="button"
                  tabIndex={0}
                  className={`min-h-[105px] sm:min-h-[130px] p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden text-left ${
                    isToday
                      ? 'bg-gradient-to-b from-[#162744] to-[#0c1527] border-orange-500/80 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/10'
                      : isPurnima
                      ? 'bg-gradient-to-b from-[#2a1d0d] via-[#16120b] to-[#0d0f1a] border-amber-500/60 hover:border-amber-400 shadow-md shadow-amber-500/10'
                      : isAmavasya
                      ? 'bg-gradient-to-b from-[#1b122e] via-[#100d1e] to-[#0a0c16] border-indigo-500/60 hover:border-indigo-400 shadow-md shadow-indigo-500/10'
                      : isEkadashi
                      ? 'bg-gradient-to-b from-[#0e241e] via-[#091714] to-[#080d1a] border-emerald-500/50 hover:border-emerald-400 shadow-sm'
                      : 'bg-[#0a0f1d] hover:bg-[#10172c] border-[#1b253f] hover:border-orange-500/40'
                  }`}
                >
                  {/* Subtle Background Glow for special days */}
                  {isPurnima && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  )}
                  {isAmavasya && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  )}

                  {/* Top: Gregorian Date & Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm sm:text-base font-extrabold ${
                          isToday ? 'text-orange-400' : isPurnima ? 'text-amber-300' : isAmavasya ? 'text-indigo-300' : 'text-white'
                        }`}>
                          {day.dayNumber}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-orange-500 text-white leading-none">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Icon for Purnima / Amavasya / Ekadashi */}
                      <div>
                        {isPurnima && (
                          <span title="Purnima (Full Moon)" className="text-base sm:text-lg animate-pulse leading-none">
                            🌕
                          </span>
                        )}
                        {isAmavasya && (
                          <span title="Amavasya (New Moon)" className="text-base sm:text-lg leading-none">
                            🌑
                          </span>
                        )}
                        {isEkadashi && !isPurnima && !isAmavasya && (
                          <span title="Ekadashi Fast" className="text-xs text-emerald-400 leading-none">
                            ✨
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prevailing Udaya Tithi Name */}
                    <div className="mt-1.5">
                      <div className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 ${
                        isPurnima
                          ? 'text-amber-300'
                          : isAmavasya
                          ? 'text-indigo-300'
                          : isEkadashi
                          ? 'text-emerald-300'
                          : day.udayaTithi.paksha === 'Shukla'
                          ? 'text-orange-200'
                          : 'text-neutral-200'
                      }`}>
                        {day.udayaTithi.pureName}
                      </div>
                      <span className={`inline-block text-[9px] px-1 py-0.2 rounded font-semibold mt-0.5 ${
                        day.udayaTithi.paksha === 'Shukla'
                          ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                      }`}>
                        {day.udayaTithi.paksha}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Tithi End Time & Sunrise */}
                  <div className="mt-2 pt-1.5 border-t border-[#1a2542]/60 text-[10px] space-y-0.5 font-mono">
                    <div className="text-neutral-300 truncate font-semibold" title={`Tithi ends at: ${day.tithiEndTime}`}>
                      <span className="text-neutral-500">End: </span>
                      <span className="text-amber-300/90">{day.tithiEndTime}</span>
                    </div>
                    <div className="text-neutral-400 text-[9px] truncate">
                      🌅 {day.sunrise}
                    </div>
                    {day.festival && (
                      <div className="text-[9px] font-bold text-amber-400 truncate bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 mt-1">
                        {day.festival}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* ── View 2: Clean List / Table View ── */}
      {viewMode === 'list' && (
        <div className="rounded-2xl border border-[#1e2942] overflow-hidden bg-[#0c1222]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#11192e] text-neutral-300 border-b border-[#1e2942]">
                <tr>
                  <th className="p-3 font-bold">Date &amp; Day</th>
                  <th className="p-3 font-bold">Prevailing Udaya Tithi</th>
                  <th className="p-3 font-bold">Tithi End Time</th>
                  <th className="p-3 font-bold">Nakshatra</th>
                  <th className="p-3 font-bold">Sunrise / Sunset</th>
                  <th className="p-3 font-bold">Observance / Fast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18233c] text-neutral-300">
                {calendarDays.map((day) => {
                  const isPurnima = day.udayaTithi.isPurnima;
                  const isAmavasya = day.udayaTithi.isAmavasya;
                  const isEkadashi = day.udayaTithi.isEkadashi;

                  return (
                    <tr 
                      key={day.dayNumber}
                      onClick={() => handleDayClick(day)}
                      className={`hover:bg-[#141d33] transition-colors cursor-pointer ${
                        day.isToday ? 'bg-orange-500/10' : ''
                      }`}
                    >
                      {/* Date */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${day.isToday ? 'text-orange-400' : 'text-white'}`}>
                            {day.dateFormatted}
                          </span>
                          {day.isToday && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-orange-500 text-white font-bold">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400">{day.dayOfWeek}</div>
                      </td>

                      {/* Udaya Tithi */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                            isPurnima
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                              : isAmavasya
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                              : isEkadashi
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                              : day.udayaTithi.paksha === 'Shukla'
                              ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20'
                              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                          }`}>
                            {day.udayaTithi.name}
                          </span>
                          {isPurnima && <span>🌕</span>}
                          {isAmavasya && <span>🌑</span>}
                          {isEkadashi && <span>✨</span>}
                        </div>
                      </td>

                      {/* Tithi End Time */}
                      <td className="p-3 whitespace-nowrap font-mono font-semibold text-amber-300">
                        {day.tithiEndTime}
                      </td>

                      {/* Nakshatra */}
                      <td className="p-3 whitespace-nowrap font-medium text-neutral-200">
                        <div>{day.nakshatra.name} ({day.nakshatra.devanagari})</div>
                        <div className="text-[10px] text-neutral-400">Yoga: {day.yoga.name}</div>
                      </td>

                      {/* Sunrise / Sunset */}
                      <td className="p-3 whitespace-nowrap font-mono text-[11px] text-neutral-300">
                        🌅 {day.sunrise} • 🌇 {day.sunset}
                      </td>

                      {/* Observance */}
                      <td className="p-3 whitespace-nowrap">
                        {day.festival ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                            <Sparkles size={11} />
                            {day.festival}
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">नित्य पञ्चाङ्ग</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Day Detail Interactive Modal Popup ── */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2942]">
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                  Vedic Astrometry Details
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {selectedDayDetail.dateFormatted} ({selectedDayDetail.dayOfWeek})
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1e2b4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-3.5 text-xs">
              
              {/* Udaya Tithi Card */}
              <div className="p-3.5 rounded-2xl bg-[#0e1629] border border-[#1e2942] space-y-1.5">
                <div className="text-neutral-400 font-bold uppercase text-[10px]">1. PREVAILING UDAYA TITHI (सूर्योदय कालीन तिथि)</div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedDayDetail.udayaTithi.name}</span>
                  {selectedDayDetail.udayaTithi.isPurnima && <span>🌕</span>}
                  {selectedDayDetail.udayaTithi.isAmavasya && <span>🌑</span>}
                </div>
                <div className="text-amber-300 font-mono font-semibold pt-1">
                  ⏱️ Tithi Concludes: {selectedDayDetail.tithiEndTime}
                </div>
                <div className="text-[11px] text-neutral-400">
                  Presiding Deity: <strong className="text-neutral-200">{selectedDayDetail.udayaTithi.deity}</strong> • Paksha: <strong className="text-neutral-200">{selectedDayDetail.udayaTithi.paksha}</strong>
                </div>
              </div>

              {/* 5-Limbs Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">2. NAKSHATRA</div>
                  <div className="font-bold text-white text-sm mt-0.5">{selectedDayDetail.nakshatra.name}</div>
                  <div className="text-[10px] text-neutral-400">Lord: {selectedDayDetail.nakshatra.lord}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">3. YOGA</div>
                  <div className="font-bold text-white text-sm mt-0.5">{selectedDayDetail.yoga.name}</div>
                  <div className="text-[10px] text-emerald-400">{selectedDayDetail.yoga.nature}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">4. KARANA</div>
                  <div className="font-bold text-white text-sm mt-0.5">{selectedDayDetail.karana.name}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">5. SOLAR TIMINGS</div>
                  <div className="font-mono text-white text-xs mt-0.5">🌅 {selectedDayDetail.sunrise}</div>
                  <div className="font-mono text-neutral-400 text-xs">🌇 {selectedDayDetail.sunset}</div>
                </div>
              </div>

              {/* Dharmashastra Note */}
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-200">
                <div className="font-bold mb-0.5 flex items-center gap-1">
                  <BookOpen size={12} />
                  <span>Surya Siddhanta &amp; Nirnayasindhu Shastra Rule:</span>
                </div>
                The Udaya Tithi at local sunrise ({selectedDayDetail.sunrise}) is the sole canonical authority for daily Sankalpa, Pujas, and religious duties.
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#1e2942] flex justify-end">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
