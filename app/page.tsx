"use client";

import React, { useEffect, useState } from 'react';
import { 
  Sparkles, ShieldCheck, ArrowDownToLine, 
  Share2
} from 'lucide-react';
import { HinduPanchangWidget } from './components/HinduPanchangWidget';
import { MonthlyVedicCalendar } from './components/MonthlyVedicCalendar';
import { PWAInstallModal } from './components/PWAInstallModal';
import { ShareModal } from './components/ShareModal';

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    // Listen for the native PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register Service Worker for offline PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration error:', err);
      });
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
    // Also open the installation modal guide
    setIsInstallModalOpen(true);
  };

  const handleShareClick = async () => {
    const shareData = {
      title: 'Hindu Calendar & Live Panchang',
      text: 'Experience high-precision Vedic Panchang with live Ishta Kaal, 8-Pahar, real-time Muhurats & Dharmashastra rules. Install directly as a 100% warning-free Web App (PWA):',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://vikram-samvat-widget.vercel.app'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or fallback to modal
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Decorative ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-[1200px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/5 blur-[160px] rounded-full" />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b16]/85 backdrop-blur-xl border-b border-[#162038]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-md">🕉️</span>
            <div>
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white block leading-tight">
                Hindu Calendar &amp; Live Panchang
              </span>
              <span className="text-[10px] text-orange-400 font-mono tracking-wider uppercase">
                High-Precision Vedic Astrometry
              </span>
            </div>
          </div>
          
          {/* Top Right: Share & Install Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Share Button (Accesses Bluetooth, WhatsApp, LINE, etc.) */}
            <button
              onClick={handleShareClick}
              title="Share App (Bluetooth, WhatsApp, LINE, etc.)"
              aria-label="Share App"
              className="px-3.5 py-2 rounded-full bg-[#11192e] hover:bg-[#1a2645] text-neutral-300 hover:text-white transition-all border border-[#233152] flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer active:scale-95"
            >
              <Share2 size={14} className="text-orange-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Install Web App (PWA) Button */}
            <button 
              onClick={handleInstallClick}
              className="text-xs font-bold px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-white transition-all border border-emerald-500/30 flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <ArrowDownToLine size={14} className="text-emerald-400" />
              <span>Install Web App (PWA)</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section with Live Widget ── */}
      <section className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold mb-4 backdrop-blur-md">
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>Vedic Time • 100% Warning-Free Web App (PWA)</span>
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

        {/* ── Main Panchang Widget ── */}
        <div className="my-6">
          <HinduPanchangWidget onShareClick={handleShareClick} />
        </div>

        {/* ── Action Buttons (Install & Share) ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button 
            onClick={handleInstallClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-7 py-3.5 rounded-2xl font-extrabold text-sm hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <ArrowDownToLine size={18} />
            <span>Install Web App (PWA) &amp; View Guide</span>
          </button>

          <button 
            onClick={handleShareClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0e1629] hover:bg-[#15223e] text-neutral-200 hover:text-white px-6 py-3.5 rounded-2xl font-bold text-sm border border-[#233152] transition-all cursor-pointer"
          >
            <Share2 size={16} className="text-orange-400" />
            <span>Share App with Others</span>
          </button>
        </div>

        <p className="text-xs text-neutral-400 mt-3 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Installs directly to <strong>Windows</strong>, <strong>Android</strong> &amp; <strong>iOS</strong> without browser or antivirus warnings.</span>
        </p>

        {/* ── Monthly Vedic Calendar Section ── */}
        <div className="mt-14 pt-10 border-t border-[#162038] text-left">
          <div className="mb-5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-2">
              <Sparkles size={12} />
              <span>Full Month View</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Vedic Monthly Calendar &amp; Udaya Tithi Almanac
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              High-precision astronomical calendar with Purnima, Amavasya, Ekadashi highlights &amp; exact Tithi conclusion times.
            </p>
          </div>
          <MonthlyVedicCalendar />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 text-center text-xs text-neutral-500 border-t border-[#162038] bg-[#050811]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🕉️</span>
            <span className="font-semibold text-neutral-300">Hindu Calendar &amp; Live Panchang</span>
            <span>• Progressive Web App</span>
          </div>
          <div>
            Built with Swiss Ephemeris astronomical algorithms. Offline-first &amp; ultra-lightweight.
          </div>
        </div>
      </footer>

      {/* ── PWA Installation Modal & Platform Guide ── */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onDirectInstall={handleInstallClick}
        deferredPrompt={deferredPrompt}
      />

      {/* ── Share Modal (Bluetooth, WhatsApp, LINE, Telegram, etc.) ── */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

    </div>
  );
}
