"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root Client-Side Error Boundary for Next.js 15 App Router.
 * Prevents black-screen "client-side exception" crashes and provides a graceful, styled fallback.
 */
export default function GlobalErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log exception for debugging/telemetry
    console.error('[Daily Tithi Error Boundary Captured]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Decorative ambient lighting matching brand design system */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-md w-full bg-[#090e1a]/95 border border-[#1a2542] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center relative z-10">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <span className="text-3xl select-none">🕉️</span>
        </div>

        {/* Title & Tag */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-1">
          Daily Tithi
        </h2>
        <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400 block mb-3">
          Widget Temporarily Unavailable
        </span>

        {/* Description */}
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
          The astronomical engine encountered a temporary computation state. Your saved location and alert preferences are preserved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-lg shadow-orange-950/40 transition-all active:scale-[0.98]"
          >
            Reload Widget
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#11192e] hover:bg-[#18233f] border border-[#233152] text-neutral-200 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            Refresh Page
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-6 pt-5 border-t border-[#162038]">
          <Link
            href="/"
            className="text-[11px] text-neutral-400 hover:text-orange-300 underline underline-offset-4 transition-colors font-mono"
          >
            ← Return to Live Panchang
          </Link>
        </div>
      </div>
    </div>
  );
}
