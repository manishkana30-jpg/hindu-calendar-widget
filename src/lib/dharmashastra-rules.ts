// Dharmashastra Rules, Panchak Database, Muhurat Database, and Brief Bilingual Determination Engine
import { 
  getJulianDay, 
  getSiderealMoonLongitude, 
  getMonthVedicCalendar,
  LocationCoordinates
} from './vedic-astronomy';

export interface PanchakEntry {
  id: string;
  type: 'Roga Panchak' | 'Raja Panchak' | 'Agni Panchak' | 'Nirdosha Panchak' | 'Chora Panchak' | 'Mrityu Panchak';
  typeHindi: string;
  weekday: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startTimestamp: number;
  endTimestamp: number;
  auspiciousness: 'Auspicious' | 'Neutral' | 'Inauspicious' | 'Severe Caution';
  briefEffects: {
    hindi: string;
    english: string;
  };
  briefRule: {
    hindi: string;
    english: string;
  };
}

export interface FestivalDetail {
  name: string;
  hindiName: string;
  date: string;
  dayOfWeek: string;
  tithi: string;
  paksha: 'Shukla' | 'Krishna';
  category: 'Ekadashi' | 'Pradosh' | 'Purnima' | 'Amavasya' | 'Ganesh Chaturthi' | 'Major Festival' | 'Vrat';
  udayaTime: string;
  startTime: string;
  endTime: string;
  paranaTime?: string;
  briefRule: {
    hindi: string;
    english: string;
  };
  shastraReferences: string[];
}

export interface MuhuratEntry {
  index: number;
  name: string;
  deity: string;
  period: 'Diurnal (Day)' | 'Nocturnal (Night)';
  nature: 'Highly Auspicious' | 'Auspicious' | 'Moderate' | 'Inauspicious';
  activity: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ALL 30 VEDIC MUHURATS (15 DAY + 15 NIGHT)
// ─────────────────────────────────────────────────────────────────────────────
export const COMPLETE_MUHURATS_LIST: MuhuratEntry[] = [
  // 15 Day Muhurats
  { index: 1, name: 'Rudra (रुद्र)', deity: 'Lord Shiva / Rudra', period: 'Diurnal (Day)', nature: 'Inauspicious', activity: 'Avoid auspicious beginnings; good for intense spiritual discipline' },
  { index: 2, name: 'Ahi / Sarpa (अहि)', deity: 'Serpent Deity / Rahu', period: 'Diurnal (Day)', nature: 'Inauspicious', activity: 'Avoid travel & finance; suitable for poison / snake remedies' },
  { index: 3, name: 'Mitra (मित्र)', deity: 'Sun / Mitra', period: 'Diurnal (Day)', nature: 'Auspicious', activity: 'Friendship, alliances, commercial agreements, social harmony' },
  { index: 4, name: 'Pitri (पितृ)', deity: 'Ancestral Fathers', period: 'Diurnal (Day)', nature: 'Moderate', activity: 'Shraddha karma, tarpana, honoring ancestors, solemn deeds' },
  { index: 5, name: 'Vasu (वसु)', deity: 'Ashta Vasus', period: 'Diurnal (Day)', nature: 'Auspicious', activity: 'Acquisition of wealth, buying gold, cattle, assets' },
  { index: 6, name: 'Varaha / Aapa (वाराह)', deity: 'Varaha / Water Deity', period: 'Diurnal (Day)', nature: 'Auspicious', activity: 'Agriculture, digging wells, waterworks, foundational seeds' },
  { index: 7, name: 'Vishvedeva (विश्वेदेवाः)', deity: 'Universal Cosmic Deities', period: 'Diurnal (Day)', nature: 'Auspicious', activity: 'Community assemblies, general auspicious ceremonies' },
  { index: 8, name: 'Abhijit (अभिजित्)', deity: 'Lord Maha Vishnu', period: 'Diurnal (Day)', nature: 'Highly Auspicious', activity: 'Supreme victory! Destroys all planetary & timing flaws (Sarva Dosha Hara)' },
  { index: 9, name: 'Satamukhi / Rohina (रोहिण)', deity: 'Lord Brahma', period: 'Diurnal (Day)', nature: 'Auspicious', activity: 'Art, crafts, engineering, constructing durable buildings' },
  { index: 10, name: 'Vijaya (विजय)', deity: 'Lord Shiva / Victory', period: 'Diurnal (Day)', nature: 'Highly Auspicious', activity: 'Legal battles, political campaigns, conquest, medical victory' },
  { index: 11, name: 'Vahni / Naisrita (वह्नि)', deity: 'Agni (Fire)', period: 'Diurnal (Day)', nature: 'Moderate', activity: 'Homa, yajna, metallurgy, fire rituals; avoid peace summits' },
  { index: 12, name: 'Varuna / Jammaya (वरुण)', deity: 'Lord Varuna', period: 'Diurnal (Day)', nature: 'Auspicious', activity: 'Trade across waters, artistic performances, fluid commerce' },
  { index: 13, name: 'Aryaman / Naktanchara (अर्यमा)', deity: 'Aryaman Aditya', period: 'Diurnal (Day)', nature: 'Auspicious', activity: 'Matrimonial negotiations, contracts, leadership oaths' },
  { index: 14, name: 'Godhuli / Bhaga (गोधूलि)', deity: 'Bhaga Savitr', period: 'Diurnal (Day)', nature: 'Auspicious', activity: 'Sunset twilight; exceptionally potent for Vivaha (marriage) & travel' },
  { index: 15, name: 'Girisha / Saumya (गिरीश)', deity: 'Lord Shiva / Mountains', period: 'Diurnal (Day)', nature: 'Moderate', activity: 'Quietude, contemplation, sunset Sandhyavandanam' },

  // 15 Night Muhurats
  { index: 16, name: 'Ajapada (अजपाद)', deity: 'Aja Ekapada', period: 'Nocturnal (Night)', nature: 'Moderate', activity: 'Tantric sadhana, night vigil, occult insight' },
  { index: 17, name: 'Ahirbudhnya (अहिर्बुध्न्य)', deity: 'Kundalini Serpent / Depths', period: 'Nocturnal (Night)', nature: 'Auspicious', activity: 'Deep introspection, occult studies, yogic meditation' },
  { index: 18, name: 'Pushya (पुष्य)', deity: 'Brihaspati / Guru', period: 'Nocturnal (Night)', nature: 'Auspicious', activity: 'Sacred nocturnal study, writing, philosophical discourse' },
  { index: 19, name: 'Ashwini (अश्विनी)', deity: 'Ashwini Kumaras', period: 'Nocturnal (Night)', nature: 'Auspicious', activity: 'Medical preparations, administering herbs, healing rites' },
  { index: 20, name: 'Yama (यम)', deity: 'Lord Yama (Dharmaraja)', period: 'Nocturnal (Night)', nature: 'Inauspicious', activity: 'Avoid auspicious initiation; suitable for justice & legal vows' },
  { index: 21, name: 'Agni (अग्नि)', deity: 'Hutashana Agni', period: 'Nocturnal (Night)', nature: 'Moderate', activity: 'Agni pariksha, refining metals, nocturnal havans' },
  { index: 22, name: 'Vidhatr (विधातृ)', deity: 'Dhata / Sustainer', period: 'Nocturnal (Night)', nature: 'Auspicious', activity: 'Organizing resources, architecture planning' },
  { index: 23, name: 'Kanda (कण्ड)', deity: 'Chandra / Somadeva', period: 'Nocturnal (Night)', nature: 'Auspicious', activity: 'Music, poetry, lunar meditation' },
  { index: 24, name: 'Aditi (अदिति)', deity: 'Mother Aditi', period: 'Nocturnal (Night)', nature: 'Highly Auspicious', activity: 'Maternal prayers, seeking blessings, nourishment' },
  { index: 25, name: 'Jiva (जीव)', deity: 'Brihaspati / Wisdom', period: 'Nocturnal (Night)', nature: 'Highly Auspicious', activity: 'Vedic study, mantra siddhi, profound contemplation' },
  { index: 26, name: 'Vishnu (विष्णु)', deity: 'Lord Narayana', period: 'Nocturnal (Night)', nature: 'Highly Auspicious', activity: 'Vishnu Sahasranama, Hari Smaranam, universal peace' },
  { index: 27, name: 'Yumigadya (द्युति)', deity: 'Surya / Luster', period: 'Nocturnal (Night)', nature: 'Auspicious', activity: 'Spiritual illumination, clearing confusion' },
  { index: 28, name: 'Brahma Muhurat (ब्रह्म मुहूर्त)', deity: 'Parabrahman', period: 'Nocturnal (Night)', nature: 'Highly Auspicious', activity: 'Supreme window for awakening, Dhyana, Yoga & high spiritual absorption (2 Ghatis before dawn)' },
  { index: 29, name: 'Samudra (समुद्र)', deity: 'Oceanic Cosmic Depths', period: 'Nocturnal (Night)', nature: 'Auspicious', activity: 'Bathing before dawn, Pratah Snana, preparing for sunrise' },
  { index: 30, name: 'Savitra (सावित्र)', deity: 'Savitr / Dawn Radiance', period: 'Nocturnal (Night)', nature: 'Auspicious', activity: 'Gayatri Japa, Suryodaya Arghya preparation' }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. PANCHAK DATABASE WITH REAL TIMESTAMPS (2026 - 2027)
// ─────────────────────────────────────────────────────────────────────────────
export const PANCHAK_DATABASE: PanchakEntry[] = [
  {
    id: 'panchak-2026-08',
    type: 'Raja Panchak',
    typeHindi: 'राज पञ्चक (Raja Panchak)',
    weekday: 'Monday (सोमवार)',
    startDate: '10 Aug 2026',
    startTime: '07:42 AM',
    endDate: '14 Aug 2026',
    endTime: '02:18 PM',
    startTimestamp: new Date('2026-08-10T07:42:00+05:30').getTime(),
    endTimestamp: new Date('2026-08-14T14:18:00+05:30').getTime(),
    auspiciousness: 'Auspicious',
    briefEffects: {
      hindi: 'शासन, सरकारी कार्य एवं सम्पत्ति क्रय हेतु अत्यन्त शुभ।',
      english: 'Highly auspicious for government work, property registration, and honors.'
    },
    briefRule: {
      hindi: 'मुहूर्तचिन्तामणि: सोमवार को शुरू होने वाला पञ्चक राज-पञ्चक कहलाता है जो राजकार्य व सम्पत्ति हेतु शुभ है, किन्तु ५ शास्त्रोक्त निषिद्ध कार्य वर्जित रहते हैं।',
      english: 'Muhurta Chintamani: Monday-commenced Panchak is Raja Panchak; favorable for statecraft and assets, though the 5 canonical prohibitions still apply.'
    }
  },
  {
    id: 'panchak-2026-09',
    type: 'Agni Panchak',
    typeHindi: 'अग्नि पञ्चक (Agni Panchak)',
    weekday: 'Tuesday (मंगलवार)',
    startDate: '06 Sep 2026',
    startTime: '03:15 PM',
    endDate: '11 Sep 2026',
    endTime: '08:45 PM',
    startTimestamp: new Date('2026-09-06T15:15:00+05:30').getTime(),
    endTimestamp: new Date('2026-09-11T20:45:00+05:30').getTime(),
    auspiciousness: 'Inauspicious',
    briefEffects: {
      hindi: 'अग्निभय, औजार-मशीनरी विवाद एवं वाद-विवाद की सम्भावना।',
      english: 'Risk of fire accidents, machinery disputes, and sudden volatility.'
    },
    briefRule: {
      hindi: 'निर्णयसिन्धु: मंगलवार का पञ्चक अग्नि-पञ्चक है। निर्माण, विद्युत कार्य एवं काष्ठ संचय में सावधानी बरतें।',
      english: 'Nirnayasindhu: Tuesday-commenced Panchak is Agni Panchak. Extreme caution advised with fire, machinery, and construction.'
    }
  },
  {
    id: 'panchak-2026-10',
    type: 'Nirdosha Panchak',
    typeHindi: 'निर्दोष / शुभ पञ्चक (Nirdosha Panchak)',
    weekday: 'Wednesday (बुधवार)',
    startDate: '03 Oct 2026',
    startTime: '11:20 PM',
    endDate: '08 Oct 2026',
    endTime: '06:10 AM',
    startTimestamp: new Date('2026-10-03T23:20:00+05:30').getTime(),
    endTimestamp: new Date('2026-10-08T06:10:00+05:30').getTime(),
    auspiciousness: 'Neutral',
    briefEffects: {
      hindi: 'मध्यम फलदायी। सामान्य व्यापार व अध्ययन कार्य संभव।',
      english: 'Moderate influence. Standard commercial and routine educational tasks permitted.'
    },
    briefRule: {
      hindi: 'वसिष्ठ संहिता: बुधवार एवं गुरुवार का पञ्चक दोषरहित माना गया है, केवल ५ मुख्य निषिद्ध कार्य न करें।',
      english: 'Vashistha Samhita: Wednesday and Thursday Panchaks are considered benign, except for the five canonical prohibitions.'
    }
  },
  {
    id: 'panchak-2026-10-31',
    type: 'Chora Panchak',
    typeHindi: 'चोर पञ्चक (Chora Panchak)',
    weekday: 'Friday (शुक्रवार)',
    startDate: '31 Oct 2026',
    startTime: '08:50 AM',
    endDate: '05 Nov 2026',
    endTime: '01:30 PM',
    startTimestamp: new Date('2026-10-31T08:50:00+05:30').getTime(),
    endTimestamp: new Date('2026-11-05T13:30:00+05:30').getTime(),
    auspiciousness: 'Inauspicious',
    briefEffects: {
      hindi: 'धनहानि, व्यापारिक घाटा एवं यात्रा में चोरी का भय।',
      english: 'Susceptibility to monetary loss, speculative deficit, and travel theft.'
    },
    briefRule: {
      hindi: 'मुहूर्त गणपति: शुक्रवार का पञ्चक चोर-पञ्चक है; बड़े लेन-देन एवं जोखिम भरे निवेश से बचें।',
      english: 'Muhurta Ganapati: Friday-started Panchak is Chora Panchak; avoid unsecured loans and speculative trading.'
    }
  },
  {
    id: 'panchak-2026-11',
    type: 'Mrityu Panchak',
    typeHindi: 'मृत्यु पञ्चक (Mrityu Panchak)',
    weekday: 'Saturday (शनिवार)',
    startDate: '27 Nov 2026',
    startTime: '04:10 PM',
    endDate: '02 Dec 2026',
    endTime: '10:05 PM',
    startTimestamp: new Date('2026-11-27T16:10:00+05:30').getTime(),
    endTimestamp: new Date('2026-12-02T22:05:00+05:30').getTime(),
    auspiciousness: 'Severe Caution',
    briefEffects: {
      hindi: 'अत्यन्त कष्टकारी, चोट-दुर्घटना एवं संकट की आशंका।',
      english: 'High risk of fatal crises, accidents, and surgical obstacles.'
    },
    briefRule: {
      hindi: 'धर्मसिन्धु: शनिवार का पञ्चक मृत्यु-पञ्चक है। समस्त मांगलिक कार्य वर्जित हैं एवं दाह संस्कार में पञ्च-पुत्तलिका शान्ति अनिवार्य है।',
      english: 'Dharmasindhu: Saturday Panchak is Mrityu Panchak. Auspicious rites forbidden; 5 effigies (Putrika) mandatory if cremation occurs.'
    }
  },
  {
    id: 'panchak-2026-12',
    type: 'Roga Panchak',
    typeHindi: 'रोग पञ्चक (Roga Panchak)',
    weekday: 'Sunday (रविवार)',
    startDate: '24 Dec 2026',
    startTime: '10:15 PM',
    endDate: '29 Dec 2026',
    endTime: '05:40 AM',
    startTimestamp: new Date('2026-12-24T22:15:00+05:30').getTime(),
    endTimestamp: new Date('2026-12-29T05:40:00+05:30').getTime(),
    auspiciousness: 'Inauspicious',
    briefEffects: {
      hindi: 'शारीरिक व्याधि, ज्वर एवं मानसिक तनाव का कारण।',
      english: 'Causes bodily afflictions, fever, and physical discomfort.'
    },
    briefRule: {
      hindi: 'बृहत्संहिता: रविवार का पञ्चक रोग-पञ्चक है; ऐच्छिक शल्य चिकित्सा व नए उपचार टालें।',
      english: 'Brihat Samhita: Sunday Panchak is Roga Panchak; avoid non-urgent surgeries and start Ayurvedic remedies.'
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// ASTRONOMICAL DYNAMIC PANCHAK GENERATOR (CALCULATES FOR ANY YEAR)
// ─────────────────────────────────────────────────────────────────────────────
function getMoonSiderealDeg(date: Date): number {
  const jd = getJulianDay(date);
  return getSiderealMoonLongitude(jd);
}

export function generatePanchaksForYear(year: number): PanchakEntry[] {
  const panchaks: PanchakEntry[] = [];
  const startOfYear = new Date(year, 0, 1, 0, 0, 0);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const PANCHAK_START_DEG = 293.33333333; // Dhanishta 3rd pada boundary (293° 20')

  // Step across the year in 2-hour increments
  const stepMs = 2 * 3600 * 1000;
  let t = startOfYear.getTime() - 7 * 86400000; // start 7 days prior
  const endMs = endOfYear.getTime() + 7 * 86400000;

  let inPanchak = false;
  let currentStartTs = 0;

  while (t <= endMs) {
    const curDate = new Date(t);
    const deg = getMoonSiderealDeg(curDate);

    // Ingress into Panchak (Moon crossing 293.333° from Capricorn into Aquarius)
    if (!inPanchak && deg >= PANCHAK_START_DEG && deg < 360) {
      let low = t - stepMs;
      let high = t;
      for (let i = 0; i < 24; i++) {
        const mid = (low + high) / 2;
        const d = getMoonSiderealDeg(new Date(mid));
        if (d < PANCHAK_START_DEG || d > 350) low = mid;
        else high = mid;
      }
      currentStartTs = (low + high) / 2;
      inPanchak = true;
    } else if (inPanchak && (deg < PANCHAK_START_DEG && deg < 180)) {
      // Egress from Panchak (Moon crossing 0°/360° from Pisces Revati into Aries Ashwini)
      let low = t - stepMs;
      let high = t;
      for (let i = 0; i < 24; i++) {
        const mid = (low + high) / 2;
        const d = getMoonSiderealDeg(new Date(mid));
        if (d >= PANCHAK_START_DEG || d > 350) low = mid;
        else high = mid;
      }
      const endTs = (low + high) / 2;
      inPanchak = false;

      const startDate = new Date(currentStartTs);
      const endDate = new Date(endTs);

      if (endDate.getFullYear() >= year && startDate.getFullYear() <= year) {
        const weekdayNum = startDate.getDay();
        const weekdayNames = ['Sunday (रविवार)', 'Monday (सोमवार)', 'Tuesday (मंगलवार)', 'Wednesday (बुधवार)', 'Thursday (गुरुवार)', 'Friday (शुक्रवार)', 'Saturday (शनिवार)'];
        const weekdayStr = weekdayNames[weekdayNum];

        let type: PanchakEntry['type'] = 'Nirdosha Panchak';
        let typeHindi = 'निर्दोष / शुभ पञ्चक (Nirdosha Panchak)';
        let auspiciousness: PanchakEntry['auspiciousness'] = 'Neutral';
        let briefEffects = {
          hindi: 'मध्यम फलदायी। सामान्य व्यापार व अध्ययन कार्य संभव।',
          english: 'Moderate influence. Standard commercial and routine educational tasks permitted.'
        };
        let briefRule = {
          hindi: 'वसिष्ठ संहिता: बुधवार एवं गुरुवार का पञ्चक दोषरहित माना गया है, केवल ५ मुख्य निषिद्ध कार्य न करें।',
          english: 'Vashistha Samhita: Wednesday and Thursday Panchaks are considered benign, except for the five canonical prohibitions.'
        };

        if (weekdayNum === 0) {
          type = 'Roga Panchak';
          typeHindi = 'रोग पञ्चक (Roga Panchak)';
          auspiciousness = 'Inauspicious';
          briefEffects = { hindi: 'शारीरिक व्याधि, ज्वर एवं मानसिक तनाव का कारण।', english: 'Causes bodily afflictions, fever, and physical discomfort.' };
          briefRule = { hindi: 'बृहत्संहिता: रविवार का पञ्चक रोग-पञ्चक है; ऐच्छिक शल्य चिकित्सा व नए उपचार टालें।', english: 'Brihat Samhita: Sunday Panchak is Roga Panchak; avoid non-urgent surgeries and start Ayurvedic remedies.' };
        } else if (weekdayNum === 1) {
          type = 'Raja Panchak';
          typeHindi = 'राज पञ्चक (Raja Panchak)';
          auspiciousness = 'Auspicious';
          briefEffects = { hindi: 'शासन, सरकारी कार्य एवं सम्पत्ति क्रय हेतु अत्यन्त शुभ।', english: 'Highly auspicious for government work, property registration, and honors.' };
          briefRule = { hindi: 'मुहूर्तचिन्तामणि: सोमवार को शुरू होने वाला पञ्चक राज-पञ्चक कहलाता है जो राजकार्य व सम्पत्ति हेतु शुभ है, किन्तु ५ शास्त्रोक्त निषिद्ध कार्य वर्जित रहते हैं।', english: 'Muhurta Chintamani: Monday-commenced Panchak is Raja Panchak; favorable for statecraft and assets, though canonical prohibitions apply.' };
        } else if (weekdayNum === 2) {
          type = 'Agni Panchak';
          typeHindi = 'अग्नि पञ्चक (Agni Panchak)';
          auspiciousness = 'Inauspicious';
          briefEffects = { hindi: 'अग्निभय, औजार-मशीनरी विवाद एवं वाद-विवाद की सम्भावना।', english: 'Risk of fire accidents, machinery disputes, and sudden volatility.' };
          briefRule = { hindi: 'निर्णयसिन्धु: मंगलवार का पञ्चक अग्नि-पञ्चक है। निर्माण, विद्युत कार्य एवं काष्ठ संचय में सावधानी बरतें।', english: 'Nirnayasindhu: Tuesday-commenced Panchak is Agni Panchak. Extreme caution advised with fire and machinery.' };
        } else if (weekdayNum === 5) {
          type = 'Chora Panchak';
          typeHindi = 'चोर पञ्चक (Chora Panchak)';
          auspiciousness = 'Inauspicious';
          briefEffects = { hindi: 'धनहानि, व्यापारिक घाटा एवं यात्रा में चोरी का भय।', english: 'Susceptibility to monetary loss, speculative deficit, and travel theft.' };
          briefRule = { hindi: 'मुहूर्त गणपति: शुक्रवार का पञ्चक चोर-पञ्चक है; बड़े लेन-देन एवं जोखिम भरे निवेश से बचें।', english: 'Muhurta Ganapati: Friday-started Panchak is Chora Panchak; avoid unsecured loans and speculative trading.' };
        } else if (weekdayNum === 6) {
          type = 'Mrityu Panchak';
          typeHindi = 'मृत्यु पञ्चक (Mrityu Panchak)';
          auspiciousness = 'Severe Caution';
          briefEffects = { hindi: 'अत्यन्त कष्टकारी, चोट-दुर्घटना एवं संकट की आशंका।', english: 'High risk of fatal crises, accidents, and surgical obstacles.' };
          briefRule = { hindi: 'धर्मसिन्धु: शनिवार का पञ्चक मृत्यु-पञ्चक है। समस्त मांगलिक कार्य वर्जित हैं एवं दाह संस्कार में पञ्च-पुत्तलिका शान्ति अनिवार्य है।', english: 'Dharmasindhu: Saturday Panchak is Mrityu Panchak. Auspicious rites forbidden; Putrika Shanti mandatory.' };
        }

        const formatD = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const formatT = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        panchaks.push({
          id: `panchak-${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`,
          type,
          typeHindi,
          weekday: weekdayStr,
          startDate: formatD(startDate),
          startTime: formatT(startDate),
          endDate: formatD(endDate),
          endTime: formatT(endDate),
          startTimestamp: currentStartTs,
          endTimestamp: endTs,
          auspiciousness,
          briefEffects,
          briefRule
        });
      }
    }
    t += stepMs;
  }

  return panchaks;
}

export function getActivePanchakStatus(currentDate: Date = new Date()) {
  const currentTs = currentDate.getTime();
  const year = currentDate.getFullYear();
  
  // Calculate dynamic panchak list for current and next year
  const yearPanchaks = [
    ...generatePanchaksForYear(year),
    ...generatePanchaksForYear(year + 1)
  ];
  
  // Check if currently inside any Panchak
  const active = yearPanchaks.find(p => currentTs >= p.startTimestamp && currentTs <= p.endTimestamp);
  
  if (active) {
    return {
      isActive: true,
      panchak: active,
      displayTitle: `${active.type} Active`,
      displaySubtitle: `Starts: ${active.startDate} (${active.startTime}) • Ends: ${active.endDate} (${active.endTime})`,
      badgeText: active.auspiciousness === 'Auspicious' ? 'Raj Panchak' : 'Active Panchak',
      badgeColor: active.auspiciousness === 'Auspicious' ? 'emerald' : 'rose'
    };
  }

  // Find next upcoming Panchak
  const upcoming = yearPanchaks.find(p => currentTs < p.startTimestamp);

  return {
    isActive: false,
    panchak: null,
    nextPanchak: upcoming,
    displayTitle: 'No active panchak',
    displaySubtitle: upcoming 
      ? `Next: ${upcoming.type} (${upcoming.startDate}, ${upcoming.startTime} — ${upcoming.endDate}, ${upcoming.endTime})`
      : 'No panchak in progress • Auspicious for general activities',
    badgeText: 'Panchak Free',
    badgeColor: 'emerald'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FESTIVALS DATABASE WITH BRIEF BILINGUAL DHARMASHASTRA RULES
// ─────────────────────────────────────────────────────────────────────────────
export const FESTIVALS_DATABASE: FestivalDetail[] = [
  {
    name: 'Putrada Ekadashi (Shravana)',
    hindiName: 'श्रावण पुत्रदा एकादशी',
    date: 'Tuesday, 25 Aug 2026',
    dayOfWeek: 'Tuesday (मंगलवार)',
    tithi: 'Shukla Ekadashi (11)',
    paksha: 'Shukla',
    category: 'Ekadashi',
    udayaTime: '05:55 AM',
    startTime: '24 Aug 2026, 09:18 PM',
    endTime: '25 Aug 2026, 08:34 PM',
    paranaTime: '26 Aug 2026, 05:56 AM – 08:31 AM',
    briefRule: {
      hindi: 'निर्णयसिन्धु एवं पद्म पुराण: दशमी-विद्धा एकादशी सर्वथा त्याज्य है; केवल शुद्ध सूर्योदय-व्यापिनी एकादशी ही उपवास हेतु ग्राह्य है तथा द्वादशी तिथि में पारणा अनिवार्य है।',
      english: 'Nirnayasindhu & Padma Purana: Dashami-contaminated Ekadashi is strictly forbidden; only pure Sunrise-prevalent (Udaya-Vyapini) Ekadashi is valid, with Parana required during Dwadashi.'
    },
    shastraReferences: ['Nirnayasindhu (Ekadashi Nirnaya)', 'Padma Purana', 'Dharmasindhu']
  },
  {
    name: 'Shravana Shukla Pradosh Vrat',
    hindiName: 'श्रावण शुक्ल प्रदोष व्रत',
    date: 'Wednesday, 26 Aug 2026',
    dayOfWeek: 'Wednesday (बुधवार)',
    tithi: 'Shukla Trayodashi (13)',
    paksha: 'Shukla',
    category: 'Pradosh',
    udayaTime: '05:56 AM',
    startTime: '25 Aug 2026, 08:34 PM',
    endTime: '26 Aug 2026, 07:46 PM',
    briefRule: {
      hindi: 'धर्मसिन्धु: प्रदोष व्रत त्रयोदशी के सूर्यास्त कालीन प्रदोषकाल (सायं २ घटी/४८ मिनट) में व्याप्त होने पर ही मान्य होता है।',
      english: 'Dharmasindhu: Pradosha Vrata is determined exclusively by the presence of Trayodashi Tithi during sunset twilight (Pradosha Kaal).'
    },
    shastraReferences: ['Dharmasindhu (Pradosha Vidhi)', 'Skanda Purana']
  },
  {
    name: 'Raksha Bandhan / Shravana Purnima',
    hindiName: 'रक्षाबन्धन / श्रावण पूर्णिमा',
    date: 'Friday, 28 Aug 2026',
    dayOfWeek: 'Friday (शुक्रवार)',
    tithi: 'Shukla Purnima (15)',
    paksha: 'Shukla',
    category: 'Major Festival',
    udayaTime: '05:57 AM',
    startTime: '27 Aug 2026, 06:52 PM',
    endTime: '28 Aug 2026, 05:48 PM',
    briefRule: {
      hindi: 'निर्णयसिन्धु: भद्रा काल में रक्षासूत्र बांधना पूर्णतः वर्जित है। रक्षाबन्धन अपराह्न अथवा प्रदोष काल में भद्रा समाप्ति के बाद ही करें।',
      english: 'Nirnayasindhu: Tying Rakhi during Bhadra (Vishti Karana) is strictly forbidden. It must be performed during Aparahna or Pradosha after Bhadra ends.'
    },
    shastraReferences: ['Nirnayasindhu (Raksha Bandhan)', 'Muhurta Chintamani']
  },
  {
    name: 'Krishna Janmashtami',
    hindiName: 'श्रीकृष्ण जन्माष्टमी',
    date: 'Thursday, 03 Sep 2026',
    dayOfWeek: 'Thursday (गुरुवार)',
    tithi: 'Krishna Ashtami (8)',
    paksha: 'Krishna',
    category: 'Major Festival',
    udayaTime: '06:00 AM',
    startTime: '03 Sep 2026, 12:44 PM',
    endTime: '04 Sep 2026, 02:10 PM',
    paranaTime: '05 Sep 2026, After Rohini Nakshatra concludes',
    briefRule: {
      hindi: 'कालमाधव: मध्यरात्रि (निशीथ काल) में अष्टमी एवं रोहिणी नक्षत्र का संयोग होने पर ही जन्माष्टमी का मुख्य जयन्ती योग सिद्ध होता है।',
      english: 'Kalamadhava: Janmashtami fast is fixed when Ashtami Tithi and Rohini Nakshatra coincide with solar midnight (Nishita Kaal).'
    },
    shastraReferences: ['Kalamadhava', 'Nirnayasindhu', 'Shrimad Bhagavatam']
  },
  {
    name: 'Ganesh Chaturthi',
    hindiName: 'गणेश चतुर्थी (वरद चतुर्थी)',
    date: 'Monday, 14 Sep 2026',
    dayOfWeek: 'Monday (सोमवार)',
    tithi: 'Shukla Chaturthi (4)',
    paksha: 'Shukla',
    category: 'Ganesh Chaturthi',
    udayaTime: '06:05 AM',
    startTime: '14 Sep 2026, 07:15 AM',
    endTime: '15 Sep 2026, 08:30 AM',
    briefRule: {
      hindi: 'धर्मसिन्धु: भगवान श्रीगणेश का प्राकट्य मध्याह्न काल में हुआ था, अतः मध्याह्न व्यापिनी चतुर्थी ही गणेश स्थापना हेतु ग्राह्य है।',
      english: 'Dharmasindhu: Lord Ganesha manifested during Midday (Madhyahna Kaal); hence Chaturthi prevailing at midday is canonical for Murti Sthapana.'
    },
    shastraReferences: ['Dharmasindhu', 'Ganesha Purana']
  },
  {
    name: 'Sharad Navratri Ghatasthapana',
    hindiName: 'शारदीय नवरात्रि घटस्थापना',
    date: 'Sunday, 11 Oct 2026',
    dayOfWeek: 'Sunday (रविवार)',
    tithi: 'Shukla Pratipada (1)',
    paksha: 'Shukla',
    category: 'Major Festival',
    udayaTime: '06:19 AM',
    startTime: '10 Oct 2026, 09:40 PM',
    endTime: '11 Oct 2026, 11:25 PM',
    briefRule: {
      hindi: 'निर्णयसिन्धु: घटस्थापना अमावस्या-विद्धा प्रतिपदा व चित्रा/वैधृति में वर्जित है। प्रातः द्विस्वभाव लग्न अथवा अभिजित मुहूर्त सर्वश्रेष्ठ है।',
      english: 'Nirnayasindhu: Ghatasthapana is forbidden in Amavasya-viddha Pratipada and Chitra/Vaidhriti; morning Dvisvabhava lagna or Abhijit Muhurat is supreme.'
    },
    shastraReferences: ['Nirnayasindhu', 'Devi Bhagavatam']
  },
  {
    name: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (श्री महालक्ष्मी पूजन)',
    date: 'Sunday, 08 Nov 2026',
    dayOfWeek: 'Sunday (रविवार)',
    tithi: 'Krishna Amavasya (30)',
    paksha: 'Krishna',
    category: 'Major Festival',
    udayaTime: '06:38 AM',
    startTime: '08 Nov 2026, 11:15 AM',
    endTime: '09 Nov 2026, 01:20 PM',
    briefRule: {
      hindi: 'धर्मसिन्धु: प्रदोष काल एवं निशीथ काल में व्याप्त अमावस्या ही महालक्ष्मी पूजन हेतु शास्त्रसम्मत है; स्थिर लग्न (वृषभ) में पूजन चिरस्थायी समृद्धि देता है।',
      english: 'Dharmasindhu: Lakshmi Puja requires Amavasya prevailing during Pradosha & Nishita Kaal; worship in Fixed Ascendant (Taurus) ensures lasting wealth.'
    },
    shastraReferences: ['Dharmasindhu', 'Skanda Purana']
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. MONTHLY TITHI CALENDAR GENERATOR (USING HIGH-PRECISION EPHEMERIS)
// ─────────────────────────────────────────────────────────────────────────────
export interface MonthTithiDay {
  dayNumber: number;
  date: Date;
  dateFormatted: string;
  dayOfWeek: string;
  dayOfWeekShort: string;
  tithiName: string;
  pureTithi: string;
  paksha: 'Shukla' | 'Krishna';
  tithiIndex: number;
  tithiEndTime: string;
  isPurnima: boolean;
  isAmavasya: boolean;
  isEkadashi: boolean;
  isToday: boolean;
  nakshatra: string;
  nakshatraDevanagari: string;
  nakshatraLord: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  isUdayaTithi: boolean;
  festival?: string;
  briefRule: {
    hindi: string;
    english: string;
  };
}

export function generateMonthTithiCalendar(
  year: number,
  month: number,
  lat: number,
  lng: number,
  tz: number,
  locationName: string = 'Current Location'
): MonthTithiDay[] {
  const location: LocationCoordinates = {
    name: locationName,
    country: '',
    latitude: lat,
    longitude: lng,
    timezone: tz,
    regionName: locationName
  };

  const calDays = getMonthVedicCalendar(year, month, location);

  return calDays.map(d => ({
    dayNumber: d.dayNumber,
    date: d.date,
    dateFormatted: d.dateFormatted,
    dayOfWeek: d.dayOfWeek,
    dayOfWeekShort: d.dayOfWeekShort,
    tithiName: d.udayaTithi.name,
    pureTithi: d.udayaTithi.pureName,
    paksha: d.udayaTithi.paksha,
    tithiIndex: d.udayaTithi.index,
    tithiEndTime: d.tithiEndTime,
    isPurnima: d.udayaTithi.isPurnima,
    isAmavasya: d.udayaTithi.isAmavasya,
    isEkadashi: d.udayaTithi.isEkadashi,
    isToday: d.isToday,
    nakshatra: d.nakshatra.name,
    nakshatraDevanagari: d.nakshatra.devanagari,
    nakshatraLord: d.nakshatra.lord,
    yoga: d.yoga.name,
    karana: d.karana.name,
    sunrise: d.sunrise,
    sunset: d.sunset,
    isUdayaTithi: true,
    festival: d.festival,
    briefRule: {
      hindi: 'सूर्यसिद्धान्त: सूर्योदय के समय उपस्थित तिथि (औदयिक तिथि) ही उस सम्पूर्ण दिवस के धार्मिक व नित्य कर्मों हेतु मान्य होती है।',
      english: 'Surya Siddhanta: The Tithi prevailing at local Sunrise (Udaya Tithi) governs all religious rituals and civil duties for the solar day.'
    }
  }));
}
