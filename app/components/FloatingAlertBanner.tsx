"use client";

import React from 'react';
import { Bell, Loader2, Share, X, Sparkles } from 'lucide-react';
import { useSmartOnboarding } from '@/src/hooks/useSmartOnboarding';

export interface FloatingAlertBannerProps {
  className?: string;
}

/**
 * FloatingAlertBanner Component
 * 
 * High-visibility, sticky floating pill banner replacing fragmented onboarding modals.
 * 
 * Reliability guarantees:
 * - Returns null until `isReady` is true (eliminates UI pop-in and disappearing flicker).
 * - Fully disappears once the device subscription is verified in Supabase PostgreSQL.
 * - Platform-intelligent: Guides iOS Safari browsers to "Add to Home Screen" first.
 * - Zero auto-dismiss timeouts; remains stable until user interaction.
 */
export function FloatingAlertBanner({ className = '' }: FloatingAlertBannerProps) {
  const {
    isReady,
    isSubscribed,
    isStandalone,
    isLoading,
    showIosTooltip,
    error,
    startOnboarding,
    dismissIosTooltip
  } = useSmartOnboarding();

  // 1. Never render prematurely while the hook is verifying subscription state
  if (!isReady) {
    return null;
  }

  // 2. If already confirmed subscribed in Supabase or running in standalone PWA, hide completely
  if (isSubscribed || isStandalone) {
    return null;
  }

  return (
    <aside
      aria-label="Daily Tithi Notification Setup"
      className={`fixed bottom-4 left-4 right-4 z-50 flex flex-col items-center pointer-events-none select-none max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300 ${className}`}
    >
      {/* ── Downward-Pointing iOS Safari "Add to Home Screen" Tooltip ── */}
      {showIosTooltip && (
        <div
          role="alert"
          aria-live="polite"
          className="pointer-events-auto w-full mb-2.5 p-3.5 rounded-2xl bg-[#0c1427]/95 border border-amber-500/50 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.7)] text-white text-xs animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                <Share size={15} />
              </div>
              <div className="leading-snug">
                <div className="font-bold text-amber-200 flex items-center gap-1.5">
                  <span>iOS Setup Required</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Safari PWA
                  </span>
                </div>
                <p className="text-neutral-300 text-[11px] mt-1 font-medium">
                  Tap the Share icon <span className="text-amber-300 font-bold">⎋</span> below and select <span className="text-white font-bold">&apos;Add to Home Screen&apos;</span> to enable alerts.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissIosTooltip}
              aria-label="Dismiss iOS guide"
              className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Tooltip Downward Beak Indicator */}
          <div className="relative flex justify-center -mb-5 mt-2">
            <div className="w-3 h-3 bg-[#0c1427] border-b border-r border-amber-500/50 rotate-45 transform" />
          </div>
        </div>
      )}

      {/* ── Main Sticky Pill Button: "Get Daily Tithi Alert" ── */}
      <div className="pointer-events-auto w-full flex justify-center">
        <button
          type="button"
          onClick={() => startOnboarding()}
          disabled={isLoading}
          aria-label="Get Daily Tithi Alert"
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-extrabold text-sm sm:text-[15px] shadow-[0_10px_35px_rgba(245,158,11,0.45)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.65)] hover:scale-[1.02] active:scale-[0.98] border border-amber-200/50 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {/* Animated Radial Halo */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-30 group-hover:opacity-70 blur-md transition duration-300 pointer-events-none -z-10" />

          {/* Icon: Spinner or Pulsing Bell */}
          <span className="relative flex items-center justify-center shrink-0">
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-black" />
            ) : (
              <>
                <Bell size={18} className="text-black drop-shadow-sm transition-transform group-hover:rotate-12" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping opacity-90 pointer-events-none" />
              </>
            )}
          </span>

          {/* Primary Action Copy */}
          <span className="tracking-wide">
            {isLoading ? 'Activating Alerts...' : 'Get Daily Tithi Alert'}
          </span>

          {/* Decorative Sparkle */}
          {!isLoading && (
            <Sparkles size={16} className="text-black/80 transition-transform group-hover:scale-110 shrink-0" />
          )}
        </button>
      </div>

      {/* Ephemeral Error Message */}
      {error && (
        <div
          role="alert"
          className="pointer-events-auto mt-2 px-3 py-1 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-200 text-[11px] font-medium shadow-lg animate-in fade-in duration-150"
        >
          <span>{error}</span>
        </div>
      )}
    </aside>
  );
}
