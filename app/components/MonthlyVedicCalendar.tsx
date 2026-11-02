"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Sparkles, Sun, Moon, MapPin, X, BookOpen, Clock, CheckCircle2, Filter
} from 'lucide-react';
import { 
  LocationCoordinates, 
  PRESET_LOCATIONS, 
  getMonthVedicCalendar, 
  MonthCalendarDay,
  getSamvatDetails,
  getLunarMonthDetails
} from '../../src/lib/vedic-astronomy';
import { useLanguage } from '../../src/context/LanguageContext';
import { resolveDharmaShastraRule } from '../../src/lib/panchang/dharmaShastraRuleEngine';

export type CalendarFilterTab = 'all' | 'vrats' | 'ekadashi' | 'pradosh' | 'purnima_amavasya' | 'major';

interface MonthlyVedicCalendarProps {
  initialLocation?: LocationCoordinates;
  onSelectDate?: (date: Date) => void;
  embeddedInModal?: boolean;
  initialTab?: CalendarFilterTab;
}

export function MonthlyVedicCalendar({
  initialLocation,
  onSelectDate,
  embeddedInModal = false,
  initialTab = 'all'
}: MonthlyVedicCalendarProps) {
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [location, setLocation] = useState<LocationCoordinates>(initialLocation || PRESET_LOCATIONS[0]);
  const [selectedDayDetail, setSelectedDayDetail] = useState<MonthCalendarDay | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<CalendarFilterTab>(initialTab);
  const { language, t, translateTerm, localeCode } = useLanguage();

  const todayRowRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDateNum = now.getDate();

  // Synchronize initialTab if changed externally
  useEffect(() => {
    if (initialTab) {
      setActiveFilterTab(initialTab);
    }
  }, [initialTab]);

  // Synchronize with initialLocation if changed from outside
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  // Lock body scroll while day detail modal is open
  useEffect(() => {
    if (selectedDayDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedDayDetail]);

  // ESC key listener for day detail modal
  useEffect(() => {
    if (!selectedDayDetail) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDayDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDayDetail]);

  // Auto-scroll to today's row when current month/year matches today
  useEffect(() => {
    if (todayRowRef.current) {
      todayRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentMonth, currentYear, activeFilterTab]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Reference date around the middle of the selected month
  const activeMonthMidDate = useMemo(() => {
    return new Date(currentYear, currentMonth, 15);
  }, [currentYear, currentMonth]);

  // Vikram Samvat details for the selected month
  const monthSamvat = useMemo(() => {
    return getSamvatDetails(activeMonthMidDate);
  }, [activeMonthMidDate]);

  // Lunar Month (Masa) details for the selected month
  const monthMasa = useMemo(() => {
    return getLunarMonthDetails(activeMonthMidDate);
  }, [activeMonthMidDate]);

  // Localized long month name
  const activeMonthFormattedName = useMemo(() => {
    return activeMonthMidDate.toLocaleDateString(localeCode, { month: 'long' });
  }, [activeMonthMidDate, localeCode]);

  // High-precision calendar days calculation for the month (memoized)
  const calendarDays = useMemo(() => {
    return getMonthVedicCalendar(currentYear, currentMonth, location);
  }, [currentYear, currentMonth, location]);

  // Helper to determine if a day qualifies as a Vrat or Festival observance
  const isVratObservance = (d: MonthCalendarDay) => {
    return (
      Boolean(d.festival) ||
      d.udayaTithi.isEkadashi ||
      d.udayaTithi.isPurnima ||
      d.udayaTithi.isAmavasya ||
      d.udayaTithi.isAshtami ||
      d.udayaTithi.index === 13 || 
      d.udayaTithi.index === 28 ||
      (d.festival && d.festival.toLowerCase().includes('pradosh')) ||
      (d.festival && d.festival.toLowerCase().includes('sankashti')) ||
      (d.udayaTithi.paksha === 'Krishna' && (d.udayaTithi.index === 19 || d.udayaTithi.pureName === 'Chaturthi'))
    );
  };

  // Dynamic counts for each filter category
  const filterOptions: { id: CalendarFilterTab; label: string; count: number }[] = useMemo(() => {
    const allCount = calendarDays.length;
    const vratsCount = calendarDays.filter(isVratObservance).length;
    const ekadashiCount = calendarDays.filter(d => 
      d.udayaTithi.isEkadashi || (d.festival && d.festival.toLowerCase().includes('ekadashi'))
    ).length;
    const pradoshCount = calendarDays.filter(d => 
      (d.festival && d.festival.toLowerCase().includes('pradosh')) || d.udayaTithi.index === 13 || d.udayaTithi.index === 28
    ).length;
    const purnimaAmavasyaCount = calendarDays.filter(d => 
      d.udayaTithi.isPurnima || d.udayaTithi.isAmavasya
    ).length;
    const majorCount = calendarDays.filter(d => Boolean(d.festivalDetails?.isMajor)).length;

    return [
      { id: 'all', label: t('allCalendarDays'), count: allCount },
      { id: 'vrats', label: t('vratAndTyoharAlmanac'), count: vratsCount },
      { id: 'ekadashi', label: t('filterEkadashi'), count: ekadashiCount },
      { id: 'pradosh', label: t('filterPradosh'), count: pradoshCount },
      { id: 'purnima_amavasya', label: t('filterPurnimaAmavasya'), count: purnimaAmavasyaCount },
      { id: 'major', label: t('filterMajor'), count: majorCount },
    ];
  }, [calendarDays, t]);

  // Filtered days list based on active filter tab
  const displayedDays = useMemo(() => {
    if (activeFilterTab === 'all') return calendarDays;
    if (activeFilterTab === 'vrats') {
      return calendarDays.filter(isVratObservance);
    }
    if (activeFilterTab === 'ekadashi') {
      return calendarDays.filter(d => 
        d.udayaTithi.isEkadashi || (d.festival && d.festival.toLowerCase().includes('ekadashi'))
      );
    }
    if (activeFilterTab === 'pradosh') {
      return calendarDays.filter(d => 
        (d.festival && d.festival.toLowerCase().includes('pradosh')) || d.udayaTithi.index === 13 || d.udayaTithi.index === 28
      );
    }
    if (activeFilterTab === 'purnima_amavasya') {
      return calendarDays.filter(d => d.udayaTithi.isPurnima || d.udayaTithi.isAmavasya);
    }
    if (activeFilterTab === 'major') {
      return calendarDays.filter(d => Boolean(d.festivalDetails?.isMajor));
    }
    return calendarDays;
  }, [calendarDays, activeFilterTab]);

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
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleDayClick = (day: MonthCalendarDay) => {
    setSelectedDayDetail(day);
    if (onSelectDate) {
      onSelectDate(day.date);
    }
  };

  return (
    <div className={`w-full bg-[#070b16] text-neutral-100 rounded-3xl border border-[#1a233a] shadow-2xl overflow-hidden font-sans ${embeddedInModal ? 'border-none p-0' : 'p-3 sm:p-6'}`}>
      
      {/* ── Top Header Bar: Title, Contextual Masa/Samvat & Location ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162038]">
        
        {/* Title & Masa/Samvat Badges */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
            <CalendarIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight break-words min-w-0 leading-snug">
                {language === 'hi' ? 'मासिक वैदिक पञ्चाङ्ग एवं व्रत सारणी' : (language === 'sa' ? 'मासिकवैदिकपञ्चाङ्गम्' : (language === 'mr' ? 'मासिक वैदिक पंचांग व सण' : (language === 'gu' ? 'માસિક વૈદિક પંચાંગ અને વ્રત' : 'Unified Vedic Calendar & Vrat Almanac')))}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0 whitespace-nowrap">
                Udaya Tithi
              </span>
            </div>
            
            {/* Contextual Month, Vikram Samvat & Masa Display */}
            <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200">
                {activeMonthFormattedName} {currentYear}
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-orange-300/90 font-semibold font-mono">
                {t('vikramSamvat')}: {monthSamvat.vikramSamvat}
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-amber-300/90 font-medium">
                {translateTerm(`${monthMasa.purnimantaMonth.replace(/\s*\([^)]*\)/g, '').trim()} Masa`, language) || translateTerm(monthMasa.purnimantaMonth, language)} {t('masa')}
              </span>
              <span className="text-neutral-500 hidden sm:inline">•</span>
              <span className="text-neutral-400 hidden sm:inline">
                {location.name}
              </span>
            </div>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="relative inline-flex items-center text-xs">
            <MapPin size={12} className="absolute left-2.5 text-orange-400 pointer-events-none" />
            <select
              value={location.name}
              onChange={(e) => {
                const loc = PRESET_LOCATIONS.find(l => l.name === e.target.value);
                if (loc) setLocation(loc);
              }}
              aria-label={t('selectCity')}
              className="pl-7 pr-6 py-1.5 bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] rounded-xl text-xs font-semibold text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-[#090e1a] text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* ── Month / Year Switcher Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-3 border-b border-[#162038]">
        
        {/* Prev / Month Dropdown / Year Dropdown / Next / Today */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title={t('prevDay')}
            aria-label={t('prevDay')}
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
                {yr}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title={t('nextDay')}
            aria-label={t('nextDay')}
          >
            <ChevronRight size={16} />
          </button>

          {/* Jump to Today Button */}
          <button
            type="button"
            onClick={handleResetToCurrentMonth}
            className="px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            {t('live')}
          </button>
        </div>

        {/* Informational Shastra Rule Banner Snippet */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-neutral-400">
          <BookOpen size={12} className="text-amber-400 shrink-0" />
          <span>{t('shastraAuthority')}: <strong className="text-amber-300 font-medium">Udaya-Vyapini Rule</strong></span>
        </div>

      </div>

      {/* ── Almanac Mode Filter Pills ── */}
      <div className="py-2.5 border-b border-[#162038] flex items-center gap-1.5 overflow-x-auto horizontal-tabs-scroll overscroll-x-contain">
        {filterOptions.map((opt) => {
          const isActive = activeFilterTab === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActiveFilterTab(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#0e1629] hover:bg-[#15223e] text-neutral-300 hover:text-white border border-[#233152]'
              }`}
            >
              <span>{opt.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-neutral-400'
              }`}>
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Structured Tabular List View (Vedic Almanac Table) ── */}
      <div className={`mt-3 rounded-2xl border border-[#1e2942] bg-[#090e1a] shadow-xl ${embeddedInModal ? '' : 'overflow-hidden'}`}>
        
        {/* Scrollable Container with Sticky Table Column Header Row */}
        <div className={embeddedInModal ? "w-full pb-20" : "flex-1 w-full max-h-[85dvh] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] pb-36 sm:pb-28 mb-safe"}>
          
          {/* ── Sticky Table Column Header Row (sticky top-0 z-20) ── */}
          <div className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] font-bold uppercase tracking-wider text-orange-300/90 select-none shadow-sm grid grid-cols-[76px_1fr_auto] sm:grid-cols-12 items-stretch rounded-t-2xl">
            
            {/* Col 1: Date & Vara */}
            <div className="sm:col-span-2 border-r border-[#1e2d4f] p-2 sm:p-2.5 text-center flex items-center justify-center min-w-0">
              <span className="hidden sm:inline">{t('colDateAndVara')}</span>
              <span className="sm:hidden">{t('colMobileDate')}</span>
            </div>

            {/* Col 2: Tithi & Paksha */}
            <div className="sm:col-span-4 sm:border-r sm:border-[#1e2d4f] p-2 sm:p-2.5 flex items-center min-w-0 pl-3">
              <span className="hidden sm:inline">{t('colTithiAndPaksha')}</span>
              <span className="sm:hidden">{t('colMobileTithiPakshaMasa')}</span>
            </div>

            {/* Col 3: Masa (Desktop/Tablet) */}
            <div className="hidden sm:flex sm:col-span-3 sm:border-r border-[#1e2d4f] p-2.5 items-center min-w-0 pl-3.5">
              <span>{t('colMasa')}</span>
            </div>

            {/* Col 4: Vrat & Tyohar */}
            <div className="p-2 sm:p-2.5 text-right sm:text-left sm:col-span-3 min-w-[96px] max-w-[135px] sm:max-w-none flex items-center justify-end sm:justify-start min-w-0 pr-3 sm:pr-2.5 sm:pl-3.5">
              <span className="hidden sm:inline">{t('colVratAndTyohar')}</span>
              <span className="sm:hidden">{t('colMobileVrat')}</span>
            </div>

          </div>

          {/* ── Table Body Rows ── */}
          <div className="divide-y divide-[#162038] bg-[#090e1a]">
            {displayedDays.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs sm:text-sm space-y-3">
                <p>{language === 'hi' ? 'इस श्रेणी में इस माह कोई दिवस नहीं मिला।' : 'No entries found in this category for this month.'}</p>
                <button
                  type="button"
                  onClick={() => setActiveFilterTab('all')}
                  className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {t('allCalendarDays')}
                </button>
              </div>
            ) : (
              displayedDays.map((day) => {
                const isToday = day.isToday;
                const isPurnima = day.udayaTithi.isPurnima;
                const isAmavasya = day.udayaTithi.isAmavasya;
                const isEkadashi = day.udayaTithi.isEkadashi;
                const isAshtami = day.udayaTithi.isAshtami;

                const weekdayShort = day.date.toLocaleDateString(localeCode, { weekday: 'short' });
                const monthShort = day.date.toLocaleDateString(localeCode, { month: 'short' });

                const translatedTithiName = translateTerm(day.udayaTithi.name, language);
                const cleanPurnimanta = day.purnimantaMonth.replace(/\s*\([^)]*\)/g, '').trim();
                const translatedMasa = translateTerm(`${cleanPurnimanta} Masa`, language) || translateTerm(cleanPurnimanta, language);
                const translatedFestival = day.festival ? translateTerm(day.festival, language) : null;
                const dharmaRule = resolveDharmaShastraRule(day, language, t);

                // Relative countdown calculation
                const todayMidnight = new Date(todayYear, todayMonth, todayDateNum).getTime();
                const dayMidnight = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate()).getTime();
                const diffMs = dayMidnight - todayMidnight;
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

                let countdownBadge: string | null = null;
                if (diffDays === 0) {
                  countdownBadge = t('live');
                } else if (diffDays === 1) {
                  countdownBadge = t('tomorrow');
                } else if (diffDays > 1 && diffDays <= 30) {
                  countdownBadge = t('inDays').replace('{n}', String(diffDays));
                }

                return (
                  <div
                    key={day.dayNumber}
                    ref={isToday ? todayRowRef : null}
                    onClick={() => handleDayClick(day)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDayClick(day);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${day.dateFormatted}: ${translatedTithiName}`}
                    className={`grid grid-cols-[76px_1fr_auto] sm:grid-cols-12 items-stretch transition-colors hover:bg-[#10192e] active:bg-[#15203b] cursor-pointer group select-none min-w-0 relative ${
                      isToday ? 'bg-orange-500/10' : ''
                    }`}
                  >
                    {/* Left Orange Accent Bar if Today */}
                    {isToday && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 z-10" />
                    )}

                    {/* ── Col 1: Date & Weekday (sm:col-span-2) ── */}
                    <div className="sm:col-span-2 border-r border-[#162038] p-1.5 sm:p-3 flex flex-col justify-center items-center text-center relative min-w-0">
                      <span className={`text-lg sm:text-xl font-extrabold font-grotesk leading-none ${
                        isToday ? 'text-orange-400' : isPurnima ? 'text-amber-300' : isAmavasya ? 'text-indigo-300' : isEkadashi ? 'text-emerald-300' : 'text-neutral-100'
                      }`}>
                        {day.dayNumber}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-300 mt-1 leading-tight text-center break-words max-w-full">
                        {weekdayShort}
                      </span>
                      <span className="text-[9px] text-neutral-500 leading-none text-center">
                        {monthShort}
                      </span>
                      {isToday && (
                        <span className="mt-1 px-1.5 py-0.5 rounded bg-orange-500 text-white text-[8px] font-extrabold uppercase shrink-0 whitespace-nowrap shadow-sm">
                          {t('live')}
                        </span>
                      )}
                    </div>

                    {/* ── Col 2: Tithi, Paksha & Timing (sm:col-span-4) ── */}
                    <div className="sm:col-span-4 p-2.5 sm:p-3.5 flex flex-col justify-center min-w-0 sm:border-r sm:border-[#162038]">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 whitespace-nowrap ${
                          day.udayaTithi.paksha === 'Shukla'
                            ? 'bg-orange-500/15 text-orange-300 border border-orange-500/25'
                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                        }`}>
                          {translateTerm(day.udayaTithi.paksha, language)}
                        </span>
                        <span className={`font-bold text-xs sm:text-sm break-words leading-snug min-w-0 ${
                          isToday ? 'text-orange-400' : isPurnima ? 'text-amber-300' : isAmavasya ? 'text-indigo-300' : isEkadashi ? 'text-emerald-300' : 'text-neutral-100'
                        }`}>
                          {translatedTithiName}
                        </span>
                        {day.udayaTithi.isVriddhiTithi && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 whitespace-nowrap">
                            Vriddhi
                          </span>
                        )}
                        {day.udayaTithi.isKshayaTithi && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 whitespace-nowrap">
                            Kshaya
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-400 font-mono mt-1 leading-snug flex items-center gap-1 flex-wrap min-w-0">
                        <span className="text-neutral-500 shrink-0">⏱️ {t('tithiEnds')}:</span>
                        <strong className="text-amber-300 font-medium break-words">{day.tithiEndTime}</strong>
                      </div>

                      {/* Dharma Shastra Tithi & Observance Rule Sub-Row */}
                      <div className="mt-1.5 flex items-start gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10.5px] text-indigo-300 leading-snug break-words w-full min-w-0 max-w-full">
                        <span className="font-semibold shrink-0 select-none">{dharmaRule.prefix}</span>
                        <span className="text-indigo-200/90 break-words min-w-0 flex-1">{dharmaRule.ruleText}</span>
                      </div>

                      {/* Mobile-only Lunar Masa sub-line */}
                      <div className="sm:hidden text-[11px] font-medium text-amber-300/90 mt-1 break-words leading-snug flex items-center gap-1 flex-wrap">
                        <span className="text-amber-400/80 shrink-0">🌙</span>
                        <span>{translatedMasa} {t('masa')}</span>
                      </div>
                    </div>

                    {/* ── Col 3: Lunar Masa (sm:col-span-3 - Desktop/Tablet) ── */}
                    <div className="hidden sm:flex sm:col-span-3 sm:border-r sm:border-[#162038] p-3.5 flex-col justify-center min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-amber-400/90 text-xs shrink-0 select-none">🌙</span>
                        <span className="text-xs sm:text-sm font-semibold text-neutral-200 break-words leading-snug min-w-0">
                          {translatedMasa} {t('masa')}
                        </span>
                      </div>
                      {day.amantaMonth && day.amantaMonth !== day.purnimantaMonth && (
                        <div className="text-[10px] text-neutral-400 mt-0.5 break-words leading-snug">
                          {t('amanta')}: <strong className="text-neutral-300 font-normal">{translateTerm(day.amantaMonth, language)}</strong>
                        </div>
                      )}
                    </div>

                    {/* ── Col 4: Vrat & Tyohar / Action (sm:col-span-3) ── */}
                    <div className="p-2.5 sm:p-3.5 flex flex-col justify-center items-end sm:items-start text-right sm:text-left sm:col-span-3 min-w-[96px] max-w-[135px] sm:max-w-none">
                      {translatedFestival ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30 break-words leading-snug text-right sm:text-left">
                          <span className="shrink-0 select-none">{day.festivalDetails?.icon || '✨'}</span>
                          <span>{translatedFestival}</span>
                        </div>
                      ) : isPurnima ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 break-words leading-snug text-right sm:text-left">
                          <span className="shrink-0 select-none">🌕</span>
                          <span>Purnima</span>
                        </div>
                      ) : isAmavasya ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 break-words leading-snug text-right sm:text-left">
                          <span className="shrink-0 select-none">🌑</span>
                          <span>Amavasya</span>
                        </div>
                      ) : isEkadashi ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 break-words leading-snug text-right sm:text-left">
                          <span className="shrink-0 select-none">✨</span>
                          <span>Ekadashi</span>
                        </div>
                      ) : isAshtami ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 break-words leading-snug text-right sm:text-left">
                          <span className="shrink-0 select-none">🔱</span>
                          <span>Ashtami</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-neutral-500 group-hover:text-neutral-400 transition-colors">
                          <span className="hidden sm:inline text-xs text-neutral-500">—</span>
                          <span className="sm:hidden text-neutral-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all text-xs font-bold">›</span>
                        </div>
                      )}

                      {countdownBadge && (
                        <div className="text-[10px] font-semibold text-neutral-400 mt-1 whitespace-nowrap shrink-0 flex items-center gap-1">
                          <span>{countdownBadge}</span>
                          <span className="hidden sm:inline text-neutral-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold ml-1">›</span>
                        </div>
                      )}

                      {!countdownBadge && (
                        <div className="hidden sm:flex items-center gap-1 text-[10px] text-neutral-500 group-hover:text-orange-400 transition-colors mt-0.5">
                          <span>{t('tapToInspect')}</span>
                          <span className="group-hover:translate-x-0.5 transition-transform font-bold">›</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* ── Day Detail Interactive Modal Popup ── */}
      {selectedDayDetail && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDayDetail(null);
          }}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-none sm:max-w-xl h-dvh sm:h-auto sm:max-h-[85dvh] bg-[#090e1a] border-0 sm:border border-[#233152] rounded-none sm:rounded-3xl shadow-2xl flex flex-col font-sans overflow-hidden text-left overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between shrink-0">
              <div className="min-w-0 flex-1 mr-2">
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">
                  Vedic Astrometry &amp; Observance Details
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white break-words min-w-0 leading-snug">
                  {selectedDayDetail.dateFormatted} ({selectedDayDetail.dayOfWeek})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1e2b4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title={t('close')}
                aria-label={t('close')}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-6 space-y-3.5 text-xs pb-10 [-webkit-overflow-scrolling:touch]">
              
              {/* Sacred Festival / Vrat Details Card */}
              {selectedDayDetail.festival && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#0e172a] to-orange-500/15 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5 shrink-0">
                      <Sparkles size={12} className="text-amber-400 shrink-0" />
                      <span>{t('vedicObservance')}</span>
                    </span>
                    {selectedDayDetail.festivalDetails?.badge && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 whitespace-nowrap">
                        {selectedDayDetail.festivalDetails.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-xl shrink-0 select-none">
                      {selectedDayDetail.festivalDetails?.icon || '🕉️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold text-white break-words min-w-0 leading-snug">
                        {translateTerm(selectedDayDetail.festival, language)}
                      </h4>
                      {selectedDayDetail.festivalDetails?.description && (
                        <p className="text-[11px] text-neutral-300 mt-0.5 break-words min-w-0 leading-relaxed">
                          {selectedDayDetail.festivalDetails.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedDayDetail.festivalDetails?.briefRule && (
                    <div className="pt-2 border-t border-amber-500/20 text-[11px]">
                      <div className="text-amber-200/95 leading-relaxed bg-[#0a0f1d]/80 p-2.5 rounded-xl border border-amber-500/25">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-amber-300 flex items-center gap-1">
                            <BookOpen size={11} className="text-amber-400 shrink-0" />
                            <span>{t('shastraRuleHeader')}:</span>
                          </span>
                        </div>
                        <p className="text-neutral-200 leading-relaxed text-xs break-words min-w-0">
                          {language === 'hi'
                            ? (selectedDayDetail.festivalDetails.briefRule.hindi || selectedDayDetail.festivalDetails.description)
                            : (selectedDayDetail.festivalDetails.briefRule.english || selectedDayDetail.festivalDetails.description)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDayDetail.festivalDetails?.shastraReferences && selectedDayDetail.festivalDetails.shastraReferences.length > 0 && (
                    <div className="text-[10px] text-amber-300/80 font-mono flex items-center gap-1 pt-1 flex-wrap">
                      <span>📜 {t('references')}:</span>
                      <span>{selectedDayDetail.festivalDetails.shastraReferences.join(' • ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Udaya Tithi Card */}
              <div className="p-3.5 rounded-2xl bg-[#0e1629] border border-[#1e2942] space-y-1.5">
                <div className="text-neutral-400 font-bold uppercase text-[10px]">{t('tithi')} (Udaya Tithi)</div>
                <div className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                  <span className="break-words min-w-0">{translateTerm(selectedDayDetail.udayaTithi.name, language)}</span>
                  {selectedDayDetail.udayaTithi.isPurnima && <span className="shrink-0">🌕</span>}
                  {selectedDayDetail.udayaTithi.isAmavasya && <span className="shrink-0">🌑</span>}
                  {selectedDayDetail.udayaTithi.isEkadashi && <span className="shrink-0">✨</span>}
                  {selectedDayDetail.udayaTithi.isAshtami && <span className="shrink-0">🔱</span>}
                </div>
                <div className="text-amber-300 font-mono font-semibold pt-1">
                  ⏱️ {t('tithiEnds')}: {selectedDayDetail.tithiEndTime}
                </div>
                <div className="text-[11px] text-neutral-400 break-words min-w-0 leading-relaxed">
                  Deity: <strong className="text-neutral-200">{selectedDayDetail.udayaTithi.deity}</strong> • Paksha: <strong className="text-neutral-200">{selectedDayDetail.udayaTithi.paksha}</strong>
                </div>

                {/* Anomaly Banners */}
                {selectedDayDetail.udayaTithi.isVriddhiTithi && (
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 mt-2">
                    <strong className="text-purple-300">🔄 Vriddhi Tithi:</strong> Touches two consecutive sunrises. Both days share this Udaya Tithi.
                  </div>
                )}
                {selectedDayDetail.udayaTithi.isKshayaTithi && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-200 space-y-1 mt-2">
                    <div className="text-rose-300 font-bold">⚠️ Kshaya Tithi:</div>
                    <p className="text-[11px] text-neutral-300 break-words min-w-0">
                      <strong>{selectedDayDetail.udayaTithi.kshayaTithiDetails?.name || 'Tithi'}</strong> began after yesterday&apos;s sunrise and ended before today&apos;s sunrise.
                    </p>
                  </div>
                )}

                {/* Dedicated Dharma Shastra Rule Box in Day Detail */}
                {(() => {
                  const detailRule = resolveDharmaShastraRule(selectedDayDetail, language, t);
                  return (
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 mt-2 space-y-1">
                      <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <span>{detailRule.prefix}</span>
                      </div>
                      <p className="text-[11.5px] text-indigo-100/90 leading-relaxed break-words min-w-0">
                        {detailRule.ruleText}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* 5-Limbs Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942] min-w-0">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">2. {t('nakshatra')}</div>
                  <div className="font-bold text-white text-sm mt-0.5 break-words min-w-0 leading-snug">{translateTerm(selectedDayDetail.nakshatra.name, language)}</div>
                  <div className="text-[10px] text-neutral-400 break-words min-w-0">Lord: {selectedDayDetail.nakshatra.lord}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942] min-w-0">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">3. {t('yoga')}</div>
                  <div className="font-bold text-white text-sm mt-0.5 break-words min-w-0 leading-snug">{translateTerm(selectedDayDetail.yoga.name, language)}</div>
                  <div className="text-[10px] text-emerald-400">{selectedDayDetail.yoga.nature}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942] min-w-0">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">4. {t('karana')}</div>
                  <div className="font-bold text-white text-sm mt-0.5 break-words min-w-0 leading-snug">{translateTerm(selectedDayDetail.karana.name, language)}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942] min-w-0">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">5. SOLAR TIMINGS</div>
                  <div className="font-mono text-white text-xs mt-0.5">🌅 {selectedDayDetail.sunrise}</div>
                  <div className="font-mono text-neutral-400 text-xs">🌇 {selectedDayDetail.sunset}</div>
                </div>
              </div>

              {/* Dharmashastra Note */}
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-200">
                <div className="font-bold mb-0.5 flex items-center gap-1">
                  <BookOpen size={12} className="shrink-0" />
                  <span>{t('shastraRuleHeader')}:</span>
                </div>
                <p className="leading-relaxed break-words min-w-0">
                  {language === 'hi'
                    ? `स्थानीय सूर्योदय (${selectedDayDetail.sunrise}) के समय उपस्थित औदयिक तिथि ही दैनिक संकल्प, पूजा एवं धार्मिक कृत्यों हेतु शास्त्रसम्मत आधार है।`
                    : `The Udaya Tithi at local sunrise (${selectedDayDetail.sunrise}) is the sole canonical authority for daily Sankalpa, Pujas, and religious observances.`
                  }
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-[#1e2942] bg-[#0c1222] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-neutral-400 font-mono break-words min-w-0">
                {t('shastraAuthority')}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors cursor-pointer active:scale-95 shadow-md shrink-0"
              >
                {t('close')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Alias export for VedicAlmanacTable
export { MonthlyVedicCalendar as VedicAlmanacTable };
