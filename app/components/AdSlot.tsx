"use client";

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, MessageCircle, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export interface AdSlotProps {
  slot: 'header' | 'in-feed' | 'sticky-footer';
  adSlotId?: string;
  adClient?: string;
  className?: string;
  label?: string;
  categoryName?: string;
}

const DEFAULT_ADSENSE_CLIENT = 'ca-pub-4999722531202967';
const DEFAULT_ASTROLOGER_PHONE = process.env.NEXT_PUBLIC_ASTROLOGER_WHATSAPP_PHONE || '919873789525';

// Slot IDs can be overridden via props or environment variables
const DEFAULT_SLOTS = {
  header: process.env.NEXT_PUBLIC_ADSENSE_HEADER_SLOT || '',
  'in-feed': process.env.NEXT_PUBLIC_ADSENSE_INFEED_SLOT || '',
  'sticky-footer': process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT || '',
};

/**
 * Enterprise CLS-Safe Google AdSense & Direct Sponsorship Placement Container
 * 
 * Strict AdSense Quality & Monetization Guarantees:
 * 1. Zero Cumulative Layout Shift (CLS = 0) via pre-reserved min-height and flex geometry.
 * 2. Injects standard Google AdSense <ins class="adsbygoogle" /> with client ca-pub-4999722531202967.
 * 3. Safe singleton adsbygoogle.push({}) trigger with duplicate execution safeguards.
 * 4. Sponsorship & Advertisement Booking Space: When Google AdSense is active, serves responsive ads.
 *    When in direct sponsorship mode, displays a high-converting sponsorship & advertisement booking card
 *    with instant WhatsApp inquiry for advertisers and verified brands.
 */
export function AdSlot({
  slot,
  adSlotId,
  adClient = DEFAULT_ADSENSE_CLIENT,
  className = '',
  label = 'ADVT',
  categoryName
}: AdSlotProps) {
  const adPushedRef = useRef(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const activeSlotId = adSlotId || DEFAULT_SLOTS[slot];

  useEffect(() => {
    if (adPushedRef.current) return;
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        adPushedRef.current = true;
        setIsAdLoaded(true);
      }
    } catch (err) {
      console.debug('[AdSlot] adsbygoogle push notice:', err);
    }
  }, []);

  const generalInquiryMessage = encodeURIComponent(
    'Namaste! I would like to inquire about advertising / sponsorship space on the Vedic Panchang web app. Please share available slots, audience reach, and pricing.'
  );

  if (slot === 'header') {
    return (
      <aside
        aria-label="Advertisement Header Banner"
        className={`min-h-[90px] w-full max-w-[728px] mx-auto my-3 bg-[#080d1a]/50 rounded-xl border border-dashed border-[#1e2d4f] flex flex-col items-center justify-center relative overflow-hidden transition-all ${className}`}
      >
        <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase py-0.5">
          {label}
        </span>
        <div className="w-full flex justify-center items-center overflow-hidden min-h-[90px]">
          {activeSlotId ? (
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '100%', minHeight: '90px' }}
              data-ad-client={adClient}
              data-ad-slot={activeSlotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div className="p-3 text-center w-full flex items-center justify-between gap-3 text-xs text-neutral-400 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-semibold text-neutral-200">Sponsor / Advertise With Us</span>
              </div>
              <a
                href={`https://api.whatsapp.com/send?phone=${DEFAULT_ASTROLOGER_PHONE}&text=${generalInquiryMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold hover:bg-emerald-500/30 transition-colors text-[11px] shrink-0"
              >
                Inquire on WhatsApp
              </a>
            </div>
          )}
        </div>
      </aside>
    );
  }

  if (slot === 'in-feed') {
    const pageContext = categoryName ? ` (${categoryName})` : '';
    const infeedWhatsappMessage = encodeURIComponent(
      `Namaste! I would like to inquire about advertising / sponsorship opportunities on the Vedic Panchang web app${pageContext}. Please share available slots, audience metrics, and rates.`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${DEFAULT_ASTROLOGER_PHONE}&text=${infeedWhatsappMessage}`;

    return (
      <aside
        aria-label="Sponsorship & Advertisement Space"
        className={`my-6 sm:my-8 w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[#0c162d]/90 via-[#080f20]/95 to-[#140e26]/90 border border-amber-500/35 hover:border-amber-400/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-5 sm:p-7 relative overflow-hidden text-left transition-all backdrop-blur-md ${className}`}
      >
        {/* Ambient radial glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.12)_0%,_transparent_70%)] pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.08)_0%,_transparent_70%)] pointer-events-none -z-0" />

        <div className="flex items-center justify-between gap-3 mb-3 relative z-10 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
              {label} • SPONSORSHIP SPACE
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] sm:text-xs font-semibold">
            <TrendingUp size={12} className="text-emerald-400" />
            <span>High-Visibility • Verified Daily Reach</span>
          </div>
        </div>

        {activeSlotId ? (
          <div className="w-full min-h-[250px] flex justify-center items-center relative z-10">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', minHeight: '250px', width: '100%' }}
              data-ad-client={adClient}
              data-ad-slot={activeSlotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                Promote Your Brand / Advertise With Us
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Connect your business, spiritual products, certified puja services, or lifestyle brand with high-intent daily Vedic Panchang visitors. Pan-India and geo-targeted exposure across 60+ regional cities.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#14203d] border border-[#23355e] text-[11px] text-amber-200">
                  <Sparkles size={11} className="text-amber-400" /> High-Intent Daily Visitors
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#14203d] border border-[#23355e] text-[11px] text-emerald-200">
                  <span>📍</span> 60+ Regional City Targeting
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#14203d] border border-[#23355e] text-[11px] text-sky-200">
                  <span>📈</span> Premium Brand Placement
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 w-full lg:w-auto shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] transition-all transform active:scale-95 text-center shrink-0"
              >
                <MessageCircle size={16} className="text-white fill-white shrink-0" />
                <span>Inquire on WhatsApp</span>
              </a>
              <span className="text-[10px] text-neutral-400 text-center lg:text-right font-mono">
                Direct WhatsApp • Fast Response
              </span>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // sticky-footer slot
  return (
    <aside
      aria-label="Advertisement Sticky Footer Anchor"
      className={`min-h-[50px] sm:min-h-[60px] w-full bg-[#070b16]/98 backdrop-blur-md border-t border-[#1e2d4f] flex flex-col items-center justify-center text-center px-3 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] fixed bottom-0 left-0 right-0 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="flex items-center justify-between w-full max-w-4xl gap-2">
        <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase shrink-0">
          {label}
        </span>

        {activeSlotId ? (
          <div className="w-full flex justify-center items-center overflow-hidden min-h-[50px]">
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '100%', minHeight: '50px' }}
              data-ad-client={adClient}
              data-ad-slot={activeSlotId}
              data-ad-format="horizontal"
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2 text-xs">
            <span className="text-neutral-300 font-medium truncate text-left">
              📢 Looking to Sponsor or Advertise Here? Reach High-Intent Daily Visitors
            </span>
            <a
              href={`https://api.whatsapp.com/send?phone=${DEFAULT_ASTROLOGER_PHONE}&text=${generalInquiryMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] shrink-0 transition-transform active:scale-95 shadow"
            >
              Inquire on WhatsApp
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
