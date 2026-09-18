"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Bell, Check } from 'lucide-react';
import { HinduPanchangWidget } from './components/HinduPanchangWidget';
import { pushTestTithiNotification, initAutomaticDailyNotifications } from '@/src/lib/notifications/client-trigger';

export default function LandingPage() {
  const [testNotificationState, setTestNotificationState] = useState<'idle' | 'sending' | 'sent' | 'denied' | 'error'>('idle');

  useEffect(() => {
    // Register Service Worker for offline PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').then(() => {
        initAutomaticDailyNotifications();
      }).catch((err) => {
        console.log('SW registration error:', err);
      });
    } else {
      initAutomaticDailyNotifications();
    }
  }, []);

  const handleHeaderTestNotification = useCallback(async () => {
    setTestNotificationState('sending');
    const res = await pushTestTithiNotification();
    if (res.success) {
      setTestNotificationState('sent');
      setTimeout(() => setTestNotificationState('idle'), 4000);
    } else if (res.error === 'PERMISSION_DENIED') {
      setTestNotificationState('denied');
      setTimeout(() => setTestNotificationState('idle'), 4500);
    } else {
      setTestNotificationState('error');
      setTimeout(() => setTestNotificationState('idle'), 4000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Decorative ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-[1200px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/5 blur-[160px] rounded-full" />
      </div>

      {/* ── Navbar: Brand, Push Test Notification & live status indicator ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b16]/85 backdrop-blur-xl border-b border-[#162038]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-md">🕉️</span>
            <div>
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white block leading-tight">
                Hindu Calendar & Live Panchang
              </span>
              <span className="text-[10px] text-orange-400 font-mono tracking-wider uppercase">
                High-Precision Vedic Astrometry
              </span>
            </div>
          </div>
          
          {/* Top Right: One-tap Push Test Notification & Status Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleHeaderTestNotification}
              title="Push live Tithi test notification to your screen right now"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              {testNotificationState === 'sent' ? (
                <Check size={13} className="text-emerald-400" />
              ) : (
                <Bell size={13} className={testNotificationState === 'sending' ? 'animate-spin' : 'animate-bounce text-amber-400'} />
              )}
              <span>
                {testNotificationState === 'sent'
                  ? 'Pushed to Screen! 🔔'
                  : testNotificationState === 'denied'
                  ? 'Permission Blocked ⚠️'
                  : 'Push Test Tithi'}
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#11192e] border border-[#233152] text-xs font-medium text-neutral-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-neutral-300">Live Astrometry</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section with Live Widget ── */}
      <section className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold mb-4 backdrop-blur-md">
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>Vedic Time • 100% Offline Web App (PWA)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          Vedic Time. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500">
            Real-Time Astrometry.
          </span>
        </h1>
        
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto mb-6 leading-relaxed">
          High-precision Vedic Panchang with live Ishta Kaal, 8-Pahar segmentation, real-time Muhurats, and Dharmashastra determination rules.
        </p>

        {/* ── Main Panchang Widget (Completely unobstructed, never covered by banners) ── */}
        <div className="my-6">
          <HinduPanchangWidget />
        </div>

      </section>

      {/* ── Footer ── */}
      <footer className="py-10 text-center text-xs text-neutral-500 border-t border-[#162038] bg-[#050811]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🕉️</span>
            <span className="font-semibold text-neutral-300">Hindu Calendar & Live Panchang</span>
            <span>• Progressive Web App</span>
          </div>
          <div>
            Built with Swiss Ephemeris astronomical algorithms. Offline-first & ultra-lightweight.
          </div>
        </div>
      </footer>

    </div>
  );
}

