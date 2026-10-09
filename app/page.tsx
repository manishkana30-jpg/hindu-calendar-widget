import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { HinduPanchangWidget } from './components/HinduPanchangWidget';
import { VedicEditorialGuide } from './components/VedicEditorialGuide';
import { FaqAccordion } from './components/FaqAccordion';
import { ClientNotificationScheduler } from './components/ClientNotificationScheduler';
import { BackgroundAlertsSetup } from '@/src/components/BackgroundAlertsSetup';
import { Footer } from '@/src/components/Footer';
import { CITIES } from '@/src/lib/cities';

export const revalidate = 86400; // 24 hours ISR revalidation

export default function LandingPage() {
  const now = new Date();
  const serverFormattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden">
      
      <ClientNotificationScheduler />

      {/* Decorative ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-[1200px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/5 blur-[160px] rounded-full" />
      </div>

      {/* ── Navbar: Brand & Live Status Indicator ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b16]/90 backdrop-blur-xl border-b border-[#162038]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl drop-shadow-md shrink-0 select-none">🕉️</span>
            <div className="min-w-0">
              <span className="text-xs sm:text-base font-extrabold tracking-tight text-white block leading-snug truncate">
                Daily Tithi
              </span>
              <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono tracking-wider uppercase block truncate">
                Live Hindu Calendar &amp; Panchang
              </span>
            </div>
          </div>
          
          {/* Top Right: Compact Live Astrometry Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#11192e] border border-[#233152] text-xs font-medium text-neutral-300 shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-mono text-[10px] sm:text-[11px] text-neutral-300 whitespace-nowrap">
              <span className="inline sm:hidden">Live</span>
              <span className="hidden sm:inline">Live Astrometry</span>
            </span>
          </div>

        </div>
      </nav>

      {/* ── Hero Section with Live Widget & Dynamic Server Date ── */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 max-w-6xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] sm:text-xs font-bold mb-4 backdrop-blur-md">
          <Sparkles size={13} className="text-amber-400 animate-pulse shrink-0" />
          <span>Vedic Time • {serverFormattedDate} • 100% Offline PWA</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          Vedic Time. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500">
            Real-Time Astrometry Today.
          </span>
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl mx-auto mb-6 leading-relaxed px-2">
          High-precision Vedic Panchang for {serverFormattedDate}. Live Ishta Kaal, 8-Pahar segmentation, real-time Muhurats, and Dharmashastra determination rules.
        </p>

        {/* ── Main Panchang Widget ── */}
        <div className="my-4 sm:my-6">
          <HinduPanchangWidget />
        </div>

        {/* ── Background Lock-Screen Alerts Setup ── */}
        <div className="my-6 max-w-4xl mx-auto text-left">
          <BackgroundAlertsSetup />
        </div>

        {/* ── Machine-Readable Canonical Summary Section for Search & Answer Engines ── */}
        <section className="sr-only" aria-label="Current Astronomical Summary for Search Engines">
          <h2>Today&apos;s Canonical Panchang &amp; Astrometric Coordinates</h2>
          <dl>
            <dt>Civil Calendar Date</dt>
            <dd>{serverFormattedDate}</dd>
            <dt>Active Eras</dt>
            <dd>Vikram Samvat 2083, Shaka Samvat 1948</dd>
            <dt>Astrometric Calculation Engine</dt>
            <dd>Swiss Ephemeris (DE431) with Nirayana Lahiri (Chitra Paksha) Ayanamsa</dd>
            <dt>Canonical Canons</dt>
            <dd>Nirnayasindhu, Dharmasindhu, Surya Siddhanta</dd>
            <dt>Platform Capabilities</dt>
            <dd>Progressive Web App (PWA), 100% Offline Computation, Zero Display Advertisements</dd>
          </dl>
        </section>

        {/* ── Programmatic SEO City Hub ── */}
        <div className="mt-14 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span className="text-xs font-mono text-orange-400 tracking-wider uppercase">Programmatic Vedic Hub</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Live City-Specific Panchang & Muhurats
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              30 Global Metros Available
            </span>
          </div>

          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Select a city to inspect exact local sunrise, topocentric Dina Mana division, local Choghadiya timings, and Udaya Tithi:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/panchang/${city.slug}`}
                className="px-3 py-2 rounded-xl bg-[#0e1629] hover:bg-[#16213d] border border-[#233152] hover:border-orange-500/40 text-xs text-neutral-300 hover:text-orange-300 transition-all block truncate"
              >
                📍 {city.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Authoritative Editorial Section (Directly Below Widget for Search Dominance) ── */}
        <VedicEditorialGuide />

        {/* ── Accessible FAQ Accordion ── */}
        <FaqAccordion />

      </section>

      {/* ── Comprehensive Site Footer ── */}
      <Footer />

    </div>
  );
}
