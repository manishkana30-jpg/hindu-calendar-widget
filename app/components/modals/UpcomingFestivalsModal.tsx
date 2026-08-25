"use client";

import React, { useState } from 'react';
import { X, Calendar, BookOpen, Filter } from 'lucide-react';
import { FESTIVALS_DATABASE } from '../../../src/lib/dharmashastra-rules';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function UpcomingFestivalsModal({ isOpen, onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Ekadashi', 'Pradosh', 'Major Festival', 'Ganesh Chaturthi'];

  const filteredFestivals = selectedCategory === 'All'
    ? FESTIVALS_DATABASE
    : FESTIVALS_DATABASE.filter(f => f.category === selectedCategory);

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
                <span>Monthly Calendar of Upcoming Festivals (आगामी व्रत-पर्व)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  2026
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Every festival includes brief Hindi &amp; English Dharmashastra Determination Rules.
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
              <span>📜 Universal Vrata Determination Rules (सामान्य व्रत निर्णय नियम)</span>
            </div>
            <div className="space-y-1 text-neutral-200">
              <p>
                <strong className="text-amber-300">हिंदी:</strong> एकादशी व पूर्णिमा औदयिक तिथि (सूर्योदय) में, प्रदोष व शिवरात्रि प्रदोषकाल (सूर्यास्त) में, तथा जन्माष्टमी मध्यरात्रि (निशीथ काल) में ग्राह्य होती है (निर्णयसिन्धु व धर्मसिन्धु)।
              </p>
              <p className="text-neutral-300">
                <strong className="text-amber-300">English:</strong> Ekadashi &amp; Purnima follow Sunrise (Udaya-Vyapini), Pradosha &amp; Shivratri follow Sunset twilight (Pradosha-Vyapini), and Janmashtami follows Midnight (Nishitha-Vyapini).
              </p>
            </div>
          </div>

          {/* Festival Cards List */}
          <div className="space-y-3">
            {filteredFestivals.map((fest, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#0c1222] border border-[#1e2942] hover:border-emerald-500/40 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#18233c] pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {fest.category}
                      </span>
                      <span className="text-xs text-amber-400 font-bold">
                        {fest.tithi}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {fest.name} <span className="text-xs font-normal text-neutral-400">({fest.hindiName})</span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{fest.date}</div>
                    <div className="text-[11px] text-neutral-400">{fest.dayOfWeek}</div>
                  </div>
                </div>

                {/* Timing Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#11192e] border border-[#233152]">
                    <span className="text-amber-400 font-bold">Udaya Time:</span>
                    <span className="font-mono text-white ml-2 font-bold">{fest.udayaTime}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11192e] border border-[#233152]">
                    <span className="text-emerald-400 font-bold">▶ Starts:</span>
                    <span className="font-mono text-white ml-2">{fest.startTime}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11192e] border border-[#233152]">
                    <span className="text-rose-400 font-bold">■ Ends:</span>
                    <span className="font-mono text-white ml-2">{fest.endTime}</span>
                  </div>
                </div>

                {/* Brief Bilingual Dharmashastra Rule for this festival */}
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

              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400">
          <div>Authority: <strong>Nirnayasindhu &amp; Dharmasindhu</strong></div>
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
