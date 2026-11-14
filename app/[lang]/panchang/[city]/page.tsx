import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Compass, Sun, Moon, ArrowLeft, Clock, ShieldAlert, Globe } from 'lucide-react';
import { TOP_CITIES, getCityConfig, CityConfig, getLocalizedCityName, REGIONAL_CITY_NAMES } from '@/src/lib/constants/cities';
import { calculatePanchang, LocationCoordinates } from '@/src/lib/vedic-astronomy';
import { HinduPanchangWidget } from '@/app/components/HinduPanchangWidget';
import { WidgetErrorBoundary } from '@/app/components/WidgetErrorBoundary';
import { VedicEditorialGuide } from '@/app/components/VedicEditorialGuide';
import { Footer } from '@/src/components/Footer';
import { AdSlot } from '@/app/components/AdSlot';
import { VedicConsultationCard } from '@/app/components/VedicConsultationCard';
import { CitySearchModal } from '@/app/components/CitySearchModal';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { SupportedLanguage } from '@/src/lib/i18n/translations';
import { generatePanchangFaqSchema, generateBreadcrumbSchema } from '@/src/lib/seo-schemas';

// ── Next.js 15 Incremental Static Regeneration (ISR) ──
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true;

const VALID_LANGS: SupportedLanguage[] = ['hi', 'mr', 'gu'];

interface PageProps {
  params: Promise<{ lang: string; city: string }>;
}

/**
 * Pre-renders static pages for all regional language and city combinations at build time.
 */
export async function generateStaticParams() {
  const cities = Object.keys(TOP_CITIES);
  const params: { lang: string; city: string }[] = [];
  for (const lang of VALID_LANGS) {
    for (const city of cities) {
      params.push({ lang, city });
    }
  }
  return params;
}

/**
 * Dynamic Multi-Lingual SEO Metadata with Bidirectional hreflang
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, city: citySlug } = await params;

  if (!VALID_LANGS.includes(lang as SupportedLanguage)) {
    return {
      title: 'Panchang Not Found | Daily Tithi',
    };
  }

  const city = getCityConfig(citySlug);
  if (!city) {
    return {
      title: 'City Panchang Not Found | Daily Tithi',
      description: 'The requested city coordinates could not be located in our Vedic database.',
    };
  }

  const localizedCity = getLocalizedCityName(city, lang);
  const now = new Date();
  const localeMap: Record<string, string> = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
  };
  const currentLocale = localeMap[lang] || 'hi-IN';

  const dateFormatted = now.toLocaleDateString(currentLocale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Localized Titles & Descriptions
  let title = `${localizedCity} में आज का पंचांग और तिथि (${dateFormatted}) | शुभ मुहूर्त, राहु काल`;
  let description = `${localizedCity} (${city.state}) का आज का दैनिक वैदिक पंचांग। आज की उदया तिथि, नक्षत्र, सूर्योदय, सूर्यास्त, राहु काल और शुभ अभिजीत मुहूर्त का सटीक समय।`;

  if (lang === 'mr') {
    title = `${localizedCity} आजचे पंचांग व तिथी (${dateFormatted}) | शुभ मुहूर्त, राहु काळ`;
    description = `${localizedCity} (${city.state}) चे आजचे वैदिक पंचांग. आजची तिथी, नक्षत्र, सूर्योदय, सूर्यास्त, राहु काळ आणि शुभ मुहूर्त अचूक वेळेसह.`;
  } else if (lang === 'gu') {
    title = `${localizedCity} આજનું પંચાંગ અને તિથિ (${dateFormatted}) | શુભ મુહૂર્ત, રાહુ કાળ`;
    description = `${localizedCity} (${city.state}) નું આજનું દૈનિક વૈદિક પંચાંગ. આજની તિથિ, નક્ષત્ર, સૂર્યોદય, સૂર્યાસ્ત, રાહુ કાળ અને શુભ ચોઘડિયા નો ચોક્કસ સમય.`;
  }

  const canonicalUrl = `https://dailytithi.com/${lang}/panchang/${city.slug}`;
  const ogImageUrl = `https://dailytithi.com/api/og?city=${city.slug}`;

  const ogLocaleMap: Record<string, string> = {
    hi: 'hi_IN',
    mr: 'mr_IN',
    gu: 'gu_IN',
  };

  return {
    title,
    description,
    keywords: [
      `${localizedCity} पंचांग आज`,
      `आज की तिथि ${localizedCity}`,
      `${localizedCity} राहु काल`,
      `${localizedCity} चौघड़िया`,
      `${localizedCity} सूर्योदय सूर्यास्त`,
      `आज का पंचांग ${localizedCity}`,
      `शुभ मुहूर्त ${localizedCity}`,
      `${city.name} panchang today`,
      `Daily Tithi ${localizedCity}`,
      'Vedic Astrometry',
      'Swiss Ephemeris',
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
      locale: ogLocaleMap[lang] || 'hi_IN',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Daily Tithi',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${localizedCity} Today's Panchang & Rahu Kaal Preview Card`,
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
 * Server Component: Multi-Lingual Programmatic City Route
 */
export default async function RegionalCityPanchangPage({ params }: PageProps) {
  const { lang, city: citySlug } = await params;

  if (!VALID_LANGS.includes(lang as SupportedLanguage)) {
    notFound();
  }

  const city = getCityConfig(citySlug);
  if (!city) {
    notFound();
  }

  const localizedCity = getLocalizedCityName(city, lang);

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

  const localeMap: Record<string, string> = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
  };
  const currentLocale = localeMap[lang] || 'hi-IN';

  const formattedDate = now.toLocaleDateString(currentLocale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Cross-linking popular cities in regional script
  const popularCities = Object.values(TOP_CITIES)
    .filter((c) => c.slug !== city.slug)
    .slice(0, 16);

  // Localized Breadcrumb Names
  const homeLabels: Record<string, string> = {
    hi: 'होम',
    mr: 'मुख्यपृष्ठ',
    gu: 'મુખ્ય પૃષ્ઠ',
  };
  const panchangLabels: Record<string, string> = {
    hi: 'पंचांग',
    mr: 'पंचांग',
    gu: 'પંચાંગ',
  };

  // SEO Schemas
  const faqSchema = generatePanchangFaqSchema(panchang, city.name, lang, localizedCity);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: homeLabels[lang] || 'Home', url: 'https://dailytithi.com' },
    { name: panchangLabels[lang] || 'Panchang', url: `https://dailytithi.com/${lang}/panchang/new-delhi` },
    { name: localizedCity, url: `https://dailytithi.com/${lang}/panchang/${city.slug}` },
  ]);

  // Localized Heading Strings
  const heroHeadingPrefix: Record<string, string> = {
    hi: 'में आज की तिथि और पंचांग',
    mr: 'आजची तिथी व वैदिक पंचांग',
    gu: 'આજની તિથિ અને વૈદિક પંચાંગ',
  };

  const heroSubtext: Record<string, string> = {
    hi: `${localizedCity} (${city.state}) के लिए वास्तविक सूर्योदय पर आधारित उदया तिथि, राहु काल, शुभ अभिजीत मुहूर्त, दिनमान चौघड़िया और ग्रह स्थिति।`,
    mr: `${localizedCity} (${city.state}) साठी स्थानिक सूर्योदयावर आधारित उदया तिथी, राहु काळ, शुभ मुहूर्त आणि दिनमान चौघडिया.`,
    gu: `${localizedCity} (${city.state}) માટે સ્થાનિક સૂર્યોદય પર આધારિત ઉદયા તિથિ, રાહુ કાળ, શુભ અભિજીત મુહૂર્ત અને ચોઘડિયા.`,
  };

  return (
    <LanguageProvider defaultLanguage={lang as SupportedLanguage}>
      <div className="min-h-dvh w-full max-w-full bg-[#fcf8f0] dark:bg-[#050811] text-stone-900 dark:text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-950 dark:selection:text-orange-200 overflow-x-hidden touch-pan-y pb-24 transition-colors duration-200">
        {/* ── Structured Data JSON-LD Schemas ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* Decorative ambient lighting: Dawn Sunbeams & Cosmic Vedic Aurora */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.18)_0%,_rgba(234,88,12,0.08)_45%,_transparent_70%)]" />
          <div className="hidden dark:block absolute top-[350px] -right-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(147,51,234,0.12)_0%,_transparent_70%)]" />
          <div className="hidden dark:block absolute top-[750px] -left-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.10)_0%,_transparent_70%)]" />
        </div>

        {/* ── Navbar ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fffdf9]/90 dark:bg-[#070b16]/90 backdrop-blur-xl border-b border-[#e7d8be] dark:border-[#162038] transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link href="/" className="w-9 h-9 rounded-2xl bg-amber-500/15 dark:bg-gradient-to-br dark:from-amber-500/20 dark:via-orange-500/15 dark:to-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)] select-none">
                🕉️
              </Link>
              <div className="min-w-0">
                <span className="text-xs sm:text-base font-extrabold tracking-tight text-stone-900 dark:text-white block leading-snug truncate">
                  {localizedCity} {lang === 'hi' ? 'आज का पंचांग' : lang === 'mr' ? 'आजचे पंचांग' : 'આજનું પંચાંગ'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-orange-600 dark:text-orange-400 font-mono tracking-wider uppercase block truncate">
                  {city.state ? `${city.state}, ` : ''}India • Vedic Astrometry
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <CitySearchModal />
              <Link
                href={`/panchang/${city.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ede2cb] dark:bg-[#11192e] hover:bg-[#e2d3b5] dark:hover:bg-[#16213d] border border-[#d8c7a8] dark:border-[#233152] text-xs font-semibold text-stone-700 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white transition-colors shrink-0"
              >
                <Globe size={13} className="text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">English</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Main City Hero Section ── */}
        <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 max-w-6xl mx-auto text-center">
          {/* Breadcrumb Navigation for SEO Crawlers */}
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Link href="/" className="hover:text-amber-300">{homeLabels[lang] || 'Home'}</Link>
            <span>/</span>
            <Link href={`/${lang}/panchang/new-delhi`} className="hover:text-amber-300">{panchangLabels[lang] || 'Panchang'}</Link>
            <span>/</span>
            <span className="text-orange-400 font-semibold">{localizedCity}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] sm:text-xs font-bold mb-3 backdrop-blur-md">
            <MapPin size={13} className="text-amber-400 shrink-0" />
            <span>{localizedCity} ({city.name}), {city.state} • Coordinates: {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            {lang === 'hi' ? `${localizedCity} ${heroHeadingPrefix.hi}` : lang === 'mr' ? `${localizedCity} ${heroHeadingPrefix.mr}` : `${localizedCity} ${heroHeadingPrefix.gu}`} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500">
              {formattedDate}
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl mx-auto mb-4 leading-relaxed px-2">
            {heroSubtext[lang] || heroSubtext.hi}
          </p>

          {/* ── Crawlable Plain-Text Summary for Search Bots in Local Script ── */}
          <div className="sr-only" aria-label="Astronomical Summary for Search Engines">
            <h2>{localizedCity} ({city.name}) Astronomical Summary for {formattedDate}</h2>
            <p>स्थान: {localizedCity}, {city.state}, भारत. अक्षांश-देशांतर: {city.latitude} N, {city.longitude} E.</p>
            <p>तिथि: {panchang.udayaTithi?.name || panchang.tithi.name} ({panchang.udayaTithi?.paksha || panchang.tithi.paksha} पक्ष)</p>
            <p>नक्षत्र: {panchang.nakshatra?.name || 'Ashwini'}</p>
            <p>सूर्योदय: {panchang.sunrise}, सूर्यास्त: {panchang.sunset}</p>
            <p>राहु काल: {panchang.muhurats?.rahuKaal?.start} से {panchang.muhurats?.rahuKaal?.end}</p>
            <p>अभिजीत मुहूर्त: {panchang.muhurats?.abhijitMuhurat?.start} से {panchang.muhurats?.abhijitMuhurat?.end}</p>
          </div>

          {/* ── PHASE 5: Slot 1 (Header Banner Ad - CLS = 0) ── */}
          <AdSlot slot="header" />

          {/* ── Main Panchang Widget Pre-loaded for this City with initialCity & initialLanguage ── */}
          <div className="my-4 sm:my-6">
            <WidgetErrorBoundary>
              <HinduPanchangWidget
                initialCity={city}
                initialLocation={cityLocation}
                initialData={panchang}
                initialLanguage={lang as SupportedLanguage}
                isCityPage={true}
              />
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
                  {lang === 'hi'
                    ? `${localizedCity} के लिए वैदिक पंचांग गणना की प्रामाणिकता`
                    : lang === 'mr'
                    ? `${localizedCity} साठी वैदिक पंचांग गणना`
                    : `${localizedCity} માટે વૈદિક પંચાંગ ગણતરી`}
                </h2>
              </div>
            </div>

            <div className="text-neutral-300 text-xs sm:text-sm leading-relaxed space-y-3">
              <p>
                {lang === 'hi' ? (
                  <>वैदिक ज्योतिष और धर्मशास्त्र के अनुसार, किसी भी नगर का पंचांग केवल उसी स्थान के अक्षांश ({city.latitude}°N) और देशांतर ({city.longitude}°E) पर आधारित सूर्योदय और सूर्यास्त से ही मान्य होता है। <strong>{localizedCity}</strong> के लिए आज की मुख्य खगोलीय सीमाएं:</>
                ) : lang === 'mr' ? (
                  <>वैदिक ज्योतिषशास्त्रानुसार प्रत्येक शहराचे पंचांग स्थानिक अक्षांश ({city.latitude}°N) आणि रेखांश ({city.longitude}°E) वर आधारित असते. <strong>{localizedCity}</strong> साठी आजच्या मुख्य वेळा:</>
                ) : (
                  <>વૈદિક જ્યોતિષ મુજબ દરેક શહેરનું પંચાંગ સ્થાનિક અક્ષાંશ ({city.latitude}°N) અને રેખાંશ ({city.longitude}°E) પર આધારિત હોય છે. <strong>{localizedCity}</strong> માટે આજની મુખ્ય ગણતરી:</>
                )}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#233152]">
                  <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                    <Sun size={14} />
                    <span className="font-bold">{lang === 'hi' ? 'सूर्योदय' : lang === 'mr' ? 'सूर्योदय' : 'સૂર્યોદય'}</span>
                  </div>
                  <span className="text-base font-bold text-white">{panchang.sunrise}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#233152]">
                  <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                    <Moon size={14} />
                    <span className="font-bold">{lang === 'hi' ? 'सूर्यास्त' : lang === 'mr' ? 'सूर्यास्त' : 'સૂર્યાસ્ત'}</span>
                  </div>
                  <span className="text-base font-bold text-white">{panchang.sunset}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#233152]">
                  <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                    <ShieldAlert size={14} />
                    <span className="font-bold">{lang === 'hi' ? 'राहु काल' : lang === 'mr' ? 'राहु काळ' : 'રાહુ કાળ'}</span>
                  </div>
                  <span className="text-base font-bold text-rose-300">
                    {panchang.muhurats?.rahuKaal ? `${panchang.muhurats.rahuKaal.start} – ${panchang.muhurats.rahuKaal.end}` : 'Avoid'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e1629] border border-[#233152]">
                  <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                    <Clock size={14} />
                    <span className="font-bold">{lang === 'hi' ? 'अभिजीत मुहूर्त' : lang === 'mr' ? 'अभिजित मुहूर्त' : 'અભિજીત મુહૂર્ત'}</span>
                  </div>
                  <span className="text-base font-bold text-emerald-300">
                    {panchang.muhurats?.abhijitMuhurat ? `${panchang.muhurats.abhijitMuhurat.start} – ${panchang.muhurats.abhijitMuhurat.end}` : 'Shubh'}
                  </span>
                </div>
              </div>

              <p>
                <strong>दिनमान (Dina Mana):</strong> {localizedCity} में सूर्योदय ({panchang.sunrise}) से सूर्यास्त ({panchang.sunset}) के कुल समय (कुल अवधि: {panchang.dayLength}) को 8 बराबर भागों में विभाजित कर राहु काल और चौघड़िया का सटीक निर्धारण किया जाता है।
              </p>
            </div>
          </section>

          {/* ── Internal Linking Web: Other High-Volume Cities in Local Language ── */}
          <section className="mt-8 text-left max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl">
            <h2 className="text-base sm:text-lg font-bold text-white mb-3">
              {lang === 'hi'
                ? 'अन्य प्रमुख शहरों का वैदिक पंचांग देखें'
                : lang === 'mr'
                ? 'इतर प्रमुख शहरांचे वैदिक पंचांग'
                : 'અન્ય પ્રમુખ શહેરોનું વૈદિક પંચાંગ'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularCities.map((c) => {
                const cityLocName = getLocalizedCityName(c, lang);
                return (
                  <Link
                    key={c.slug}
                    href={`/${lang}/panchang/${c.slug}`}
                    className="px-3 py-1.5 rounded-xl bg-[#11192e] hover:bg-[#16213d] border border-[#233152] text-xs text-neutral-300 hover:text-amber-300 transition-colors"
                  >
                    📍 {cityLocName} पंचांग
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── Authoritative Editorial Section ── */}
          <VedicEditorialGuide />

          {/* ── City-Specific Dynamic FAQ Accordion ── */}
          <section className="mt-12 text-left max-w-5xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              {lang === 'hi'
                ? `${localizedCity} पंचांग से जुड़े अक्सर पूछे जाने वाले प्रश्न`
                : lang === 'mr'
                ? `${localizedCity} पंचांग वारंवार विचारले जाणारे प्रश्न`
                : `${localizedCity} પંચાંગ વારંવાર પૂછાતા પ્રશ્નો`}
            </h2>
            <div className="space-y-3">
              <details className="group p-4 rounded-2xl bg-[#090e1a] border border-[#1a2542] open:border-orange-500/40">
                <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                  <span>
                    {lang === 'hi'
                      ? `आज ${localizedCity} में कौन सी तिथि और पक्ष है?`
                      : lang === 'mr'
                      ? `आज ${localizedCity} मध्ये कोणती तिथी आणि पक्ष आहे?`
                      : `આજે ${localizedCity} માં કઈ તિથિ અને પક્ષ છે?`}
                  </span>
                  <span className="text-orange-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {lang === 'hi'
                    ? `आज ${localizedCity} में सक्रिय तिथि ${panchang.udayaTithi?.name || panchang.tithi.name} (${panchang.udayaTithi?.paksha || panchang.tithi.paksha} पक्ष) है, जो लगभग ${panchang.udayaTithi?.endTime || panchang.tithi.endTime} तक रहेगी।`
                    : lang === 'mr'
                    ? `आज ${localizedCity} मध्ये सक्रिय तिथी ${panchang.udayaTithi?.name || panchang.tithi.name} (${panchang.udayaTithi?.paksha || panchang.tithi.paksha} पक्ष) आहे, जी अंदाजे ${panchang.udayaTithi?.endTime || panchang.tithi.endTime} पर्यंत राहील.`
                    : `આજે ${localizedCity} માં સક્રિય તિથિ ${panchang.udayaTithi?.name || panchang.tithi.name} (${panchang.udayaTithi?.paksha || panchang.tithi.paksha} પક્ષ) છે, જે આશરે ${panchang.udayaTithi?.endTime || panchang.tithi.endTime} સુધી રહેશે.`}
                </p>
              </details>

              <details className="group p-4 rounded-2xl bg-[#090e1a] border border-[#1a2542] open:border-orange-500/40">
                <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                  <span>
                    {lang === 'hi'
                      ? `आज ${localizedCity} में राहु काल का समय क्या है?`
                      : lang === 'mr'
                      ? `आज ${localizedCity} मध्ये राहु काळ ची वेळ काय आहे?`
                      : `આજે ${localizedCity} માં રાહુ કાળ નો સમય શું છે?`}
                  </span>
                  <span className="text-orange-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {localizedCity} में आज राहु काल <strong>{panchang.muhurats?.rahuKaal?.start || '09:00 AM'} से {panchang.muhurats?.rahuKaal?.end || '10:30 AM'}</strong> तक रहेगा। इस समयावधि में शुभ कार्य और मांगलिक अनुबंध प्रारंभ न करें।
                </p>
              </details>

              <details className="group p-4 rounded-2xl bg-[#090e1a] border border-[#1a2542] open:border-orange-500/40">
                <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                  <span>
                    {lang === 'hi'
                      ? `आज ${localizedCity} में अभिजीत मुहूर्त कब है?`
                      : lang === 'mr'
                      ? `आज ${localizedCity} मध्ये अभिजित मुहूर्त कधी आहे?`
                      : `આજે ${localizedCity} માં અભિજીત મુહૂર્ત ક્યારે છે?`}
                  </span>
                  <span className="text-orange-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {localizedCity} में आज अभिजीत मुहूर्त <strong>{panchang.muhurats?.abhijitMuhurat?.start || '11:45 AM'} से {panchang.muhurats?.abhijitMuhurat?.end || '12:35 PM'}</strong> तक रहेगा। यह मध्याह्न काल अत्यंत शुभ माना जाता है।
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
    </LanguageProvider>
  );
}
