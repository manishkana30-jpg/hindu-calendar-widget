"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Sparkles, Clock, Calendar
} from 'lucide-react';
import { LocationCoordinates } from '../../../src/lib/vedic-astronomy';
import { 
  ShubhKaryaCategory, 
  DayMuhuratItem, 
  calculateMonthlyMuhurat 
} from '../../../src/lib/panchang/monthlyMuhuratEngine';
import { useLanguage } from '../../../src/context/LanguageContext';
import { translateTerm as translateTermRaw, TranslationDictionary } from '../../../src/lib/i18n/translations';
import { WhatsAppIcon } from '../WhatsAppShareButton';

interface MonthlyMuhuratModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  initialCategory?: ShubhKaryaCategory;
}

const KARYA_FILTER_TABS: { id: ShubhKaryaCategory; labelKey: keyof TranslationDictionary; icon: string }[] = [
  { id: 'all', labelKey: 'filterAllActivities', icon: '✨' },
  { id: 'property', labelKey: 'filterPropertyPurchase', icon: '🏠' },
  { id: 'construction', labelKey: 'filterConstructionBhoomi', icon: '🏗️' },
  { id: 'griha_pravesh', labelKey: 'filterGrihaPravesh', icon: '🚪' },
  { id: 'vehicle', labelKey: 'filterVehiclePurchase', icon: '🚗' },
  { id: 'business', labelKey: 'filterBusinessOpening', icon: '💼' },
  { id: 'gold', labelKey: 'filterGoldPurchase', icon: '🪙' },
  { id: 'marriage', labelKey: 'filterMarriageSanskar', icon: '💍' },
];

export function MonthlyMuhuratModal({
  isOpen,
  onClose,
  location,
  selectedDate,
  onSelectDate,
  initialCategory = 'all'
}: MonthlyMuhuratModalProps) {
  const { language, t, translateTerm, localeCode } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<ShubhKaryaCategory>(initialCategory);
  const [showOnlyAuspicious, setShowOnlyAuspicious] = useState<boolean>(true);
  const [viewMonthYear, setViewMonthYear] = useState<{ year: number; month: number }>(() => ({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth() + 1
  }));

  // Reset to selectedDate when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewMonthYear({
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1
      });
      setSelectedCategory(initialCategory);
    }
  }, [isOpen, selectedDate, initialCategory]);

  // Mobile scroll lock safety
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-scroll to selected or today row when modal opens
  useEffect(() => {
    if (isOpen && selectedRowRef.current) {
      const timer = setTimeout(() => {
        selectedRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, viewMonthYear]);

  // Calculate monthly Muhurat days
  const monthlyMuhuratList = useMemo(() => {
    return calculateMonthlyMuhurat(viewMonthYear.year, viewMonthYear.month, location);
  }, [viewMonthYear.year, viewMonthYear.month, location]);

  // Filter list by category and auspiciousness
  const filteredDays = useMemo(() => {
    let list = monthlyMuhuratList;

    if (showOnlyAuspicious) {
      list = list.filter(item => item.isAuspiciousDay);
    }

    if (selectedCategory !== 'all') {
      list = list.filter(item => 
        item.auspiciousActivities.some(a => a.category === selectedCategory)
      );
    }

    return list;
  }, [monthlyMuhuratList, selectedCategory, showOnlyAuspicious]);

  const monthLabel = useMemo(() => {
    const d = new Date(viewMonthYear.year, viewMonthYear.month - 1, 1);
    return d.toLocaleDateString(localeCode, { month: 'long', year: 'numeric' });
  }, [viewMonthYear, localeCode]);

  const handlePrevMonth = () => {
    setViewMonthYear(prev => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewMonthYear(prev => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleResetToday = () => {
    const now = new Date();
    setViewMonthYear({ year: now.getFullYear(), month: now.getMonth() + 1 });
  };

  const handleShareDayMuhurat = useCallback((item: DayMuhuratItem) => {
    const activitiesStr = item.auspiciousActivities.map(a => `${a.icon} ${language === 'hi' ? a.hindiName : a.name}`).join(', ');
    const yogasStr = item.specialYogas.length > 0 ? `\n✨ *Special Yogas:* ${item.specialYogas.map(y => translateTermRaw(y, language)).join(', ')}` : '';
    const monthShort = new Date(item.year, item.month - 1, 1).toLocaleDateString(localeCode, { month: 'short' });
    
    const text = `🌸 *Shubh Muhurat Alert* 🌸\n📅 *Date:* ${item.dayNumber} ${monthShort} ${item.year} (${item.weekdayLong})\n🪷 *Tithi:* ${translateTermRaw(item.tithiName, language)}\n⭐ *Nakshatra:* ${translateTermRaw(item.nakshatraName, language)}\n🎯 *Auspicious For:* ${activitiesStr || 'General Observances'}${yogasStr}\n⏰ *Best Timings:* ${item.bestTimeWindowsString}\n⚠️ *Rahu Kaal (Avoid):* ${item.rahuKaalString}\n📍 *Location:* ${location.name}\n🔗 https://dailytithi.com`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [language, localeCode, location.name]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('monthlyMuhuratCalendarTitle')}
    >
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90dvh] sm:max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#1e2d4f] bg-[#090e1a] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative text-slate-200"
      >
        {/* ── 1. Modal Header (Pinned at Top) ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#1e2d4f] bg-[#0c1222] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-outfit text-white tracking-tight truncate">
                  {t('monthlyMuhuratCalendarTitle')}
                </h2>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-serif font-devanagari font-semibold hidden sm:inline shrink-0">
                  धर्मशास्त्र सम्मत
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans truncate">
                {location.name} • {language === 'hi' ? 'गृह, वाहन, व्यापार, विवाह एवं संपत्ति' : 'Griha, Property, Vehicle, Business & Vivah'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="p-1.5 rounded-xl bg-[#11192e] hover:bg-[#18233d] border border-[#233152] text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 2. Month Navigation & Auspicious Toggle ── */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0b101e] border-b border-[#162038] flex items-center justify-between gap-2 shrink-0">
          {/* Month Switcher */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label={t('prevDay')}
              className="p-1.5 rounded-xl bg-[#11192e] hover:bg-[#18233d] border border-[#233152] text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-white text-xs sm:text-sm font-outfit px-1">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label={t('nextDay')}
              className="p-1.5 rounded-xl bg-[#11192e] hover:bg-[#18233d] border border-[#233152] text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Right Controls: Today Reset & Auspicious Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleResetToday}
              className="px-2.5 py-1 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              <span>{t('today')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOnlyAuspicious(prev => !prev)}
              className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition-all cursor-pointer active:scale-95 ${
                showOnlyAuspicious
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                  : 'bg-[#11192e] text-neutral-400 border-[#233152] hover:text-white'
              }`}
            >
              {showOnlyAuspicious ? t('showOnlyAuspiciousDays') : t('showAllDaysOfMonth')}
            </button>
          </div>
        </div>

        {/* ── 3. Purpose Filter Pills (Horizontally Scrollable) ── */}
        <div className="px-4 sm:px-6 py-2 bg-[#090e1a] border-b border-[#162038] flex items-center gap-1.5 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] shrink-0">
          {KARYA_FILTER_TABS.map(tab => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold font-outfit transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-1 ring-orange-400'
                    : 'bg-[#11192e] text-slate-300 hover:text-white hover:bg-[#18233d] border border-[#233152]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* ── 4. 2D Scrollable Table Container ── */}
        <div className="relative flex-1 w-full overflow-x-auto overflow-y-auto overscroll-contain touch-pan-x touch-pan-y [-webkit-overflow-scrolling:touch] pb-4">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] font-bold uppercase tracking-wider text-orange-300/90 shadow-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-[#0d1424] px-3.5 py-3 whitespace-nowrap border-r border-[#162038]">
                  {t('colDateVara')}
                </th>
                <th className="px-3.5 py-3 whitespace-nowrap">{t('colPurposeKarya')}</th>
                <th className="px-3.5 py-3 whitespace-nowrap">{t('colAuspiciousWindow')}</th>
                <th className="px-3.5 py-3 whitespace-nowrap">{t('colTithiNakshatra')}</th>
                <th className="px-3.5 py-3 whitespace-nowrap">{t('colRahuKaalAvoid')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162038] text-xs sm:text-sm">
              {filteredDays.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-sans">
                    {t('noAuspiciousDaysFound')}
                  </td>
                </tr>
              ) : (
                filteredDays.map((item) => {
                  const isSelected = item.date.toDateString() === selectedDate.toDateString();
                  const monthShort = new Date(item.year, item.month - 1, 1).toLocaleDateString(localeCode, { month: 'short' });

                  return (
                    <tr
                      key={item.dateKey}
                      ref={isSelected ? selectedRowRef : null}
                      onClick={() => {
                        onSelectDate(item.date);
                        onClose();
                      }}
                      className={`transition-colors cursor-pointer group/row ${
                        isSelected 
                          ? 'bg-blue-600/15 border-l-4 border-l-blue-500 font-semibold text-white' 
                          : item.isToday 
                          ? 'bg-orange-500/10 border-l-4 border-l-orange-500 hover:bg-orange-500/15 text-slate-200' 
                          : 'hover:bg-[#11192e]/60 text-slate-300'
                      }`}
                    >
                      {/* Col 1: Date & Vara (Pinned sticky left for stable mobile horizontal scroll) */}
                      <td className="sticky left-0 z-10 bg-[#090e1a] group-hover/row:bg-[#11192e] px-3.5 py-3 whitespace-nowrap border-r border-[#162038]">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono ${
                            item.isToday 
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 ring-1 ring-orange-500/30' 
                              : isSelected 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                              : 'bg-[#11192e] text-white border border-[#233152]'
                          }`}>
                            <span className="text-xs font-extrabold leading-none">{String(item.dayNumber).padStart(2, '0')}</span>
                            <span className="text-[9px] font-semibold text-neutral-400 uppercase mt-0.5">{item.weekdayShort}</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white font-sans">
                              {monthShort} {item.year}
                            </div>
                            {item.isToday ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                {t('today')}
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-400">
                                {item.weekdayLong}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Shubh Karya / Purpose */}
                      <td className="px-3.5 py-3">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-[280px]">
                          {item.auspiciousActivities.map(act => (
                            <span 
                              key={act.category}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${act.colorClass}`}
                            >
                              <span>{act.icon}</span>
                              <span>{language === 'hi' ? act.hindiName : act.name}</span>
                            </span>
                          ))}
                          {item.specialYogas.map(yoga => (
                            <span
                              key={yoga}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm"
                            >
                              <span>✨</span>
                              <span>{translateTerm(yoga)}</span>
                            </span>
                          ))}
                          {!item.isAuspiciousDay && (
                            <span className="text-[11px] text-slate-500 font-sans italic">
                              {item.isRiktaTithi 
                                ? (language === 'hi' ? 'रिक्ता तिथि' : 'Rikta Tithi') 
                                : item.isAmavasya 
                                ? (language === 'hi' ? 'अमावस्या' : 'Amavasya')
                                : item.isBhadra 
                                ? (language === 'hi' ? 'भद्रा / विष्टि' : 'Bhadra / Vishti')
                                : (language === 'hi' ? 'सामान्य दिवस' : 'General Day')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Col 3: Auspicious Time Window */}
                      <td className="px-3.5 py-3 whitespace-nowrap font-mono text-xs font-semibold tabular-nums">
                        {item.bestTimeWindowsString !== '—' ? (
                          <span className="text-emerald-300">
                            {item.bestTimeWindowsString}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-sans text-[11px]">
                            {t('noAuspiciousWindow')}
                          </span>
                        )}
                      </td>

                      {/* Col 4: Tithi & Nakshatra */}
                      <td className="px-3.5 py-3 whitespace-nowrap text-xs">
                        <div className="font-semibold text-white font-devanagari">
                          {translateTerm(item.tithiName)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {translateTerm(item.nakshatraName)} • {translateTerm(item.yogaName)}
                        </div>
                      </td>

                      {/* Col 5: Rahu Kaal (Avoid) + WhatsApp Share */}
                      <td className="px-3.5 py-3 whitespace-nowrap text-xs">
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="font-mono text-rose-300/80 tabular-nums">
                            {item.rahuKaalString}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareDayMuhurat(item);
                            }}
                            title={t('shareMuhuratWhatsApp')}
                            aria-label={t('shareMuhuratWhatsApp')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── 5. Modal Footer Note ── */}
        <div className="px-4 py-2.5 border-t border-[#1e2d4f] bg-[#0c1222] flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="font-sans text-[10px] text-slate-400 truncate">
            {language === 'hi' ? 'किसी भी दिन पर क्लिक करके उसे मुख्य पंचांग में चुनें' : 'Click any date row to select that day in the main Panchang'}
          </span>
          <span className="font-mono text-[10px] text-amber-300 shrink-0 ml-2">
            {filteredDays.length} {language === 'hi' ? 'दिन' : 'days'}
          </span>
        </div>
      </div>
    </div>
  );
}
