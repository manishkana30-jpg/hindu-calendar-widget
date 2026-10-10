"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sun, Moon, Sunrise, Sunset, Clock, Sparkles } from 'lucide-react';
import { CITIES, CityData, getCityBySlug } from '@/src/lib/cities';
import { 
  calculatePanchang, 
  LocationCoordinates, 
  PanchangData 
} from '@/src/lib/vedic-astronomy';

function cityToLocation(city: CityData): LocationCoordinates {
  return {
    name: city.name,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
    regionName: city.state,
    ianaTimezone: city.ianaTimezone,
  };
}

function EmbedWidgetContent() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('city') || 'new-delhi';
  const themeParam = searchParams.get('theme') || 'dark';

  // Resolved city
  const initialCity = useMemo(() => {
    return getCityBySlug(cityParam) || CITIES[0];
  }, [cityParam]);

  const [selectedCity, setSelectedCity] = useState<CityData>(initialCity);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Keep date ticking live every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Update selected city if query param changes
  useEffect(() => {
    const found = getCityBySlug(cityParam);
    if (found) setSelectedCity(found);
  }, [cityParam]);

  // Compute live panchang
  const panchang: PanchangData = useMemo(() => {
    const coords = cityToLocation(selectedCity);
    return calculatePanchang(currentDate, coords);
  }, [selectedCity, currentDate]);

  const isMinimal = themeParam === 'minimal';

  // Formatted date
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const activeTithi = panchang.udayaTithi || panchang.tithi;
  const currentChoghadiya = panchang.currentChoghadiya;
  const quality = currentChoghadiya?.quality || 'Good';
  const isAuspicious = quality === 'Good' || quality === 'Best';

  return (
    <main
      className={`w-full max-w-[340px] min-w-[280px] mx-auto rounded-2xl p-3 sm:p-3.5 select-none transition-all duration-300 font-sans shadow-xl ${
        isMinimal
          ? 'bg-[#060913] border border-white/10 text-neutral-100'
          : 'bg-gradient-to-b from-[#090e1a] via-[#0b1222] to-[#070b14] border border-amber-500/25 text-neutral-100 shadow-[0_4px_25px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* ── 1. HEADER: City Picker & Gregorian Date ── */}
      <header className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <select
            value={selectedCity.slug}
            onChange={(e) => {
              const c = getCityBySlug(e.target.value);
              if (c) setSelectedCity(c);
            }}
            aria-label="Select City"
            className="text-xs font-semibold bg-transparent text-amber-300 hover:text-amber-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400/50 rounded py-0.5 pr-1 truncate"
          >
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug} className="bg-[#0b1222] text-white">
                📍 {c.name}
              </option>
            ))}
          </select>
        </div>

        <time
          dateTime={currentDate.toISOString().split('T')[0]}
          className="text-[10px] font-mono text-neutral-400 shrink-0"
        >
          {formattedDate}
        </time>
      </header>

      {/* ── 2. ACTIVE TITHI HERO SECTION ── */}
      <section className="py-2.5 space-y-1.5" aria-label="Active Tithi Information">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Sparkles size={11} className="text-amber-400 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Today&apos;s Tithi
            </span>
          </div>
          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
            {activeTithi.paksha}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 truncate">
            {activeTithi.name}
          </h2>
          <span className="text-base select-none shrink-0" title="Lunar Phase">
            {activeTithi.index === 15 ? '🌕' : activeTithi.index === 30 ? '🌑' : '🌙'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-300">
          <Clock size={11} className="text-amber-400 shrink-0" />
          <span className="text-neutral-400">Ends:</span>
          <span className="font-semibold text-white">{activeTithi.endTime}</span>
        </div>
      </section>

      {/* ── 3. LIVE MUHURAT / CHOGHADIYA ── */}
      <section 
        className="p-2 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 mb-2"
        aria-label="Active Muhurat Information"
      >
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="text-[10px] text-neutral-400 font-medium">Active Muhurat:</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
            isAuspicious
              ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/70 border-rose-500/30 text-rose-300'
          }`}>
            {currentChoghadiya?.displayName || 'Abhijit Muhurat'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-300">
          <span className="text-neutral-400 text-[10px]">Window:</span>
          <span className="tabular-nums">
            {currentChoghadiya?.windowString || `${panchang.sunrise} — ${panchang.sunset}`}
          </span>
        </div>
      </section>

      {/* ── 4. SUN ARC: SUNRISE & SUNSET ── */}
      <section className="grid grid-cols-2 gap-1.5 mb-2.5" aria-label="Sun Arc Timings">
        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#0d1629]/70 border border-white/5">
          <Sunrise size={13} className="text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] text-neutral-400 block leading-tight">Sunrise</span>
            <span className="text-[11px] font-mono font-bold text-white block leading-tight">
              {panchang.sunrise}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#0d1629]/70 border border-white/5">
          <Sunset size={13} className="text-orange-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] text-neutral-400 block leading-tight">Sunset</span>
            <span className="text-[11px] font-mono font-bold text-white block leading-tight">
              {panchang.sunset}
            </span>
          </div>
        </div>
      </section>

      {/* ── 5. MANDATORY BACKLINK FOOTER ── */}
      <footer className="pt-2 text-center border-t border-white/10">
        <a
          href="https://dailytithi.com"
          target="_blank"
          rel="noopener"
          className="text-[10px] font-mono text-neutral-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
        >
          <span>Live Astrometry by</span>
          <strong className="text-amber-300">DailyTithi.com ↗</strong>
        </a>
      </footer>
    </main>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={
      <div className="w-[320px] h-[300px] rounded-2xl bg-[#090e1a] border border-white/10 flex items-center justify-center text-xs text-neutral-400">
        Loading Vedic Astrometry...
      </div>
    }>
      <EmbedWidgetContent />
    </Suspense>
  );
}
