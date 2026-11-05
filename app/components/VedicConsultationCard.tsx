"use client";

import React from 'react';
import { Sparkles, MessageCircle, ShieldCheck, Star } from 'lucide-react';

export interface VedicConsultationCardProps {
  categoryName?: string;
  className?: string;
}

export function VedicConsultationCard({
  categoryName,
  className = ''
}: VedicConsultationCardProps) {
  const eventLabel = categoryName ? `your ${categoryName}` : 'a major life event';
  const astrologerPhone = process.env.NEXT_PUBLIC_ASTROLOGER_WHATSAPP_PHONE || '919873789525';
  const whatsappMessage = encodeURIComponent(
    `Namaste Pandit Ji! I am planning ${eventLabel} and would like to consult verified Vedic Pandits for personalized Kundli matching, Graha Shanti, and the most auspicious Muhurat window.`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${astrologerPhone}&text=${whatsappMessage}`;

  return (
    <div
      className={`my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121c33] via-[#0d162b] to-[#18112e] border border-amber-500/30 shadow-xl relative overflow-hidden text-left ${className}`}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -z-0" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck size={13} className="text-amber-400" />
            <span>Verified Dharmashastra Scholars</span>
            <div className="flex items-center text-amber-400 ml-1">
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            Planning a major life event? Consult verified Vedic Pandits for personalized Kundli matching &amp; Muhurat.
          </h3>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Ensure long-term prosperity, health, and harmony for Griha Pravesh, Vivah, Property Registration, or Business Inception with individualized birth-chart astrometric alignment.
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] transition-all transform active:scale-95 shrink-0 w-full sm:w-auto text-center"
        >
          <MessageCircle size={16} className="text-white fill-white shrink-0" />
          <span>Consult Pandit Ji on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

