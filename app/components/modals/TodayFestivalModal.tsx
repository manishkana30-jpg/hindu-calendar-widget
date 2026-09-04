"use client";

import React from 'react';
import { X, Calendar, BookOpen, Sun, Play, Square, Sparkles } from 'lucide-react';
import { PanchangData } from '../../../src/lib/vedic-astronomy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  panchang: PanchangData;
}

export function TodayFestivalModal({ isOpen, onClose, panchang }: Props) {
  if (!isOpen) return null;

  const fest = panchang.todayFestival;
  const isMajor = fest.isMajor;

  const defaultHindiRule = 'सूर्यसिद्धान्त: सूर्योदय के समय उपस्थित तिथि (औदयिक तिथि) ही उस सम्पूर्ण दिवस के धार्मिक व नित्य कर्मों हेतु मान्य होती है।';
  const defaultEnglishRule = 'Surya Siddhanta: The Tithi prevailing at local Sunrise (Udaya Tithi) governs all canonical rituals and civil duties for the day.';

  const ruleHindi = fest.briefRule?.hindi || defaultHindiRule;
  const ruleEnglish = fest.briefRule?.english || defaultEnglishRule;
  const references = fest.shastraReferences || ['Surya Siddhanta', 'Nirnayasindhu', 'Dharmasindhu'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isMajor 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            } flex items-center justify-center w-12 h-12 flex-shrink-0`}>
              {fest.icon ? (
                <span className="text-2xl leading-none select-none">{fest.icon}</span>
              ) : (
                <Calendar size={22} />
              )}
            </div>
            <div>
              <div className="text-[11px] text-orange-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span>TODAY&apos;S FESTIVAL / VRAT</span>
                {fest.badge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    {fest.badge}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                {fest.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
          
          {/* Description banner */}
          <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] text-sm text-neutral-300 flex items-center gap-2.5">
            <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
            <span>{fest.description}</span>
          </div>

          {/* Exact Requested Timing Block: Udaya Time, Starts, Ends */}
          <div className="p-4 rounded-2xl bg-[#0c1222] border border-[#1e2942] space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Vrat & Tithi Canonical Timings ({panchang.location.name})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Udaya Time */}
              <div className="p-3.5 rounded-xl bg-[#11192e] border border-[#233152]">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
                  <Sun size={13} />
                  <span>Udaya Time:</span>
                </div>
                <div className="text-base font-mono font-extrabold text-white">
                  {panchang.sunrise}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Local Sunrise</div>
              </div>

              {/* Starts */}
              <div className="p-3.5 rounded-xl bg-[#11192e] border border-[#233152]">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                  <Play size={11} className="fill-emerald-400" />
                  <span>▶ Active Tithi:</span>
                </div>
                <div className="text-xs font-mono font-bold text-white leading-tight">
                  {panchang.tithi.name}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{panchang.tithi.paksha} Paksha</div>
              </div>

              {/* Ends */}
              <div className="p-3.5 rounded-xl bg-[#11192e] border border-[#233152]">
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mb-1">
                  <Square size={11} className="fill-rose-400" />
                  <span>■ Tithi Ends:</span>
                </div>
                <div className="text-xs font-mono font-bold text-white leading-tight">
                  {panchang.tithi.endTime}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Tithi Egress</div>
              </div>

            </div>

            <div className="p-2.5 rounded-xl bg-[#142038] border border-amber-500/30 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300">🌙 Vedic Lunar Month:</span>
              <span className="font-mono font-bold text-white">{panchang.masaDisplay}</span>
            </div>
          </div>

          {/* 📜 Brief Bilingual Dharmashastra Determination Rule */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0e1629] to-orange-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider mb-2">
              <BookOpen size={15} />
              <span>📜 Dharmashastra Determination Rule (धर्मशास्त्र निर्णय)</span>
            </div>
            <div className="space-y-2 text-neutral-200">
              <p>
                <strong className="text-amber-300">हिंदी:</strong> {ruleHindi}
              </p>
              <p className="text-neutral-300">
                <strong className="text-amber-300">English:</strong> {ruleEnglish}
              </p>
            </div>
          </div>

          {/* Shastra Reference Badges */}
          <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400">
            {references.map((ref, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#11192e] border border-[#233152]">
                📖 {ref}
              </span>
            ))}
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
