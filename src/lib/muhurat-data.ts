import {
  calculateMonthlyMuhurat,
  DayMuhuratItem,
  ShubhKaryaCategory
} from './panchang/monthlyMuhuratEngine';
import { LocationCoordinates } from './vedic-astronomy';

export interface MuhuratCategoryDefinition {
  slug: string;
  categoryKey: ShubhKaryaCategory;
  name: string;
  hindiName: string;
  description: string;
  icon: string;
  favorableNakshatras: string[];
  favorableTithis: string[];
  avoidances: string[];
  scripturalRules: {
    english: string;
    hindi: string;
    reference: string;
  };
  faqs: { question: string; answer: string }[];
}

export const MUHURAT_CATEGORIES: Record<string, MuhuratCategoryDefinition> = {
  'griha-pravesh': {
    slug: 'griha-pravesh',
    categoryKey: 'griha_pravesh',
    name: 'Griha Pravesh Muhurat',
    hindiName: 'गृह प्रवेश मुहूर्त',
    description: 'Auspicious Vedic dates and daytime time windows for entering a newly constructed home (Apoorva), old renovated home (Sapoorva), or rented home.',
    icon: '🏡',
    favorableNakshatras: ['Rohini', 'Mrigashirsha', 'Uttara Phalguni', 'Chitra', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
    favorableTithis: ['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi'],
    avoidances: ['Amavasya', 'Rikta Tithis (Chaturthi, Navami, Chaturdashi)', 'Bhadra Karana', 'Tuesday (Mangalavara)', 'Rahu Kaal'],
    scripturalRules: {
      english: 'Per Muhurta Chintamani, Griha Pravesh should occur during Uttarayana (when Sun moves northward) in Shukla Paksha, avoiding combustion (Tara Asta) of Jupiter and Venus.',
      hindi: 'मुहूर्त चिन्तामणि के अनुसार गृह प्रवेश उत्तरायण सूर्य, शुक्ल पक्ष, स्थिर अथवा द्विस्वभाव लग्न में और गुरु-शुक्र के अस्त न होने पर ही करना श्रेयस्कर है।',
      reference: 'Muhurta Chintamani • Griha Pravesh Prakarana'
    },
    faqs: [
      {
        question: 'Which months are best for Griha Pravesh?',
        answer: 'Magha, Phalguna, Vaishakha, and Jyeshtha are considered prime months for Apoorva Griha Pravesh (newly built house).'
      },
      {
        question: 'Can Griha Pravesh be performed during Chaturmas?',
        answer: 'Traditionally, Apoorva Griha Pravesh is avoided during Chaturmas (Ashadha Shukla Devshayani Ekadashi to Kartika Shukla Devutthana Ekadashi), though Sapoorva or rented housewarming can be performed with specialized remedies.'
      }
    ]
  },

  'property-purchase': {
    slug: 'property-purchase',
    categoryKey: 'property',
    name: 'Property Purchase & Registry Muhurat',
    hindiName: 'संपत्ति / भूमि खरीद एवं रजिस्ट्री मुहूर्त',
    description: 'Auspicious timings for purchasing land, residential plots, commercial spaces, and executing official deed registry.',
    icon: '📜',
    favorableNakshatras: ['Mrigashirsha', 'Punarvasu', 'Magha', 'Purva Phalguni', 'Vishakha', 'Mula', 'Revati'],
    favorableTithis: ['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi', 'Purnima'],
    avoidances: ['Rahu Kaal window', 'Rikta Tithis', 'Vishti (Bhadra)', 'Planetary Eclipse Days'],
    scripturalRules: {
      english: 'Land and real estate agreements executed under favorable Mars (Bhumi Karaka) alignments and Fixed Ascendants (Taurus, Leo, Scorpio, Aquarius) ensure perpetual asset security.',
      hindi: 'भूमि क्रय एवं रजिस्ट्री स्थिर लग्न में तथा शुभ चौघड़िया (लाभ, अमृत, शुभ) में करने से संपत्ति में चिरस्थायी वृद्धि होती है।',
      reference: 'Brihat Samhita • Vastu Vidhana'
    },
    faqs: [
      {
        question: 'Which day of the week is best for property registration?',
        answer: 'Thursday (Guruvara), Friday (Shukravara), and Wednesday (Budhavara) are highly auspicious. Avoid signing deed contracts during Rahu Kaal or Gulika Kaal.'
      }
    ]
  },

  'bhoomi-pujan': {
    slug: 'bhoomi-pujan',
    categoryKey: 'construction',
    name: 'Bhoomi Pujan & Foundation Muhurat',
    hindiName: 'भूमि पूजन एवं गृह निर्माण मुहूर्त',
    description: 'Sacred groundbreaking and foundation stone laying ceremonies honoring Mother Earth (Bhumi Mata) and Vastu Purusha.',
    icon: '🏗️',
    favorableNakshatras: ['Rohini', 'Mrigashirsha', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Shatabhisha'],
    favorableTithis: ['Dwitiya', 'Tritiya', 'Panchami', 'Shashthi', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi'],
    avoidances: ['Bhadra', 'Rikta Tithis', 'Tuesday & Sunday for foundation laying', 'Solar & Lunar Eclipses'],
    scripturalRules: {
      english: 'Per Vastu Shastra, Bhoomi Pujan must align with the orientation of Vastu Purusha (sleeping direction based on the solar month) to ensure builder safety and architectural longevity.',
      hindi: 'वास्तु शास्त्र के अनुसार जिस दिशा में वास्तु पुरुष की दृष्टि हो, उसी कोण (ईशान अथवा आग्नेय) से उत्खनन प्रारम्भ करना शास्त्रसम्मत है।',
      reference: 'Vastu Shastra • Vastu Purusha Mandala Vidhi'
    },
    faqs: [
      {
        question: 'Where should the first foundation dig start?',
        answer: 'Excavation and foundation stone laying should commence in the North-East (Ishanya) corner after offering prayers to Lord Ganesha, Varuna, and Vastu Purusha.'
      }
    ]
  },

  'vehicle-purchase': {
    slug: 'vehicle-purchase',
    categoryKey: 'vehicle',
    name: 'Vehicle Purchase Muhurat',
    hindiName: 'वाहन खरीद मुहूर्त',
    description: 'Auspicious dates and Choghadiya timings for buying cars, two-wheelers, and commercial vehicles to ensure travel safety and longevity.',
    icon: '🚗',
    favorableNakshatras: ['Ashwini', 'Rohini', 'Mrigashirsha', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana'],
    favorableTithis: ['Pratipada', 'Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi', 'Purnima'],
    avoidances: ['Rahu Kaal', 'Amavasya', 'Bhadra Karana', 'Saturday for passenger cars (unless pre-advised)'],
    scripturalRules: {
      english: 'Vehicle acquisition under movable (Chara) or gentle (Mridu) constellations ensures swift, trouble-free travel and vehicle durability.',
      hindi: 'चर एवं मृदु नक्षत्रों में तथा चर, लाभ व अमृत चौघड़िया में वाहन क्रय करने से यात्रा निरापद और सुखद रहती है।',
      reference: 'Jyotish Tattva Chintamani • Yana Muhurat'
    },
    faqs: [
      {
        question: 'What should be done immediately after taking vehicle delivery?',
        answer: 'Perform Vahan Puja at a temple, place a Swastika with vermilion/sandalwood, crack a coconut before the front wheels, and place a protective nimbu-mirchi.'
      }
    ]
  },

  'business-opening': {
    slug: 'business-opening',
    categoryKey: 'business',
    name: 'Business & Shop Opening Muhurat',
    hindiName: 'दुकान एवं व्यापार उद्घाटन मुहूर्त',
    description: 'Auspicious time windows for opening new retail stores, corporate offices, factories, or commercial enterprises.',
    icon: '💼',
    favorableNakshatras: ['Ashwini', 'Rohini', 'Pushya', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Anuradha', 'Uttara Ashadha', 'Revati'],
    favorableTithis: ['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi', 'Purnima'],
    avoidances: ['Rahu Kaal', 'Rikta Tithis', 'Bhadra', 'Debilitated Moon days'],
    scripturalRules: {
      english: 'Inauguration during Labha or Amrit Choghadiya in Fixed Ascendant (Sthira Lagna) ensures steady business growth, customer retention, and commercial solvency.',
      hindi: 'व्यापार प्रारम्भ स्थिर लग्न में लाभ अथवा अमृत चौघड़िया में करने से व्यापार में स्थिरता व निरंतर धनवृद्धि होती है।',
      reference: 'Muhurta Martanda • Vanijya Prakarana'
    },
    faqs: [
      {
        question: 'Which Muhurat is best for commercial transactions?',
        answer: 'Abhijit Muhurat and daytime Labha / Amrit Choghadiyas are ideal for opening sales ledgers (Bahi Khata) and first invoices.'
      }
    ]
  },

  'gold-purchase': {
    slug: 'gold-purchase',
    categoryKey: 'gold',
    name: 'Gold & Jewelry Purchase Muhurat',
    hindiName: 'सोना / आभूषण खरीद मुहूर्त',
    description: 'Auspicious dates and Guru Pushya / Ravi Pushya yogas for buying gold, diamonds, and precious metals for lasting prosperity.',
    icon: '🪙',
    favorableNakshatras: ['Pushya', 'Rohini', 'Hasta', 'Swati', 'Dhanishta', 'Shatabhisha'],
    favorableTithis: ['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Ekadashi', 'Trayodashi', 'Purnima'],
    avoidances: ['Rahu Kaal', 'Amavasya', 'Bhadra', 'Rikta Tithis'],
    scripturalRules: {
      english: 'Gold is governed by Jupiter and the Sun; purchases on Pushya Nakshatra (especially Guru Pushya and Ravi Pushya) or Akshaya Tritiya grant everlasting Lakshmi.',
      hindi: 'गुरु पुष्य, रवि पुष्य अथवा शुभ योगों में स्वर्ण क्रय करने से अक्षय समृद्धि और माता महालक्ष्मी की कृपा प्राप्त होती है।',
      reference: 'Brihat Parashara Hora Shastra • Dhatu Vichara'
    },
    faqs: [
      {
        question: 'Why is Pushya Nakshatra famous for gold purchase?',
        answer: 'Pushya is known as the "Nourisher" (Poshanakarta); any asset acquired in Pushya expands continuously without decay.'
      }
    ]
  },

  'vivah-muhurat': {
    slug: 'vivah-muhurat',
    categoryKey: 'marriage',
    name: 'Vivah & Marriage Muhurat',
    hindiName: 'विवाह एवं लग्न मुहूर्त',
    description: 'Sacred wedding dates calculated by rigorous Shuddhi (purification) of Sun, Moon, Jupiter, and Tri-Bala alignment.',
    icon: '💍',
    favorableNakshatras: ['Rohini', 'Mrigashirsha', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
    favorableTithis: ['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi'],
    avoidances: ['Chaturmas (Devshayani to Devutthana)', 'Combustion of Guru & Shukra (Tara Asta)', 'Holashtak', 'Khar Maas', 'Bhadra'],
    scripturalRules: {
      english: 'Vedic marriage requires Tri-Bala Shuddhi (strength of Jupiter for bride, Sun for groom, and Moon for both), with strict avoidance of Vedha, Jamitra Dosha, and Kuja afflictions.',
      hindi: 'विवाह संस्कार हेतु त्रिबल शुद्धि (कन्या हेतु गुरुबल, वर हेतु सूर्यबल, तथा दोनों हेतु चन्द्रबल) और तारा शुद्धि अनिवार्य है।',
      reference: 'Muhurta Chintamani • Vivah Prakarana'
    },
    faqs: [
      {
        question: 'What is Tri-Bala Shuddhi in Marriage Muhurat?',
        answer: 'Tri-Bala Shuddhi ensures that Guru (Jupiter) is auspicious in transit for the bride, Surya (Sun) is strong for the groom, and Chandra (Moon) is well-placed for both partners.'
      },
      {
        question: 'Can marriage happen during Khar Maas or Holashtak?',
        answer: 'No, Khar Maas (when Sun transits Sagittarius or Pisces) and Holashtak (8 days before Holi) are strictly prohibited for Vivah Sanskar.'
      }
    ]
  }
};

export function getAllMuhuratSlugs(): string[] {
  return Object.keys(MUHURAT_CATEGORIES);
}

export function getMuhuratBySlug(slug: string): MuhuratCategoryDefinition | undefined {
  return MUHURAT_CATEGORIES[slug.toLowerCase().trim()];
}

export interface AuspiciousMonthDay {
  dayNumber: number;
  date: Date;
  dateFormatted: string;
  weekday: string;
  tithiName: string;
  nakshatraName: string;
  bestTimeWindows: string;
  rahuKaal: string;
  abhijit: string;
  specialYogas: string[];
}

export interface MonthlyMuhuratCalendarGroup {
  monthName: string;
  monthNumber: number;
  year: number;
  auspiciousDays: AuspiciousMonthDay[];
}

/**
 * Computes a full 12-month calendar of auspicious dates, exact daytime time windows,
 * and Rahu Kaal avoidance slots for a given Muhurat category.
 */
export function get12MonthMuhuratCalendar(
  categorySlug: string,
  startYear: number = 2026,
  location: LocationCoordinates = {
    name: 'New Delhi',
    country: 'India',
    latitude: 28.6692,
    longitude: 77.4538,
    timezone: 5.5,
    ianaTimezone: 'Asia/Kolkata',
    regionName: 'Delhi NCR'
  }
): MonthlyMuhuratCalendarGroup[] {
  const def = getMuhuratBySlug(categorySlug);
  if (!def) return [];

  const groups: MonthlyMuhuratCalendarGroup[] = [];
  const targetCategory = def.categoryKey;

  // Scan 12 months starting from current month or January of startYear
  for (let m = 1; m <= 12; m++) {
    const days = calculateMonthlyMuhurat(startYear, m, location);
    const auspiciousDays: AuspiciousMonthDay[] = [];

    const monthDate = new Date(startYear, m - 1, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    for (const d of days) {
      const matchesCategory = d.auspiciousActivities.some(a => a.category === targetCategory);
      if (matchesCategory || (d.isAuspiciousDay && !d.isRiktaTithi && !d.isAmavasya && !d.isBhadra)) {
        auspiciousDays.push({
          dayNumber: d.dayNumber,
          date: d.date,
          dateFormatted: `${d.weekdayShort}, ${d.dayNumber} ${monthDate.toLocaleDateString('en-US', { month: 'short' })} ${startYear}`,
          weekday: d.weekdayLong,
          tithiName: d.tithiName,
          nakshatraName: d.nakshatraName,
          bestTimeWindows: d.bestTimeWindowsString !== '—' ? d.bestTimeWindowsString : d.abhijitString,
          rahuKaal: d.rahuKaalString,
          abhijit: d.abhijitString,
          specialYogas: d.specialYogas
        });
      }
    }

    groups.push({
      monthName,
      monthNumber: m,
      year: startYear,
      auspiciousDays
    });
  }

  return groups;
}

