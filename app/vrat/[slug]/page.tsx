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
import { Footer } from '@/src/components/Footer';
import { WhatsAppIcon } from '@/app/components/WhatsAppShareButton';

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
        <section className="my-6 p-6 rounded-3xl bg-gradient-to-br from-[#1a0e05]/95 via-[#0c1427]/95 to-[#1a0e05]/95 border border-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.08)] relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-amber-400 mb-3">
            <BookOpen size={18} />
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-outfit drop-shadow-sm">
              Dharma Shastra Canonical Rule
            </h2>
          </div>

          <blockquote className="border-l-4 border-amber-500 pl-4 py-1 mb-4 italic text-amber-200 text-xs sm:text-sm font-devanagari leading-relaxed">
            {vrat.dharmaShastraRule.hindi}
          </blockquote>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-3">
            {vrat.dharmaShastraRule.english}
          </p>

          <div className="inline-flex items-center gap-2 text-[11px] text-amber-300 font-mono bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/30">
            <ShieldCheck size={13} className="text-amber-400" />
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

          <div className="overflow-x-auto rounded-3xl border border-[#1e2d4f] bg-[#090e1a]/95 shadow-2xl backdrop-blur-md">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-[#0e1629] text-neutral-400 font-bold border-b border-[#1e2d4f] text-[10px] sm:text-[11px] uppercase tracking-wider font-outfit">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Date &amp; Day</th>
                  <th className="py-3 px-4 whitespace-nowrap">Festival / Vrat</th>
                  <th className="py-3 px-4 whitespace-nowrap">Tithi / Paksha</th>
                  <th className="py-3 px-4 whitespace-nowrap">Parana Fast-Breaking Window</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]">
                {upcomingDates.map((item, index) => {
                  const shareText = `🌸 *${item.name} (${vrat.name})* 🌸\n📅 *Date:* ${item.dateFormatted} (${item.weekday})\n🪷 *Tithi:* ${item.tithiName}\n⏰ *Parana Time:* ${item.paranaTime}\nℹ️ ${item.paranaDescription}\n📍 *Calculated for:* New Delhi NCR\n🔗 https://dailytithi.com/vrat/${vrat.slug}`;
                  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

                  return (
                    <tr key={index} className="hover:bg-[#11192e] transition-colors group">
                      {/* 1. Date & Day Calendar Tile */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-mono bg-[#11192e] text-white border border-[#233152] shadow-md group-hover:border-amber-500/50 group-hover:bg-[#15203a] transition-all shrink-0">
                            <span className="text-sm font-extrabold leading-none text-white">{item.date.getDate()}</span>
                            <span className="text-[9px] font-bold text-amber-400 uppercase mt-0.5 tracking-wider">{item.weekday.slice(0, 3)}</span>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white font-sans tracking-tight">
                              {item.dateFormatted}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-medium">
                              {item.weekday}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Festival / Vrat */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="text-xs sm:text-sm leading-snug">{item.name}</div>
                        {item.hindiName && (
                          <div className="text-[11px] text-amber-400/90 font-devanagari mt-0.5">{item.hindiName}</div>
                        )}
                      </td>

                      {/* 3. Tithi / Paksha */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#16233d] border border-[#23355c] text-[11px] text-orange-300 font-mono font-medium shadow-sm">
                          {item.tithiName}
                        </span>
                      </td>

                      {/* 4. Parana Time Window (Clean badge without awkward text wrap) */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-200 border border-emerald-500/35 font-mono text-[11px] font-semibold whitespace-nowrap shadow-sm mb-1">
                          <Clock size={11} className="text-emerald-400 shrink-0" />
                          <span>{item.paranaTime}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 max-w-xs leading-relaxed">{item.paranaDescription}</div>
                      </td>

                      {/* 5. WhatsApp Share Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Share on WhatsApp"
                          aria-label="Share this Vrat date on WhatsApp"
                          className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center shadow-sm"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Single Unified Sponsorship & Advertisement Space ── */}
        <AdSlot slot="in-feed" categoryName={vrat.name} />

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

