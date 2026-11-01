"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Sparkles, Sun, Moon, MapPin, X, BookOpen, Compass
} from 'lucide-react';
import { 
  LocationCoordinates, 
  PRESET_LOCATIONS, 
  getMonthVedicCalendar, 
  MonthCalendarDay 
} from '../../src/lib/vedic-astronomy';
import { useLanguage } from '../../src/context/LanguageContext';

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
  const [selectedDayDetail, setSelectedDayDetail] = useState<MonthCalendarDay | null>(null);
  const { language, t, translateTerm, localeCode } = useLanguage();

  const todayRowRef = useRef<HTMLDivElement>(null);

  // Synchronize with initialLocation if changed from outside
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

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
  }, [currentMonth, currentYear]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // High-precision calendar days calculation for the month (memoized)
  const calendarDays = useMemo(() => {
    return getMonthVedicCalendar(currentYear, currentMonth, location);
  }, [currentYear, currentMonth, location]);

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
    <div className={`w-full bg-[#070b16] text-neutral-100 rounded-3xl border border-[#1a233a] shadow-2xl overflow-hidden font-sans ${embeddedInModal ? 'border-none p-0' : 'p-3 sm:p-6'}`}>
      
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162038]">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
            <CalendarIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {language === 'hi' ? 'मासिक वैदिक पञ्चाङ्ग' : (language === 'sa' ? 'मासिकवैदिकपञ्चाङ्गम्' : (language === 'mr' ? 'मासिक वैदिक पंचांग' : (language === 'gu' ? 'માસિક વૈદિક પંચાંગ' : 'Monthly Vedic Calendar')))}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Udaya Tithi
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {monthNames[currentMonth]} {currentYear} • Nirayana Lahiri • {location.name}
            </p>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative inline-flex items-center text-xs">
            <MapPin size={12} className="absolute left-2.5 text-orange-400 pointer-events-none" />
            <select
              value={location.name}
              onChange={(e) => {
                const loc = PRESET_LOCATIONS.find(l => l.name === e.target.value);
                if (loc) setLocation(loc);
              }}
              aria-label={t('selectCity')}
              className="pl-7 pr-6 py-1.5 bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] rounded-xl text-xs font-semibold text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500"
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

      {/* ── Navigation & Selectors Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-3 border-b border-[#162038]">
        
        {/* Prev / Month / Year / Next */}
        <div className="flex flex-wrap items-center gap-2">
          <button
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
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-[#0e1629] hover:bg-[#15223e] border border-[#233152] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title={t('nextDay')}
            aria-label={t('nextDay')}
          >
            <ChevronRight size={16} />
          </button>

          {/* Quick Jump to Today */}
          <button
            onClick={handleResetToCurrentMonth}
            className="px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            {t('live')}
          </button>
        </div>

        {/* Legend Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-neutral-400">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300">
            🌕 Purnima
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
            🌑 Amavasya
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            ✨ Ekadashi
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-300">
            🔱 Ashtami
          </span>
        </div>

      </div>

      {/* ── Chronological List View (Sole Canonical View - List-Only Everywhere) ── */}
      <div className="mt-3 rounded-2xl border border-[#1e2942] bg-[#090e1a] divide-y divide-[#162038] overflow-hidden max-h-[82dvh] overflow-y-auto touch-pan-y overscroll-contain pb-20">
        {calendarDays.map((day) => {
          const isToday = day.isToday;
          const isPurnima = day.udayaTithi.isPurnima;
          const isAmavasya = day.udayaTithi.isAmavasya;
          const isEkadashi = day.udayaTithi.isEkadashi;
          const isAshtami = day.udayaTithi.isAshtami;

          const weekdayShort = day.date.toLocaleDateString(localeCode, { weekday: 'short' });
          const monthShort = day.date.toLocaleDateString(localeCode, { month: 'short' });

          const translatedTithiName = translateTerm(day.udayaTithi.name, language);
          const translatedNakshatra = translateTerm(day.nakshatra.name, language);
          const translatedFestival = day.festival ? translateTerm(day.festival, language) : null;

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
              className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 sm:gap-4 transition-all cursor-pointer hover:bg-[#11192e] group select-none ${
                isToday 
                  ? 'border-l-4 border-l-orange-500 border-orange-500/50 bg-orange-500/10' 
                  : isPurnima
                  ? 'bg-amber-500/5 hover:bg-amber-500/10'
                  : isAmavasya
                  ? 'bg-indigo-500/5 hover:bg-indigo-500/10'
                  : isEkadashi
                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                  : ''
              }`}
            >
              {/* Left: Compact Date Badge */}
              <div className={`flex flex-col items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-xl border shrink-0 text-center transition-colors ${
                isToday
                  ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                  : isPurnima
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : isAmavasya
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                  : isEkadashi
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#0e1629] border-[#233152] text-white group-hover:border-orange-500/40'
              }`}>
                <span className="text-sm sm:text-base font-extrabold leading-none">
                  {day.dayNumber}
                </span>
                <span className="text-[10px] font-semibold text-neutral-400 mt-0.5 leading-none">
                  {weekdayShort}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono mt-0.5 leading-none">
                  {monthShort}
                </span>
              </div>

              {/* Center: Primary Tithi name, Nakshatra, and end timings */}
              <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs sm:text-sm font-bold truncate ${
                    isToday ? 'text-orange-400' : isPurnima ? 'text-amber-300' : isAmavasya ? 'text-indigo-300' : isEkadashi ? 'text-emerald-300' : 'text-white'
                  }`}>
                    {translatedTithiName}
                  </span>

                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                    day.udayaTithi.paksha === 'Shukla'
                      ? 'bg-orange-500/15 text-orange-300 border border-orange-500/25'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                  }`}>
                    {day.udayaTithi.paksha}
                  </span>

                  {day.udayaTithi.isVriddhiTithi && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Vriddhi
                    </span>
                  )}
                  {day.udayaTithi.isKshayaTithi && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Kshaya
                    </span>
                  )}
                  {isToday && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-orange-500 text-white">
                      {t('live')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400 flex-wrap">
                  <span>{t('nakshatra')}: <strong className="text-neutral-300">{translatedNakshatra}</strong></span>
                  <span>•</span>
                  <span>{t('tithiEnds')}: <strong className="text-amber-300 font-mono">{day.tithiEndTime}</strong></span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline font-mono">🌅 {day.sunrise}</span>
                </div>
              </div>

              {/* Right: Any Vrat/Tyohar badge and a subtle chevron (›) */}
              <div className="flex items-center gap-2 shrink-0">
                {translatedFestival ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 max-w-[120px] sm:max-w-[180px] truncate">
                    <Sparkles size={11} className="text-amber-400 shrink-0" />
                    <span className="truncate">{translatedFestival}</span>
                  </span>
                ) : isPurnima ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    🌕 Purnima
                  </span>
                ) : isAmavasya ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    🌑 Amavasya
                  </span>
                ) : isEkadashi ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ✨ Ekadashi
                  </span>
                ) : isAshtami ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                    🔱 Ashtami
                  </span>
                ) : null}

                <span className="text-neutral-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all text-sm font-bold">
                  ›
                </span>
              </div>
            </div>
          );
        })}
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
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                  Vedic Astrometry &amp; Observance Details
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {selectedDayDetail.dateFormatted} ({selectedDayDetail.dayOfWeek})
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1e2b4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title={t('close')}
                aria-label={t('close')}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] p-4 sm:p-6 space-y-3.5 text-xs pb-10">
              
              {/* Sacred Festival / Vrat Details Card */}
              {selectedDayDetail.festival && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#0e172a] to-orange-500/15 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>{t('vedicObservance')}</span>
                    </span>
                    {selectedDayDetail.festivalDetails?.badge && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {selectedDayDetail.festivalDetails.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xl shrink-0 select-none">
                      {selectedDayDetail.festivalDetails?.icon || '🕉️'}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        {translateTerm(selectedDayDetail.festival, language)}
                      </h4>
                      {selectedDayDetail.festivalDetails?.description && (
                        <p className="text-[11px] text-neutral-300 mt-0.5">
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
                            <BookOpen size={11} className="text-amber-400" />
                            {t('shastraRuleHeader')}:
                          </span>
                        </div>
                        <p className="text-neutral-200 leading-relaxed text-xs">
                          {language === 'hi'
                            ? (selectedDayDetail.festivalDetails.briefRule.hindi || selectedDayDetail.festivalDetails.description)
                            : (selectedDayDetail.festivalDetails.briefRule.english || selectedDayDetail.festivalDetails.description)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDayDetail.festivalDetails?.shastraReferences && selectedDayDetail.festivalDetails.shastraReferences.length > 0 && (
                    <div className="text-[10px] text-amber-300/80 font-mono flex items-center gap-1 pt-1">
                      <span>📜 {t('references')}:</span>
                      <span>{selectedDayDetail.festivalDetails.shastraReferences.join(' • ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Udaya Tithi Card */}
              <div className="p-3.5 rounded-2xl bg-[#0e1629] border border-[#1e2942] space-y-1.5">
                <div className="text-neutral-400 font-bold uppercase text-[10px]">{t('tithi')} (Udaya Tithi)</div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span>{translateTerm(selectedDayDetail.udayaTithi.name, language)}</span>
                  {selectedDayDetail.udayaTithi.isPurnima && <span>🌕</span>}
                  {selectedDayDetail.udayaTithi.isAmavasya && <span>🌑</span>}
                  {selectedDayDetail.udayaTithi.isEkadashi && <span>✨</span>}
                  {selectedDayDetail.udayaTithi.isAshtami && <span>🔱</span>}
                </div>
                <div className="text-amber-300 font-mono font-semibold pt-1">
                  ⏱️ {t('tithiEnds')}: {selectedDayDetail.tithiEndTime}
                </div>
                <div className="text-[11px] text-neutral-400">
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
                    <p className="text-[11px] text-neutral-300">
                      <strong>{selectedDayDetail.udayaTithi.kshayaTithiDetails?.name || 'Tithi'}</strong> began after yesterday&apos;s sunrise and ended before today&apos;s sunrise.
                    </p>
                  </div>
                )}
              </div>

              {/* 5-Limbs Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">2. {t('nakshatra')}</div>
                  <div className="font-bold text-white text-sm mt-0.5">{translateTerm(selectedDayDetail.nakshatra.name, language)}</div>
                  <div className="text-[10px] text-neutral-400">Lord: {selectedDayDetail.nakshatra.lord}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">3. {t('yoga')}</div>
                  <div className="font-bold text-white text-sm mt-0.5">{translateTerm(selectedDayDetail.yoga.name, language)}</div>
                  <div className="text-[10px] text-emerald-400">{selectedDayDetail.yoga.nature}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0e1629] border border-[#1e2942]">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">4. {t('karana')}</div>
                  <div className="font-bold text-white text-sm mt-0.5">{translateTerm(selectedDayDetail.karana.name, language)}</div>
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
                  <span>{t('shastraRuleHeader')}:</span>
                </div>
                {language === 'hi'
                  ? `स्थानीय सूर्योदय (${selectedDayDetail.sunrise}) के समय उपस्थित औदयिक तिथि ही दैनिक संकल्प, पूजा एवं धार्मिक कृत्यों हेतु शास्त्रसम्मत आधार है।`
                  : `The Udaya Tithi at local sunrise (${selectedDayDetail.sunrise}) is the sole canonical authority for daily Sankalpa, Pujas, and religious observances.`
                }
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-[#1e2942] bg-[#0c1222] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-neutral-400 font-mono">
                {t('shastraAuthority')}
              </span>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors cursor-pointer active:scale-95 shadow-md"
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
