"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { usePwaUpdate } from '@/src/hooks/usePwaUpdate';

export function PwaUpdatePrompt() {
  const pathname = usePathname();
  const { updateAvailable, refreshApp } = usePwaUpdate();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  if (pathname?.startsWith('/embed')) return null;
  if (!updateAvailable || isDismissed) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshApp();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0c1426]/95 border border-amber-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-md text-white text-xs">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="animate-spin" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-bold text-white tracking-tight">Update available</div>
          <div className="text-[11px] text-neutral-300 mt-0.5">
            A new version of Panchang is ready.
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss update notification"
          className="w-6 h-6 rounded-lg text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
