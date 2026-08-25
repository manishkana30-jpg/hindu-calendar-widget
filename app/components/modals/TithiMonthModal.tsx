"use client";

import React, { useState } from 'react';
import { X, Calendar, BookOpen, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { generateMonthTithiCalendar, MonthTithiDay } from '../../../src/lib/dharmashastra-rules';
import { LocationCoordinates } from '../../../src/lib/vedic-astronomy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
}

export function TithiMonthModal({ isOpen, onClose, location }: Props) {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // August (0-indexed 7)

  if (!isOpen) return null;

  const monthNames = [
    'January (पौष/माघ)', 'February (माघ/फाल्गुन)', 'March (फाल्गुन/चैत्र)',
    'April (चैत्र/वैशाख)', 'May (वैशाख/ज्येष्ठ)', 'June (ज्येष्ठ/आषाढ़)',
    'July (आषाढ़/श्रावण)', 'August (श्रावण/भाद्रपद)', 'September (भाद्रपद/अश्विन)',
    'October (अश्विन/कार्तिक)', 'November (कार्तिक/मार्गशीर्ष)', 'December (मार्गशीर्ष/पौष)'
  ];

  const days: MonthTithiDay[] = generateMonthTithiCalendar(
    currentYear,
    currentMonth,
    location.latitude,
    location.longitude,
    location.timezone
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Monthly Calendar of Vedic Tithis (मासिक तिथि पत्रक)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Udaya Tithi
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                30-Tithi almanac calculated for {location.name}.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Month & Year Selector Bar */}
        <div className="p-3.5 sm:px-6 bg-[#0c1222] border-b border-[#1a233a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] text-neutral-300 hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Month Select */}
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
              aria-label="Select Month"
              className="px-3 py-1.5 bg-[#11192e] border border-[#233152] rounded-xl text-xs font-bold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx} className="bg-[#090e1a] text-white">
                  {name}
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
              aria-label="Select Year"
              className="px-3 py-1.5 bg-[#11192e] border border-[#233152] rounded-xl text-xs font-bold text-orange-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {Array.from({ length: 41 }, (_, i) => 2010 + i).map(yr => (
                <option key={yr} value={yr} className="bg-[#090e1a] text-white">
                  Year {yr}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] text-neutral-300 hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => {
                const now = new Date();
                setCurrentYear(now.getFullYear());
                setCurrentMonth(now.getMonth());
              }}
              className="px-2.5 py-1 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold transition-colors ml-1"
            >
              Current Month
            </button>
          </div>

          <div className="text-xs text-neutral-400">
            Location: <span className="text-orange-400 font-medium">{location.name}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          
          {/* Brief Bilingual Dharmashastra Rule */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0e1629] to-orange-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider mb-1.5">
              <BookOpen size={15} />
              <span>📜 Dharmashastra Determination Rule (तिथि निर्धारण शास्त्र नियम)</span>
            </div>
            <div className="space-y-1 text-neutral-200">
              <p>
                <strong className="text-amber-300">हिंदी:</strong> सूर्योदय के समय उपस्थित तिथि (औदयिक तिथि) ही उस पूरे दिन के समस्त धार्मिक व नित्य कर्मों में मान्य होती है (सूर्यसिद्धान्त एवं निर्णयसिन्धु)।
              </p>
              <p className="text-neutral-300">
                <strong className="text-amber-300">English:</strong> The Tithi prevailing at local Sunrise (Udaya Tithi) canonically governs all daily rituals and religious observances for the solar day (Surya Siddhanta &amp; Nirnayasindhu).
              </p>
            </div>
          </div>

          {/* Table of 30 Tithis */}
          <div className="rounded-2xl border border-[#1e2942] overflow-hidden bg-[#0c1222]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#11192e] text-neutral-300 border-b border-[#1e2942]">
                  <tr>
                    <th className="p-3 font-bold">Date &amp; Day</th>
                    <th className="p-3 font-bold">Tithi (Paksha)</th>
                    <th className="p-3 font-bold">Nakshatra</th>
                    <th className="p-3 font-bold">Yoga &amp; Karana</th>
                    <th className="p-3 font-bold">Sunrise / Sunset</th>
                    <th className="p-3 font-bold">Observance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18233c] text-neutral-300">
                  {days.map((d) => (
                    <tr key={d.dayNumber} className="hover:bg-[#141d33] transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-white">{d.dateFormatted}</div>
                        <div className="text-[11px] text-neutral-400">{d.dayOfWeek}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                          d.paksha === 'Shukla' ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20' : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                        }`}>
                          {d.tithiName}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-medium text-neutral-200">
                        {d.nakshatra}
                      </td>
                      <td className="p-3 whitespace-nowrap text-[11px] text-neutral-400">
                        <div>Yoga: {d.yoga}</div>
                        <div>Karana: {d.karana}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[11px] text-neutral-300">
                        🌅 {d.sunrise} • 🌇 {d.sunset}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {d.festival ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                            <Sparkles size={11} />
                            {d.festival}
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">नित्य पञ्चाङ्ग</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400">
          <div>Authority: <strong>Surya Siddhanta &amp; Nirnayasindhu</strong></div>
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
