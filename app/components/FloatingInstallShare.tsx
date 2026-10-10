"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowDownToLine, Share2, X, Check, 
  Sparkles, ShieldCheck, Smartphone, Bell
} from 'lucide-react';
import { PWAInstallModal } from './PWAInstallModal';
import { triggerImmediateNotificationTest } from '@/src/lib/notifications/subscription-manager';
import { sharePanchang, buildShareDataFromPanchang } from '@/src/lib/utils/sharePanchang';
import { calculatePanchang, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { getSavedLocationState } from '@/src/lib/location-service';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface FloatingInstallShareProps {
  className?: string;
}

export function FloatingInstallShare({ className = '' }: FloatingInstallShareProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'sending' | 'sent' | 'denied' | 'error'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Capture beforeinstallprompt event for PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 2. Click outside listener to collapse back into floating bubble
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // 3. Escape key listener for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle PWA installation
  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
    // Also open the platform-specific visual guide modal (crucial for iOS/Safari & manual install)
    setIsInstallModalOpen(true);
    setIsOpen(false);
  }, [deferredPrompt]);

  // Handle Native Share with WhatsApp & Clipboard Fallback
  const handleShareClick = useCallback(async () => {
    try {
      const loc = getSavedLocationState()?.location || PRESET_LOCATIONS[0];
      const today = new Date();
      const panchang = calculatePanchang(today, loc);
      const shareData = buildShareDataFromPanchang(today, panchang);

      const result = await sharePanchang(shareData, {
        onToast: () => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2500);
        }
      });

      if (result.method === 'clipboard') {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } else if (result.success) {
        setIsOpen(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error && error.name === 'AbortError') return;
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  }, []);

  // Handle Direct Live Tithi Test Notification
  const handleNotificationTest = useCallback(async () => {
    setNotificationStatus('sending');
    const result = await triggerImmediateNotificationTest();
    if (result.success) {
      setNotificationStatus('sent');
      setTimeout(() => setNotificationStatus('idle'), 4000);
    } else if (result.message?.toLowerCase().includes('denied')) {
      setNotificationStatus('denied');
      setTimeout(() => setNotificationStatus('idle'), 4500);
    } else {
      setNotificationStatus('error');
      setTimeout(() => setNotificationStatus('idle'), 4000);
    }
  }, []);

  return (
    <>
      <aside 
        ref={containerRef}
        aria-label="Install and Share Action Hub"
        className={`fixed bottom-5 right-5 z-50 select-none ${className}`}
        style={{
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
          paddingRight: 'max(0px, env(safe-area-inset-right))'
        }}
      >
        {/* ── EXPANDED ACTION BANNER (OPEN STATE) ── */}
        {isOpen && (
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Install & Share Options"
            className="absolute bottom-full right-0 mb-3 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-[#0c1324]/95 backdrop-blur-2xl border border-[#25375d] shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-2xl p-4 text-left transition-all duration-300 ease-out animate-in fade-in zoom-in-95"
          >
            {/* Header: Title & Close Button */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1b2847]">
              <div className="flex items-center gap-2">
                <span className="text-lg select-none">🕉️</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight">
                    Vedic Panchang Actions
                  </h3>
                  <p className="text-[10px] text-orange-400 font-mono uppercase tracking-wider">
                    Offline App, Sharing & Alerts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close action menu"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-[#141f38] hover:bg-[#1d2d52] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Option A: Install Web App (PWA) */}
            <div className="mb-2.5">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 mb-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>Runs 100% Offline • Zero App Store Lag</span>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-[#102422] to-[#0f1f2e] hover:from-[#163532] hover:to-[#172e45] border border-emerald-500/40 hover:border-emerald-400 transition-all group cursor-pointer shadow-lg active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ArrowDownToLine size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                        Install Web App (PWA)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 uppercase">
                        Free
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-0.5">
                      iOS: Tap Share ⎋ → Add to Home Screen ⊞
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Option B: Share with Friends & Family */}
            <div className="mb-2.5">
              <button
                onClick={handleShareClick}
                className="w-full text-left p-3 rounded-xl bg-[#11192e] hover:bg-[#182442] border border-[#233152] hover:border-orange-500/50 transition-all group cursor-pointer shadow-md active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {isCopied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white group-hover:text-orange-300 transition-colors">
                        {isCopied ? "Panchang Copied! ✅" : "Share Today's Panchang"}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {isCopied ? "Panchang copied to clipboard" : "Share on WhatsApp or native share sheet"}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Option C: Push Test Tithi Notification */}
            <div>
              <button
                onClick={handleNotificationTest}
                className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-[#1d1608] to-[#141d2f] hover:from-[#291e0a] hover:to-[#1b2844] border border-amber-500/40 hover:border-amber-400 transition-all group cursor-pointer shadow-md active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {notificationStatus === 'sent' ? (
                      <Check size={18} className="text-emerald-400" />
                    ) : (
                      <Bell size={18} className={notificationStatus === 'sending' ? 'animate-spin' : 'animate-pulse'} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors">
                        {notificationStatus === 'sent'
                          ? "Notification Pushed! 🔔"
                          : notificationStatus === 'denied'
                          ? "Permission Blocked ⚠️"
                          : "Daily Floating Lock-Screen Alert"}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                        {notificationStatus === 'sending' ? 'Sending...' : 'Test'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {notificationStatus === 'sent'
                        ? "Check your device screen right now!"
                        : notificationStatus === 'denied'
                        ? "Enable notifications in browser settings"
                        : "Pushes 5-line summary with Muhurats to lock screen"}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Trust Footer */}
            <div className="mt-3 pt-2 border-t border-[#1b2847] flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>Drik Ganita • Swiss Ephemeris</span>
              </span>
              <span className="text-emerald-400 font-semibold">100% Safe</span>
            </div>
          </div>
        )}

        {/* ── FLOATING TRIGGER BUBBLE (CLOSED STATE) ── */}
        <div className="relative group">
          {/* Animated Ambient Pulsing Glow Ring */}
          <div 
            className="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 via-amber-500/30 to-orange-500/40 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse pointer-events-none" 
          />

          {/* Trigger Capsule Button */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            aria-label="Open App Installation and Share Menu"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0c1424]/95 hover:bg-[#131e36] text-white border border-emerald-500/50 hover:border-emerald-400 shadow-2xl backdrop-blur-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          >
            {/* Download Icon */}
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ArrowDownToLine size={13} />
            </div>

            {/* Microcopy */}
            <span className="text-xs font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Get App & Alerts</span>
            </span>

            {/* Divider */}
            <span className="w-px h-3.5 bg-[#25375d]" />

            {/* Notification Bell Icon */}
            <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Bell size={12} className="animate-pulse" />
            </div>

            {/* Live Indicator Ping */}
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </button>
        </div>
      </aside>

      {/* Existing PWA Installation Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onDirectInstall={handleInstallClick}
        deferredPrompt={deferredPrompt}
      />
    </>
  );
}
