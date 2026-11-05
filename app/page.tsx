import React from 'react';
import Link from 'next/link';
import { HinduPanchangWidget } from './components/HinduPanchangWidget';
import { WidgetErrorBoundary } from './components/WidgetErrorBoundary';
import { NavbarBrand } from './components/NavbarElements';
import { VedicEditorialGuide } from './components/VedicEditorialGuide';
import { FaqAccordion } from './components/FaqAccordion';
import { BackgroundAlertsSetup } from '@/src/components/BackgroundAlertsSetup';
import { Footer } from '@/src/components/Footer';
import { CITIES } from '@/src/lib/cities';
import { calculatePanchang, LocationCoordinates } from '@/src/lib/vedic-astronomy';
import { VRAT_DEFINITIONS } from '@/src/lib/vrat-data';
import { MUHURAT_CATEGORIES } from '@/src/lib/muhurat-data';
import { generatePanchangFaqSchema, generateBreadcrumbSchema } from '@/src/lib/seo-schemas';
import { AdSlot } from './components/AdSlot';
import { VedicConsultationCard } from './components/VedicConsultationCard';
import { PwaStandaloneBanner } from './components/PwaStandaloneBanner';
import { Sun, Moon, Clock, ShieldAlert, Sparkles, MapPin, Calendar, Heart } from 'lucide-react';

export const revalidate = 3600; // 1 hour ISR revalidation

const DEFAULT_NCR_LOCATION: LocationCoordinates = {
  name: 'New Delhi',
  country: 'India',
  latitude: 28.6692,
  longitude: 77.4538,
  timezone: 5.5,
  ianaTimezone: 'Asia/Kolkata',
  regionName: 'Delhi NCR'
};

export default async function LandingPage() {
  const now = new Date();
  
  // Pre-calculate today's complete Panchang data on the server using IST time & default NCR coordinates
  const initialData = calculatePanchang(now, DEFAULT_NCR_LOCATION);

  const serverFormattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const tithiObj = initialData.udayaTithi || initialData.tithi;
  const tithiName = tithiObj?.name || 'Pratipada';
  const pakshaName = tithiObj?.paksha || 'Shukla';
  const nakshatraName = initialData.nakshatra?.name || 'Ashwini';
  const masaName = initialData.masaDisplay || initialData.amantaMonth || 'Chaitra';
  const sunrise = initialData.sunrise || '06:30 AM';
  const sunset = initialData.sunset || '06:00 PM';
  const rahuStart = initialData.muhurats?.rahuKaal?.start || '09:00 AM';
  const rahuEnd = initialData.muhurats?.rahuKaal?.end || '10:30 AM';
  const abhijitStart = initialData.muhurats?.abhijitMuhurat?.start || '11:45 AM';
  const abhijitEnd = initialData.muhurats?.abhijitMuhurat?.end || '12:35 PM';

  // Dynamic SEO Structured Data
  const faqSchema = generatePanchangFaqSchema(initialData, 'New Delhi (NCR)');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://dailytithi.com' }
  ]);

  return (
    <div className="min-h-dvh w-full max-w-full bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden touch-pan-y pb-24">
      {/* ── Structured Data JSON-LD Schemas ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

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
            <NavbarBrand />
          </div>
        </div>
      </nav>

      {/* ── Hero Section with Live Widget & Dynamic Server Date ── */}
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-3 sm:px-6 max-w-6xl mx-auto text-center">
        <h1 className="sr-only">
          Daily Tithi — Real-Time High-Precision Vedic Panchang
        </h1>

        {/* ── PHASE 4: PWA Standalone App Banner ── */}
        <PwaStandaloneBanner />

        {/* ── PHASE 5: Slot 1 (Header Banner Ad - CLS = 0) ── */}
        <AdSlot slot="header" />

        {/* ── Plain-Text Server-Rendered Astronomical Summary (Instant Googlebot Indexation) ── */}
        <section 
          aria-label="Today Panchang Quick Summary" 
          className="my-3 p-3.5 sm:p-4 rounded-2xl bg-[#090e1a]/80 border border-[#1a2542] text-left max-w-5xl mx-auto text-xs sm:text-sm"
        >
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span>🌸</span>
              <span>Today&apos;s Panchang Summary ({serverFormattedDate}) — New Delhi / NCR</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              Vikram Samvat {initialData.vikramSamvat} • Shaka {initialData.shakaSamvat}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-xs">
            <div className="p-2 rounded-xl bg-[#0e1629] border border-[#233152]">
              <span className="text-neutral-400 block text-[10px]">Tithi &amp; Paksha</span>
              <span className="font-bold text-white truncate block">{pakshaName}- {tithiName}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0e1629] border border-[#233152]">
              <span className="text-neutral-400 block text-[10px]">Nakshatra</span>
              <span className="font-bold text-amber-300 truncate block">{nakshatraName}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0e1629] border border-[#233152]">
              <span className="text-neutral-400 block text-[10px]">Vedic Masa</span>
              <span className="font-bold text-white truncate block">{masaName}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0e1629] border border-[#233152]">
              <span className="text-neutral-400 block text-[10px]">Sunrise | Sunset</span>
              <span className="font-bold text-orange-300 truncate block">{sunrise} | {sunset}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0e1629] border border-[#233152]">
              <span className="text-rose-400 block text-[10px]">Rahu Kaal (Avoid)</span>
              <span className="font-bold text-rose-300 truncate block">{rahuStart}–{rahuEnd}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0e1629] border border-[#233152]">
              <span className="text-emerald-400 block text-[10px]">Abhijit Muhurat</span>
              <span className="font-bold text-emerald-300 truncate block">{abhijitStart}–{abhijitEnd}</span>
            </div>
          </div>
        </section>

        {/* ── Main Panchang Widget with Initial Server Data ── */}
        <div className="my-2 sm:my-4">
          <WidgetErrorBoundary>
            <HinduPanchangWidget initialData={initialData} initialLocation={DEFAULT_NCR_LOCATION} />
          </WidgetErrorBoundary>
        </div>

        {/* ── PHASE 5: Slot 2 (In-Feed Native Ad) & High-RPM Consultation Card ── */}
        <AdSlot slot="in-feed" />
        <VedicConsultationCard categoryName="upcoming life milestone" />

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
            <dt>Today Tithi</dt>
            <dd>{tithiName} ({pakshaName} Paksha)</dd>
            <dt>Nakshatra</dt>
            <dd>{nakshatraName}</dd>
            <dt>Vedic Month</dt>
            <dd>{masaName}</dd>
            <dt>Sunrise and Sunset</dt>
            <dd>Sunrise {sunrise}, Sunset {sunset}</dd>
            <dt>Rahu Kaal Window</dt>
            <dd>{rahuStart} to {rahuEnd}</dd>
            <dt>Abhijit Muhurat Window</dt>
            <dd>{abhijitStart} to {abhijitEnd}</dd>
            <dt>Active Eras</dt>
            <dd>Vikram Samvat {initialData.vikramSamvat}, Shaka Samvat {initialData.shakaSamvat}</dd>
            <dt>Astrometric Calculation Engine</dt>
            <dd>Swiss Ephemeris (DE431) with Nirayana Lahiri (Chitra Paksha) Ayanamsa</dd>
            <dt>Canonical Canons</dt>
            <dd>Nirnayasindhu, Dharmasindhu, Surya Siddhanta</dd>
          </dl>
        </section>

        {/* ── PHASE 2: Programmatic Vrat & Festival Hubs ── */}
        <div className="mt-12 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span className="text-xs font-mono text-orange-400 tracking-wider uppercase">Dharmashastra Festival Hub</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Upcoming Vedic Vrats &amp; Festivals (2026–2027)
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Parana Windows &amp; Scriptural Rules
            </span>
          </div>

          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Detailed scriptural dates, fasting guidelines, and exact Parana (fast-breaking) intervals for all major Sanatana Dharma observances:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {Object.values(VRAT_DEFINITIONS).map((vrat) => (
              <Link
                key={vrat.slug}
                href={`/vrat/${vrat.slug}`}
                className="p-2.5 rounded-xl bg-[#0e1629] hover:bg-[#16213d] border border-[#233152] hover:border-amber-500/40 text-xs text-neutral-300 hover:text-amber-300 transition-all block truncate"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span>{vrat.icon}</span>
                  <span className="font-bold truncate">{vrat.name}</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-devanagari truncate">{vrat.hindiName}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── PHASE 2: Programmatic Life-Event Muhurat Hubs ── */}
        <div className="mt-8 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase">Life-Event Shubh Timings</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Monthly Shubh Karya Muhurat Hubs (12-Month Calendar)
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Rahu Kaal &amp; Bhadra Filtered
            </span>
          </div>

          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Plan major life milestones with verified planetary alignment, favorable Nakshatra and Tithi combinations:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {Object.values(MUHURAT_CATEGORIES).map((muhurat) => (
              <Link
                key={muhurat.slug}
                href={`/muhurat/${muhurat.slug}`}
                className="p-3 rounded-xl bg-[#0e1629] hover:bg-[#16213d] border border-[#233152] hover:border-emerald-500/40 text-xs text-neutral-300 hover:text-emerald-300 transition-all block"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span>{muhurat.icon}</span>
                  <span className="font-bold truncate">{muhurat.name}</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-devanagari truncate">{muhurat.hindiName}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── PHASE 2: Programmatic SEO City Hub (50+ Cities) ── */}
        <div className="mt-8 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span className="text-xs font-mono text-orange-400 tracking-wider uppercase">Programmatic Vedic Hub</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Live City-Specific Panchang &amp; Muhurats
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              {CITIES.length}+ Cities Available
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

      {/* ── PHASE 5: Slot 3 (Sticky Bottom Anchor Ad - CLS = 0) ── */}
      <AdSlot slot="sticky-footer" />

      {/* ── Comprehensive Site Footer ── */}
      <Footer />

    </div>
  );
}
