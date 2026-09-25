"use client";

import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import {
  checkNotificationCapabilities,
  enableNotificationAlerts
} from '@/src/lib/notifications/subscription-manager';

interface NotificationPermissionBannerProps {
  onOpenSettings?: () => void;
}

export function NotificationPermissionBanner({ onOpenSettings }: NotificationPermissionBannerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGranted, setIsGranted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const isDismissed =
      localStorage.getItem('panchang_prompt_dismissed') === 'true' ||
      sessionStorage.getItem('panchang_prompt_dismissed') === 'true';

    if (Notification.permission === 'default' && !isDismissed) {
      // Delay display slightly (1.5s) so the user experiences the app content first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    setIsProcessing(true);
    try {
      const res = await enableNotificationAlerts();
      if (res.success) {
        setIsGranted(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } else {
        setIsVisible(false);
      }
    } catch (err) {
      console.error('Failed to enable alerts:', err);
      setIsVisible(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('panchang_prompt_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Panchang Notification Invitation"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl animate-in fade-in slide-in-from-top-4 duration-300 select-none"
    >
      <div className="relative rounded-2xl bg-[#0c1426]/95 border border-amber-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl p-3.5 sm:p-4 text-white">
        <div className="flex items-start gap-3">
          {/* Bell Icon with Ambient Glow */}
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
            <Bell size={20} className={isProcessing ? 'animate-spin' : 'animate-bounce'} />
          </div>

          {/* Banner Body */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {isGranted ? 'Alerts Activated! 🔔' : 'Enable Panchang Background Alerts'}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden xs:inline-block">
                Zero Spam
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-neutral-300 mt-1 leading-snug">
              {isGranted
                ? 'You will receive single combined updates on Tithi changes, inauspicious Panchak (🔴), and sacred Festivals.'
                : 'Get alerts when Tithi changes, when inauspicious Panchak (🔴) begins, and for daily Festivals & Vrats.'}
            </p>

            {/* Action Bar */}
            {!isGranted && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  onClick={handleEnable}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  <span>{isProcessing ? 'Enabling...' : 'Enable Alerts'}</span>
                </button>

                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setIsVisible(false);
                      onOpenSettings();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141e33] hover:bg-[#1d2a47] border border-[#25375c] text-neutral-300 hover:text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Preview Format</span>
                    <ChevronRight size={13} />
                  </button>
                )}

                <button
                  onClick={handleDismiss}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer ml-auto px-1 py-1"
                >
                  Maybe Later
                </button>
              </div>
            )}
          </div>

          {/* Dismiss Icon */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss Alert Invitation"
            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
