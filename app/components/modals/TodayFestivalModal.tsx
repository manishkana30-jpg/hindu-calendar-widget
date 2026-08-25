"use client";

import React from 'react';
import { X, Calendar, BookOpen, Sun, Play, Square, Sparkles, CheckCircle2 } from 'lucide-react';
import { FESTIVALS_DATABASE, FestivalDetail } from '../../../src/lib/dharmashastra-rules';
import { PanchangData } from '../../../src/lib/vedic-astronomy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  panchang: PanchangData;
}

export function TodayFestivalModal({ isOpen, onClose, panchang }: Props) {
  if (!isOpen) return null;

  const festival: FestivalDetail = FESTIVALS_DATABASE[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar size={22} />
            </div>
            <div>
              <div className="text-[11px] text-orange-400 font-bold uppercase tracking-wider">
                TODAY&apos;S FESTIVAL / VRAT
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {festival.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
          
          {/* Exact Requested Timing Block: Udaya Time, Starts, Ends */}
          <div className="p-4 rounded-2xl bg-[#0c1222] border border-[#1e2942] space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Vrat &amp; Tithi Canonical Timings</span>
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
                <div className="text-[10px] text-neutral-400 mt-0.5">Suryodaya</div>
              </div>

              {/* Starts */}
              <div className="p-3.5 rounded-xl bg-[#11192e] border border-[#233152]">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                  <Play size={11} className="fill-emerald-400" />
                  <span>▶ Starts:</span>
                </div>
                <div className="text-xs font-mono font-bold text-white leading-tight">
                  {festival.startTime}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Tithi Ingress</div>
              </div>

              {/* Ends */}
              <div className="p-3.5 rounded-xl bg-[#11192e] border border-[#233152]">
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mb-1">
                  <Square size={11} className="fill-rose-400" />
                  <span>■ Ends:</span>
                </div>
                <div className="text-xs font-mono font-bold text-white leading-tight">
                  {festival.endTime}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Tithi Egress</div>
              </div>

            </div>

            {festival.paranaTime && (
              <div className="p-2.5 rounded-xl bg-[#142038] border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300">🍽️ Parana Timing:</span>
                <span className="font-mono font-bold text-white">{festival.paranaTime}</span>
              </div>
            )}
          </div>

          {/* 📜 Brief Bilingual Dharmashastra Determination Rule */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0e1629] to-orange-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider mb-2">
              <BookOpen size={15} />
              <span>📜 Dharmashastra Determination Rule (धर्मशास्त्र निर्णय)</span>
            </div>
            <div className="space-y-2 text-neutral-200">
              <p>
                <strong className="text-amber-300">हिंदी:</strong> {festival.briefRule.hindi}
              </p>
              <p className="text-neutral-300">
                <strong className="text-amber-300">English:</strong> {festival.briefRule.english}
              </p>
            </div>
          </div>

          {/* Shastra Reference Badges */}
          <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400">
            {festival.shastraReferences.map((ref, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#11192e] border border-[#233152]">
                📖 {ref}
              </span>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400">
          <div>Authority: <strong>Nirnayasindhu &amp; Padma Purana</strong></div>
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
