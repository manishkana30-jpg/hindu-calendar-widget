"use client";

import React, { useState } from 'react';
import { X, ShieldAlert, BookOpen, Calendar, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { generatePanchaksForYear, getActivePanchakStatus } from '../../../src/lib/dharmashastra-rules';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function PanchakModal({ isOpen, onClose }: Props) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  if (!isOpen) return null;

  const panchakStatus = getActivePanchakStatus();
  const yearPanchaks = generatePanchaksForYear(selectedYear);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <span>Vedic Panchak Calendar &amp; Rules (पञ्चक विचार)</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  panchakStatus.isActive 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {panchakStatus.isActive ? 'Active Panchak' : 'No Active Panchak'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Moon in Dhanishta (Uttaraardha), Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada &amp; Revati.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          
          {/* Active Status Alert Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
            panchakStatus.isActive 
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <Shield size={18} className={panchakStatus.isActive ? 'text-rose-400' : 'text-emerald-400'} />
              <div>
                <span className="font-bold text-sm text-white block">
                  {panchakStatus.displayTitle}
                </span>
                <span className="text-neutral-300 text-xs">
                  {panchakStatus.displaySubtitle}
                </span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              panchakStatus.isActive 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {panchakStatus.badgeText}
            </span>
          </div>

          {/* Brief Bilingual Determination Rule */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0e1629] to-orange-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider mb-1.5">
              <BookOpen size={15} />
              <span>📜 Panchak Determination &amp; Prohibitions (पञ्चक शास्त्र नियम)</span>
            </div>
            <div className="space-y-1 text-neutral-200">
              <p>
                <strong className="text-amber-300">हिंदी:</strong> चन्द्रमा के धनिष्ठा से रेवती तक विचरण काल में पञ्चक होता है। इसमें छत ढालना, दक्षिण दिशा की यात्रा, तृण/काष्ठ संग्रह, खाट बनाना व बिना शान्ति दाह संस्कार वर्जित है (मुहूर्तचिन्तामणि व निर्णयसिन्धु)।
              </p>
              <p className="text-neutral-300">
                <strong className="text-amber-300">English:</strong> Panchak occurs when the Moon transits from Dhanishta to Revati. Roof construction, southward travel, wood/grass collection, cot crafting, and un-sanctified cremation are canonically prohibited (Muhurta Chintamani &amp; Nirnayasindhu).
              </p>
            </div>
          </div>

          {/* 6 Varieties */}
          <div>
            <h3 className="text-xs font-bold text-white mb-2.5 uppercase tracking-wider">
              6 Canonical Panchak Varieties by Commencing Weekday
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { name: 'Raja Panchak (राज पञ्चक)', day: 'Monday (सोमवार)', nature: 'Auspicious', desc: 'Government, honors & property', color: 'emerald' },
                { name: 'Roga Panchak (रोग पञ्चक)', day: 'Sunday (रविवार)', nature: 'Inauspicious', desc: 'Health troubles & surgery delay', color: 'rose' },
                { name: 'Agni Panchak (अग्नि पञ्चक)', day: 'Tuesday (मंगलवार)', nature: 'Inauspicious', desc: 'Fire accidents & disputes', color: 'rose' },
                { name: 'Nirdosha Panchak (निर्दोष पञ्चक)', day: 'Wed & Thu (बुध/गुरु)', nature: 'Neutral', desc: 'General commerce & routine study', color: 'yellow' },
                { name: 'Chora Panchak (चोर पञ्चक)', day: 'Friday (शुक्रवार)', nature: 'Inauspicious', desc: 'Financial loss & fraud risk', color: 'rose' },
                { name: 'Mrityu Panchak (मृत्यु पञ्चक)', day: 'Saturday (शनिवार)', nature: 'Severe Caution (Inauspicious)', desc: 'Fatal crisis & injury danger', color: 'rose' },
              ].map((p, idx) => (
                <div key={idx} className={`p-3 rounded-xl bg-[#0c1222] border text-xs ${
                  p.color === 'emerald' ? 'border-emerald-500/30' :
                  p.color === 'yellow' ? 'border-yellow-500/30' :
                  'border-rose-500/30'
                }`}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-white text-[11px]">{p.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      p.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      p.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {p.nature}
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold">{p.day}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Panchaks Calendar Table with Year Switcher */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-orange-400" />
                <span>Panchak Schedule for Year {selectedYear} ({yearPanchaks.length} Occurrences)</span>
              </h3>

              {/* Year Navigation Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-1 rounded-lg bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] text-neutral-300 hover:text-white transition-colors"
                  title="Previous Year"
                >
                  <ChevronLeft size={14} />
                </button>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  aria-label="Select Year"
                  className="px-2.5 py-1 bg-[#11192e] border border-[#233152] rounded-lg text-xs font-bold text-orange-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {Array.from({ length: 21 }, (_, i) => 2020 + i).map(yr => (
                    <option key={yr} value={yr} className="bg-[#090e1a] text-white">
                      Year {yr}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-1 rounded-lg bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] text-neutral-300 hover:text-white transition-colors"
                  title="Next Year"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setSelectedYear(new Date().getFullYear())}
                  className="px-2 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-[11px] font-bold transition-colors ml-1"
                >
                  Current Year
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1e2942] overflow-hidden bg-[#0c1222]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#11192e] text-neutral-300 border-b border-[#1e2942]">
                    <tr>
                      <th className="p-3 font-bold">#</th>
                      <th className="p-3 font-bold">Panchak Type</th>
                      <th className="p-3 font-bold">Starts (Date &amp; Time)</th>
                      <th className="p-3 font-bold">Ends (Date &amp; Time)</th>
                      <th className="p-3 font-bold">Commencing Day</th>
                      <th className="p-3 font-bold">Auspiciousness</th>
                      <th className="p-3 font-bold">Brief Shastra Effect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18233c] text-neutral-300">
                    {yearPanchaks.map((panchak, idx) => (
                      <tr key={panchak.id} className="hover:bg-[#141d33] transition-colors">
                        <td className="p-3 font-mono text-neutral-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          {panchak.typeHindi}
                        </td>
                        <td className="p-3 font-mono text-neutral-200 whitespace-nowrap">
                          {panchak.startDate} ({panchak.startTime})
                        </td>
                        <td className="p-3 font-mono text-neutral-200 whitespace-nowrap">
                          {panchak.endDate} ({panchak.endTime})
                        </td>
                        <td className="p-3 whitespace-nowrap text-amber-400 font-medium">
                          {panchak.weekday}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            panchak.auspiciousness === 'Auspicious' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                            panchak.auspiciousness === 'Neutral' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {panchak.auspiciousness}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-neutral-300 min-w-[200px]">
                          {panchak.briefEffects.hindi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400">
          <div>Authority: <strong>Muhurta Chintamani &amp; Dharmasindhu</strong></div>
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
