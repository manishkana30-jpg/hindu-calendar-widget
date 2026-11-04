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
  formatNormalizedPakshaTithi,
  cleanMasaMonthName,
  formatTithiEndTime
} from '../../src/lib/vedic-astronomy';
import { useLanguage } from '../../src/context/LanguageContext';
import { resolveDharmaShastraRule } from '../../src/lib/panchang/dharmaShastraRuleEngine';

export type CalendarFilterTab = 'all' | 'major' | 'vrats' | 'ekadashi' | 'pradosh' | 'purnima_amavasya';

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

  const todayRowRef = useRef<HTMLTableRowElement>(null);

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
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

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
    const majorCount = calendarDays.filter(d => Boolean(d.festivalDetails?.isMajor)).length;
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

    return [
      { id: 'all', label: t('allCalendarDays'), count: allCount },
      { id: 'major', label: t('filterMajor'), count: majorCount },
      { id: 'vrats', label: t('vratAndTyoharAlmanac'), count: vratsCount },
      { id: 'ekadashi', label: t('filterEkadashi'), count: ekadashiCount },
      { id: 'pradosh', label: t('filterPradosh'), count: pradoshCount },
      { id: 'purnima_amavasya', label: t('filterPurnimaAmavasya'), count: purnimaAmavasyaCount },
    ];
  }, [calendarDays, t]);

  // Filtered days list based on active filter tab
  const displayedDays = useMemo(() => {
    if (activeFilterTab === 'all') return calendarDays;
    if (activeFilterTab === 'major') {
      return calendarDays.filter(d => Boolean(d.festivalDetails?.isMajor));
    }
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
      
      {/* ── Top Header Bar: Unified Title, Month/Year Controls, Live & Location ── */}
      <div className="pb-3 border-b border-[#162038]">
        
        {/* Unified Title & Controls (Date, Year, Live near Vedic Calendar) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Title & Udaya Tithi Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <CalendarIcon size={18} />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight break-words min-w-0 leading-snug">
                {language === 'hi' ? 'मासिक वैदिक पञ्चाङ्ग एवं व्रत सारणी' : (language === 'sa' ? 'मासिकवैदिकपञ्चाङ्गम्' : (language === 'mr' ? 'मासिक वैदिक पंचांग व सण' : (language === 'gu' ? 'માસિક વૈદિક પંચાંગ અને વ્રત' : 'Unified Vedic Calendar & Vrat Almanac')))}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0 whitespace-nowrap">
                Udaya Tithi
              </span>
            </div>
          </div>

          {/* Controls: Date (Month 3-letters), Year, Live & Location pulled to top */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* Prev / Month (3 letters) / Year / Next Switcher */}
            <div className="flex items-center gap-1 bg-[#0e1629] p-0.5 rounded-xl border border-[#233152] shadow-sm">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-[#15223e] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                title={t('prevDay')}
                aria-label={t('prevDay')}
              >
                <ChevronLeft size={15} />
              </button>

              {/* Month Dropdown (Strictly 3 letters: Jan, Feb, Mar...) */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                aria-label="Select Month"
                className="px-2 py-1 bg-transparent hover:bg-[#15223e] rounded-lg text-xs font-bold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                className="px-1.5 py-1 bg-transparent hover:bg-[#15223e] rounded-lg text-xs font-bold text-orange-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                className="p-1.5 rounded-lg hover:bg-[#15223e] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                title={t('nextDay')}
                aria-label={t('nextDay')}
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Jump to Today Button ("Live") */}
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap flex items-center gap-1 shadow-sm"
              title="Jump to Current Month"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span>{t('live')}</span>
            </button>

            {/* Location Selector */}
            <div className="relative inline-flex items-center text-xs">
              <MapPin size={11} className="absolute left-2 text-orange-400 pointer-events-none" />
              <select
                value={location.name}
                onChange={(e) => {
                  const loc = PRESET_LOCATIONS.find(l => l.name === e.target.value);
                  if (loc) setLocation(loc);
                }}
                aria-label={t('selectCity')}
                className="pl-6 pr-5 py-1.5 bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] rounded-xl text-xs font-semibold text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
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

      </div>

      {/* ── Almanac Mode Filter Pills ── */}
      <div className="py-2.5 border-b border-[#162038] flex items-center gap-1.5 overflow-x-auto horizontal-tabs-scroll overscroll-x-contain">
        {(filterOptions ?? []).map((opt) => {
          const isActive = activeFilterTab === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActiveFilterTab(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-orange-500 text-white font-semibold border border-orange-500 shadow-md shadow-orange-500/25'
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
      <div className="mt-3 relative w-full overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] rounded-2xl border border-[#1a2542] bg-[#090e1a] shadow-xl">
        <table className="w-full min-w-[640px] sm:min-w-full border-collapse text-left">
          
          {/* ── Sticky Table Column Header Row (sticky top-0 z-20) ── */}
          <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] font-bold uppercase tracking-wider text-orange-300/90 shadow-sm select-none">
            <tr>
              {/* Col 1: Date & Day (Sticky Left) */}
              <th scope="col" className="sticky left-0 z-30 bg-[#0d1424] border-r border-[#1e2d4f] p-2.5 sm:p-3 text-center min-w-[76px] w-[76px] sm:w-[90px] whitespace-nowrap">
                <span>{t('colDateAndVara')}</span>
              </th>

              {/* Col 2: Paksha & Tithi */}
              <th scope="col" className="border-r border-[#1e2d4f] p-2.5 sm:p-3 text-left min-w-[170px] w-[170px] sm:w-[195px] pl-3.5 whitespace-nowrap">
                <span>{t('colTithiAndPaksha')}</span>
              </th>

              {/* Col 3: Masa */}
              <th scope="col" className="border-r border-[#1e2d4f] p-2.5 sm:p-3 text-left min-w-[110px] w-[110px] sm:w-[130px] pl-3.5 whitespace-nowrap">
                <span>{t('colMasa')}</span>
              </th>

              {/* Col 4: Observed & Dharma Shastra */}
              <th scope="col" className="p-2.5 sm:p-3 text-left min-w-[240px] w-[240px] sm:min-w-[260px] pl-3.5 whitespace-nowrap">
                <span>{t('colVratAndTyohar')}</span>
              </th>
            </tr>
          </thead>

          {/* ── Table Body Rows ── */}
          <tbody className="divide-y divide-[#162038] bg-[#090e1a]">
            {displayedDays.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-400 text-xs sm:text-sm">
                  <div className="space-y-3">
                    <p>{language === 'hi' ? 'इस श्रेणी में इस माह कोई दिवस नहीं मिला।' : 'No entries found in this category for this month.'}</p>
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('all')}
                      className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {t('allCalendarDays')}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              (displayedDays ?? []).map((day) => {
                const isToday = day.isToday;
                const isPurnima = day.udayaTithi.isPurnima;
                const isAmavasya = day.udayaTithi.isAmavasya;
                const isEkadashi = day.udayaTithi.isEkadashi;
                const isAshtami = day.udayaTithi.isAshtami;

                const weekdayShort = day.date.toLocaleDateString(localeCode, { weekday: 'short' });
                const monthShort = day.date.toLocaleDateString(localeCode, { month: 'short' });

                const normalizedTithiString = formatNormalizedPakshaTithi(
                  day.udayaTithi.paksha,
                  day.udayaTithi.name,
                  language,
                  day.udayaTithi.pureName
                );

                const cleanPurnimanta = cleanMasaMonthName(day.purnimantaMonth, language);
                const cleanAmanta = cleanMasaMonthName(day.amantaMonth, language);
                const tithiEndFormatted = formatTithiEndTime(day.tithiEndTime, language);

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

                // Determine Primary Observance for the OBSERVED column
                let observedTitle = '';
                let observedIcon = '🕉️';
                if (day.festival) {
                  observedTitle = translatedFestival || translateTerm(day.festival, language);
                  observedIcon = day.festivalDetails?.icon || '✨';
                } else if (isPurnima) {
                  observedTitle = language === 'hi' ? 'पूर्णिमा व्रत व स्नान-दान' : (language === 'sa' ? 'पूर्णिमाव्रतं स्नानदानं च' : (language === 'mr' ? 'पौर्णिमा व्रत व स्नान-दान' : (language === 'gu' ? 'પૂનમ વ્રત અને સ્નાન-દાન' : 'Purnima Vrat & Snan-Daan')));
                  observedIcon = '🌕';
                } else if (isAmavasya) {
                  observedTitle = language === 'hi' ? 'अमावस्या तर्पण व स्नान' : (language === 'sa' ? 'अमावास्या तर्पणं स्नानं च' : (language === 'mr' ? 'अमावस्या तर्पण व स्नान' : (language === 'gu' ? 'અમાસ તર્પણ અને સ્નાન' : 'Amavasya Tarpan & Snan')));
                  observedIcon = '🌑';
                } else if (isEkadashi) {
                  observedTitle = language === 'hi' ? 'एकादशी व्रत' : (language === 'sa' ? 'एकादशीव्रतम्' : (language === 'mr' ? 'एकादशी व्रत' : (language === 'gu' ? 'એકાદશી વ્રત' : 'Ekadashi Vrat')));
                  observedIcon = '✨';
                } else if (isAshtami) {
                  observedTitle = `${normalizedTithiString} ${t('tithi')}`;
                  observedIcon = '🔱';
                } else {
                  // Standard Tithi Observance, e.g. "Shukla- Panchami Tithi" / "शुक्ल- पञ्चमी तिथि"
                  observedTitle = `${normalizedTithiString} ${t('tithi')}`;
                  observedIcon = '🕉️';
                }

                return (
                  <tr
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
                    aria-label={`${day.dateFormatted}: ${normalizedTithiString}`}
                    className={`transition-colors hover:bg-[#10192e] active:bg-[#15203b] cursor-pointer group select-none relative ${
                      isToday ? 'bg-orange-500/10' : ''
                    }`}
                  >
                    {/* ── Col 1: Date & Day (Sticky Left) ── */}
                    <td className={`sticky left-0 z-10 bg-[#090e1a] group-hover:bg-[#10192e] border-r border-[#162038] p-2 sm:p-2.5 text-center align-middle min-w-[76px] w-[76px] sm:w-[90px] relative ${
                      isToday ? 'bg-[#151d30]' : ''
                    }`}>
                      {isToday && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 z-20" />
                      )}
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-lg sm:text-xl font-extrabold font-grotesk leading-none ${
                          isToday ? 'text-orange-400' : isPurnima ? 'text-amber-300' : isAmavasya ? 'text-indigo-300' : isEkadashi ? 'text-emerald-300' : 'text-neutral-100'
                        }`}>
                          {day.dayNumber}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-300 mt-1 leading-snug py-0.5 text-center whitespace-nowrap">
                          {weekdayShort}
                        </span>
                        <span className="text-[9px] text-neutral-500 leading-none text-center whitespace-nowrap">
                          {monthShort}
                        </span>
                        {isToday && (
                          <span className="mt-1 px-1.5 py-0.5 rounded bg-orange-500 text-white text-[8px] font-extrabold uppercase shrink-0 whitespace-nowrap shadow-sm">
                            {t('live')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ── Col 2: Paksha & Tithi ── */}
                    <td className="p-2.5 sm:p-3.5 border-r border-[#162038] align-middle min-w-[170px] w-[170px] sm:w-[195px] pl-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className={`font-bold text-xs sm:text-sm leading-snug whitespace-nowrap ${
                          isToday ? 'text-orange-400' : isPurnima ? 'text-amber-300' : isAmavasya ? 'text-indigo-300' : isEkadashi ? 'text-emerald-300' : 'text-neutral-100'
                        }`}>
                          {normalizedTithiString}
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

                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5 leading-snug whitespace-nowrap">
                        {tithiEndFormatted}
                      </div>
                    </td>

                    {/* ── Col 3: Lunar Masa ── */}
                    <td className="p-2.5 sm:p-3.5 border-r border-[#162038] align-middle min-w-[110px] w-[110px] sm:w-[130px] pl-3.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-amber-400/90 text-xs shrink-0 select-none">🌙</span>
                        <span className="text-xs sm:text-sm font-semibold text-neutral-200 whitespace-nowrap min-w-0">
                          {cleanPurnimanta}
                        </span>
                      </div>
                      {day.amantaMonth && day.amantaMonth !== day.purnimantaMonth && (
                        <div className="text-[10px] text-neutral-400 mt-0.5 whitespace-nowrap">
                          {t('amanta')}: <strong className="text-neutral-300 font-normal">{cleanAmanta}</strong>
                        </div>
                      )}
                    </td>

                    {/* ── Col 4: Observed & Dharma Shastra Rule ── */}
                    <td className="p-2.5 sm:p-3.5 align-middle min-w-[240px] w-[240px] sm:min-w-[260px] pl-3.5">
                      {/* Line 1: Observance Title */}
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        <span className="text-xs sm:text-sm shrink-0 select-none">{observedIcon}</span>
                        <span className="font-bold text-xs sm:text-sm text-amber-300 whitespace-nowrap">
                          {observedTitle}
                        </span>
                        {countdownBadge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0 whitespace-nowrap">
                            {countdownBadge}
                          </span>
                        )}
                      </div>

                      {/* Line 2: Dharma Shastra Rule Badge */}
                      <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10.5px] text-indigo-300 whitespace-nowrap">
                        <span className="font-semibold text-indigo-400 select-none">
                          {language === 'hi' ? '⚖️ शास्त्र:' : '⚖️ Shastra:'}
                        </span>
                        <span>{dharmaRule.ruleText}</span>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
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
                <div className="text-neutral-400 font-bold uppercase text-[10px]">{t('tithi')} • Udaya Tithi</div>
                <div className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                  <span className="break-words min-w-0">
                    {formatNormalizedPakshaTithi(
                      selectedDayDetail.udayaTithi.paksha,
                      selectedDayDetail.udayaTithi.name,
                      language,
                      selectedDayDetail.udayaTithi.pureName
                    )}
                  </span>
                  {selectedDayDetail.udayaTithi.isPurnima && <span className="shrink-0">🌕</span>}
                  {selectedDayDetail.udayaTithi.isAmavasya && <span className="shrink-0">🌑</span>}
                  {selectedDayDetail.udayaTithi.isEkadashi && <span className="shrink-0">✨</span>}
                  {selectedDayDetail.udayaTithi.isAshtami && <span className="shrink-0">🔱</span>}
                </div>
                <div className="text-amber-300 font-mono font-semibold pt-1 whitespace-nowrap">
                  ⏱️ {t('tithiEnds')}: {formatTithiEndTime(selectedDayDetail.tithiEndTime, language)}
                </div>
                <div className="text-[11px] text-neutral-400 break-words min-w-0 leading-relaxed">
                  Deity: <strong className="text-neutral-200">{selectedDayDetail.udayaTithi.deity}</strong> • Paksha: <strong className="text-neutral-200">{translateTerm(selectedDayDetail.udayaTithi.paksha, language)}</strong>
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
