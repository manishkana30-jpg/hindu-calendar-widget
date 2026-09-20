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
 * visibility/online listeners, and clock-drift mitigation.
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

  // Compute active panchang and tithi resolution
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

  // Dual Trigger System & Clock Drift Mitigation
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
      // Add 1000ms buffer to ensure local sunrise has fully elapsed
      sunriseTimerRef.current = setTimeout(() => {
        forceSync();
      }, delayToSunrise + 1000);
    }

    // Trigger 2: Upcoming Current Instantaneous Tithi Conclusion Timer
    if (tithiResolution.instantaneousTithi.endTime) {
      const tithiEndMs = new Date(tithiResolution.instantaneousTithi.endTime).getTime();
      const delayToTithiEnd = tithiEndMs - nowMs;

      if (delayToTithiEnd > 0 && delayToTithiEnd < 2147483647) {
        // Add 1000ms buffer after Tithi conclusion
        tithiTimerRef.current = setTimeout(() => {
          forceSync();
        }, delayToTithiEnd + 1000);
      }
    }

    // Trigger 3: Browser Visibility & Online Event Listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        forceSync();
      }
    };

    const handleOnline = () => {
      forceSync();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Trigger 4: Clock Drift Mitigation Heartbeat (every 10 seconds)
    // Detects OS sleep, background throttling, and laptop lid suspension without heavy polling
    heartbeatTimerRef.current = setInterval(() => {
      const currentHeartbeat = Date.now();
      const expectedElapsed = 10000;
      const actualElapsed = currentHeartbeat - lastHeartbeatTimeRef.current;
      lastHeartbeatTimeRef.current = currentHeartbeat;

      // If time drifted by more than 2500ms beyond interval (device slept / tab throttled)
      // or if milestone timestamps have just passed within this heartbeat window:
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
