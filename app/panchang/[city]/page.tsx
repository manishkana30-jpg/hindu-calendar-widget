import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, MapPin, Compass, Sun, Moon, ArrowLeft, Clock, ShieldAlert, Share2 } from 'lucide-react';
import { CITIES, getCityBySlug, getAllCitySlugs } from '@/src/lib/cities';
import { calculatePanchang } from '@/src/lib/vedic-astronomy';
import { HinduPanchangWidget } from '@/app/components/HinduPanchangWidget';
import { WidgetErrorBoundary } from '@/app/components/WidgetErrorBoundary';
import { VedicEditorialGuide } from '@/app/components/VedicEditorialGuide';
import { FaqAccordion } from '@/app/components/FaqAccordion';
import { Footer } from '@/src/components/Footer';
import { AdSlot } from '@/app/components/AdSlot';
import { VedicConsultationCard } from '@/app/components/VedicConsultationCard';
import { generatePanchangFaqSchema, generateBreadcrumbSchema } from '@/src/lib/seo-schemas';

export const revalidate = 3600; // 1 hour ISR revalidation

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCitySlugs();
  return slugs.map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

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
    year: 'numeric'
  });

  const title = `Today's Tithi & Panchang in ${city.name} (${dateFormatted}) | Rahu Kaal & Shubh Muhurat`;
  const description = `Accurate today's Vedic Panchang in ${city.name}, ${city.country}. Exact Udaya Tithi, Rahu Kaal (${city.name} time), Shubh Abhijit Muhurat, Choghadiya, Nakshatra, and Sunrise/Sunset powered by Swiss Ephemeris.`;
  const canonicalUrl = `https://dailytithi.com/panchang/${city.slug}`;
  const ogImageUrl = `https://dailytithi.com/api/og?city=${city.slug}`;

  return {
    title,
    description,
    keywords: [
      `Today tithi in ${city.name}`, `${city.name} Panchang today`, `Rahu Kaal ${city.name}`,
      `Abhijit Muhurat in ${city.name}`, `${city.name} Choghadiya`, `${city.name} Sunrise Sunset`,
      'Daily Tithi', 'Swiss Ephemeris', 'Vedic Astrometry'
    ],
    alternates: {
      canonical: canonicalUrl,
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

export default async function CityPanchangPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  const cityLocation = {
    name: `${city.name}, ${city.country}`,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
    ianaTimezone: city.ianaTimezone,
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

  const shortDateFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Cross-linking popular cities
  const popularCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 16);

  // SEO Schemas
  const faqSchema = generatePanchangFaqSchema(panchang, city.name);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://dailytithi.com' },
    { name: 'Panchang', url: 'https://dailytithi.com/panchang/delhi' },
    { name: city.name, url: `https://dailytithi.com/panchang/${city.slug}` }
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
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b16]/90 backdrop-blur-xl border-b border-[#162038]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/" className="text-xl sm:text-2xl drop-shadow-md shrink-0 select-none">
              🕉️
            </Link>
            <div className="min-w-0">
              <span className="text-xs sm:text-base font-extrabold tracking-tight text-white block leading-snug truncate">
                {city.name} Today&apos;s Panchang
              </span>
              <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono tracking-wider uppercase block truncate">
                {city.state ? `${city.state}, ` : ''}{city.country} • Vedic Astrometry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
          <span>{city.name}, {city.country} Coordinates: {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
          Today&apos;s Tithi &amp; Panchang in {city.name} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500">
            {formattedDate}
          </span>
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl mx-auto mb-4 leading-relaxed px-2">
          Topocentric astronomical calculations for {city.name}. Real-time Udaya Tithi, exact Rahu Kaal timings, Shubh Abhijit Muhurat, Dina Mana Choghadiya, and Sunrise/Sunset.
        </p>

        {/* ── PHASE 5: Slot 1 (Header Banner Ad - CLS = 0) ── */}
        <AdSlot slot="header" />

        {/* ── Main Panchang Widget Pre-loaded for this City ── */}
        <div className="my-4 sm:my-6">
          <WidgetErrorBoundary>
            <HinduPanchangWidget initialLocation={cityLocation} initialData={panchang} isCityPage={true} />
          </WidgetErrorBoundary>
        </div>

        {/* ── PHASE 5: Slot 2 (In-Feed Native Ad) & High-RPM Consultation Card ── */}
        <AdSlot slot="in-feed" />
        <VedicConsultationCard categoryName={`event in ${city.name}`} />

        {/* ── Localized Astrometric Summary Block ── */}
        <section className="mt-8 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <span className="text-xs font-mono text-orange-400 tracking-wider uppercase">Local Geodetic Astrometry</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                How Vedic Panchang is Calculated for {city.name}
              </h2>
            </div>
          </div>

          <div className="text-neutral-300 text-xs sm:text-sm leading-relaxed space-y-3">
            <p>
              In authentic Vedic astrometry, sacred timings are strictly topocentric and cannot be generalized from another city. For <strong>{city.name}</strong> ({city.latitude > 0 ? `${city.latitude}°N` : `${Math.abs(city.latitude)}°S`}, {city.longitude > 0 ? `${city.longitude}°E` : `${Math.abs(city.longitude)}°W`}), today&apos;s astronomical solar events govern all ritual timings:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#233152]">
                <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                  <Sun size={14} />
                  <span className="font-bold">Local Sunrise</span>
                </div>
                <span className="text-base font-bold text-white">{panchang.sunrise}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#233152]">
                <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                  <Moon size={14} />
                  <span className="font-bold">Local Sunset</span>
                </div>
                <span className="text-base font-bold text-white">{panchang.sunset}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#233152]">
                <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                  <ShieldAlert size={14} />
                  <span className="font-bold">Rahu Kaal</span>
                </div>
                <span className="text-base font-bold text-rose-300">
                  {panchang.muhurats?.rahuKaal ? `${panchang.muhurats.rahuKaal.start} – ${panchang.muhurats.rahuKaal.end}` : 'Avoid'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#233152]">
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
        <section className="mt-8 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl">
          <h2 className="text-base sm:text-lg font-bold text-white mb-3">
            Explore Vedic Panchang in Other Major Cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {popularCities.map((c) => (
              <Link
                key={c.slug}
                href={`/panchang/${c.slug}`}
                className="px-3 py-1.5 rounded-xl bg-[#11192e] hover:bg-[#16213d] border border-[#233152] text-xs text-neutral-300 hover:text-amber-300 transition-colors"
              >
                📍 {c.name} Panchang
              </Link>
            ))}
          </div>
        </section>

        {/* ── Authoritative Editorial Section ── */}
        <VedicEditorialGuide />

        {/* ── City-Specific Dynamic FAQ Accordion ── */}
        <section className="mt-12 text-left max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Frequently Asked Questions for {city.name} Panchang
          </h2>
          <div className="space-y-3">
            <details className="group p-4 rounded-2xl bg-[#090e1a] border border-[#1a2542] open:border-orange-500/40">
              <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                <span>What is today&apos;s Tithi and Paksha in {city.name}?</span>
                <span className="text-orange-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Today in {city.name}, the active Tithi is <strong>{panchang.udayaTithi?.name || panchang.tithi.name}</strong> during <strong>{panchang.udayaTithi?.paksha || panchang.tithi.paksha} Paksha</strong>, ending at approximately {panchang.udayaTithi?.endTime || panchang.tithi.endTime}.
              </p>
            </details>

            <details className="group p-4 rounded-2xl bg-[#090e1a] border border-[#1a2542] open:border-orange-500/40">
              <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                <span>What is today&apos;s Rahu Kaal timing in {city.name}?</span>
                <span className="text-orange-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Rahu Kaal in {city.name} today is from <strong>{panchang.muhurats?.rahuKaal?.start || '09:00 AM'} to {panchang.muhurats?.rahuKaal?.end || '10:30 AM'}</strong>. Auspicious beginnings, property purchases, and major contracts should be avoided during this window.
              </p>
            </details>

            <details className="group p-4 rounded-2xl bg-[#090e1a] border border-[#1a2542] open:border-orange-500/40">
              <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                <span>What is today&apos;s Abhijit Muhurat in {city.name}?</span>
                <span className="text-orange-400 group-open:rotate-180 transition-transform">▼</span>
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
