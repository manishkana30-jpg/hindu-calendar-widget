// High-Precision Vedic Astronomy and Panchang Calculation Engine
// Built with Jean Meeus (VSOP87 / ELP2000-82) astronomical series and Lahiri (Chitra Paksha) Nirayana Ayanamsha

import { getFestivalForDate, findUpcomingMajorFestival } from './festivals';

export interface LocationCoordinates {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours (fallback)
  regionName: string;
  ianaTimezone?: string; // IANA timezone identifier for DST-aware resolution
}

// Resolve the actual UTC offset for a given date, respecting DST transitions.
// Falls back to the static `timezone` field if IANA zone is not available.
export function resolveTimezoneOffset(date: Date, location: LocationCoordinates): number {
  if (!location.ianaTimezone) return location.timezone;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: location.ianaTimezone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart) {
      const val = tzPart.value;
      if (val === 'GMT' || val === 'UTC') return 0;
      const match = val.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        const hours = parseInt(match[2], 10);
        const minutes = match[3] ? parseInt(match[3], 10) : 0;
        return sign * (hours + minutes / 60);
      }
    }
  } catch {
    // Intl error or invalid timezone string
  }
  return location.timezone;
}

export const PRESET_LOCATIONS: LocationCoordinates[] = [
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'Varanasi (Kashi)', country: 'India', latitude: 25.3176, longitude: 82.9739, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'Ayodhya', country: 'India', latitude: 26.7922, longitude: 82.1998, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'Ujjain', country: 'India', latitude: 23.1765, longitude: 75.7885, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'Haridwar', country: 'India', latitude: 29.9457, longitude: 78.1642, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 5.5, regionName: 'Calcutta', ianaTimezone: 'Asia/Kolkata' },
  { name: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278, timezone: 0.0, regionName: 'London', ianaTimezone: 'Europe/London' },
  { name: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.0060, timezone: -5.0, regionName: 'New York', ianaTimezone: 'America/New_York' },
  { name: 'San Francisco', country: 'USA', latitude: 37.7749, longitude: -122.4194, timezone: -8.0, regionName: 'Los Angeles', ianaTimezone: 'America/Los_Angeles' },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, timezone: 4.0, regionName: 'Dubai', ianaTimezone: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 8.0, regionName: 'Singapore', ianaTimezone: 'Asia/Singapore' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 10.0, regionName: 'Sydney', ianaTimezone: 'Australia/Sydney' },
];

export const NAKSHATRAS = [
  { name: 'Ashwini', devanagari: 'अश्विनी', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse Head' },
  { name: 'Bharani', devanagari: 'भरणी', lord: 'Venus', deity: 'Yama', symbol: 'Yoni' },
  { name: 'Krittika', devanagari: 'कृत्तिका', lord: 'Sun', deity: 'Agni', symbol: 'Razor/Flame' },
  { name: 'Rohini', devanagari: 'रोहिणी', lord: 'Moon', deity: 'Brahma', symbol: 'Cart/Chariot' },
  { name: 'Mrigashirsha', devanagari: 'मृगशिरा', lord: 'Mars', deity: 'Soma', symbol: 'Deer Head' },
  { name: 'Ardra', devanagari: 'आर्द्रा', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop' },
  { name: 'Punarvasu', devanagari: 'पुनर्वसु', lord: 'Jupiter', deity: 'Aditi', symbol: 'Bow and Quiver' },
  { name: 'Pushya', devanagari: 'पुष्य', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Cow Udder/Lotus' },
  { name: 'Ashlesha', devanagari: 'आश्लेषा', lord: 'Mercury', deity: 'Sarpa (Nagas)', symbol: 'Coiled Serpent' },
  { name: 'Magha', devanagari: 'मघा', lord: 'Ketu', deity: 'Pitris', symbol: 'Royal Throne' },
  { name: 'Purva Phalguni', devanagari: 'पूर्वा फाल्गुनी', lord: 'Venus', deity: 'Bhaga', symbol: 'Hammock/Bed' },
  { name: 'Uttara Phalguni', devanagari: 'उत्तरा फाल्गुनी', lord: 'Sun', deity: 'Aryaman', symbol: 'Four Legs of Bed' },
  { name: 'Hasta', devanagari: 'हस्त', lord: 'Moon', deity: 'Savitr', symbol: 'Open Hand' },
  { name: 'Chitra', devanagari: 'चित्रा', lord: 'Mars', deity: 'Tvashtar (Vishwakarma)', symbol: 'Bright Jewel' },
  { name: 'Swati', devanagari: 'स्वाति', lord: 'Rahu', deity: 'Vayu', symbol: 'Sprout/Coral' },
  { name: 'Vishakha', devanagari: 'विशाखा', lord: 'Jupiter', deity: 'Indra & Agni', symbol: 'Archway/Triumph' },
  { name: 'Anuradha', devanagari: 'अनुराधा', lord: 'Saturn', deity: 'Mitra', symbol: 'Triumphal Arch/Lotus' },
  { name: 'Jyeshtha', devanagari: 'ज्येष्ठा', lord: 'Mercury', deity: 'Indra', symbol: 'Circular Amulet/Earring' },
  { name: 'Mula', devanagari: 'मूल', lord: 'Ketu', deity: 'Nirriti', symbol: 'Bunch of Roots' },
  { name: 'Purva Ashadha', devanagari: 'पूर्वाषाढ़ा', lord: 'Venus', deity: 'Apah (Water)', symbol: 'Elephant Tusk/Fan' },
  { name: 'Uttara Ashadha', devanagari: 'उत्तराषाढ़ा', lord: 'Sun', deity: 'Vishvedevas', symbol: 'Small Cot/Tusk' },
  { name: 'Shravana', devanagari: 'श्रवण', lord: 'Moon', deity: 'Vishnu', symbol: 'Three Footprints/Ear' },
  { name: 'Dhanishta', devanagari: 'धनिष्ठा', lord: 'Mars', deity: 'Eight Vasus', symbol: 'Drum (Damaru)/Flute' },
  { name: 'Shatabhisha', devanagari: 'शतभिषा', lord: 'Rahu', deity: 'Varuna', symbol: 'Empty Circle/100 Physicians' },
  { name: 'Purva Bhadrapada', devanagari: 'पूर्व भाद्रपद', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Sword/Two-faced Man' },
  { name: 'Uttara Bhadrapada', devanagari: 'उत्तर भाद्रपद', lord: 'Saturn', deity: 'Ahir Budhnya', symbol: 'Snake in Water' },
  { name: 'Revati', devanagari: 'रेवती', lord: 'Mercury', deity: 'Pushan', symbol: 'Pair of Fish/Drum' }
];

export const TITHIS: Array<{ index: number; name: string; pureName: string; paksha: 'Shukla' | 'Krishna'; deity: string }> = [
  { index: 1, name: 'Shukla Pratipada (1)', pureName: 'Pratipada', paksha: 'Shukla', deity: 'Agni' },
  { index: 2, name: 'Shukla Dwitiya (2)', pureName: 'Dwitiya', paksha: 'Shukla', deity: 'Brahma' },
  { index: 3, name: 'Shukla Tritiya (3)', pureName: 'Tritiya', paksha: 'Shukla', deity: 'Gauri' },
  { index: 4, name: 'Shukla Chaturthi (4)', pureName: 'Chaturthi', paksha: 'Shukla', deity: 'Ganesha' },
  { index: 5, name: 'Shukla Panchami (5)', pureName: 'Panchami', paksha: 'Shukla', deity: 'Naga' },
  { index: 6, name: 'Shukla Shashthi (6)', pureName: 'Shashthi', paksha: 'Shukla', deity: 'Kartikeya' },
  { index: 7, name: 'Shukla Saptami (7)', pureName: 'Saptami', paksha: 'Shukla', deity: 'Surya' },
  { index: 8, name: 'Shukla Ashtami (8)', pureName: 'Ashtami', paksha: 'Shukla', deity: 'Durga/Shiva' },
  { index: 9, name: 'Shukla Navami (9)', pureName: 'Navami', paksha: 'Shukla', deity: 'Rama/Durga' },
  { index: 10, name: 'Shukla Dashami (10)', pureName: 'Dashami', paksha: 'Shukla', deity: 'Yama/Digpalas' },
  { index: 11, name: 'Shukla Ekadashi (11)', pureName: 'Ekadashi', paksha: 'Shukla', deity: 'Vishnu' },
  { index: 12, name: 'Shukla Dwadashi (12)', pureName: 'Dwadashi', paksha: 'Shukla', deity: 'Vishnu' },
  { index: 13, name: 'Shukla Trayodashi (13)', pureName: 'Trayodashi', paksha: 'Shukla', deity: 'Kamadeva/Shiva' },
  { index: 14, name: 'Shukla Chaturdashi (14)', pureName: 'Chaturdashi', paksha: 'Shukla', deity: 'Shiva' },
  { index: 15, name: 'Shukla Purnima (15)', pureName: 'Purnima', paksha: 'Shukla', deity: 'Chandra' },
  { index: 16, name: 'Krishna Pratipada (1)', pureName: 'Pratipada', paksha: 'Krishna', deity: 'Agni' },
  { index: 17, name: 'Krishna Dwitiya (2)', pureName: 'Dwitiya', paksha: 'Krishna', deity: 'Brahma' },
  { index: 18, name: 'Krishna Tritiya (3)', pureName: 'Tritiya', paksha: 'Krishna', deity: 'Gauri' },
  { index: 19, name: 'Krishna Chaturthi (4)', pureName: 'Chaturthi', paksha: 'Krishna', deity: 'Ganesha' },
  { index: 20, name: 'Krishna Panchami (5)', pureName: 'Panchami', paksha: 'Krishna', deity: 'Naga' },
  { index: 21, name: 'Krishna Shashthi (6)', pureName: 'Shashthi', paksha: 'Krishna', deity: 'Kartikeya' },
  { index: 22, name: 'Krishna Saptami (7)', pureName: 'Saptami', paksha: 'Krishna', deity: 'Surya' },
  { index: 23, name: 'Krishna Ashtami (8)', pureName: 'Ashtami', paksha: 'Krishna', deity: 'Krishna/Kalbhairav' },
  { index: 24, name: 'Krishna Navami (9)', pureName: 'Navami', paksha: 'Krishna', deity: 'Durga' },
  { index: 25, name: 'Krishna Dashami (10)', pureName: 'Dashami', paksha: 'Krishna', deity: 'Yama' },
  { index: 26, name: 'Krishna Ekadashi (11)', pureName: 'Ekadashi', paksha: 'Krishna', deity: 'Vishnu' },
  { index: 27, name: 'Krishna Dwadashi (12)', pureName: 'Dwadashi', paksha: 'Krishna', deity: 'Vishnu' },
  { index: 28, name: 'Krishna Trayodashi (13)', pureName: 'Trayodashi', paksha: 'Krishna', deity: 'Shiva' },
  { index: 29, name: 'Krishna Chaturdashi (14)', pureName: 'Chaturdashi', paksha: 'Krishna', deity: 'Shiva' },
  { index: 30, name: 'Krishna Amavasya (30)', pureName: 'Amavasya', paksha: 'Krishna', deity: 'Pitris' },
];

export const YOGAS: Array<{ name: string; nature: 'Shubh' | 'Ashubh'; meaning: string }> = [
  { name: 'Vishkambha (विष्कम्भ)', nature: 'Ashubh', meaning: 'Obstacle' },
  { name: 'Priti (प्रीति)', nature: 'Shubh', meaning: 'Affection / Love' },
  { name: 'Ayushman (आयुष्मान)', nature: 'Shubh', meaning: 'Longevity' },
  { name: 'Saubhagya (सौभाग्य)', nature: 'Shubh', meaning: 'Good Fortune' },
  { name: 'Shobhana (शोभन)', nature: 'Shubh', meaning: 'Splendid / Bright' },
  { name: 'Atiganda (अतिगण्ड)', nature: 'Ashubh', meaning: 'Great danger' },
  { name: 'Sukarma (सुकर्मा)', nature: 'Shubh', meaning: 'Righteous deed' },
  { name: 'Dhriti (धृति)', nature: 'Shubh', meaning: 'Steadfastness / Joy' },
  { name: 'Shoola (शूल)', nature: 'Ashubh', meaning: 'Dart / Spear' },
  { name: 'Ganda (गण्ड)', nature: 'Ashubh', meaning: 'Obstruction' },
  { name: 'Vriddhi (वृद्धि)', nature: 'Shubh', meaning: 'Growth / Prosperity' },
  { name: 'Dhruva (ध्रुव)', nature: 'Shubh', meaning: 'Constant / Fixed' },
  { name: 'Vyaghata (व्याघात)', nature: 'Ashubh', meaning: 'Striking / Calamity' },
  { name: 'Harshana (हर्षण)', nature: 'Shubh', meaning: 'Joy / Delight' },
  { name: 'Vajra (वज्र)', nature: 'Ashubh', meaning: 'Thunderbolt' },
  { name: 'Siddhi (सिद्धि)', nature: 'Shubh', meaning: 'Accomplishment' },
  { name: 'Vyatipata (व्यतीपात)', nature: 'Ashubh', meaning: 'Catastrophe' },
  { name: 'Variyana (वरीयान)', nature: 'Shubh', meaning: 'Superior / Best' },
  { name: 'Parigha (परिघ)', nature: 'Ashubh', meaning: 'Iron bar / Barrier' },
  { name: 'Shiva (शिव)', nature: 'Shubh', meaning: 'Auspicious / Benevolent' },
  { name: 'Siddha (सिद्ध)', nature: 'Shubh', meaning: 'Perfected' },
  { name: 'Sadhya (साध्य)', nature: 'Shubh', meaning: 'Attainable' },
  { name: 'Shubha (शुभ)', nature: 'Shubh', meaning: 'Pure / Auspicious' },
  { name: 'Shukla (शुक्ल)', nature: 'Shubh', meaning: 'Bright / Radiant' },
  { name: 'Brahma (ब्रह्म)', nature: 'Shubh', meaning: 'Divine / Supreme' },
  { name: 'Indra (इन्द्र)', nature: 'Shubh', meaning: 'Power / Leadership' },
  { name: 'Vaidhriti (वैधृति)', nature: 'Ashubh', meaning: 'Discord / Tremor' }
];

export const KARANAS = [
  // 7 Movable (Chara) Karanas
  { name: 'Bava (बव)', type: 'Chara (चर)', lord: 'Indra', auspicious: true },
  { name: 'Balava (बालव)', type: 'Chara (चर)', lord: 'Brahma', auspicious: true },
  { name: 'Kaulava (कौलव)', type: 'Chara (चर)', lord: 'Mitra', auspicious: true },
  { name: 'Taitila (तैतिल)', type: 'Chara (चर)', lord: 'Aryaman', auspicious: true },
  { name: 'Gara (गर)', type: 'Chara (चर)', lord: 'Prithvi', auspicious: true },
  { name: 'Vanija (वणिज)', type: 'Chara (चर)', lord: 'Lakshmi / Sri', auspicious: true },
  { name: 'Vishti / Bhadra (विष्टि / भद्रा)', type: 'Chara (चर)', lord: 'Yama', auspicious: false },
  // 4 Fixed (Sthira) Karanas
  { name: 'Shakuni (शकुनि)', type: 'Sthira (स्थिर)', lord: 'Kaliyuga', auspicious: false },
  { name: 'Chatushpada (चतुष्पाद)', type: 'Sthira (स्थिर)', lord: 'Rudra', auspicious: false },
  { name: 'Naga (नाग)', type: 'Sthira (स्थिर)', lord: 'Nagas', auspicious: false },
  { name: 'Kimstughna (किंस्तुघ्न)', type: 'Sthira (स्थिर)', lord: 'Vayu', auspicious: true }
];

export const RASHIS = [
  { name: 'Mesha', devanagari: 'मेष', english: 'Aries', lord: 'Mars' },
  { name: 'Vrishabha', devanagari: 'वृषभ', english: 'Taurus', lord: 'Venus' },
  { name: 'Mithuna', devanagari: 'मिथुन', english: 'Gemini', lord: 'Mercury' },
  { name: 'Karka', devanagari: 'कर्क', english: 'Cancer', lord: 'Moon' },
  { name: 'Simha', devanagari: 'सिंह', english: 'Leo', lord: 'Sun' },
  { name: 'Kanya', devanagari: 'कन्या', english: 'Virgo', lord: 'Mercury' },
  { name: 'Tula', devanagari: 'तुला', english: 'Libra', lord: 'Venus' },
  { name: 'Vrischika', devanagari: 'वृश्चिक', english: 'Scorpio', lord: 'Mars' },
  { name: 'Dhanu', devanagari: 'धनु', english: 'Sagittarius', lord: 'Jupiter' },
  { name: 'Makara', devanagari: 'मकर', english: 'Capricorn', lord: 'Saturn' },
  { name: 'Kumbha', devanagari: 'कुम्भ', english: 'Aquarius', lord: 'Saturn' },
  { name: 'Meena', devanagari: 'मीन', english: 'Pisces', lord: 'Jupiter' }
];

export const VAARS = [
  { name: 'Ravivara (रविवार)', devanagari: 'रविवार', english: 'Sunday', lord: 'Surya (Sun)' },
  { name: 'Somavara (सोमवार)', devanagari: 'सोमवार', english: 'Monday', lord: 'Chandra (Moon)' },
  { name: 'Mangalavara (मंगलवार)', devanagari: 'मंगलवार', english: 'Tuesday', lord: 'Mangal (Mars)' },
  { name: 'Budhavara (बुधवार)', devanagari: 'बुधवार', english: 'Wednesday', lord: 'Budha (Mercury)' },
  { name: 'Guruvara (गुरुवार)', devanagari: 'गुरुवार', english: 'Thursday', lord: 'Brihaspati (Jupiter)' },
  { name: 'Shukravara (शुक्रवार)', devanagari: 'शुक्रवार', english: 'Friday', lord: 'Shukra (Venus)' },
  { name: 'Shanivara (शनिवार)', devanagari: 'शनिवार', english: 'Saturday', lord: 'Shani (Saturn)' }
];

export const HINDU_MONTHS = [
  'Chaitra (चैत्र)', 'Vaishakha (वैशाख)', 'Jyeshtha (ज्येष्ठ)', 'Ashadha (आषाढ़)',
  'Shravana (श्रावण)', 'Bhadrapada (भाद्रपद)', 'Ashwina (आश्विन)', 'Kartika (कार्तिक)',
  'Margashirsha (मार्गशीर्ष)', 'Pausha (पौष)', 'Magha (माघ)', 'Phalguna (फाल्गुन)'
];

export const RITUS = [
  { name: 'Vasanta', devanagari: 'वसन्त', english: 'Spring' },
  { name: 'Grishma', devanagari: 'ग्रीष्म', english: 'Summer' },
  { name: 'Varsha', devanagari: 'वर्षा', english: 'Monsoon' },
  { name: 'Sharad', devanagari: 'शरद्', english: 'Autumn' },
  { name: 'Hemanta', devanagari: 'हेमन्त', english: 'Pre-winter' },
  { name: 'Shishira', devanagari: 'शिशिर', english: 'Winter' }
];

export const SAMVATSARA_NAMES = [
  'Prabhava (प्रभव)', 'Vibhava (विभव)', 'Shukla (शुक्ल)', 'Pramodoota (प्रमोदूत)', 'Prajothpatti (प्रजोत्पत्ति)',
  'Angirasa (आंगिरस)', 'Shrimukha (श्रीमुख)', 'Bhava (भाव)', 'Yuva (युवा)', 'Dhata (धाता)',
  'Ishwara (ईश्वर)', 'Bahudhanya (बहुधान्य)', 'Pramathi (प्रमाथी)', 'Vikrama (विक्रम)', 'Vrisha (वृष)',
  'Chitrabhanu (चित्रभानु)', 'Svabhanu (स्वभानु)', 'Tarana (तारण)', 'Parthiva (पार्थिव)', 'Vyaya (व्यय)',
  'Sarvajit (सर्वजित्)', 'Sarvadharin (सर्वधारी)', 'Virodhi (विरोधी)', 'Vikrita (विकृति)', 'Khara (खर)',
  'Nandana (नन्दन)', 'Vijaya (विजय)', 'Jaya (जय)', 'Manmatha (मन्मथ)', 'Durmukhi (दुर्मुखी)',
  'Hevilambi (हेविलम्बी)', 'Vilambi (विलम्बी)', 'Vikari (विकारी)', 'Sharvari (शार्वरी)', 'Plava (प्लव)',
  'Shubhakrit (शुभकृत्)', 'Shobhakrit (शोभकृत्)', 'Krodhi (क्रोधी)', 'Vishvavasu (विश्वावसु)', 'Parabhava (पराभव)',
  'Plavanga (प्लवंग)', 'Kilaka (कीलक)', 'Saumya (सौम्य)', 'Sadharana (साधारण)', 'Virodhikrit (विरोधिकृत्)',
  'Paridhavi (परिधावी)', 'Pramadicha (प्रमादीच)', 'Ananda (आनन्द)', 'Rakshasa (राक्षस)', 'Nala (नल)',
  'Pingala (पिंगल)', 'Kalayukti (कालयुक्ति)', 'Siddharthi (सिद्धार्थी)', 'Raudri (रौद्री)', 'Durmathi (दुर्मति)',
  'Dundubhi (दुन्दुभि)', 'Rudhirodgari (रुधिरोद्गारी)', 'Raktakshi (रक्ताक्षी)', 'Krodhana (क्रोधन)', 'Akshaya (अक्षय)'
];

// Choghadiya Orders (0 = Sunday, 1 = Monday, ... 6 = Saturday)
export const DAY_CHOGHADIYA_ORDER = [
  ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],       // Sun
  ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],       // Mon
  ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],         // Tue
  ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],         // Wed
  ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],       // Thu
  ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],         // Fri
  ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal']          // Sat
];

export const NIGHT_CHOGHADIYA_ORDER = [
  ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],       // Sun
  ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],         // Mon
  ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],         // Tue
  ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],       // Wed
  ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],       // Thu
  ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],         // Fri
  ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh']          // Sat
];

export const CHOGHADIYA_META: Record<string, { devanagari: string; quality: string; nature: 'AUSPICIOUS' | 'INAUSPICIOUS' | 'NEUTRAL'; planet: string; ruler: string }> = {
  Amrit: { devanagari: 'अमृत', quality: 'Amrit', nature: 'AUSPICIOUS', planet: 'Moon', ruler: 'Chandra (Moon)' },
  Shubh: { devanagari: 'शुभ', quality: 'Shubh', nature: 'AUSPICIOUS', planet: 'Jupiter', ruler: 'Brihaspati (Jupiter)' },
  Labh: { devanagari: 'लाभ', quality: 'Labh', nature: 'AUSPICIOUS', planet: 'Mercury', ruler: 'Budha (Mercury)' },
  Char: { devanagari: 'चर', quality: 'Char', nature: 'NEUTRAL', planet: 'Venus', ruler: 'Shukra (Venus)' },
  Rog: { devanagari: 'रोग', quality: 'Rog', nature: 'INAUSPICIOUS', planet: 'Mars', ruler: 'Mangal (Mars)' },
  Kaal: { devanagari: 'काल', quality: 'Kaal', nature: 'INAUSPICIOUS', planet: 'Saturn', ruler: 'Shani (Saturn)' },
  Udveg: { devanagari: 'उद्वेग', quality: 'Udveg', nature: 'INAUSPICIOUS', planet: 'Sun', ruler: 'Surya (Sun)' },
};

export interface ChoghadiyaSlot {
  name: string;
  displayName: string;
  devanagari: string;
  quality: string;
  nature: 'AUSPICIOUS' | 'INAUSPICIOUS' | 'NEUTRAL';
  periodType: 'Day' | 'Night';
  planet: string;
  ruler: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  windowString: string;
  remainingString: string;
  remainingSeconds: number;
  isCurrent: boolean;
}

export interface PaharSlot {
  index: number;
  name: string;
  devanagari: string;
  period: 'Day' | 'Night';
  watchName: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  activity: string;
  isCurrent: boolean;
  progressPercent: number;
}

export interface PanchangData {
  date: Date;
  dateString: string;
  dayOfWeekName: string;
  location: LocationCoordinates;
  timeFormatted: string;

  // Pancha-Anga (5 limbs)
  tithi: {
    index: number;
    name: string;
    pureName: string;
    paksha: 'Shukla' | 'Krishna';
    deity: string;
    completionPercent: number;
    endTime: string;
    isUdayaTithi: boolean;
    udayaTithiName: string;
  };
  nakshatra: {
    index: number;
    name: string;
    devanagari: string;
    lord: string;
    deity: string;
    symbol: string;
    pada: number;
    completionPercent: number;
    endTime: string;
  };
  yoga: {
    index: number;
    name: string;
    nature: 'Shubh' | 'Ashubh';
    meaning: string;
    completionPercent: number;
  };
  karana: {
    index: number;
    name: string;
    type: string;
    lord: string;
    auspicious: boolean;
  };
  vaar: {
    name: string;
    devanagari: string;
    lord: string;
  };

  // Astronomical & Solar timings
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: string;
  nightLength: string;
  sunriseDate: Date;
  sunsetDate: Date;

  // Moon timings & Phase
  moonrise: string;
  moonset: string;
  moonPhaseName: string;
  moonIlluminationPercent: number;

  // Astrological signs (Sidereal / Nirayana)
  suryaRashi: { name: string; devanagari: string; degree: string };
  chandraRashi: { name: string; devanagari: string; degree: string };
  ayanamsaDegree: string;

  // Calendars & Eras
  vikramSamvat: number;
  shakaSamvat: number;
  kaliYugaYear: number;
  samvatsaraName: string;
  hinduMonth: string;
  masaDisplay: string;
  ritu: string;
  ayana: string;

  // Live Vedic Clock / Ishta Kaal
  ishtaKaal: {
    ghati: number;
    pala: number;
    vipala: number;
    formatted: string;
    ghatiFormatted: string;
  };

  // Muhurats
  muhurats: {
    brahmaMuhurat: { start: string; end: string; status: 'Shubh' };
    abhijitMuhurat: { start: string; end: string; status: 'Shubh' };
    amritKaal: { start: string; end: string; status: 'Shubh' };
    vijayaMuhurat: { start: string; end: string; status: 'Shubh' };
    godhuliMuhurat: { start: string; end: string; status: 'Shubh' };
    sayahnaSandhya: { start: string; end: string; status: 'Shubh' };
    
    // Inauspicious (Ashubh)
    rahuKaal: { start: string; end: string; status: 'Ashubh' };
    yamaganda: { start: string; end: string; status: 'Ashubh' };
    gulikaKaal: { start: string; end: string; status: 'Neutral' };
    durMuhurat: { start: string; end: string; status: 'Ashubh' };
    varjyam: { start: string; end: string; status: 'Ashubh' };
  };

  // Choghadiya
  dayChoghadiya: ChoghadiyaSlot[];
  nightChoghadiya: ChoghadiyaSlot[];
  currentChoghadiya: ChoghadiyaSlot | null;

  // 8 Pahars
  pahars: PaharSlot[];
  currentPahar: PaharSlot | null;
  paharCapsuleText: string;

  // Festivals / Observances
  todayFestival: {
    title: string;
    description: string;
    icon?: string;
    isMajor?: boolean;
    badge?: string;
    shortName?: string;
    hindiName?: string;
    briefRule?: {
      hindi: string;
      english: string;
    };
    shastraReferences?: string[];
  };
  upcomingFestival: {
    badge: string;
    title: string;
    description: string;
    icon?: string;
    isMajor?: boolean;
    dateFormatted?: string;
    dayOfWeek?: string;
    daysRemaining?: number;
    daysText?: string;
    shortName?: string;
    hindiName?: string;
    briefRule?: {
      hindi: string;
      english: string;
    };
    shastraReferences?: string[];
  };
  festivals: string[];
}

export interface MonthCalendarDay {
  dayNumber: number;
  date: Date;
  dateFormatted: string;
  dayOfWeek: string;
  dayOfWeekShort: string;
  isToday: boolean;
  
  // Udaya Tithi prevailing at local sunrise
  udayaTithi: {
    index: number;
    name: string;
    pureName: string;
    paksha: 'Shukla' | 'Krishna';
    deity: string;
    isPurnima: boolean;
    isAmavasya: boolean;
    isEkadashi: boolean;
    isKshayaTithi?: boolean;
    isVriddhiTithi?: boolean;
  };
  
  // Exact Tithi end time in local timezone
  tithiEndTime: string;
  tithiEndDate: Date | null;
  
  // 5 Limbs at sunrise
  nakshatra: {
    name: string;
    devanagari: string;
    lord: string;
  };
  yoga: {
    name: string;
    nature: 'Shubh' | 'Ashubh';
  };
  karana: {
    name: string;
    auspicious: boolean;
  };
  
  // Solar times
  sunrise: string;
  sunset: string;
  
  // Observance / Festival
  festival?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HIGH-PRECISION ASTRONOMICAL CONSTANTS & MATH ROUTINES (MEEUS / VSOP87 / ELP2000)
// ─────────────────────────────────────────────────────────────────────────────
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function getJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

// 1. High-precision Sun apparent longitude (VSOP87 / Meeus Ch. 25)
export function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Geometric mean longitude of the Sun
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  
  // Mean anomaly of the Sun
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * DEG2RAD;
  
  // Sun equation of the center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);
  
  // True longitude of the Sun
  const trueLon = L0 + C;
  
  // Planetary perturbations (Venus, Jupiter, Mars, Earth)
  const A1 = (119.75 + 131.849 * T) * DEG2RAD;
  const A2 = (53.09 + 479264.290 * T) * DEG2RAD;
  const A3 = (313.45 + 481266.484 * T) * DEG2RAD;
  let dL = 0.00134 * Math.cos(A1) + 0.00154 * Math.cos(A2) + 0.00200 * Math.cos(A3);
  
  // Apparent longitude with nutation and aberration
  const omega = (125.04452 - 1934.136261 * T) * DEG2RAD;
  const appLon = trueLon + dL - 0.00569 - 0.00478 * Math.sin(omega);
  
  return normalizeDeg(appLon);
}

// 2. High-precision Moon apparent longitude (ELP2000-82 / Meeus Ch. 47)
export function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0);
  const D  = normalizeDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0);
  const M  = normalizeDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0);
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0);
  const F  = normalizeDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000.0);
  
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  
  const terms: Array<[number, number, number, number, number, number]> = [
    [0, 0, 1, 0, 6288774, 0],
    [2, 0, -1, 0, 1274027, 0],
    [2, 0, 0, 0, 658314, 0],
    [0, 0, 2, 0, 214618, 0],
    [0, 1, 0, 0, -185596, 1],
    [0, 0, 0, 2, -114332, 0],
    [2, 0, -2, 0, 58793, 0],
    [2, -1, -1, 0, 57066, 1],
    [2, 0, 1, 0, 53322, 0],
    [2, -1, 0, 0, 45758, 1],
    [0, 1, -1, 0, -40923, 1],
    [1, 0, 0, 0, -34720, 0],
    [0, 1, 1, 0, -30383, 1],
    [2, 0, 0, -2, 15327, 0],
    [0, 0, 1, 2, -12528, 0],
    [0, 0, 1, -2, 10980, 0],
    [4, 0, -1, 0, 10675, 0],
    [0, 0, 3, 0, 10034, 0],
    [4, 0, -2, 0, 8548, 0],
    [2, 1, -1, 0, -7888, 1],
    [2, 1, 0, 0, -6766, 1],
    [1, 0, -1, 0, -5163, 0],
    [1, 1, 0, 0, 4987, 1],
    [2, -1, 1, 0, 4036, 1],
    [2, 0, 2, 0, 3994, 0],
    [4, 0, 0, 0, 3861, 0],
    [2, 0, -3, 0, 3665, 0],
    [0, 1, -2, 0, -2689, 1],
    [2, 0, -1, 2, -2602, 0],
    [2, -1, -2, 0, 2390, 1],
    [1, 0, 1, 0, -2348, 0],
    [2, -2, 0, 0, 2236, 2],
    [0, 1, 2, 0, -2120, 1],
    [0, 2, 0, 0, -2069, 2],
    [2, -2, -1, 0, 2048, 2],
    [2, 0, 1, -2, -1773, 0],
    [2, 0, 0, 2, -1595, 0],
    [4, -1, -1, 0, 1215, 1],
    [0, 0, 2, 2, -1110, 0],
    [3, 0, -1, 0, -892, 0],
    [2, 1, 1, 0, -811, 1],
    [4, -1, -2, 0, 761, 1],
    [0, 2, -1, 0, 717, 2],
    [2, 2, -1, 0, -704, 2],
    [2, 1, -2, 0, 693, 1],
    [2, -1, 0, -2, 598, 1],
    [4, 0, 1, 0, 550, 0],
    [0, 0, 4, 0, 538, 0],
    [4, -1, 0, 0, 521, 1],
    [1, 0, -2, 0, 486, 0],
    [2, 1, 0, -2, -399, 1],
    [0, 0, 2, -2, -381, 0],
    [1, 1, 1, 0, 351, 1],
    [3, 0, -2, 0, -340, 0],
    [4, 0, -3, 0, 330, 0],
    [2, -1, -1, -2, 327, 1],
    [0, 2, 1, 0, -323, 2],
    [0, 0, 3, -2, 299, 0],
    [2, 0, -1, -2, 294, 0],
  ];
  
  let sumL = 0;
  for (const [d, m, mp, f, coeff, hasE] of terms) {
    const angle = (d * D + m * M + mp * Mp + f * F) * DEG2RAD;
    let c = coeff * 1e-6;
    if (hasE === 1) c *= E;
    else if (hasE === 2) c *= (E * E);
    sumL += c * Math.sin(angle);
  }
  
  // Venus and Jupiter perturbations
  const A1 = (119.75 + 131.849 * T) * DEG2RAD;
  const A2 = (53.09 + 479264.290 * T) * DEG2RAD;
  const A3 = (313.45 + 481266.484 * T) * DEG2RAD;
  sumL += 0.003964 * Math.sin(A1);
  sumL += 0.001964 * Math.sin(Lp * DEG2RAD - A3);
  sumL += 0.002060 * Math.sin(A2);
  
  // Nutation in longitude
  const omega = (125.04452 - 1934.136261 * T) * DEG2RAD;
  sumL -= 0.00478 * Math.sin(omega);
  
  return normalizeDeg(Lp + sumL);
}

// Moon ecliptic latitude (for topocentric Moon coordinates & Moonrise/set)
export function getMoonLatitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const D  = normalizeDeg(297.8501921 + 445267.1114034 * T);
  const M  = normalizeDeg(357.5291092 + 35999.0502909 * T);
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T);
  const F  = normalizeDeg(93.2720950 + 483202.0175233 * T);

  let sumB = 5.128122 * Math.sin(F * DEG2RAD)
           + 0.280602 * Math.sin((Mp + F) * DEG2RAD)
           + 0.277693 * Math.sin((Mp - F) * DEG2RAD)
           + 0.173237 * Math.sin((2 * D - F) * DEG2RAD)
           + 0.055413 * Math.sin((2 * D - Mp + F) * DEG2RAD)
           + 0.046271 * Math.sin((2 * D - Mp - F) * DEG2RAD)
           + 0.032573 * Math.sin((2 * D + F) * DEG2RAD)
           + 0.017198 * Math.sin((2 * Mp + F) * DEG2RAD)
           + 0.009266 * Math.sin((2 * D + Mp - F) * DEG2RAD)
           + 0.008822 * Math.sin((2 * Mp - F) * DEG2RAD);
  return sumB;
}

// 3. Lahiri (Chitra Paksha) Nirayana Ayanamsha
export function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Canonical Indian Astronomical Ephemeris / Swiss Ephemeris Lahiri formula:
  // J2000.0 offset: 23° 51' 25.53" = 23.8570928°
  // Precession rate: 5029.0966" / century = 1.39697128°
  return 23.8570928 + 1.39697128 * T + 0.0003088 * T * T;
}

// 4. Sidereal Moon longitude (for Nakshatra, Rashi, etc.)
export function getSiderealMoonLongitude(jd: number): number {
  return normalizeDeg(getMoonLongitude(jd) - getLahiriAyanamsha(jd));
}

// 5. Sidereal Sun longitude (for Rashi, Sankranti, Ayana)
export function getSiderealSunLongitude(jd: number): number {
  return normalizeDeg(getSunLongitude(jd) - getLahiriAyanamsha(jd));
}

// 6. Longitudinal difference between Moon and Sun (Elongation Angle)
// Note: Ayanamsha cancels in subtraction, so tropical elongation = sidereal elongation.
export function getElongationAngle(jd: number): number {
  const sun = getSunLongitude(jd);
  const moon = getMoonLongitude(jd);
  return normalizeDeg(moon - sun);
}

// 7. Exact Nakshatra end time via binary-search root-finding
export function findNakshatraEndTime(startUtcDate: Date, nakshatraIndex: number): Date | null {
  const nakshatraDeg = 360 / 27; // 13.333333°
  const targetDeg = ((nakshatraIndex + 1) % 27) * nakshatraDeg; // Next boundary
  const tLow = startUtcDate.getTime();
  const tHigh = tLow + 48 * 3600 * 1000; // Search up to 48 hours
  const stepMs = 10 * 60 * 1000; // 10-minute scan
  
  let bStart = tLow, bEnd = tHigh, found = false;
  let prevMoonSid = getSiderealMoonLongitude(tLow / 86400000 + 2440587.5);
  
  for (let t = tLow + stepMs; t <= tHigh; t += stepMs) {
    const jd = t / 86400000 + 2440587.5;
    const curMoonSid = getSiderealMoonLongitude(jd);
    
    // Angular distance to target in forward direction
    const prevDist = (targetDeg - prevMoonSid + 360) % 360;
    const curDist = (targetDeg - curMoonSid + 360) % 360;
    
    // Moon moves ~0.22° per 10 min. If prevDist was small positive and curDist jumped to ~360, we crossed
    if (prevDist < 14 && prevDist > 0 && curDist > 346) {
      bStart = t - stepMs;
      bEnd = t;
      found = true;
      break;
    }
    prevMoonSid = curMoonSid;
  }
  
  if (!found) return null;
  
  // Binary search: 28 iterations → sub-second precision
  for (let i = 0; i < 28; i++) {
    const mid = (bStart + bEnd) / 2;
    const midMoon = getSiderealMoonLongitude(mid / 86400000 + 2440587.5);
    let diff = midMoon - targetDeg;
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

// 8. Exact Yoga end time via binary-search root-finding
export function findYogaEndTime(startUtcDate: Date, yogaIndex: number): Date | null {
  const yogaDeg = 360 / 27;
  const targetDeg = ((yogaIndex + 1) % 27) * yogaDeg;
  const tLow = startUtcDate.getTime();
  const tHigh = tLow + 48 * 3600 * 1000;
  const stepMs = 10 * 60 * 1000;

  const getYogaSum = (jd: number) => {
    const s = getSiderealSunLongitude(jd);
    const m = getSiderealMoonLongitude(jd);
    return normalizeDeg(s + m);
  };

  let bStart = tLow, bEnd = tHigh, found = false;
  let prevSum = getYogaSum(tLow / 86400000 + 2440587.5);

  for (let t = tLow + stepMs; t <= tHigh; t += stepMs) {
    const jd = t / 86400000 + 2440587.5;
    const curSum = getYogaSum(jd);
    const prevDist = (targetDeg - prevSum + 360) % 360;
    const curDist = (targetDeg - curSum + 360) % 360;
    if (prevDist < 14 && prevDist > 0 && curDist > 346) {
      bStart = t - stepMs;
      bEnd = t;
      found = true;
      break;
    }
    prevSum = curSum;
  }

  if (!found) return null;

  for (let i = 0; i < 28; i++) {
    const mid = (bStart + bEnd) / 2;
    const midSum = getYogaSum(mid / 86400000 + 2440587.5);
    let diff = midSum - targetDeg;
    if (diff > 180) diff -= 360;
    else if (diff < -180) diff += 360;
    if (diff < 0) bStart = mid;
    else bEnd = mid;
  }

  return new Date((bStart + bEnd) / 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME & FORMATTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export function formatMinutesToTime(totalMinutes: number): string {
  let mins = Math.floor(totalMinutes) % 1440;
  if (mins < 0) mins += 1440;
  const hours24 = Math.floor(mins / 60);
  const minutes = Math.floor(mins % 60);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours12)}:${pad(minutes)} ${period}`;
}

export function formatMinutesToTimeShort(totalMinutes: number): string {
  return formatMinutesToTime(totalMinutes);
}

export function formatUtcDateToLocalTime(date: Date, tz: number): string {
  const localMs = date.getTime() + tz * 3600000;
  const d = new Date(localMs);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h12)}:${pad(m)} ${period}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXACT SOLAR TIMINGS (NOAA SOLAR CALCULATIONS WITH REFRACTION & EQUATION OF TIME)
// ─────────────────────────────────────────────────────────────────────────────
export function calculateSunTimes(targetDate: Date, lat: number, lng: number, tz: number) {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();
  
  // Approximate noon JD for day calculation
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
  
  // Declination
  const sinDec = Math.sin(eps) * Math.sin(lambda_rad);
  const dec = Math.asin(sinDec);
  const cosDec = Math.cos(dec);
  
  // Equation of time (in minutes)
  const y = Math.tan(eps / 2) * Math.tan(eps / 2);
  const eot = 4 * RAD2DEG * (
    y * Math.sin(2 * L0_rad)
    - 2 * e * Math.sin(M_rad)
    + 4 * e * y * Math.sin(M_rad) * Math.cos(2 * L0_rad)
    - 0.5 * y * y * Math.sin(4 * L0_rad)
    - 1.25 * e * e * Math.sin(2 * M_rad)
  );
  
  // Standard solar refraction zenith: 90° 50' = 90.8333°
  const zenithRad = 90.8333 * DEG2RAD;
  const latRad = lat * DEG2RAD;
  
  const cosHA = (Math.cos(zenithRad) - Math.sin(latRad) * sinDec) / (Math.cos(latRad) * cosDec);
  const clampedCosHA = Math.max(-1, Math.min(1, cosHA));
  const HA = Math.acos(clampedCosHA) * RAD2DEG;
  
  const solarNoonMinutes = 720 - (4 * lng) + (tz * 60) - eot;
  const sunriseMinutes = solarNoonMinutes - HA * 4;
  const sunsetMinutes = solarNoonMinutes + HA * 4;
  
  // Date in UTC corresponding to exact sunrise/sunset
  const startOfDayLocalMs = Date.UTC(year, month, day, 0, 0, 0) - tz * 3600000;
  const sunriseDateUtc = new Date(startOfDayLocalMs + sunriseMinutes * 60000);
  const sunsetDateUtc = new Date(startOfDayLocalMs + sunsetMinutes * 60000);
  
  return {
    sunriseMinutes,
    sunsetMinutes,
    solarNoonMinutes,
    sunriseDate: sunriseDateUtc,
    sunsetDate: sunsetDateUtc,
    dayLengthMinutes: sunsetMinutes - sunriseMinutes,
    nightLengthMinutes: 1440 - (sunsetMinutes - sunriseMinutes)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ASTRONOMICAL MOONRISE AND MOONSET CALCULATION ENGINE (MEEUS CH. 15)
// ─────────────────────────────────────────────────────────────────────────────
export function calculateMoonTimes(targetDate: Date, lat: number, lng: number, tz: number): { moonrise: string; moonset: string } {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();

  // Local start of day in UTC ms
  const dayStartUtcMs = Date.UTC(year, month, day, 0, 0, 0) - tz * 3600000;

  // Calculates apparent altitude of the Moon above horizon for a given UTC timestamp
  const getMoonAltitude = (utcMs: number): number => {
    const jd = utcMs / 86400000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525.0;

    const lonDeg = getMoonLongitude(jd);
    const latDeg = getMoonLatitude(jd);

    const lonRad = lonDeg * DEG2RAD;
    const latMoonRad = latDeg * DEG2RAD;

    // Obliquity of ecliptic
    const eps = (23.439291 - 0.0130042 * T) * DEG2RAD;

    // Equatorial coordinates (Right Ascension alpha, Declination delta)
    const sinDec = Math.sin(latMoonRad) * Math.cos(eps) + Math.cos(latMoonRad) * Math.sin(eps) * Math.sin(lonRad);
    const dec = Math.asin(sinDec);
    const cosDec = Math.cos(dec);

    const sinRAcosDec = Math.cos(latMoonRad) * Math.cos(eps) * Math.sin(lonRad) - Math.sin(latMoonRad) * Math.sin(eps);
    const cosRAcosDec = Math.cos(latMoonRad) * Math.cos(lonRad);
    const ra = normalizeDeg(Math.atan2(sinRAcosDec, cosRAcosDec) * RAD2DEG);

    // Greenwich Mean Sidereal Time
    const gmst = normalizeDeg(280.46061837 + 360.98564736629 * (jd - 2451545.0));
    // Local Sidereal Time
    const lst = normalizeDeg(gmst + lng);
    // Hour Angle
    const ha = normalizeDeg(lst - ra);
    const haRad = ha * DEG2RAD;

    const phiRad = lat * DEG2RAD;
    const sinAlt = Math.sin(phiRad) * Math.sin(dec) + Math.cos(phiRad) * cosDec * Math.cos(haRad);
    const altDeg = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD2DEG;

    // Standard horizon zenith for Moon: refraction (-34'), semidiameter (-16'), parallax (+57') -> +0.125°
    return altDeg - 0.125;
  };

  let riseMs: number | null = null;
  let setMs: number | null = null;

  const stepMin = 20; // 20-minute scan step across the 24-hour day
  let prevAlt = getMoonAltitude(dayStartUtcMs);

  for (let m = stepMin; m <= 1440; m += stepMin) {
    const curMs = dayStartUtcMs + m * 60000;
    const curAlt = getMoonAltitude(curMs);

    // Crossing from below to above horizon -> Moonrise
    if (prevAlt <= 0 && curAlt > 0 && riseMs === null) {
      let low = curMs - stepMin * 60000;
      let high = curMs;
      for (let i = 0; i < 18; i++) {
        const mid = (low + high) / 2;
        if (getMoonAltitude(mid) < 0) low = mid;
        else high = mid;
      }
      riseMs = (low + high) / 2;
    }

    // Crossing from above to below horizon -> Moonset
    if (prevAlt >= 0 && curAlt < 0 && setMs === null) {
      let low = curMs - stepMin * 60000;
      let high = curMs;
      for (let i = 0; i < 18; i++) {
        const mid = (low + high) / 2;
        if (getMoonAltitude(mid) > 0) low = mid;
        else high = mid;
      }
      setMs = (low + high) / 2;
    }

    prevAlt = curAlt;
  }

  const moonrise = riseMs ? formatUtcDateToLocalTime(new Date(riseMs), tz) : 'No Moonrise';
  const moonset = setMs ? formatUtcDateToLocalTime(new Date(setMs), tz) : 'No Moonset';

  return { moonrise, moonset };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXACT TITHI END TIME ROOT-FINDING ENGINE (BINARY SEARCH ACCURACY < 1 SECOND)
// ─────────────────────────────────────────────────────────────────────────────
export function findTithiEndTime(sunriseUtcDate: Date, tithiIndex: number, tz: number): Date | null {
  const targetDeg = (tithiIndex * 12) % 360;
  const tLow = sunriseUtcDate.getTime();
  const tHigh = tLow + 36 * 3600 * 1000; // Search window up to 36 hours from sunrise
  
  let bracketFound = false;
  let bStart = tLow;
  let bEnd = tHigh;
  
  const stepMs = 10 * 60 * 1000; // 10-minute scan
  let prevAngle = getElongationAngle(tLow / 86400000 + 2440587.5);
  
  for (let t = tLow + stepMs; t <= tHigh; t += stepMs) {
    const curJd = t / 86400000 + 2440587.5;
    const curAngle = getElongationAngle(curJd);
    
    let crossed = false;
    if (targetDeg === 0) {
      if (prevAngle > 340 && curAngle < 20) crossed = true;
    } else {
      if (prevAngle < targetDeg && curAngle >= targetDeg) crossed = true;
    }
    
    if (crossed) {
      bStart = t - stepMs;
      bEnd = t;
      bracketFound = true;
      break;
    }
    prevAngle = curAngle;
  }
  
  if (!bracketFound) {
    return null;
  }
  
  // High-precision binary search: 28 iterations gives millisecond precision
  for (let i = 0; i < 28; i++) {
    const mid = (bStart + bEnd) / 2;
    const midAngle = getElongationAngle(mid / 86400000 + 2440587.5);
    
    let diff = midAngle - targetDeg;
    // Generalized wrapping for ALL target degrees
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

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTIC LUNAR MONTH (CHANDRA MASA) & ADHIKA MASA DETERMINATION
// ─────────────────────────────────────────────────────────────────────────────
export function getLunarMonthDetails(targetDate: Date): {
  amantaMonth: string;
  purnimantaMonth: string;
  isAdhika: boolean;
  masaDisplay: string;
  ritu: { name: string; devanagari: string };
  ayana: string;
} {
  const currentJd = getJulianDay(targetDate);
  const ayanamsha = getLahiriAyanamsha(currentJd);
  const sunSidereal = normalizeDeg(getSunLongitude(currentJd) - ayanamsha);

  // Approximate Solar Rashi index (0 = Mesha / Aries, ... 11 = Meena / Pisces)
  const suryaRashiIndex = Math.floor(sunSidereal / 30);

  // Find the preceding Amavasya (New Moon, elongation = 0)
  // Scan backwards up to 35 days in 6-hour steps
  let prevNmJd = currentJd;
  for (let d = 0; d <= 35; d += 0.25) {
    const jd = currentJd - d;
    const el = getElongationAngle(jd);
    if (el > 340 || el < 20) {
      // Bracket New Moon
      let low = jd - 0.25, high = jd + 0.25;
      for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        let diff = getElongationAngle(mid);
        if (diff > 180) diff -= 360;
        if (diff < 0) low = mid;
        else high = mid;
      }
      prevNmJd = (low + high) / 2;
      break;
    }
  }

  // Find the following Amavasya (New Moon)
  let nextNmJd = currentJd;
  for (let d = 0; d <= 35; d += 0.25) {
    const jd = currentJd + d;
    const el = getElongationAngle(jd);
    if (el > 340 || el < 20) {
      let low = jd - 0.25, high = jd + 0.25;
      for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        let diff = getElongationAngle(mid);
        if (diff > 180) diff -= 360;
        if (diff < 0) low = mid;
        else high = mid;
      }
      nextNmJd = (low + high) / 2;
      break;
    }
  }

  // Check if solar Sankranti occurs between prevNm and nextNm
  const sLon1 = normalizeDeg(getSunLongitude(prevNmJd) - getLahiriAyanamsha(prevNmJd));
  const sLon2 = normalizeDeg(getSunLongitude(nextNmJd) - getLahiriAyanamsha(nextNmJd));
  const r1 = Math.floor(sLon1 / 30);
  const r2 = Math.floor(sLon2 / 30);

  const isAdhika = r1 === r2;

  // Canonical Masa name derived from the Solar Rashi entered
  // (Mesha ingress -> Vaishakha, Vrishabha -> Jyeshtha, ..., Meena -> Chaitra)
  const amantaMonthIndex = (r2 + 1) % 12;
  const baseMonth = HINDU_MONTHS[amantaMonthIndex];
  const amantaMonth = isAdhika ? `Adhika ${baseMonth}` : baseMonth;

  // In Purnimanta system, Krishna Paksha belongs to next month name
  const currentElongation = getElongationAngle(currentJd);
  const isKrishnaPaksha = currentElongation >= 180;
  const purnimantaMonthIndex = isKrishnaPaksha ? (amantaMonthIndex + 1) % 12 : amantaMonthIndex;
  const purnimantaMonth = isAdhika ? `Adhika ${HINDU_MONTHS[purnimantaMonthIndex]}` : HINDU_MONTHS[purnimantaMonthIndex];

  const masaDisplay = `${amantaMonth} (अमान्त) / ${purnimantaMonth} (पूर्णिमान्त)`;

  // Ritu calculation (based on Sun's sidereal transit)
  const ritu = RITUS[Math.floor(suryaRashiIndex / 2)];

  // Ayana (Sidereal: Uttarayana begins at Makar Sankranti = 270°, Dakshinayana at Karka = 90°)
  const ayana = (sunSidereal >= 270 || sunSidereal < 90) ? 'Uttarayana (उत्तरायण)' : 'Dakshinayana (दक्षिणायन)';

  return { amantaMonth, purnimantaMonth, isAdhika, masaDisplay, ritu, ayana };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXACT SAMVAT & SAMVATSARA CALCULATION (ANCHORED TO CHAITRA SHUKLA PRATIPADA)
// ─────────────────────────────────────────────────────────────────────────────
export function getSamvatDetails(targetDate: Date): {
  vikramSamvat: number;
  shakaSamvat: number;
  kaliYugaYear: number;
  samvatsaraName: string;
} {
  const year = targetDate.getFullYear();

  // Find Chaitra Shukla Pratipada of the current Gregorian year (March/April New Moon)
  // New Moon before Sun enters Mesha (0° sidereal)
  const marchFirstJd = getJulianDay(new Date(Date.UTC(year, 2, 1, 0, 0, 0)));
  let chaitraPratipadaDate = new Date(year, 2, 22); // Baseline fallback

  for (let d = 0; d <= 45; d += 0.5) {
    const jd = marchFirstJd + d;
    const el = getElongationAngle(jd);
    if (el > 345 || el < 15) {
      // Find exact New Moon
      let low = jd - 0.5, high = jd + 0.5;
      for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        let diff = getElongationAngle(mid);
        if (diff > 180) diff -= 360;
        if (diff < 0) low = mid;
        else high = mid;
      }
      const nmDate = new Date((low + high) / 2 * 86400000 - 2440587.5 * 86400000);
      const sunSid = normalizeDeg(getSunLongitude(getJulianDay(nmDate)) - getLahiriAyanamsha(getJulianDay(nmDate)));
      // Check if this New Moon occurs in Meena (Pisces / Phalguna-Chaitra junction)
      if (sunSid >= 320 || sunSid < 20) {
        chaitraPratipadaDate = nmDate;
        break;
      }
    }
  }

  const isAfterChaitraPratipada = targetDate >= chaitraPratipadaDate;
  const vikramSamvat = isAfterChaitraPratipada ? year + 57 : year + 56;
  const shakaSamvat = isAfterChaitraPratipada ? year - 78 : year - 79;
  const kaliYugaYear = isAfterChaitraPratipada ? year + 3102 : year + 3101;

  // 60-year Jovian Samvatsara cycle (VS 2081 = Krodhi, index 37)
  const samvatsaraIndex = ((vikramSamvat - 2081 + 37) % 60 + 60) % 60;
  const samvatsaraName = SAMVATSARA_NAMES[samvatsaraIndex] || 'Prabhava (प्रभव)';

  return { vikramSamvat, shakaSamvat, kaliYugaYear, samvatsaraName };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANCHANG CALCULATION FUNCTION (UDAYA TITHI + INSTANTANEOUS LIMBS)
// ─────────────────────────────────────────────────────────────────────────────
export function calculatePanchang(targetDate: Date, location: LocationCoordinates, specificTime?: Date): PanchangData {
  const currentTz = resolveTimezoneOffset(targetDate, location);
  const sunTimes = calculateSunTimes(targetDate, location.latitude, location.longitude, currentTz);
  
  // 1. CALCULATE UDAYA TITHI AT LOCAL SUNRISE (Canonical Vedic Rule)
  const sunriseJd = getJulianDay(sunTimes.sunriseDate);
  const sunriseElongation = getElongationAngle(sunriseJd);
  const udayaTithiIndex = Math.floor(sunriseElongation / 12) + 1; // 1 to 30
  const udayaTithiObj = TITHIS[(udayaTithiIndex - 1) % 30];
  
  // Exact End Time for prevailing Udaya Tithi
  const endTimeUtc = findTithiEndTime(sunTimes.sunriseDate, udayaTithiIndex, currentTz);
  let tithiEndTimeFormatted = 'Full Day';
  if (endTimeUtc) {
    const endLocalMs = endTimeUtc.getTime() + currentTz * 3600000;
    const endDay = new Date(endLocalMs).getUTCDate();
    const curDay = targetDate.getDate();
    const timeStr = formatUtcDateToLocalTime(endTimeUtc, currentTz);
    tithiEndTimeFormatted = endDay === curDay ? timeStr : `Next day ${timeStr}`;
  }

  // 2. INSTANTANEOUS MOMENT CALCULATIONS (Real-time Clock / Selected Time)
  const isTodayDate = targetDate.toDateString() === new Date().toDateString();
  const now = specificTime || (
    isTodayDate 
      ? new Date() 
      : new Date(
          targetDate.getFullYear(), 
          targetDate.getMonth(), 
          targetDate.getDate(), 
          (targetDate.getHours() !== 0 || targetDate.getMinutes() !== 0) ? targetDate.getHours() : 6,
          (targetDate.getHours() !== 0 || targetDate.getMinutes() !== 0) ? targetDate.getMinutes() : 0,
          0
        )
  );
  const currentJd = getJulianDay(now);
  const ayanamsha = getLahiriAyanamsha(currentJd);

  // High-precision Tropical longitudes
  const sunTropical = getSunLongitude(currentJd);
  const moonTropical = getMoonLongitude(currentJd);

  // Sidereal (Nirayana) coordinates using Lahiri Ayanamsha
  const sunSidereal = normalizeDeg(sunTropical - ayanamsha);
  const moonSidereal = normalizeDeg(moonTropical - ayanamsha);

  // Instantaneous elongation & progress
  const diff = normalizeDeg(moonTropical - sunTropical);
  const tithiProgress = (diff % 12) / 12;

  // Nakshatra (Sidereal)
  const nakshatraDeg = 360 / 27;
  const nakshatraIndex = Math.floor(moonSidereal / nakshatraDeg);
  const nakshatra = NAKSHATRAS[nakshatraIndex % 27];
  const nakshatraProgress = (moonSidereal % nakshatraDeg) / nakshatraDeg;
  const nakPada = Math.floor(nakshatraProgress * 4) + 1;

  // Yoga (Sidereal Sum of Sun & Moon)
  const yogaSum = normalizeDeg(sunSidereal + moonSidereal);
  const yogaIndex = Math.floor(yogaSum / nakshatraDeg);
  const yoga = YOGAS[yogaIndex % 27];
  const yogaProgress = (yogaSum % nakshatraDeg) / nakshatraDeg;

  // Karana (Half-Tithi = 6 degrees elongation)
  const karanaIndex = Math.floor(diff / 6) + 1; // 1 to 60
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

  // Vaar (Weekday from sunrise)
  const dayOfWeek = targetDate.getDay();
  const vaar = VAARS[dayOfWeek];

  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  // Ishta Kaal (Ghatis from Sunrise)
  let elapsedMinutesFromSunrise = currentMinutes - sunTimes.sunriseMinutes;
  if (elapsedMinutesFromSunrise < 0) elapsedMinutesFromSunrise += 1440;
  
  const totalGhatis = elapsedMinutesFromSunrise / 24;
  const ghati = Math.floor(totalGhatis);
  const remainingMinutes = elapsedMinutesFromSunrise % 24;
  const pala = Math.floor(remainingMinutes / 0.4);
  const vipala = Math.floor((remainingMinutes % 0.4) / (0.4 / 60));

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const ghatiFormatted = `${pad2(ghati)} Ghati, ${pad2(pala)} Pala, ${pad2(vipala)} Vipala`;

  // Rashi (Sidereal / Nirayana)
  const suryaRashiIndex = Math.floor(sunSidereal / 30);
  const suryaRashiDeg = (sunSidereal % 30).toFixed(1);
  const chandraRashiIndex = Math.floor(moonSidereal / 30);
  const chandraRashiDeg = (moonSidereal % 30).toFixed(1);

  // Samvat & Samvatsara details
  const { vikramSamvat, shakaSamvat, kaliYugaYear, samvatsaraName } = getSamvatDetails(targetDate);

  // Lunar Month, Ritu, and Ayana details
  const { amantaMonth, purnimantaMonth, isAdhika, masaDisplay, ritu, ayana } = getLunarMonthDetails(targetDate);

  // Muhurats (1/15th of Dina Mana and Ratri Mana)
  const daySlot = sunTimes.dayLengthMinutes / 15;
  const nightSlot = sunTimes.nightLengthMinutes / 15;
  const partLength = sunTimes.dayLengthMinutes / 8;
  const nightPartLength = sunTimes.nightLengthMinutes / 8;

  // Brahma Muhurat: 2 Muhurats (96 min) before sunrise
  const brahmaStart = sunTimes.sunriseMinutes - 2 * nightSlot;
  const brahmaEnd = sunTimes.sunriseMinutes - 1 * nightSlot;

  // Abhijit Muhurat: 8th Muhurat of daytime, centered at true solar noon (± dayLength / 30)
  const abhijitHalfWidth = sunTimes.dayLengthMinutes / 30;
  const abhijitStart = sunTimes.solarNoonMinutes - abhijitHalfWidth;
  const abhijitEnd = sunTimes.solarNoonMinutes + abhijitHalfWidth;

  // Vijaya Muhurat: 11th Muhurat of daytime
  const vijayaStart = sunTimes.sunriseMinutes + 10 * daySlot;
  const vijayaEnd = sunTimes.sunriseMinutes + 11 * daySlot;

  // Godhuli Muhurat: 24 minutes around sunset
  const godhuliStart = sunTimes.sunsetMinutes - 12;
  const godhuliEnd = sunTimes.sunsetMinutes + 12;

  // Amrit Kaal: canonical Nakshatra-based Ghati offsets from Muhurta Chintamani
  const AMRIT_GHATI_OFFSET: number[] = [
    42, 48, 54, 52, 38, 35, 54, 44, 56, 54, 44, 42, 45, 44, 38, 38, 34, 38, 44, 48, 44, 34, 34, 42, 40, 48, 54
  ];
  const amritGhati = AMRIT_GHATI_OFFSET[nakshatraIndex % 27] || 42;
  const amritStart = sunTimes.sunriseMinutes + (amritGhati * 24) % 1440;
  const amritEnd = amritStart + (4 * 24); // 4 Ghatis = 96 minutes

  // Rahu Kaal (8th parts of day)
  const rahuDayParts = [8, 2, 7, 5, 6, 4, 3];
  const rahuPart = rahuDayParts[dayOfWeek] - 1;
  const rahuStart = sunTimes.sunriseMinutes + rahuPart * partLength;
  const rahuEnd = rahuStart + partLength;

  // Yamaganda Kaal
  const yamaDayParts = [5, 4, 3, 2, 1, 7, 6];
  const yamaPart = yamaDayParts[dayOfWeek] - 1;
  const yamaStart = sunTimes.sunriseMinutes + yamaPart * partLength;
  const yamaEnd = yamaStart + partLength;

  // Gulika Kaal
  const gulikaDayParts = [7, 6, 5, 4, 3, 2, 1];
  const gulikaPart = gulikaDayParts[dayOfWeek] - 1;
  const gulikaStart = sunTimes.sunriseMinutes + gulikaPart * partLength;
  const gulikaEnd = gulikaStart + partLength;

  // 8 Pahars (4 Day + 4 Night)
  const dayPaharLength = sunTimes.dayLengthMinutes / 4;
  const nightPaharLength = sunTimes.nightLengthMinutes / 4;
  const pahars: PaharSlot[] = [];
  const paharWatchNames = [
    'Pratah Pahar (First Watch)',
    'Sangava Pahar (Second Watch)',
    'Madhyahna Pahar (Third Watch)',
    'Aparahna Pahar (Fourth Watch)',
    'Sayana Pahar (Fifth Watch)',
    'Pradosha Pahar (Sixth Watch)',
    'Nishita Pahar (Seventh Watch)',
    'Brahma Pahar (Eighth Watch)'
  ];
  const paharActivities = [
    'Pratah Sandhya, Surya Namaskar & Japa',
    'Sangava, Business Initiation & Karma',
    'Madhyahna, Vedic Study & Satvik Bhojan',
    'Aparahna, Mindful Action & Charity',
    'Sayam Sandhya, Aarti & Devotion',
    'Pradosha, Light Dinner & Contemplation',
    'Nishita, Deep Rest & Sleep',
    'Brahma Muhurat, Awakening & Yoga'
  ];

  let currentPahar: PaharSlot | null = null;

  for (let i = 0; i < 4; i++) {
    const sMin = sunTimes.sunriseMinutes + i * dayPaharLength;
    const eMin = sMin + dayPaharLength;
    const isCur = currentMinutes >= sMin && currentMinutes < eMin;
    const prog = isCur ? Math.min(100, Math.max(0, ((currentMinutes - sMin) / dayPaharLength) * 100)) : (currentMinutes >= eMin ? 100 : 0);
    const p: PaharSlot = {
      index: i + 1,
      name: `Day Pahar ${i + 1}`,
      devanagari: `दिन प्रहर ${i + 1}`,
      period: 'Day',
      watchName: paharWatchNames[i],
      startTime: formatMinutesToTimeShort(sMin),
      endTime: formatMinutesToTimeShort(eMin),
      startMinutes: sMin,
      endMinutes: eMin,
      activity: paharActivities[i],
      isCurrent: isCur,
      progressPercent: Math.round(prog)
    };
    pahars.push(p);
    if (isCur) currentPahar = p;
  }

  for (let i = 0; i < 4; i++) {
    const sMin = sunTimes.sunsetMinutes + i * nightPaharLength;
    const eMin = sMin + nightPaharLength;
    const adjCurrent = currentMinutes < sunTimes.sunriseMinutes ? currentMinutes + 1440 : currentMinutes;
    const isCur = adjCurrent >= sMin && adjCurrent < eMin;
    const prog = isCur ? Math.min(100, Math.max(0, ((adjCurrent - sMin) / nightPaharLength) * 100)) : (adjCurrent >= eMin ? 100 : 0);
    const p: PaharSlot = {
      index: i + 5,
      name: `Night Pahar ${i + 1}`,
      devanagari: `रात्रि प्रहर ${i + 1}`,
      period: 'Night',
      watchName: paharWatchNames[i + 4],
      startTime: formatMinutesToTimeShort(sMin),
      endTime: formatMinutesToTimeShort(eMin),
      startMinutes: sMin,
      endMinutes: eMin,
      activity: paharActivities[i + 4],
      isCurrent: isCur,
      progressPercent: Math.round(prog)
    };
    pahars.push(p);
    if (isCur) currentPahar = p;
  }

  const paharCapsuleText = currentPahar ? currentPahar.watchName : 'Pradosha Pahar (First Watch)';

  // Choghadiya (8 Day + 8 Night)
  const dayChoghadiyaList = DAY_CHOGHADIYA_ORDER[dayOfWeek];
  const nightChoghadiyaList = NIGHT_CHOGHADIYA_ORDER[dayOfWeek];
  const dayChoghadiya: ChoghadiyaSlot[] = [];
  const nightChoghadiya: ChoghadiyaSlot[] = [];
  let currentChoghadiya: ChoghadiyaSlot | null = null;

  for (let i = 0; i < 8; i++) {
    const cKey = dayChoghadiyaList[i];
    const meta = CHOGHADIYA_META[cKey];
    const sMin = sunTimes.sunriseMinutes + i * partLength;
    const eMin = sMin + partLength;
    const isCur = currentMinutes >= sMin && currentMinutes < eMin;
    const sStr = formatMinutesToTimeShort(sMin);
    const eStr = formatMinutesToTimeShort(eMin);
    
    let remSec = 0;
    if (isCur) {
      remSec = Math.max(0, Math.floor((eMin - currentMinutes) * 60));
    }
    const remMin = Math.floor(remSec / 60);
    const remS = remSec % 60;
    const remainingString = `${remMin}m ${pad2(remS)}s`;

    const slot: ChoghadiyaSlot = {
      name: cKey,
      displayName: `${cKey} Choghadiya`,
      devanagari: meta.devanagari,
      quality: meta.quality,
      nature: meta.nature,
      periodType: 'Day',
      planet: meta.planet,
      ruler: meta.ruler,
      startTime: sStr,
      endTime: eStr,
      startMinutes: sMin,
      endMinutes: eMin,
      windowString: `${sStr} — ${eStr}`,
      remainingString,
      remainingSeconds: remSec,
      isCurrent: isCur
    };
    dayChoghadiya.push(slot);
    if (isCur) currentChoghadiya = slot;
  }

  for (let i = 0; i < 8; i++) {
    const cKey = nightChoghadiyaList[i];
    const meta = CHOGHADIYA_META[cKey];
    const sMin = sunTimes.sunsetMinutes + i * nightPartLength;
    const eMin = sMin + nightPartLength;
    const adjCurNight = currentMinutes < sunTimes.sunriseMinutes ? currentMinutes + 1440 : currentMinutes;
    const isCur = adjCurNight >= sMin && adjCurNight < eMin;
    const sStr = formatMinutesToTimeShort(sMin);
    const eStr = formatMinutesToTimeShort(eMin);
    
    let remSec = 0;
    if (isCur) {
      const diffMin = eMin - adjCurNight;
      remSec = Math.max(0, Math.floor(diffMin * 60));
    }
    const remMin = Math.floor(remSec / 60);
    const remS = remSec % 60;
    const remainingString = `${remMin}m ${pad2(remS)}s`;

    const slot: ChoghadiyaSlot = {
      name: cKey,
      displayName: `${cKey} Choghadiya`,
      devanagari: meta.devanagari,
      quality: meta.quality,
      nature: meta.nature,
      periodType: 'Night',
      planet: meta.planet,
      ruler: meta.ruler,
      startTime: sStr,
      endTime: eStr,
      startMinutes: sMin,
      endMinutes: eMin,
      windowString: `${sStr} — ${eStr}`,
      remainingString,
      remainingSeconds: remSec,
      isCurrent: isCur
    };
    nightChoghadiya.push(slot);
    if (isCur && !currentChoghadiya) currentChoghadiya = slot;
  }

  if (!currentChoghadiya) {
    currentChoghadiya = nightChoghadiya[0] || dayChoghadiya[0];
  }

  // Moon Phase & Illumination
  const phaseAngle = (diff * Math.PI) / 180;
  const illumination = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);
  let moonPhaseName = 'Waxing Crescent';
  if (udayaTithiIndex === 15) moonPhaseName = 'Full Moon (Purnima)';
  else if (udayaTithiIndex === 30) moonPhaseName = 'New Moon (Amavasya)';
  else if (udayaTithiIndex < 8) moonPhaseName = 'Waxing Crescent (Shukla Paksha)';
  else if (udayaTithiIndex === 8) moonPhaseName = 'First Quarter';
  else if (udayaTithiIndex < 15) moonPhaseName = 'Waxing Gibbous';
  else if (udayaTithiIndex < 23) moonPhaseName = 'Waning Gibbous (Krishna Paksha)';
  else if (udayaTithiIndex === 23) moonPhaseName = 'Third Quarter';
  else moonPhaseName = 'Waning Crescent';

  // High-precision Moonrise and Moonset calculation
  const { moonrise, moonset } = calculateMoonTimes(targetDate, location.latitude, location.longitude, currentTz);

  // High-precision dynamic Vedic festival & observance assignment
  const todayFest = getFestivalForDate(targetDate, location);
  const upcomingFest = findUpcomingMajorFestival(targetDate, location);

  const todayFestival = {
    title: todayFest.name,
    description: todayFest.description,
    icon: todayFest.icon,
    isMajor: todayFest.isMajor,
    badge: todayFest.badge,
    shortName: todayFest.shortName,
    hindiName: todayFest.hindiName,
    briefRule: todayFest.briefRule,
    shastraReferences: todayFest.shastraReferences
  };

  const upcomingFestival = {
    badge: upcomingFest.badge,
    title: upcomingFest.name,
    description: `${upcomingFest.dateFormatted} • ${upcomingFest.description.split(' • ').slice(1).join(' • ') || upcomingFest.description}`,
    icon: upcomingFest.icon,
    isMajor: upcomingFest.isMajor,
    dateFormatted: upcomingFest.dateFormatted,
    dayOfWeek: upcomingFest.dayOfWeek,
    daysRemaining: upcomingFest.daysRemaining,
    daysText: upcomingFest.daysText,
    shortName: upcomingFest.shortName,
    hindiName: upcomingFest.hindiName,
    briefRule: upcomingFest.briefRule,
    shastraReferences: upcomingFest.shastraReferences
  };

  return {
    date: targetDate,
    dateString: targetDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    dayOfWeekName: vaar.name,
    location,
    timeFormatted: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    tithi: {
      index: udayaTithiObj.index,
      name: udayaTithiObj.name,
      pureName: udayaTithiObj.pureName,
      paksha: udayaTithiObj.paksha,
      deity: udayaTithiObj.deity,
      completionPercent: Math.round((1 - tithiProgress) * 100),
      endTime: tithiEndTimeFormatted,
      isUdayaTithi: true,
      udayaTithiName: udayaTithiObj.name
    },
    nakshatra: {
      index: nakshatraIndex + 1,
      name: nakshatra.name,
      devanagari: nakshatra.devanagari,
      lord: nakshatra.lord,
      deity: nakshatra.deity,
      symbol: nakshatra.symbol,
      pada: nakPada,
      completionPercent: Math.round((1 - nakshatraProgress) * 100),
      endTime: (() => {
        const nakEndUtc = findNakshatraEndTime(sunTimes.sunriseDate, nakshatraIndex);
        if (nakEndUtc) {
          return formatUtcDateToLocalTime(nakEndUtc, currentTz);
        }
        return formatMinutesToTime(currentMinutes + (1 - nakshatraProgress) * 791);
      })()
    },
    yoga: {
      index: yogaIndex + 1,
      name: yoga.name,
      nature: yoga.nature,
      meaning: yoga.meaning,
      completionPercent: Math.round((1 - yogaProgress) * 100)
    },
    karana: {
      index: karanaIndex,
      name: karanaObj.name,
      type: karanaObj.type,
      lord: karanaObj.lord,
      auspicious: karanaObj.auspicious
    },
    vaar: {
      name: vaar.name,
      devanagari: vaar.devanagari,
      lord: vaar.lord
    },
    sunrise: formatMinutesToTimeShort(sunTimes.sunriseMinutes),
    sunset: formatMinutesToTimeShort(sunTimes.sunsetMinutes),
    solarNoon: formatMinutesToTimeShort(sunTimes.solarNoonMinutes),
    dayLength: `${Math.floor(sunTimes.dayLengthMinutes / 60)}h ${Math.floor(sunTimes.dayLengthMinutes % 60)}m`,
    nightLength: `${Math.floor(sunTimes.nightLengthMinutes / 60)}h ${Math.floor(sunTimes.nightLengthMinutes % 60)}m`,
    sunriseDate: sunTimes.sunriseDate,
    sunsetDate: sunTimes.sunsetDate,
    moonrise,
    moonset,
    moonPhaseName,
    moonIlluminationPercent: illumination,
    suryaRashi: {
      name: RASHIS[suryaRashiIndex].name,
      devanagari: RASHIS[suryaRashiIndex].devanagari,
      degree: `${suryaRashiDeg}°`
    },
    chandraRashi: {
      name: RASHIS[chandraRashiIndex].name,
      devanagari: RASHIS[chandraRashiIndex].devanagari,
      degree: `${chandraRashiDeg}°`
    },
    ayanamsaDegree: `${ayanamsha.toFixed(4)}° (Lahiri Nirayana)`,
    vikramSamvat,
    shakaSamvat,
    kaliYugaYear,
    samvatsaraName,
    hinduMonth: amantaMonth,
    masaDisplay,
    ritu: `${ritu.name} (${ritu.devanagari})`,
    ayana,
    ishtaKaal: {
      ghati,
      pala,
      vipala,
      formatted: ghatiFormatted,
      ghatiFormatted
    },
    muhurats: {
      brahmaMuhurat: { start: formatMinutesToTimeShort(brahmaStart), end: formatMinutesToTimeShort(brahmaEnd), status: 'Shubh' },
      abhijitMuhurat: { start: formatMinutesToTimeShort(abhijitStart), end: formatMinutesToTimeShort(abhijitEnd), status: 'Shubh' },
      amritKaal: { start: formatMinutesToTimeShort(amritStart), end: formatMinutesToTimeShort(amritEnd), status: 'Shubh' },
      vijayaMuhurat: { start: formatMinutesToTimeShort(vijayaStart), end: formatMinutesToTimeShort(vijayaEnd), status: 'Shubh' },
      godhuliMuhurat: { start: formatMinutesToTimeShort(godhuliStart), end: formatMinutesToTimeShort(godhuliEnd), status: 'Shubh' },
      sayahnaSandhya: { start: formatMinutesToTimeShort(sunTimes.sunsetMinutes - 24), end: formatMinutesToTimeShort(sunTimes.sunsetMinutes + 24), status: 'Shubh' },
      rahuKaal: { start: formatMinutesToTimeShort(rahuStart), end: formatMinutesToTimeShort(rahuEnd), status: 'Ashubh' },
      yamaganda: { start: formatMinutesToTimeShort(yamaStart), end: formatMinutesToTimeShort(yamaEnd), status: 'Ashubh' },
      gulikaKaal: { start: formatMinutesToTimeShort(gulikaStart), end: formatMinutesToTimeShort(gulikaEnd), status: 'Neutral' },
      durMuhurat: (() => {
        const DUR_MUHURAT_TABLE: number[][] = [
          [14, 15],       // Sunday: 14th Muhurat (Aryama/Godhuli)
          [8, 9],         // Monday: 8th & 9th Muhurat
          [4, 5],         // Tuesday: 4th & 11th Muhurat
          [8, 9],         // Wednesday: 8th Muhurat
          [6, 7],         // Thursday: 6th & 7th Muhurat
          [4, 5],         // Friday: 4th & 9th Muhurat
          [1, 2],         // Saturday: 1st & 2nd Muhurat
        ];
        const slots = DUR_MUHURAT_TABLE[dayOfWeek] || [1, 2];
        return {
          start: formatMinutesToTimeShort(sunTimes.sunriseMinutes + (slots[0] - 1) * daySlot),
          end: formatMinutesToTimeShort(sunTimes.sunriseMinutes + slots[1] * daySlot),
          status: 'Ashubh' as const
        };
      })(),
      varjyam: (() => {
        const VARJYAM_GHATI: number[] = [
          50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 20, 24, 20, 10, 10, 18, 16, 24, 30
        ];
        const varjGhati = VARJYAM_GHATI[nakshatraIndex % 27] || 20;
        const varjStart = sunTimes.sunriseMinutes + (varjGhati * 24) % 1440;
        const varjEnd = varjStart + (4 * 24); // 4 Ghatis = 96 minutes
        return {
          start: formatMinutesToTimeShort(varjStart),
          end: formatMinutesToTimeShort(varjEnd),
          status: 'Ashubh' as const
        };
      })()
    },
    dayChoghadiya,
    nightChoghadiya,
    currentChoghadiya,
    pahars,
    currentPahar,
    paharCapsuleText,
    todayFestival,
    upcomingFestival,
    festivals: [todayFestival.title, upcomingFestival.title]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY VEDIC CALENDAR DATA GENERATOR (ACCURATE FOR EVERY DAY OF THE MONTH)
// ─────────────────────────────────────────────────────────────────────────────
export function getMonthVedicCalendar(year: number, month: number, location: LocationCoordinates): MonthCalendarDay[] {
  const days: MonthCalendarDay[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDateNum = today.getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const targetDate = new Date(year, month, d, 6, 0, 0);
    const tz = resolveTimezoneOffset(targetDate, location);
    const sunTimes = calculateSunTimes(targetDate, location.latitude, location.longitude, tz);
    
    // Udaya Tithi at local sunrise
    const sunriseJd = getJulianDay(sunTimes.sunriseDate);
    const sunriseElongation = getElongationAngle(sunriseJd);
    const udayaTithiIndex = Math.floor(sunriseElongation / 12) + 1; // 1 to 30
    const tithiObj = TITHIS[(udayaTithiIndex - 1) % 30];
    
    // Tithi End Time
    const endTimeUtc = findTithiEndTime(sunTimes.sunriseDate, udayaTithiIndex, tz);
    let endStr = 'Full Day';
    if (endTimeUtc) {
      const endLocalMs = endTimeUtc.getTime() + tz * 3600000;
      const endDay = new Date(endLocalMs).getUTCDate();
      const timeStr = formatUtcDateToLocalTime(endTimeUtc, tz);
      endStr = endDay === d ? timeStr : `Next day ${timeStr}`;
    }

    // Nakshatra at sunrise
    const ayanamsha = getLahiriAyanamsha(sunriseJd);
    const moonTropical = getMoonLongitude(sunriseJd);
    const moonSidereal = normalizeDeg(moonTropical - ayanamsha);
    const nakshatraDeg = 360 / 27;
    const nakIndex = Math.floor(moonSidereal / nakshatraDeg);
    const nakshatraObj = NAKSHATRAS[nakIndex % 27];

    // Yoga at sunrise
    const sunTropical = getSunLongitude(sunriseJd);
    const sunSidereal = normalizeDeg(sunTropical - ayanamsha);
    const yogaSum = normalizeDeg(sunSidereal + moonSidereal);
    const yogaIndex = Math.floor(yogaSum / nakshatraDeg);
    const yogaObj = YOGAS[yogaIndex % 27];

    // Karana at sunrise
    const diff = normalizeDeg(moonTropical - sunTropical);
    const karanaIndex = Math.floor(diff / 6) + 1;
    let karanaObj;
    if (karanaIndex === 1) {
      karanaObj = KARANAS[10];
    } else if (karanaIndex >= 58) {
      if (karanaIndex === 58) karanaObj = KARANAS[7];
      else if (karanaIndex === 59) karanaObj = KARANAS[8];
      else karanaObj = KARANAS[9];
    } else {
      const mIndex = (karanaIndex - 2) % 7;
      karanaObj = KARANAS[mIndex];
    }

    // Special Tithi markers
    const isPurnima = udayaTithiIndex === 15;
    const isAmavasya = udayaTithiIndex === 30;
    const isEkadashi = udayaTithiIndex === 11 || udayaTithiIndex === 26;

    // High-precision dynamic Festival detector
    const dayFest = getFestivalForDate(targetDate, location);
    const festival = dayFest.name !== 'Nitya Panchang (नित्य पञ्चाङ्ग)' ? dayFest.name : undefined;

    days.push({
      dayNumber: d,
      date: targetDate,
      dateFormatted: targetDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      dayOfWeek: targetDate.toLocaleDateString('en-US', { weekday: 'long' }),
      dayOfWeekShort: targetDate.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: isCurrentMonth && d === todayDateNum,
      udayaTithi: {
        index: tithiObj.index,
        name: tithiObj.name,
        pureName: tithiObj.pureName,
        paksha: tithiObj.paksha,
        deity: tithiObj.deity,
        isPurnima,
        isAmavasya,
        isEkadashi,
      },
      tithiEndTime: endStr,
      tithiEndDate: endTimeUtc,
      nakshatra: {
        name: nakshatraObj.name,
        devanagari: nakshatraObj.devanagari,
        lord: nakshatraObj.lord,
      },
      yoga: {
        name: yogaObj.name,
        nature: yogaObj.nature,
      },
      karana: {
        name: karanaObj.name,
        auspicious: karanaObj.auspicious,
      },
      sunrise: formatMinutesToTimeShort(sunTimes.sunriseMinutes),
      sunset: formatMinutesToTimeShort(sunTimes.sunsetMinutes),
      festival,
    });
  }

  // Detect Kshaya (skipped) and Vriddhi (repeated) Tithis across the month
  for (let i = 0; i < days.length; i++) {
    if (i > 0) {
      const prevTithi = days[i - 1].udayaTithi.index;
      const currTithi = days[i].udayaTithi.index;
      if (currTithi === prevTithi) {
        days[i].udayaTithi.isVriddhiTithi = true;
      } else {
        const expected = (prevTithi % 30) + 1;
        if (currTithi !== expected) {
          days[i].udayaTithi.isKshayaTithi = true;
        }
      }
    }
  }

  return days;
}
