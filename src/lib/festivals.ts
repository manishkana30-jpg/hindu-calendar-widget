import {
  LocationCoordinates,
  calculateSunTimes,
  getJulianDay,
  getElongationAngle,
  getLahiriAyanamsha,
  getSunLongitude,
  normalizeDeg,
  resolveTimezoneOffset,
  HINDU_MONTHS
} from './vedic-astronomy';

import {
  KalaType,
  DharmashastraEngineOptions,
  determineFestivalForDate,
  EKADASHI_DATABASE,
  EkadashiInfo,
  AstrometricDayCoordinates,
  getAstrometricCoordinatesForDate
} from './dharmashastra-engine';

export type { KalaType, DharmashastraEngineOptions, EkadashiInfo, AstrometricDayCoordinates };
export { EKADASHI_DATABASE, getAstrometricCoordinatesForDate };

export interface VedicFestivalDefinition {
  id: string;
  name: string;
  shortName: string;
  hindiName: string;
  description: string;
  icon: string;
  category: 'Major Festival' | 'Vrat' | 'Jayanti' | 'Ekadashi' | 'Pradosh' | 'Purnima' | 'Amavasya';
  isMajor: boolean;
  priority: number; // Higher number wins if multiple festivals match

  // Tithi Index: 1..15 (Shukla Pratipada to Purnima), 16..30 (Krishna Pratipada to Amavasya)
  tithiIndex?: number | number[];

  // Month Index: 0=Chaitra, 1=Vaishakha, 2=Jyeshtha, 3=Ashadha, 4=Shravana, 5=Bhadrapada,
  // 6=Ashwina, 7=Kartika, 8=Margashirsha, 9=Pausha, 10=Magha, 11=Phalguna
  amantaMonthIndex?: number | number[];
  purnimantaMonthIndex?: number | number[];

  // Dharmashastra Canonical Kala Requirement for Kala Vyapti
  kalaRequirement?: KalaType;

  // Solar festival (e.g. Makar Sankranti: Sun enters Makara / Capricorn)
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

export interface UpcomingFestivalResult {
  name: string;
  shortName: string;
  hindiName: string;
  description: string;
  icon: string;
  category: string;
  isMajor: boolean;
  targetDate: Date;
  dateFormatted: string;
  dayOfWeek: string;
  daysRemaining: number;
  daysText: string;
  badge: string;
  briefRule?: {
    hindi: string;
    english: string;
  };
  shastraReferences?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. COMPREHENSIVE MAJOR HINDU FESTIVALS REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────
export const MAJOR_HINDU_FESTIVALS: VedicFestivalDefinition[] = [
  // ── DIWALI & DEEPAVALI CYCLE ──
  {
    id: 'diwali',
    name: 'Diwali (दीपावली)',
    shortName: 'Diwali',
    hindiName: 'दीपावली (श्री महालक्ष्मी पूजन)',
    description: 'Festival of Lights & Shri Mahalakshmi Puja',
    icon: '🪔',
    category: 'Major Festival',
    isMajor: true,
    priority: 100,
    tithiIndex: [29, 30], // Krishna Amavasya (or Nishita Chaturdashi-Amavasya junction)
    amantaMonthIndex: [6, 7], // Ashwina or Kartika
    purnimantaMonthIndex: [7, 8], // Kartika
    kalaRequirement: 'Pradosha',
    briefRule: {
      hindi: 'धर्मसिन्धु: प्रदोष काल एवं निशीथ काल में व्याप्त अमावस्या ही महालक्ष्मी पूजन हेतु शास्त्रसम्मत है; स्थिर लग्न (वृषभ) में पूजन चिरस्थायी समृद्धि देता है।',
      english: 'Dharmasindhu: Lakshmi Puja requires Amavasya prevailing during Pradosha & Nishita Kaal; worship in Fixed Ascendant (Taurus) ensures lasting wealth.'
    },
    shastraReferences: ['Dharmasindhu', 'Skanda Purana', 'Nirnayasindhu']
  },
  {
    id: 'chhoti-diwali',
    name: 'Naraka Chaturdashi / Chhoti Diwali',
    shortName: 'Chhoti Diwali',
    hindiName: 'नरक चतुर्दशी (छोटी दीपावली / रूप चौदस)',
    description: 'Yam Deepdaan, Abhyanga Snana & Roop Chaudas',
    icon: '🪔',
    category: 'Major Festival',
    isMajor: true,
    priority: 88,
    tithiIndex: 29, // Krishna Chaturdashi
    amantaMonthIndex: [6, 7],
    purnimantaMonthIndex: [7, 8],
    kalaRequirement: 'Arunodaya',
    briefRule: {
      hindi: 'निर्णयसिन्धु: सूर्योदय पूर्व अरुणोदय काल में तैल-अभ्यङ्ग स्नान एवं प्रदोष काल में यमराज हेतु चतुर्मुखी दीपदान अनिवार्य है।',
      english: 'Nirnayasindhu: Pre-dawn Abhyanga holy bath and sunset twilight Yam Deepdaan are mandatory to dispel fear of untimely demise.'
    },
    shastraReferences: ['Nirnayasindhu', 'Padma Purana']
  },
  {
    id: 'dhanteras',
    name: 'Dhanteras (धनतेरस)',
    shortName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी / धन्वन्तरि जयन्ती)',
    description: 'Lord Dhanvantari Jayanti, Kuber Puja & Auspicious Purchase',
    icon: '🪙',
    category: 'Major Festival',
    isMajor: true,
    priority: 90,
    tithiIndex: 28, // Krishna Trayodashi
    amantaMonthIndex: [6, 7],
    purnimantaMonthIndex: [7, 8],
    kalaRequirement: 'Pradosha',
    briefRule: {
      hindi: 'स्कन्द पुराण: प्रदोष काल में धन्वन्तरि एवं कुबेर पूजन तथा दक्षिण दिशा में यम दीपदान से आरोग्य व समृद्धि की प्राप्ति होती है।',
      english: 'Skanda Purana: Dhanvantari and Lord Kuber worship during Pradosha twilight, alongside Yam Deepdaan facing South, grants health and affluence.'
    },
    shastraReferences: ['Skanda Purana', 'Dharmasindhu']
  },
  {
    id: 'govardhan-puja',
    name: 'Govardhan Puja (गोवर्धन पूजा)',
    shortName: 'Govardhan Puja',
    hindiName: 'गोवर्धन पूजा (अन्नकूट महोत्सव)',
    description: 'Giriraj Govardhan Pujan & Annakut Mahotsav',
    icon: '🏔️',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 1, // Shukla Pratipada
    amantaMonthIndex: [7, 8], // Kartika
    purnimantaMonthIndex: [7, 8],
    kalaRequirement: 'Pratah',
    briefRule: {
      hindi: 'श्रीमद्भागवत: कार्तिक शुक्ल प्रतिपदा को गोवर्धन पर्वत व गौमाता का पूजन एवं 56 भोग अन्नकूट समर्पण परम कल्याणकारी है।',
      english: 'Shrimad Bhagavatam: Worshipping Mount Govardhan, Gau Mata, and presenting 56-bhog Annakut on Kartika Shukla Pratipada yields boundless merit.'
    },
    shastraReferences: ['Shrimad Bhagavatam', 'Hari Bhakti Vilasa']
  },
  {
    id: 'bhai-dooj',
    name: 'Bhai Dooj (भाई दूज)',
    shortName: 'Bhai Dooj',
    hindiName: 'भाई दूज (यम द्वितीया)',
    description: 'Sacred Bond of Brother & Sister (Yama Dwitiya)',
    icon: '👫',
    category: 'Major Festival',
    isMajor: true,
    priority: 85,
    tithiIndex: 2, // Shukla Dwitiya
    amantaMonthIndex: [7, 8], // Kartika
    purnimantaMonthIndex: [7, 8],
    kalaRequirement: 'Aparahna',
    briefRule: {
      hindi: 'भविष्य पुराण: अपराह्न व्यापिनी द्वितीया में बहन के हाथ से भोजन ग्रहण करने पर यमराज अकाल मृत्यु का भय समाप्त कर देते हैं।',
      english: 'Bhavishya Purana: Receiving meals and Tilak from sister on Aparahna Dwitiya removes all fears of premature death.'
    },
    shastraReferences: ['Bhavishya Purana', 'Dharmasindhu']
  },
  {
    id: 'chhath-puja',
    name: 'Chhath Puja (छठ पूजा)',
    shortName: 'Chhath Puja',
    hindiName: 'छठ पूजा (सूर्य षष्ठी / सन्ध्या अर्घ्य)',
    description: 'Sacred Arghya to Bhagavan Surya & Chhathi Maiya',
    icon: '☀️',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 6, // Shukla Shashthi
    amantaMonthIndex: [7, 8], // Kartika
    purnimantaMonthIndex: [7, 8],
    kalaRequirement: 'Sayahna',
    briefRule: {
      hindi: 'महाभारत व स्कन्द पुराण: कार्तिक शुक्ल षष्ठी को अस्ताचलगामी सूर्य को सन्ध्या अर्घ्य एवं सप्तमी को उदीयमान सूर्य को प्रातः अर्घ्य प्रदान किया जाता है।',
      english: 'Mahabharata: Offering holy arghya to setting Sun on Shashthi evening and rising Sun on Saptami morning bestows longevity and radiance.'
    },
    shastraReferences: ['Skanda Purana', 'Padma Purana']
  },
  {
    id: 'tulsi-vivah',
    name: 'Tulsi Vivah (तुलसी विवाह)',
    shortName: 'Tulsi Vivah',
    hindiName: 'तुलसी विवाह (शालिग्राम विवाह)',
    description: 'Sacred Wedding of Tulsi Devi & Bhagavan Shaligram',
    icon: '🌿',
    category: 'Major Festival',
    isMajor: true,
    priority: 85,
    tithiIndex: 12, // Shukla Dwadashi
    amantaMonthIndex: [7, 8], // Kartika
    purnimantaMonthIndex: [7, 8],
    kalaRequirement: 'Sayahna',
    briefRule: {
      hindi: 'पद्म पुराण: प्रबोधिनी एकादशी अथवा द्वादशी को तुलसी-शालिग्राम विवाह कराने से कन्यादान के समान अनन्त पुण्य की प्राप्ति होती है।',
      english: 'Padma Purana: Consecrating the holy nuptials of Tulsi and Shaligram on Dwadashi yields merits equivalent to Kanyadaan.'
    },
    shastraReferences: ['Padma Purana', 'Dharmasindhu']
  },
  {
    id: 'kartika-purnima',
    name: 'Kartika Purnima (देव दीपावली)',
    shortName: 'Dev Diwali',
    hindiName: 'कार्तिक पूर्णिमा (देव दीपावली / त्रिपुरारी पूर्णिमा)',
    description: 'Dev Deepavali, Tripurari Purnima & Sacred Ganga Snana',
    icon: '🪔',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 15, // Shukla Purnima
    amantaMonthIndex: [7, 8], // Kartika
    purnimantaMonthIndex: [7, 8],
    kalaRequirement: 'Pradosha',
    briefRule: {
      hindi: 'शिव पुराण: भगवान शिव ने त्रिपुरासुर का संहार इसी दिन किया था; इस पावन संध्या काशी घाटों व देवालयों में दीपदान से मोक्ष की प्राप्ति होती है।',
      english: 'Shiva Purana: Commemorating Lord Shiva destroying Tripurasura; lighting lamps (Deepdaan) along ghats brings supreme liberation.'
    },
    shastraReferences: ['Shiva Purana', 'Matsya Purana']
  },

  // ── KRISHNA JANMASHTAMI ──
  {
    id: 'janmashtami',
    name: 'Krishna Janmashtami (श्रीकृष्ण जन्माष्टमी)',
    shortName: 'Janmashtami',
    hindiName: 'श्रीकृष्ण जन्माष्टमी (गोकुलाष्टमी / रोहिणी जयन्ती)',
    description: 'Divine Manifestation of Lord Krishna & Midnight Vigil',
    icon: '🦚',
    category: 'Major Festival',
    isMajor: true,
    priority: 100,
    tithiIndex: 23, // Krishna Ashtami
    amantaMonthIndex: [4, 5], // Shravana (Amanta) or Bhadrapada
    purnimantaMonthIndex: [5, 6], // Bhadrapada (Purnimanta)
    kalaRequirement: 'Nishita',
    briefRule: {
      hindi: 'कालमाधव: मध्यरात्रि (निशीथ काल) में अष्टमी एवं रोहिणी नक्षत्र का संयोग होने पर ही जन्माष्टमी का मुख्य जयन्ती योग सिद्ध होता है।',
      english: 'Kalamadhava: Janmashtami fast is fixed when Ashtami Tithi and Rohini Nakshatra coincide with solar midnight (Nishita Kaal).'
    },
    shastraReferences: ['Kalamadhava', 'Nirnayasindhu', 'Shrimad Bhagavatam']
  },

  // ── GANESHOTSAV ──
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi (गणेश चतुर्थी)',
    shortName: 'Ganesh Chaturthi',
    hindiName: 'गणेश चतुर्थी (वरद विनायक चतुर्थी / गणेशोत्सव)',
    description: 'Advent of Lord Ganesha & Midday Murti Sthapana',
    icon: '🌺',
    category: 'Major Festival',
    isMajor: true,
    priority: 100,
    tithiIndex: 4, // Shukla Chaturthi
    amantaMonthIndex: [5, 6], // Bhadrapada / Ashwina
    purnimantaMonthIndex: [5, 6],
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'धर्मसिन्धु: भगवान श्रीगणेश का प्राकट्य मध्याह्न काल में हुआ था, अतः मध्याह्न व्यापिनी चतुर्थी ही गणेश स्थापना हेतु ग्राह्य है।',
      english: 'Dharmasindhu: Lord Ganesha manifested during Midday (Madhyahna Kaal); hence Chaturthi prevailing at midday is canonical for Murti Sthapana.'
    },
    shastraReferences: ['Dharmasindhu', 'Ganesha Purana']
  },
  {
    id: 'anant-chaturdashi',
    name: 'Anant Chaturdashi (अनन्त चतुर्दशी)',
    shortName: 'Anant Chaturdashi',
    hindiName: 'अनन्त चतुर्दशी (गणेश विसर्जन / अनन्त सूत्र)',
    description: 'Lord Ananta Padmanabha Worship & Ganesh Visarjan',
    icon: '♾️',
    category: 'Major Festival',
    isMajor: true,
    priority: 90,
    tithiIndex: 14, // Shukla Chaturdashi
    amantaMonthIndex: [5, 6], // Bhadrapada
    purnimantaMonthIndex: [5, 6],
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'हेमाद्रि: मध्याह्न व्यापिनी चतुर्दशी में 14 ग्रन्थियुक्त अनन्त सूत्र धारण करना एवं गणेश विसर्जन करना शास्त्रोक्त है।',
      english: 'Hemadri: Tying the 14-knot sacred Ananta thread during Madhyahna and performing Ganesh Visarjan completes the vow.'
    },
    shastraReferences: ['Hemadri', 'Bhavishya Purana']
  },

  // ── MAHA SHIVARATRI ──
  {
    id: 'maha-shivaratri',
    name: 'Maha Shivaratri (महाशिवरात्रि)',
    shortName: 'Maha Shivaratri',
    hindiName: 'महाशिवरात्रि (शिव चतुर्दशी / लिंगोद्भव)',
    description: 'Great Sacred Night of Lord Shiva & Lingodbhava Vigil',
    icon: '🔱',
    category: 'Major Festival',
    isMajor: true,
    priority: 100,
    tithiIndex: [28, 29], // Krishna Chaturdashi (or Nishita Trayodashi/Chaturdashi)
    amantaMonthIndex: [10, 11], // Magha in Amanta
    purnimantaMonthIndex: [11, 0], // Phalguna in Purnimanta
    kalaRequirement: 'Nishita',
    briefRule: {
      hindi: 'निर्णयसिन्धु: निशीथ काल (मध्यरात्रि) में व्याप्त चतुर्दशी ही महाशिवरात्रि व्रत हेतु ग्राह्य है; 4 प्रहर रुद्राभिषेक से समस्त पाप नष्ट होते हैं।',
      english: 'Nirnayasindhu: Shivaratri is governed strictly by Chaturdashi prevailing during Nishita (midnight); 4-Pahar Rudrabhishek is canonical.'
    },
    shastraReferences: ['Nirnayasindhu', 'Shiva Purana', 'Dharmasindhu']
  },

  // ── HOLI & HOLIKA DAHAN ──
  {
    id: 'holika-dahan',
    name: 'Holika Dahan (होलिका दहन)',
    shortName: 'Holika Dahan',
    hindiName: 'होलिका दहन (फाल्गुन पूर्णिमा / छोटी होली)',
    description: 'Sacred Bonfire Vigil & Victory of Bhakta Prahlada',
    icon: '🔥',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 15, // Shukla Purnima
    amantaMonthIndex: [11, 0], // Phalguna
    purnimantaMonthIndex: [11, 0],
    kalaRequirement: 'Pradosha',
    briefRule: {
      hindi: 'निर्णयसिन्धु: भद्रा रहित प्रदोष काल में पूर्णिमा होने पर ही होलिका दहन शास्त्रसम्मत है; भद्रा में दहन सर्वथा वर्जित है।',
      english: 'Nirnayasindhu: Holika Dahan must be conducted during Pradosha twilight on Purnima free from Bhadra (Vishti Karana).'
    },
    shastraReferences: ['Nirnayasindhu', 'Muhurta Chintamani']
  },
  {
    id: 'holi',
    name: 'Holi / Rangwali Holi (होली)',
    shortName: 'Holi',
    hindiName: 'होली (रंगोत्सव / धुलण्डी)',
    description: 'Joyous Spring Festival of Colors & Universal Brotherhood',
    icon: '🎨',
    category: 'Major Festival',
    isMajor: true,
    priority: 100,
    tithiIndex: 16, // Krishna Pratipada
    amantaMonthIndex: [11, 0], // Phalguna in Amanta / Chaitra in Purnimanta
    purnimantaMonthIndex: [0, 1],
    kalaRequirement: 'Pratah',
    briefRule: {
      hindi: 'भविष्य पुराण: चैत्र कृष्ण प्रतिपदा के प्रातःकाल धूलिवन्दन एवं गुलाल-रंगोत्सव द्वारा नव वसन्त का स्वागत किया जाता है।',
      english: 'Bhavishya Purana: Dhulivandan and vibrant festivities on Pratipada morning welcome the rejuvenating spirit of Spring.'
    },
    shastraReferences: ['Bhavishya Purana', 'Dharmasindhu']
  },

  // ── RAM NAVAMI & CHAITRA NAVRATRI ──
  {
    id: 'ram-navami',
    name: 'Ram Navami (श्रीरामनवमी)',
    shortName: 'Ram Navami',
    hindiName: 'श्रीराम नवमी (श्री राम जन्मोत्सव)',
    description: 'Divine Manifestation of Maryada Purushottam Lord Rama',
    icon: '🏹',
    category: 'Major Festival',
    isMajor: true,
    priority: 100,
    tithiIndex: 9, // Shukla Navami
    amantaMonthIndex: 0, // Chaitra
    purnimantaMonthIndex: 0,
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'अगस्त्य संहिता: चैत्र शुक्ल नवमी को मध्याह्न काल (12:00 PM) में पुनर्वसु नक्षत्र व कर्क लग्न में भगवान श्रीराम का प्राकट्य हुआ था।',
      english: 'Agastya Samhita: Lord Rama manifested precisely at Madhyahna solar noon in Punarvasu Nakshatra and Cancer ascendant.'
    },
    shastraReferences: ['Agastya Samhita', 'Nirnayasindhu', 'Ramayana']
  },
  {
    id: 'chaitra-navratri',
    name: 'Chaitra Navratri / Gudi Padwa (नव संवत्सर)',
    shortName: 'Gudi Padwa / Navratri',
    hindiName: 'चैत्र नवरात्रि प्रारम्भ / गुड़ी पड़वा / युगादि',
    description: 'Vedic New Year, Gudi Padwa, Ugadi & Kalash Sthapana',
    icon: '🚩',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 1, // Shukla Pratipada
    amantaMonthIndex: 0, // Chaitra
    purnimantaMonthIndex: 0,
    kalaRequirement: 'Pratah',
    briefRule: {
      hindi: 'ब्रह्म पुराण: चैत्र शुक्ल प्रतिपदा के सूर्योदय पर ब्रह्मा जी ने सृष्टि की रचना प्रारम्भ की थी; यह संवत्सर का पावन प्रथम दिवस है।',
      english: 'Brahma Purana: Lord Brahma initiated cosmic creation at sunrise on Chaitra Shukla Pratipada, marking the Vedic New Year.'
    },
    shastraReferences: ['Brahma Purana', 'Nirnayasindhu']
  },
  {
    id: 'hanuman-jayanti',
    name: 'Hanuman Jayanti (श्री हनुमान जयन्ती)',
    shortName: 'Hanuman Jayanti',
    hindiName: 'श्री हनुमान जयन्ती (चैत्र पूर्णिमा)',
    description: 'Advent of Sankat Mochan Mahabali Hanuman Ji',
    icon: '🚩',
    category: 'Major Festival',
    isMajor: true,
    priority: 90,
    tithiIndex: 15, // Shukla Purnima
    amantaMonthIndex: 0, // Chaitra
    purnimantaMonthIndex: 0,
    kalaRequirement: 'Pratah',
    briefRule: {
      hindi: 'वायु पुराण: चैत्र पूर्णिमा को चित्रा नक्षत्र के संयोग में पवनपुत्र हनुमान जी का प्राकट्य हुआ था।',
      english: 'Vayu Purana: Lord Hanuman manifested on Chaitra Purnima during Chitra Nakshatra to serve Lord Rama.'
    },
    shastraReferences: ['Vayu Purana', 'Skanda Purana']
  },

  // ── SHARAD NAVRATRI & DUSSEHRA ──
  {
    id: 'sharad-navratri',
    name: 'Sharad Navratri (शारदीय नवरात्रि)',
    shortName: 'Navratri Ghatasthapana',
    hindiName: 'शारदीय नवरात्रि घटस्थापना',
    description: 'Sacred Devi Invocation & Nine Divine Nights of Shakti',
    icon: '🚩',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 1, // Shukla Pratipada
    amantaMonthIndex: [6, 7], // Ashwina
    purnimantaMonthIndex: [6, 7],
    kalaRequirement: 'Pratah',
    briefRule: {
      hindi: 'निर्णयसिन्धु: प्रातःकाल द्विस्वभाव लग्न अथवा अभिजित मुहूर्त में कलश स्थापना परम शुभप्रद है।',
      english: 'Nirnayasindhu: Ghatasthapana during morning dual ascendant or midday Abhijit Muhurat bestows supreme triumph.'
    },
    shastraReferences: ['Nirnayasindhu', 'Devi Bhagavatam']
  },
  {
    id: 'durga-ashtami',
    name: 'Maha Ashtami / Durga Ashtami',
    shortName: 'Maha Ashtami',
    hindiName: 'दुर्गा अष्टमी (महाष्टमी / कन्या पूजन)',
    description: 'Maha Gauri Pujan, Sandhi Puja & Kanya Pujan',
    icon: '🔱',
    category: 'Major Festival',
    isMajor: true,
    priority: 90,
    tithiIndex: 8, // Shukla Ashtami
    amantaMonthIndex: [6, 7], // Ashwina
    purnimantaMonthIndex: [6, 7],
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'कालिका पुराण: अष्टमी एवं नवमी की सन्धि वेला (अन्तिम 24 मिनट व प्रथम 24 मिनट) में चामुण्डा देवी की सन्धि पूजा सर्वसिद्धिदात्री है।',
      english: 'Kalika Purana: Sandhi Puja at the precise junction of Ashtami and Navami invokes Maa Chamunda to vanquish insurmountable obstacles.'
    },
    shastraReferences: ['Kalika Purana', 'Dharmasindhu']
  },
  {
    id: 'maha-navami',
    name: 'Maha Navami (महानवमी)',
    shortName: 'Maha Navami',
    hindiName: 'महानवमी (शारदीय दुर्गा नवमी / आयुध पूजा)',
    description: 'Siddhi Datri Pujan, Ayudha Puja & Purnahuti Havan',
    icon: '🔱',
    category: 'Major Festival',
    isMajor: true,
    priority: 90,
    tithiIndex: 9, // Shukla Navami
    amantaMonthIndex: [6, 7], // Ashwina
    purnimantaMonthIndex: [6, 7],
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'देवी पुराण: नवमी तिथि में नवदुर्गा महायज्ञ व पूर्णाहुति करने से साधक को धर्म, अर्थ, काम व मोक्ष की प्राप्ति होती है।',
      english: 'Devi Purana: Performing the concluding Purnahuti Havan on Navami fulfills all four aims of human life.'
    },
    shastraReferences: ['Devi Purana', 'Nirnayasindhu']
  },
  {
    id: 'dussehra',
    name: 'Dussehra / Vijayadashami (विजयादशमी)',
    shortName: 'Dussehra',
    hindiName: 'विजयादशमी / दशहरा (अपराजिता पूजन)',
    description: 'Triumph of Dharma, Shami Puja & Victory over Evil',
    icon: '🏹',
    category: 'Major Festival',
    isMajor: true,
    priority: 100,
    tithiIndex: 10, // Shukla Dashami
    amantaMonthIndex: [6, 7], // Ashwina
    purnimantaMonthIndex: [6, 7],
    kalaRequirement: 'Aparahna',
    briefRule: {
      hindi: 'धर्मसिन्धु: अपराह्न व्यापिनी दशमी में अपराजिता देवी एवं शमी वृक्ष का पूजन विजयप्रद है; इसी दिन श्रीराम ने रावण पर विजय पाई थी।',
      english: 'Dharmasindhu: Aparahna Dashami is supreme for Aparajita Puja and Shami tree worship, commemorating Lord Rama vanquishing Ravana.'
    },
    shastraReferences: ['Dharmasindhu', 'Nirnayasindhu']
  },
  {
    id: 'sharad-purnima',
    name: 'Sharad Purnima (शरद पूर्णिमा)',
    shortName: 'Sharad Purnima',
    hindiName: 'शरद पूर्णिमा (कोजागरी महालक्ष्मी पूजन)',
    description: 'Kojagari Lakshmi Puja, Maharaas & Amrit Moonbeams',
    icon: '🌕',
    category: 'Major Festival',
    isMajor: true,
    priority: 90,
    tithiIndex: 15, // Shukla Purnima
    amantaMonthIndex: [6, 7], // Ashwina
    purnimantaMonthIndex: [6, 7],
    kalaRequirement: 'Nishita',
    briefRule: {
      hindi: 'स्कन्द पुराण: मध्यरात्रि में देवी महालक्ष्मी पृथ्वी पर विचरण कर ‘को जागर्ति’ (कौन जाग रहा है) पूछती हैं; खीर का भोग अमृततुल्य होता है।',
      english: 'Skanda Purana: Maa Lakshmi traverses the earth at midnight blessing those in spiritual vigil; moonlit kheer absorbs healing nectar.'
    },
    shastraReferences: ['Skanda Purana', 'Bhavishya Purana']
  },
  {
    id: 'karwa-chauth',
    name: 'Karwa Chauth (करवा चौथ)',
    shortName: 'Karwa Chauth',
    hindiName: 'करवा चौथ (करक चतुर्थी व्रत)',
    description: 'Nirjala Fast for Husband Longevity & Moonrise Arghya',
    icon: '🌕',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 19, // Krishna Chaturthi
    amantaMonthIndex: [6, 7], // Ashwina or Kartika
    purnimantaMonthIndex: [7, 8],
    kalaRequirement: 'Ratri',
    briefRule: {
      hindi: 'धर्मसिन्धु: चन्द्रोदय-व्यापिनी चतुर्थी ही करवा चौथ व्रत हेतु ग्राह्य है; चन्द्र दर्शन व अर्घ्य के उपरान्त ही व्रत का पारण होता है।',
      english: 'Dharmasindhu: Karwa Chauth fast requires Chaturthi prevailing at Moonrise; offering arghya to the Moon completes the sacred fast.'
    },
    shastraReferences: ['Dharmasindhu', 'Vratraj']
  },

  // ── RAKSHA BANDHAN & SHRAVANA ──
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan (रक्षाबन्धन)',
    shortName: 'Raksha Bandhan',
    hindiName: 'रक्षाबन्धन (श्रावण पूर्णिमा / श्रावणी उपकर्म)',
    description: 'Sacred Bond of Sibling Protection & Shravani Upakarma',
    icon: '🧵',
    category: 'Major Festival',
    isMajor: true,
    priority: 100,
    tithiIndex: 15, // Shukla Purnima
    amantaMonthIndex: [4, 5], // Shravana
    purnimantaMonthIndex: [4, 5],
    kalaRequirement: 'Aparahna',
    briefRule: {
      hindi: 'निर्णयसिन्धु: भद्रा काल में रक्षासूत्र बांधना पूर्णतः वर्जित है; अपराह्न अथवा प्रदोष काल में भद्रा समाप्ति के बाद ही रक्षाबन्धन करें।',
      english: 'Nirnayasindhu: Tying Rakhi during Bhadra (Vishti Karana) is strictly forbidden; perform after Bhadra concludes during Aparahna or Pradosha.'
    },
    shastraReferences: ['Nirnayasindhu', 'Muhurta Chintamani']
  },
  {
    id: 'nag-panchami',
    name: 'Nag Panchami (नाग पंचमी)',
    shortName: 'Nag Panchami',
    hindiName: 'नाग पञ्चमी (अनन्त वासुकी पूजन)',
    description: 'Serpent Deity Veneration & Protection against Sarpa Dosha',
    icon: '🐍',
    category: 'Major Festival',
    isMajor: true,
    priority: 85,
    tithiIndex: 5, // Shukla Panchami
    amantaMonthIndex: [4, 5], // Shravana
    purnimantaMonthIndex: [4, 5],
    kalaRequirement: 'Pratah',
    briefRule: {
      hindi: 'भविष्य पुराण: श्रावण शुक्ल पंचमी को द्वादश नागों का दुग्ध-पूजन करने से वंश में सर्प भय समाप्त होता है।',
      english: 'Bhavishya Purana: Worshipping the 12 Divine Serpents on Shravana Panchami eliminates generational reptilian hazards and fears.'
    },
    shastraReferences: ['Bhavishya Purana', 'Garuda Purana']
  },

  // ── VAISHAKHA & JYESHTHA ──
  {
    id: 'akshaya-tritiya',
    name: 'Akshaya Tritiya (अक्षय तृतीया)',
    shortName: 'Akshaya Tritiya',
    hindiName: 'अक्षय तृतीया (आखा तीज / परशुराम जयन्ती)',
    description: 'Eternal Inexhaustible Merit, Gold Purchase & Treta Yugadi',
    icon: '✨',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 3, // Shukla Tritiya
    amantaMonthIndex: 1, // Vaishakha
    purnimantaMonthIndex: 1,
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'मत्स्य पुराण: इस पावन तिथि को किया गया दान, जप, तप व पुण्य कभी क्षय नहीं होता; यह स्वयंसिद्ध अबूझ मुहूर्त है।',
      english: 'Matsya Purana: Any charity, mantra japa, and penance performed on Akshaya Tritiya never diminishes; it is an intrinsically flawless muhurat.'
    },
    shastraReferences: ['Matsya Purana', 'Narada Purana']
  },
  {
    id: 'buddha-purnima',
    name: 'Buddha Purnima (बुद्ध पूर्णिमा)',
    shortName: 'Buddha Purnima',
    hindiName: 'बुद्ध पूर्णिमा (वैशाख पूर्णिमा / बुद्ध जयन्ती)',
    description: 'Lord Buddha Jayanti & Vaishakha Purnima Snana',
    icon: '🌕',
    category: 'Major Festival',
    isMajor: true,
    priority: 90,
    tithiIndex: 15, // Shukla Purnima
    amantaMonthIndex: 1, // Vaishakha
    purnimantaMonthIndex: 1,
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'वैशाख महात्म्य: वैशाख पूर्णिमा को धर्मराज के निमित्त जल से भरे कुम्भ व अन्न का दान परम पुण्यदायी है।',
      english: 'Vaishakha Mahatmya: Donating earthen water pots and food on Vaishakha Purnima grants peace and spiritual elevation.'
    },
    shastraReferences: ['Padma Purana', 'Skanda Purana']
  },
  {
    id: 'nirjala-ekadashi',
    name: 'Nirjala Ekadashi (निर्जला एकादशी)',
    shortName: 'Nirjala Ekadashi',
    hindiName: 'निर्जला एकादशी (भीमसेनी एकादशी)',
    description: 'Supreme Waterless Vishnu Fast (Equal to All 24 Ekadashis)',
    icon: '💧',
    category: 'Ekadashi',
    isMajor: true,
    priority: 95,
    tithiIndex: 11, // Shukla Ekadashi
    amantaMonthIndex: 2, // Jyeshtha
    purnimantaMonthIndex: 2,
    kalaRequirement: 'Udaya',
    briefRule: {
      hindi: 'पद्म पुराण: ज्येष्ठ शुक्ल एकादशी को आचमन के अतिरिक्त जल न ग्रहण करते हुए निराहार उपवास करने से वर्ष की समस्त 24 एकादशियों का फल प्राप्त होता है।',
      english: 'Padma Purana: Observing a strict waterless fast on Jyeshtha Shukla Ekadashi earns the combined spiritual merit of all 24 yearly Ekadashis.'
    },
    shastraReferences: ['Padma Purana', 'Brahma Vaivarta Purana']
  },

  // ── ASHADHA ──
  {
    id: 'ratha-yatra',
    name: 'Jagannath Ratha Yatra (रथयात्रा)',
    shortName: 'Ratha Yatra',
    hindiName: 'श्री जगन्नाथ रथयात्रा (पुरी रथयात्रा)',
    description: 'Grand Chariot Procession of Lord Jagannath, Balabhadra & Subhadra',
    icon: '🛞',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 2, // Shukla Dwitiya
    amantaMonthIndex: 3, // Ashadha
    purnimantaMonthIndex: 3,
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'स्कन्द पुराण (उत्कल खण्ड): आषाढ़ शुक्ल द्वितीया को रथ पर विराजमान जगन्नाथ जी के दर्शन मात्र से पुनर्जन्म के चक्र से मुक्ति मिलती है।',
      english: 'Skanda Purana: Glimpsing Lord Jagannath seated on the sacred chariot liberates the devotee from the cycle of rebirth.'
    },
    shastraReferences: ['Skanda Purana', 'Brahma Purana']
  },
  {
    id: 'devshayani-ekadashi',
    name: 'Devshayani Ekadashi (देवशयनी एकादशी)',
    shortName: 'Devshayani Ekadashi',
    hindiName: 'देवशयनी एकादशी (चातुर्मास प्रारम्भ / हरिशयन)',
    description: 'Lord Vishnu Cosmic Slumber Begins (Chaturmas Initiation)',
    icon: '🪷',
    category: 'Ekadashi',
    isMajor: true,
    priority: 95,
    tithiIndex: 11, // Shukla Ekadashi
    amantaMonthIndex: 3, // Ashadha
    purnimantaMonthIndex: 3,
    kalaRequirement: 'Udaya',
    briefRule: {
      hindi: 'भविष्योत्तर पुराण: आषाढ़ शुक्ल एकादशी से भगवान विष्णु क्षीरसागर में 4 मास हेतु योगनिद्रा में प्रविष्ट होते हैं; यहां से चातुर्मास व्रत प्रारम्भ होता है।',
      english: 'Bhavishyottara Purana: Lord Vishnu enters Yogic slumber in the cosmic milk ocean; auspicious weddings pause for the 4-month Chaturmas.'
    },
    shastraReferences: ['Bhavishyottara Purana', 'Dharmasindhu']
  },
  {
    id: 'guru-purnima',
    name: 'Guru Purnima (गुरु पूर्णिमा)',
    shortName: 'Guru Purnima',
    hindiName: 'गुरु पूर्णिमा (वेद व्यास जयन्ती / आषाढ़ पूर्णिमा)',
    description: 'Maharshi Veda Vyasa Jayanti & Guru Veneration',
    icon: '🌕',
    category: 'Major Festival',
    isMajor: true,
    priority: 90,
    tithiIndex: 15, // Shukla Purnima
    amantaMonthIndex: 3, // Ashadha
    purnimantaMonthIndex: 3,
    kalaRequirement: 'Madhyahna',
    briefRule: {
      hindi: 'स्कन्द पुराण: आदिगुरु महर्षि वेदव्यास जी के प्राकट्य दिवस पर गुरु पूजन एवं चरणोदक ग्रहण से अज्ञान रूपी अन्धकार का नाश होता है।',
      english: 'Skanda Purana: Worshipping the Guru on Maharshi Veda Vyasa’s advent dispels the darkness of ignorance.'
    },
    shastraReferences: ['Skanda Purana', 'Guru Gita']
  },

  // ── SOLAR FESTIVALS ──
  {
    id: 'makar-sankranti',
    name: 'Makar Sankranti (मकर संक्रान्ति)',
    shortName: 'Makar Sankranti',
    hindiName: 'मकर संक्रान्ति (पोंगल / उत्तरायण महापर्व)',
    description: 'Surya Ingress into Makara (Capricorn) & Uttarayan Advent',
    icon: '🪁',
    category: 'Major Festival',
    isMajor: true,
    isSolar: true,
    solarRashiIndex: 9, // Makara / Capricorn
    priority: 100,
    briefRule: {
      hindi: 'सूर्यसिद्धान्त: भगवान सूर्य जब धनु से मकर राशि में प्रवेश करते हैं तब उत्तरायण काल प्रारम्भ होता है; इस पुण्यकाल में तीर्थ स्नान व तिल-गुड़ दान महाफलदायी है।',
      english: 'Surya Siddhanta: The solar ingress into sidereal Capricorn initiates Uttarayana; sacred river bathing and sesamum charity yield infinite rewards.'
    },
    shastraReferences: ['Surya Siddhanta', 'Matsya Purana']
  },

  // ── MAGHA FESTIVALS ──
  {
    id: 'vasant-panchami',
    name: 'Vasant Panchami (बसंत पंचमी)',
    shortName: 'Vasant Panchami',
    hindiName: 'बसंत पंचमी (श्री सरस्वती पूजा / श्री पंचमी)',
    description: 'Advent of Goddess Saraswati, Wisdom & Spring Bloom',
    icon: '🪕',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 5, // Shukla Panchami
    amantaMonthIndex: 10, // Magha
    purnimantaMonthIndex: 10,
    kalaRequirement: 'Pratah',
    briefRule: {
      hindi: 'ब्रह्मवैवर्त पुराण: माघ शुक्ल पंचमी को विद्या, वाणी व संगीत की अधिष्ठात्री भगवती सरस्वती का प्राकट्य हुआ था; अक्षरारम्भ हेतु यह दिन सर्वोत्तम है।',
      english: 'Brahma Vaivarta Purana: Devi Saraswati manifested on Magha Shukla Panchami; it is the most auspicious day for initiating education and fine arts.'
    },
    shastraReferences: ['Brahma Vaivarta Purana', 'Nirnayasindhu']
  },
  {
    id: 'ratha-saptami',
    name: 'Ratha Saptami (रथ सप्तमी)',
    shortName: 'Ratha Saptami',
    hindiName: 'रथ सप्तमी (सूर्य जयन्ती / आरोग्य सप्तमी)',
    description: 'Surya Jayanti, Seven-Horse Solar Chariot & Health Snana',
    icon: '☀️',
    category: 'Major Festival',
    isMajor: true,
    priority: 85,
    tithiIndex: 7, // Shukla Saptami
    amantaMonthIndex: 10, // Magha
    purnimantaMonthIndex: 10,
    kalaRequirement: 'Pratah',
    briefRule: {
      hindi: 'भविष्य पुराण: माघ शुक्ल सप्तमी को अर्क (आक) के पत्तों को सिर पर रखकर स्नान करने से समस्त व्याधियां दूर होती हैं।',
      english: 'Bhavishya Purana: Bathing with Arka leaves on Magha Saptami pleases Bhagavan Surya and banishes bodily ailments.'
    },
    shastraReferences: ['Bhavishya Purana', 'Dharmasindhu']
  },

  // ── MARGASHIRSHA ──
  {
    id: 'gita-jayanti',
    name: 'Gita Jayanti (गीता जयन्ती)',
    shortName: 'Gita Jayanti',
    hindiName: 'गीता जयन्ती (मोक्षदा एकादशी)',
    description: 'Advent of Shrimad Bhagavad Gita on Kurukshetra Battlefield',
    icon: '📖',
    category: 'Major Festival',
    isMajor: true,
    priority: 95,
    tithiIndex: 11, // Shukla Ekadashi
    amantaMonthIndex: [8, 9], // Margashirsha
    purnimantaMonthIndex: [8, 9],
    kalaRequirement: 'Udaya',
    briefRule: {
      hindi: 'महाभारत: कुरुक्षेत्र के समरांगण में योगेश्वर श्रीकृष्ण द्वारा अर्जुन को श्रीमद्भगवद्गीता के अमर उपदेश का प्राकट्य हुआ था।',
      english: 'Mahabharata: Lord Krishna bestowed the supreme wisdom of Shrimad Bhagavad Gita unto Arjuna on Kurukshetra.'
    },
    shastraReferences: ['Mahabharata', 'Padma Purana']
  }
];




// ─────────────────────────────────────────────────────────────────────────────
// 4. FESTIVAL MATCHING ENGINE (FOR ANY SPECIFIC DATE)
// ─────────────────────────────────────────────────────────────────────────────
export function getFestivalForDate(
  targetDate: Date,
  location: LocationCoordinates,
  options?: DharmashastraEngineOptions
): ActiveFestivalResult {
  return determineFestivalForDate(targetDate, location, options, MAJOR_HINDU_FESTIVALS);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FORWARD SCANNER: FIND UPCOMING MAJOR FESTIVAL
// ─────────────────────────────────────────────────────────────────────────────
export function findUpcomingMajorFestival(
  fromDate: Date,
  location: LocationCoordinates,
  maxDays: number = 180,
  options?: DharmashastraEngineOptions
): UpcomingFestivalResult {
  const baseMidnight = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  for (let offset = 1; offset <= maxDays; offset++) {
    const scanDate = new Date(baseMidnight.getTime() + offset * 86400000);
    const fest = getFestivalForDate(scanDate, location, options);

    // Filter to major festivals and prominent Ekadashis/Vrats
    if (fest.isMajor) {
      const daysRemaining = offset;
      const daysText = daysRemaining === 1 ? 'Tomorrow' : `In ${daysRemaining} days`;

      const dateFormatted = scanDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const dayOfWeek = scanDate.toLocaleDateString('en-US', { weekday: 'long' });

      return {
        name: fest.name,
        shortName: fest.shortName,
        hindiName: fest.hindiName,
        description: `${dateFormatted} • ${fest.description}`,
        icon: fest.icon,
        category: fest.category,
        isMajor: true,
        targetDate: scanDate,
        dateFormatted,
        dayOfWeek,
        daysRemaining,
        daysText,
        badge: daysText,
        briefRule: fest.briefRule,
        shastraReferences: fest.shastraReferences
      };
    }
  }

  // Fallback if none found within window
  const fallbackDate = new Date(baseMidnight.getTime() + 15 * 86400000);
  return {
    name: 'Upcoming Vedic Observance',
    shortName: 'Vedic Observance',
    hindiName: 'आगामी पर्व',
    description: 'Next Canonical Observance',
    icon: '🪔',
    category: 'Vrat',
    isMajor: false,
    targetDate: fallbackDate,
    dateFormatted: fallbackDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    dayOfWeek: 'Vedic Day',
    daysRemaining: 15,
    daysText: 'In 15 days',
    badge: 'In 15 days'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. FORWARD SCANNER: LIST MULTIPLE UPCOMING FESTIVALS (FOR MODAL)
// ─────────────────────────────────────────────────────────────────────────────
export function getUpcomingFestivalsList(
  fromDate: Date,
  location: LocationCoordinates,
  count: number = 15,
  maxDays: number = 240,
  options?: DharmashastraEngineOptions
): UpcomingFestivalResult[] {
  const results: UpcomingFestivalResult[] = [];
  const baseMidnight = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  for (let offset = 0; offset <= maxDays && results.length < count; offset++) {
    const scanDate = new Date(baseMidnight.getTime() + offset * 86400000);
    const fest = getFestivalForDate(scanDate, location, options);

    if (fest.isMajor || fest.category === 'Ekadashi' || fest.category === 'Pradosh') {
      const daysRemaining = offset;
      const daysText = daysRemaining === 0 ? 'Today' : (daysRemaining === 1 ? 'Tomorrow' : `In ${daysRemaining} days`);

      const dateFormatted = scanDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const dayOfWeek = scanDate.toLocaleDateString('en-US', { weekday: 'long' });

      results.push({
        name: fest.name,
        shortName: fest.shortName,
        hindiName: fest.hindiName,
        description: fest.description,
        icon: fest.icon,
        category: fest.category,
        isMajor: fest.isMajor,
        targetDate: scanDate,
        dateFormatted,
        dayOfWeek,
        daysRemaining,
        daysText,
        badge: daysText,
        briefRule: fest.briefRule,
        shastraReferences: fest.shastraReferences
      });
    }
  }

  return results;
}

