// Dharmashastra Kala Vyapti & Astronomical Festival Determination Engine
// Based on Nirnayasindhu, Dharmasindhu, and Surya Siddhanta principles

import {
  LocationCoordinates,
  calculateSunTimes,
  getJulianDay,
  getElongationAngle,
  getSunLongitude,
  getLahiriAyanamsha,
  normalizeDeg,
  resolveTimezoneOffset,
  HINDU_MONTHS
} from './vedic-astronomy';

export type DiurnalKala = 'Pratah' | 'Sangava' | 'Madhyahna' | 'Aparahna' | 'Sayahna';
export type KalaType = 
  | DiurnalKala
  | 'Pradosha'
  | 'Nishita'
  | 'Arunodaya'
  | 'Udaya'
  | 'Ratri';

export interface KalaTimeSpan {
  kala: KalaType;
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface DayKalaSchedule {
  date: Date;
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  dayLengthMinutes: number;
  nightLengthMinutes: number;
  // 5 Dina Mana divisions
  pratah: KalaTimeSpan;
  sangava: KalaTimeSpan;
  madhyahna: KalaTimeSpan;
  aparahna: KalaTimeSpan;
  sayahna: KalaTimeSpan;
  // Specialized Canonical Kalas
  pradosha: KalaTimeSpan;
  nishita: KalaTimeSpan;
  arunodaya: KalaTimeSpan; // Pre-dawn period before today's sunrise (4 Ghatikas / 96 min proportionally)
  nextArunodaya: KalaTimeSpan; // Pre-dawn period before next sunrise
}

export type Sampradaya = 'smarta' | 'vaishnava';

export interface DharmashastraEngineOptions {
  sampradaya?: Sampradaya;
}

export interface TithiSpanAtDate {
  tithiIndex: number; // 1 to 30
  startUtc: Date;
  endUtc: Date;
}

export interface KalaVyaptiResult {
  tithiIndex: number;
  kala: KalaType;
  overlaps: boolean;
  overlapDurationMinutes: number;
  fractionOfKala: number; // 0 to 1
  isFullyContained: boolean;
}

export interface EkadashiInfo {
  name: string;
  hindiName: string;
  description: string;
}

export const EKADASHI_DATABASE: Record<number, { shukla: EkadashiInfo; krishna: EkadashiInfo }> = {
  0: { // Chaitra
    shukla: { name: 'Kamada Ekadashi', hindiName: 'कामदा एकादशी', description: 'Fulfiller of all pure desires & sins destroyer' },
    krishna: { name: 'Papmochani Ekadashi', hindiName: 'पापमोचिनी एकादशी', description: 'Absolver of karmic sins & inner cleanser' }
  },
  1: { // Vaishakha
    shukla: { name: 'Mohini Ekadashi', hindiName: 'मोहिनी एकादशी', description: 'Lord Vishnu Mohini avatar worship & illusion dissolver' },
    krishna: { name: 'Varuthini Ekadashi', hindiName: 'वरूथिनी एकादशी', description: 'Armor of spiritual protection & auspicious bliss' }
  },
  2: { // Jyeshtha
    shukla: { name: 'Nirjala Ekadashi', hindiName: 'निर्जला एकादशी', description: 'Supreme waterless fast equal to all 24 Ekadashis' },
    krishna: { name: 'Apara Ekadashi', hindiName: 'अपरा एकादशी', description: 'Bestower of boundless wealth & supreme fame' }
  },
  3: { // Ashadha
    shukla: { name: 'Devshayani Ekadashi', hindiName: 'देवशयनी एकादशी', description: 'Chaturmas begins & Lord Vishnu enters cosmic slumber' },
    krishna: { name: 'Yogini Ekadashi', hindiName: 'योगिनी एकादशी', description: 'Curer of ailments & liberator from curses' }
  },
  4: { // Shravana
    shukla: { name: 'Putrada Ekadashi (Shravana)', hindiName: 'श्रावण पुत्रदा एकादशी', description: 'Bestower of noble progeny & generational peace' },
    krishna: { name: 'Kamika Ekadashi', hindiName: 'कामिका एकादशी', description: 'Equal to performing Ashwamedha Yajna' }
  },
  5: { // Bhadrapada
    shukla: { name: 'Parsva / Parivartini Ekadashi', hindiName: 'परिवर्तिनी एकादशी', description: 'Lord Vishnu turns on His side in cosmic sleep' },
    krishna: { name: 'Aja Ekadashi', hindiName: 'अजा एकादशी', description: 'Raja Harishchandra penance & redemption' }
  },
  6: { // Ashwina
    shukla: { name: 'Papankusha Ekadashi', hindiName: 'पापांकुशा एकादशी', description: 'Restrains sinful tendencies like a divine goad' },
    krishna: { name: 'Indira Ekadashi', hindiName: 'इन्दिरा एकादशी', description: 'Elevates ancestors (Pitris) directly to Vaikuntha' }
  },
  7: { // Kartika
    shukla: { name: 'Prabodhini / Devutthana Ekadashi', hindiName: 'देवउठनी एकादशी', description: 'Lord Vishnu awakens & Chaturmas conclusion' },
    krishna: { name: 'Rama Ekadashi', hindiName: 'रमा एकादशी', description: 'Maha Lakshmi grace & eradication of dire distress' }
  },
  8: { // Margashirsha
    shukla: { name: 'Mokshada Ekadashi (Gita Jayanti)', hindiName: 'मोक्षदा एकादशी', description: 'Conferrer of supreme Moksha & Gita advent' },
    krishna: { name: 'Utpanna Ekadashi', hindiName: 'उत्पन्ना एकादशी', description: 'Advent of Ekadashi Devi from Lord Vishnu' }
  },
  9: { // Pausha
    shukla: { name: 'Pausha Putrada Ekadashi', hindiName: 'पौष पुत्रदा एकादशी', description: 'Blessings of virtuous lineage & prosperity' },
    krishna: { name: 'Saphala Ekadashi', hindiName: 'सफला एकादशी', description: 'Crowns all virtuous endeavors with fruitful success' }
  },
  10: { // Magha
    shukla: { name: 'Jaya Ekadashi', hindiName: 'जया एकादशी', description: 'Liberates souls from ghostly & lower realms' },
    krishna: { name: 'Shattila Ekadashi', hindiName: 'षट्तिला एकादशी', description: 'Sixfold sacred sesamum charity & inner purity' }
  },
  11: { // Phalguna
    shukla: { name: 'Amalaki Ekadashi', hindiName: 'आमलकी एकादशी', description: 'Veneration of sacred Amla tree & Lord Parashurama' },
    krishna: { name: 'Vijaya Ekadashi', hindiName: 'विजया एकादशी', description: 'Bestower of supreme triumph in complex obstacles' }
  }
};

export interface AstrometricDayCoordinates {
  date: Date;
  udayaTithiIndex: number; // 1 to 30
  amantaMonthIndex: number; // 0 to 11
  purnimantaMonthIndex: number; // 0 to 11
  amantaMonthName: string;
  purnimantaMonthName: string;
  isAdhika: boolean;
  suryaRashiIndex: number; // 0 to 11 (0=Mesha, 9=Makara)
  sunSiderealDeg: number;
  sunriseDate: Date;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

export function getAstrometricCoordinatesForDate(
  targetDate: Date,
  location: LocationCoordinates
): AstrometricDayCoordinates {
  const currentTz = resolveTimezoneOffset(targetDate, location);
  const sunTimes = calculateSunTimes(targetDate, location.latitude, location.longitude, currentTz);

  // Udaya Tithi at local Sunrise
  const sunriseJd = getJulianDay(sunTimes.sunriseDate);
  const sunriseElongation = getElongationAngle(sunriseJd);
  const udayaTithiIndex = Math.floor(sunriseElongation / 12) + 1; // 1 to 30

  // Solar sidereal longitude & Rashi
  const ayanamsha = getLahiriAyanamsha(sunriseJd);
  const sunSidereal = normalizeDeg(getSunLongitude(sunriseJd) - ayanamsha);
  const suryaRashiIndex = Math.floor(sunSidereal / 30);

  // Helper: High-precision Newton-Raphson solver for New Moon instant (Elongation = 0 deg)
  const solveNewMoon = (approxJd: number): number => {
    let jd = approxJd;
    for (let i = 0; i < 4; i++) {
      let el = getElongationAngle(jd);
      if (el > 180) el -= 360;
      jd -= el / 12.190749; // Mean synodic motion: ~12.190749 deg/day
    }
    return jd;
  };

  // Preceding New Moon: start at approximate lunar age
  const daysSincePrev = (sunriseElongation / 360) * 29.53059;
  const prevNmJd = solveNewMoon(sunriseJd - daysSincePrev);

  // Next New Moon: start at approximate remaining days in lunation
  const daysUntilNext = ((360 - sunriseElongation) / 360) * 29.53059;
  const nextNmJd = solveNewMoon(sunriseJd + daysUntilNext);

  const sLon1 = normalizeDeg(getSunLongitude(prevNmJd) - getLahiriAyanamsha(prevNmJd));
  const sLon2 = normalizeDeg(getSunLongitude(nextNmJd) - getLahiriAyanamsha(nextNmJd));
  const r1 = Math.floor(sLon1 / 30);
  const r2 = Math.floor(sLon2 / 30);
  const isAdhika = r1 === r2;

  // Canonical Masa name: derived from the solar ingress (Sankranti) occurring during this lunation.
  // When Sun enters Mesha (Rashi 0), the month is Chaitra (Index 0).
  // (Siddhanta Shiromani: "मेषादिस्थे सवितरि यो यो मासः प्रपूर्यते चान्द्रः। चैत्राद्यः स विज्ञेयः")
  const amantaMonthIndex = r2 % 12;
  const isKrishnaPaksha = sunriseElongation >= 180;
  const purnimantaMonthIndex = isKrishnaPaksha ? (amantaMonthIndex + 1) % 12 : amantaMonthIndex;

  const baseAmanta = HINDU_MONTHS[amantaMonthIndex].split(' ')[0];
  const basePurnimanta = HINDU_MONTHS[purnimantaMonthIndex].split(' ')[0];

  return {
    date: targetDate,
    udayaTithiIndex,
    amantaMonthIndex,
    purnimantaMonthIndex,
    amantaMonthName: baseAmanta,
    purnimantaMonthName: basePurnimanta,
    isAdhika,
    suryaRashiIndex,
    sunSiderealDeg: sunSidereal,
    sunriseDate: sunTimes.sunriseDate,
    dayOfWeek: targetDate.getDay()
  };
}

export interface VedicFestivalDefinitionRef {
  id: string;
  name: string;
  shortName: string;
  hindiName: string;
  description: string;
  icon: string;
  category: 'Major Festival' | 'Vrat' | 'Jayanti' | 'Ekadashi' | 'Pradosh' | 'Purnima' | 'Amavasya';
  isMajor: boolean;
  priority: number;
  tithiIndex?: number | number[];
  amantaMonthIndex?: number | number[];
  purnimantaMonthIndex?: number | number[];
  kalaRequirement?: KalaType;
  isSolar?: boolean;
  solarRashiIndex?: number;
  briefRule?: {
    hindi: string;
    english: string;
  };
  shastraReferences?: string[];
}

export interface ActiveFestivalResult {
  name: string;
  shortName: string;
  hindiName: string;
  description: string;
  icon: string;
  category: string;
  isMajor: boolean;
  badge?: string;
  briefRule?: {
    hindi: string;
    english: string;
  };
  shastraReferences?: string[];
}

/**
 * Calculates the exact Kala boundaries for a given civil date and geographic location.
 * Implements:
 * 1. Dina Mana (Daytime) 5-fold equal division:
 *    - Pratah: 1st 1/5th
 *    - Sangava: 2nd 1/5th
 *    - Madhyahna: 3rd 1/5th (Midday)
 *    - Aparahna: 4th 1/5th (Afternoon)
 *    - Sayahna: 5th 1/5th (Late afternoon / sunset approach)
 * 2. Pradosha: Post-sunset period (first 2 Muhurats = 2/15th of night ~ 72 to 144 minutes)
 * 3. Nishita: 8th Muhurat of the night (centered at true midnight)
 * 4. Arunodaya: 4 Ghatikas (2 Muhurats = 96 min proportionally) immediately prior to Sunrise
 */
export function calculateDailyKalas(
  targetDate: Date,
  location: LocationCoordinates
): DayKalaSchedule {
  const currentTz = resolveTimezoneOffset(targetDate, location);
  const sunToday = calculateSunTimes(targetDate, location.latitude, location.longitude, currentTz);

  // Next day's sunrise to compute exact night length and nocturnal Muhurats
  const nextDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
  const nextTz = resolveTimezoneOffset(nextDate, location);
  const sunTomorrow = calculateSunTimes(nextDate, location.latitude, location.longitude, nextTz);

  const sunrise = sunToday.sunriseDate;
  const sunset = sunToday.sunsetDate;
  const nextSunrise = sunTomorrow.sunriseDate;

  const dayDurationMs = sunset.getTime() - sunrise.getTime();
  const dayLengthMinutes = dayDurationMs / 60000;
  const fifthOfDayMs = dayDurationMs / 5;

  // 1. Five Diurnal Kalas (Dina Mana 5 parts)
  const pratahStart = new Date(sunrise.getTime());
  const pratahEnd = new Date(sunrise.getTime() + fifthOfDayMs);

  const sangavaStart = new Date(pratahEnd.getTime());
  const sangavaEnd = new Date(sunrise.getTime() + 2 * fifthOfDayMs);

  const madhyahnaStart = new Date(sangavaEnd.getTime());
  const madhyahnaEnd = new Date(sunrise.getTime() + 3 * fifthOfDayMs);

  const aparahnaStart = new Date(madhyahnaEnd.getTime());
  const aparahnaEnd = new Date(sunrise.getTime() + 4 * fifthOfDayMs);

  const sayahnaStart = new Date(aparahnaEnd.getTime());
  const sayahnaEnd = new Date(sunset.getTime());

  // 2. Nocturnal divisions
  const nightDurationMs = nextSunrise.getTime() - sunset.getTime();
  const nightLengthMinutes = nightDurationMs / 60000;
  const nightMuhuratMs = nightDurationMs / 15; // Each of the 15 night Muhurats

  // Pradosha: First 2 Muhurats (2/15th of night length) after sunset
  const pradoshaStart = new Date(sunset.getTime());
  const pradoshaEnd = new Date(sunset.getTime() + 2 * nightMuhuratMs);

  // Nishita: The 8th Muhurat of the night (out of 15 Muhurats), centered at midnight
  const nishitaStart = new Date(sunset.getTime() + 7 * nightMuhuratMs);
  const nishitaEnd = new Date(sunset.getTime() + 8 * nightMuhuratMs);

  // Arunodaya: 4 Ghatikas (2 Muhurats = 96 minutes proportionally) before Sunrise
  const prevDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() - 1);
  const prevTz = resolveTimezoneOffset(prevDate, location);
  const sunYesterday = calculateSunTimes(prevDate, location.latitude, location.longitude, prevTz);
  const prevNightDurationMs = sunrise.getTime() - sunYesterday.sunsetDate.getTime();
  const prevNightMuhuratMs = prevNightDurationMs / 15;

  const arunodayaTodayStart = new Date(sunrise.getTime() - 2 * prevNightMuhuratMs);
  const arunodayaTodayEnd = new Date(sunrise.getTime());

  // Tomorrow's sunrise Arunodaya
  const nextArunodayaStart = new Date(nextSunrise.getTime() - 2 * nightMuhuratMs);
  const nextArunodayaEnd = new Date(nextSunrise.getTime());

  const toSpan = (k: KalaType, s: Date, e: Date): KalaTimeSpan => ({
    kala: k,
    start: s,
    end: e,
    durationMinutes: (e.getTime() - s.getTime()) / 60000
  });

  return {
    date: targetDate,
    sunrise,
    sunset,
    nextSunrise,
    dayLengthMinutes,
    nightLengthMinutes,
    pratah: toSpan('Pratah', pratahStart, pratahEnd),
    sangava: toSpan('Sangava', sangavaStart, sangavaEnd),
    madhyahna: toSpan('Madhyahna', madhyahnaStart, madhyahnaEnd),
    aparahna: toSpan('Aparahna', aparahnaStart, aparahnaEnd),
    sayahna: toSpan('Sayahna', sayahnaStart, sayahnaEnd),
    pradosha: toSpan('Pradosha', pradoshaStart, pradoshaEnd),
    nishita: toSpan('Nishita', nishitaStart, nishitaEnd),
    arunodaya: toSpan('Arunodaya', arunodayaTodayStart, arunodayaTodayEnd),
    nextArunodaya: toSpan('Arunodaya', nextArunodayaStart, nextArunodayaEnd)
  };
}

/**
 * Returns the corresponding KalaTimeSpan from a DayKalaSchedule
 */
export function getKalaSpan(kalas: DayKalaSchedule, kalaType?: KalaType): KalaTimeSpan {
  switch (kalaType) {
    case 'Pratah': return kalas.pratah;
    case 'Sangava': return kalas.sangava;
    case 'Madhyahna': return kalas.madhyahna;
    case 'Aparahna': return kalas.aparahna;
    case 'Sayahna': return kalas.sayahna;
    case 'Pradosha': return kalas.pradosha;
    case 'Nishita': return kalas.nishita;
    case 'Arunodaya': return kalas.arunodaya;
    case 'Ratri': return {
      kala: 'Ratri',
      start: kalas.sunset,
      end: kalas.nextSunrise,
      durationMinutes: kalas.nightLengthMinutes
    };
    case 'Udaya':
    default:
      return {
        kala: 'Udaya',
        start: new Date(kalas.sunrise.getTime() - 15 * 60000),
        end: new Date(kalas.sunrise.getTime() + 15 * 60000),
        durationMinutes: 30
      };
  }
}

/**
 * Returns the exact Tithi index (1..30) active at a given moment in UTC.
 */
export function getTithiAtTimestamp(timeUtc: Date): number {
  const jd = getJulianDay(timeUtc);
  const elongation = getElongationAngle(jd);
  return Math.floor(elongation / 12) + 1;
}

/**
 * High-precision root finder for Tithi boundary (crossing targetDeg) in a given time window.
 */
export function findTithiTransition(
  startTime: Date,
  endTime: Date,
  targetTithi: number
): Date | null {
  const targetDeg = ((targetTithi - 1) * 12) % 360;
  const tLow = startTime.getTime();
  const tHigh = endTime.getTime();
  const stepMs = 5 * 60 * 1000;

  let prevAngle = getElongationAngle(getJulianDay(new Date(tLow)));
  let bStart = -1;
  let bEnd = -1;

  for (let t = tLow + stepMs; t <= tHigh; t += stepMs) {
    const curAngle = getElongationAngle(getJulianDay(new Date(t)));
    let crossed = false;
    if (targetDeg === 0) {
      if (prevAngle > 340 && curAngle < 20) crossed = true;
    } else {
      if (prevAngle < targetDeg && curAngle >= targetDeg) crossed = true;
    }

    if (crossed) {
      bStart = t - stepMs;
      bEnd = t;
      break;
    }
    prevAngle = curAngle;
  }

  if (bStart === -1) return null;

  for (let i = 0; i < 16; i++) {
    const mid = (bStart + bEnd) / 2;
    const midAngle = getElongationAngle(getJulianDay(new Date(mid)));
    let diff = midAngle - targetDeg;
    if (diff > 180) diff -= 360;
    else if (diff < -180) diff += 360;

    if (diff < 0) {
      bStart = mid;
    } else {
      bEnd = mid;
    }
  }

  return new Date((bStart + bEnd) / 2);
}

/**
 * Checks how much a specific Tithi overlaps with a given Kala interval [start, end].
 */
export function calculateKalaVyapti(
  targetTithi: number,
  kalaSpan: KalaTimeSpan
): KalaVyaptiResult {
  const startMs = kalaSpan.start.getTime();
  const endMs = kalaSpan.end.getTime();
  const totalDurationMin = Math.max(1, (endMs - startMs) / 60000);

  const sampleCount = 10;
  let activeMatches = 0;

  for (let i = 0; i <= sampleCount; i++) {
    const t = new Date(startMs + (i / sampleCount) * (endMs - startMs));
    const tithi = getTithiAtTimestamp(t);
    if (tithi === targetTithi) {
      activeMatches++;
    }
  }

  const fraction = activeMatches / (sampleCount + 1);
  const overlapMin = fraction * totalDurationMin;
  const overlaps = fraction > 0;
  const isFullyContained = fraction >= 0.95;

  return {
    tithiIndex: targetTithi,
    kala: kalaSpan.kala,
    overlaps,
    overlapDurationMinutes: Math.round(overlapMin),
    fractionOfKala: Number(fraction.toFixed(3)),
    isFullyContained
  };
}

/**
 * Tithi Vyapti evaluation across two successive days.
 * Implements Dharmashastra Yugma Vakya & Purvaviddha / Paraviddha rules:
 * - If only Day 1 has Vyapti with the required Kala -> Day 1
 * - If only Day 2 has Vyapti with the required Kala -> Day 2
 * - If both days have Vyapti:
 *    1. Day with significantly greater Kala coverage wins
 *    2. If equal / within 10%, apply Nirnayasindhu Yugma Vakya: pick the first day (Day 1).
 */
export function resolveFestivalDay(
  day1Kala: KalaTimeSpan,
  day2Kala: KalaTimeSpan,
  targetTithi: number
): { chosenDay: 1 | 2; vyaptiDay1: KalaVyaptiResult; vyaptiDay2: KalaVyaptiResult; reason: string } {
  const v1 = calculateKalaVyapti(targetTithi, day1Kala);
  const v2 = calculateKalaVyapti(targetTithi, day2Kala);

  if (v1.overlaps && !v2.overlaps) {
    return { chosenDay: 1, vyaptiDay1: v1, vyaptiDay2: v2, reason: `Exclusive Kala Vyapti on Day 1 (${v1.overlapDurationMinutes} min)` };
  }
  if (!v1.overlaps && v2.overlaps) {
    return { chosenDay: 2, vyaptiDay1: v1, vyaptiDay2: v2, reason: `Exclusive Kala Vyapti on Day 2 (${v2.overlapDurationMinutes} min)` };
  }
  if (v1.overlaps && v2.overlaps) {
    if (v1.fractionOfKala - v2.fractionOfKala > 0.1) {
      return { chosenDay: 1, vyaptiDay1: v1, vyaptiDay2: v2, reason: `Greater Kala Vyapti on Day 1 (${v1.overlapDurationMinutes}m vs ${v2.overlapDurationMinutes}m)` };
    }
    if (v2.fractionOfKala - v1.fractionOfKala > 0.1) {
      return { chosenDay: 2, vyaptiDay1: v1, vyaptiDay2: v2, reason: `Greater Kala Vyapti on Day 2 (${v2.overlapDurationMinutes}m vs ${v1.overlapDurationMinutes}m)` };
    }
    // Yugma Vakya tie-breaker: Pick Day 1
    return { chosenDay: 1, vyaptiDay1: v1, vyaptiDay2: v2, reason: `Both days have Kala Vyapti; resolved to Day 1 via Yugma Vakya / Purva precedence` };
  }

  return { chosenDay: 1, vyaptiDay1: v1, vyaptiDay2: v2, reason: `Defaulted to Day 1` };
}

/**
 * Vaishnava vs Smarta Ekadashi Evaluator:
 * In Vaishnava Dharmashastra (Hari Bhakti Vilasa, Padma Purana):
 * - If Dashami (Tithi 10 in Shukla, Tithi 25 in Krishna) touches the Arunodaya period (pre-dawn, approx. 96m before sunrise)
 *   of the Ekadashi day, the Ekadashi is termed "Dashami-Viddha" (contaminated by Dashami).
 * - A Dashami-Viddha Ekadashi is strictly avoided by Vaishnavas; the Vrat is observed on the following day (Dwadashi),
 *   termed "Maha-Dwadashi" or "Vaishnava Ekadashi".
 * - Smartas observe Shuddha Ekadashi on the sunrise day unless Dashami extends past Arunodaya.
 */
export function evaluateEkadashi(
  date: Date,
  location: LocationCoordinates,
  sampradaya: Sampradaya = 'smarta'
): {
  isEkadashiDay: boolean;
  isDashamiViddha: boolean;
  isVaishnavaPushed: boolean;
  activeTithiAtSunrise: number;
  reason: string;
} {
  const kalas = calculateDailyKalas(date, location);
  const sunriseTithi = getTithiAtTimestamp(kalas.sunrise);

  // Target Ekadashi indices: Shukla Ekadashi = 11, Krishna Ekadashi = 26
  const isCandidateToday = sunriseTithi === 11 || sunriseTithi === 26;

  // Check if yesterday was Dashami-Viddha pushed to today (Dwadashi)
  const prevDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  const prevKalas = calculateDailyKalas(prevDate, location);
  const prevSunriseTithi = getTithiAtTimestamp(prevKalas.sunrise);

  // Check Dashami in today's Arunodaya
  const arunodayaTithiStart = getTithiAtTimestamp(kalas.arunodaya.start);
  const arunodayaTithiEnd = getTithiAtTimestamp(kalas.arunodaya.end);
  const touchesDashamiToday = 
    (isCandidateToday && sunriseTithi === 11 && (arunodayaTithiStart === 10 || arunodayaTithiEnd === 10)) ||
    (isCandidateToday && sunriseTithi === 26 && (arunodayaTithiStart === 25 || arunodayaTithiEnd === 25));

  if (isCandidateToday) {
    if (touchesDashamiToday) {
      if (sampradaya === 'vaishnava') {
        return {
          isEkadashiDay: false,
          isDashamiViddha: true,
          isVaishnavaPushed: true,
          activeTithiAtSunrise: sunriseTithi,
          reason: 'Dashami touches Arunodaya (Dashami-Viddha); Vrat deferred to Dwadashi for Vaishnavas.'
        };
      } else {
        return {
          isEkadashiDay: true,
          isDashamiViddha: true,
          isVaishnavaPushed: false,
          activeTithiAtSunrise: sunriseTithi,
          reason: 'Dashami touches Arunodaya (Dashami-Viddha); observed today per Smarta tradition.'
        };
      }
    }

    return {
      isEkadashiDay: true,
      isDashamiViddha: false,
      isVaishnavaPushed: false,
      activeTithiAtSunrise: sunriseTithi,
      reason: 'Shuddha Ekadashi free from Dashami contamination.'
    };
  }

  // If today is Dwadashi (12 or 27) and yesterday was Dashami-Viddha, Vaishnavas fast today
  if (sunriseTithi === 12 || sunriseTithi === 27) {
    const prevArunodayaStart = getTithiAtTimestamp(prevKalas.arunodaya.start);
    const prevArunodayaEnd = getTithiAtTimestamp(prevKalas.arunodaya.end);
    const prevTouchedDashami =
      (prevSunriseTithi === 11 && (prevArunodayaStart === 10 || prevArunodayaEnd === 10)) ||
      (prevSunriseTithi === 26 && (prevArunodayaStart === 25 || prevArunodayaEnd === 25));

    if (prevTouchedDashami && sampradaya === 'vaishnava') {
      return {
        isEkadashiDay: true,
        isDashamiViddha: true,
        isVaishnavaPushed: true,
        activeTithiAtSunrise: sunriseTithi,
        reason: 'Vaishnava Ekadashi observed on Dwadashi due to previous day Dashami-Viddha.'
      };
    }
  }

  return {
    isEkadashiDay: false,
    isDashamiViddha: false,
    isVaishnavaPushed: false,
    activeTithiAtSunrise: sunriseTithi,
    reason: 'Not an Ekadashi fasting day.'
  };
}

/**
 * Principal Festival Determination Engine per Dharmashastra Kala Vyapti Rules.
 * 
 * Determines the canonical festival or Vrat for any given date by:
 * 1. Evaluating Solar Mahaparvas (e.g. Makar Sankranti ingress)
 * 2. Evaluating Kala Vyapti for major festivals (Janmashtami in Nishita, Diwali in Pradosha, Ram Navami in Madhyahna, etc.)
 * 3. Handling Tithi anomalies (Kshaya / Vriddhi) & two-day ties via Yugma Vakya
 * 4. Resolving Smarta vs. Vaishnava Ekadashis (Dashami-Viddha Arunodaya rules)
 * 5. Pradosha Vrat (Trayodashi in Pradosha Kala)
 * 6. Canonical Purnima / Amavasya / Chaturthi Vrats
 */
export function determineFestivalForDate(
  targetDate: Date,
  location: LocationCoordinates,
  options?: DharmashastraEngineOptions,
  festivalsList: VedicFestivalDefinitionRef[] = []
): ActiveFestivalResult {
  const coords = getAstrometricCoordinatesForDate(targetDate, location);
  const kalas = calculateDailyKalas(targetDate, location);
  const { udayaTithiIndex, amantaMonthIndex, purnimantaMonthIndex, suryaRashiIndex, isAdhika, dayOfWeek } = coords;

  // 1. Solar Festivals Check (e.g. Makar Sankranti)
  const isJanuaryMid = targetDate.getMonth() === 0 && (targetDate.getDate() === 14 || targetDate.getDate() === 15);
  if (suryaRashiIndex === 9 && (isJanuaryMid || (coords.sunSiderealDeg >= 269.8 && coords.sunSiderealDeg <= 271.5))) {
    const solFest = festivalsList.find(f => f.isSolar && f.solarRashiIndex === 9);
    if (solFest) {
      return {
        name: solFest.name,
        shortName: solFest.shortName,
        hindiName: solFest.hindiName,
        description: solFest.description,
        icon: solFest.icon,
        category: solFest.category,
        isMajor: true,
        badge: 'Solar Mahaparva',
        briefRule: solFest.briefRule,
        shastraReferences: solFest.shastraReferences
      };
    }
  }

  interface CandidateMatch {
    name: string;
    shortName: string;
    hindiName: string;
    description: string;
    icon: string;
    category: string;
    isMajor: boolean;
    priority: number;
    badge?: string;
    briefRule?: {
      hindi: string;
      english: string;
    };
    shastraReferences?: string[];
  }

  const candidates: CandidateMatch[] = [];

  // 2. Major Festivals Match via Kala Vyapti
  for (const fest of festivalsList) {
    if (fest.isSolar) continue;

    // Month Check
    let monthMatches = false;
    if (fest.amantaMonthIndex !== undefined) {
      const am = Array.isArray(fest.amantaMonthIndex) ? fest.amantaMonthIndex : [fest.amantaMonthIndex];
      if (am.includes(amantaMonthIndex)) monthMatches = true;
    }
    if (fest.purnimantaMonthIndex !== undefined) {
      const pm = Array.isArray(fest.purnimantaMonthIndex) ? fest.purnimantaMonthIndex : [fest.purnimantaMonthIndex];
      if (pm.includes(purnimantaMonthIndex)) monthMatches = true;
    }
    if (!monthMatches) continue;

    const targetTithis = Array.isArray(fest.tithiIndex)
      ? fest.tithiIndex
      : (fest.tithiIndex !== undefined ? [fest.tithiIndex] : []);

    if (targetTithis.length === 0) continue;

    // Kala Vyapti Evaluation
    if (fest.kalaRequirement && fest.kalaRequirement !== 'Udaya') {
      const reqKala = getKalaSpan(kalas, fest.kalaRequirement);
      let matchedTithi: number | null = null;
      let matchedVyapti: KalaVyaptiResult | null = null;

      for (const t of targetTithis) {
        const v = calculateKalaVyapti(t, reqKala);
        if (v.overlaps) {
          matchedTithi = t;
          matchedVyapti = v;
          break;
        }
      }

      if (matchedTithi !== null && matchedVyapti) {
        let isSelectedDay = true;

        // Two-Day Tie Breaking via Yugma Vakya:
        // Check if next day also overlaps with required Kala
        const nextDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
        const nextKalas = calculateDailyKalas(nextDate, location);
        const nextKalaSpan = getKalaSpan(nextKalas, fest.kalaRequirement);
        const nextVyapti = calculateKalaVyapti(matchedTithi, nextKalaSpan);

        if (nextVyapti.overlaps) {
          const res = resolveFestivalDay(reqKala, nextKalaSpan, matchedTithi);
          if (res.chosenDay === 2) {
            isSelectedDay = false; // Next day has superior Kala Vyapti
          }
        } else {
          // Check if previous day overlapped
          const prevDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() - 1);
          const prevKalas = calculateDailyKalas(prevDate, location);
          const prevKalaSpan = getKalaSpan(prevKalas, fest.kalaRequirement);
          const prevVyapti = calculateKalaVyapti(matchedTithi, prevKalaSpan);

          if (prevVyapti.overlaps) {
            const res = resolveFestivalDay(prevKalaSpan, reqKala, matchedTithi);
            if (res.chosenDay === 1) {
              isSelectedDay = false; // Previous day had superior Kala Vyapti
            }
          }
        }

        if (isSelectedDay) {
          candidates.push({
            name: fest.name,
            shortName: fest.shortName,
            hindiName: fest.hindiName,
            description: fest.description,
            icon: fest.icon,
            category: fest.category,
            isMajor: fest.isMajor,
            priority: fest.priority,
            badge: 'Major Festival',
            briefRule: fest.briefRule,
            shastraReferences: fest.shastraReferences
          });
        }
      }
    } else {
      // Udaya Tithi fallback for non-Kala festivals
      if (targetTithis.includes(udayaTithiIndex)) {
        candidates.push({
          name: fest.name,
          shortName: fest.shortName,
          hindiName: fest.hindiName,
          description: fest.description,
          icon: fest.icon,
          category: fest.category,
          isMajor: fest.isMajor,
          priority: fest.priority,
          badge: 'Major Festival',
          briefRule: fest.briefRule,
          shastraReferences: fest.shastraReferences
        });
      }
    }
  }

  // 3. Ekadashi Evaluation (Smarta vs Vaishnava configurable with Dashami-Viddha check)
  const ekadashiEval = evaluateEkadashi(targetDate, location, options?.sampradaya || 'smarta');
  if (ekadashiEval.isEkadashiDay) {
    const isShukla = udayaTithiIndex === 11 || (ekadashiEval.isVaishnavaPushed && udayaTithiIndex === 12);
    const targetMonthIdx = isShukla ? amantaMonthIndex : purnimantaMonthIndex;
    const monthData = EKADASHI_DATABASE[targetMonthIdx] || EKADASHI_DATABASE[0];
    const ekadashi = isShukla ? monthData.shukla : monthData.krishna;
    const ekadashiTitle = isAdhika
      ? (isShukla ? 'Padmini Ekadashi Vrat (पद्मिनी एकादशी)' : 'Parama Ekadashi Vrat (परमा एकादशी)')
      : `${ekadashi.name} (${ekadashi.hindiName})`;

    const badge = ekadashiEval.isVaishnavaPushed
      ? 'Vaishnava Ekadashi'
      : (ekadashiEval.isDashamiViddha ? 'Smarta Ekadashi' : 'Shuddha Ekadashi');

    const hindiRule = ekadashiEval.isVaishnavaPushed
      ? 'हरिभक्तिविलास: पूर्व दिन अरुणोदय काल में दशमी स्पर्श होने से दशमी-विद्धा एकादशी त्याज्य है; द्वादशी को महाद्वादशी व्रत का पालन करें।'
      : (ekadashiEval.isDashamiViddha
          ? 'निर्णयसिन्धु: अरुणोदय काल में दशमी का किञ्चित् स्पर्श होने पर भी स्मार्त परम्परा में औदयिक एकादशी के दिन ही व्रत मान्य है।'
          : 'निर्णयसिन्धु: दशमी-विद्धा एकादशी त्याज्य है; केवल शुद्ध सूर्योदय-व्यापिनी एकादशी ही उपवास हेतु ग्राह्य है तथा द्वादशी में पारणा करें।');

    const englishRule = ekadashiEval.isVaishnavaPushed
      ? 'Hari Bhakti Vilasa: Ekadashi touched by Dashami in Arunodaya is avoided by Vaishnavas; observed on Dwadashi.'
      : (ekadashiEval.isDashamiViddha
          ? 'Nirnayasindhu: Observed today under Smarta rules despite Dashami touch in pre-dawn Arunodaya.'
          : 'Nirnayasindhu: Only pure Sunrise-prevalent (Udaya-Vyapini) Ekadashi free from Dashami contamination is valid for fasting.');

    candidates.push({
      name: ekadashiTitle,
      shortName: isAdhika ? (isShukla ? 'Padmini Ekadashi' : 'Parama Ekadashi') : ekadashi.name,
      hindiName: isAdhika ? (isShukla ? 'पद्मिनी एकादशी' : 'परमा एकादशी') : ekadashi.hindiName,
      description: isAdhika ? 'Sacred Purushottama Adhika Masa Ekadashi' : ekadashi.description,
      icon: '🪷',
      category: 'Ekadashi',
      isMajor: true,
      priority: 92,
      badge,
      briefRule: {
        hindi: hindiRule,
        english: englishRule
      },
      shastraReferences: ['Padma Purana', 'Nirnayasindhu', 'Hari Bhakti Vilasa']
    });
  }

  // 4. Pradosha Vrat Detection (Shukla Trayodashi = 13, Krishna Trayodashi = 28 during Pradosha Kala)
  const pradoshaVyapti13 = calculateKalaVyapti(13, kalas.pradosha);
  const pradoshaVyapti28 = calculateKalaVyapti(28, kalas.pradosha);
  const isPradoshaActive = pradoshaVyapti13.overlaps || pradoshaVyapti28.overlaps || udayaTithiIndex === 13 || udayaTithiIndex === 28;

  if (isPradoshaActive && (udayaTithiIndex === 13 || udayaTithiIndex === 28 || pradoshaVyapti13.overlaps || pradoshaVyapti28.overlaps)) {
    const isShukla = pradoshaVyapti13.overlaps || udayaTithiIndex === 13;
    const weekdayNames = ['Ravi', 'Som', 'Bhauma', 'Budha', 'Guru', 'Shukra', 'Shani'];
    const weekdayHindi = ['रवि', 'सोम', 'भौम', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
    const prefix = weekdayNames[dayOfWeek] || '';
    const prefixH = weekdayHindi[dayOfWeek] || '';
    const pradoshName = `${prefix} Pradosh Vrat (${prefixH} प्रदोष व्रत)`;

    candidates.push({
      name: pradoshName,
      shortName: `${prefix} Pradosh`,
      hindiName: `${prefixH} प्रदोष व्रत`,
      description: `${isShukla ? 'Shukla' : 'Krishna'} Paksha twilight worship of Lord Shiva & Parvati`,
      icon: '🔱',
      category: 'Pradosh',
      isMajor: false,
      priority: 75,
      badge: 'Pradosh Vrat',
      briefRule: {
        hindi: 'धर्मसिन्धु: त्रयोदशी तिथि यदि सूर्यास्त के समय (प्रदोष काल) में विद्यमान हो तो वह प्रदोष व्रत हेतु सर्वश्रेष्ठ है।',
        english: 'Dharmasindhu: Pradosha Vrata is determined strictly by the presence of Trayodashi Tithi during sunset twilight.'
      },
      shastraReferences: ['Dharmasindhu', 'Skanda Purana']
    });
  }

  // 5. Purnima (15) & Amavasya (30)
  if (udayaTithiIndex === 15) {
    const monthName = HINDU_MONTHS[amantaMonthIndex].split(' ')[0];
    candidates.push({
      name: `${monthName} Purnima (पूर्णिमा व्रत)`,
      shortName: `${monthName} Purnima`,
      hindiName: `${monthName} पूर्णिमा`,
      description: 'Shri Satyanarayan Puja, sacred lunar snana & charity',
      icon: '🌕',
      category: 'Purnima',
      isMajor: false,
      priority: 70,
      badge: 'Purnima Snana',
      briefRule: {
        hindi: 'निर्णयसिन्धु: पूर्णिमा के दिन प्रातः तीर्थ स्नान, सत्यनारायण कथा एवं चन्द्रमा को अर्घ्य देने से समस्त पाप नष्ट होते हैं।',
        english: 'Nirnayasindhu: Holy morning river bath and Satyanarayan Puja on Purnima brings divine blessings and peace.'
      },
      shastraReferences: ['Nirnayasindhu', 'Skanda Purana']
    });
  }

  if (udayaTithiIndex === 30) {
    const monthName = HINDU_MONTHS[amantaMonthIndex].split(' ')[0];
    const isSomvati = dayOfWeek === 1;
    const title = isSomvati
      ? 'Somvati Amavasya (सोमवती अमावस्या)'
      : `${monthName} Amavasya (दर्श अमावस्या)`;

    candidates.push({
      name: title,
      shortName: isSomvati ? 'Somvati Amavasya' : `${monthName} Amavasya`,
      hindiName: isSomvati ? 'सोमवती अमावस्या' : `${monthName} अमावस्या`,
      description: isSomvati
        ? 'Supreme Monday New Moon, Ashwattha (Peepal) Pradakshina & Pitri Tarpana'
        : 'Pitri Tarpana, ancestral peace, charity & meditation',
      icon: '🌑',
      category: 'Amavasya',
      isMajor: isSomvati,
      priority: isSomvati ? 80 : 65,
      badge: isSomvati ? 'Somvati Mahaparva' : 'Pitri Tarpana',
      briefRule: {
        hindi: 'धर्मसिन्धु: अमावस्या के दिन पितरों के निमित्त तर्पण, श्राद्ध एवं दान करने से पितृदोष की शान्ति होती है।',
        english: 'Dharmasindhu: Offering water tarpana and charity to ancestors on Amavasya pleases the Pitris and removes hurdles.'
      },
      shastraReferences: ['Dharmasindhu', 'Garuda Purana']
    });
  }

  // 6. Vinayaka Chaturthi (4) & Sankashti Chaturthi (19)
  if (udayaTithiIndex === 4) {
    candidates.push({
      name: 'Vinayaka Chaturthi (विनायक चतुर्थी)',
      shortName: 'Vinayaka Chaturthi',
      hindiName: 'विनायक चतुर्थी',
      description: 'Lord Ganesha sacred fast, modak arpan & midday puja',
      icon: '🌺',
      category: 'Vrat',
      isMajor: false,
      priority: 60,
      badge: 'Ganesh Vrat',
      briefRule: {
        hindi: 'गणेश पुराण: शुक्ल पक्ष की चतुर्थी को मध्याह्न में भगवान विनायक की आराधना से समस्त कार्य निर्विघ्न सिद्ध होते हैं।',
        english: 'Ganesha Purana: Midday worship of Lord Vinayaka on Shukla Chaturthi removes obstacles from all undertakings.'
      },
      shastraReferences: ['Ganesha Purana', 'Dharmasindhu']
    });
  }

  if (udayaTithiIndex === 19) {
    candidates.push({
      name: 'Sankashti Chaturthi (संकष्टी चतुर्थी)',
      shortName: 'Sankashti Chaturthi',
      hindiName: 'संकष्टी चतुर्थी',
      description: 'Moonrise Ganesha arghya & crisis alleviation vow',
      icon: '🌙',
      category: 'Vrat',
      isMajor: false,
      priority: 60,
      badge: 'Ganesh Vrat',
      briefRule: {
        hindi: 'भविष्य पुराण: कृष्ण पक्ष की चतुर्थी को दिनभर उपवास रहकर चन्द्रोदय के समय चन्द्रमा व श्रीगणेश को अर्घ्य देकर पारण करें।',
        english: 'Bhavishya Purana: Fasting until moonrise and offering arghya to Chandra and Ganesha dispels severe distress.'
      },
      shastraReferences: ['Bhavishya Purana', 'Vratraj']
    });
  }

  // Return highest priority match
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.priority - a.priority);
    const best = candidates[0];
    return {
      name: best.name,
      shortName: best.shortName,
      hindiName: best.hindiName,
      description: best.description,
      icon: best.icon,
      category: best.category,
      isMajor: best.isMajor,
      badge: best.badge,
      briefRule: best.briefRule,
      shastraReferences: best.shastraReferences
    };
  }

  // 7. Default: Nitya Panchang
  return {
    name: 'Nitya Panchang (नित्य पञ्चाङ्ग)',
    shortName: 'Nitya Panchang',
    hindiName: 'नित्य पञ्चाङ्ग',
    description: 'Daily Sacred Vedic Observance',
    icon: '🕉️',
    category: 'Vrat',
    isMajor: false,
    badge: 'Daily Vedic',
    briefRule: {
      hindi: 'सूर्यसिद्धान्त: सूर्योदय के समय उपस्थित औदयिक तिथि ही उस सम्पूर्ण दिवस के धार्मिक व नित्य कर्मों हेतु मान्य होती है।',
      english: 'Surya Siddhanta: The Udaya Tithi prevailing at local Sunrise governs all religious observances and civil duties.'
    },
    shastraReferences: ['Surya Siddhanta', 'Nirnayasindhu']
  };
}
