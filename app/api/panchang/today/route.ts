import { NextRequest, NextResponse } from 'next/server';
import { calculatePanchang, PRESET_LOCATIONS, LocationCoordinates, TITHIS } from '@/src/lib/vedic-astronomy';
import { getFestivalForDate } from '@/src/lib/festivals';
import { getActivePanchakStatus } from '@/src/lib/dharmashastra-rules';
import { evaluateEkadashi } from '@/src/lib/dharmashastra-engine';
import { DailyPanchangCache } from '@/src/lib/notifications/idb-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const tzParam = searchParams.get('tz');

    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const location: LocationCoordinates = (latParam && lonParam)
      ? {
          name: 'Custom User Location',
          latitude: parseFloat(latParam),
          longitude: parseFloat(lonParam),
          timezone: tzParam ? parseFloat(tzParam) : 5.5,
          country: 'India',
          regionName: 'Custom Region'
        }
      : PRESET_LOCATIONS[0]; // New Delhi default baseline

    const panchang = calculatePanchang(targetDate, location);
    const festivalResult = getFestivalForDate(targetDate, location);
    const panchakResult = getActivePanchakStatus(targetDate);
    const ekadashiResult = evaluateEkadashi(targetDate, location);

    // Resolve Festival or Vrat name: Strictly major festivals & premier vrats (Ekadashi)
    // Minor daily vrats are omitted so that primary focus remains on Tithi
    let festivalOrVrat: string | null = null;
    if (festivalResult.isMajor || festivalResult.category === 'Major Festival') {
      festivalOrVrat = festivalResult.name;
    } else if (ekadashiResult.isEkadashiDay) {
      festivalOrVrat = festivalResult.category === 'Ekadashi' ? festivalResult.name : 'Ekadashi Vrat';
    }

    // Instantaneous Tithi and its end timestamp
    const instTithiIndex = panchang.instantaneousTithi?.index || panchang.tithi.index;
    const instTithiName = panchang.instantaneousTithi?.name || panchang.tithi.name;
    const instTithiEndTime = panchang.instantaneousTithi?.endTime || panchang.tithi.endTime;

    const nowMs = targetDate.getTime();
    let endTimestamp = panchang.instantaneousTithi?.endDate
      ? panchang.instantaneousTithi.endDate.getTime()
      : nowMs + 12 * 3600 * 1000;

    if (!panchang.instantaneousTithi?.endDate && panchang.instantaneousTithi?.completionPercent !== undefined) {
      const remainingPercent = Math.max(0, 100 - panchang.instantaneousTithi.completionPercent);
      const remainingMs = (remainingPercent / 100) * 84960000; // ~23.6 hours average tithi
      endTimestamp = nowMs + remainingMs;
    }

    const nextIndex = (instTithiIndex % 30) + 1;
    const nextTithiObj = TITHIS[(nextIndex - 1) % 30];

    // Day Window: current civil day 00:00 to 23:59:59
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Panchak Auspiciousness Filter:
    // Nirdosh Panchak (Wed/Thu) and Raja Panchak (Mon) are auspicious/benign per Dharmashastra
    // Inauspicious types: Roga (Sun), Agni (Tue), Chora (Fri), Mrityu (Sat)
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

    const cache: DailyPanchangCache = {
      dateStr: targetDate.toISOString().split('T')[0],
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

    return NextResponse.json(cache, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
        'Content-Type': 'application/json'
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown ephemeris lookup error';
    return NextResponse.json(
      { error: 'Failed to compute daily panchang snapshot', details: message },
      { status: 500 }
    );
  }
}
