"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  Flag,
  Award,
  CalendarDays
} from 'lucide-react';
import { useLanguage } from '../../../src/context/LanguageContext';
import { 
  getMonthlyHolidays, 
  MonthHolidayItem 
} from '../../../src/lib/eclipses-and-holidays';
import { LocationCoordinates } from '../../../src/lib/vedic-astronomy';

interface GregorianCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  location: LocationCoordinates;
}

const WEEKDAYS = [
  { key: 'sunday', en: 'Sun', hi: 'रवि', sa: 'रवि', mr: 'रवि', gu: 'રવિ' },
  { key: 'monday', en: 'Mon', hi: 'सोम', sa: 'सोम', mr: 'सोम', gu: 'સોમ' },
  { key: 'tuesday', en: 'Tue', hi: 'मंगल', sa: 'भौम', mr: 'मंगळ', gu: 'મંગળ' },
  { key: 'wednesday', en: 'Wed', hi: 'बुध', sa: 'बुध', mr: 'बुध', gu: 'બુધ' },
  { key: 'thursday', en: 'Thu', hi: 'गुरु', sa: 'गुरु', mr: 'गुरू', gu: 'ગુરુ' },
  { key: 'friday', en: 'Fri', hi: 'शुक्र', sa: 'शुक्र', mr: 'शुक्र', gu: 'શુક્ર' },
  { key: 'saturday', en: 'Sat', hi: 'शनि', sa: 'शनि', mr: 'शनि', gu: 'શનિ' },
];

export function GregorianCalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  location
}: GregorianCalendarModalProps) {
  const { language, t, translateTerm, localeCode } = useLanguage();

  const [viewYear, setViewYear] = useState<number>(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => selectedDate.getMonth() + 1); // 1-12

  // Synchronize viewing month & year when modal opens or selectedDate changes
  useEffect(() => {
    if (isOpen) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth() + 1);
    }
  }, [isOpen, selectedDate]);

  // Lock background body scroll strictly while modal is open
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

  // Today reference
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1; // 1-12
  const todayDateNum = now.getDate();

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedDateNum = selectedDate.getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
    const todayTarget = new Date(todayYear, todayMonth - 1, todayDateNum, 6, 0, 0);
    onSelectDate(todayTarget);
  };

  // Month name display
  const monthName = useMemo(() => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    try {
      return d.toLocaleDateString(localeCode, { month: 'long' });
    } catch {
      return d.toLocaleDateString('en-US', { month: 'long' });
    }
  }, [viewYear, viewMonth, localeCode]);

  // Monthly Holidays list
  const monthlyHolidays = useMemo(() => {
    return getMonthlyHolidays(viewYear, viewMonth, location);
  }, [viewYear, viewMonth, location]);

  // Map of holidays by dayNumber for fast lookup
  const holidayMapByDay = useMemo(() => {
    const map = new Map<number, MonthHolidayItem[]>();
    for (const h of monthlyHolidays) {
      const arr = map.get(h.dayNumber) || [];
      arr.push(h);
      map.set(h.dayNumber, arr);
    }
    return map;
  }, [monthlyHolidays]);

  // Calendar grid calculations
  const gridDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1);
    const startWeekday = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = new Date(viewYear, viewMonth, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

    const cells: {
      type: 'prev' | 'current' | 'next';
      dayNum: number;
      date: Date;
      isToday: boolean;
      isSelected: boolean;
      isSunday: boolean;
      holidays: MonthHolidayItem[];
    }[] = [];

    // Leading padding cells from previous month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(viewYear, viewMonth - 2, d, 6, 0, 0);
      cells.push({
        type: 'prev',
        dayNum: d,
        date: prevDate,
        isToday: false,
        isSelected: false,
        isSunday: cells.length % 7 === 0,
        holidays: []
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dayDate = new Date(viewYear, viewMonth - 1, d, 6, 0, 0);
      const isToday = viewYear === todayYear && viewMonth === todayMonth && d === todayDateNum;
      const isSelected = viewYear === selectedYear && viewMonth === selectedMonth && d === selectedDateNum;
      const isSunday = (startWeekday + d - 1) % 7 === 0;
      const holidays = holidayMapByDay.get(d) || [];

      cells.push({
        type: 'current',
        dayNum: d,
        date: dayDate,
        isToday,
        isSelected,
        isSunday,
        holidays
      });
    }

    // Trailing padding cells to complete final row
    const remainder = cells.length % 7;
    if (remainder > 0) {
      const fillCount = 7 - remainder;
      for (let d = 1; d <= fillCount; d++) {
        const nextDate = new Date(viewYear, viewMonth, d, 6, 0, 0);
        cells.push({
          type: 'next',
          dayNum: d,
          date: nextDate,
          isToday: false,
          isSelected: false,
          isSunday: cells.length % 7 === 0,
          holidays: []
        });
      }
    }

    return cells;
  }, [viewYear, viewMonth, todayYear, todayMonth, todayDateNum, selectedYear, selectedMonth, selectedDateNum, holidayMapByDay]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gregorian-modal-title"
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-none sm:max-w-2xl h-dvh sm:h-[88dvh] max-h-dvh sm:max-h-[88dvh] bg-[#090e1a] border-0 sm:border border-[#233152] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 id="gregorian-modal-title" className="text-base sm:text-lg font-extrabold text-white">
                {t('gregorianCalendarTitle')}
              </h2>
              <p className="text-xs text-neutral-400 font-medium">
                {monthName} {viewYear} • {location.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={t('close')}
            className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Month Switcher & Quick Navigation Bar */}
        <div className="p-3 sm:px-5 bg-[#0c1222] border-b border-[#1a233a] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label={t('prevDay')}
              className="p-1.5 sm:p-2 rounded-xl bg-[#11192e] hover:bg-[#18233d] border border-[#233152] text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label={t('nextDay')}
              className="p-1.5 sm:p-2 rounded-xl bg-[#11192e] hover:bg-[#18233d] border border-[#233152] text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="text-center font-bold text-white text-sm sm:text-base tracking-wide font-outfit">
            {monthName} <span className="text-blue-400 font-mono">{viewYear}</span>
          </div>

          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
            <span>{t('today')}</span>
          </button>
        </div>

        {/* Scrollable Body: Calendar Grid + Monthly Holidays List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-5 pb-36 sm:pb-28 mb-safe space-y-5 [-webkit-overflow-scrolling:touch]">
          
          {/* Calendar Grid Container */}
          <div className="bg-[#080d1a] border border-[#1e2942] rounded-2xl p-2.5 sm:p-4 shadow-inner">
            
            {/* Weekday Labels Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEKDAYS.map((wd, idx) => {
                const label = wd[language as keyof typeof wd] || wd.en;
                const isSun = idx === 0;
                return (
                  <div
                    key={wd.key}
                    className={`py-1 text-[11px] sm:text-xs font-bold tracking-wider uppercase ${
                      isSun ? 'text-rose-400' : 'text-neutral-400'
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Calendar Days 7-Column Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {gridDays.map((cell, idx) => {
                const isCurrentMonth = cell.type === 'current';
                const hasHoliday = cell.holidays.length > 0;
                const hasGazetted = cell.holidays.some(h => h.isGazetted);

                if (!isCurrentMonth) {
                  return (
                    <div
                      key={`pad-${idx}`}
                      className="min-h-[46px] sm:min-h-[58px] p-1 rounded-xl bg-transparent text-neutral-600 flex flex-col items-center justify-center opacity-30 select-none"
                    >
                      <span className="text-xs sm:text-sm font-mono">{cell.dayNum}</span>
                    </div>
                  );
                }

                // Cell styling
                let cellClasses = 'min-h-[46px] sm:min-h-[58px] p-1 rounded-xl transition-all flex flex-col items-center justify-between cursor-pointer active:scale-95 relative ';
                if (cell.isSelected) {
                  cellClasses += 'bg-blue-600/25 border border-blue-400 text-white ring-2 ring-blue-500/50 shadow-md shadow-blue-500/20';
                } else if (cell.isToday) {
                  cellClasses += 'bg-orange-500/20 border border-orange-400 text-orange-200 ring-2 ring-orange-500/50 font-bold';
                } else if (cell.isSunday) {
                  cellClasses += 'bg-[#0f172a] hover:bg-[#152038] border border-rose-900/30 text-rose-300';
                } else {
                  cellClasses += 'bg-[#0c1324] hover:bg-[#141e36] border border-[#1b2640] text-neutral-200';
                }

                return (
                  <button
                    key={`day-${cell.dayNum}`}
                    onClick={() => {
                      onSelectDate(cell.date);
                      onClose();
                    }}
                    className={cellClasses}
                    title={cell.holidays.map(h => h.title).join(', ') || undefined}
                  >
                    {/* Date Number */}
                    <div className="w-full flex items-center justify-between px-1">
                      <span className={`text-xs sm:text-sm font-mono font-bold leading-none ${
                        cell.isSelected ? 'text-white' : cell.isToday ? 'text-orange-300' : cell.isSunday ? 'text-rose-400' : 'text-neutral-200'
                      }`}>
                        {cell.dayNum}
                      </span>
                      {cell.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                      )}
                    </div>

                    {/* Holiday Indicators */}
                    <div className="w-full flex items-center justify-center gap-0.5 mt-0.5 min-h-[14px]">
                      {hasHoliday ? (
                        <div className="flex items-center gap-0.5 max-w-full overflow-hidden">
                          {hasGazetted ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                          )}
                          <span className="text-[9px] sm:text-[10px] text-neutral-300 truncate hidden sm:inline max-w-[45px]">
                            {translateTerm(cell.holidays[0].title)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Legend Bar */}
            <div className="mt-3 pt-2.5 border-t border-[#18233d] flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span>{t('today')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span className="text-rose-300">{t('gazettedHoliday')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-amber-300">{t('publicHoliday')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Holidays Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-400 shrink-0" />
                <span>{t('holidaysInMonth')} {monthName} {viewYear}</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono font-bold">
                {monthlyHolidays.length}
              </span>
            </div>

            {monthlyHolidays.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#0c1324] border border-[#1b2640] text-center text-xs text-neutral-400">
                {t('noHolidaysInMonth')}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#1e2942] bg-[#080d1a] divide-y divide-[#162038] overflow-hidden">
                {monthlyHolidays.map((item, index) => {
                  const isItemDateSelected = 
                    selectedYear === viewYear && 
                    selectedMonth === viewMonth && 
                    selectedDateNum === item.dayNumber;

                  const holidayTitle = translateTerm(item.title);
                  
                  return (
                    <div
                      key={`holiday-${index}-${item.dateKey}`}
                      onClick={() => {
                        onSelectDate(item.date);
                        onClose();
                      }}
                      className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer hover:bg-[#121c33] active:bg-[#152340] ${
                        isItemDateSelected ? 'bg-blue-950/30' : ''
                      }`}
                    >
                      {/* Left: Date Badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-[#233152] flex flex-col items-center justify-center text-center p-0.5">
                          <span className="text-xs font-bold text-white font-mono leading-none">
                            {String(item.dayNumber).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5 w-full truncate text-center">
                            {item.date.toLocaleDateString(localeCode, { weekday: 'short' })}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                            <span>{item.icon}</span>
                            <span>{holidayTitle}</span>
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {/* Right: Badge & Jump CTA */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          item.type === 'Gazetted'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : item.type === 'Public'
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                            : item.type === 'Religious'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                        }`}>
                          {item.type === 'Gazetted'
                            ? t('gazettedHoliday')
                            : item.type === 'Public'
                            ? t('publicHoliday')
                            : t('observanceHoliday')}
                        </span>
                        <ChevronRight size={16} className="text-neutral-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#0a0f1d] border-t border-[#1a233a] flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span className="text-[11px] text-neutral-400">
            {t('tapGregorianCalendar').replace('›', '').trim()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#141e36] hover:bg-[#1c2a4d] border border-[#233152] text-neutral-200 hover:text-white font-bold transition-all cursor-pointer"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
}

