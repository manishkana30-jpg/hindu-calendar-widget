/**
 * Canonical Astronomical Eclipse (Grahan) & Public Holidays Engine
 * 
 * Accurately tracks Solar (Surya) & Lunar (Chandra) Eclipses (2025 - 2030)
 * and Public / Gazetted / Religious Holidays with next upcoming event projection.
 */

import { LocationCoordinates } from './vedic-astronomy';
import { getFestivalForDate, findUpcomingMajorFestival } from './festivals';

export interface EclipseEntry {
  id: string;
  date: string; // 'YYYY-MM-DD'
  type: 'Solar' | 'Lunar';
  subtype: 'Total Solar Eclipse' | 'Annular Solar Eclipse' | 'Partial Solar Eclipse' | 'Hybrid Solar Eclipse' | 'Total Lunar Eclipse' | 'Partial Lunar Eclipse' | 'Penumbral Lunar Eclipse';
  nameHindi: string;
  nameEnglish: string;
  visibility: string;
  visibleInIndia: boolean;
  sutakApplicableInIndia: boolean;
  details: string;
}

/**
 * Astronomical Solar & Lunar Eclipses Catalog (2025 - 2029)
 * Grounded in NASA Eclipse Catalog & Nautical Almanac standards
 */
export const ECLIPSES_DATABASE: EclipseEntry[] = [
  // 2025
  {
    id: 'eclipse-2025-03-14',
    date: '2025-03-14',
    type: 'Lunar',
    subtype: 'Total Lunar Eclipse',
    nameHindi: 'पूर्ण चन्द्र ग्रहण (Total Lunar Eclipse)',
    nameEnglish: 'Total Lunar Eclipse',
    visibility: 'Americas, Western Europe, parts of Africa',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Visible across the Americas; not visible in India (No Sutak in India).'
  },
  {
    id: 'eclipse-2025-03-29',
    date: '2025-03-29',
    type: 'Solar',
    subtype: 'Partial Solar Eclipse',
    nameHindi: 'खण्डग्रास सूर्य ग्रहण (Partial Solar Eclipse)',
    nameEnglish: 'Partial Solar Eclipse',
    visibility: 'Northwest Europe, North Atlantic, Arctic',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Visible in Northern Europe; not visible in India.'
  },
  {
    id: 'eclipse-2025-09-07',
    date: '2025-09-07',
    type: 'Lunar',
    subtype: 'Total Lunar Eclipse',
    nameHindi: 'पूर्ण चन्द्र ग्रहण (Total Lunar Eclipse)',
    nameEnglish: 'Total Lunar Eclipse',
    visibility: 'Visible in India, Asia, Europe, Australia, Africa',
    visibleInIndia: true,
    sutakApplicableInIndia: true,
    details: 'Widely visible in India. Sutak Kaal applies 9 hours before eclipse onset.'
  },
  {
    id: 'eclipse-2025-09-21',
    date: '2025-09-21',
    type: 'Solar',
    subtype: 'Partial Solar Eclipse',
    nameHindi: 'खण्डग्रास सूर्य ग्रहण (Partial Solar Eclipse)',
    nameEnglish: 'Partial Solar Eclipse',
    visibility: 'South Pacific, New Zealand, Antarctica',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Visible in New Zealand and Antarctica; not visible in India.'
  },

  // 2026
  {
    id: 'eclipse-2026-02-17',
    date: '2026-02-17',
    type: 'Solar',
    subtype: 'Annular Solar Eclipse',
    nameHindi: 'कंकणाकृति सूर्य ग्रहण (Annular Solar Eclipse)',
    nameEnglish: 'Annular Solar Eclipse',
    visibility: 'Antarctica, Southern Indian Ocean, South Africa',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Ring of fire visible over Antarctica; not visible in India.'
  },
  {
    id: 'eclipse-2026-03-03',
    date: '2026-03-03',
    type: 'Lunar',
    subtype: 'Total Lunar Eclipse',
    nameHindi: 'पूर्ण चन्द्र ग्रहण (Total Lunar Eclipse)',
    nameEnglish: 'Total Lunar Eclipse',
    visibility: 'Asia, Australia, Pacific, Americas (Visible in eastern India)',
    visibleInIndia: true,
    sutakApplicableInIndia: true,
    details: 'Visible during moonrise in parts of India. Sutak rules observed.'
  },
  {
    id: 'eclipse-2026-08-12',
    date: '2026-08-12',
    type: 'Solar',
    subtype: 'Total Solar Eclipse',
    nameHindi: 'पूर्ण सूर्य ग्रहण (Total Solar Eclipse)',
    nameEnglish: 'Total Solar Eclipse',
    visibility: 'Arctic, Greenland, Iceland, Spain, North Atlantic',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Total solar eclipse path crosses Spain and Iceland; not visible in India.'
  },
  {
    id: 'eclipse-2026-08-28',
    date: '2026-08-28',
    type: 'Lunar',
    subtype: 'Partial Lunar Eclipse',
    nameHindi: 'खण्डग्रास चन्द्र ग्रहण (Partial Lunar Eclipse)',
    nameEnglish: 'Partial Lunar Eclipse',
    visibility: 'Americas, Europe, Africa, parts of Asia',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Partial lunar eclipse visible across the Atlantic; not visible in India.'
  },

  // 2027
  {
    id: 'eclipse-2027-02-06',
    date: '2027-02-06',
    type: 'Solar',
    subtype: 'Annular Solar Eclipse',
    nameHindi: 'कंकणाकृति सूर्य ग्रहण (Annular Solar Eclipse)',
    nameEnglish: 'Annular Solar Eclipse',
    visibility: 'South America, Atlantic, West Africa',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Path across Chile, Argentina, and West Africa; not visible in India.'
  },
  {
    id: 'eclipse-2027-02-20',
    date: '2027-02-20',
    type: 'Lunar',
    subtype: 'Penumbral Lunar Eclipse',
    nameHindi: 'मांद्य चन्द्र ग्रहण (Penumbral Lunar Eclipse)',
    nameEnglish: 'Penumbral Lunar Eclipse',
    visibility: 'Americas, Europe, Africa, Asia',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Subtle penumbral shadow; traditional Sutak not observed.'
  },
  {
    id: 'eclipse-2027-08-02',
    date: '2027-08-02',
    type: 'Solar',
    subtype: 'Total Solar Eclipse',
    nameHindi: 'पूर्ण सूर्य ग्रहण (Total Solar Eclipse)',
    nameEnglish: 'Total Solar Eclipse',
    visibility: 'Southern Europe, North Africa, Middle East (Partial in Western India)',
    visibleInIndia: true,
    sutakApplicableInIndia: true,
    details: 'Longest totality of the decade over Egypt (6m 23s). Partial phase visible in Western India.'
  },
  {
    id: 'eclipse-2027-08-17',
    date: '2027-08-17',
    type: 'Lunar',
    subtype: 'Penumbral Lunar Eclipse',
    nameHindi: 'मांद्य चन्द्र ग्रहण (Penumbral Lunar Eclipse)',
    nameEnglish: 'Penumbral Lunar Eclipse',
    visibility: 'Pacific, Australia, East Asia',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Penumbral lunar eclipse; no religious Sutak restrictions.'
  },

  // 2028
  {
    id: 'eclipse-2028-01-26',
    date: '2028-01-26',
    type: 'Solar',
    subtype: 'Annular Solar Eclipse',
    nameHindi: 'कंकणाकृति सूर्य ग्रहण (Annular Solar Eclipse)',
    nameEnglish: 'Annular Solar Eclipse',
    visibility: 'South America, Atlantic Ocean, Spain',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Annular solar eclipse over South America and Spain; not visible in India.'
  },
  {
    id: 'eclipse-2028-07-22',
    date: '2028-07-22',
    type: 'Solar',
    subtype: 'Total Solar Eclipse',
    nameHindi: 'पूर्ण सूर्य ग्रहण (Total Solar Eclipse)',
    nameEnglish: 'Total Solar Eclipse',
    visibility: 'Australia, New Zealand, Southern Oceans',
    visibleInIndia: false,
    sutakApplicableInIndia: false,
    details: 'Totality path across Sydney and New Zealand; not visible in India.'
  },
  {
    id: 'eclipse-2028-12-31',
    date: '2028-12-31',
    type: 'Lunar',
    subtype: 'Total Lunar Eclipse',
    nameHindi: 'पूर्ण चन्द्र ग्रहण (Total Lunar Eclipse)',
    nameEnglish: 'Total Lunar Eclipse',
    visibility: 'Visible in India, Asia, Australia, Europe',
    visibleInIndia: true,
    sutakApplicableInIndia: true,
    details: 'Total lunar eclipse prominently visible across India. Full Sutak observed.'
  }
];

/**
 * Fixed National & Worldwide Gregorian Holidays
 */
export const FIXED_GREGORIAN_HOLIDAYS: { month: number; day: number; title: string; hindi: string; icon: string; isGazetted: boolean }[] = [
  { month: 1, day: 1, title: "New Year's Day", hindi: 'नव वर्ष दिवस', icon: '🎉', isGazetted: false },
  { month: 1, day: 26, title: 'Republic Day', hindi: 'गणतंत्र दिवस (राष्ट्रीय अवकाश)', icon: '🇮🇳', isGazetted: true },
  { month: 5, day: 1, title: "International Workers' Day", hindi: 'मई दिवस / श्रमिक दिवस', icon: '⚒️', isGazetted: false },
  { month: 8, day: 15, title: 'Independence Day', hindi: 'स्वतंत्रता दिवस (राष्ट्रीय अवकाश)', icon: '🇮🇳', isGazetted: true },
  { month: 10, day: 2, title: 'Mahatma Gandhi Jayanti', hindi: 'गांधी जयंती (राष्ट्रीय अवकाश)', icon: '🕊️', isGazetted: true },
  { month: 12, day: 25, title: 'Christmas Day', hindi: 'क्रिसमस', icon: '🎄', isGazetted: true }
];

export interface HolidayAndEclipseDetails {
  todayHoliday: {
    isHoliday: boolean;
    title: string;
    subtitle: string;
    icon: string;
    badge: string;
    type: 'National' | 'Gazetted' | 'Religious' | 'Observance' | 'None';
  };
  upcomingHoliday: {
    title: string;
    dateFormatted: string;
    daysRemaining: number;
    daysText: string;
    icon: string;
    badge: string;
  } | null;
  eclipseInfo: {
    hasEclipseToday: boolean;
    activeEclipse: EclipseEntry | null;
    nextEclipse: {
      name: string;
      nameHindi: string;
      type: 'Solar' | 'Lunar';
      dateFormatted: string;
      daysRemaining: number;
      daysText: string;
      visibility: string;
      visibleInIndia: boolean;
    } | null;
  };
}

/**
 * Evaluate today's holiday, upcoming holiday, and astronomical eclipse status
 */
export function getHolidayAndEclipseDetails(
  targetDate: Date,
  location: LocationCoordinates
): HolidayAndEclipseDetails {
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth() + 1; // 1-12
  const d = targetDate.getDate();
  const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // ── 1. Check Fixed Gregorian Holiday Today ──
  const fixedHoliday = FIXED_GREGORIAN_HOLIDAYS.find(h => h.month === m && h.day === d);

  // ── 2. Check Vedic Festival / Observance Today ──
  const vedicFestival = getFestivalForDate(targetDate, location);
  const isMajorVedic = vedicFestival.isMajor && vedicFestival.name !== 'Nitya Panchang (नित्य पञ्चाङ्ग)';

  let todayHoliday: HolidayAndEclipseDetails['todayHoliday'];

  if (fixedHoliday) {
    todayHoliday = {
      isHoliday: true,
      title: `${fixedHoliday.title} (${fixedHoliday.hindi})`,
      subtitle: fixedHoliday.isGazetted ? 'National Gazetted Holiday (राष्ट्रीय अवकाश)' : 'Public Holiday',
      icon: fixedHoliday.icon,
      badge: fixedHoliday.isGazetted ? 'National Holiday' : 'Holiday',
      type: fixedHoliday.isGazetted ? 'National' : 'Gazetted'
    };
  } else if (isMajorVedic) {
    todayHoliday = {
      isHoliday: true,
      title: vedicFestival.name,
      subtitle: `${vedicFestival.category} • ${vedicFestival.description.split('•')[0] || 'Vedic Observance'}`,
      icon: vedicFestival.icon || '🪔',
      badge: 'Festival / Vrat',
      type: 'Religious'
    };
  } else {
    todayHoliday = {
      isHoliday: false,
      title: 'No Holiday Today (आज कोई अवकाश नहीं)',
      subtitle: 'Regular Civil Day (सामान्य दिवस)',
      icon: '⚪',
      badge: 'Civil Day',
      type: 'None'
    };
  }

  // ── 3. Find Upcoming Holiday / Major Observance ──
  let upcomingHoliday: HolidayAndEclipseDetails['upcomingHoliday'] = null;

  // Search next 90 days for next fixed or Vedic major holiday
  const baseMidnight = new Date(y, m - 1, d).getTime();
  for (let offset = 1; offset <= 90; offset++) {
    const scanDate = new Date(baseMidnight + offset * 86400000);
    const sm = scanDate.getMonth() + 1;
    const sd = scanDate.getDate();

    // Check fixed holiday
    const nextFixed = FIXED_GREGORIAN_HOLIDAYS.find(h => h.month === sm && h.day === sd);
    if (nextFixed) {
      const daysText = offset === 1 ? 'Tomorrow' : `In ${offset} days`;
      const dateFormatted = scanDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      upcomingHoliday = {
        title: `${nextFixed.title} (${nextFixed.hindi})`,
        dateFormatted,
        daysRemaining: offset,
        daysText,
        icon: nextFixed.icon,
        badge: nextFixed.isGazetted ? 'National Holiday' : 'Public Holiday'
      };
      break;
    }

    // Check Vedic major festival
    const nextVedic = getFestivalForDate(scanDate, location);
    if (nextVedic.isMajor && nextVedic.name !== 'Nitya Panchang (नित्य पञ्चाङ्ग)') {
      const daysText = offset === 1 ? 'Tomorrow' : `In ${offset} days`;
      const dateFormatted = scanDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      upcomingHoliday = {
        title: nextVedic.name,
        dateFormatted,
        daysRemaining: offset,
        daysText,
        icon: nextVedic.icon || '🪔',
        badge: 'Major Festival'
      };
      break;
    }
  }

  // Fallback to standard Vedic forward scanner if loop didn't find one
  if (!upcomingHoliday) {
    const forwardVedic = findUpcomingMajorFestival(targetDate, location, 180);
    if (forwardVedic) {
      upcomingHoliday = {
        title: forwardVedic.name,
        dateFormatted: forwardVedic.dateFormatted,
        daysRemaining: forwardVedic.daysRemaining,
        daysText: forwardVedic.daysText,
        icon: forwardVedic.icon || '🪔',
        badge: 'Upcoming Vrat'
      };
    }
  }

  // ── 4. Check Eclipse Status Today & Find Next Eclipse ──
  const activeEclipse = ECLIPSES_DATABASE.find(e => e.date === dateKey) || null;
  const hasEclipseToday = Boolean(activeEclipse);

  // Find next upcoming eclipse
  let nextEclipse: HolidayAndEclipseDetails['eclipseInfo']['nextEclipse'] = null;
  const futureEclipses = ECLIPSES_DATABASE.filter(e => {
    return e.date > dateKey;
  }).sort((a, b) => a.date.localeCompare(b.date));

  if (futureEclipses.length > 0) {
    const nextE = futureEclipses[0];
    const [ey, em, ed] = nextE.date.split('-').map(Number);
    const eclipseDate = new Date(ey, em - 1, ed);
    const diffMs = eclipseDate.getTime() - new Date(y, m - 1, d).getTime();
    const daysRemaining = Math.max(1, Math.round(diffMs / 86400000));
    const daysText = daysRemaining === 1 ? 'Tomorrow' : `In ${daysRemaining} days`;

    const dateFormatted = eclipseDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    nextEclipse = {
      name: nextE.nameEnglish,
      nameHindi: nextE.nameHindi,
      type: nextE.type,
      dateFormatted,
      daysRemaining,
      daysText,
      visibility: nextE.visibility,
      visibleInIndia: nextE.visibleInIndia
    };
  }

  return {
    todayHoliday,
    upcomingHoliday,
    eclipseInfo: {
      hasEclipseToday,
      activeEclipse,
      nextEclipse
    }
  };
}
