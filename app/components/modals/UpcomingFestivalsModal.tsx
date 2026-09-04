"use client";

import React, { useState, useMemo } from 'react';
import { X, Calendar, BookOpen, Filter, Sparkles } from 'lucide-react';
import { LocationCoordinates, PRESET_LOCATIONS } from '../../../src/lib/vedic-astronomy';
import { getUpcomingFestivalsList, UpcomingFestivalResult } from '../../../src/lib/festivals';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location?: LocationCoordinates;
  currentDate?: Date;
}

export function UpcomingFestivalsModal({ isOpen, onClose, location, currentDate }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const loc = location || PRESET_LOCATIONS[0];

  const allUpcoming: UpcomingFestivalResult[] = useMemo(() => {
    const baseDate = currentDate || new Date();
    return getUpcomingFestivalsList(baseDate, loc, 25, 240);
  }, [currentDate, loc]);

  if (!isOpen) return null;

  const categories = ['All', 'Major Festival', 'Ekadashi', 'Pradosh'];

  const filteredFestivals = selectedCategory === 'All'
    ? allUpcoming
    : allUpcoming.filter(f => f.category === selectedCategory || (selectedCategory === 'Major Festival' && f.isMajor));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Calendar of Upcoming Festivals (आगामी व्रत-पर्व)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {loc.name}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Dynamically calculated with Swiss Ephemeris astronomical engine & Dharmashastra rules.
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

        {/* Category Filters */}
        <div className="px-6 py-3 bg-[#0c1222] border-b border-[#1a233a] flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-400 mr-2 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-[#11192e] text-neutral-400 hover:text-neutral-200 border border-[#233152]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          
          {/* Universal Rule Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0e1629] to-orange-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider mb-1.5">
              <BookOpen size={15} />
              <span>📜 Canonical Determination Principles (धर्मशास्त्र निर्णय सिद्धान्त)</span>
            </div>
            <div className="space-y-1 text-neutral-200">
              <p>
                <strong className="text-amber-300">हिंदी:</strong> एकादशी व पूर्णिमा औदयिक तिथि (सूर्योदय) में, प्रदोष व शिवरात्रि प्रदोषकाल (सूर्यास्त) में, तथा जन्माष्टमी मध्यरात्रि (निशीथ काल) में ग्राह्य होती है (निर्णयसिन्धु व धर्मसिन्धु)।
              </p>
              <p className="text-neutral-300">
                <strong className="text-amber-300">English:</strong> Ekadashi & Purnima follow Sunrise (Udaya-Vyapini), Pradosha & Shivratri follow Sunset twilight (Pradosha-Vyapini), and Janmashtami follows Midnight (Nishitha-Vyapini).
              </p>
            </div>
          </div>

          {/* Festival Cards List */}
          <div className="space-y-3">
            {filteredFestivals.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-sm">
                No festivals found in this category.
              </div>
            ) : (
              filteredFestivals.map((fest, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#0c1222] border border-[#1e2942] hover:border-emerald-500/40 transition-all space-y-2.5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18233c] pb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#11192e] border border-[#233152] flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                        {fest.icon || '🪔'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            {fest.category}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#142038] text-amber-300 font-bold border border-amber-500/30">
                            {fest.daysText}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1">
                          {fest.name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right pl-13 sm:pl-0">
                      <div className="text-sm font-bold text-white flex items-center sm:justify-end gap-1.5">
                        <Sparkles size={13} className="text-emerald-400" />
                        <span>{fest.dateFormatted}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">{fest.dayOfWeek}</div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300">
                    {fest.description}
                  </p>

                  {/* Brief Bilingual Dharmashastra Rule for this festival */}
                  {fest.briefRule && (
                    <div className="p-3 rounded-xl bg-[#11192e] border border-amber-500/20 text-xs space-y-1">
                      <div className="text-amber-300 font-bold flex items-center gap-1.5 text-[11px]">
                        <BookOpen size={12} />
                        <span>📜 Dharmashastra Determination Rule (धर्मशास्त्र निर्णय):</span>
                      </div>
                      <p className="text-neutral-200">
                        <strong className="text-amber-300">हिंदी:</strong> {fest.briefRule.hindi}
                      </p>
                      <p className="text-neutral-300">
                        <strong className="text-amber-300">English:</strong> {fest.briefRule.english}
                      </p>
                    </div>
                  )}

                  {/* Shastra References */}
                  {fest.shastraReferences && fest.shastraReferences.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {fest.shastraReferences.map((ref, rIdx) => (
                        <span key={rIdx} className="text-[10px] px-2 py-0.5 rounded bg-[#11192e] text-neutral-400 border border-[#1e2942]">
                          📖 {ref}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400">
          <div>Authority: <strong>Nirnayasindhu & Dharmasindhu</strong></div>
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
