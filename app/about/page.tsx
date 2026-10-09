import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Sparkles, Compass, ShieldCheck, Cpu, Code2, Clock, Globe, Award, Mail } from 'lucide-react';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: "About Us & Astrometric Methodology | Daily Tithi",
  description: "Learn about the engineering and Vedic scholarship behind Daily Tithi (dailytithi.com)—Swiss Ephemeris precision, Dharmashastra canons, Ghati/Pala clocks, and our mission for a fast, ad-light Vedic utility.",
  alternates: {
    canonical: 'https://www.dailytithi.com/about'
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
            <span>Back to Daily Tithi</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Sparkles size={16} className="text-orange-400" />
            <span>Methodology &amp; Mission</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
        
        <div className="mb-10">
          <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">Editorial Overview &amp; Engineering</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            About Daily Tithi
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-2">
            Restoring high-precision, ad-light Vedic astrometry to the global diaspora through modern systems engineering and canonical Dharmashastra algorithms at <strong>DailyTithi.com</strong>.
          </p>
        </div>

        <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1: The Mission */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Compass size={20} className="text-orange-400" />
              <h2>1. Our Mission: A Fast, Ad-Light, Bloat-Free Vedic Utility</h2>
            </div>
            <p>
              Traditional online panchang websites have historically delivered immense cultural value to millions of households worldwide. However, modern users are all too frequently subjected to aggressive popups, intrusive video auto-plays, cluttered layouts, slow page reloads, and heavy server latency. Even worse, many popular tools rely on crude pre-computed lookup tables calculated only for a single reference city (such as Ujjain or Greenwich), failing to reflect local sunrise differences.
            </p>
            <p className="mt-3">
              <strong>Daily Tithi</strong> (<code>https://dailytithi.com</code>) was engineered from first principles to provide a clean, dignified, lightning-fast, and ad-light alternative. We combine true client-side astronomical math with Progressive Web App (PWA) architecture so the calendar loads in milliseconds and functions completely offline.
            </p>
          </section>

          {/* Section 2: Swiss Ephemeris Precision */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Cpu size={20} className="text-emerald-400" />
              <h2>2. Astrometric Precision: Swiss Ephemeris &amp; Drik Ganita</h2>
            </div>
            <p>
              Our computational pipeline is powered by high-precision mathematical algorithms anchored to the renowned <strong>Swiss Ephemeris (sweph)</strong>—the international gold standard in planetary physics derived from NASA JPL DE431 astronomical ephemerides:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-xs sm:text-sm pl-2">
              <li>
                <strong>Lahiri (Chitra Paksha) Ayanamsa:</strong> All planetary coordinates are converted from tropical positions using the official <em>Lahiri Ayanamsa</em>, officially endorsed by the Calendar Reform Committee of the Government of India.
              </li>
              <li>
                <strong>Nirayana (Sidereal) Zodiac:</strong> True sidereal solar and lunar longitudes determine the 5 sacred limbs of the Panchang—<em>Tithi, Vara, Nakshatra, Yoga, and Karana</em>—with arc-second accuracy.
              </li>
              <li>
                <strong>True Topocentric Refraction:</strong> Atmospheric refraction is computed dynamically for your observer coordinates, ensuring apparent sunrise and sunset are accurate to the exact second.
              </li>
              <li>
                <strong>Zero Latency Client-Side Computation:</strong> Computations execute on your device in milliseconds using compiled WebAssembly and optimized TypeScript, eliminating reliance on remote calculation servers.
              </li>
            </ul>
          </section>

          {/* Section 3: Dharmashastra Canons */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <ShieldCheck size={20} className="text-amber-400" />
              <h2>3. Dharmashastra Canonical Fidelity</h2>
            </div>
            <p>
              Pure astrometry is incomplete without traditional canonical jurisprudence. Daily Tithi encapsulates determination rules codified in classic Sanskrit treatises:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0e1629] border border-[#233152]">
                <strong className="text-amber-300 block mb-1">Nirnayasindhu &amp; Dharmasindhu</strong>
                Rigorous Udaya Tithi determination (lunar day prevailing at local sunrise), Arunodaya Vedha detection for Ekadashi fasts, and Pradosha Vrat muhurat windows.
              </div>
              <div className="p-4 rounded-xl bg-[#0e1629] border border-[#233152]">
                <strong className="text-orange-300 block mb-1">Surya Siddhanta &amp; Muhurta Chintamani</strong>
                Dina Mana dynamic 8-fold Choghadiya division, Rahu Kalam, Yamaganda, Gulika Kaal, and Panchak classification across Dhanishtha, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, and Revati.
              </div>
            </div>
          </section>

          {/* Section 4: Live Sexagesimal Vedic Clocks */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Clock size={20} className="text-blue-400" />
              <h2>4. Real-Time Ghati, Pala &amp; Vipala Astronomical Clocks</h2>
            </div>
            <p>
              Unlike western solar clocks that count 24 equal hours from midnight, traditional Vedic chronometry divides the civil day (Ahoratra, from local sunrise to next sunrise) into <strong>60 Ghatis</strong>:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-[#0e1629] border border-[#233152] text-xs sm:text-sm">
              <ul className="space-y-1.5 text-neutral-300">
                <li>• <strong>1 Civil Day (Ahoratra)</strong> = 60 Ghatis (approx. 24 hours)</li>
                <li>• <strong>1 Ghati</strong> = 60 Palas = 24 minutes</li>
                <li>• <strong>1 Pala</strong> = 60 Vipalas = 24 seconds</li>
                <li>• <strong>1 Vipala</strong> = 0.4 seconds (216,000 Vipalas per day)</li>
              </ul>
              <p className="mt-2 text-neutral-400 text-xs">
                Daily Tithi renders an interactive, real-time <strong>Ishta Kaal</strong> clock that ticks continuously with local sunrise as its zero-point, giving practitioners access to continuous sexagesimal timekeeping.
              </p>
            </div>
          </section>

          {/* Section 5: Standards & Open Architecture */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Code2 size={20} className="text-purple-400" />
              <h2>5. Open Architecture &amp; E-E-A-T Standards</h2>
            </div>
            <p>
              Daily Tithi is built with Next.js 15, React 19, and Tailwind CSS, adhering to strict Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) principles. We believe cultural software should be open, auditable, and academically verifiable. Astrologers, astronomers, and software developers can inspect our calculations and contribute to our open-source codebase on GitHub.
            </p>
          </section>

          {/* Section 6: Contact & Editorial Inquiries */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Mail size={20} className="text-emerald-400" />
              <h2>6. Contact Our Editorial &amp; Engineering Team</h2>
            </div>
            <p>
              We welcome corrections, scholarly peer review, and suggestions from Vedic researchers worldwide:
            </p>
            <div className="mt-4 p-4 rounded-xl bg-[#0e1629] border border-[#233152] text-sm">
              <p className="text-white font-semibold">Daily Tithi Editorial Office</p>
              <p className="text-neutral-300 mt-1">Official Domain: <code>https://dailytithi.com</code></p>
              <p className="mt-1">
                Official Inquiries:{' '}
                <a href="mailto:contact@dailytithi.com" className="text-orange-400 font-mono font-medium hover:underline">
                  contact@dailytithi.com
                </a>
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />

    </div>
  );
}
