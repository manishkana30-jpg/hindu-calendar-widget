"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { HinduPanchangWidget } from './components/HinduPanchangWidget';
import { VedicEditorialGuide } from './components/VedicEditorialGuide';
import { FaqAccordion } from './components/FaqAccordion';
import { initAutomaticDailyNotifications } from '@/src/lib/notifications/client-trigger';

export default function LandingPage() {
  useEffect(() => {
    // Register Service Worker for offline PWA & schedule automatic daily notifications
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').then(() => {
        initAutomaticDailyNotifications();
      }).catch((err) => {
        console.log('SW registration error:', err);
      });
    } else {
      initAutomaticDailyNotifications();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden">
      
      {/* Decorative ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-[1200px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/5 blur-[160px] rounded-full" />
      </div>

      {/* ── Navbar: Brand & Live Status Indicator (Fluid & Responsive for all mobile screens) ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b16]/90 backdrop-blur-xl border-b border-[#162038]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl drop-shadow-md shrink-0 select-none">🕉️</span>
            <div className="min-w-0">
              <span className="text-xs sm:text-base font-extrabold tracking-tight text-white block leading-snug truncate">
                Hindu Calendar & Live Panchang
              </span>
              <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono tracking-wider uppercase block truncate">
                High-Precision Vedic Astrometry
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

      {/* ── Hero Section with Live Widget ── */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 max-w-6xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] sm:text-xs font-bold mb-4 backdrop-blur-md">
          <Sparkles size={13} className="text-amber-400 animate-pulse shrink-0" />
          <span>Vedic Time • 100% Offline Web App (PWA)</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          Vedic Time. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500">
            Real-Time Astrometry.
          </span>
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl mx-auto mb-6 leading-relaxed px-2">
          High-precision Vedic Panchang with live Ishta Kaal, 8-Pahar segmentation, real-time Muhurats, and Dharmashastra determination rules.
        </p>

        {/* ── Main Panchang Widget (Completely unobstructed, never covered by banners) ── */}
        <div className="my-4 sm:my-6">
          <HinduPanchangWidget />
        </div>

        {/* ── Authoritative Editorial Section (Directly Below Widget for Search Dominance) ── */}
        <VedicEditorialGuide />

        {/* ── Accessible FAQ Accordion ── */}
        <FaqAccordion />

      </section>

      {/* ── Comprehensive Site Footer ── */}
      <footer className="pt-16 pb-12 border-t border-[#162038] bg-[#050811] text-xs text-neutral-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-[#162038]">
            
            {/* Column 1: Brand & Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕉️</span>
                <span className="font-bold text-white text-sm">Hindu Calendar & Live Panchang</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                High-precision, ad-free Vedic astrometry platform delivering live Ghati/Pala timekeeping, Udaya Tithi, dynamic Choghadiya Muhurats, and Dharmashastra-compliant festival calculations.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#11192e] border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>100% Offline PWA Ready</span>
              </div>
            </div>

            {/* Column 2: Astrometric Foundation */}
            <div className="space-y-3">
              <h3 className="font-bold text-white uppercase font-mono tracking-wider text-xs">Astrometric Science</h3>
              <ul className="space-y-2 text-neutral-400 text-xs">
                <li>• Swiss Ephemeris (DE431)</li>
                <li>• Lahiri (Chitra Paksha) Ayanamsa</li>
                <li>• Sidereal Zodiac (Nirayana)</li>
                <li>• Nirnayasindhu &amp; Dharmasindhu Canons</li>
                <li>• Dynamic Topocentric Refraction</li>
              </ul>
            </div>

            {/* Column 3: Trust & Compliance */}
            <div className="space-y-3">
              <h3 className="font-bold text-white uppercase font-mono tracking-wider text-xs">Compliance &amp; Trust</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/about" className="hover:text-amber-400 transition-colors">
                    About Methodology &amp; Mission
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">
                    Privacy Policy (GDPR / CCPA)
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-amber-400 transition-colors">
                    Terms &amp; Calculation Disclaimers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-amber-400 transition-colors">
                    Contact &amp; Astrometry Inquiries
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Open Source & Diaspora */}
            <div className="space-y-3">
              <h3 className="font-bold text-white uppercase font-mono tracking-wider text-xs">Open Architecture</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Built for the global Hindu diaspora with Next.js 15, React 19, and Tailwind CSS. Fully auditable on GitHub under open source licenses.
              </p>
              <div>
                <a
                  href="https://github.com/manishkana30-jpg/hindu-calendar-widget"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <span>Inspect GitHub Repository →</span>
                </a>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-neutral-500 text-xs">
            <div>
              © 2026 Hindu Calendar &amp; Live Panchang (Vikram Samvat Widget). Dedicated to Vedic Astrometry.
            </div>
            <div className="flex items-center gap-4 text-neutral-400">
              <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <span>•</span>
              <Link href="/about" className="hover:text-white">Methodology</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

