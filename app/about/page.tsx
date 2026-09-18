import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Sparkles, Compass, ShieldCheck, Cpu, Code2 } from 'lucide-react';

export const metadata: Metadata = {
  title: "About Methodology & Astrometric Architecture | Hindu Calendar & Live Panchang",
  description: "Detailed scientific background outlining our Swiss Ephemeris algorithms, Lahiri Ayanamsa, Dharmashastra canons, and open-source mission.",
  alternates: {
    canonical: 'https://vikram-samvat-widget.vercel.app/about'
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/10 blur-[140px] rounded-full" />
      </div>

      <nav className="border-b border-[#162038] bg-[#070b16]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Live Panchang</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Sparkles size={16} className="text-orange-400" />
            <span>Methodology & Mission</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
        
        <div className="mb-10">
          <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">Mission & Architecture</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            About Hindu Calendar & Live Panchang
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-2">
            Restoring high-precision, ad-free Vedic astrometry to the global diaspora through modern web engineering and canonical Dharmashastra algorithms.
          </p>
        </div>

        <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
          
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Compass size={20} className="text-orange-400" />
              <h2>1. The Problem with Legacy Panchang Websites</h2>
            </div>
            <p>
              Traditional online calendars (such as Drik Panchang) have historically delivered immense cultural value, yet modern users are routinely subjected to aggressive display banner ads, cluttered layouts, sluggish page reloads, and heavy server latency. Furthermore, many online tools rely on crude static lookup tables calculated solely for Ujjain or Greenwich, neglecting exact local sunrise variations.
            </p>
            <p className="mt-3">
              <strong>Hindu Calendar & Live Panchang</strong> was architected from the ground up as an ultra-fast, ad-free, 100% offline-first Progressive Web App (PWA).
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Cpu size={20} className="text-emerald-400" />
              <h2>2. Swiss Ephemeris & Lahiri (Chitra Paksha) Ayanamsa</h2>
            </div>
            <p>
              Our computational pipeline is powered by high-precision mathematical algorithms anchored to the renowned <strong>Swiss Ephemeris (sweph)</strong>—the international gold standard in astronomical accuracy based on NASA JPL DE431 planetary ephemerides:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-xs sm:text-sm pl-2">
              <li><strong>Nirayana (Sidereal) Zodiac:</strong> All planetary coordinates are converted from tropical positions using the official <em>Lahiri (Chitra Paksha) Ayanamsa</em>, officially endorsed by the Calendar Reform Committee of the Government of India.</li>
              <li><strong>Topocentric Horizon Calculation:</strong> Calculations account for atmospheric refraction and observer coordinates to determine true apparent sunrise and sunset with second-level precision.</li>
              <li><strong>Zero Latency:</strong> All calculations execute directly on the user&apos;s device in milliseconds using WebAssembly and optimized TypeScript, eliminating server round-trips entirely.</li>
            </ul>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <ShieldCheck size={20} className="text-amber-400" />
              <h2>3. Dharmashastra Canonical Fidelity</h2>
            </div>
            <p>
              Astrometry alone is insufficient without religious jurisprudence. Our calculation engine encapsulates canonical determination rules from classic texts:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0e1629] border border-[#233152]">
                <strong className="text-amber-300 block mb-1">Nirnayasindhu & Dharmasindhu</strong>
                Rigorous Udaya Tithi rules, Arunodaya Vedha detection for Ekadashi fasts, and Pradosha Vrat muhurat windows.
              </div>
              <div className="p-4 rounded-xl bg-[#0e1629] border border-[#233152]">
                <strong className="text-orange-300 block mb-1">Surya Siddhanta & Muhurta Chintamani</strong>
                Dina Mana 8-fold Choghadiya division and Panchak classification across Dhanishtha, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, and Revati.
              </div>
            </div>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Code2 size={20} className="text-blue-400" />
              <h2>4. Open Source Lineage & Community</h2>
            </div>
            <p>
              This project is built using Next.js 15, React 19, and Tailwind CSS. The complete codebase is publicly auditable on GitHub, inviting Vedic scholars, astrophysicists, and developers worldwide to verify, test, and contribute to our calculations.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-[#162038] py-8 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Hindu Calendar & Live Panchang • All Rights Reserved</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
