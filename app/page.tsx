import React from 'react';
import Link from 'next/link';
import { HinduPanchangWidget } from './components/HinduPanchangWidget';
import { WidgetErrorBoundary } from './components/WidgetErrorBoundary';
import { NavbarBrand } from './components/NavbarElements';
import { CitySearchModal } from './components/CitySearchModal';
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

      {/* Decorative ambient lighting: Rich Multi-Spectrum Vedic Cosmic Aurora */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.20)_0%,_rgba(234,88,12,0.10)_45%,_transparent_70%)]" />
        <div className="absolute top-[350px] -right-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(147,51,234,0.12)_0%,_transparent_70%)]" />
        <div className="absolute top-[750px] -left-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.10)_0%,_transparent_70%)]" />
        <div className="absolute top-[1300px] right-10 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.08)_0%,_transparent_70%)]" />
      </div>

      {/* ── Navbar: Brand & Live Status Indicator ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b16]/90 backdrop-blur-xl border-b border-[#162038]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)] select-none">
              🕉️
            </div>
            <NavbarBrand />
          </div>

          {/* Interactive City Search Matrix Modal */}
          <div className="flex items-center gap-2 shrink-0">
            <CitySearchModal />
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

        {/* ── Main Panchang Widget with Initial Server Data ── */}
        <div className="my-2 sm:my-4">
          <WidgetErrorBoundary>
            <HinduPanchangWidget initialData={initialData} initialLocation={DEFAULT_NCR_LOCATION} />
          </WidgetErrorBoundary>
        </div>

        {/* ── Single Unified Sponsorship & Advertisement Space ── */}
        <AdSlot slot="in-feed" categoryName="upcoming life milestone" />

        {/* ── Background Lock-Screen Alerts Setup ── */}
        <div className="my-6 w-full max-w-5xl mx-auto text-left">
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
        <div className="mt-12 text-left max-w-5xl mx-auto p-4 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1a0c02]/95 via-[#0e1629]/95 to-[#1a0c02]/95 border border-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.08)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase font-semibold">Dharmashastra Festival Hub</span>
              <h2 className="text-[clamp(1.15rem,4.5vw,1.75rem)] font-bold text-white drop-shadow-sm">
                Upcoming Vedic Vrats &amp; Festivals (2026–2027)
              </h2>
            </div>
            <span className="text-xs text-amber-300/80 font-mono bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Parana Windows &amp; Scriptural Rules
            </span>
          </div>

          <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
            Detailed scriptural dates, fasting guidelines, and exact Parana (fast-breaking) intervals for all major Sanatana Dharma observances:
          </p>

          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {Object.values(VRAT_DEFINITIONS).map((vrat) => (
              <Link
                key={vrat.slug}
                href={`/vrat/${vrat.slug}`}
                className="p-3 rounded-xl bg-[#1a0e05]/70 hover:bg-[#2a1708] border border-amber-500/25 hover:border-amber-400/60 text-xs text-neutral-200 hover:text-amber-200 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all flex flex-col justify-between min-h-[44px]"
              >
                <div className="flex items-start gap-1.5 mb-1">
                  <span className="text-base shrink-0 select-none">{vrat.icon}</span>
                  <span className="font-bold leading-snug break-words">{vrat.name}</span>
                </div>
                <div className="text-[10px] text-amber-300/80 font-devanagari mt-auto">{vrat.hindiName}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── PHASE 2: Programmatic Life-Event Muhurat Hubs ── */}
        <div className="mt-8 text-left max-w-5xl mx-auto p-4 sm:p-8 rounded-3xl bg-gradient-to-br from-[#021810]/95 via-[#091522]/95 to-[#021810]/95 border border-emerald-500/35 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase font-semibold">Life-Event Shubh Timings</span>
              <h2 className="text-[clamp(1.15rem,4.5vw,1.75rem)] font-bold text-white drop-shadow-sm">
                Monthly Shubh Karya Muhurat Hubs (12-Month Calendar)
              </h2>
            </div>
            <span className="text-xs text-emerald-300/80 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Rahu Kaal &amp; Bhadra Filtered
            </span>
          </div>

          <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
            Plan major life milestones with verified planetary alignment, favorable Nakshatra and Tithi combinations:
          </p>

          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {Object.values(MUHURAT_CATEGORIES).map((muhurat) => (
              <Link
                key={muhurat.slug}
                href={`/muhurat/${muhurat.slug}`}
                className="p-3.5 rounded-xl bg-[#031c13]/70 hover:bg-[#062c1e] border border-emerald-500/25 hover:border-emerald-400/60 text-xs text-neutral-200 hover:text-emerald-200 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex flex-col justify-between min-h-[44px]"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="text-base shrink-0 select-none">{muhurat.icon}</span>
                  <span className="font-bold leading-snug break-words">{muhurat.name}</span>
                </div>
                <div className="text-[11px] text-emerald-300/80 font-devanagari mt-auto">{muhurat.hindiName}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── PHASE 2: Programmatic SEO City Hub (50+ Cities) ── */}
        <div className="mt-8 text-left max-w-5xl mx-auto p-4 sm:p-8 rounded-3xl bg-gradient-to-br from-[#07132b]/95 via-[#0b162e]/95 to-[#07132b]/95 border border-sky-500/35 shadow-[0_0_30px_rgba(14,165,233,0.08)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span className="text-xs font-mono text-sky-400 tracking-wider uppercase font-semibold">Programmatic Vedic Hub</span>
              <h2 className="text-[clamp(1.15rem,4.5vw,1.75rem)] font-bold text-white drop-shadow-sm">
                Live City-Specific Panchang &amp; Muhurats
              </h2>
            </div>
            <span className="text-xs text-sky-300/80 font-mono bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
              {CITIES.length}+ Cities Available
            </span>
          </div>

          <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
            Select a city to inspect exact local sunrise, topocentric Dina Mana division, local Choghadiya timings, and Udaya Tithi:
          </p>

          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/panchang/${city.slug}`}
                className="px-3 py-2.5 rounded-xl bg-[#0a1838]/70 hover:bg-[#122554] border border-sky-500/25 hover:border-sky-400/60 text-xs text-neutral-200 hover:text-sky-200 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)] transition-all flex items-center min-h-[44px] truncate"
              >
                <span className="truncate">📍 {city.name}</span>
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
