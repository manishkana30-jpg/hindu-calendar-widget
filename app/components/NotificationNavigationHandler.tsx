"use client";

import React from 'react';
import { useNotificationNavigation } from '@/src/hooks/useNotificationNavigation';
import { Bell, X, Compass, Sparkles } from 'lucide-react';

/**
 * Client component that connects Notification deep-linking and Service Worker
 * warm-tab routing, and presents the full, un-truncated notification details
 * whenever a user taps a Web Push notification on their device.
 */
export function NotificationNavigationHandler() {
  const { notificationAlert, dismissNotificationAlert } = useNotificationNavigation();

  if (!notificationAlert) {
    return null;
  }

  const handleExplore = () => {
    dismissNotificationAlert();
    // Smoothly scroll to main Panchang widget
    const widget = document.getElementById('panchang-widget') || document.querySelector('main') || document.body;
    widget?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-alert-title"
    >
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] via-[#090e1a] to-[#050811] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">🌸</span>
            <span id="notif-alert-title" className="font-extrabold text-sm sm:text-base text-amber-300 tracking-tight">
              {notificationAlert.title}
            </span>
          </div>
          <button
            type="button"
            onClick={dismissNotificationAlert}
            aria-label="Close notification"
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notification Body Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 shadow-inner mb-5">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
            {notificationAlert.body}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={dismissNotificationAlert}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleExplore}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform active:scale-95 cursor-pointer"
          >
            <Compass size={14} />
            <span>Explore Full Panchang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
