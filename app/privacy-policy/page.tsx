import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ShieldCheck, Lock, Eye, Server, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: "Privacy Policy | Hindu Calendar & Live Panchang",
  description: "Comprehensive privacy disclosures detailing client-side GPS computation, zero remote tracking, GDPR/CCPA compliance, and local storage usage.",
  alternates: {
    canonical: 'https://vikram-samvat-widget.vercel.app/privacy-policy'
  }
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Privacy & Data Security</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
        
        <div className="mb-10">
          <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">Compliance & Transparency</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-sm mt-2">
            Last Updated: September 18, 2026 • Compliant with GDPR, CCPA, and Google AdSense Guidelines
          </p>
        </div>

        <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
          
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Lock size={20} className="text-emerald-400" />
              <h2>1. Client-Side Geolocation & Astronomical Coordinate Processing</h2>
            </div>
            <p>
              The Hindu Calendar & Live Panchang micro-tool (<code>vikram-samvat-widget.vercel.app</code>) utilizes your approximate geographic latitude and longitude exclusively to calculate topocentric astronomical events—specifically local Sunrise, Sunset, Ishta Kaal, Dina Mana, and dynamic Choghadiya Muhurats.
            </p>
            <div className="mt-3 p-4 rounded-xl bg-[#0e1629] border border-[#233152] text-xs text-neutral-300">
              <strong className="text-emerald-300 block mb-1">Zero Remote Tracking Guarantee:</strong>
              All geolocation queries and ephemeris calculations occur <strong>100% locally within your client browser</strong>. We do not transmit, log, store, sell, or share your GPS coordinates or IP-derived location data on any external server or database.
            </div>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Server size={20} className="text-amber-400" />
              <h2>2. Local Storage & Offline Progressive Web App (PWA) Assets</h2>
            </div>
            <p>
              To provide an instantaneous, 100% offline experience, this application uses standard browser <code>localStorage</code> and the Cache Storage API (via our Service Worker):
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-xs sm:text-sm pl-2">
              <li><code>selected_city_location</code>: Caches your preferred city coordinate selection locally.</li>
              <li><code>last_panchang_notification_date</code>: Stores the calendar date when your daily morning notification was last shown to prevent redundant alerts.</li>
              <li>Service Worker Caches (<code>/sw.js</code>): Pre-caches static JavaScript, CSS, and manifest files to allow full functionality when your device has no internet connection.</li>
            </ul>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Eye size={20} className="text-orange-400" />
              <h2>3. Google AdSense & Third-Party Advertising Disclosures</h2>
            </div>
            <p>
              This website is designed to be compatible with Google AdSense standards. If third-party advertising services are active:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-xs sm:text-sm pl-2">
              <li>Third-party vendors, including Google, may use cookies to serve ads based on prior visits to this website or other websites on the internet.</li>
              <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Ads Settings</a> or through <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">aboutads.info</a>.</li>
            </ul>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <RefreshCw size={20} className="text-indigo-400" />
              <h2>4. Web Push Notification Architecture</h2>
            </div>
            <p>
              When you opt-in to automatic daily Tithi and Muhurat notifications, your browser issues a unique, anonymous Web Push subscription endpoint. This endpoint contains no personally identifiable information (PII) and is utilized solely to deliver context-aware Vedic astrometry alerts. You may revoke push notification permissions at any moment via your browser settings.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <h2 className="text-white font-bold text-lg mb-2">5. Data Controller & Contact Information</h2>
            <p className="text-xs sm:text-sm">
              If you have any questions or data inquiry requests regarding this Privacy Policy or our client-side computing architecture, please contact us via our <Link href="/contact" className="text-orange-400 hover:underline">Contact Portal</Link> or inspect our open-source codebase directly on GitHub.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-[#162038] py-8 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Hindu Calendar & Live Panchang • All Rights Reserved</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/about" className="hover:text-white">About Methodology</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
