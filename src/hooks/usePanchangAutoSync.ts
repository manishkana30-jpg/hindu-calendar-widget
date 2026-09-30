"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  LocationCoordinates,
  PanchangData,
  calculatePanchang
} from '../lib/vedic-astronomy';
import {
  DailyTithiResolution,
  resolveDailyTithi
} from '../lib/tithi-resolver';

export interface AutoSyncOptions {
  location: LocationCoordinates;
  isLiveMode?: boolean;
  customDate?: Date;
  elevationMeters?: number;
}

export interface AutoSyncResult {
  currentTime: Date;
  panchang: PanchangData;
  tithiResolution: DailyTithiResolution;
  isPreSunrise: boolean;
  isLiveMode: boolean;
  isMounted: boolean;
  lastSyncTimestamp: number;
  forceSync: () => void;
}

/**
 * Custom React hook for high-precision real-time synchronization of the Vedic Panchang and Tithi engine.
 * Eliminates stale state and handles background sleep recovery using a Dual Trigger System,
 * visibility/online listeners, clock-drift mitigation, and silent PushSubscription synchronization.
 */
export function usePanchangAutoSync({
  location,
  isLiveMode = true,
  customDate,
  elevationMeters = 0
}: AutoSyncOptions): AutoSyncResult {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(() =>
    isLiveMode || !customDate ? new Date() : customDate
  );
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(() => Date.now());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // References for precision timers and drift monitoring
  const sunriseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tithiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clockTickRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatTimeRef = useRef<number>(Date.now());

  // Stable manual/reactive trigger
  const forceSync = useCallback(() => {
    const now = new Date();
    setCurrentTime(now);
    setLastSyncTimestamp(now.getTime());
  }, []);

  // Update time when customDate changes while not in live mode
  useEffect(() => {
    if (!isLiveMode && customDate) {
      setCurrentTime(customDate);
      setLastSyncTimestamp(Date.now());
    }
  }, [isLiveMode, customDate]);

  // Compute active panchang and tithi resolution using untouched astronomical engines
  const activeDate = isLiveMode ? currentTime : customDate || currentTime;
  const panchang: PanchangData = useMemo(() => {
    return calculatePanchang(activeDate, location, isLiveMode ? currentTime : activeDate);
  }, [activeDate, location, isLiveMode, currentTime, lastSyncTimestamp]);

  const tithiResolution: DailyTithiResolution = useMemo(() => {
    return resolveDailyTithi(
      activeDate,
      location,
      isLiveMode ? currentTime : activeDate,
      elevationMeters
    );
  }, [activeDate, location, isLiveMode, currentTime, elevationMeters, lastSyncTimestamp]);

  // Guard against SSR hydration mismatch for DOM elements
  const isPreSunrise = isMounted && Boolean(tithiResolution.isPreSunrise);

  // 1-second live clock update when isLiveMode is active
  useEffect(() => {
    if (!isLiveMode) return;

    clockTickRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (clockTickRef.current) clearInterval(clockTickRef.current);
    };
  }, [isLiveMode]);

  // Dual Trigger System, Visibility/Online Listeners, and Clock Drift Mitigation
  useEffect(() => {
    if (!isLiveMode) return;

    // Clear previous milestone timers
    if (sunriseTimerRef.current) clearTimeout(sunriseTimerRef.current);
    if (tithiTimerRef.current) clearTimeout(tithiTimerRef.current);
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);

    const nowMs = Date.now();
    lastHeartbeatTimeRef.current = nowMs;

    // Trigger 1: Upcoming Local Sunrise Timer (Civil Day Rollover)
    const nextSunriseMs = new Date(tithiResolution.nextSunrise).getTime();
    const delayToSunrise = nextSunriseMs - nowMs;

    // Cap delay within safe 32-bit signed int max (~24.8 days)
    if (delayToSunrise > 0 && delayToSunrise < 2147483647) {
      sunriseTimerRef.current = setTimeout(() => {
        forceSync();
      }, delayToSunrise + 1000);
    }

    // Trigger 2: Upcoming Current Instantaneous Tithi Conclusion Timer
    if (tithiResolution.instantaneousTithi.endTime) {
      const tithiEndMs = new Date(tithiResolution.instantaneousTithi.endTime).getTime();
      const delayToTithiEnd = tithiEndMs - nowMs;

      if (delayToTithiEnd > 0 && delayToTithiEnd < 2147483647) {
        tithiTimerRef.current = setTimeout(() => {
          forceSync();
        }, delayToTithiEnd + 1000);
      }
    }

    // Trigger 3: Browser Visibility & Online Recovery Listeners
    // On foreground recovery or internet restoration, evaluate whether local Tithi state is stale
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const checkNow = Date.now();
        const tithiEndMs = tithiResolution.instantaneousTithi.endTime
          ? new Date(tithiResolution.instantaneousTithi.endTime).getTime()
          : 0;
        const isStale =
          checkNow - lastSyncTimestamp > 5000 ||
          (tithiEndMs > 0 && checkNow >= tithiEndMs) ||
          (nextSunriseMs > 0 && checkNow >= nextSunriseMs);

        if (isStale) {
          forceSync();
        }
      }
    };

    const handleOnline = () => {
      const checkNow = Date.now();
      if (checkNow - lastSyncTimestamp > 5000) {
        forceSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Trigger 4: Clock Drift Mitigation Heartbeat (every 10 seconds)
    heartbeatTimerRef.current = setInterval(() => {
      const currentHeartbeat = Date.now();
      const expectedElapsed = 10000;
      const actualElapsed = currentHeartbeat - lastHeartbeatTimeRef.current;
      lastHeartbeatTimeRef.current = currentHeartbeat;

      const hasDrifted = Math.abs(actualElapsed - expectedElapsed) > 2500;
      const sunrisePassed = nextSunriseMs > (currentHeartbeat - actualElapsed) && currentHeartbeat >= nextSunriseMs;
      const tithiEndMs = tithiResolution.instantaneousTithi.endTime
        ? new Date(tithiResolution.instantaneousTithi.endTime).getTime()
        : null;
      const tithiEndPassed = tithiEndMs
        ? (tithiEndMs > (currentHeartbeat - actualElapsed) && currentHeartbeat >= tithiEndMs)
        : false;

      if (hasDrifted || sunrisePassed || tithiEndPassed) {
        forceSync();
      }
    }, 10000);

    return () => {
      if (sunriseTimerRef.current) clearTimeout(sunriseTimerRef.current);
      if (tithiTimerRef.current) clearTimeout(tithiTimerRef.current);
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [
    isLiveMode,
    tithiResolution.nextSunrise,
    tithiResolution.instantaneousTithi.endTime,
    forceSync,
    lastSyncTimestamp
  ]);

  // Trigger 5: Silent PushSubscription Synchronization On Load
  // Silently checks pushManager.getSubscription() and syncs ONLY if key differs from cached signature
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      return;
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then(async (sub) => {
        if (!sub) return;

        const subJson = sub.toJSON();
        const currentSignature = JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys
        });

        const lastSynced = localStorage.getItem('panchang_push_sub_signature');

        // Only call /api/push/subscribe if the key differs from the last synced value
        if (lastSynced !== currentSignature) {
          try {
            const res = await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscription: subJson,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                location: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  timezone: location.timezone,
                  ianaTimezone: location.ianaTimezone,
                  name: location.name
                }
              })
            });

            if (res.ok) {
              localStorage.setItem('panchang_push_sub_signature', currentSignature);
            }
          } catch (err: unknown) {
            console.warn('Silent background subscription sync note:', err);
          }
        }
      })
      .catch(() => {});
  }, [location]);

  return {
    currentTime,
    panchang,
    tithiResolution,
    isPreSunrise,
    isLiveMode,
    isMounted,
    lastSyncTimestamp,
    forceSync
  };
}
