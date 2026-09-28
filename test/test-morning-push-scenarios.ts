import { resolveDailyTithi } from '../src/lib/tithi-resolver';
import { PRESET_LOCATIONS } from '../src/lib/vedic-astronomy';
import {
  computeDailyMorningNotification,
  compute48HourForecast,
  formatTithiChangeAlert
} from '../src/lib/notifications/morning-push';

const delhi = PRESET_LOCATIONS[0];
for (let day = 1; day <= 30; day++) {
  const d = new Date(2026, 8, day, 6, 0, 0); // September 2026
  const res = resolveDailyTithi(d, delhi);
  if (res.udayaTithi.endTime) {
    const end = new Date(res.udayaTithi.endTime);
    const localHour = (end.getUTCHours() + 5 + Math.floor((end.getUTCMinutes() + 30) / 60)) % 24;
    const localMin = (end.getUTCMinutes() + 30) % 60;
    if (localHour >= 13 && localHour <= 15) {
      console.log(`FOUND 2 PM Transition: Sep ${day}, 2026 -> Udaya: ${res.udayaTithi.name}, End: ${localHour}:${String(localMin).padStart(2, '0')}, Next: ${res.instantaneousTithi.name}`);
    }
  }
}
for (let day = 1; day <= 31; day++) {
  const d = new Date(2026, 9, day, 6, 0, 0); // October 2026
  const res = resolveDailyTithi(d, delhi);
  if (res.udayaTithi.endTime) {
    const end = new Date(res.udayaTithi.endTime);
    const localHour = (end.getUTCHours() + 5 + Math.floor((end.getUTCMinutes() + 30) / 60)) % 24;
    const localMin = (end.getUTCMinutes() + 30) % 60;
    if (localHour >= 13 && localHour <= 15) {
      console.log(`FOUND 2 PM Transition: Oct ${day}, 2026 -> Udaya: ${res.udayaTithi.name}, End: ${localHour}:${String(localMin).padStart(2, '0')}, Next: ${res.instantaneousTithi.name}`);
    }
  }
}




console.log('\n--- Testing Kshaya Day (Aug 10, 2026) ---');
const kshayaDate = new Date('2026-08-10T06:00:00Z');
const kshayaPayload = computeDailyMorningNotification(kshayaDate, delhi);
console.log('Kshaya Body:\n' + kshayaPayload.body);
console.log('Segments:', kshayaPayload.segments.length);


console.log('\n--- Testing 48-Hour Forecast ---');
const forecast = compute48HourForecast(new Date(), delhi);
console.log('Generated at:', new Date(forecast.generatedAt).toISOString());
console.log('Day 1 Primary Tithi:', forecast.day1.data.primaryTithi);
console.log('Day 2 Primary Tithi:', forecast.day2.data.primaryTithi);
console.log('Timeline Transitions:', forecast.rawTimeline.tithiTransitions.length);

console.log('\n--- Testing Tithi Change Alert ---');
const alert = formatTithiChangeAlert({
  newTithiName: 'Shukla Dashami',
  transitionTime: new Date('2026-09-28T14:00:00+05:30'),
  timeZone: 'Asia/Kolkata'
});
console.log('Alert:', alert.body);

const lateAlert = formatTithiChangeAlert({
  newTithiName: 'Shukla Dashami',
  transitionTime: new Date('2026-09-28T14:00:00+05:30'),
  isDelayed: true,
  timeZone: 'Asia/Kolkata'
});
console.log('Late Alert:', lateAlert.body);
