"use client";

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Moon, Sun, Compass, Clock, ShieldCheck, ShieldAlert, BookOpen, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { PanchangData } from '../../../src/lib/vedic-astronomy';

export type LimbTabType = 'tithi' | 'nakshatra' | 'yoga' | 'karana' | 'vaar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  panchang: PanchangData;
  initialLimb?: LimbTabType;
}

export function FiveLimbsModal({ isOpen, onClose, panchang, initialLimb = 'tithi' }: Props) {
  const [activeLimb, setActiveLimb] = useState<LimbTabType>(initialLimb);

  useEffect(() => {
    if (isOpen && initialLimb) {
      setActiveLimb(initialLimb);
    }
  }, [isOpen, initialLimb]);

  // Lock background body scroll strictly while modal is open with guaranteed cleanup
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

  if (!isOpen) return null;

  const { tithi, nakshatra, yoga, karana, vaar } = panchang;

  const limbs = [
    { id: 'tithi', label: '1. Tithi', sub: 'तिथि', icon: '🌘' },
    { id: 'nakshatra', label: '2. Nakshatra', sub: 'नक्षत्र', icon: '⭐' },
    { id: 'yoga', label: '3. Yoga', sub: 'योग', icon: '🕉️' },
    { id: 'karana', label: '4. Karana', sub: 'करण', icon: '⚡' },
    { id: 'vaar', label: '5. Vaar', sub: 'वार', icon: '☀️' },
  ];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-none sm:max-w-2xl h-dvh sm:h-auto sm:max-h-[85dvh] bg-[#090e1a] border-0 sm:border border-[#233152] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans overscroll-contain">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center w-11 h-11 shrink-0">
              <Layers size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-bold font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <span>VEDIC PANCHANG (पञ्चाङ्ग)</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  5 Limbs
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 font-outfit">
                Five Sacred Limbs of Time
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Five Limbs dialog"
            className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Horizontal Scrollable Limb Selector Tabs ── */}
        <div className="p-2 sm:px-4 bg-[#0c1222] border-b border-[#1a233a] shrink-0">
          <div 
            className="flex overflow-x-auto gap-1.5 pb-1 overscroll-x-contain horizontal-tabs-scroll [-webkit-overflow-scrolling:touch]"
            style={{ touchAction: 'pan-x pan-y' }}
          >
            {limbs.map(tab => (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  setActiveLimb(tab.id as LimbTabType);
                }}
                className={`shrink-0 py-2 px-3 rounded-xl text-xs font-bold font-outfit transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  activeLimb === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/20 font-extrabold ring-1 ring-amber-400'
                    : 'bg-[#11192e] text-slate-300 hover:text-white hover:bg-[#18233d] border border-[#233152]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-serif font-devanagari font-normal hidden xs:inline">({tab.sub})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Limb Content ── */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-6 space-y-4 [-webkit-overflow-scrolling:touch]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >

          {/* 1. TITHI TAB */}
          {activeLimb === 'tithi' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-amber-950/20 border border-amber-500/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold font-outfit uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Moon size={12} className="text-amber-400" />
                    Limb 1 • Tithi (Lunar Phase Degree)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase">
                    {tithi.paksha} Paksha
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-serif font-devanagari">
                  {tithi.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Tithi represents the 12° longitudinal separation between the Moon and the Sun. In Vedic tradition, the prevailing Udaya Tithi at local sunrise governs all religious observances.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Presiding Deity (अधिष्ठाता देवता)</div>
                  <div className="text-sm font-semibold text-white font-serif font-devanagari">{tithi.deity || 'Vishnu / Surya'}</div>
                  <div className="text-[11px] text-slate-400">Governs health, focus, and sacred rituals for this phase.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">End Time (समाप्ति काल)</div>
                  <div className="text-sm font-bold text-amber-300 font-mono tabular-nums">{tithi.endTime}</div>
                  <div className="text-[11px] text-slate-400">Active until this instant, followed by the next Tithi.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-amber-400 font-outfit uppercase text-[10px]">Dharmashastra Guidance:</div>
                <p className="leading-relaxed">
                  Observances, vows, and charity performed during this Tithi invoke the divine blessings of its presiding deity. When observed according to sunrise Udaya Vyapti, religious merit is multiplied.
                </p>
              </div>

              {/* Sequential Navigation */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setActiveLimb('nakshatra')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold font-outfit flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <span>Next: 2. Nakshatra (नक्षत्र)</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 2. NAKSHATRA TAB */}
          {activeLimb === 'nakshatra' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-900/90 to-purple-950/20 border border-indigo-500/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold font-outfit uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Sparkles size={12} className="text-indigo-400" />
                    Limb 2 • Nakshatra (Lunar Mansion)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 uppercase">
                    Pada {nakshatra.pada}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-serif font-devanagari">
                  {nakshatra.name} ({nakshatra.devanagari})
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The Moon traverses one of 27 celestial lunar mansions (each 13° 20′). Nakshatras channel cosmic vibrations that influence human psychology, timing of ventures, and auspicious rites.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Ruling Lord & Deity</div>
                  <div className="text-sm font-semibold text-white font-serif font-devanagari">Lord {nakshatra.lord} • {nakshatra.deity}</div>
                  <div className="text-[11px] text-slate-400">Planetary ruler shaping subconscious energy and vitality.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Symbol & End Time</div>
                  <div className="text-sm font-semibold text-white">{nakshatra.symbol || 'Celestial Symbol'}</div>
                  <div className="text-[11px] text-indigo-300 font-mono tabular-nums">Prevails till {nakshatra.endTime}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-indigo-400 font-outfit uppercase text-[10px]">Muhurta Chintamani Significance:</div>
                <p className="leading-relaxed">
                  Pada {nakshatra.pada} of {nakshatra.name} is analyzed for travel, investments, and ceremonies. Favorable alignments with the native&apos;s Janma Nakshatra unlock sustained prosperity.
                </p>
              </div>

              {/* Sequential Navigation */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLimb('tithi')}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-bold font-outfit flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={14} />
                  <span>1. Tithi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLimb('yoga')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-bold font-outfit flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <span>Next: 3. Yoga (योग)</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 3. YOGA TAB */}
          {activeLimb === 'yoga' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${
                yoga.nature === 'Shubh' 
                  ? 'from-emerald-500/10 via-slate-900/90 to-teal-950/20 border-emerald-500/30' 
                  : 'from-rose-500/10 via-slate-900/90 to-red-950/20 border-rose-500/30'
              } border`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold font-outfit uppercase tracking-wider flex items-center gap-1 ${
                    yoga.nature === 'Shubh' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {yoga.nature === 'Shubh' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    Limb 3 • Yoga (Soli-Lunar Angle Sum)
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border font-outfit ${
                    yoga.nature === 'Shubh'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  }`}>
                    {yoga.nature === 'Shubh' ? 'AUSPICIOUS (शुभ)' : 'INAUSPICIOUS (अशुभ)'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-serif font-devanagari">
                  {yoga.name} Yoga
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Yoga is calculated by summing the sidereal longitudes of the Sun and the Moon (divided into 27 segments of 13° 20′). It determines the spiritual harmony and auspicious momentum of actions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Nature & Result</div>
                  <div className="text-sm font-semibold text-white">{yoga.meaning}</div>
                  <div className="text-[11px] text-slate-400">Defines overall cosmic disposition toward new ventures.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Action Guidance</div>
                  <div className={`text-sm font-semibold ${yoga.nature === 'Shubh' ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {yoga.nature === 'Shubh' ? 'Recommended for all virtuous actions' : 'Avoid major purchases or signing deeds'}
                  </div>
                  <div className="text-[11px] text-slate-400">Align activities to maximize success and peace.</div>
                </div>
              </div>

              {/* Sequential Navigation */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLimb('nakshatra')}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-bold font-outfit flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={14} />
                  <span>2. Nakshatra</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLimb('karana')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-teal-500/30 text-teal-300 hover:text-teal-200 text-xs font-bold font-outfit flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <span>Next: 4. Karana (करण)</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 4. KARANA TAB */}
          {activeLimb === 'karana' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${
                karana.auspicious 
                  ? 'from-teal-500/10 via-slate-900/90 to-emerald-950/20 border-teal-500/30' 
                  : 'from-amber-500/10 via-slate-900/90 to-rose-950/20 border-rose-500/30'
              } border`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold font-outfit uppercase tracking-wider text-teal-400 flex items-center gap-1">
                    <Compass size={12} className="text-teal-400" />
                    Limb 4 • Karana (Half-Tithi Division)
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border font-outfit ${
                    karana.auspicious
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  }`}>
                    {karana.auspicious ? 'AUSPICIOUS' : 'CAUTION (विष्टि/अशुभ)'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-serif font-devanagari">
                  {karana.name} Karana
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  A Karana is half of a Tithi (6° separation). There are 60 Karanas in a lunar month—7 movable (Chara) which repeat 8 times, and 4 fixed (Sthira) occurring once per month.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Karana Category</div>
                  <div className="text-sm font-semibold text-white">{karana.type || 'Movable (चर)'}</div>
                  <div className="text-[11px] text-slate-400">Classifies the dynamic speed and fruitfulness of endeavors.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Ruling Lord</div>
                  <div className="text-sm font-semibold text-white">{karana.lord || 'Indra / Vishnu'}</div>
                  <div className="text-[11px] text-slate-400">Deity overseeing agreements, travel, and material results.</div>
                </div>
              </div>

              {/* Sequential Navigation */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLimb('yoga')}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-bold font-outfit flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={14} />
                  <span>3. Yoga</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLimb('vaar')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold font-outfit flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <span>Next: 5. Vaar (वार)</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 5. VAAR TAB */}
          {activeLimb === 'vaar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-yellow-950/20 border border-amber-500/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold font-outfit uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sun size={12} className="text-amber-400" />
                    Limb 5 • Vaar (Solar Day of the Week)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase">
                    Civil Vedic Day
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-serif font-devanagari">
                  {vaar.name} ({vaar.devanagari})
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  In Vedic astronomy, a solar day (Ahoratra) extends strictly from local sunrise to the next sunrise. Each day is governed by one of the 7 Grahas (celestial planets).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Ruling Planet (वारेश)</div>
                  <div className="text-sm font-semibold text-white font-serif font-devanagari">{vaar.lord}</div>
                  <div className="text-[11px] text-slate-400">Influences daily stamina, mental temperament, and auspicious colors.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-outfit">Civil Ahoratra Span</div>
                  <div className="text-sm font-semibold text-white font-mono tabular-nums">{panchang.sunrise} to {panchang.sunset}</div>
                  <div className="text-[11px] text-amber-300">Total Day Length: {panchang.dayLength}</div>
                </div>
              </div>

              {/* Sequential Navigation */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLimb('karana')}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-bold font-outfit flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={14} />
                  <span>4. Karana</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLimb('tithi')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold font-outfit flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <span>↺ 1. Tithi (Restart)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#0c1222] border-t border-[#1a233a] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="text-[11px] font-grotesk text-slate-400">
            Dharmashastra Canonical Panchang
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1e2942] hover:bg-[#283757] text-white font-bold font-outfit text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
