"use client";

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { usePwaInstall } from '@/src/hooks/usePwaInstall';
import { PWAInstallModal } from './PWAInstallModal';

export function PwaStandaloneBanner() {
  const {
    canInstall,
    isInstalled,
    isMounted,
    isStandalone,
    isIOS,
    deferredPrompt,
    promptInstall,
    isModalOpen,
    openInstructions,
    closeInstructions
  } = usePwaInstall();

  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  if (!isMounted || isInstalled || isStandalone || !canInstall || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS || !deferredPrompt) {
      openInstructions();
    } else {
      await promptInstall();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto my-3 px-3">
        <div className="flex items-center justify-between gap-3 p-3 sm:py-2.5 sm:px-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-indigo-950/60 to-purple-950/70 border border-sky-500/30 shadow-lg text-left backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg shrink-0">📲</span>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-white block leading-snug truncate">
                Add Daily Tithi to Home Screen for instant offline access.
              </span>
              <span className="text-[10px] text-sky-300 hidden sm:block">
                Zero app store install required • 100% offline Swiss Ephemeris astrometry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-transform active:scale-95 shadow cursor-pointer"
            >
              Add to Home Screen
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="text-neutral-400 hover:text-white p-1 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <PWAInstallModal isOpen={isModalOpen} onClose={closeInstructions} />
      )}
    </>
  );
}

