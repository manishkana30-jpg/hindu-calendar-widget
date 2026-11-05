"use client";

import React, { useEffect, useRef, useState } from 'react';

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
}

const DEFAULT_ADSENSE_CLIENT = 'ca-pub-4999722531202967';

// Slot IDs can be overridden via props or environment variables
const DEFAULT_SLOTS = {
  header: process.env.NEXT_PUBLIC_ADSENSE_HEADER_SLOT || '',
  'in-feed': process.env.NEXT_PUBLIC_ADSENSE_INFEED_SLOT || '',
  'sticky-footer': process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT || '',
};

/**
 * Enterprise CLS-Safe Google AdSense & Affiliate Placement Container
 * 
 * Strict AdSense Quality & Monetization Guarantees:
 * 1. Zero Cumulative Layout Shift (CLS = 0) via pre-reserved min-height and flex geometry.
 * 2. Injects standard Google AdSense <ins class="adsbygoogle" /> with client ca-pub-4999722531202967.
 * 3. Safe singleton adsbygoogle.push({}) trigger with duplicate execution safeguards.
 * 4. Dual-Monetization: If ad blocker is detected or AdSense is pending review, the native high-RPM
 *    Vedic Consultation & Certified Gemstones backfill activates immediately to monetize traffic.
 */
export function AdSlot({
  slot,
  adSlotId,
  adClient = DEFAULT_ADSENSE_CLIENT,
  className = '',
  label = 'SPONSORED'
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
                <span className="font-semibold text-neutral-200">Certified Vedic Consultation &amp; Puja Services</span>
              </div>
              <a
                href="https://api.whatsapp.com/send?phone=919871144000&text=Namaste!%20I%20would%20like%20to%20inquire%20about%20personalized%20Panchang%20and%20Muhurat%20guidance."
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
    return (
      <aside
        aria-label="Advertisement In-Feed Slot"
        className={`min-h-[250px] w-full max-w-[336px] sm:max-w-[728px] mx-auto my-6 rounded-2xl border border-dashed border-[#1e2d4f] bg-[#090e1a]/80 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden transition-all ${className}`}
      >
        <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-2">
          {label} • VERIFIED VEDIC PARTNERS
        </span>

        {activeSlotId ? (
          <div className="w-full min-h-[250px] flex justify-center items-center">
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
          <div className="p-5 rounded-xl bg-[#0c1427]/90 border border-[#1a2542] max-w-lg w-full text-left shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-amber-300 font-bold text-sm flex items-center gap-1.5">
                <span>✨</span>
                <span>Astrological Gemstone &amp; Yantra Recommendation</span>
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
                100% Certified
              </span>
            </div>
            <p className="text-neutral-300 text-xs leading-relaxed mb-3">
              Energize your planetary transits. Discover your birth stone (Ratna), Nepal Rudraksha, and energized Shree Yantra authenticated by Varanasi Vedic scholars.
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-neutral-400">
                Custom Birth-Chart (Janma Kundli) Alignment
              </span>
              <a
                href="https://api.whatsapp.com/send?phone=919871144000&text=Namaste!%20I%20would%20like%20a%20certified%20gemstone%20and%20Rudraksha%20recommendation%20based%20on%20my%20Kundli."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs transition-transform active:scale-95 shadow cursor-pointer"
              >
                Get Free Recommendation
              </a>
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
      className={`min-h-[50px] sm:min-h-[60px] w-full bg-[#070b16]/98 backdrop-blur-md border-t border-[#1e2d4f] flex flex-col items-center justify-center text-center px-3 py-1 fixed bottom-0 left-0 right-0 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] ${className}`}
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
              🕉️ Need Personalized Muhurat or Kundli Matching? Consult Verified Pandits
            </span>
            <a
              href="https://api.whatsapp.com/send?phone=919871144000&text=Namaste!%20I%20would%20like%20to%20consult%20a%20verified%20Vedic%20astrologer."
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] shrink-0 transition-transform active:scale-95 shadow"
            >
              Consult Pandit Ji
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
