"use client";

import { useEffect } from 'react';
import {
  initClientNotificationScheduler,
  seedServiceWorkerCacheFromClient
} from '@/src/lib/notifications/subscription-manager';
import { calculatePanchang, PRESET_LOCATIONS, TITHIS } from '@/src/lib/vedic-astronomy';
import { getFestivalForDate } from '@/src/lib/festivals';
import { getActivePanchakStatus } from '@/src/lib/dharmashastra-rules';
import { evaluateEkadashi } from '@/src/lib/dharmashastra-engine';
import { DailyPanchangCache } from '@/src/lib/notifications/idb-storage';

export function ClientNotificationScheduler() {
  useEffect(() => {
    // 1. Register Service Worker and initialize background notification scheduler
    const cleanupScheduler = initClientNotificationScheduler();

    // 2. Pre-seed Service Worker IndexedDB with today's ephemeris data
    // Zero network calls needed because calculations are executed directly on the client!
    const seedCache = async () => {
      try {
        const now = new Date();
        const location = PRESET_LOCATIONS[0];
        const panchang = calculatePanchang(now, location);
        const festivalResult = getFestivalForDate(now, location);
        const panchakResult = getActivePanchakStatus(now);
        const ekadashiResult = evaluateEkadashi(now, location);

        // Resolve Festival & Vrat: Strictly major festivals and Ekadashi vrats
        let festivalOrVrat: string | null = null;
        if (festivalResult.isMajor || festivalResult.category === 'Major Festival') {
          festivalOrVrat = festivalResult.name;
        } else if (ekadashiResult.isEkadashiDay) {
          festivalOrVrat = festivalResult.category === 'Ekadashi' ? festivalResult.name : 'Ekadashi Vrat';
        }

        const instTithiIndex = panchang.instantaneousTithi?.index || panchang.tithi.index;
        const instTithiName = panchang.instantaneousTithi?.name || panchang.tithi.name;
        const instTithiEndTime = panchang.instantaneousTithi?.endTime || panchang.tithi.endTime;
        const nextIndex = (instTithiIndex % 30) + 1;
        const nextTithiObj = TITHIS[(nextIndex - 1) % 30];

        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(now);
        dayEnd.setHours(23, 59, 59, 999);

        // Panchak Auspiciousness Filter: Nirdosh & Raj are auspicious
        const rawPanchakType = panchakResult.panchak?.type || '';
        const typeLower = rawPanchakType.toLowerCase();
        const isAuspiciousPanchak = 
          typeLower.includes('nirdosh') ||
          typeLower.includes('raja') ||
          typeLower.includes('raj ') ||
          typeLower === 'raj panchak' ||
          panchakResult.panchak?.auspiciousness === 'Auspicious';

        const isInauspicious = panchakResult.isActive && !isAuspiciousPanchak;
        const statusText = panchakResult.isActive
          ? (isInauspicious
              ? `${rawPanchakType || 'Panchak'} (Inauspicious)`
              : `${rawPanchakType || 'Panchak'} (Auspicious)`)
          : 'No Active Panchak';

        const nowMs = now.getTime();
        const endTimestamp = panchang.instantaneousTithi?.endDate
          ? panchang.instantaneousTithi.endDate.getTime()
          : nowMs + 12 * 3600 * 1000;

        const cache: DailyPanchangCache = {
          dateStr: now.toISOString().split('T')[0],
          dayWindowStart: dayStart.getTime(),
          dayWindowEnd: dayEnd.getTime(),
          instantaneousTithi: {
            index: instTithiIndex,
            name: instTithiName,
            endTimestamp,
            endTimeFormatted: instTithiEndTime
          },
          nextTithi: {
            index: nextIndex,
            name: nextTithiObj.name
          },
          panchak: {
            isActive: panchakResult.isActive,
            isInauspicious,
            type: panchakResult.panchak?.type,
            statusText,
            startTimestamp: panchakResult.panchak?.startTimestamp,
            endTimestamp: panchakResult.panchak?.endTimestamp
          },
          festivalOrVrat,
          cachedAt: Date.now()
        };

        await seedServiceWorkerCacheFromClient(cache);
      } catch (err) {
        console.warn('Initial cache seeding warning:', err);
      }
    };

    seedCache();

    return () => {
      cleanupScheduler();
    };
  }, []);

  return null;
}
