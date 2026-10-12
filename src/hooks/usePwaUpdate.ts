"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

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
  const isRefreshingRef = useRef<boolean>(false);

  const checkForUpdate = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Guard: If user recently clicked refresh, suppress prompt to break reload loops
    try {
      const recentlyRefreshed = sessionStorage.getItem('pwa_refreshed_at');
      if (recentlyRefreshed && Date.now() - Number(recentlyRefreshed) < 15000) {
        return;
      }
    } catch {}

    try {
      setIsChecking(true);
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        if (reg.waiting && reg.waiting.state !== 'activated') {
          setWaitingWorker(reg.waiting);
          setUpdateAvailable(true);
        } else {
          setWaitingWorker(null);
          setUpdateAvailable(false);
        }
      }
    } catch (err) {
      console.warn('PWA update check notice:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const refreshApp = useCallback(() => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    // Record reload timestamp to prevent infinite reload loops
    try {
      sessionStorage.setItem('pwa_refreshed_at', Date.now().toString());
    } catch {}

    setUpdateAvailable(false);

    // Send SKIP_WAITING to the waiting service worker
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }

    let reloaded = false;
    const triggerReload = () => {
      if (!reloaded) {
        reloaded = true;
        window.location.reload();
      }
    };

    // Reload window when new worker activates and claims the client
    navigator.serviceWorker.addEventListener('controllerchange', triggerReload, { once: true });

    // Fallback reload if controllerchange does not fire within 1 second
    setTimeout(triggerReload, 1000);
  }, [waitingWorker]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Check if recently refreshed
    try {
      const recentlyRefreshed = sessionStorage.getItem('pwa_refreshed_at');
      if (recentlyRefreshed && Date.now() - Number(recentlyRefreshed) < 15000) {
        sessionStorage.removeItem('pwa_refreshed_at');
        return;
      }
    } catch {}

    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      if (isRefreshingRef.current) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      // 1. If an updated worker is already waiting
      if (reg.waiting && reg.waiting.state !== 'activated') {
        setWaitingWorker(reg.waiting);
        setUpdateAvailable(true);
      }

      // 2. Listen for new updatefound events
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            if (reg.waiting === newWorker) {
              setWaitingWorker(newWorker);
              setUpdateAvailable(true);
            }
          } else if (newWorker.state === 'activated') {
            setWaitingWorker(null);
            setUpdateAvailable(false);
          }
        });
      });
    });

    // 3. Check for updates after initial render settles (2s delay to prevent hydration race)
    const timer = setTimeout(() => {
      checkForUpdate();
    }, 2000);

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
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
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
