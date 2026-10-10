"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export type DeepLinkView = 'muhurat' | 'calendar' | 'default';

/**
 * Handles deep-linking from Web Push notifications (cold starts and warm background tabs).
 * - Reads `?view=muhurat` or `?view=calendar` query parameters on mount or route changes.
 * - Listens for Service Worker `NOTIFICATION_NAVIGATE` messages on warm open tabs.
 * - Programmatically opens the respective 24h Muhurat Matrix or 30-Day Almanac modal.
 * - Cleans up the query parameters (`/`) when the user closes the modal.
 */
export function useNotificationNavigation() {
  const searchParams = useSearchParams();
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeViewRef = useRef<DeepLinkView | null>(null);

  const openMuhuratModal = useCallback((): boolean => {
    const el = document.querySelector<HTMLElement>(
      '[aria-label="Open Daily Muhurat Timetable and Choghadiya Matrix"], [title*="24h Muhurat Matrix"]'
    );
    if (el) {
      el.click();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
    return false;
  }, []);

  const openCalendarModal = useCallback((): boolean => {
    const el = document.querySelector<HTMLElement>(
      '[aria-label="Open Vedic Monthly Calendar and Udaya Tithi Almanac"], [title*="Monthly Calendar of Tithis"]'
    );
    if (el) {
      el.click();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
    return false;
  }, []);

  const triggerView = useCallback((view: 'muhurat' | 'calendar') => {
    activeViewRef.current = view;
    const opener = view === 'muhurat' ? openMuhuratModal : openCalendarModal;

    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    // Try immediately
    if (opener()) return;

    // Retry periodically if widget is still mounting (e.g. cold start)
    let attempts = 0;
    const maxAttempts = 30; // 30 * 50ms = 1.5s
    retryTimerRef.current = setInterval(() => {
      attempts++;
      if (opener() || attempts >= maxAttempts) {
        if (retryTimerRef.current) {
          clearInterval(retryTimerRef.current);
          retryTimerRef.current = null;
        }
      }
    }, 50);
  }, [openMuhuratModal, openCalendarModal]);

  // 1. URL Query Parameter Listener (Cold start & in-app navigation)
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'muhurat') {
      triggerView('muhurat');
    } else if (viewParam === 'calendar') {
      triggerView('calendar');
    }
  }, [searchParams, triggerView]);

  // 2. Service Worker postMessage Listener (For Warm / Background Tabs)
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_NAVIGATE') {
        const view = event.data.view as string | undefined;
        if (view === 'muhurat') {
          triggerView('muhurat');
        } else if (view === 'calendar') {
          triggerView('calendar');
        }
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
      }
    };
  }, [triggerView]);

  // 3. Clean Query Parameters on Modal Close
  // When the user closes either modal, replace `?view=...` with `/` so refreshing doesn't loop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanQueryParam = () => {
      if (window.location.search.includes('view=')) {
        const cleanPath = window.location.pathname || '/';
        window.history.replaceState(null, '', cleanPath);
        activeViewRef.current = null;
      }
    };

    // Listen for Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTimeout(cleanQueryParam, 80);
      }
    };

    // Listen for clicks on Close / Back buttons or backdrop overlays
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (
        target.closest('button[title*="Return to Live Widget"]') ||
        target.closest('button[aria-label*="Return to Live Widget"]') ||
        target.closest('.fixed.inset-0.z-50 button') ||
        (target.classList.contains('fixed') && target.classList.contains('inset-0'))
      ) {
        setTimeout(cleanQueryParam, 80);
      }
    };

    // Observe modal removal from DOM after it was actually mounted
    let modalWasOpened = false;
    const observer = new MutationObserver(() => {
      if (activeViewRef.current && window.location.search.includes('view=')) {
        // Check if any modal is currently visible in DOM
        const hasOpenModal = document.querySelector('.fixed.inset-0.z-50') !== null;
        if (hasOpenModal) {
          modalWasOpened = true;
        } else if (modalWasOpened) {
          modalWasOpened = false;
          cleanQueryParam();
        }
      }
    });

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick, true);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick, true);
      observer.disconnect();
    };
  }, []);
}
