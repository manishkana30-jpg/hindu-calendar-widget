import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, Calendar, Clock, ShieldAlert, ArrowLeft, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import {
  getAllMuhuratSlugs,
  getMuhuratBySlug,
  get12MonthMuhuratCalendar,
  MUHURAT_CATEGORIES
} from '@/src/lib/muhurat-data';
import {
  generateBreadcrumbSchema,
  generateMuhuratFaqSchema
} from '@/src/lib/seo-schemas';
import { AdSlot } from '@/app/components/AdSlot';
import { Footer } from '@/src/components/Footer';
import { WhatsAppIcon } from '@/app/components/WhatsAppShareButton';

export const revalidate = 3600; // 1 hour ISR revalidation

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllMuhuratSlugs();
  return slugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const muhurat = getMuhuratBySlug(categorySlug);

  if (!muhurat) {
    return {
      title: 'Muhurat Not Found | Daily Tithi',
      description: 'The requested Shubh Karya Muhurat could not be found in our Vedic database.',
    };
  }

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const title = `${muhurat.name} ${currentYear} & ${nextYear} — Auspicious Dates & Timings Calendar`;
  const description = `Find auspicious dates for ${muhurat.name} (${muhurat.hindiName}) in ${currentYear} and ${nextYear}. Full 12-month calendar, exact daytime Choghadiya & Abhijit windows, Rahu Kaal avoidance slots, and Nakshatra rules.`;
  const canonicalUrl = `https://dailytithi.com/muhurat/${muhurat.slug}`;
  const ogImageUrl = `https://dailytithi.com/api/og?title=${encodeURIComponent(muhurat.name)}`;

  return {
    title,
    description,
    keywords: [
      `${muhurat.name} ${currentYear}`, `${muhurat.name} dates this month`,
      `${muhurat.hindiName}`, 'Shubh Muhurat calendar', 'Rahu Kaal avoidance',
      'Abhijit Muhurat', 'Muhurta Chintamani', 'Daily Tithi'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
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
          alt: `${muhurat.name} Auspicious Calendar Preview Card`,
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

export default async function MuhuratHubPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const muhurat = getMuhuratBySlug(categorySlug);

  if (!muhurat) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const calendarMonths = get12MonthMuhuratCalendar(muhurat.slug, currentYear);
  const otherMuhurats = Object.values(MUHURAT_CATEGORIES).filter((m) => m.slug !== muhurat.slug);

  // SEO Schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://dailytithi.com' },
    { name: 'Shubh Muhurat', url: 'https://dailytithi.com/muhurat/griha-pravesh' },
    { name: muhurat.name, url: `https://dailytithi.com/muhurat/${muhurat.slug}` }
  ]);
  const faqSchema = generateMuhuratFaqSchema(muhurat);

  return (
    <div className="min-h-dvh w-full max-w-full bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden touch-pan-y pb-24">
      {/* ── Structured Data JSON-LD Schemas ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Decorative ambient lighting (Hardware-accelerated zero-blur radial gradients) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(234,88,12,0.14)_0%,_transparent_70%)]" />
        <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)]" />
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
                {muhurat.name}
              </span>
              <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono tracking-wider uppercase block truncate">
                {muhurat.hindiName} • 12-Month Shubh Calendar
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

      {/* ── Main Content ── */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-neutral-400 flex items-center gap-2">
          <Link href="/" className="hover:text-amber-300">Home</Link>
          <span>/</span>
          <span>Muhurat Hub</span>
          <span>/</span>
          <span className="text-orange-400 font-semibold">{muhurat.name}</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center sm:text-left mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold mb-3">
            <span className="text-sm">{muhurat.icon}</span>
            <span>Vedic Muhurat Engine</span>
          </div>

          <h1 className="text-[clamp(1.5rem,5vw,3rem)] font-extrabold tracking-tight text-white mb-3">
            {muhurat.name} <span className="text-amber-400 font-devanagari">({muhurat.hindiName})</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
            {muhurat.description} Complete 12-month calendar of auspicious dates, exact daytime time windows, and Rahu Kaal avoidance slots.
          </p>
        </div>

        {/* ── PHASE 5: Slot 1 (Header Banner Ad) ── */}
        <AdSlot slot="header" />

        {/* ── Shastra Rules & Favorable Alignments ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1a0e05]/90 via-[#0e1629]/90 to-[#1a0e05]/90 border border-amber-500/35 shadow-[0_0_20px_rgba(245,158,11,0.08)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 font-outfit">
              <Star size={14} />
              <span>Favorable Nakshatras</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {muhurat.favorableNakshatras.map((nak, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-[#231508] text-amber-200 border border-amber-500/25 text-xs font-mono">
                  {nak}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#021c13]/90 via-[#091522]/90 to-[#021c13]/90 border border-emerald-500/35 shadow-[0_0_20px_rgba(16,185,129,0.08)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2 font-outfit">
              <CheckCircle2 size={14} />
              <span>Auspicious Tithis</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {muhurat.favorableTithis.map((tithi, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                  {tithi}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c0509]/90 via-[#140a12]/90 to-[#1c0509]/90 border border-rose-500/35 shadow-[0_0_20px_rgba(244,63,94,0.08)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2 font-outfit">
              <ShieldAlert size={14} />
              <span>Strict Avoidances</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {muhurat.avoidances.map((avoid, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-950/50 text-rose-300 border border-rose-500/30 text-xs font-mono">
                  {avoid}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 12-Month Calendar of Auspicious Dates ── */}
        <section className="my-8">
          <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-2 text-white">
              <Calendar size={20} className="text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-bold font-outfit">
                12-Month Calendar for {muhurat.name} ({currentYear})
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              ✓ Filtered for Rahu Kaal &amp; Bhadra
            </span>
          </div>

          {/* Quick Month Jump Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-6 scrollbar-thin">
            {calendarMonths.map((grp) => (
              <a
                key={grp.monthNumber}
                href={`#month-${grp.monthNumber}`}
                className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#0e1629] hover:bg-[#16233f] border border-[#1e2d4f] hover:border-amber-500/40 text-xs font-semibold text-neutral-300 hover:text-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>{grp.monthName.split(' ')[0]}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  {grp.auspiciousDays.length}
                </span>
              </a>
            ))}
          </div>

          <div className="space-y-6">
            {calendarMonths.map((group) => (
              <div 
                key={group.monthNumber} 
                id={`month-${group.monthNumber}`}
                className="rounded-3xl border border-[#1e2d4f] bg-[#090e1a]/95 shadow-2xl overflow-hidden backdrop-blur-md scroll-mt-24"
              >
                <div className="bg-gradient-to-r from-[#0e1629] via-[#101b33] to-[#0e1629] px-5 sm:px-6 py-3.5 border-b border-[#1e2d4f] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-sm font-bold shadow-inner">
                      📅
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-300 text-sm sm:text-base font-outfit tracking-tight">
                        {group.monthName}
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-sans">
                        Auspicious dates for {muhurat.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-amber-300 font-mono font-bold bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                    {group.auspiciousDays.length} {group.auspiciousDays.length === 1 ? 'Auspicious Day' : 'Auspicious Days'}
                  </span>
                </div>

                {group.auspiciousDays.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500 font-sans">
                    No auspicious dates recommended this month due to astrological restrictions (e.g., Khar Maas, Tara Asta, or Chaturmas).
                  </div>
                ) : (
                  <div className="relative w-full overflow-x-auto overscroll-contain touch-pan-x [-webkit-overflow-scrolling:touch] rounded-2xl border border-[#1a2542] bg-[#090e1a]">
                    <table className="min-w-[620px] sm:min-w-full text-left text-xs sm:text-sm border-collapse">
                      <thead className="bg-[#0b1222] text-neutral-400 font-bold border-b border-[#162038] text-[10px] sm:text-[11px] uppercase tracking-wider font-outfit">
                        <tr>
                          <th className="py-3 px-4 whitespace-nowrap sticky left-0 z-30 bg-[#0d1424] shadow-[4px_0_8px_rgba(0,0,0,0.4)] min-w-[130px]">Date &amp; Day</th>
                          <th className="py-3 px-4 whitespace-nowrap">Tithi &amp; Nakshatra</th>
                          <th className="py-3 px-4 whitespace-nowrap">Shubh Daytime Windows</th>
                          <th className="py-3 px-4 whitespace-nowrap">Rahu Kaal (Avoid)</th>
                          <th className="py-3 px-4 whitespace-nowrap text-right">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#162038]">
                        {group.auspiciousDays.map((day, dIdx) => {
                          const timeSlots = day.bestTimeWindowsList && day.bestTimeWindowsList.length > 0
                            ? day.bestTimeWindowsList
                            : day.bestTimeWindows.split(', ').filter(Boolean);

                          const shareText = `🌸 *${muhurat.name} Shubh Muhurat* 🌸\n📅 *Date:* ${day.dateFormatted} (${day.weekday})\n🪷 *Tithi:* ${day.tithiName}\n⭐ *Nakshatra:* ${day.nakshatraName}\n⏰ *Shubh Timings:* ${day.bestTimeWindows}\n⚠️ *Rahu Kaal (Avoid):* ${day.rahuKaal}\n📍 *Calculated for:* New Delhi NCR\n🔗 https://dailytithi.com/muhurat/${muhurat.slug}`;
                          const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

                          return (
                            <tr key={dIdx} className="hover:bg-[#11192e] transition-colors group">
                              {/* 1. Date & Day Calendar Tile */}
                              <td className="py-3.5 px-4 whitespace-nowrap sticky left-0 z-10 bg-[#090e1a] shadow-[4px_0_8px_rgba(0,0,0,0.4)] min-w-[130px]">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-mono bg-[#11192e] text-white border border-[#233152] shadow-md group-hover:border-amber-500/50 group-hover:bg-[#15203a] transition-all shrink-0">
                                    <span className="text-sm font-extrabold leading-none text-white">{String(day.dayNumber).padStart(2, '0')}</span>
                                    <span className="text-[9px] font-bold text-amber-400 uppercase mt-0.5 tracking-wider">{day.weekdayShort || day.weekday.slice(0, 3)}</span>
                                  </div>
                                  <div>
                                    <div className="text-xs sm:text-sm font-bold text-white font-sans tracking-tight">
                                      {day.monthShort || group.monthName.split(' ')[0]} {group.year}
                                    </div>
                                    <div className="text-[11px] text-neutral-400 font-medium">
                                      {day.weekday}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Tithi & Nakshatra */}
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white font-devanagari text-xs sm:text-sm leading-snug">
                                  {day.tithiName}
                                </div>
                                <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                                  ⭐ {day.nakshatraName}
                                </div>
                                {day.specialYogas && day.specialYogas.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {day.specialYogas.map((yoga, yIdx) => (
                                      <span
                                        key={yIdx}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/40 text-[10px] font-extrabold tracking-tight shadow-sm"
                                      >
                                        <span>✨</span>
                                        <span>{yoga}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>

                              {/* 3. Shubh Daytime Windows (Each slot is its own cleanly formatted pill) */}
                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                                  {timeSlots.map((slot, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-200 border border-emerald-500/35 font-mono text-[11px] font-semibold tracking-tight shadow-sm whitespace-nowrap hover:bg-emerald-900/80 transition-colors"
                                    >
                                      <Clock size={11} className="text-emerald-400 shrink-0" />
                                      <span>{slot}</span>
                                    </span>
                                  ))}
                                </div>
                              </td>

                              {/* 4. Rahu Kaal Avoidance */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/30 font-mono text-[11px] whitespace-nowrap">
                                  <ShieldAlert size={12} className="text-rose-400 shrink-0" />
                                  <span>{day.rahuKaal}</span>
                                </span>
                              </td>

                              {/* 5. WhatsApp Share Action */}
                              <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                <a
                                  href={shareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Share this Muhurat on WhatsApp"
                                  aria-label="Share this Muhurat date on WhatsApp"
                                  className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center shadow-sm"
                                >
                                  <WhatsAppIcon className="w-4 h-4" />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Single Unified Sponsorship & Advertisement Space ── */}
        <AdSlot slot="in-feed" categoryName={muhurat.name} />

        {/* ── Scriptural Authority Block ── */}
        <section className="my-8 p-6 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-orange-400" />
            <span>Classical Muhurat Canon Authority</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-3">
            {muhurat.scripturalRules.english}
          </p>
          <blockquote className="text-xs text-amber-300/90 font-devanagari italic pl-3 border-l-2 border-amber-500/50 mb-2">
            {muhurat.scripturalRules.hindi}
          </blockquote>
          <span className="text-[10px] text-neutral-400 font-mono">
            Source: {muhurat.scripturalRules.reference}
          </span>
        </section>

        {/* ── Cross-Linking: Explore Other Life Event Muhurats ── */}
        <section className="my-8 p-4 sm:p-6 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
          <h2 className="text-lg font-bold text-white mb-3">
            Explore Other Shubh Karya Muhurat Hubs
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {otherMuhurats.map((m) => (
              <Link
                key={m.slug}
                href={`/muhurat/${m.slug}`}
                className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#0e1629] hover:bg-[#16213d] border border-[#233152] hover:border-orange-500/40 text-xs text-neutral-300 hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <span>{m.icon}</span>
                <span>{m.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Accessible FAQ Accordion ── */}
        <section className="my-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Frequently Asked Questions about {muhurat.name}
          </h2>
          <div className="space-y-3">
            {muhurat.faqs.map((faq, idx) => (
              <details key={idx} className="group p-4 rounded-2xl bg-[#090e1a] border border-[#1a2542] open:border-orange-500/40">
                <summary className="font-semibold text-white text-sm sm:text-base cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-orange-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* ── PHASE 5: Slot 3 (Sticky Bottom Anchor Ad) ── */}
      <AdSlot slot="sticky-footer" />

      {/* ── Site Footer ── */}
      <Footer />
    </div>
  );
}

