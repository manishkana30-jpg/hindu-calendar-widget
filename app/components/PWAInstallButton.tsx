"use client";

import React from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { usePwaInstall } from '@/src/hooks/usePwaInstall';
import { PWAInstallModal } from './PWAInstallModal';

export interface PWAInstallButtonProps {
  className?: string;
  compact?: boolean;
}

/**
 * PWAInstallButton Component
 * 
 * Strict visibility guarantees:
 * 1. Returns null while isMounted is false (prevents hydration mismatch and UI flash).
 * 2. Returns null if already running in standalone mode (display-mode: standalone, navigator.standalone, etc.).
 * 3. Returns null if marked installed in localStorage ('pwa_installed' === 'true').
 * 4. Returns null if canInstall is false.
 * 5. Vanishes immediately once app is installed.
 */
export function PWAInstallButton({ className = '', compact = false }: PWAInstallButtonProps) {
  const {
    canInstall,
    isInstalled,
    isMounted,
    isIOS,
    deferredPrompt,
    promptInstall,
    isModalOpen,
    openInstructions,
    closeInstructions
  } = usePwaInstall();

  // ── Bulletproof Visibility Check ──
  // NEVER render on server, NEVER render if installed or in standalone mode
  if (!isMounted || !canInstall || isInstalled) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (isIOS || !deferredPrompt) {
      openInstructions();
    } else {
      await promptInstall();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-950/70 hover:bg-sky-900/90 border border-sky-500/40 text-sky-300 transition-all shadow-sm hover:shadow-[0_0_12px_rgba(14,165,233,0.25)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 animate-in fade-in duration-200 select-none ${className}`}
        title="Install Daily Tithi Web App (PWA) for 100% offline access"
        aria-label="Install App"
      >
        <ArrowDownToLine className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
        {compact ? (
          <span className="text-[11px] font-sans">Install</span>
        ) : (
          <>
            <span className="hidden sm:inline font-sans">Install App</span>
            <span className="sm:hidden font-sans">Install</span>
          </>
        )}
      </button>

      {/* Manual / iOS Safari Step-by-Step Installation Modal */}
      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={closeInstructions}
        deferredPrompt={deferredPrompt}
        onDirectInstall={deferredPrompt ? () => promptInstall() : undefined}
      />
    </>
  );
}

export default PWAInstallButton;
