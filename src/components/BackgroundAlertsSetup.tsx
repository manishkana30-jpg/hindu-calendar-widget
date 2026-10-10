"use client";

import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  Send,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Loader2,
  Sparkles,
  Settings
} from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { LocationCoordinates } from '../lib/vedic-astronomy';
import { DeviceSetupModal } from './DeviceSetupModal';

export interface BackgroundAlertsSetupProps {
  location?: LocationCoordinates;
  className?: string;
}

/**
 * BackgroundAlertsSetup Component
 * 
 * Provides platform-compliant controls to register, test, and manage lock-screen
 * background push notifications across Android, iOS PWA, and Desktop environments.
 * 
 * Honest platform transparency: Background push delivery operates within OS-level
 * limits (Android Doze / battery optimization, iOS Web Push standalone requirements)
 * without making unsubstantiated 100% guarantees.
 */
export function BackgroundAlertsSetup({ location, className = '' }: BackgroundAlertsSetupProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    isSendingTest,
    hasVapidKey,
    error,
    isIOS,
    isStandalone,
    subscribe,
    unsubscribe,
    sendTestAlert
  } = usePushNotifications(location);

  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(false);

  const handleTestAlert = async () => {
    setTestSentMessage(null);
    const success = await sendTestAlert();
    if (success) {
      setTestSentMessage('Test alert dispatched! Check your notification shade / lock screen.');
      setTimeout(() => setTestSentMessage(null), 7000);
    }
  };

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      try {
        const viewed = localStorage.getItem('daily_tithi_device_setup_viewed');
        if (viewed !== 'true') {
          setIsDeviceModalOpen(true);
        }
      } catch {
        // Safe fallback
      }
    }
  };

  // ── State 1: iOS Browser Not Yet Installed to Home Screen ───────────────────
  // Per Apple WebKit guidelines (iOS 16.4+), PushManager.subscribe() requires the PWA
  // to be launched from the iOS Home Screen (standalone display mode).
  // Must evaluate iOS standalone check before generic unsupported check because WebKit
  // completely hides PushManager from window in regular browser tabs.
  if (isIOS && !isStandalone) {
    return (
      <>
        <div className={`p-4 rounded-2xl bg-[#0e1628]/95 border border-amber-500/30 text-white shadow-lg backdrop-blur-md ${className}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200">iOS Setup Required for Lock-Screen Alerts</h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {"To enable lock-screen alerts on iOS, tap Share (⎋) → 'Add to Home Screen' first."}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141e33] border border-[#233152] text-[11px] text-neutral-300 font-mono">
                  <span>Step: Safari Share ⎋</span>
                  <span>→</span>
                  <span>Add to Home Screen ⊞</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-2">
                  Note: Apple restricts push notification APIs to installed home-screen web apps.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDeviceModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#141e33] hover:bg-[#1d2a47] border border-[#233152] text-amber-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">Device Guide</span>
            </button>
          </div>
        </div>

        <DeviceSetupModal
          isOpen={isDeviceModalOpen}
          onClose={() => setIsDeviceModalOpen(false)}
          onSendTestAlert={handleTestAlert}
          isSendingTest={isSendingTest}
        />
      </>
    );
  }

  // ── State 2: Browser completely lacks PushManager or ServiceWorker ──────────
  if (!isSupported) {
    return (
      <div className={`p-4 rounded-xl bg-[#0c1426]/90 border border-neutral-800 text-neutral-400 text-xs ${className}`}>
        <div className="flex items-center gap-2 text-neutral-300 font-semibold mb-1">
          <BellOff size={16} className="text-neutral-500" />
          <span>Background Alerts Unsupported</span>
        </div>
        <p>
          This browser engine does not support the W3C Push API. For lock-screen alerts,
          use Chrome or Edge on Android/Desktop, or install this web app via Safari on iOS 16.4+.
        </p>
      </div>
    );
  }

  // ── State 3: Notification Permission Denied at OS / Browser Level ───────────
  if (permission === 'denied') {
    return (
      <>
        <div className={`p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-200 shadow-md ${className}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <BellOff size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-300">Notifications Blocked</h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  Notifications are blocked at the OS level. Enable them in your device settings.
                </p>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Click the lock or site settings icon in your browser address bar and switch Notifications to &apos;Allow&apos;.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDeviceModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#1f1624] hover:bg-[#2b1f33] border border-red-500/30 text-amber-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">Device Guide</span>
            </button>
          </div>
        </div>

        <DeviceSetupModal
          isOpen={isDeviceModalOpen}
          onClose={() => setIsDeviceModalOpen(false)}
          onSendTestAlert={handleTestAlert}
          isSendingTest={isSendingTest}
        />
      </>
    );
  }

  // ── State 4: Alerts Active / Subscribed ─────────────────────────────────────
  if (isSubscribed) {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl bg-[#091122]/95 border border-emerald-500/30 shadow-xl backdrop-blur-md text-white ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Lock-Screen Alerts Active</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                Daily Sunrise Tithi, inauspicious Panchak transitions, and sacred Vrats will be delivered directly to your device lock screen.
              </p>
              <p className="text-[10px] text-neutral-400 mt-1.5 leading-normal">
                Platform Notice: Alerts are dispatched with High Urgency. Background wakeups operate within device battery optimization and OS sleep constraints.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap sm:flex-nowrap">
            <button
              onClick={handleTestAlert}
              disabled={isSendingTest || !hasVapidKey}
              title={!hasVapidKey ? 'VAPID credentials unconfigured on server. Run "npm run generate-vapid" to set up.' : 'Send Test Alert to device'}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSendingTest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>{isSendingTest ? 'Sending...' : 'Send Test Alert'}</span>
            </button>

            <button
              onClick={() => setIsDeviceModalOpen(true)}
              title="Ensure lock-screen delivery and battery settings"
              className="px-3 py-2 rounded-xl bg-[#141e33] hover:bg-[#1d2a47] border border-[#233152] text-amber-300 hover:text-amber-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">⚙️ Ensure Lock-Screen Delivery</span>
              <span className="sm:hidden">⚙️ Setup</span>
            </button>

            <button
              onClick={() => unsubscribe()}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-[#141e33] hover:bg-[#1d2a47] border border-[#233152] text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Disable
            </button>
          </div>
        </div>

        {/* Informational Status Banner for Device Battery & Lock-Screen Permissions */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Settings size={15} />
            </div>
            <p className="text-neutral-300 leading-relaxed text-xs">
              Notifications delivered at High Urgency. If alerts are delayed on locked devices, configure your phone&apos;s battery and lock-screen permissions.
            </p>
          </div>
          <button
            onClick={() => setIsDeviceModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center justify-center gap-1.5"
          >
            <span>Configure Device Settings ⚙️</span>
          </button>
        </div>

        {testSentMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{testSentMessage}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <DeviceSetupModal
          isOpen={isDeviceModalOpen}
          onClose={() => setIsDeviceModalOpen(false)}
          onSendTestAlert={handleTestAlert}
          isSendingTest={isSendingTest}
        />
      </div>
    );
  }

  // ── State 5: Unsubscribed (Default / Ready to Subscribe) ────────────────────
  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[#091122]/95 border border-amber-500/30 shadow-xl backdrop-blur-md text-white ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Bell size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Daily Vedic Panchang Alerts</h3>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Lock Screen
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              Receive a glanceable sunrise briefing: primary Tithi, inauspicious Panchak periods (🔴), and major festivals even when the browser is closed.
            </p>
            <p className="text-[10px] text-neutral-400 mt-1.5">
              Zero spam. High-priority collapsed topic. Delivery subject to OS power management constraints.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsDeviceModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#141e33] hover:bg-[#1d2a47] border border-[#233152] text-amber-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Settings size={14} />
            <span>Device Reliability Setup</span>
          </button>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-extrabold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>{isLoading ? 'Enabling...' : 'Enable Lock-Screen Alerts'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DeviceSetupModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        onSendTestAlert={handleTestAlert}
        isSendingTest={isSendingTest}
      />
    </div>
  );
}
