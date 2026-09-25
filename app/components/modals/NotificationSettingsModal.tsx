"use client";

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Flame,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import {
  checkNotificationCapabilities,
  enableNotificationAlerts,
  disableNotificationAlerts,
  triggerImmediateNotificationTest,
  NotificationCapabilities
} from '@/src/lib/notifications/subscription-manager';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTithiName?: string;
  panchakStatus?: {
    isActive: boolean;
    isInauspicious?: boolean;
    type?: string;
    statusText?: string;
  };
  festivalOrVratName?: string | null;
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
  currentTithiName = 'Shukla Dashami (10)',
  panchakStatus = {
    isActive: true,
    isInauspicious: true,
    type: 'Mrityu Panchak',
    statusText: 'Mrityu Panchak (Inauspicious)'
  },
  festivalOrVratName = 'Vijayadashami'
}: NotificationSettingsModalProps) {
  const [capabilities, setCapabilities] = useState<NotificationCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      checkNotificationCapabilities().then(setCapabilities);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (capabilities?.isEnabled) {
        await disableNotificationAlerts();
      } else {
        await enableNotificationAlerts();
      }
      const updated = await checkNotificationCapabilities();
      setCapabilities(updated);
    } catch (err) {
      console.error('Toggle notification failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAlert = async () => {
    setTestStatus('sending');
    try {
      const res = await triggerImmediateNotificationTest();
      if (res.success) {
        setTestStatus('sent');
        setTestMessage(res.message);
        setTimeout(() => setTestStatus('idle'), 4000);
      } else {
        setTestStatus('error');
        setTestMessage(res.message);
        setTimeout(() => setTestStatus('idle'), 5000);
      }
    } catch {
      setTestStatus('error');
      setTestMessage('Failed to trigger test notification');
      setTimeout(() => setTestStatus('idle'), 5000);
    }
  };

  const isEnabled = Boolean(capabilities?.isEnabled);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg bg-[#0a101f] border border-[#233554] shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl p-5 sm:p-6 text-neutral-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Notification Settings"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#131d33] hover:bg-[#1d2b4b] border border-[#2b3e66] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Bell size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 id="notification-settings-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Panchang Background Alerts
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Instant alerts for Tithi changes, inauspicious Panchak & sacred festivals
            </p>
          </div>
        </div>

        {/* ── Main Master Toggle Card ── */}
        <div className="p-4 rounded-2xl bg-[#0f182c] border border-[#202f4d] flex items-center justify-between gap-4 mb-5 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Background Alerts</span>
              {isEnabled ? (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-700/50 text-neutral-400 border border-neutral-600/30">
                  Off
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {isEnabled
                ? 'Monitored via Periodic Background Sync & Web Push (Every 15–30 min)'
                : 'Turn on to receive timely astronomical & festival alerts'}
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggle}
            disabled={isLoading}
            role="switch"
            aria-checked={isEnabled}
            aria-label="Toggle background panchang notifications"
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#0a101f] ${
              isEnabled ? 'bg-amber-500' : 'bg-neutral-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            >
              {isLoading && (
                <Loader2 size={14} className="animate-spin text-neutral-600 m-1" />
              )}
            </span>
          </button>
        </div>

        {/* ── The 3 Monitored Triggers ── */}
        <div className="mb-5 space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Monitored Trigger Events</span>
          </h3>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {/* Trigger 1 */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={15} />
              </div>
              <div>
                <span className="font-semibold text-white">1. Tithi Transition</span>
                <p className="text-neutral-400 mt-0.5 leading-relaxed">
                  Alerts as soon as the current lunar day concludes and ingress into a new Tithi occurs at any hour of the day.
                </p>
              </div>
            </div>

            {/* Trigger 2 */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert size={15} />
              </div>
              <div>
                <span className="font-semibold text-white">2. Inauspicious Panchak Period (🔴)</span>
                <p className="text-neutral-400 mt-0.5 leading-relaxed">
                  Alerts immediately when an inauspicious Panchak commences (Mrityu, Agni, Chora, or Roga Panchak) to exercise caution for prohibited rites.
                </p>
              </div>
            </div>

            {/* Trigger 3 */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Flame size={15} />
              </div>
              <div>
                <span className="font-semibold text-white">3. Sacred Festivals & Vrats</span>
                <p className="text-neutral-400 mt-0.5 leading-relaxed">
                  Highlights major religious celebrations (Diwali, Maha Shivaratri, Janmashtami) and fasts (Ekadashi, Pradosh) observed today.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Strict Combined Notification Format Preview (Option B - Inline Format) ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Notification Format Preview (Option B - Mobile Glanceable)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131e33] text-amber-400 border border-[#203154]">
              Inline Glanceable
            </span>
          </div>

          {/* System Notification Simulation Frame */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#131c31] to-[#0c1324] border border-[#25375d] shadow-md font-sans">
            <div className="flex items-center justify-between border-b border-[#1f2d4d] pb-2 mb-2 text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5 font-medium">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] font-bold text-black">
                  ॐ
                </div>
                <span className="text-white font-bold">Panchang Update</span>
              </div>
              <span className="text-[10px] text-neutral-400">Now</span>
            </div>

            {/* Notification Body Simulation (Option B - Single line inline with bullet separators) */}
            <div className="text-xs sm:text-[13px] font-mono leading-relaxed text-neutral-200 break-words">
              <span className="text-neutral-400">Tithi: </span>
              <span className="text-white font-bold">{currentTithiName}</span>

              {panchakStatus?.isActive && panchakStatus.isInauspicious && (
                <>
                  <span className="text-neutral-500 mx-1.5">•</span>
                  <span className="text-rose-400 font-bold">🔴 Panchak: {panchakStatus.type || 'Inauspicious'}</span>
                </>
              )}

              {festivalOrVratName && (
                <>
                  <span className="text-neutral-500 mx-1.5">•</span>
                  <span className="text-amber-300 font-medium">Festival: {festivalOrVratName}</span>
                </>
              )}
            </div>
          </div>

          {/* Clarification on Mobile Glanceability & Auspicious Panchaks */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-[#0d1629] border border-[#1b2947] flex items-start gap-2 text-[11px] text-neutral-400 leading-relaxed">
            <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-300">Smart Glanceable Alerts:</strong>
              {' '}Formatted inline (<span className="text-amber-300 font-mono">•</span>) so mobile lock screens display the entire alert without hiding details. Inauspicious Panchaks (Mrityu, Agni, Chora, Roga) are flagged with <span className="text-rose-400 font-bold">🔴</span>, while auspicious ones (Nirdosh & Raj Panchak) are omitted. Only major festivals & premier fasts are highlighted to preserve focus on Tithi.
            </div>
          </div>
        </div>

        {/* ── Battery & Offline Efficiency Card ── */}
        <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 flex items-center justify-between text-xs text-neutral-300 mb-5">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-emerald-400 flex-shrink-0" />
            <span>Zero-network cached ephemeris • Maximum battery efficiency</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
            Idempotent
          </span>
        </div>

        {/* ── Test Notification & Close Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-[#1a2744]">
          <button
            onClick={handleTestAlert}
            disabled={testStatus === 'sending'}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
          >
            {testStatus === 'sending' ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Dispatching Test Alert...</span>
              </>
            ) : testStatus === 'sent' ? (
              <>
                <CheckCircle2 size={15} className="text-black" />
                <span>Test Alert Sent! 🔔</span>
              </>
            ) : (
              <>
                <Bell size={15} />
                <span>Send Test Alert to Screen</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#141e33] hover:bg-[#1c2a47] border border-[#25375c] text-neutral-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {testMessage && (
          <p className={`text-[11px] text-center mt-2.5 font-medium ${testStatus === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {testMessage}
          </p>
        )}
      </div>
    </div>
  );
}
