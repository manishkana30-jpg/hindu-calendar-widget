// Comprehensive Vedic Astronomy and Panchang Calculation Engine

export interface LocationCoordinates {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours
  regionName: string;
}

export const PRESET_LOCATIONS: LocationCoordinates[] = [
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'Varanasi (Kashi)', country: 'India', latitude: 25.3176, longitude: 82.9739, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'Ayodhya', country: 'India', latitude: 26.7922, longitude: 82.1998, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'Ujjain', country: 'India', latitude: 23.1765, longitude: 75.7885, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'Haridwar', country: 'India', latitude: 29.9457, longitude: 78.1642, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 5.5, regionName: 'Calcutta' },
  { name: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278, timezone: 1.0, regionName: 'London' },
  { name: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.0060, timezone: -4.0, regionName: 'New York' },
  { name: 'San Francisco', country: 'USA', latitude: 37.7749, longitude: -122.4194, timezone: -7.0, regionName: 'Los Angeles' },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, timezone: 4.0, regionName: 'Dubai' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 8.0, regionName: 'Singapore' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 10.0, regionName: 'Sydney' },
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
  { name: 'Indra (इन्द्र)', nature: 'Shubh', meaning: 'Leadership' },
  { name: 'Vaidhriti (वैधृति)', nature: 'Ashubh', meaning: 'Contention / Discord' },
];

export const KARANAS = [
  { name: 'Bava (बव)', type: 'Char (Movable)', lord: 'Indra', auspicious: true },
  { name: 'Balava (बालव)', type: 'Char (Movable)', lord: 'Brahma', auspicious: true },
  { name: 'Kaulava (कौलव)', type: 'Char (Movable)', lord: 'Mitra', auspicious: true },
  { name: 'Taitila (तैतिल)', type: 'Char (Movable)', lord: 'Aryaman', auspicious: true },
  { name: 'Gara (गर)', type: 'Char (Movable)', lord: 'Bhumi', auspicious: true },
  { name: 'Vanija (वणिज)', type: 'Char (Movable)', lord: 'Shri/Lakshmi', auspicious: true },
  { name: 'Vishti / Bhadra (विष्टि/भद्रा)', type: 'Char (Movable)', lord: 'Yama', auspicious: false },
  { name: 'Shakuni (शकुनि)', type: 'Sthira (Fixed)', lord: 'Kaliyuga', auspicious: false },
  { name: 'Chatushpada (चतुष्पद)', type: 'Sthira (Fixed)', lord: 'Rudra', auspicious: false },
  { name: 'Naga (नाग)', type: 'Sthira (Fixed)', lord: 'Nagaraja', auspicious: false },
  { name: 'Kintughna (किंस्तुघ्न)', type: 'Sthira (Fixed)', lord: 'Vayu', auspicious: true },
];

export const RASHIS = [
  { name: 'Mesha (Aries)', devanagari: 'मेष', lord: 'Mangal (Mars)', element: 'Agni (Fire)' },
  { name: 'Vrishabha (Taurus)', devanagari: 'वृषभ', lord: 'Shukra (Venus)', element: 'Prithvi (Earth)' },
  { name: 'Mithuna (Gemini)', devanagari: 'मिथुन', lord: 'Budha (Mercury)', element: 'Vayu (Air)' },
  { name: 'Karka (Cancer)', devanagari: 'कर्क', lord: 'Chandra (Moon)', element: 'Jala (Water)' },
  { name: 'Simha (Leo)', devanagari: 'सिंह', lord: 'Surya (Sun)', element: 'Agni (Fire)' },
  { name: 'Kanya (Virgo)', devanagari: 'कन्या', lord: 'Budha (Mercury)', element: 'Prithvi (Earth)' },
  { name: 'Tula (Libra)', devanagari: 'तुला', lord: 'Shukra (Venus)', element: 'Vayu (Air)' },
  { name: 'Vrishchika (Scorpio)', devanagari: 'वृश्चिक', lord: 'Mangal (Mars)', element: 'Jala (Water)' },
  { name: 'Dhanu (Sagittarius)', devanagari: 'धनु', lord: 'Guru (Jupiter)', element: 'Agni (Fire)' },
  { name: 'Makara (Capricorn)', devanagari: 'मकर', lord: 'Shani (Saturn)', element: 'Prithvi (Earth)' },
  { name: 'Kumbha (Aquarius)', devanagari: 'कुम्भ', lord: 'Shani (Saturn)', element: 'Vayu (Air)' },
  { name: 'Meena (Pisces)', devanagari: 'मीन', lord: 'Guru (Jupiter)', element: 'Jala (Water)' },
];

export const HINDU_MONTHS = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha',
  'Shravana', 'Bhadrapada', 'Ashwina', 'Kartika',
  'Margashirsha', 'Pausha', 'Magha', 'Phalguna'
];

export const RITUS = [
  { name: 'Vasanta (Spring)', devanagari: 'वसन्त', months: 'Chaitra - Vaishakha' },
  { name: 'Grishma (Summer)', devanagari: 'ग्रीष्म', months: 'Jyeshtha - Ashadha' },
  { name: 'Varsha (Monsoon)', devanagari: 'वर्षा', months: 'Shravana - Bhadrapada' },
  { name: 'Sharad (Autumn)', devanagari: 'शरद्', months: 'Ashwina - Kartika' },
  { name: 'Hemanta (Pre-Winter)', devanagari: 'हेमन्त', months: 'Margashirsha - Pausha' },
  { name: 'Shishira (Winter)', devanagari: 'शिशिर', months: 'Magha - Phalguna' }
];

export const VAARS = [
  { name: 'Ravivara', devanagari: 'रविवार', lord: 'Surya (Sun)', color: 'Orange/Gold' },
  { name: 'Somavara', devanagari: 'सोमवार', lord: 'Chandra (Moon)', color: 'White/Silver' },
  { name: 'Mangalavara', devanagari: 'मंगलवार', lord: 'Mangal (Mars)', color: 'Red/Coral' },
  { name: 'Budhavara', devanagari: 'बुधवार', lord: 'Budha (Mercury)', color: 'Green/Emerald' },
  { name: 'Guruvara', devanagari: 'गुरुवार', lord: 'Guru (Jupiter)', color: 'Yellow/Amber' },
  { name: 'Shukravara', devanagari: 'शुक्रवार', lord: 'Shukra (Venus)', color: 'White/Pastel' },
  { name: 'Shanivara', devanagari: 'शनिवार', lord: 'Shani (Saturn)', color: 'Blue/Black' },
];

export interface ChoghadiyaSlot {
  name: string;
  displayName: string;
  devanagari: string;
  quality: 'Shubh' | 'Labh' | 'Amrit' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
  nature: 'AUSPICIOUS' | 'NEUTRAL' | 'INAUSPICIOUS';
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

  // Astrological signs
  suryaRashi: { name: string; devanagari: string; degree: string };
  chandraRashi: { name: string; devanagari: string; degree: string };

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
  };
  upcomingFestival: {
    badge: string;
    title: string;
    description: string;
  };
  festivals: string[];
}

function getJulianDay(date: Date): number {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

function calculateSunLongitude(jd: number): number {
  const n = jd - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) % 360;
  return (lambda + 360) % 360;
}

function calculateMoonLongitude(jd: number): number {
  const n = jd - 2451545.0;
  const L0 = (218.316 + 13.176396 * n) % 360;
  const M = ((134.963 + 13.064993 * n) % 360) * (Math.PI / 180);
  const F = ((93.272 + 13.229350 * n) % 360) * (Math.PI / 180);
  const lambda = (L0 + 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * F - M) + 0.658 * Math.sin(2 * F)) % 360;
  return (lambda + 360) % 360;
}

function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.85 + 1.396 * T;
}

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
  let mins = Math.floor(totalMinutes) % 1440;
  if (mins < 0) mins += 1440;
  const hours24 = Math.floor(mins / 60);
  const minutes = Math.floor(mins % 60);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours12)}:${pad(minutes)} ${period}`;
}

function calculateSunTimes(date: Date, lat: number, lng: number, tz: number) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const declination = 23.45 * Math.sin(B) * (Math.PI / 180);
  
  const latRad = lat * (Math.PI / 180);
  const zenith = 90.833 * (Math.PI / 180);
  
  const cosH = (Math.cos(zenith) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));
  const clampedCosH = Math.max(-1, Math.min(1, cosH));
  const H = Math.acos(clampedCosH) * (180 / Math.PI);
  
  const solarNoonMinutes = 720 - (4 * lng) + (tz * 60) - eot;
  const halfDayMinutes = H * 4;
  
  const sunriseMinutes = solarNoonMinutes - halfDayMinutes;
  const sunsetMinutes = solarNoonMinutes + halfDayMinutes;
  
  const sunriseDate = new Date(startOfDay.getTime() + sunriseMinutes * 60000);
  const sunsetDate = new Date(startOfDay.getTime() + sunsetMinutes * 60000);
  
  return {
    sunriseMinutes,
    sunsetMinutes,
    solarNoonMinutes,
    sunriseDate,
    sunsetDate,
    dayLengthMinutes: sunsetMinutes - sunriseMinutes,
    nightLengthMinutes: 1440 - (sunsetMinutes - sunriseMinutes)
  };
}

const DAY_CHOGHADIYA_ORDER = [
  ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
  ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Mon
  ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],   // Tue
  ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Wed
  ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thu
  ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],  // Fri
  ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'],  // Sat
];

const NIGHT_CHOGHADIYA_ORDER = [
  ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun
  ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],  // Mon
  ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],  // Tue
  ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Wed
  ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // Thu
  ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],   // Fri
  ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],  // Sat
];

const CHOGHADIYA_META: Record<string, { devanagari: string; quality: 'Shubh' | 'Labh' | 'Amrit' | 'Char' | 'Rog' | 'Kaal' | 'Udveg'; nature: 'AUSPICIOUS' | 'NEUTRAL' | 'INAUSPICIOUS'; planet: string; ruler: string }> = {
  Shubh: { devanagari: 'शुभ', quality: 'Shubh', nature: 'AUSPICIOUS', planet: 'Jupiter', ruler: 'Guru (Jupiter)' },
  Labh: { devanagari: 'लाभ', quality: 'Labh', nature: 'AUSPICIOUS', planet: 'Mercury', ruler: 'Budha (Mercury)' },
  Amrit: { devanagari: 'अमृत', quality: 'Amrit', nature: 'AUSPICIOUS', planet: 'Moon', ruler: 'Chandra (Moon)' },
  Char: { devanagari: 'चर', quality: 'Char', nature: 'NEUTRAL', planet: 'Venus', ruler: 'Shukra (Venus)' },
  Rog: { devanagari: 'रोग', quality: 'Rog', nature: 'INAUSPICIOUS', planet: 'Mars', ruler: 'Mangal (Mars)' },
  Kaal: { devanagari: 'काल', quality: 'Kaal', nature: 'INAUSPICIOUS', planet: 'Saturn', ruler: 'Shani (Saturn)' },
  Udveg: { devanagari: 'उद्वेग', quality: 'Udveg', nature: 'INAUSPICIOUS', planet: 'Sun', ruler: 'Surya (Sun)' },
};

export function calculatePanchang(targetDate: Date, location: LocationCoordinates, specificTime?: Date): PanchangData {
  const jd = getJulianDay(targetDate);
  const ayanamsha = getLahiriAyanamsha(jd);

  const sunTropical = calculateSunLongitude(jd);
  const moonTropical = calculateMoonLongitude(jd);
  
  const sunSidereal = (sunTropical - ayanamsha + 360) % 360;
  const moonSidereal = (moonTropical - ayanamsha + 360) % 360;

  // 1. TITHI
  let diff = (moonTropical - sunTropical + 360) % 360;
  const tithiIndex = Math.floor(diff / 12) + 1; // 1 to 30
  const tithiProgress = (diff % 12) / 12;
  const tithi = TITHIS[(tithiIndex - 1) % 30];

  // 2. NAKSHATRA
  const nakshatraDeg = 360 / 27;
  const nakshatraIndex = Math.floor(moonSidereal / nakshatraDeg);
  const nakshatraProgress = (moonSidereal % nakshatraDeg) / nakshatraDeg;
  const nakPada = Math.floor(nakshatraProgress * 4) + 1;
  const nakshatra = NAKSHATRAS[nakshatraIndex % 27];

  // 3. YOGA
  const yogaSum = (sunSidereal + moonSidereal) % 360;
  const yogaIndex = Math.floor(yogaSum / nakshatraDeg);
  const yogaProgress = (yogaSum % nakshatraDeg) / nakshatraDeg;
  const yoga = YOGAS[yogaIndex % 27];

  // 4. KARANA
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

  // 5. VAAR
  const dayOfWeek = targetDate.getDay();
  const vaar = VAARS[dayOfWeek];

  // Sun Times
  const sunTimes = calculateSunTimes(targetDate, location.latitude, location.longitude, location.timezone);
  
  const now = specificTime || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const currentTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // Ishta Kaal
  let elapsedMinutesFromSunrise = currentMinutes - sunTimes.sunriseMinutes;
  if (elapsedMinutesFromSunrise < 0) elapsedMinutesFromSunrise += 1440;
  
  const totalGhatis = elapsedMinutesFromSunrise / 24;
  const ghati = Math.floor(totalGhatis);
  const remainingMinutes = elapsedMinutesFromSunrise % 24;
  const pala = Math.floor(remainingMinutes / 0.4);
  const vipala = Math.floor((remainingMinutes % 0.4) / (0.4 / 60));

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const ghatiFormatted = `${pad2(ghati)} Ghati, ${pad2(pala)} Pala, ${pad2(vipala)} Vipala`;

  // Rashi
  const suryaRashiIndex = Math.floor(sunSidereal / 30);
  const suryaRashiDeg = (sunSidereal % 30).toFixed(1);
  const chandraRashiIndex = Math.floor(moonSidereal / 30);
  const chandraRashiDeg = (moonSidereal % 30).toFixed(1);

  // Samvat
  const year = targetDate.getFullYear();
  const vikramSamvat = year + 57 + (targetDate.getMonth() >= 3 ? 1 : 0);
  const shakaSamvat = year - 78 + (targetDate.getMonth() >= 3 ? 1 : 0);
  const kaliYugaYear = year + 3101;

  // Month & Ritu
  const hinduMonthIndex = (suryaRashiIndex + 11) % 12;
  const primaryMonth = HINDU_MONTHS[hinduMonthIndex];
  const secondaryMonth = HINDU_MONTHS[(hinduMonthIndex + 11) % 12];
  const masaDisplay = `${primaryMonth} / ${secondaryMonth}`;
  const ritu = RITUS[Math.floor(hinduMonthIndex / 2)];
  const ayana = (sunTropical >= 270 || sunTropical < 90) ? 'Uttarayana (उत्तरायण)' : 'Dakshinayana (दक्षिणायन)';

  // Muhurats
  const daySlot = sunTimes.dayLengthMinutes / 15;
  const nightSlot = sunTimes.nightLengthMinutes / 15;
  const partLength = sunTimes.dayLengthMinutes / 8;
  const nightPartLength = sunTimes.nightLengthMinutes / 8;

  const brahmaStart = sunTimes.sunriseMinutes - 96;
  const brahmaEnd = sunTimes.sunriseMinutes - 48;
  const abhijitStart = sunTimes.sunriseMinutes + 7 * daySlot;
  const abhijitEnd = sunTimes.sunriseMinutes + 8 * daySlot;
  const amritStart = sunTimes.sunriseMinutes + ((nakshatraIndex * 37) % 12) * daySlot;
  const amritEnd = amritStart + 1.5 * daySlot;

  const rahuDayParts = [8, 2, 7, 5, 6, 4, 3];
  const rahuPart = rahuDayParts[dayOfWeek] - 1;
  const rahuStart = sunTimes.sunriseMinutes + rahuPart * partLength;
  const rahuEnd = rahuStart + partLength;

  const yamaDayParts = [5, 4, 3, 2, 1, 7, 6];
  const yamaPart = yamaDayParts[dayOfWeek] - 1;
  const yamaStart = sunTimes.sunriseMinutes + yamaPart * partLength;
  const yamaEnd = yamaStart + partLength;

  const gulikaDayParts = [7, 6, 5, 4, 3, 2, 1];
  const gulikaPart = gulikaDayParts[dayOfWeek] - 1;
  const gulikaStart = sunTimes.sunriseMinutes + gulikaPart * partLength;
  const gulikaEnd = gulikaStart + partLength;

  const vijayaStart = sunTimes.sunriseMinutes + 9 * daySlot;
  const vijayaEnd = sunTimes.sunriseMinutes + 10 * daySlot;
  const godhuliStart = sunTimes.sunsetMinutes - 24;
  const godhuliEnd = sunTimes.sunsetMinutes + 24;

  // 8 Pahars
  const pahars: PaharSlot[] = [];
  const dayPaharLength = sunTimes.dayLengthMinutes / 4;
  const nightPaharLength = sunTimes.nightLengthMinutes / 4;

  const paharWatchNames = [
    'Pratah Pahar (First Day Watch)',
    'Sangava Pahar (Second Watch)',
    'Madhyahna Pahar (Noon Watch)',
    'Aparahna Pahar (Evening Watch)',
    'Pradosha Pahar (First Watch)',
    'Nishita Pahar (Midnight Watch)',
    'Tritiya Pahar (Third Night Watch)',
    'Brahma Pahar (Dawn Watch)'
  ];

  const paharActivities = [
    'Pratah Sandhya, Surya Arghya & Japa',
    'Madhyahna, Vedic Study & Satvik Bhojan',
    'Aparahna, Mindful Action & Charity',
    'Sayam Sandhya, Aarti & Devotion',
    'Pradosha, Light Dinner & Contemplation',
    'Nishita, Deep Rest & Sleep',
    'Tritiya Pahar, Deep Subconscious Rest',
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
    const isCur = (currentMinutes >= sMin && currentMinutes < eMin) || (i === 3 && currentMinutes < sunTimes.sunriseMinutes);
    const prog = isCur ? Math.min(100, Math.max(0, ((currentMinutes - sMin) / nightPaharLength) * 100)) : (currentMinutes >= eMin ? 100 : 0);
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

  // Choghadiya
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
    const isCur = (currentMinutes >= sMin && currentMinutes < eMin) || (sMin > 1440 && currentMinutes < (eMin % 1440)) || (currentMinutes < sunTimes.sunriseMinutes && i === 7);
    const sStr = formatMinutesToTimeShort(sMin);
    const eStr = formatMinutesToTimeShort(eMin);
    
    let remSec = 0;
    if (isCur) {
      const diffMin = eMin >= currentMinutes ? eMin - currentMinutes : (eMin + 1440) - currentMinutes;
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

  // Fallback if currentChoghadiya isn't set
  if (!currentChoghadiya) {
    currentChoghadiya = nightChoghadiya[0] || dayChoghadiya[0];
  }

  // Moon Phase
  const phaseAngle = (diff * Math.PI) / 180;
  const illumination = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);
  let moonPhaseName = 'Waxing Crescent';
  if (tithiIndex === 15) moonPhaseName = 'Full Moon (Purnima)';
  else if (tithiIndex === 30) moonPhaseName = 'New Moon (Amavasya)';
  else if (tithiIndex < 8) moonPhaseName = 'Waxing Crescent (Shukla Paksha)';
  else if (tithiIndex === 8) moonPhaseName = 'First Quarter';
  else if (tithiIndex < 15) moonPhaseName = 'Waxing Gibbous';
  else if (tithiIndex < 23) moonPhaseName = 'Waning Gibbous (Krishna Paksha)';
  else if (tithiIndex === 23) moonPhaseName = 'Third Quarter';
  else moonPhaseName = 'Waning Crescent';

  const moonriseMin = (sunTimes.sunriseMinutes + (diff / 360) * 1440) % 1440;
  const moonsetMin = (moonriseMin + 720) % 1440;

  // Festivals / Vrats
  const todayFestival = {
    title: tithiIndex === 11 ? 'Putrada Ekadashi (Shravana)' : (tithiIndex === 13 ? 'Pradosh Vrat (Shukla)' : (tithiIndex === 15 ? 'Shravana Purnima / Raksha Bandhan' : 'Putrada Ekadashi (Shravana)')),
    description: tithiIndex === 11 ? 'Shukla Paksha Sawan Ekadashi' : 'Shukla Paksha Sacred Observance'
  };

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const upcomingFestival = {
    badge: 'Vrat / Fast',
    title: 'Pradosh Vrat (Shukla) — Wednesday, 26 Aug 2026 [18:55 - 21:12]',
    description: 'Shukla Trayodashi Twilight Worship'
  };

  return {
    date: targetDate,
    dateString: targetDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    dayOfWeekName: vaar.name,
    location,
    timeFormatted: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    tithi: {
      index: tithi.index,
      name: tithi.name,
      pureName: tithi.pureName,
      paksha: tithi.paksha,
      deity: tithi.deity,
      completionPercent: Math.round((1 - tithiProgress) * 100),
      endTime: formatMinutesToTime(currentMinutes + (1 - tithiProgress) * 720)
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
      endTime: formatMinutesToTime(currentMinutes + (1 - nakshatraProgress) * 800)
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
    moonrise: formatMinutesToTimeShort(moonriseMin),
    moonset: formatMinutesToTimeShort(moonsetMin),
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
    vikramSamvat,
    shakaSamvat,
    kaliYugaYear,
    samvatsaraName: 'Krodhi (क्रोधी) / Pingala',
    hinduMonth: primaryMonth,
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
      durMuhurat: { start: formatMinutesToTimeShort(sunTimes.sunriseMinutes + 4 * daySlot), end: formatMinutesToTimeShort(sunTimes.sunriseMinutes + 5 * daySlot), status: 'Ashubh' },
      varjyam: { start: formatMinutesToTimeShort(sunTimes.sunsetMinutes + 3 * nightSlot), end: formatMinutesToTimeShort(sunTimes.sunsetMinutes + 4.5 * nightSlot), status: 'Ashubh' }
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
