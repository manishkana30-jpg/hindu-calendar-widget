"use client";

import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaInstallState {
  canInstall: boolean;
  isInstallable: boolean; // alias for canInstall for backwards compatibility
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isMounted: boolean;
  promptInstall: () => Promise<boolean>;
  deferredPrompt: BeforeInstallPromptEvent | null;
  openInstructions: () => void;
  closeInstructions: () => void;
  isModalOpen: boolean;
}

/**
 * Hook to manage PWA installation state, standalone mode detection,
 * and deferred beforeinstallprompt capture.
 *
 * Guarantees:
 * - canInstall and isMounted default to false (prevents UI flicker / hydration mismatch).
 * - Standalone check (display-mode: standalone, navigator.standalone, android-app referrer) hides button immediately.
 * - Persistent flag (localStorage 'pwa_installed' === 'true') prevents button reappearance.
 * - Chromium beforeinstallprompt captures deferred prompt and enables installation.
 * - iOS Safari detection enables instructions modal without crashing.
 * - appinstalled event auto-syncs localStorage and unmounts the install button immediately.
 */
export function usePwaInstall(): PwaInstallState {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsMounted(true);

    // 1. Standalone Mode Check (Already Installed & Running)
    const nav = window.navigator as { standalone?: boolean };
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean(nav.standalone) ||
      (typeof document !== 'undefined' && document.referrer.startsWith('android-app://'));

    setIsStandalone(standaloneMode);

    // 2. Persistent Installation Flag Check
    let markedInstalled = false;
    try {
      markedInstalled = localStorage.getItem('pwa_installed') === 'true';
    } catch {
      // In restricted iframes or privacy mode, localStorage access might throw
    }

    if (standaloneMode || markedInstalled) {
      setIsInstalled(true);
      setCanInstall(false);
      return; // Already installed — exit early so button is never shown
    }

    // 3. iOS Device Handling (Safari does not support beforeinstallprompt)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      ua.includes('iphone') ||
      ua.includes('ipad') ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    if (isIOSDevice && !standaloneMode && !markedInstalled) {
      setCanInstall(true);
    }

    // 4. Chromium / Android Lifecycle (beforeinstallprompt & appinstalled)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as BeforeInstallPromptEvent);
      if (!standaloneMode && !markedInstalled) {
        setCanInstall(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      setIsModalOpen(false);
      try {
        localStorage.setItem('pwa_installed', 'true');
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // Fallback: If no deferred prompt (e.g. iOS Safari or manual prompt required), open modal guide
      setIsModalOpen(true);
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
        setIsModalOpen(false);
        try {
          localStorage.setItem('pwa_installed', 'true');
        } catch {}
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const openInstructions = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeInstructions = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    canInstall,
    isInstallable: canInstall,
    isInstalled,
    isStandalone,
    isIOS,
    isMounted,
    promptInstall,
    deferredPrompt,
    openInstructions,
    closeInstructions,
    isModalOpen
  };
}

export const usePWAInstall = usePwaInstall;
