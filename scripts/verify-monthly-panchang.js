// Verification Script: Outputs Day-by-Day Tithi and End Time for New Delhi (28.61°N, 77.21°E, IST)
// Can be executed with: node scripts/verify-monthly-panchang.js

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function normalizeDeg(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function getJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

// VSOP87 Sun Apparent Longitude
function getSunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG2RAD;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
          + 0.000289 * Math.sin(3 * M);
  const trueLon = L0 + C;
  const omega = (125.04 - 1934.136 * T) * DEG2RAD;
  return normalizeDeg(trueLon - 0.00569 - 0.00478 * Math.sin(omega));
}

// ELP2000-82 Moon Apparent Longitude with 50+ periodic terms
function getMoonLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  
  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841.0 - T4 / 65194000.0);
  const D  = normalizeDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868.0 - T4 / 113065000.0);
  const M  = normalizeDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000.0);
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699.0 - T4 / 14712000.0);
  const F  = normalizeDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000.0 + T4 / 863310000.0);
  
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  
  const terms = [
    [0, 0, 1, 0, 6288774, 0], [2, 0, -1, 0, 1274027, 0], [2, 0, 0, 0, 658309, 0],
    [0, 0, 2, 0, 213618, 0], [0, 1, 0, 0, -185116, 1], [0, 0, 0, 2, -114332, 0],
    [2, 0, -2, 0, 58793, 0], [2, -1, -1, 0, 57066, 1], [2, 0, 1, 0, 53322, 0],
    [2, -1, 0, 0, 45758, 1], [0, 1, -1, 0, -40923, 1], [1, 0, 0, 0, -34720, 0],
    [0, 1, 1, 0, -30383, 1], [2, 0, 0, -2, 15327, 0], [0, 0, 1, 2, -12528, 0],
    [0, 0, 1, -2, 10980, 0], [4, 0, -1, 0, 10675, 0], [0, 0, 3, 0, 10034, 0],
    [4, 0, -2, 0, 8548, 0], [2, 1, -1, 0, -7888, 1], [2, 1, 0, 0, -6766, 1],
    [1, 0, -1, 0, -5163, 0], [1, 1, 0, 0, 4987, 1], [2, -1, 1, 0, 4036, 1],
    [2, 0, 2, 0, 3994, 0], [4, 0, 0, 0, 3861, 0], [2, 0, -3, 0, 3665, 0],
    [0, 1, -2, 0, -2689, 1], [2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 1],
    [1, 0, 1, 0, -2348, 0], [2, -2, 0, 0, 2236, 2], [0, 1, 2, 0, -2120, 1],
    [0, 2, 0, 0, -2069, 2], [2, -2, -1, 0, 2048, 2], [2, 0, 1, -2, -1773, 0],
    [2, 0, 0, 2, -1595, 0], [4, -1, -1, 0, 1215, 1], [0, 0, 2, 2, -1110, 0],
    [3, 0, -1, 0, -892, 0], [2, 1, 1, 0, -811, 1], [4, -1, -2, 0, 761, 1],
    [0, 2, -1, 0, 717, 2], [2, 2, -1, 0, -704, 2], [2, 1, -2, 0, 693, 1],
    [2, -1, 0, -2, 598, 1], [4, 0, 1, 0, 550, 0], [0, 0, 4, 0, 538, 0],
    [4, -1, 0, 0, 521, 1], [1, 0, -2, 0, 486, 0]
  ];
  
  let sumL = 0;
  for (const [d, m, mp, f, coeff, hasE] of terms) {
    const angle = (d * D + m * M + mp * Mp + f * F) * DEG2RAD;
    let c = coeff * 1e-6;
    if (hasE === 1) c *= E;
    else if (hasE === 2) c *= (E * E);
    sumL += c * Math.sin(angle);
  }
  
  const A1 = (119.75 + 131.849 * T) * DEG2RAD;
  const A2 = (53.09 + 479264.290 * T) * DEG2RAD;
  const A3 = (313.45 + 481266.484 * T) * DEG2RAD;
  sumL += 0.003964 * Math.sin(A1);
  sumL += 0.001964 * Math.sin(Lp * DEG2RAD - A3);
  sumL += 0.002060 * Math.sin(A2);
  
  const omega = (125.04452 - 1934.136261 * T) * DEG2RAD;
  sumL -= 0.00478 * Math.sin(omega);
  
  return normalizeDeg(Lp + sumL);
}

// Lahiri Ayanamsha
function getLahiriAyanamsha(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.8570928 + 1.39697128 * T + 0.0003088 * T * T;
}

function getElongationAngle(jd) {
  const sun = getSunLongitude(jd);
  const moon = getMoonLongitude(jd);
  return normalizeDeg(moon - sun);
}

// NOAA Solar Sunrise Calculation
function calculateSunrise(year, month, day, lat, lng, tz) {
  const baseUtcMs = Date.UTC(year, month, day, 12 - tz, 0, 0);
  const jd = baseUtcMs / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  
  const L0 = normalizeDeg(280.46646 + T * (36000.76983 + T * 0.0003032));
  const M = normalizeDeg(357.52911 + T * (35999.05029 - 0.0001537 * T));
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  
  const M_rad = M * DEG2RAD;
  const L0_rad = L0 * DEG2RAD;
  const C = Math.sin(M_rad) * (1.914602 - T * (0.004817 + 0.000014 * T))
          + Math.sin(2 * M_rad) * (0.019993 - 0.000101 * T)
          + Math.sin(3 * M_rad) * 0.000289;
  const trueLon = L0 + C;
  const omega = (125.04 - 1934.136 * T) * DEG2RAD;
  const lambda = trueLon - 0.00569 - 0.00478 * Math.sin(omega);
  const lambda_rad = lambda * DEG2RAD;
  
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = (eps0 + 0.00256 * Math.cos(omega)) * DEG2RAD;
  
  const sinDec = Math.sin(eps) * Math.sin(lambda_rad);
  const dec = Math.asin(sinDec);
  const cosDec = Math.cos(dec);
  
  const y = Math.tan(eps / 2) * Math.tan(eps / 2);
  const eot = 4 * RAD2DEG * (
    y * Math.sin(2 * L0_rad)
    - 2 * e * Math.sin(M_rad)
    + 4 * e * y * Math.sin(M_rad) * Math.cos(2 * L0_rad)
    - 0.5 * y * y * Math.sin(4 * L0_rad)
    - 1.25 * e * e * Math.sin(2 * M_rad)
  );
  
  const zenithRad = 90.8333 * DEG2RAD;
  const latRad = lat * DEG2RAD;
  const cosHA = (Math.cos(zenithRad) - Math.sin(latRad) * sinDec) / (Math.cos(latRad) * cosDec);
  const HA = Math.acos(Math.max(-1, Math.min(1, cosHA))) * RAD2DEG;
  
  const solarNoonMinutes = 720 - (4 * lng) + (tz * 60) - eot;
  const sunriseMinutes = solarNoonMinutes - HA * 4;
  const sunsetMinutes = solarNoonMinutes + HA * 4;
  
  const startOfDayLocalMs = Date.UTC(year, month, day, 0, 0, 0) - tz * 3600000;
  const sunriseDateUtc = new Date(startOfDayLocalMs + sunriseMinutes * 60000);
  
  return { sunriseMinutes, sunsetMinutes, sunriseDateUtc };
}

// Binary Search Root-Finding for Tithi End Time
function findTithiEndTime(sunriseUtcDate, tithiIndex, tz) {
  const targetDeg = (tithiIndex * 12) % 360;
  const tLow = sunriseUtcDate.getTime();
  const tHigh = tLow + 36 * 3600 * 1000;
  
  let bStart = tLow;
  let bEnd = tHigh;
  const stepMs = 10 * 60 * 1000;
  let prevAngle = getElongationAngle(tLow / 86400000 + 2440587.5);
  let found = false;
  
  for (let t = tLow + stepMs; t <= tHigh; t += stepMs) {
    const curAngle = getElongationAngle(t / 86400000 + 2440587.5);
    let crossed = false;
    if (targetDeg === 0) {
      if (prevAngle > 340 && curAngle < 20) crossed = true;
    } else {
      if (prevAngle < targetDeg && curAngle >= targetDeg) crossed = true;
    }
    if (crossed) {
      bStart = t - stepMs;
      bEnd = t;
      found = true;
      break;
    }
    prevAngle = curAngle;
  }
  
  if (!found) return null;
  
  for (let i = 0; i < 28; i++) {
    const mid = (bStart + bEnd) / 2;
    const midAngle = getElongationAngle(mid / 86400000 + 2440587.5);
    let diff = midAngle - targetDeg;
    if (targetDeg === 0 && diff > 180) diff -= 360;
    else if (targetDeg === 0 && diff < -180) diff += 360;
    
    if (diff < 0) bStart = mid;
    else bEnd = mid;
  }
  
  return new Date((bStart + bEnd) / 2);
}

const TITHI_NAMES = [
  'Shukla Pratipada (1)', 'Shukla Dwitiya (2)', 'Shukla Tritiya (3)', 'Shukla Chaturthi (4)',
  'Shukla Panchami (5)', 'Shukla Shashthi (6)', 'Shukla Saptami (7)', 'Shukla Ashtami (8)',
  'Shukla Navami (9)', 'Shukla Dashami (10)', 'Shukla Ekadashi (11)', 'Shukla Dwadashi (12)',
  'Shukla Trayodashi (13)', 'Shukla Chaturdashi (14)', 'Shukla Purnima (15)',
  'Krishna Pratipada (1)', 'Krishna Dwitiya (2)', 'Krishna Tritiya (3)', 'Krishna Chaturthi (4)',
  'Krishna Panchami (5)', 'Krishna Shashthi (6)', 'Krishna Saptami (7)', 'Krishna Ashtami (8)',
  'Krishna Navami (9)', 'Krishna Dashami (10)', 'Krishna Ekadashi (11)', 'Krishna Dwadashi (12)',
  'Krishna Trayodashi (13)', 'Krishna Chaturdashi (14)', 'Krishna Amavasya (30)'
];

function formatTime(mins) {
  let m = Math.floor(mins) % 1440;
  if (m < 0) m += 1440;
  const h = Math.floor(m / 60);
  const min = Math.floor(m % 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(h12)}:${pad(min)} ${period}`;
}

function formatUtcTime(date, tz) {
  const localMs = date.getTime() + tz * 3600000;
  const d = new Date(localMs);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(h12)}:${pad(m)} ${period}`;
}

// Verification for New Delhi (28.61°N, 77.21°E, IST +5:30)
const lat = 28.6139;
const lng = 77.2090;
const tz = 5.5;

const targetDate = new Date(); // Current date / month
const year = targetDate.getFullYear();
const month = targetDate.getMonth();
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysInMonth = new Date(year, month + 1, 0).getDate();

console.log(`================================================================================`);
console.log(`  HIGH-PRECISION VEDIC TITHI ALMANAC (DRIK PANCHANG VERIFICATION OUTPUT)`);
console.log(`  Location: New Delhi (28.61°N, 77.21°E) | Timezone: IST (UTC+5:30)`);
console.log(`  Month: ${monthNames[month]} ${year} | Zodiac: Nirayana (Lahiri Ayanamsha)`);
console.log(`  Determination: Udaya Tithi (Prevailing at Local Sunrise)`);
console.log(`================================================================================`);
console.log(`Date         | Sunrise (IST) | Prevailing Udaya Tithi     | Tithi End Time (IST)   | Marker`);
console.log(`-------------+---------------+----------------------------+------------------------+--------`);

for (let day = 1; day <= daysInMonth; day++) {
  const sun = calculateSunrise(year, month, day, lat, lng, tz);
  const sunriseJd = getJulianDay(sun.sunriseDateUtc);
  const angle = getElongationAngle(sunriseJd);
  const tIndex = Math.floor(angle / 12) + 1;
  const tName = TITHI_NAMES[tIndex - 1];
  
  const endUtc = findTithiEndTime(sun.sunriseDateUtc, tIndex, tz);
  let endStr = 'Full Day';
  if (endUtc) {
    const endLocalMs = endUtc.getTime() + tz * 3600000;
    const endDay = new Date(endLocalMs).getUTCDate();
    const timeStr = formatUtcTime(endUtc, tz);
    endStr = endDay === day ? timeStr : `Next day ${timeStr}`;
  }
  
  let marker = '';
  if (tIndex === 15) marker = '🌕 Purnima';
  else if (tIndex === 30) marker = '🌑 Amavasya';
  else if (tIndex === 11 || tIndex === 26) marker = '✨ Ekadashi';
  
  const dateStr = `${String(day).padStart(2, '0')} ${monthNames[month].slice(0, 3)} ${year}`;
  const sunriseStr = formatTime(sun.sunriseMinutes);
  
  console.log(`${dateStr}  | ${sunriseStr.padEnd(13)} | ${tName.padEnd(26)} | ${endStr.padEnd(22)} | ${marker}`);
}

console.log(`================================================================================\n`);
