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
import { VedicConsultationCard } from '@/app/components/VedicConsultationCard';
import { Footer } from '@/src/components/Footer';

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

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
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
          <div className="p-5 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 font-outfit">
              <Star size={14} />
              <span>Favorable Nakshatras</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {muhurat.favorableNakshatras.map((nak, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-[#16213d] text-neutral-200 text-xs font-mono">
                  {nak}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2 font-outfit">
              <CheckCircle2 size={14} />
              <span>Auspicious Tithis</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {muhurat.favorableTithis.map((tithi, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-950/50 text-emerald-300 border border-emerald-500/20 text-xs font-mono">
                  {tithi}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2 font-outfit">
              <ShieldAlert size={14} />
              <span>Strict Avoidances</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {muhurat.avoidances.map((avoid, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-300 border border-rose-500/20 text-xs font-mono">
                  {avoid}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 12-Month Calendar of Auspicious Dates ── */}
        <section className="my-8">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 text-white">
              <Calendar size={20} className="text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-bold">
                12-Month Calendar for {muhurat.name} ({currentYear})
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Filtered for Rahu Kaal &amp; Bhadra Avoidance
            </span>
          </div>

          <div className="space-y-6">
            {calendarMonths.map((group) => (
              <div key={group.monthNumber} className="rounded-2xl border border-[#1e2d4f] bg-[#090e1a]/90 shadow-xl overflow-hidden">
                <div className="bg-[#0e1629] px-5 py-3 border-b border-[#1e2d4f] flex items-center justify-between">
                  <h3 className="font-bold text-amber-300 text-sm sm:text-base">
                    📅 {group.monthName}
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    {group.auspiciousDays.length} Auspicious Days
                  </span>
                </div>

                {group.auspiciousDays.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No auspicious dates recommended this month due to astrological restrictions (e.g., Khar Maas, Tara Asta, or Chaturmas).
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#0b1222] text-neutral-400 font-semibold border-b border-[#162038] text-[10px] sm:text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Tithi &amp; Nakshatra</th>
                          <th className="py-2.5 px-4">Shubh Daytime Window</th>
                          <th className="py-2.5 px-4">Rahu Kaal (Avoid)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#162038]">
                        {group.auspiciousDays.map((day, dIdx) => (
                          <tr key={dIdx} className="hover:bg-[#11192e] transition-colors">
                            <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                              {day.dateFormatted}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-neutral-200 font-medium">{day.tithiName}</div>
                              <div className="text-[11px] text-amber-400/80 font-mono">{day.nakshatraName}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/30 font-mono text-[11px]">
                                <Clock size={11} className="text-emerald-400" />
                                <span>{day.bestTimeWindows}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-rose-300 font-mono text-[11px]">
                                <ShieldAlert size={11} className="text-rose-400" />
                                <span>{day.rahuKaal}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── PHASE 5: Slot 2 (In-Feed Native Ad) & High-RPM Consultation Card ── */}
        <AdSlot slot="in-feed" />
        <VedicConsultationCard categoryName={muhurat.name} />

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
        <section className="my-8 p-6 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
          <h2 className="text-lg font-bold text-white mb-3">
            Explore Other Shubh Karya Muhurat Hubs
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {otherMuhurats.map((m) => (
              <Link
                key={m.slug}
                href={`/muhurat/${m.slug}`}
                className="px-3.5 py-2 rounded-xl bg-[#0e1629] hover:bg-[#16213d] border border-[#233152] hover:border-orange-500/40 text-xs text-neutral-300 hover:text-amber-300 transition-colors flex items-center gap-1.5"
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

