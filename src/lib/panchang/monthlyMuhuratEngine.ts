/**
 * Monthly Day-wise Shubh Karya Muhurat Engine
 * Evaluates auspicious dates and precise auspicious time windows for key life events:
 * 1. House & Property Purchase (मकान / संपत्ति खरीद)
 * 2. Bhoomi Pujan / Building Construction (भूमि पूजन / गृह निर्माण)
 * 3. Griha Pravesh (गृह प्रवेश)
 * 4. Vehicle Purchase (वाहन खरीद)
 * 5. Business / Shop Opening (व्यापार प्रारम्भ)
 * 6. Gold, Jewelry & Asset Purchase (स्वर्ण / आभूषण खरीद)
 * 7. Vivah & Sanskar (विवाह व संस्कार)
 * 
 * Intersects active Vedic limbs with daytime Choghadiya & Abhijit Muhurat,
 * strictly subtracting Rahu Kaal and excluding Rikta Tithis and Bhadra Karana.
 */

import {
  LocationCoordinates,
  calculateSunTimes,
  getJulianDay,
  getElongationAngle,
  getLahiriAyanamsha,
  getMoonLongitude,
  getSunLongitude,
  normalizeDeg,
  resolveTimezoneOffset,
  TITHIS,
  NAKSHATRAS,
  YOGAS,
  KARANAS,
  DAY_CHOGHADIYA_ORDER,
  formatMinutesToTimeShort
} from '../vedic-astronomy';

export type ShubhKaryaCategory = 
  | 'all'
  | 'property'       // House & Property Purchase
  | 'construction'   // Bhoomi Pujan / Building Home
  | 'griha_pravesh'  // Housewarming
  | 'vehicle'        // Vehicle Purchase
  | 'business'       // Business / Shop Opening
  | 'gold'           // Gold & Valuables
  | 'marriage';      // Marriage & Sanskar

export interface AuspiciousActivity {
  category: ShubhKaryaCategory;
  name: string;
  hindiName: string;
  icon: string;
  colorClass: string;
}

export interface DayMuhuratItem {
  date: Date;
  dateKey: string;
  dayNumber: number;
  month: number;
  year: number;
  weekdayShort: string;
  weekdayLong: string;
  dayOfWeek: number;
  isToday: boolean;

  // Vedic Limbs
  tithiIndex: number;
  tithiName: string;
  tithiPureName: string;
  paksha: 'Shukla' | 'Krishna';
  tithiInPaksha: number;
  nakshatraIndex: number;
  nakshatraName: string;
  yogaName: string;
  karanaName: string;
  isRiktaTithi: boolean;
  isAmavasya: boolean;
  isBhadra: boolean;

  // Sun & Kaal Timings
  sunrise: string;
  sunset: string;
  rahuKaalString: string;
  abhijitString: string;

  // Special Siddhi Yogas
  specialYogas: string[];

  // Auspicious activities on this day
  auspiciousActivities: AuspiciousActivity[];
  isAuspiciousDay: boolean;

  // Computed Daytime Auspicious Windows (excluding Rahu Kaal)
  bestTimeWindowsString: string;
}

export interface TimeInterval {
  start: number; // minutes from midnight
  end: number;
}

/**
 * Merge overlapping or contiguous time intervals
 */
export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const result: TimeInterval[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = result[result.length - 1];

    if (current.start <= prev.end) {
      prev.end = Math.max(prev.end, current.end);
    } else {
      result.push(current);
    }
  }

  return result;
}

/**
 * Subtract an avoidance interval (e.g. Rahu Kaal) from a list of auspicious intervals
 */
export function subtractInterval(bases: TimeInterval[], avoid: TimeInterval): TimeInterval[] {
  const result: TimeInterval[] = [];

  for (const base of bases) {
    // Case 1: Avoid completely outside base
    if (avoid.end <= base.start || avoid.start >= base.end) {
      result.push({ ...base });
    }
    // Case 2: Avoid completely covers base
    else if (avoid.start <= base.start && avoid.end >= base.end) {
      // Base is completely wiped out
    }
    // Case 3: Avoid splits base into two
    else if (avoid.start > base.start && avoid.end < base.end) {
      result.push({ start: base.start, end: avoid.start });
      result.push({ start: avoid.end, end: base.end });
    }
    // Case 4: Avoid cuts the start
    else if (avoid.start <= base.start && avoid.end < base.end) {
      result.push({ start: avoid.end, end: base.end });
    }
    // Case 5: Avoid cuts the end
    else if (avoid.start > base.start && avoid.end >= base.end) {
      result.push({ start: base.start, end: avoid.start });
    }
  }

  // Filter out tiny slices (< 15 minutes)
  return result.filter(iv => iv.end - iv.start >= 15);
}

/**
 * Formats time intervals into readable strings e.g. "09:24 AM – 12:12 PM, 01:45 PM – 03:10 PM"
 */
export function formatTimeIntervals(intervals: TimeInterval[]): string {
  if (intervals.length === 0) return '—';
  return intervals
    .map(iv => `${formatMinutesToTimeShort(iv.start)} – ${formatMinutesToTimeShort(iv.end)}`)
    .join(', ');
}

// Canonical Activity Definitions
const ACTIVITIES_MAP: Record<Exclude<ShubhKaryaCategory, 'all'>, AuspiciousActivity> = {
  property: {
    category: 'property',
    name: 'House / Property Purchase',
    hindiName: 'मकान / संपत्ति खरीद',
    icon: '🏠',
    colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  construction: {
    category: 'construction',
    name: 'Bhoomi Pujan & Construction',
    hindiName: 'भूमि पूजन / गृह निर्माण',
    icon: '🏗️',
    colorClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  griha_pravesh: {
    category: 'griha_pravesh',
    name: 'Griha Pravesh',
    hindiName: 'गृह प्रवेश',
    icon: '🚪',
    colorClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
  },
  vehicle: {
    category: 'vehicle',
    name: 'Vehicle Purchase',
    hindiName: 'वाहन खरीद',
    icon: '🚗',
    colorClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  },
  business: {
    category: 'business',
    name: 'Business & Shop Opening',
    hindiName: 'व्यापार प्रारम्भ',
    icon: '💼',
    colorClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  },
  gold: {
    category: 'gold',
    name: 'Gold & Valuables',
    hindiName: 'स्वर्ण / आभूषण खरीद',
    icon: '🪙',
    colorClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
  },
  marriage: {
    category: 'marriage',
    name: 'Vivah & Sanskar',
    hindiName: 'विवाह व संस्कार',
    icon: '💍',
    colorClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  }
};

/**
 * Calculates auspicious Shubh Karya dates and exact timings for all days of a month
 */
export function calculateMonthlyMuhurat(
  year: number,
  month: number, // 1 to 12
  location: LocationCoordinates
): DayMuhuratItem[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const items: DayMuhuratItem[] = [];

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const targetDate = new Date(year, month - 1, d, 6, 0, 0);
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const weekdayShort = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    const weekdayLong = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    const isToday = year === todayYear && month === todayMonth && d === todayDay;

    // Timezone & Sun calculation
    const tz = resolveTimezoneOffset(targetDate, location);
    const sunTimes = calculateSunTimes(targetDate, location.latitude, location.longitude, tz);

    // 1. Udaya Tithi at local sunrise
    const sunriseJd = getJulianDay(sunTimes.sunriseDate);
    const sunriseElongation = getElongationAngle(sunriseJd);
    const udayaTithiIndex = Math.min(30, Math.max(1, Math.floor(sunriseElongation / 12) + 1));
    const tithiObj = TITHIS[(udayaTithiIndex - 1) % 30];
    const tithiInPaksha = ((udayaTithiIndex - 1) % 15) + 1;
    const isShukla = udayaTithiIndex <= 15;
    const paksha: 'Shukla' | 'Krishna' = isShukla ? 'Shukla' : 'Krishna';

    // Rikta Tithis: 4, 9, 14 of either paksha
    const isRiktaTithi = tithiInPaksha === 4 || tithiInPaksha === 9 || tithiInPaksha === 14;
    const isAmavasya = udayaTithiIndex === 30;

    // 2. Nakshatra at Sunrise
    const ayanamsha = getLahiriAyanamsha(sunriseJd);
    const moonTropical = getMoonLongitude(sunriseJd);
    const moonSidereal = normalizeDeg(moonTropical - ayanamsha);
    const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
    const nakshatraObj = NAKSHATRAS[nakshatraIndex % 27];
    const nakName = nakshatraObj.name;

    // 3. Yoga at Sunrise
    const sunTropical = getSunLongitude(sunriseJd);
    const sunSidereal = normalizeDeg(sunTropical - ayanamsha);
    const yogaSum = normalizeDeg(sunSidereal + moonSidereal);
    const yogaIndex = Math.floor(yogaSum / (360 / 27));
    const yogaObj = YOGAS[yogaIndex % 27];

    // 4. Karana at Sunrise (Bhadra / Vishti identification)
    const diff = normalizeDeg(moonTropical - sunTropical);
    const karanaIndex = Math.floor(diff / 6) + 1;
    let karanaObj;
    if (karanaIndex === 1) {
      karanaObj = KARANAS[10]; // Kimstughna
    } else if (karanaIndex >= 58) {
      if (karanaIndex === 58) karanaObj = KARANAS[7];      // Shakuni
      else if (karanaIndex === 59) karanaObj = KARANAS[8]; // Chatushpada
      else karanaObj = KARANAS[9];                         // Naga
    } else {
      const movableIndex = (karanaIndex - 2) % 7;
      karanaObj = KARANAS[movableIndex];
    }
    // Karana index 7 in the movable series (or Vishti) is Bhadra
    const isBhadra = karanaObj.name === 'Vishti';

    // 5. Rahu Kaal Window Calculation
    const partLength = sunTimes.dayLengthMinutes / 8;
    const rahuDayParts = [8, 2, 7, 5, 6, 4, 3];
    const rahuPart = rahuDayParts[dayOfWeek] - 1;
    const rahuStart = sunTimes.sunriseMinutes + rahuPart * partLength;
    const rahuEnd = rahuStart + partLength;
    const rahuKaalString = `${formatMinutesToTimeShort(rahuStart)} – ${formatMinutesToTimeShort(rahuEnd)}`;

    // 6. Abhijit Muhurat Calculation (centered at solar noon)
    const abhijitHalfWidth = sunTimes.dayLengthMinutes / 30;
    const abhijitStart = sunTimes.solarNoonMinutes - abhijitHalfWidth;
    const abhijitEnd = sunTimes.solarNoonMinutes + abhijitHalfWidth;
    const abhijitString = `${formatMinutesToTimeShort(abhijitStart)} – ${formatMinutesToTimeShort(abhijitEnd)}`;

    // 7. Special Siddhi Yogas
    const specialYogas: string[] = [];

    // Pushya Yogas
    if (nakName === 'Pushya') {
      if (dayOfWeek === 4) specialYogas.push('Guru Pushya Yoga');
      if (dayOfWeek === 0) specialYogas.push('Ravi Pushya Yoga');
    }

    // Sarvartha Siddhi Yoga
    const ssyMap: Record<number, string[]> = {
      0: ['Hasta', 'Mula', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Ashwini', 'Pushya'],
      1: ['Rohini', 'Mrigashira', 'Pushya', 'Anuradha', 'Shravana'],
      2: ['Ashwini', 'Krittika'],
      3: ['Rohini', 'Anuradha', 'Hasta', 'Krittika'],
      4: ['Punarvasu', 'Pushya', 'Anuradha', 'Ashwini', 'Revati'],
      5: ['Ashwini', 'Anuradha', 'Revati'],
      6: ['Rohini', 'Swati', 'Shravana'],
    };
    if (ssyMap[dayOfWeek]?.includes(nakName)) {
      specialYogas.push('Sarvartha Siddhi Yoga');
    }

    // Amrit Siddhi Yoga
    const asyMap: Record<number, string> = {
      0: 'Hasta',
      1: 'Mrigashira',
      2: 'Ashwini',
      3: 'Anuradha',
      4: 'Pushya',
      5: 'Revati',
      6: 'Rohini',
    };
    if (asyMap[dayOfWeek] === nakName) {
      specialYogas.push('Amrit Siddhi Yoga');
    }

    // 8. Life-Event Auspicious Activities Determination
    const auspiciousActivities: AuspiciousActivity[] = [];

    // A day must NOT be a Rikta Tithi, Amavasya, or Bhadra Karana to host auspicious works
    const isCleanVedicTithi = !isRiktaTithi && !isAmavasya && !isBhadra;

    if (isCleanVedicTithi) {
      // 1. House & Property Purchase
      // Thursday, Friday (and auspicious Mon/Wed) with Mrigashira, Ashlesha, Magha, Purva Phalguni, Vishakha, Anuradha, Mula, Revati
      const propertyNaks = ['Mrigashira', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Vishakha', 'Anuradha', 'Mula', 'Revati'];
      const propertyDays = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri
      if (propertyDays.includes(dayOfWeek) && propertyNaks.includes(nakName) && tithiInPaksha !== 1) {
        auspiciousActivities.push(ACTIVITIES_MAP.property);
      }

      // 2. Bhoomi Pujan / Building Construction
      // Fixed & Gentle Nakshatras on Shukla 2, 3, 5, 6, 7, 10, 11, 12, 13 on Mon/Wed/Thu/Fri/Sat
      const constructionNaks = ['Rohini', 'Mrigashira', 'Uttara Phalguni', 'Chitra', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'];
      const constructionTithis = [2, 3, 5, 6, 7, 10, 11, 12, 13];
      const constructionDays = [1, 3, 4, 5, 6]; // Mon, Wed, Thu, Fri, Sat
      if (isShukla && constructionTithis.includes(tithiInPaksha) && constructionDays.includes(dayOfWeek) && constructionNaks.includes(nakName)) {
        auspiciousActivities.push(ACTIVITIES_MAP.construction);
      }

      // 3. Griha Pravesh (Housewarming)
      // Rohini, Mrigashira, Uttara Phalguni, Chitra, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati
      // on auspicious Tithis (Shukla 2,3,5,7,10,11,12,13 or Krishna 2,3,5) excluding Tue (2) & Sun (0)
      const gpNaks = ['Rohini', 'Mrigashira', 'Uttara Phalguni', 'Chitra', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'];
      const gpDays = [1, 3, 4, 5, 6]; // Mon, Wed, Thu, Fri, Sat
      const isGpTithi = isShukla ? [2, 3, 5, 7, 10, 11, 12, 13].includes(tithiInPaksha) : [2, 3, 5].includes(tithiInPaksha);
      if (gpDays.includes(dayOfWeek) && isGpTithi && gpNaks.includes(nakName)) {
        auspiciousActivities.push(ACTIVITIES_MAP.griha_pravesh);
      }

      // 4. Vehicle Purchase
      // Moveable & Quick Nakshatras on Mon/Wed/Thu/Fri/Sun (avoid Tue & Sat)
      const vehicleNaks = ['Ashwini', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Revati'];
      const vehicleDays = [0, 1, 3, 4, 5]; // Sun, Mon, Wed, Thu, Fri
      if (vehicleDays.includes(dayOfWeek) && vehicleNaks.includes(nakName) && tithiInPaksha !== 1) {
        auspiciousActivities.push(ACTIVITIES_MAP.vehicle);
      }

      // 5. Business / Shop Opening
      // Mon, Wed, Thu, Fri on Tithis 2, 3, 5, 7, 10, 11, 12, 13
      const businessNaks = ['Ashwini', 'Rohini', 'Mrigashira', 'Pushya', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'];
      const businessDays = [1, 3, 4, 5];
      const businessTithis = [2, 3, 5, 7, 10, 11, 12, 13];
      if (businessDays.includes(dayOfWeek) && businessTithis.includes(tithiInPaksha) && businessNaks.includes(nakName)) {
        auspiciousActivities.push(ACTIVITIES_MAP.business);
      }

      // 6. Gold, Jewelry & Asset Purchase
      // Days featuring Pushya, Ashwini, Rohini, Chitra, Swati, Shravana, Revati or Special Siddhi Yogas
      const goldNaks = ['Pushya', 'Ashwini', 'Rohini', 'Chitra', 'Swati', 'Shravana', 'Revati'];
      const goldDays = [0, 1, 3, 4, 5];
      if ((goldDays.includes(dayOfWeek) && goldNaks.includes(nakName)) || specialYogas.length > 0) {
        auspiciousActivities.push(ACTIVITIES_MAP.gold);
      }

      // 7. Marriage & Sanskar
      // Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Mula, Uttara Ashadha, Uttara Bhadrapada, Revati
      const marriageNaks = ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'];
      const marriageDays = [1, 3, 4, 5];
      const marriageTithis = [2, 3, 5, 7, 10, 11, 12, 13];
      if (marriageDays.includes(dayOfWeek) && marriageTithis.includes(tithiInPaksha) && marriageNaks.includes(nakName)) {
        auspiciousActivities.push(ACTIVITIES_MAP.marriage);
      }
    }

    const isAuspiciousDay = auspiciousActivities.length > 0;

    // 9. Exact Auspicious Daytime Window Calculation
    // Union of Auspicious Daytime Choghadiyas (Amrit, Shubh, Labh) + Abhijit Muhurat
    // Minus Rahu Kaal window
    let bestTimeWindowsString = '—';

    if (isAuspiciousDay) {
      const rawIntervals: TimeInterval[] = [];

      // Day Choghadiya slots
      const dayChoghadiyaList = DAY_CHOGHADIYA_ORDER[dayOfWeek];
      for (let i = 0; i < 8; i++) {
        const cKey = dayChoghadiyaList[i];
        if (cKey === 'Amrit' || cKey === 'Shubh' || cKey === 'Labh') {
          const sMin = sunTimes.sunriseMinutes + i * partLength;
          const eMin = sMin + partLength;
          rawIntervals.push({ start: sMin, end: eMin });
        }
      }

      // Abhijit Muhurat (unless Wednesday, when Abhijit is traditionally avoided)
      if (dayOfWeek !== 3) {
        rawIntervals.push({ start: abhijitStart, end: abhijitEnd });
      }

      // Merge overlapping intervals
      const merged = mergeIntervals(rawIntervals);

      // Subtract Rahu Kaal
      const cleanWindows = subtractInterval(merged, { start: rahuStart, end: rahuEnd });

      bestTimeWindowsString = formatTimeIntervals(cleanWindows);
    }

    items.push({
      date: targetDate,
      dateKey,
      dayNumber: d,
      month,
      year,
      weekdayShort,
      weekdayLong,
      dayOfWeek,
      isToday,

      tithiIndex: udayaTithiIndex,
      tithiName: tithiObj.name,
      tithiPureName: tithiObj.pureName,
      paksha,
      tithiInPaksha,
      nakshatraIndex,
      nakshatraName: nakName,
      yogaName: yogaObj.name,
      karanaName: karanaObj.name,
      isRiktaTithi,
      isAmavasya,
      isBhadra,

      sunrise: formatMinutesToTimeShort(sunTimes.sunriseMinutes),
      sunset: formatMinutesToTimeShort(sunTimes.sunsetMinutes),
      rahuKaalString,
      abhijitString,

      specialYogas,
      auspiciousActivities,
      isAuspiciousDay,
      bestTimeWindowsString
    });
  }

  return items;
}

/**
 * Calculate Shubh Karya Muhurat details for a single target date
 */
export function calculateDayMuhurat(date: Date, location: LocationCoordinates): DayMuhuratItem {
  const monthItems = calculateMonthlyMuhurat(date.getFullYear(), date.getMonth() + 1, location);
  const found = monthItems.find(m => m.dayNumber === date.getDate());
  if (found) return found;
  return monthItems[0];
}

/**
 * Scan forward from a given date to find the next upcoming auspicious day
 */
export function findNextAuspiciousMuhurat(fromDate: Date, location: LocationCoordinates): DayMuhuratItem | null {
  const year = fromDate.getFullYear();
  const month = fromDate.getMonth() + 1;
  const currentMonthItems = calculateMonthlyMuhurat(year, month, location);

  // Search remaining days of the current month
  for (const item of currentMonthItems) {
    if (item.dayNumber > fromDate.getDate() && item.isAuspiciousDay) {
      return item;
    }
  }

  // If not found in current month, scan the next month
  const nextMonthYear = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const nextMonthItems = calculateMonthlyMuhurat(nextMonthYear.year, nextMonthYear.month, location);
  for (const item of nextMonthItems) {
    if (item.isAuspiciousDay) {
      return item;
    }
  }

  // Scan one more month if needed
  const thirdMonthYear = nextMonthYear.month === 12 ? { year: nextMonthYear.year + 1, month: 1 } : { year: nextMonthYear.year, month: nextMonthYear.month + 1 };
  const thirdMonthItems = calculateMonthlyMuhurat(thirdMonthYear.year, thirdMonthYear.month, location);
  for (const item of thirdMonthItems) {
    if (item.isAuspiciousDay) {
      return item;
    }
  }

  return null;
}
