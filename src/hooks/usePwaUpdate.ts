"use client";

import { useState, useEffect, useCallback } from 'react';

export interface PwaUpdateState {
  updateAvailable: boolean;
  isChecking: boolean;
  refreshApp: () => void;
  checkForUpdate: () => Promise<void>;
}

export function usePwaUpdate(): PwaUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const checkForUpdate = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      setIsChecking(true);
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setUpdateAvailable(true);
        }
      }
    } catch (err) {
      console.warn('PWA update check notice:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const refreshApp = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload window when new worker claims clients
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    }, { once: true });

    // Fallback reload if controllerchange does not fire within 1.5s
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }, [waitingWorker]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      // 1. If an updated worker is already waiting
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setUpdateAvailable(true);
      }

      // 2. Listen for new updatefound events
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setUpdateAvailable(true);
          }
        });
      });
    });

    // 3. Check for updates on initial mount
    checkForUpdate();

    // 4. Check for updates when tab regains focus / app opened
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. Periodic check every 60 minutes
    const intervalId = setInterval(() => {
      checkForUpdate();
    }, 60 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [checkForUpdate]);

  return {
    updateAvailable,
    isChecking,
    refreshApp,
    checkForUpdate
  };
}
