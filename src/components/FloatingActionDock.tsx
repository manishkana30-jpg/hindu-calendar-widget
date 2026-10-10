"use client";

import React, { useState, useCallback, useRef } from 'react';
import { 
  Bell, 
  ArrowDownToLine, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { WhatsAppIcon } from '@/app/components/WhatsAppShareButton';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { usePwaInstall } from '@/src/hooks/usePwaInstall';
import { DeviceSetupModal } from '@/src/components/DeviceSetupModal';
import { PWAInstallModal } from '@/app/components/PWAInstallModal';
import { 
  sharePanchang, 
  buildShareDataFromPanchang 
} from '@/src/lib/utils/sharePanchang';
import { 
  calculatePanchang, 
  PRESET_LOCATIONS, 
  LocationCoordinates 
} from '@/src/lib/vedic-astronomy';
import { getSavedLocationState } from '@/src/lib/location-service';

export interface FloatingActionDockProps {
  location?: LocationCoordinates;
  className?: string;
}

/**
 * FloatingActionDock Component
 * 
 * Luxury, high-converting unified floating action dock pinned to the bottom viewport.
 * Consolidates:
 * 1. 💬 Share Today's Panchang (1-click WhatsApp & native share)
 * 2. 🔔 Daily Alerts (Push notifications toggle & device reliability modal)
 * 3. 📲 Get App (PWA install trigger & guide modal)
 */
export function FloatingActionDock({ location, className = '' }: FloatingActionDockProps) {
  // Push Notification state
  const {
    isSubscribed,
    isLoading: isPushLoading,
    isSendingTest,
    subscribe,
    sendTestAlert,
    isIOS
  } = usePushNotifications(location);

  // PWA Install state
  const {
    isStandalone,
    deferredPrompt,
    promptInstall
  } = usePwaInstall();

  // Modals state
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);

  // Micro-toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // 1. Share Today's Panchang Handler
  const handleShareClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const activeLoc = location || getSavedLocationState()?.location || PRESET_LOCATIONS[0];
      const today = new Date();
      const panchang = calculatePanchang(today, activeLoc);
      const shareData = buildShareDataFromPanchang(today, panchang);

      const result = await sharePanchang(shareData, {
        onToast: (msg) => showToast(msg)
      });

      if (result.method === 'clipboard') {
        showToast('Panchang copied to clipboard!');
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error && error.name === 'AbortError') return;
      showToast('Panchang copied to clipboard!');
    }
  }, [location, showToast]);

  // 2. Daily Alerts Handler
  const handleAlertsClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (isSubscribed) {
      // Already subscribed: open device reliability setup & sound modal to test alerts
      setIsDeviceModalOpen(true);
      return;
    }

    // Unsubscribed: trigger native browser permission request & VAPID subscription
    try {
      const success = await subscribe();
      if (success) {
        showToast('Daily Alerts Enabled! 🔔');
        setIsDeviceModalOpen(true);
      } else {
        // If permission was denied or requires manual gesture, open setup modal guide
        setIsDeviceModalOpen(true);
      }
    } catch {
      setIsDeviceModalOpen(true);
    }
  }, [isSubscribed, subscribe, showToast]);

  // 3. Get App (PWA) Handler
  const handleGetAppClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (isStandalone) {
      showToast('App is running in Standalone Mode ✓');
      return;
    }

    if (deferredPrompt) {
      const installed = await promptInstall();
      if (installed) {
        showToast('PWA Installed successfully! 🎉');
        return;
      }
    }

    // On iOS Safari or desktop without deferred prompt, open visual install modal
    setIsPwaModalOpen(true);
  }, [isStandalone, deferredPrompt, promptInstall, showToast]);

  return (
    <>
      {/* ── UNIFIED FLOATING QUICK-ACTION DOCK ── */}
      <aside
        aria-label="Daily Tithi Quick Actions"
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-40 flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-slate-900/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] select-none w-max max-w-[92vw] transition-all duration-300 ${className}`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 pointer-events-none rounded-full bg-gradient-to-r from-emerald-500/5 via-amber-500/5 to-sky-500/5 -z-10" />

        {/* Action A: Share Today's Panchang */}
        <button
          type="button"
          onClick={handleShareClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title="Share today's live Panchang card on WhatsApp"
          aria-label="Share Today's Panchang on WhatsApp"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="hidden sm:inline">Share Tithi</span>
          <span className="sm:hidden">Share</span>
        </button>

        {/* Action B: Daily Alerts (Push Notifications) */}
        <button
          type="button"
          onClick={handleAlertsClick}
          disabled={isPushLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/40 text-amber-300 transition-all shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title={isSubscribed ? "Daily Alerts active — Click to test sound & settings" : "Enable lock-screen sunrise & tithi notifications"}
          aria-label={isSubscribed ? "Daily Alerts active" : "Enable Daily Alerts"}
        >
          <div className="relative flex items-center justify-center flex-shrink-0">
            <Bell className={`w-3.5 h-3.5 ${isSubscribed ? 'text-emerald-400' : 'text-amber-400'}`} />
            {!isSubscribed && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
            )}
          </div>
          <span className="hidden sm:inline">
            {isSubscribed ? 'Alerts Active' : 'Daily Alerts'}
          </span>
          <span className="sm:hidden">
            Alerts
          </span>
        </button>

        {/* Action C: Get App (PWA Install) */}
        <button
          type="button"
          onClick={handleGetAppClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold bg-sky-950/70 hover:bg-sky-900/90 border border-sky-500/40 text-sky-300 transition-all shadow-sm hover:shadow-[0_0_12px_rgba(14,165,233,0.25)] hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title={isStandalone ? "App is installed and running in standalone mode" : "Install Daily Tithi Web App (PWA) for 100% offline access"}
          aria-label={isStandalone ? "App Installed" : "Get App"}
        >
          {isStandalone ? (
            <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          ) : (
            <ArrowDownToLine className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
          )}
          {isStandalone ? (
            <span>Installed ✓</span>
          ) : (
            <>
              <span className="hidden sm:inline">Get App</span>
              <span className="sm:hidden">App</span>
            </>
          )}
        </button>

        {/* ── EPHEMERAL DOCK MICRO-TOAST ── */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="absolute left-1/2 -top-10 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/50 text-emerald-200 text-[11px] font-medium shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </aside>

      {/* ── MODALS INTEGRATION ── */}
      <DeviceSetupModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        onSendTestAlert={sendTestAlert}
        isSendingTest={isSendingTest}
      />

      <PWAInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </>
  );
}
