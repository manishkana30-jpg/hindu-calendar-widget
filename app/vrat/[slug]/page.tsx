import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, Calendar, BookOpen, Clock, ShieldCheck, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import {
  getAllVratSlugs,
  getVratBySlug,
  getVratUpcomingDates,
  VRAT_DEFINITIONS
} from '@/src/lib/vrat-data';
import {
  generateBreadcrumbSchema,
  generateVratEventSchema,
  generateVratFaqSchema
} from '@/src/lib/seo-schemas';
import { AdSlot } from '@/app/components/AdSlot';
import { VedicConsultationCard } from '@/app/components/VedicConsultationCard';
import { Footer } from '@/src/components/Footer';

export const revalidate = 3600; // 1 hour ISR revalidation

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllVratSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vrat = getVratBySlug(slug);

  if (!vrat) {
    return {
      title: 'Vrat Not Found | Daily Tithi',
      description: 'The requested Vedic Vrat could not be found in our Dharmashastra database.',
    };
  }

  const title = `${vrat.name} 2026 & 2027 Dates | Parana Timings & Dharmashastra Rules`;
  const description = `Complete dates for ${vrat.name} (${vrat.hindiName}) in 2026 and 2027. Exact Parana (fast breaking) time windows, fasting rules, and strict Dharmashastra rules from ${vrat.canonicalScripture}.`;
  const canonicalUrl = `https://dailytithi.com/vrat/${vrat.slug}`;
  const ogImageUrl = `https://dailytithi.com/api/og?title=${encodeURIComponent(vrat.name)}`;

  return {
    title,
    description,
    keywords: [
      `${vrat.name} 2026`, `${vrat.name} 2027 dates`, `${vrat.name} Parana time`,
      `${vrat.hindiName}`, `${vrat.name} fasting rules`, 'Nirnayasindhu', 'Dharmasindhu',
      'Daily Tithi Vedic Calendar'
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
          alt: `${vrat.name} Dates and Parana Timings Preview Card`,
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

export default async function VratHubPage({ params }: PageProps) {
  const { slug } = await params;
  const vrat = getVratBySlug(slug);

  if (!vrat) {
    notFound();
  }

  const upcomingDates = getVratUpcomingDates(vrat.slug);
  const otherVrats = Object.values(VRAT_DEFINITIONS).filter((v) => v.slug !== vrat.slug);

  // SEO Schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://dailytithi.com' },
    { name: 'Vrat & Upvas', url: 'https://dailytithi.com/vrat/ekadashi-vrat' },
    { name: vrat.name, url: `https://dailytithi.com/vrat/${vrat.slug}` }
  ]);
  const faqSchema = generateVratFaqSchema(vrat);
  const eventSchemas = generateVratEventSchema(vrat, upcomingDates);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchemas) }}
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
                {vrat.name} • {vrat.hindiName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono tracking-wider uppercase block truncate">
                Vedic Vrat &amp; Festival Calendar 2026–2027
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

      {/* ── Main Content Container ── */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-neutral-400 flex items-center gap-2">
          <Link href="/" className="hover:text-amber-300">Home</Link>
          <span>/</span>
          <span>Vrat Hub</span>
          <span>/</span>
          <span className="text-orange-400 font-semibold">{vrat.name}</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center sm:text-left mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold mb-3">
            <span className="text-sm">{vrat.icon}</span>
            <span>Dedicated Deity: {vrat.deity}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            {vrat.name} <span className="text-amber-400 font-devanagari">({vrat.hindiName})</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
            {vrat.description} Complete schedule for 2026 and 2027, precise Parana fast-breaking time windows, and Dharma Shastra canon injunctions.
          </p>
        </div>

        {/* ── PHASE 5: Slot 1 (Header Banner Ad) ── */}
        <AdSlot slot="header" />

        {/* ── Dharma Shastra Canonical Rule Highlight ── */}
        <section className="my-6 p-6 rounded-3xl bg-gradient-to-br from-[#0c1427] to-[#121b33] border border-orange-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-orange-400 mb-3">
            <BookOpen size={18} />
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-outfit">
              Dharma Shastra Canonical Rule
            </h2>
          </div>

          <blockquote className="border-l-4 border-amber-500 pl-4 py-1 mb-4 italic text-amber-200 text-xs sm:text-sm font-devanagari leading-relaxed">
            {vrat.dharmaShastraRule.hindi}
          </blockquote>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-3">
            {vrat.dharmaShastraRule.english}
          </p>

          <div className="inline-flex items-center gap-2 text-[11px] text-orange-400/90 font-mono bg-orange-950/40 px-3 py-1 rounded-lg border border-orange-500/20">
            <ShieldCheck size={13} />
            <span>Scriptural Authority: {vrat.dharmaShastraRule.shastraReference}</span>
          </div>
        </section>

        {/* ── Upcoming Dates Table (2026 & 2027) ── */}
        <section className="my-8">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 text-white">
              <Calendar size={20} className="text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-bold">
                Upcoming {vrat.name} Dates &amp; Parana Windows (2026–2027)
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Topocentric Swiss Ephemeris
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#1e2d4f] bg-[#090e1a]/90 shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0e1629] text-neutral-400 font-semibold border-b border-[#1e2d4f] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Festival / Vrat</th>
                  <th className="py-3 px-4">Date &amp; Day</th>
                  <th className="py-3 px-4">Tithi / Paksha</th>
                  <th className="py-3 px-4">Parana Time Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]">
                {upcomingDates.map((item, index) => (
                  <tr key={index} className="hover:bg-[#11192e] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{item.name}</div>
                      {item.hindiName && (
                        <div className="text-[11px] text-amber-400/80 font-devanagari">{item.hindiName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      <div className="font-semibold">{item.dateFormatted}</div>
                      <div className="text-[11px] text-neutral-400">{item.weekday}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#16233d] border border-[#23355c] text-[11px] text-orange-300 font-mono">
                        {item.tithiName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <Clock size={12} className="text-emerald-400 shrink-0" />
                        <span>{item.paranaTime}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 max-w-xs">{item.paranaDescription}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── PHASE 5: Slot 2 (In-Feed Native Ad) & Consultation Hook ── */}
        <AdSlot slot="in-feed" />
        <VedicConsultationCard categoryName={vrat.name} />

        {/* ── Fasting Guidelines & Parana Protocol ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="p-6 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Sacred Fasting Rules</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
              {vrat.fastingRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <span>Parana (Fast-Breaking) Protocol</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
              {vrat.paranaRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Internal Cross-Linking: Explore Other Vrats ── */}
        <section className="my-10 p-6 rounded-2xl bg-[#090e1a] border border-[#1a2542]">
          <h2 className="text-lg font-bold text-white mb-3">
            Explore Other Sacred Vedic Vrats
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {otherVrats.map((v) => (
              <Link
                key={v.slug}
                href={`/vrat/${v.slug}`}
                className="px-3.5 py-2 rounded-xl bg-[#0e1629] hover:bg-[#16213d] border border-[#233152] hover:border-orange-500/40 text-xs text-neutral-300 hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <span>{v.icon}</span>
                <span>{v.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Accessible FAQ Accordion ── */}
        <section className="my-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Frequently Asked Questions about {vrat.name}
          </h2>
          <div className="space-y-3">
            {vrat.faqs.map((faq, idx) => (
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

