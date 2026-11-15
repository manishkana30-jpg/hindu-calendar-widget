import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, MapPin, Compass, Sun, Moon, ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { TOP_CITIES, getCityConfig, CityConfig } from '@/src/lib/constants/cities';
import { calculatePanchang, LocationCoordinates } from '@/src/lib/vedic-astronomy';
import { HinduPanchangWidget } from '@/app/components/HinduPanchangWidget';
import { WidgetErrorBoundary } from '@/app/components/WidgetErrorBoundary';
import { VedicEditorialGuide } from '@/app/components/VedicEditorialGuide';
import { Footer } from '@/src/components/Footer';
import { AdSlot } from '@/app/components/AdSlot';
import { CitySearchModal } from '@/app/components/CitySearchModal';
import { generatePanchangFaqSchema, generateBreadcrumbSchema } from '@/src/lib/seo-schemas';

// ── Next.js 15 Incremental Static Regeneration (ISR) ──
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ city: string }>;
}

/**
 * Pre-renders static pages for all registered cities at build time.
 */
export async function generateStaticParams() {
  return Object.keys(TOP_CITIES).map((slug) => ({
    city: slug,
  }));
}

/**
 * Dynamic SEO Metadata for City Panchang Route
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityConfig(citySlug);

  if (!city) {
    return {
      title: 'City Panchang Not Found | Daily Tithi',
      description: 'The requested city coordinates could not be located in our Vedic database.',
    };
  }

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const title = `Today's Tithi & Panchang in ${city.name} (${dateFormatted}) | Shubh Muhurat & Rahu Kaal`;
  const description = `Live Vedic Panchang for ${city.name}, ${city.state}. Get exact Tithi, Paksha, Nakshatra, Sunrise, Sunset, Rahu Kaal, and Shubh Muhurat timings for ${dateFormatted}.`;
  const canonicalUrl = `https://dailytithi.com/panchang/${city.slug}`;
  const ogImageUrl = `https://dailytithi.com/api/og?city=${city.slug}`;

  return {
    title,
    description,
    keywords: [
      `Today tithi in ${city.name}`,
      `${city.name} Panchang today`,
      `Rahu Kaal ${city.name}`,
      `Abhijit Muhurat in ${city.name}`,
      `${city.name} Choghadiya`,
      `${city.name} Sunrise Sunset`,
      `${city.hindiName} पंचांग`,
      `${city.name} Tithi today`,
      'Daily Tithi',
      'Swiss Ephemeris',
      'Vedic Astrometry',
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': `https://dailytithi.com/panchang/${city.slug}`,
        'hi-IN': `https://dailytithi.com/hi/panchang/${city.slug}`,
        'mr-IN': `https://dailytithi.com/mr/panchang/${city.slug}`,
        'gu-IN': `https://dailytithi.com/gu/panchang/${city.slug}`,
        'x-default': `https://dailytithi.com/panchang/${city.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Daily Tithi',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${city.name} Today's Panchang & Rahu Kaal Preview Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

/**
 * Server Component: City Panchang Page with Instant SSR Hydration & Rich Schemas
 */
export default async function CityPanchangPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityConfig(citySlug);

  if (!city) {
    notFound();
  }

  const cityLocation: LocationCoordinates = {
    name: `${city.name}, ${city.state}`,
    country: 'India',
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: 5.5,
    ianaTimezone: city.timezone || 'Asia/Kolkata',
    regionName: city.state,
  };

  const now = new Date();
  const panchang = calculatePanchang(now, cityLocation);

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Cross-linking popular cities
  const popularCities = Object.values(TOP_CITIES)
    .filter((c) => c.slug !== city.slug)
    .slice(0, 16);

  // SEO Schemas
  const faqSchema = generatePanchangFaqSchema(panchang, city.name);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://dailytithi.com' },
    { name: 'Panchang', url: 'https://dailytithi.com/panchang/new-delhi' },
    { name: city.name, url: `https://dailytithi.com/panchang/${city.slug}` },
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
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b16]/90 backdrop-blur-xl border-b border-[#162038]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/" className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)] select-none">
              🕉️
            </Link>
            <div className="min-w-0">
              <span className="text-xs sm:text-base font-extrabold tracking-tight text-white block leading-snug truncate">
                {city.name} ({city.hindiName}) Today&apos;s Panchang
              </span>
              <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono tracking-wider uppercase block truncate">
                {city.state ? `${city.state}, ` : ''}India • Vedic Astrometry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CitySearchModal />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#11192e] hover:bg-[#16213d] border border-[#233152] text-xs font-semibold text-neutral-300 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Home Panchang</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main City Hero Section ── */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 max-w-6xl mx-auto text-center">
        {/* Breadcrumb Navigation for SEO Crawlers */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-neutral-400 flex items-center justify-center gap-2">
          <Link href="/" className="hover:text-amber-300">Home</Link>
          <span>/</span>
          <span>Panchang</span>
          <span>/</span>
          <span className="text-orange-400 font-semibold">{city.name}</span>
        </nav>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] sm:text-xs font-bold mb-3 backdrop-blur-md">
          <MapPin size={13} className="text-amber-400 shrink-0" />
          <span>{city.name} ({city.hindiName}), {city.state} • Coordinates: {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
          Today&apos;s Tithi &amp; Panchang in {city.name} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500">
            {formattedDate}
          </span>
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl mx-auto mb-4 leading-relaxed px-2">
          Topocentric Vedic calculations for {city.name} ({city.hindiName}), {city.state}. Real-time Udaya Tithi, exact Rahu Kaal timings, Shubh Abhijit Muhurat, Dina Mana Choghadiya, and Sunrise/Sunset.
        </p>

        {/* ── Crawlable Plain-Text Summary for Search Bots ── */}
        <div className="sr-only" aria-label="Astronomical Summary for Search Engines">
          <h2>Astronomical Values for {city.name} on {formattedDate}</h2>
          <p>Location: {city.name} ({city.hindiName}), {city.state}, India. Coordinates: {city.latitude} N, {city.longitude} E.</p>
          <p>Tithi: {panchang.udayaTithi?.name || panchang.tithi.name} ({panchang.udayaTithi?.paksha || panchang.tithi.paksha} Paksha)</p>
          <p>Nakshatra: {panchang.nakshatra?.name || 'Ashwini'}</p>
          <p>Sunrise: {panchang.sunrise}, Sunset: {panchang.sunset}</p>
          <p>Rahu Kaal: {panchang.muhurats?.rahuKaal?.start} to {panchang.muhurats?.rahuKaal?.end}</p>
          <p>Abhijit Muhurat: {panchang.muhurats?.abhijitMuhurat?.start} to {panchang.muhurats?.abhijitMuhurat?.end}</p>
        </div>

        {/* ── PHASE 5: Slot 1 (Header Banner Ad - CLS = 0) ── */}
        <AdSlot slot="header" />

        {/* ── Main Panchang Widget Pre-loaded for this City with initialCity & initialData ── */}
        <div className="my-4 sm:my-6">
          <WidgetErrorBoundary>
            <HinduPanchangWidget
              initialCity={city}
              initialLocation={cityLocation}
              initialData={panchang}
              isCityPage={true}
              initialLanguage="en"
            />
          </WidgetErrorBoundary>
        </div>

        {/* ── Single Unified Sponsorship & Advertisement Space ── */}
        <AdSlot slot="in-feed" categoryName={`event in ${city.name}`} />

        {/* ── Localized Astrometric Summary Block ── */}
        <section className="mt-8 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#11192e]/90 via-[#090e1a]/95 to-[#11192e]/90 border border-[#1e2d4d] shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Compass size={20} />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase font-semibold">Local Geodetic Astrometry</span>
              <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">
                How Vedic Panchang is Calculated for {city.name} ({city.hindiName})
              </h2>
            </div>
          </div>

          <div className="text-neutral-300 text-xs sm:text-sm leading-relaxed space-y-3">
            <p>
              In authentic Vedic astrometry, sacred timings are strictly topocentric and cannot be generalized from another city. For <strong>{city.name}</strong> ({city.latitude > 0 ? `${city.latitude}°N` : `${Math.abs(city.latitude)}°S`}, {city.longitude > 0 ? `${city.longitude}°E` : `${Math.abs(city.longitude)}°W`}), today&apos;s astronomical solar events govern all ritual timings:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1c1202]/90 to-[#120a02]/90 border border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                  <Sun size={14} />
                  <span className="font-bold">Local Sunrise</span>
                </div>
                <span className="text-base font-bold text-amber-100">{panchang.sunrise}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1a0818]/90 to-[#120614]/90 border border-purple-500/35 shadow-[0_0_15px_rgba(168,85,247,0.08)]">
                <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                  <Moon size={14} />
                  <span className="font-bold">Local Sunset</span>
                </div>
                <span className="text-base font-bold text-purple-100">{panchang.sunset}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1a0509]/90 to-[#120306]/90 border border-rose-500/35 shadow-[0_0_15px_rgba(244,63,94,0.08)]">
                <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                  <ShieldAlert size={14} />
                  <span className="font-bold">Rahu Kaal</span>
                </div>
                <span className="text-base font-bold text-rose-300">
                  {panchang.muhurats?.rahuKaal ? `${panchang.muhurats.rahuKaal.start} – ${panchang.muhurats.rahuKaal.end}` : 'Avoid'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#021810]/90 to-[#02100b]/90 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
                <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                  <Clock size={14} />
                  <span className="font-bold">Abhijit Muhurat</span>
                </div>
                <span className="text-base font-bold text-emerald-300">
                  {panchang.muhurats?.abhijitMuhurat ? `${panchang.muhurats.abhijitMuhurat.start} – ${panchang.muhurats.abhijitMuhurat.end}` : 'Shubh'}
                </span>
              </div>
            </div>

            <p>
              <strong>Dina Mana:</strong> The daylight span between {city.name}&apos;s local sunrise ({panchang.sunrise}) and sunset ({panchang.sunset}) (total daylight: {panchang.dayLength}) is precisely divided into 8 equal daytime segments. This ensures that Rahu Kaal, Gulika Kaal, and Choghadiyas adhere strictly to the injunctions of Nirnayasindhu and Surya Siddhanta.
            </p>
          </div>
        </section>

        {/* ── Internal Linking Web: Other High-Volume Cities ── */}
        <section className="mt-8 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#07132b]/95 via-[#0b162e]/95 to-[#07132b]/95 border border-sky-500/35 shadow-[0_0_30px_rgba(14,165,233,0.08)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
            <div>
              <span className="text-xs font-mono text-sky-400 tracking-wider uppercase font-semibold">City Network</span>
              <h2 className="text-base sm:text-lg font-bold text-white drop-shadow-sm">
                Explore Vedic Panchang in Other Major Cities
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularCities.map((c) => (
              <Link
                key={c.slug}
                href={`/panchang/${c.slug}`}
                className="px-3 py-1.5 rounded-xl bg-[#0a1838]/70 hover:bg-[#122554] border border-sky-500/25 hover:border-sky-400/60 text-xs text-neutral-200 hover:text-sky-200 hover:shadow-[0_0_12px_rgba(14,165,233,0.2)] transition-all"
              >
                📍 {c.name} ({c.hindiName}) Panchang
              </Link>
            ))}
          </div>
        </section>

        {/* ── Authoritative Editorial Section ── */}
        <VedicEditorialGuide />

        {/* ── City-Specific Dynamic FAQ Accordion ── */}
        <section className="mt-12 text-left max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Frequently Asked Questions for {city.name} ({city.hindiName}) Panchang
          </h2>
          <div className="space-y-3">
            <details className="group p-4 rounded-2xl bg-[#090e1a]/90 border border-[#1a2542] open:bg-gradient-to-r open:from-[#140b03]/80 open:via-[#090e1a] open:to-[#140b03]/80 open:border-amber-500/40 shadow-sm transition-all">
              <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                <span>What is today&apos;s Tithi and Paksha in {city.name}?</span>
                <span className="text-amber-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Today in {city.name}, the active Tithi is <strong>{panchang.udayaTithi?.name || panchang.tithi.name}</strong> during <strong>{panchang.udayaTithi?.paksha || panchang.tithi.paksha} Paksha</strong>, ending at approximately {panchang.udayaTithi?.endTime || panchang.tithi.endTime}.
              </p>
            </details>

            <details className="group p-4 rounded-2xl bg-[#090e1a]/90 border border-[#1a2542] open:bg-gradient-to-r open:from-[#140b03]/80 open:via-[#090e1a] open:to-[#140b03]/80 open:border-amber-500/40 shadow-sm transition-all">
              <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                <span>What is today&apos;s Rahu Kaal timing in {city.name}?</span>
                <span className="text-amber-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Rahu Kaal in {city.name} today is from <strong>{panchang.muhurats?.rahuKaal?.start || '09:00 AM'} to {panchang.muhurats?.rahuKaal?.end || '10:30 AM'}</strong>. Auspicious beginnings, property purchases, and major contracts should be avoided during this window.
              </p>
            </details>

            <details className="group p-4 rounded-2xl bg-[#090e1a]/90 border border-[#1a2542] open:bg-gradient-to-r open:from-[#140b03]/80 open:via-[#090e1a] open:to-[#140b03]/80 open:border-amber-500/40 shadow-sm transition-all">
              <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                <span>What is today&apos;s Abhijit Muhurat in {city.name}?</span>
                <span className="text-amber-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Today&apos;s Abhijit Muhurat in {city.name} is from <strong>{panchang.muhurats?.abhijitMuhurat?.start || '11:45 AM'} to {panchang.muhurats?.abhijitMuhurat?.end || '12:35 PM'}</strong>. This mid-day window dispels countless doshas and is universally auspicious.
              </p>
            </details>
          </div>
        </section>

      </main>

      {/* ── PHASE 5: Slot 3 (Sticky Bottom Anchor Ad - CLS = 0) ── */}
      <AdSlot slot="sticky-footer" />

      {/* ── Footer ── */}
      <Footer cityName={city.name} />
    </div>
  );
}
