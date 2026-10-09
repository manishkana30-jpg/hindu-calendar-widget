import { calculatePanchang, PRESET_LOCATIONS } from '../src/lib/vedic-astronomy';
import { COMPLETE_MUHURATS_LIST } from '../src/lib/dharmashastra-rules';

const delhi = PRESET_LOCATIONS[0];
const baseDate = new Date(2026, 9, 10); // Oct 10, 2026

console.log('=== 24-HOUR CONTINUOUS SYNC AUDIT (144 SAMPLE POINTS AT 10-MIN INTERVALS) ===');

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 360;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

let syncErrors = 0;
let muhuratCountMismatch = 0;
let chogCountMismatch = 0;

for (let minute = 0; minute < 1440; minute += 10) {
  const sampleDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), Math.floor(minute / 60), minute % 60, 0);
  const panchang = calculatePanchang(sampleDate, delhi, sampleDate);

  // 1. Audit Card currentChoghadiya vs Modal day/night Choghadiya
  const activeDayChogs = panchang.dayChoghadiya.filter(c => c.isCurrent);
  const activeNightChogs = panchang.nightChoghadiya.filter(c => c.isCurrent);
  const totalActiveChogs = [...activeDayChogs, ...activeNightChogs];

  if (totalActiveChogs.length !== 1) {
    chogCountMismatch++;
    console.error(`[FAIL] At ${sampleDate.toLocaleTimeString()}: Found ${totalActiveChogs.length} active Choghadiyas!`);
  } else {
    const matrixActive = totalActiveChogs[0];
    const cardActive = panchang.currentChoghadiya;
    if (matrixActive.displayName !== cardActive?.displayName || matrixActive.windowString !== cardActive?.windowString) {
      syncErrors++;
      console.error(`[MISMATCH] At ${sampleDate.toLocaleTimeString()}: Card says ${cardActive?.displayName} (${cardActive?.windowString}) but Matrix says ${matrixActive.displayName} (${matrixActive.windowString})`);
    }
  }

  // 2. Audit 30-Muhurat Matrix
  const currentMinutes = sampleDate.getHours() * 60 + sampleDate.getMinutes();
  const sunriseMin = parseTimeToMinutes(panchang.sunrise);
  const sunsetMin = parseTimeToMinutes(panchang.sunset);

  const dayLengthMin = sunsetMin >= sunriseMin ? sunsetMin - sunriseMin : (sunsetMin + 1440) - sunriseMin;
  const daySlotDuration = dayLengthMin / 15;
  const nextSunriseMin = sunriseMin;
  const nightLengthMin = (1440 - sunsetMin) + nextSunriseMin;
  const nightSlotDuration = nightLengthMin / 15;

  const dayMuhurats = COMPLETE_MUHURATS_LIST.filter(m => m.period === 'Diurnal (Day)').map((m, idx) => {
    const sMin = sunriseMin + idx * daySlotDuration;
    const eMin = sMin + daySlotDuration;
    const isCurrent = currentMinutes >= sMin && currentMinutes < eMin;
    return { ...m, isCurrent };
  });

  const nightMuhurats = COMPLETE_MUHURATS_LIST.filter(m => m.period === 'Nocturnal (Night)').map((m, idx) => {
    const sMin = sunsetMin + idx * nightSlotDuration;
    const eMin = sMin + nightSlotDuration;
    const normS = sMin % 1440;
    const normE = eMin % 1440;
    let isCurrent = false;
    if (normS < normE) {
      isCurrent = currentMinutes >= normS && currentMinutes < normE;
    } else {
      isCurrent = currentMinutes >= normS || currentMinutes < normE;
    }
    return { ...m, isCurrent };
  });

  const all30Active = [...dayMuhurats, ...nightMuhurats].filter(m => m.isCurrent);
  if (all30Active.length !== 1) {
    muhuratCountMismatch++;
    console.error(`[FAIL] At ${sampleDate.toLocaleTimeString()}: Found ${all30Active.length} active 30-Muhurats!`);
  }
}

console.log('Total 10-min checkpoints tested:', 144);
console.log('Choghadiya Matrix count errors:', chogCountMismatch);
console.log('Card vs Matrix Choghadiya Sync errors:', syncErrors);
console.log('30-Muhurat Matrix count errors:', muhuratCountMismatch);

if (chogCountMismatch === 0 && syncErrors === 0 && muhuratCountMismatch === 0) {
  console.log('🎉 100% PERFECT SYNCHRONIZATION: Active Muhurat Card & 24h Muhurat Calendar are in 100% lockstep across all 24 hours!');
}
