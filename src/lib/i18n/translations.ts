export type SupportedLanguage = 'en' | 'hi' | 'sa' | 'mr' | 'gu';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  localeCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', localeCode: 'en-IN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', localeCode: 'hi-IN' },
  { code: 'sa', label: 'Sanskrit', nativeName: 'संस्कृतम्', localeCode: 'sa-IN' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', localeCode: 'mr-IN' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', localeCode: 'gu-IN' },
];

export interface TranslationDictionary {
  // Brand & Top Navigation
  brandTitle: string;
  brandSubtitle: string;
  live: string;
  liveAstrometry: string;
  installApp: string;
  globalPanchang: string;
  home: string;
  selectLanguage: string;

  // City & GPS
  useGps: string;
  gpsActive: string;
  detectingGps: string;
  selectCity: string;

  // Sharing
  shareOnWhatsApp: string;
  share: string;
  copiedToClipboard: string;

  // Date Navigation & Live Mode
  prevDay: string;
  nextDay: string;
  liveMode: string;
  resetToLive: string;
  selectDate: string;

  // Card 1: Clock & Sun
  liveClock: string;
  selectedDate: string;
  almanac30Day: string;
  localSunrise: string;
  sunset: string;
  dayDuration: string;
  nightDuration: string;
  tap24hMuhurat: string;
  noEclipseToday: string;
  eclipseToday: string;
  sutakActive: string;
  nextHoliday: string;

  // Card 2: Vedic Panchang & Tithi
  today: string;
  masa: string;
  tithi: string;
  tithiEnds: string;
  nextTithi: string;
  starts: string;
  fullAlmanac: string;
  tapFullCalendar: string;
  amanta: string;
  purnimanta: string;
  paksha: string;
  ayana: string;
  ritu: string;
  vikramSamvat: string;
  shakaSamvat: string;
  kaliYuga: string;

  // Card 3: Observances & Festivals
  todaysObservance: string;
  majorFestival: string;
  vedicObservance: string;
  vratRules: string;
  viewFullVratCalendar: string;
  allDays: string;
  vratsAndFestivals: string;
  observed: string;
  filterAll: string;
  filterEkadashi: string;
  filterPradosh: string;
  filterPurnimaAmavasya: string;
  filterMajor: string;
  paranaTime: string;
  exploreMonthlyCalendar: string;
  dharmashastraRules: string;
  nityaPanchang: string;
  dailyVedicObservance: string;
  upcomingFestivals: string;
  viewAllFestivals: string;
  inDays: string;
  tomorrow: string;

  // Unified Almanac Table Headers & Modes
  allCalendarDays: string;
  vratAndTyoharAlmanac: string;
  colDateAndVara: string;
  colTithiAndPaksha: string;
  colNakshatraAndMasa: string;
  colMasa: string;
  colVratAndTyohar: string;
  colMobileDate: string;
  colMobileTithiPanchang: string;
  colMobileTithiPakshaMasa: string;
  colMobileVrat: string;
  tapToInspect: string;

  // Muhurat & Choghadiya Table Headers & Modes
  colMuhurat: string;
  colNature: string;
  colStartTime: string;
  colEndTime: string;
  colStatusDuration: string;
  colDeity: string;
  colActivity: string;
  activeNow: string;
  muhuratMatrix: string;
  all30Muhurats: string;
  dayMuhurats: string;
  nightMuhurats: string;
  shubhAshubhWindows: string;
  viewTable: string;

  // Gregorian Calendar & Holidays Modal
  tapGregorianCalendar: string;
  gregorianCalendarTitle: string;
  holidaysInMonth: string;
  noHolidaysInMonth: string;
  gazettedHoliday: string;
  publicHoliday: string;
  observanceHoliday: string;
  todayHolidayBadge: string;

  // Monthly Shubh Karya Muhurat Planner
  tabTodayMuhuratChoghadiya: string;
  tabMonthlyShubhKarya: string;
  todayShubhKarya: string;
  monthlyMuhurat: string;
  nextUpcomingMuhurat: string;
  viewFullMonthlyMuhurat: string;
  table30Days: string;
  monthlyMuhuratCalendarTitle: string;
  generalShubhWindow: string;
  filterAllActivities: string;
  filterPropertyPurchase: string;
  filterConstructionBhoomi: string;
  filterGrihaPravesh: string;
  filterVehiclePurchase: string;
  filterBusinessOpening: string;
  filterGoldPurchase: string;
  filterMarriageSanskar: string;
  showAllDaysOfMonth: string;
  showOnlyAuspiciousDays: string;
  colDateVara: string;
  colPurposeKarya: string;
  colAuspiciousWindow: string;
  colTithiNakshatra: string;
  colRahuKaalAvoid: string;
  noAuspiciousDaysFound: string;
  noAuspiciousWindow: string;
  shareMuhuratWhatsApp: string;

  // Dharma Shastra Tithi & Observance Rules
  dharmaShastraPrefix: string;
  ruleUdayaTithi: string;
  ruleEkadashiVedha: string;
  rulePradoshaKaal: string;
  ruleChandrodaya: string;
  ruleNishitaKaal: string;
  ruleKshayaTithi: string;
  ruleVriddhiTithi: string;
  rulePurnimaAmavasya: string;

  // Five Limbs
  fiveLimbsTitle: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  vaar: string;
  auspiciousAbhijit: string;
  inauspiciousRahuKaal: string;
  panchakStatus: string;
  panchakActive: string;
  panchakFree: string;
  dishaShool: string;
  moonSign: string;
  sunSign: string;

  // Tabs
  tabPanchang: string;
  tabChoghadiya: string;
  tabMuhurat: string;
  tabAstrometry: string;

  // Choghadiya
  daytimeChoghadiya: string;
  nighttimeChoghadiya: string;
  auspicious: string;
  inauspicious: string;
  neutral: string;
  ruler: string;

  // Shastra & Modal Rules
  shastraRuleHeader: string;
  shastraAuthority: string;
  close: string;
  references: string;
  switchLang: string;
  viewEnglish: string;
  viewHindi: string;

  // Floating Alert Banner
  alertBannerTitle: string;
  alertBannerDesc: string;
  getDailyAlert: string;
  activatingAlerts: string;
  iosSetupRequired: string;
  iosSetupGuide: string;

  // Footer & General
  aboutUs: string;
  contactUs: string;
  privacyPolicy: string;
  termsOfService: string;
  offlinePwaReady: string;
  astrometricScience: string;
  complianceTrust: string;
  intellectualProperty: string;
}

export const UI_TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    brandTitle: 'Daily Tithi',
    brandSubtitle: 'Live Hindu Calendar & Panchang',
    live: 'Live',
    liveAstrometry: 'Live Astrometry',
    installApp: 'Install App',
    globalPanchang: 'Global Panchang',
    home: 'Home',
    selectLanguage: 'Select Language',

    useGps: 'Use GPS',
    gpsActive: 'GPS Active',
    detectingGps: 'Detecting...',
    selectCity: 'Select City Location',

    shareOnWhatsApp: 'Share Panchang on WhatsApp',
    share: 'Share',
    copiedToClipboard: 'Panchang copied to clipboard!',

    prevDay: 'Previous Day',
    nextDay: 'Next Day',
    liveMode: 'Live',
    resetToLive: 'Live Mode',
    selectDate: 'Select Date',

    liveClock: 'LIVE CLOCK',
    selectedDate: 'SELECTED DATE',
    almanac30Day: '30-Day Almanac',
    localSunrise: 'Local Sunrise',
    sunset: 'Sunset',
    dayDuration: 'Day Duration',
    nightDuration: 'Night Duration',
    tap24hMuhurat: 'See All Shubh Muhurat & Choghadiya',
    noEclipseToday: 'No Eclipse Today',
    eclipseToday: 'Eclipse Today',
    sutakActive: 'Sutak Active',
    nextHoliday: 'Next:',

    today: 'TODAY',
    masa: 'MASA',
    tithi: 'TITHI',
    tithiEnds: 'Tithi Ends',
    nextTithi: 'Next Tithi',
    starts: 'Starts',
    fullAlmanac: 'Full Almanac',
    tapFullCalendar: 'Tap for Full Panchang & Tithi Timings',
    amanta: 'Amanta',
    purnimanta: 'Purnimanta',
    paksha: 'Paksha',
    ayana: 'Ayana',
    ritu: 'Ritu',
    vikramSamvat: 'Vikram Samvat',
    shakaSamvat: 'Shaka Samvat',
    kaliYuga: 'Kali Yuga',

    todaysObservance: "TODAY'S VRAT & TYOHAR",
    majorFestival: 'MAJOR FESTIVAL',
    vedicObservance: 'VEDIC VRAT & TYOHAR',
    vratRules: 'Vrat Rules',
    viewFullVratCalendar: 'View Full Vrat & Tyohar Calendar',
    allDays: 'All Days',
    vratsAndFestivals: 'Vrat & Tyohar',
    observed: 'Observed',
    filterAll: 'All Vrats & Tyohar',
    filterEkadashi: 'Ekadashi',
    filterPradosh: 'Pradosh',
    filterPurnimaAmavasya: 'Purnima / Amavasya',
    filterMajor: 'Major Festivals',
    paranaTime: 'Parana Time',
    exploreMonthlyCalendar: 'Explore Monthly Vrat & Tyohar Calendar',
    dharmashastraRules: 'Dharmashastra Rules',
    nityaPanchang: 'Nitya Panchang',
    dailyVedicObservance: 'Daily Sacred Vedic Observance',
    upcomingFestivals: 'Upcoming Vrat & Tyohar',
    viewAllFestivals: 'View All Vrat & Tyohar',
    inDays: 'In {n} days',
    tomorrow: 'Tomorrow',

    allCalendarDays: 'All Calendar Days',
    vratAndTyoharAlmanac: 'Vrat & Tyohar Almanac',
    colDateAndVara: 'Date & Vara',
    colTithiAndPaksha: 'Tithi & Paksha',
    colNakshatraAndMasa: 'Masa',
    colMasa: 'Masa',
    colVratAndTyohar: 'Vrat & Tyohar',
    colMobileDate: 'Date',
    colMobileTithiPanchang: 'Tithi, Paksha & Masa',
    colMobileTithiPakshaMasa: 'Tithi, Paksha & Masa',
    colMobileVrat: 'Vrat / Tyohar',
    tapToInspect: 'Details',

    colMuhurat: 'Muhurat',
    colNature: 'Type / Nature',
    colStartTime: 'Start Time',
    colEndTime: 'End Time',
    colStatusDuration: 'Status / Duration',
    colDeity: 'Presiding Deity',
    colActivity: 'Activity & Guidance',
    activeNow: 'Active Now',
    muhuratMatrix: 'Daily 24-Hour Muhurat Matrix',
    all30Muhurats: 'All 30 Muhurats',
    dayMuhurats: '15 Day Muhurats',
    nightMuhurats: '15 Night Muhurats',
    shubhAshubhWindows: 'Shubh & Ashubh Windows',
    viewTable: 'Table View',

    // Gregorian Calendar & Holidays Modal
    tapGregorianCalendar: 'Tap for Full Gregorian Calendar & Holidays ›',
    gregorianCalendarTitle: 'Gregorian Calendar & Holidays',
    holidaysInMonth: 'Holidays & Observances in',
    noHolidaysInMonth: 'No major public holidays scheduled for this month.',
    gazettedHoliday: 'Gazetted Holiday',
    publicHoliday: 'Public Holiday',
    observanceHoliday: 'Observance',
    todayHolidayBadge: "Today's Holiday",

    // Monthly Shubh Karya Muhurat Planner
    tabTodayMuhuratChoghadiya: "Today's Muhurat & Choghadiya",
    tabMonthlyShubhKarya: 'Monthly Shubh Karya Muhurat',
    todayShubhKarya: "Today's Shubh Karya Muhurat",
    monthlyMuhurat: 'Monthly Muhurat',
    nextUpcomingMuhurat: 'Next Shubh Karya',
    viewFullMonthlyMuhurat: 'View Full Monthly Shubh Karya Muhurat Calendar',
    table30Days: '30-Day Table',
    monthlyMuhuratCalendarTitle: 'Monthly Shubh Karya Muhurat Calendar',
    generalShubhWindow: 'Auspicious Window',
    filterAllActivities: 'All Activities',
    filterPropertyPurchase: 'House / Property Purchase',
    filterConstructionBhoomi: 'Bhoomi Pujan & Construction',
    filterGrihaPravesh: 'Griha Pravesh',
    filterVehiclePurchase: 'Vehicle Purchase',
    filterBusinessOpening: 'Business & Shop Opening',
    filterGoldPurchase: 'Gold & Valuables',
    filterMarriageSanskar: 'Vivah & Sanskar',
    showAllDaysOfMonth: 'Show All Days of Month',
    showOnlyAuspiciousDays: 'Show Only Auspicious Days',
    colDateVara: 'Date & Vara',
    colPurposeKarya: 'Shubh Karya / Purpose',
    colAuspiciousWindow: 'Auspicious Time Window',
    colTithiNakshatra: 'Tithi & Nakshatra',
    colRahuKaalAvoid: 'Rahu Kaal (Avoid)',
    noAuspiciousDaysFound: 'No auspicious days found for this category in this month.',
    noAuspiciousWindow: 'Inauspicious / No Window',
    shareMuhuratWhatsApp: 'Share Muhurat on WhatsApp',
    dharmaShastraPrefix: '⚖️ Dharma Shastra:',
    ruleUdayaTithi: 'Observed based on Udaya Tithi - Active at {time} Sunrise',
    ruleEkadashiVedha: 'Smartha and Vaishnava Ekadashi - Dashami Vedha Rule',
    rulePradoshaKaal: 'Pradosh Kaal Vyapini - Active during evening twilight post sunset',
    ruleChandrodaya: 'Chandrodaya Vyapini - Active during Moonrise',
    ruleNishitaKaal: 'Nishita Kaal Vyapini - Active during midnight worship hour',
    ruleKshayaTithi: 'Kshaya Tithi Rule - Began after sunrise and ended before next sunrise',
    ruleVriddhiTithi: 'Vriddhi Tithi Rule - Spans across two consecutive sunrises',
    rulePurnimaAmavasya: 'Purnima / Amavasya Parva - Aparahna and Udaya Vyapini Rule',

    fiveLimbsTitle: 'Five Limbs of Vedic Panchang',
    nakshatra: 'Nakshatra',
    yoga: 'Yoga',
    karana: 'Karana',
    vaar: 'Vaar',
    auspiciousAbhijit: 'Shubh Abhijit Muhurat',
    inauspiciousRahuKaal: 'Ashubh Rahu Kaal',
    panchakStatus: 'Panchak Status',
    panchakActive: 'Panchak Active',
    panchakFree: 'Panchak Free',
    dishaShool: 'Disha Shool',
    moonSign: 'Moon Sign',
    sunSign: 'Sun Sign',

    tabPanchang: 'Panchang',
    tabChoghadiya: 'Choghadiya',
    tabMuhurat: '24h Muhurat',
    tabAstrometry: 'Astrometry',

    daytimeChoghadiya: 'Day Choghadiya',
    nighttimeChoghadiya: 'Night Choghadiya',
    auspicious: 'Shubh',
    inauspicious: 'Ashubh',
    neutral: 'Madhyam',
    ruler: 'Ruler',

    shastraRuleHeader: 'Shastra Canonical Rule',
    shastraAuthority: 'Surya Siddhanta & Nirnayasindhu',
    close: 'Close',
    references: 'References',
    switchLang: 'हिन्दी में देखें',
    viewEnglish: 'English',
    viewHindi: 'हिन्दी',

    alertBannerTitle: 'Daily Tithi Notification Setup',
    alertBannerDesc: 'Get sacred Udaya Tithi and Muhurat alerts directly at local sunrise.',
    getDailyAlert: 'Get Daily Tithi Alert',
    activatingAlerts: 'Activating Alerts...',
    iosSetupRequired: 'iOS Setup Required',
    iosSetupGuide: "Tap Share ⎋ and select 'Add to Home Screen' to enable alerts.",

    aboutUs: 'About Us & Methodology',
    contactUs: 'Contact & Inquiries',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    offlinePwaReady: '100% Offline PWA Ready',
    astrometricScience: 'Astrometric Science',
    complianceTrust: 'Compliance & Trust',
    intellectualProperty: 'Intellectual Property',
  },

  hi: {
    brandTitle: 'डेली तिथि',
    brandSubtitle: 'लाइव हिन्दू पञ्चाङ्ग एवं वैदिक पंचांग',
    live: 'लाइव',
    liveAstrometry: 'लाइव ज्योतिष गणना',
    installApp: 'ऐप इंस्टॉल करें',
    globalPanchang: 'सम्पूर्ण पञ्चाङ्ग',
    home: 'होम',
    selectLanguage: 'भाषा चुनें',

    useGps: 'GPS का उपयोग करें',
    gpsActive: 'GPS सक्रिय',
    detectingGps: 'स्थान खोज रहे हैं...',
    selectCity: 'शहर का चयन करें',

    shareOnWhatsApp: 'व्हाट्सएप पर शेयर करें',
    share: 'शेयर',
    copiedToClipboard: 'पञ्चाङ्ग क्लिपबोर्ड पर कॉपी हुआ!',

    prevDay: 'पिछला दिन',
    nextDay: 'अगला दिन',
    liveMode: 'लाइव',
    resetToLive: 'लाइव समय',
    selectDate: 'तिथि चुनें',

    liveClock: 'लाइव समय',
    selectedDate: 'चयनित दिनांक',
    almanac30Day: '३०-दिवसीय पञ्चाङ्ग',
    localSunrise: 'स्थानीय सूर्योदय',
    sunset: 'सूर्यास्त',
    dayDuration: 'दिनमान',
    nightDuration: 'रात्रिमान',
    tap24hMuhurat: '२४-घंटे सम्पूर्ण मुहूर्त तालिका देखें',
    noEclipseToday: 'आज कोई ग्रहण नहीं',
    eclipseToday: 'आज ग्रहण है',
    sutakActive: 'सूतक सक्रिय',
    nextHoliday: 'अगला:',

    today: 'आज',
    masa: 'मास',
    tithi: 'तिथि',
    tithiEnds: 'तिथि समाप्त',
    nextTithi: 'आगामी तिथि',
    starts: 'प्रारम्भ',
    fullAlmanac: 'सम्पूर्ण पंचांग',
    tapFullCalendar: 'मासिक पंचांग एवं तिथि समय देखें',
    amanta: 'अमान्त',
    purnimanta: 'पूर्णिमान्त',
    paksha: 'पक्ष',
    ayana: 'अयन',
    ritu: 'ऋतु',
    vikramSamvat: 'विक्रम संवत्',
    shakaSamvat: 'शक संवत्',
    kaliYuga: 'कलियुग',

    todaysObservance: 'आज का व्रत एवं त्योहार',
    majorFestival: 'महापर्व',
    vedicObservance: 'वैदिक पर्व',
    vratRules: 'शास्त्र नियम',
    viewFullVratCalendar: 'संपूर्ण व्रत एवं त्योहार कैलेंडर देखें',
    allDays: 'सभी दिन',
    vratsAndFestivals: 'व्रत एवं पर्व',
    observed: 'मान्य',
    filterAll: 'सभी व्रत व पर्व',
    filterEkadashi: 'एकादशी',
    filterPradosh: 'प्रदोष',
    filterPurnimaAmavasya: 'पूर्णिमा / अमावस्या',
    filterMajor: 'प्रमुख पर्व',
    paranaTime: 'पारणा समय',
    exploreMonthlyCalendar: 'मासिक व्रत एवं त्योहार कैलेंडर देखें',
    dharmashastraRules: 'धर्मशास्त्र निर्णय',
    nityaPanchang: 'नित्य पञ्चाङ्ग',
    dailyVedicObservance: 'दैनिक वैदिक पूजन एवं नित्य कर्म',
    upcomingFestivals: 'आगामी त्यौहार',
    viewAllFestivals: 'सभी त्यौहार देखें',
    inDays: '{n} दिन में',
    tomorrow: 'कल',

    allCalendarDays: 'सम्पूर्ण दिवस',
    vratAndTyoharAlmanac: 'व्रत एवं त्योहार सारणी',
    colDateAndVara: 'दिनांक / वार',
    colTithiAndPaksha: 'तिथि / पक्ष',
    colNakshatraAndMasa: 'मास',
    colMasa: 'मास',
    colVratAndTyohar: 'व्रत एवं त्योहार',
    colMobileDate: 'दिनांक',
    colMobileTithiPanchang: 'तिथि, पक्ष व मास',
    colMobileTithiPakshaMasa: 'तिथि, पक्ष व मास',
    colMobileVrat: 'व्रत / पर्व',
    tapToInspect: 'विवरण',

    colMuhurat: 'मुहूर्त',
    colNature: 'प्रकृति',
    colStartTime: 'प्रारम्भ समय',
    colEndTime: 'समाप्ति समय',
    colStatusDuration: 'अवधि / स्थिति',
    colDeity: 'अधिष्ठाता देवता',
    colActivity: 'कार्य एवं मार्गदर्शन',
    activeNow: 'सक्रिय',
    muhuratMatrix: 'दैनिक २४ घंटे मुहूर्त तालिका',
    all30Muhurats: 'सम्पूर्ण ३० मुहूर्त',
    dayMuhurats: 'दिन के १५ मुहूर्त',
    nightMuhurats: 'रात्रि के १५ मुहूर्त',
    shubhAshubhWindows: 'शुभ एवं अशुभ मुहूर्त',
    viewTable: 'तालिका दृश्य',

    // Gregorian Calendar & Holidays Modal
    tapGregorianCalendar: 'पूर्ण ग्रेगोरियन कैलेंडर और छुट्टियां देखें ›',
    gregorianCalendarTitle: 'ग्रेगोरियन कैलेंडर एवं अवकाश',
    holidaysInMonth: 'माह के अवकाश एवं पर्व',
    noHolidaysInMonth: 'इस माह में कोई प्रमुख सार्वजनिक अवकाश निर्धारित नहीं है।',
    gazettedHoliday: 'राजपत्रित अवकाश',
    publicHoliday: 'सार्वजनिक अवकाश',
    observanceHoliday: 'ऐच्छिक / पर्व',
    todayHolidayBadge: 'आज का अवकाश',

    // Monthly Shubh Karya Muhurat Planner
    tabTodayMuhuratChoghadiya: 'आज का मुहूर्त व चौघड़िया',
    tabMonthlyShubhKarya: 'मासिक शुभ कार्य मुहूर्त',
    todayShubhKarya: 'आज का शुभ कार्य मुहूर्त',
    monthlyMuhurat: 'मासिक मुहूर्त',
    nextUpcomingMuhurat: 'अगला शुभ मुहूर्त',
    viewFullMonthlyMuhurat: 'पूर्ण मासिक शुभ कार्य मुहूर्त कैलेंडर देखें',
    table30Days: '३०-दिवसीय तालिका',
    monthlyMuhuratCalendarTitle: 'मासिक शुभ कार्य मुहूर्त कैलेंडर',
    generalShubhWindow: 'शुभ समय',
    filterAllActivities: 'सभी शुभ कार्य',
    filterPropertyPurchase: 'मकान / संपत्ति खरीद',
    filterConstructionBhoomi: 'भूमि पूजन / गृह निर्माण',
    filterGrihaPravesh: 'गृह प्रवेश',
    filterVehiclePurchase: 'वाहन खरीद',
    filterBusinessOpening: 'व्यापार प्रारम्भ',
    filterGoldPurchase: 'स्वर्ण / आभूषण खरीद',
    filterMarriageSanskar: 'विवाह व संस्कार',
    showAllDaysOfMonth: 'माह के सभी दिन',
    showOnlyAuspiciousDays: 'केवल शुभ दिन',
    colDateVara: 'दिनांक / वार',
    colPurposeKarya: 'शुभ कार्य / प्रयोजन',
    colAuspiciousWindow: 'शुभ समय अवधि',
    colTithiNakshatra: 'तिथि एवं नक्षत्र',
    colRahuKaalAvoid: 'राहु काल (वर्जित)',
    noAuspiciousDaysFound: 'इस माह में इस कार्य हेतु कोई शुभ मुहूर्त नहीं है।',
    noAuspiciousWindow: 'अशुभ / कोई मुहूर्त नहीं',
    shareMuhuratWhatsApp: 'व्हाट्सएप पर मुहूर्त साझा करें',
    dharmaShastraPrefix: '⚖️ धर्मशास्त्र नियम:',
    ruleUdayaTithi: 'उदया तिथि के आधार पर मान्य - {time} सूर्योदय के समय सक्रिय',
    ruleEkadashiVedha: 'स्मार्त एवं वैष्णव एकादशी - दशमी वेध एवं उदया तिथि नियम',
    rulePradoshaKaal: 'प्रदोष काल व्यापिनी - सूर्यास्त के उपरांत संध्या त्रयोदशी वेला में मान्य',
    ruleChandrodaya: 'चन्द्रोदय व्यापिनी - चन्द्रोदय के समय चतुर्थी तिथि उपस्थिति अनुसार मान्य',
    ruleNishitaKaal: 'निशीथ काल व्यापिनी - मध्यरात्रि महानिशीथ काल में मान्य',
    ruleKshayaTithi: 'क्षय तिथि नियम - सूर्योदय के बाद प्रारंभ होकर अगले सूर्योदय से पूर्व समाप्त',
    ruleVriddhiTithi: 'वृद्धि तिथि नियम - लगातार दो सूर्योदयों में व्याप्त रहने से दोनों दिन मान्य',
    rulePurnimaAmavasya: 'पर्व तिथि - अपराह्न एवं उदया व्यापिनी नियम अनुसार मान्य',

    fiveLimbsTitle: 'पञ्चाङ्ग के पाँच मूल अंग',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    vaar: 'वार',
    auspiciousAbhijit: 'शुभ अभिजित मुहूर्त',
    inauspiciousRahuKaal: 'अशुभ राहु काल',
    panchakStatus: 'पञ्चक स्थिति',
    panchakActive: 'पञ्चक सक्रिय',
    panchakFree: 'पञ्चक मुक्त',
    dishaShool: 'दिशा शूल',
    moonSign: 'चन्द्र राशि',
    sunSign: 'सूर्य राशि',

    tabPanchang: 'पञ्चाङ्ग',
    tabChoghadiya: 'चौघड़िया',
    tabMuhurat: '२४-घंटे मुहूर्त',
    tabAstrometry: 'ग्रह स्थिति',

    daytimeChoghadiya: 'दिन का चौघड़िया',
    nighttimeChoghadiya: 'रात्रि का चौघड़िया',
    auspicious: 'शुभ',
    inauspicious: 'अशुभ',
    neutral: 'मध्यम',
    ruler: 'स्वामी',

    shastraRuleHeader: 'धर्मशास्त्र निर्णय नियम',
    shastraAuthority: 'सूर्यसिद्धान्त एवं निर्णयसिन्धु',
    close: 'बंद करें',
    references: 'शास्त्र सन्दर्भ',
    switchLang: 'View in English',
    viewEnglish: 'English',
    viewHindi: 'हिन्दी',

    alertBannerTitle: 'दैनिक तिथि सूचना सेवा',
    alertBannerDesc: 'सूर्योदय के समय पवित्र उदय तिथि एवं मुहूर्त सूचनाएं प्राप्त करें।',
    getDailyAlert: 'दैनिक तिथि अलर्ट चालू करें',
    activatingAlerts: 'अलर्ट सक्रिय हो रहा है...',
    iosSetupRequired: 'iOS सेटअप आवश्यक',
    iosSetupGuide: "शेयर ⎋ आइकन पर टैप करें और 'होम स्क्रीन पर जोड़ें' चुनें।",

    aboutUs: 'हमारे बारे में एवं पद्धति',
    contactUs: 'सम्पर्क एवं पूछताछ',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    offlinePwaReady: '१००% ऑफ़लाइन PWA समर्थित',
    astrometricScience: 'ज्योतिष विज्ञान एवं सिद्धांत',
    complianceTrust: 'विश्वसनीयता एवं मानक',
    intellectualProperty: 'बौद्धिक सम्पदा',
  },

  sa: {
    brandTitle: 'दैनिकतिथिः',
    brandSubtitle: 'प्रत्यक्षवैदिकपञ्चाङ्गम्',
    live: 'प्रत्यक्षम्',
    liveAstrometry: 'प्रत्यक्षज्योतिर्गणितम्',
    installApp: 'अनुप्रयोगं स्थापयतु',
    globalPanchang: 'सम्पूर्णपञ्चाङ्गम्',
    home: 'मुख्यपृष्ठम्',
    selectLanguage: 'भाषां वृणुवन्तु',

    useGps: 'GPS प्रयोज्यताम्',
    gpsActive: 'GPS सक्रियम्',
    detectingGps: 'स्थानं संवीक्ष्यते...',
    selectCity: 'नगरं चिनोतु',

    shareOnWhatsApp: 'व्हाट्सएप-माध्यमेन प्रेष्यताम्',
    share: 'प्रेषयतु',
    copiedToClipboard: 'पञ्चाङ्गं संलिखितम्!',

    prevDay: 'पूर्वदिनम्',
    nextDay: 'अग्रिमदिनम्',
    liveMode: 'प्रत्यक्षम्',
    resetToLive: 'प्रत्यक्षकालः',
    selectDate: 'दिनाङ्कः चिनोतु',

    liveClock: 'प्रत्यक्षसमयः',
    selectedDate: 'चयनितदिनाङ्कः',
    almanac30Day: 'त्रिंशद्दिनात्मकपञ्चाङ्गम्',
    localSunrise: 'स्थानिकसूर्योदयः',
    sunset: 'सूर्यास्तः',
    dayDuration: 'दिनमानम्',
    nightDuration: 'रात्रिमानम्',
    tap24hMuhurat: 'चतुर्विंशतिहोरात्मकमुहूर्तसारणीं पश्यन्तु',
    noEclipseToday: 'अद्य न ग्रहणम्',
    eclipseToday: 'अद्य ग्रहणमस्ति',
    sutakActive: 'सूतकं सक्रियम्',
    nextHoliday: 'अग्रिमम्:',

    today: 'अद्य',
    masa: 'मासः',
    tithi: 'तिथिः',
    tithiEnds: 'तिथ्यन्तः',
    nextTithi: 'अग्रिमतिथिः',
    starts: 'प्रारम्भः',
    fullAlmanac: 'सम्पूर्णपञ्चाङ्गम्',
    tapFullCalendar: 'मासिकपञ्चाङ्गं तिथिवेलां च पश्यन्तु',
    amanta: 'अमान्तः',
    purnimanta: 'पूर्णिमान्तः',
    paksha: 'पक्षः',
    ayana: 'अयनम्',
    ritu: 'ऋतुः',
    vikramSamvat: 'विक्रमसंवत्',
    shakaSamvat: 'शकसंवत्',
    kaliYuga: 'कलियुगम्',

    todaysObservance: 'अद्यतनं व्रतं पर्व च',
    majorFestival: 'महापर्व',
    vedicObservance: 'वैदिकपर्व',
    vratRules: 'शास्त्रनियमाः',
    viewFullVratCalendar: 'सम्पूर्णव्रतपर्वदिनदर्शिकां पश्यन्तु',
    allDays: 'सर्वे दिवसाः',
    vratsAndFestivals: 'व्रताः पर्वाणि च',
    observed: 'मान्यम्',
    filterAll: 'सर्वे व्रताः पर्वाणि च',
    filterEkadashi: 'एकादशी',
    filterPradosh: 'प्रदोषः',
    filterPurnimaAmavasya: 'पूर्णिमा / अमावास्या',
    filterMajor: 'प्रमुखाणि पर्वाणि',
    paranaTime: 'पारणसमयः',
    exploreMonthlyCalendar: 'मासिकव्रतपर्वसारणीं पश्यन्तु',
    dharmashastraRules: 'धर्मशास्त्रनिर्णयः',
    nityaPanchang: 'नित्यपञ्चाङ्गम्',
    dailyVedicObservance: 'दैनिकं वैदिकपूजनम्',
    upcomingFestivals: 'आगामिपर्वाणि',
    viewAllFestivals: 'सर्वाणि पर्वाणि पश्यन्तु',
    inDays: '{n} दिनेषु',
    tomorrow: 'श्वः',

    allCalendarDays: 'सर्वे दिवसाः',
    vratAndTyoharAlmanac: 'व्रतोत्सवसारणी',
    colDateAndVara: 'दिनाङ्कः / वारः',
    colTithiAndPaksha: 'तिथिः / पक्षः',
    colNakshatraAndMasa: 'मासः',
    colMasa: 'मासः',
    colVratAndTyohar: 'व्रतोत्सवाः',
    colMobileDate: 'दिनाङ्कः',
    colMobileTithiPanchang: 'तिथिपक्षमासाः',
    colMobileTithiPakshaMasa: 'तिथिपक्षमासाः',
    colMobileVrat: 'व्रतम् / पर्व',
    tapToInspect: 'विवरणम्',

    colMuhurat: 'मुहूर्तः',
    colNature: 'प्रकृतिः',
    colStartTime: 'प्रारम्भसमयः',
    colEndTime: 'समाप्तिसमयः',
    colStatusDuration: 'अवधिः / स्थितिः',
    colDeity: 'अधिष्ठातृदेवता',
    colActivity: 'कार्यं मार्गदर्शनं च',
    activeNow: 'सक्रियः',
    muhuratMatrix: 'दैनिक २४होरा मुहूर्ततालिका',
    all30Muhurats: 'सम्पूर्ण ३० मुहूर्ताः',
    dayMuhurats: 'दिनस्य १५ मुहूर्ताः',
    nightMuhurats: 'रात्रेः १५ मुहूर्ताः',
    shubhAshubhWindows: 'शुभाशुभमुहूर्ताः',
    viewTable: 'तालिकादृश्यम्',

    // Gregorian Calendar & Holidays Modal
    tapGregorianCalendar: 'सम्पूर्ण ग्रेगोरियन दिनदर्शिकां पश्यन्तु ›',
    gregorianCalendarTitle: 'ग्रेगोरियन दिनदर्शिका तथा अवकाशाः',
    holidaysInMonth: 'मासस्य अवकाशाः उत्सवाश्च',
    noHolidaysInMonth: 'अस्मिन् मासे कोऽपि प्रमुखः सार्वजनिकः अवकाशः नास्ति।',
    gazettedHoliday: 'राजपत्रितावकाशः',
    publicHoliday: 'सार्वजनिक अवकाशः',
    observanceHoliday: 'उत्सवः',
    todayHolidayBadge: 'अद्य अवकाशः',

    // Monthly Shubh Karya Muhurat Planner
    tabTodayMuhuratChoghadiya: 'अद्यतनमुहूर्तः चौघडिया च',
    tabMonthlyShubhKarya: 'मासिकशुभकार्यमुहूर्ताः',
    todayShubhKarya: 'अद्यतनं शुभकार्यमुहूर्तः',
    monthlyMuhurat: 'मासिकमुहूर्तः',
    nextUpcomingMuhurat: 'अग्रिमः शुभमुहूर्तः',
    viewFullMonthlyMuhurat: 'सम्पूर्णमासिकशुभकार्यमुहूर्तदिनदर्शिकां पश्यन्तु',
    table30Days: 'त्रिंशद्दिनात्मकतालिका',
    monthlyMuhuratCalendarTitle: 'मासिकशुभकार्यमुहूर्तदिनदर्शिका',
    generalShubhWindow: 'शुभकालः',
    filterAllActivities: 'सर्वाणि शुभकार्याणि',
    filterPropertyPurchase: 'गृह / सम्पत्ति क्रयः',
    filterConstructionBhoomi: 'भूमिपूजनम् गृहनिर्माणं च',
    filterGrihaPravesh: 'गृहप्रवेशः',
    filterVehiclePurchase: 'वाहनक्रयः',
    filterBusinessOpening: 'व्यापारप्रारम्भः',
    filterGoldPurchase: 'स्वर्णक्रयः',
    filterMarriageSanskar: 'विवाहः संस्काराश्च',
    showAllDaysOfMonth: 'मासस्य सर्वदिनानि',
    showOnlyAuspiciousDays: 'केवलं शुभदिनानि',
    colDateVara: 'दिनाङ्कः / वासरः',
    colPurposeKarya: 'शुभकार्यम् / प्रयोजनम्',
    colAuspiciousWindow: 'शुभकालः',
    colTithiNakshatra: 'तिथिः नक्षत्रं च',
    colRahuKaalAvoid: 'राहुकालः (वर्ज्यः)',
    noAuspiciousDaysFound: 'अस्मिन् मासे अस्य कार्यस्य शुभमुहूर्तः नास्ति।',
    noAuspiciousWindow: 'अशुभः कालः',
    shareMuhuratWhatsApp: 'व्हाट्सएप द्वारा मुहूर्तं प्रेषयन्तु',
    dharmaShastraPrefix: '⚖️ धर्मशास्त्रनियमः:',
    ruleUdayaTithi: 'उदयतिथ्याधारेण मान्यम् - {time} सूर्योदयकाले सक्रिया',
    ruleEkadashiVedha: 'स्मार्तवैष्णवैकादशी - दशमीवेधोदयातिथिनियमः',
    rulePradoshaKaal: 'प्रदोषकालव्यापिनी - सूर्यास्तानन्तरं सन्ध्यात्रयोदशीवेलायां मान्या',
    ruleChandrodaya: 'चन्द्रोदयव्यापिनी - चन्द्रोदयकाले चतुर्थीतिथ्युपस्थित्यनुसारं मान्या',
    ruleNishitaKaal: 'निशीथकालव्यापिनी - मध्यरात्रौ महानिशीथकाले मान्या',
    ruleKshayaTithi: 'क्षयतिथिनियमः - सूर्योदयानन्तरं प्रारभ्य अग्रिमसूर्योदयात् प्रागेव समाप्ता',
    ruleVriddhiTithi: 'वृद्धितिथिनियमः - क्रमिकसूर्योदयद्वये व्याप्तत्वात् उभयत्र मान्या',
    rulePurnimaAmavasya: 'पर्वतिथिः - अपराह्णोदयाव्यापिनियमानुसारं मान्या',

    fiveLimbsTitle: 'पञ्चाङ्गस्य पञ्च अङ्गानि',
    nakshatra: 'नक्षत्रम्',
    yoga: 'योगः',
    karana: 'करणम्',
    vaar: 'वासरः',
    auspiciousAbhijit: 'शुभः अभिजित्मुहूर्तः',
    inauspiciousRahuKaal: 'अशुभः राहुकालः',
    panchakStatus: 'पञ्चकस्थितिः',
    panchakActive: 'पञ्चकं सक्रियम्',
    panchakFree: 'पञ्चकमुक्तम्',
    dishaShool: 'दिशाशूलम्',
    moonSign: 'चन्द्रराशिः',
    sunSign: 'सूर्यराशिः',

    tabPanchang: 'पञ्चाङ्गम्',
    tabChoghadiya: 'चौघटिका',
    tabMuhurat: 'मुहूर्ताः',
    tabAstrometry: 'ग्रहस्थितिः',

    daytimeChoghadiya: 'दिवा चौघटिका',
    nighttimeChoghadiya: 'रात्रि चौघटिका',
    auspicious: 'शुभम्',
    inauspicious: 'अशुभम्',
    neutral: 'मध्यमम्',
    ruler: 'अधिपतिः',

    shastraRuleHeader: 'धर्मशास्त्रनिर्णयनियमः',
    shastraAuthority: 'सूर्यसिद्धान्तः निर्णयसिन्धुश्च',
    close: 'पिदधातु',
    references: 'शास्त्रसन्दर्भाः',
    switchLang: 'View in English',
    viewEnglish: 'English',
    viewHindi: 'हिन्दी',

    alertBannerTitle: 'दैनिकतिथिसूचनासेवा',
    alertBannerDesc: 'सूर्योदयकाले पवित्रोदयतिथेः सूचनां प्राप्नुवन्तु।',
    getDailyAlert: 'दैनिकतिथिसूचनां स्वीकरोतु',
    activatingAlerts: 'सक्रियत क्रियते...',
    iosSetupRequired: 'iOS व्यवस्थापनम् आवश्यकम्',
    iosSetupGuide: "संविभजनं ⎋ स्पृशित्वा 'गृहपटलयोगः' चिनोतु।",

    aboutUs: 'अस्मद्विषये पद्धतिश्च',
    contactUs: 'सम्पर्कः पृच्छा च',
    privacyPolicy: 'गोपनीयतानीतिः',
    termsOfService: 'सेवाशर्ताः',
    offlinePwaReady: '१००% अन्तर्जालरहितं PWA',
    astrometricScience: 'ज्योतिर्विज्ञानम्',
    complianceTrust: 'विश्वसनीयता',
    intellectualProperty: 'बौद्धिकसम्पत्',
  },

  mr: {
    brandTitle: 'डेली तिथी',
    brandSubtitle: 'थेट हिंदू दिनदर्शिका व वैदिक पंचांग',
    live: 'थेट',
    liveAstrometry: 'थेट ज्योतिषीय गणना',
    installApp: 'अ‍ॅप इन्स्टॉल करा',
    globalPanchang: 'संपूर्ण पंचांग',
    home: 'मुख्यपृष्ठ',
    selectLanguage: 'भाषा निवडा',

    useGps: 'GPS वापरा',
    gpsActive: 'GPS सक्रिय',
    detectingGps: 'स्थान शोधत आहे...',
    selectCity: 'शहर निवडा',

    shareOnWhatsApp: 'व्हॉट्सअ‍ॅपवर शेअर करा',
    share: 'शेअर',
    copiedToClipboard: 'पंचांग क्लिपबोर्डवर कॉपी केले!',

    prevDay: 'मागील दिवस',
    nextDay: 'पुढील दिवस',
    liveMode: 'थेट',
    resetToLive: 'थेट वेळ',
    selectDate: 'तारीख निवडा',

    liveClock: 'थेट घड्याळ',
    selectedDate: 'निवडलेली तारीख',
    almanac30Day: '३०-दिवसीय पंचांग',
    localSunrise: 'स्थानिक सूर्योदय',
    sunset: 'सूर्यास्त',
    dayDuration: 'दिनमान',
    nightDuration: 'रात्रीचा काळ',
    tap24hMuhurat: '२४-तास संपूर्ण मुहूर्त तक्ता पहा',
    noEclipseToday: 'आज कोणतेही ग्रहण नाही',
    eclipseToday: 'आज ग्रहण आहे',
    sutakActive: 'वेध / सूतक सुरू',
    nextHoliday: 'पुढील:',

    today: 'आज',
    masa: 'महिना',
    tithi: 'तिथी',
    tithiEnds: 'तिथी समाप्ती',
    nextTithi: 'पुढील तिथी',
    starts: 'सुरू',
    fullAlmanac: 'संपूर्ण पंचांग',
    tapFullCalendar: 'मासिक पंचांग व तिथीची वेळ पहा',
    amanta: 'अमांत',
    purnimanta: 'पौर्णिमांत',
    paksha: 'पक्ष',
    ayana: 'अयन',
    ritu: 'ऋतू',
    vikramSamvat: 'विक्रम संवत',
    shakaSamvat: 'शक संवत',
    kaliYuga: 'कलियुग',

    todaysObservance: 'आजचे व्रत व सण',
    majorFestival: 'महापर्व',
    vedicObservance: 'वैदिक सण',
    vratRules: 'शास्त्र नियम',
    viewFullVratCalendar: 'संपूर्ण व्रत व सण दिनदर्शिका पहा',
    allDays: 'सर्व दिवस',
    vratsAndFestivals: 'व्रत व सण',
    observed: 'मान्य',
    filterAll: 'सर्व व्रत व सण',
    filterEkadashi: 'एकादशी',
    filterPradosh: 'प्रदोष',
    filterPurnimaAmavasya: 'पौर्णिमा / अमावास्या',
    filterMajor: 'प्रमुख सण',
    paranaTime: 'पारणा वेळ',
    exploreMonthlyCalendar: 'मासिक व्रत व सण कॅलेंडर पहा',
    dharmashastraRules: 'धर्मशास्त्र निर्णय',
    nityaPanchang: 'नित्य पंचांग',
    dailyVedicObservance: 'दैनिक वैदिक पूजन व नित्य कर्म',
    upcomingFestivals: 'आगामी सण',
    viewAllFestivals: 'सर्व सण पहा',
    inDays: '{n} दिवसांत',
    tomorrow: 'उद्या',

    allCalendarDays: 'सर्व दिवस',
    vratAndTyoharAlmanac: 'व्रत व सण सारणी',
    colDateAndVara: 'दिनांक / वार',
    colTithiAndPaksha: 'तिथी / पक्ष',
    colNakshatraAndMasa: 'मास',
    colMasa: 'मास',
    colVratAndTyohar: 'व्रत व सण',
    colMobileDate: 'दिनांक',
    colMobileTithiPanchang: 'तिथी, पक्ष व मास',
    colMobileTithiPakshaMasa: 'तिथी, पक्ष व मास',
    colMobileVrat: 'व्रत / सण',
    tapToInspect: 'तपशील',

    colMuhurat: 'मुहूर्त',
    colNature: 'प्रकृती',
    colStartTime: 'प्रारंभ वेळ',
    colEndTime: 'समाप्ती वेळ',
    colStatusDuration: 'कालावधी / स्थिती',
    colDeity: 'अधिष्ठाता देवता',
    colActivity: 'कार्य व मार्गदर्शन',
    activeNow: 'सक्रिय',
    muhuratMatrix: 'दैनिक २४ तास मुहूर्त सारणी',
    all30Muhurats: 'सर्व ३० मुहूर्त',
    dayMuhurats: 'दिवसाचे १५ मुहूर्त',
    nightMuhurats: 'रात्रीचे १५ मुहूर्त',
    shubhAshubhWindows: 'शुभ व अशुभ मुहूर्त',
    viewTable: 'सारणी दृश्य',

    // Gregorian Calendar & Holidays Modal
    tapGregorianCalendar: 'संपूर्ण ग्रेगोरियन दिनदर्शिका व सुट्ट्या पहा ›',
    gregorianCalendarTitle: 'ग्रेगोरियन दिनदर्शिका व सुट्ट्या',
    holidaysInMonth: 'महिन्यातील सुट्ट्या व सण',
    noHolidaysInMonth: 'या महिन्यात कोणतीही मोठी सार्वजनिक सुट्टी नाही.',
    gazettedHoliday: 'राजपत्रित सुट्टी',
    publicHoliday: 'सार्वजनिक सुट्टी',
    observanceHoliday: 'सण / उत्सव',
    todayHolidayBadge: 'आजची सुट्टी',

    // Monthly Shubh Karya Muhurat Planner
    tabTodayMuhuratChoghadiya: 'आजचा मुहूर्त व चौघडिया',
    tabMonthlyShubhKarya: 'मासिक शुभ कार्य मुहूर्त',
    todayShubhKarya: 'आजचा शुभ कार्य मुहूर्त',
    monthlyMuhurat: 'मासिक मुहूर्त',
    nextUpcomingMuhurat: 'पुढील शुभ मुहूर्त',
    viewFullMonthlyMuhurat: 'पूर्ण मासिक शुभ कार्य मुहूर्त दिनदर्शिका पहा',
    table30Days: '३०-दिवसीय सारणी',
    monthlyMuhuratCalendarTitle: 'मासिक शुभ कार्य मुहूर्त दिनदर्शिका',
    generalShubhWindow: 'शुभ वेळ',
    filterAllActivities: 'सर्व शुभ कार्ये',
    filterPropertyPurchase: 'घर / मालमत्ता खरेदी',
    filterConstructionBhoomi: 'भूमीपूजन व गृहनिर्माण',
    filterGrihaPravesh: 'गृहप्रवेश',
    filterVehiclePurchase: 'वाहन खरेदी',
    filterBusinessOpening: 'व्यवसाय सुरू करणे',
    filterGoldPurchase: 'सोने खरेदी',
    filterMarriageSanskar: 'विवाह व संस्कार',
    showAllDaysOfMonth: 'महिन्याचे सर्व दिवस',
    showOnlyAuspiciousDays: 'फक्त शुभ दिवस',
    colDateVara: 'दिनांक / वार',
    colPurposeKarya: 'शुभ कार्य / प्रयोजन',
    colAuspiciousWindow: 'शुभ वेळ',
    colTithiNakshatra: 'तिथी व नक्षत्र',
    colRahuKaalAvoid: 'राहु काळ (वर्ज्य)',
    noAuspiciousDaysFound: 'या महिन्यात या कार्यासाठी कोणताही शुभ मुहूर्त नाही.',
    noAuspiciousWindow: 'अशुभ / वेळ नाही',
    shareMuhuratWhatsApp: 'व्हॉट्सॲपवर मुहूर्त शेअर करा',
    dharmaShastraPrefix: '⚖️ धर्मशास्त्र नियम:',
    ruleUdayaTithi: 'उदया तिथीच्या आधारे मान्य - {time} सूर्योदयाच्या वेळी सक्रिय',
    ruleEkadashiVedha: 'स्मार्त व वैष्णव एकादशी - दशमी वेध व उदया तिथी नियम',
    rulePradoshaKaal: 'प्रदोष काळ व्यापिनी - सूर्यास्तानंतर संध्याकाळी त्रयोदशी वेळेत मान्य',
    ruleChandrodaya: 'चंद्रोदय व्यापिनी - चंद्रोदयाच्या वेळी चतुर्थी तिथीनुसार मान्य',
    ruleNishitaKaal: 'निशीथ काळ व्यापिनी - मध्यरात्री महानिशीथ काळात मान्य',
    ruleKshayaTithi: 'क्षय तिथी नियम - सूर्योदयानंतर सुरू होऊन पुढील सूर्योदयापूर्वी समाप्त',
    ruleVriddhiTithi: 'वृद्धी तिथी नियम - सलग दोन सूर्योदयांमध्ये व्याप्त असल्याने दोन्ही दिवस मान्य',
    rulePurnimaAmavasya: 'पर्व तिथी - अपराह्न व उदया व्यापिनी नियमानुसार मान्य',

    fiveLimbsTitle: 'पंचांगाची पाच मुख्य अंगे',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    vaar: 'वार',
    auspiciousAbhijit: 'शुभ अभिजित मुहूर्त',
    inauspiciousRahuKaal: 'अशुभ राहु काळ',
    panchakStatus: 'पंचक स्थिती',
    panchakActive: 'पंचक सक्रिय',
    panchakFree: 'पंचक मुक्त',
    dishaShool: 'दिशा शूल',
    moonSign: 'चंद्र रास',
    sunSign: 'सूर्य रास',

    tabPanchang: 'पंचांग',
    tabChoghadiya: 'चौघडिया',
    tabMuhurat: '२४-तास मुहूर्त',
    tabAstrometry: 'ग्रह स्थिती',

    daytimeChoghadiya: 'दिवसाचे चौघडिया',
    nighttimeChoghadiya: 'रात्रीचे चौघडिया',
    auspicious: 'शुभ',
    inauspicious: 'अशुभ',
    neutral: 'मध्यम',
    ruler: 'स्वामी',

    shastraRuleHeader: 'धर्मशास्त्र निर्णय नियम',
    shastraAuthority: 'सूर्यसिद्धांत व निर्णयसिंधू',
    close: 'बंद करा',
    references: 'शास्त्र संदर्भ',
    switchLang: 'View in English',
    viewEnglish: 'English',
    viewHindi: 'हिन्दी',

    alertBannerTitle: 'दैनिक तिथी सूचना सेवा',
    alertBannerDesc: 'सूर्योदयाच्या वेळी पवित्र उदय तिथी व मुहूर्त सूचना मिळवा.',
    getDailyAlert: 'दैनिक तिथी सूचना सुरू करा',
    activatingAlerts: 'सुरू होत आहे...',
    iosSetupRequired: 'iOS सेटअप आवश्यक',
    iosSetupGuide: "शेअर ⎋ चिन्हावर टॅप करा आणि 'होम स्क्रीनवर जोडा' निवडा.",

    aboutUs: 'आमच्याबद्दल व पद्धती',
    contactUs: 'संपर्क व चौकशी',
    privacyPolicy: 'गोपनीयता धोरण',
    termsOfService: 'सेवा अटी',
    offlinePwaReady: '१००% ऑफलाइन PWA तयार',
    astrometricScience: 'खगोल व ज्योतिष शास्त्र',
    complianceTrust: 'विश्वासार्हता व मानके',
    intellectualProperty: 'बौद्धिक संपदा',
  },

  gu: {
    brandTitle: 'ડેઇલી તિથિ',
    brandSubtitle: 'લાઈવ હિન્દુ પંચાંગ અને કેલેન્ડર',
    live: 'લાઈવ',
    liveAstrometry: 'લાઈવ જ્યોતિષ ગણતરી',
    installApp: 'એપ ઇન્સ્ટોલ કરો',
    globalPanchang: 'સંપૂર્ણ પંચાંગ',
    home: 'હોમ',
    selectLanguage: 'ભાષા પસંદ કરો',

    useGps: 'GPS વાપરો',
    gpsActive: 'GPS સક્રિય',
    detectingGps: 'સ્થાન શોધી રહ્યું છે...',
    selectCity: 'શહેર પસંદ કરો',

    shareOnWhatsApp: 'વોટ્સએપ પર શેર કરો',
    share: 'શેર',
    copiedToClipboard: 'પંચાંગ ક્લિપબોર્ડ પર કોપી થયું!',

    prevDay: 'પાછલો દિવસ',
    nextDay: 'આગલો દિવસ',
    liveMode: 'લાઈવ',
    resetToLive: 'લાઈવ સમય',
    selectDate: 'તારીખ પસંદ કરો',

    liveClock: 'લાઈવ સમય',
    selectedDate: 'પસંદ કરેલ તારીખ',
    almanac30Day: '૩૦-દિવસીય પંચાંગ',
    localSunrise: 'સ્થાનિક સૂર્યોદય',
    sunset: 'સૂર્યાસ્ત',
    dayDuration: 'દિવસનો સમય',
    nightDuration: 'રાત્રિનો સમય',
    tap24hMuhurat: '૨૪-કલાક સંપૂર્ણ મુહૂર્ત સારણી જુઓ',
    noEclipseToday: 'આજે કોઈ ગ્રહણ નથી',
    eclipseToday: 'આજે ગ્રહણ છે',
    sutakActive: 'સૂતક સક્રિય',
    nextHoliday: 'આગામી:',

    today: 'આજે',
    masa: 'માસ',
    tithi: 'તિથિ',
    tithiEnds: 'તિથિ સમાપ્તિ',
    nextTithi: 'આગામી તિથિ',
    starts: 'શરૂ',
    fullAlmanac: 'સંપૂર્ણ પંચાંગ',
    tapFullCalendar: 'માસિક પંચાંગ અને તિથિ સમય જુઓ',
    amanta: 'અમાન્ત',
    purnimanta: 'પૂર્ણિમાન્ત',
    paksha: 'પક્ષ',
    ayana: 'અયન',
    ritu: 'ઋતુ',
    vikramSamvat: 'વિક્રમ સંવત',
    shakaSamvat: 'શક સંવત',
    kaliYuga: 'કલિયુગ',

    todaysObservance: 'આજનો વ્રત અને તહેવાર',
    majorFestival: 'મહાપર્વ',
    vedicObservance: 'વૈદિક પર્વ',
    vratRules: 'શાસ્ત્ર નિયમો',
    viewFullVratCalendar: 'સંપૂર્ણ વ્રત અને તહેવાર કેલેન્ડર જુઓ',
    allDays: 'બધા દિવસો',
    vratsAndFestivals: 'વ્રત અને તહેવારો',
    observed: 'માન્ય',
    filterAll: 'બધા વ્રત અને તહેવારો',
    filterEkadashi: 'એકાદશી',
    filterPradosh: 'પ્રદોષ',
    filterPurnimaAmavasya: 'પૂનમ / અમાસ',
    filterMajor: 'મુખ્ય તહેવારો',
    paranaTime: 'પારણા સમય',
    exploreMonthlyCalendar: 'માસિક વ્રત અને તહેવાર કેલેન્ડર જુઓ',
    dharmashastraRules: 'ધર્મશાસ્ત્ર નિર્ણય',
    nityaPanchang: 'નિત્ય પંચાંગ',
    dailyVedicObservance: 'દૈનિક વૈદિક પૂજન અને નિત્ય કર્મ',
    upcomingFestivals: 'આગામી તહેવારો',
    viewAllFestivals: 'બધા તહેવારો જુઓ',
    inDays: '{n} દિવસમાં',
    tomorrow: 'આવતીકાલે',

    allCalendarDays: 'બધા દિવસો',
    vratAndTyoharAlmanac: 'વ્રત અને તહેવાર પંચાંગ',
    colDateAndVara: 'તારીખ / વાર',
    colTithiAndPaksha: 'તિથિ / પક્ષ',
    colNakshatraAndMasa: 'માસ',
    colMasa: 'માસ',
    colVratAndTyohar: 'વ્રત અને તહેવાર',
    colMobileDate: 'તારીખ',
    colMobileTithiPanchang: 'તિથિ, પક્ષ અને માસ',
    colMobileTithiPakshaMasa: 'તિથિ, પક્ષ અને માસ',
    colMobileVrat: 'વ્રત / પર્વ',
    tapToInspect: 'વિગત',

    colMuhurat: 'મુહૂર્ત',
    colNature: 'પ્રકૃતિ',
    colStartTime: 'પ્રારંભ સમય',
    colEndTime: 'સમાપ્તિ સમય',
    colStatusDuration: 'અવધિ / સ્થિતિ',
    colDeity: 'અધિષ્ઠાતા દેવતા',
    colActivity: 'કાર્ય અને માર્ગદર્શન',
    activeNow: 'સક્રિય',
    muhuratMatrix: 'દૈનિક ૨૪ કલાક મુહૂર્ત કોષ્ટક',
    all30Muhurats: 'બધા ૩૦ મુહૂર્ત',
    dayMuhurats: 'દિવસના ૧૫ મુહૂર્ત',
    nightMuhurats: 'રાત્રિના ૧૫ મુહૂર્ત',
    shubhAshubhWindows: 'શુભ અને અશુભ મુહૂર્ત',
    viewTable: 'કોષ્ટક દ્રશ્ય',

    // Gregorian Calendar & Holidays Modal
    tapGregorianCalendar: 'સંપૂર્ણ ગ્રેગોરિયન કેલેન્ડર અને રજાઓ જુઓ ›',
    gregorianCalendarTitle: 'ગ્રેગોરિયન કેલેન્ડર અને રજાઓ',
    holidaysInMonth: 'મહિનાની રજાઓ અને તહેવારો',
    noHolidaysInMonth: 'આ મહિનામાં કોઈ મોટી જાહેર રજા નિર્ધારિત નથી.',
    gazettedHoliday: 'ગેઝેટેડ રજા',
    publicHoliday: 'જાહેર રજા',
    observanceHoliday: 'તહેવાર / ઉજવણી',
    todayHolidayBadge: 'આજની રજા',

    // Monthly Shubh Karya Muhurat Planner
    tabTodayMuhuratChoghadiya: 'આજનો મુહૂર્ત અને ચોઘડિયા',
    tabMonthlyShubhKarya: 'માસિક શુભ કાર્ય મુહૂર્ત',
    todayShubhKarya: 'આજનો શુભ કાર્ય મુહૂર્ત',
    monthlyMuhurat: 'માસિક મુહૂર્ત',
    nextUpcomingMuhurat: 'આગામી શુભ મુહૂર્ત',
    viewFullMonthlyMuhurat: 'સંપૂર્ણ માસિક શુભ કાર્ય મુહૂર્ત કેલેન્ડર જુઓ',
    table30Days: '૩૦-દિવસીય યાદી',
    monthlyMuhuratCalendarTitle: 'માસિક શુભ કાર્ય મુહૂર્ત કેલેન્ડર',
    generalShubhWindow: 'શુભ સમય',
    filterAllActivities: 'બધા શુભ કાર્યો',
    filterPropertyPurchase: 'મકાન / મિલકત ખરીદી',
    filterConstructionBhoomi: 'ભૂમિ પૂજન અને ગૃહ નિર્માણ',
    filterGrihaPravesh: 'ગૃહ પ્રવેશ',
    filterVehiclePurchase: 'વાહન ખરીદી',
    filterBusinessOpening: 'વેપાર શરૂઆત',
    filterGoldPurchase: 'સોનું / આભૂષણ ખરીદી',
    filterMarriageSanskar: 'લગ્ન અને સંસ્કાર',
    showAllDaysOfMonth: 'મહિનાના તમામ દિવસો',
    showOnlyAuspiciousDays: 'માત્ર શુભ દિવસો',
    colDateVara: 'તારીખ / વાર',
    colPurposeKarya: 'શુભ કાર્ય / પ્રયોજન',
    colAuspiciousWindow: 'શુભ સમય',
    colTithiNakshatra: 'તિથિ અને નક્ષત્ર',
    colRahuKaalAvoid: 'રાહુ કાળ (વર્જ્ય)',
    noAuspiciousDaysFound: 'આ મહિનામાં આ કાર્ય માટે કોઈ શુભ મુહૂર્ત નથી.',
    noAuspiciousWindow: 'અશુભ / મુહૂર્ત નથી',
    shareMuhuratWhatsApp: 'વોટ્સએપ પર મુહૂર્ત શેર કરો',
    dharmaShastraPrefix: '⚖️ ધર્મશાસ્ત્ર નિયમ:',
    ruleUdayaTithi: 'ઉદયા તિથિના આધારે માન્ય - {time} સૂર્યોદય સમયે સક્રિય',
    ruleEkadashiVedha: 'સ્માર્ત અને વૈષ્ણવ એકાદશી - દશમી વેધ નિયમ',
    rulePradoshaKaal: 'પ્રદોષ કાળ વ્યાપિની - સૂર્યાસ્ત પછી સંધ્યા ત્રયોદશી વેળામાં માન્ય',
    ruleChandrodaya: 'ચંદ્રોદય વ્યાપિની - ચંદ્રોદય સમયે ચતુર્થી તિથિ અનુસાર માન્ય',
    ruleNishitaKaal: 'નિશીથ કાળ વ્યાપિની - મધ્યરાત્રિ મહાનિશીથ કાળમાં માન્ય',
    ruleKshayaTithi: 'ક્ષય તિથિ નિયમ - સૂર્યોદય પછી શરૂ થઈ આગળના સૂર્યોદય પહેલાં સમાપ્ત',
    ruleVriddhiTithi: 'વૃદ્ધિ તિથિ નિયમ - સતત બે સૂર્યોદયમાં વ્યાપ્ત હોવાથી બંને દિવસ માન્ય',
    rulePurnimaAmavasya: 'પર્વ તિથિ - અપરાહ્ન અને ઉદયા વ્યાપિની નિયમ અનુસાર માન્ય',

    fiveLimbsTitle: 'પંચાંગના પાંચ મુખ્ય અંગ',
    nakshatra: 'નક્ષત્ર',
    yoga: 'યોગ',
    karana: 'કરણ',
    vaar: 'વાર',
    auspiciousAbhijit: 'શુભ અભિજિત મુહૂર્ત',
    inauspiciousRahuKaal: 'અશુભ રાહુ કાળ',
    panchakStatus: 'પંચક સ્થિતિ',
    panchakActive: 'પંચક સક્રિય',
    panchakFree: 'પંચક મુક્ત',
    dishaShool: 'દિશા શૂળ',
    moonSign: 'ચંદ્ર રાશિ',
    sunSign: 'સૂર્ય રાશિ',

    tabPanchang: 'પંચાંગ',
    tabChoghadiya: 'ચોઘડિયા',
    tabMuhurat: '૨૪-કલાક મુહૂર્ત',
    tabAstrometry: 'ગ્રહ સ્થિતિ',

    daytimeChoghadiya: 'દિવસના ચોઘડિયા',
    nighttimeChoghadiya: 'રાત્રિના ચોઘડિયા',
    auspicious: 'શુભ',
    inauspicious: 'અશુભ',
    neutral: 'મધ્યમ',
    ruler: 'સ્વામી',

    shastraRuleHeader: 'ધર્મશાસ્ત્ર નિર્ણય નિયમ',
    shastraAuthority: 'સૂર્યસિદ્ધાંત અને નિર્ણયસિંધુ',
    close: 'બંધ કરો',
    references: 'શાસ્ત્ર સંદર્ભો',
    switchLang: 'View in English',
    viewEnglish: 'English',
    viewHindi: 'હિन्दी',

    alertBannerTitle: 'દૈનિક તિથિ સૂચના સેવા',
    alertBannerDesc: 'સૂર્યોદય સમયે પવિત્ર ઉદય તિથિ અને મુહૂર્ત સૂચનાઓ મેળવો.',
    getDailyAlert: 'દૈનિક તિથિ એલર્ટ શરૂ કરો',
    activatingAlerts: 'શરૂ થઈ રહ્યું છે...',
    iosSetupRequired: 'iOS સેટઅપ જરૂરી',
    iosSetupGuide: "શેર ⎋ પર ટેપ કરો અને 'હોમ સ્ક્રીન પર ઉમેરો' પસંદ કરો.",

    aboutUs: 'અમારા વિશે અને પદ્ધતિ',
    contactUs: 'સંપર્ક અને પૂછપરછ',
    privacyPolicy: 'ગોપનીયતા નીતિ',
    termsOfService: 'સેવાની શરતો',
    offlinePwaReady: '૧૦૦% ઑફલાઇન PWA તૈયાર',
    astrometricScience: 'જ્યોતિષ વિજ્ઞાન અને ગણતરી',
    complianceTrust: 'વિશ્વાસ અને ધોરણો',
    intellectualProperty: 'બૌદ્ધિક સંપત્તિ',
  },
};

/**
 * Astrological Term Lookup Dictionary for dynamic translation of:
 * - Tithis
 * - Pakshas
 * - Nakshatras
 * - Lunar Months (Masa)
 * - Yogas
 * - Karanas
 * - Weekdays (Vara)
 * - Choghadiya Slots & Muhurats
 * - Ritu, Ayana & Major Festivals
 */
export const ASTROLOGICAL_TERMS: Record<string, Record<SupportedLanguage, string>> = {
  // Pakshas
  'shukla': { en: 'Shukla', hi: 'शुक्ल', sa: 'शुक्ल', mr: 'शुक्ल', gu: 'શુક્લ' },
  'krishna': { en: 'Krishna', hi: 'कृष्ण', sa: 'कृष्ण', mr: 'कृष्ण', gu: 'કૃષ્ણ' },
  'shukla paksha': { en: 'Shukla Paksha', hi: 'शुक्ल पक्ष', sa: 'शुक्लपक्षः', mr: 'शुक्ल पक्ष', gu: 'શુક્લ પક્ષ' },
  'krishna paksha': { en: 'Krishna Paksha', hi: 'कृष्ण पक्ष', sa: 'कृष्णपक्षः', mr: 'कृष्ण पक्ष', gu: 'કૃષ્ણ પક્ષ' },

  // Base Tithis
  'pratipada': { en: 'Pratipada', hi: 'प्रतिपदा', sa: 'प्रतिपत्', mr: 'प्रतिपदा', gu: 'પ્રતિપદા' },
  'dwitiya': { en: 'Dwitiya', hi: 'द्वितीया', sa: 'द्वितीया', mr: 'द्वितीया', gu: 'બીજ' },
  'tritiya': { en: 'Tritiya', hi: 'तृतीया', sa: 'तृतीया', mr: 'तृतीया', gu: 'ત્રીજ' },
  'chaturthi': { en: 'Chaturthi', hi: 'चतुर्थी', sa: 'चतुर्थी', mr: 'चतुर्थी', gu: 'ચોથ' },
  'panchami': { en: 'Panchami', hi: 'पंचमी', sa: 'पञ्चमी', mr: 'पंचमी', gu: 'પાંચમ' },
  'shashthi': { en: 'Shashthi', hi: 'षष्ठी', sa: 'षष्ठी', mr: 'षष्ठी', gu: 'છઠ્ઠ' },
  'saptami': { en: 'Saptami', hi: 'सप्तमी', sa: 'सप्तमी', mr: 'સપ્તમી', gu: 'સાતમ' },
  'ashtami': { en: 'Ashtami', hi: 'अष्टमी', sa: 'अष्टमी', mr: 'अष्टमी', gu: 'આઠમ' },
  'navami': { en: 'Navami', hi: 'नवमी', sa: 'नवमी', mr: 'नवमी', gu: 'નોમ' },
  'dashami': { en: 'Dashami', hi: 'दशमी', sa: 'दशमी', mr: 'દશમી', gu: 'દસમ' },
  'ekadashi': { en: 'Ekadashi', hi: 'एकादशी', sa: 'एकादशी', mr: 'एकादशी', gu: 'અગિયારસ' },
  'dwadashi': { en: 'Dwadashi', hi: 'द्वादशी', sa: 'द्वादशी', mr: 'द्वादशी', gu: 'બારસ' },
  'trayodashi': { en: 'Trayodashi', hi: 'त्रयोदशी', sa: 'त्रयोदशी', mr: 'त्रयोदशी', gu: 'તેરસ' },
  'chaturdashi': { en: 'Chaturdashi', hi: 'चतुर्दशी', sa: 'चतुर्दशी', mr: 'चतुर्दशी', gu: 'ચૌદસ' },
  'purnima': { en: 'Purnima', hi: 'पूर्णिमा', sa: 'पूर्णिमा', mr: 'पौर्णिमा', gu: 'પૂનમ' },
  'amavasya': { en: 'Amavasya', hi: 'अमावस्या', sa: 'अमावास्या', mr: 'अमावास्या', gu: 'અમાસ' },

  // Compound Tithis (Shukla)
  'shukla pratipada': { en: 'Shukla Pratipada', hi: 'शुक्ल प्रतिपदा', sa: 'शुक्लप्रतिपत्', mr: 'शुक्ल प्रतिपदा', gu: 'શુક્લ પ્રતિપદા' },
  'shukla dwitiya': { en: 'Shukla Dwitiya', hi: 'शुक्ल द्वितीया', sa: 'शुक्लद्वितीया', mr: 'शुक्ल द्वितीया', gu: 'શુક્લ બીજ' },
  'shukla tritiya': { en: 'Shukla Tritiya', hi: 'शुक्ल तृतीया', sa: 'शुक्लतृतीया', mr: 'शुक्ल तृतीया', gu: 'શુક્લ ત્રીજ' },
  'shukla chaturthi': { en: 'Shukla Chaturthi', hi: 'शुक्ल चतुर्थी', sa: 'शुक्लचतुर्थी', mr: 'शुक्ल चतुर्थी', gu: 'શુક્લ ચોથ' },
  'shukla panchami': { en: 'Shukla Panchami', hi: 'शुक्ल पंचमी', sa: 'शुक्लपञ्चमी', mr: 'शुक्ल पंचमी', gu: 'શુક્લ પાંચમ' },
  'shukla shashthi': { en: 'Shukla Shashthi', hi: 'शुक्ल षष्ठी', sa: 'शुक्लषष्ठी', mr: 'शुक्ल षष्ठी', gu: 'શુક્લ છઠ્ઠ' },
  'shukla saptami': { en: 'Shukla Saptami', hi: 'शुक्ल सप्तमी', sa: 'शुक्लसप्तमी', mr: 'शुक्ल सप्तमी', gu: 'શુક્લ સાતમ' },
  'shukla ashtami': { en: 'Shukla Ashtami', hi: 'शुक्ल अष्टमी', sa: 'शुक्लाष्टमी', mr: 'शुक्ल अष्टमी', gu: 'શુક્લ આઠમ' },
  'shukla navami': { en: 'Shukla Navami', hi: 'शुक्ल नवमी', sa: 'शुकलनवमी', mr: 'शुक्ल नवमी', gu: 'શુક્લ નોમ' },
  'shukla dashami': { en: 'Shukla Dashami', hi: 'शुक्ल दशमी', sa: 'शुक्लदशमी', mr: 'शुक्ल दशमी', gu: 'શુક્લ દસમ' },
  'shukla ekadashi': { en: 'Shukla Ekadashi', hi: 'शुक्ल एकादशी', sa: 'शुक्लैकादशी', mr: 'शुक्ल एकादशी', gu: 'શુક્લ અગિયારસ' },
  'shukla dwadashi': { en: 'Shukla Dwadashi', hi: 'शुक्ल द्वादशी', sa: 'शुक्लद्वादशी', mr: 'शुक्ल द्वादशी', gu: 'શુક્લ બારસ' },
  'shukla trayodashi': { en: 'Shukla Trayodashi', hi: 'शुक्ल त्रयोदशी', sa: 'शुक्लत्रयोदशी', mr: 'शुक्ल त्रयोदशी', gu: 'શુક્લ તેરસ' },
  'shukla chaturdashi': { en: 'Shukla Chaturdashi', hi: 'शुक्ल चतुर्दशी', sa: 'शुक्लचतुर्दशी', mr: 'शुक्ल चतुर्दशी', gu: 'શુક્લ ચૌદસ' },
  'shukla purnima': { en: 'Shukla Purnima', hi: 'पूर्णिमा', sa: 'पूर्णिमा', mr: 'पौर्णिमा', gu: 'પૂનમ' },

  // Compound Tithis (Krishna)
  'krishna pratipada': { en: 'Krishna Pratipada', hi: 'कृष्ण प्रतिपदा', sa: 'कृष्णप्रतिपत्', mr: 'कृष्ण प्रतिपदा', gu: 'કૃષ્ણ પ્રતિપદા' },
  'krishna dwitiya': { en: 'Krishna Dwitiya', hi: 'कृष्ण द्वितीया', sa: 'कृष्णद्वितीया', mr: 'कृष्ण द्वितीया', gu: 'કૃષ્ણ બીજ' },
  'krishna tritiya': { en: 'Krishna Tritiya', hi: 'कृष्ण तृतीया', sa: 'कृष्णतृतीया', mr: 'कृष्ण तृतीया', gu: 'કૃષ્ણ ત્રીજ' },
  'krishna chaturthi': { en: 'Krishna Chaturthi', hi: 'कृष्ण चतुर्थी', sa: 'कृष्णचतुर्थी', mr: 'कृष्ण चतुर्थी', gu: 'કૃષ્ણ ચોથ' },
  'krishna panchami': { en: 'Krishna Panchami', hi: 'कृष्ण पंचमी', sa: 'कृष्णपञ्चमी', mr: 'कृष्ण पंचमी', gu: 'કૃષ્ણ પાંચમ' },
  'krishna shashthi': { en: 'Krishna Shashthi', hi: 'कृष्ण षष्ठी', sa: 'कृष्णषष्ठी', mr: 'कृष्ण षष्ठी', gu: 'કૃષ્ણ છઠ્ઠ' },
  'krishna saptami': { en: 'Krishna Saptami', hi: 'कृष्ण सप्तमी', sa: 'कृष्णसप्तमी', mr: 'कृष्ण सप्तमी', gu: 'કૃષ્ણ સાતમ' },
  'krishna ashtami': { en: 'Krishna Ashtami', hi: 'कृष्ण अष्टमी', sa: 'कृष्णाष्टमी', mr: 'कृष्ण अष्टमी', gu: 'કૃષ્ણ આઠમ' },
  'krishna navami': { en: 'Krishna Navami', hi: 'कृष्ण नवमी', sa: 'कृष्णनवमी', mr: 'कृष्ण नवमी', gu: 'કૃષ્ણ નોમ' },
  'krishna dashami': { en: 'Krishna Dashami', hi: 'कृष्ण दशमी', sa: 'कृष्णदशमी', mr: 'कृष्ण दशमी', gu: 'કૃષ્ણ દસમ' },
  'krishna ekadashi': { en: 'Krishna Ekadashi', hi: 'कृष्ण एकादशी', sa: 'कृष्णैकादशी', mr: 'कृष्ण एकादशी', gu: 'કૃષ્ણ અગિયારસ' },
  'krishna dwadashi': { en: 'Krishna Dwadashi', hi: 'कृष्ण द्वादशी', sa: 'कृष्णद्वादशी', mr: 'कृष्ण द्वादशी', gu: 'કૃષ્ણ બારસ' },
  'krishna trayodashi': { en: 'Krishna Trayodashi', hi: 'कृष्ण त्रयोदशी', sa: 'कृष्णत्रयोदशी', mr: 'कृष्ण त्रयोदशी', gu: 'કૃષ્ણ તેરસ' },
  'krishna chaturdashi': { en: 'Krishna Chaturdashi', hi: 'कृष्ण चतुर्दशी', sa: 'कृष्णचतुर्दशी', mr: 'कृष्ण चतुर्दशी', gu: 'કૃષ્ણ ચૌદસ' },
  'krishna amavasya': { en: 'Krishna Amavasya', hi: 'अमावस्या', sa: 'अमावास्या', mr: 'अमावास्या', gu: 'અમાસ' },

  // All 27 Nakshatras
  'ashwini': { en: 'Ashwini', hi: 'अश्विनी', sa: 'अश्विनी', mr: 'अश्विनी', gu: 'અશ્વિની' },
  'bharani': { en: 'Bharani', hi: 'भरणी', sa: 'भरणी', mr: 'भरणी', gu: 'ભરણી' },
  'krittika': { en: 'Krittika', hi: 'कृत्तिका', sa: 'कृत्तिका', mr: 'कृत्तिका', gu: 'કૃત્તિકા' },
  'rohini': { en: 'Rohini', hi: 'रोहिणी', sa: 'रोहिणी', mr: 'रोहिणी', gu: 'રોહિણી' },
  'mrigashirsha': { en: 'Mrigashirsha', hi: 'मृगशिरा', sa: 'मृगशीर्षम्', mr: 'मृगशीर्ष', gu: 'મૃગશીર્ષ' },
  'ardra': { en: 'Ardra', hi: 'आर्द्रा', sa: 'आर्द्रा', mr: 'आर्द्रा', gu: 'આર્દ્રા' },
  'punarvasu': { en: 'Punarvasu', hi: 'पुनर्वसु', sa: 'पुनर्वसुः', mr: 'पुनर्वसू', gu: 'પુનર્વસુ' },
  'pushya': { en: 'Pushya', hi: 'पुष्य', sa: 'पुष्यः', mr: 'पुष्य', gu: 'પુષ્ય' },
  'ashlesha': { en: 'Ashlesha', hi: 'आश्लेषा', sa: 'आश्लेषा', mr: 'आश्लेषा', gu: 'આશ્લેષા' },
  'magha': { en: 'Magha', hi: 'मघा', sa: 'मघा', mr: 'मघा', gu: 'મઘા' },
  'purva phalguni': { en: 'Purva Phalguni', hi: 'पूर्वाफाल्गुनी', sa: 'पूर्वफाल्गुनी', mr: 'पूर्वाफाल्गुनी', gu: 'પૂર્વા ફાલ્ગુની' },
  'uttara phalguni': { en: 'Uttara Phalguni', hi: 'उत्तराफाल्गुनी', sa: 'उत्तरफाल्गुनी', mr: 'उत्तराफाल्गुनी', gu: 'ઉત્તરા ફાલ્ગુની' },
  'hasta': { en: 'Hasta', hi: 'हस्त', sa: 'हस्तः', mr: 'हस्त', gu: 'હસ્ત' },
  'chitra': { en: 'Chitra', hi: 'चित्रा', sa: 'चित्रा', mr: 'चित्रा', gu: 'ચિત્રા' },
  'swati': { en: 'Swati', hi: 'स्वाति', sa: 'स्वातिः', mr: 'स्वाती', gu: 'સ્વાતિ' },
  'vishakha': { en: 'Vishakha', hi: 'विशाखा', sa: 'विशाखा', mr: 'विशाखा', gu: 'વિશાખા' },
  'anuradha': { en: 'Anuradha', hi: 'अनुराधा', sa: 'अनुराधा', mr: 'अनुराधा', gu: 'અનુરાધા' },
  'jyeshtha': { en: 'Jyeshtha', hi: 'ज्येष्ठा', sa: 'ज्येष्ठा', mr: 'ज्येष्ठा', gu: 'જ્યેષ્ઠા' },
  'mula': { en: 'Mula', hi: 'मूल', sa: 'मूलम्', mr: 'मूळ', gu: 'મૂળ' },
  'purva ashadha': { en: 'Purva Ashadha', hi: 'पूर्वाषाढ़ा', sa: 'पूर्वाषाढा', mr: 'पूर्वाषाढा', gu: 'પૂર્વાષાઢા' },
  'uttara ashadha': { en: 'Uttara Ashadha', hi: 'उत्तराषाढ़ा', sa: 'उत्तराषाढा', mr: 'उत्तराषाढा', gu: 'ઉત્તરાષાઢા' },
  'shravana': { en: 'Shravana', hi: 'श्रवण', sa: 'श्रवणम्', mr: 'श्रवण', gu: 'શ્રવણ' },
  'dhanishta': { en: 'Dhanishta', hi: 'धनिष्ठा', sa: 'धनिष्ठा', mr: 'धनिष्ठा', gu: 'ધનિષ્ઠા' },
  'shatabhisha': { en: 'Shatabhisha', hi: 'शतभिषा', sa: 'शतभिषक्', mr: 'शतभिषा', gu: 'શતભિષા' },
  'purva bhadrapada': { en: 'Purva Bhadrapada', hi: 'पूर्वाभाद्रपद', sa: 'पूर्वभाद्रपदा', mr: 'पूर्वाभाद्रपदा', gu: 'પૂર્વા ભાદ્રપદ' },
  'uttara bhadrapada': { en: 'Uttara Bhadrapada', hi: 'उत्तराभाद्रपद', sa: 'उत्तरभाद्रपदा', mr: 'उत्तराभाद्रपदा', gu: 'ઉત્તરા ભાદ્રપદ' },
  'revati': { en: 'Revati', hi: 'रेवती', sa: 'रेवती', mr: 'रेवती', gu: 'રેવતી' },

  // All 12 Lunar Months (Masa)
  'chaitra': { en: 'Chaitra', hi: 'चैत्र', sa: 'चैत्रः', mr: 'चैत्र', gu: 'ચૈત્ર' },
  'vaishakha': { en: 'Vaishakha', hi: 'वैशाख', sa: 'वैशाखः', mr: 'वैशाख', gu: 'વૈશાખ' },
  'vaisakha': { en: 'Vaishakha', hi: 'वैशाख', sa: 'वैशाखः', mr: 'वैशाख', gu: 'વૈશાખ' },
  'jyeshtha masa': { en: 'Jyeshtha', hi: 'ज्येष्ठ', sa: 'ज्येष्ठः', mr: 'ज्येष्ठ', gu: 'જેઠ' },
  'ashadha': { en: 'Ashadha', hi: 'आषाढ़', sa: 'आषाढः', mr: 'आषाढ', gu: 'આષાઢ' },
  'shravana masa': { en: 'Shravana', hi: 'श्रावण', sa: 'श्रावणः', mr: 'श्रावण', gu: 'શ્રાવણ' },
  'bhadrapada': { en: 'Bhadrapada', hi: 'भाद्रपद', sa: 'भाद्रपदः', mr: 'भाद्रपद', gu: 'ભાદરવો' },
  'ashwin': { en: 'Ashwin', hi: 'आश्विन', sa: 'आश्विनः', mr: 'अश्विन', gu: 'આસો' },
  'ashwina': { en: 'Ashwina', hi: 'आश्विन', sa: 'आश्विनः', mr: 'अश्विन', gu: 'આસો' },
  'kartika': { en: 'Kartika', hi: 'कार्तिक', sa: 'कार्तिकः', mr: 'कार्तिक', gu: 'કારતક' },
  'margashirsha': { en: 'Margashirsha', hi: 'मार्गशीर्ष', sa: 'मार्गशीर्षः', mr: 'मार्गशीर्ष', gu: 'માગશર' },
  'pausha': { en: 'Pausha', hi: 'पौष', sa: 'पौषः', mr: 'पौष', gu: 'પોષ' },
  'magha masa': { en: 'Magha', hi: 'माघ', sa: 'माघः', mr: 'माघ', gu: 'મહા' },
  'phalguna': { en: 'Phalguna', hi: 'फाल्गुन', sa: 'फाल्गुनः', mr: 'फाल्गुन', gu: 'ફાગણ' },
  'adhika': { en: 'Adhika', hi: 'अधिक', sa: 'अधिकः', mr: 'अधिक', gu: 'અધિક' },
  'adhik masa': { en: 'Adhik Masa', hi: 'अधिक मास', sa: 'अधिकमासः', mr: 'अधिक महिना', gu: 'અધિક માસ' },

  // All 27 Yogas
  'vishkambha': { en: 'Vishkambha', hi: 'विष्कम्भ', sa: 'विष्कम्भः', mr: 'विष्कंभ', gu: 'વિષ્કંભ' },
  'priti': { en: 'Priti', hi: 'प्रीति', sa: 'प्रीतिः', mr: 'प्रीती', gu: 'પ્રીતિ' },
  'ayushman': { en: 'Ayushman', hi: 'आयुष्मान्', sa: 'आयुष्मान्', mr: 'आयुष्मान', gu: 'આયુષ્માન' },
  'saubhagya': { en: 'Saubhagya', hi: 'सौभाग्य', sa: 'सौभाग्यम्', mr: 'सौभाग्य', gu: 'સૌભાગ્ય' },
  'shobhana': { en: 'Shobhana', hi: 'शोभन', sa: 'शोभनः', mr: 'शोभन', gu: 'શોભન' },
  'atiganda': { en: 'Atiganda', hi: 'अतिगण्ड', sa: 'अतिगण्डः', mr: 'अतिगंड', gu: 'અતિગંડ' },
  'sukarma': { en: 'Sukarma', hi: 'सुकर्मा', sa: 'सुकर्मा', mr: 'सुकर्मा', gu: 'સુકર્મા' },
  'dhriti': { en: 'Dhriti', hi: 'धृति', sa: 'धृतिः', mr: 'धृती', gu: 'ધૃતિ' },
  'shoola': { en: 'Shoola', hi: 'शूल', sa: 'शूलः', mr: 'शूल', gu: 'શૂળ' },
  'ganda': { en: 'Ganda', hi: 'गण्ड', sa: 'गण्डः', mr: 'गंड', gu: 'ગંડ' },
  'vriddhi': { en: 'Vriddhi', hi: 'वृद्धि', sa: 'वृद्धिः', mr: 'वृद्धी', gu: 'વૃદ્ધિ' },
  'dhruva': { en: 'Dhruva', hi: 'ध्रुव', sa: 'ध्रुवः', mr: 'ध्रुव', gu: 'ધ્રુવ' },
  'vyaghata': { en: 'Vyaghata', hi: 'व्याघात', sa: 'व्याघातः', mr: 'व्याघात', gu: 'વ્યાઘાત' },
  'harshana': { en: 'Harshana', hi: 'हर्षण', sa: 'हर्षणः', mr: 'हर्षण', gu: 'હર્ષણ' },
  'vajra': { en: 'Vajra', hi: 'वज्र', sa: 'वज्रः', mr: 'वज्र', gu: 'વજ્ર' },
  'siddhi': { en: 'Siddhi', hi: 'सिद्धि', sa: 'सिद्धिः', mr: 'सिद्धी', gu: 'સિદ્ધિ' },
  'vyatipata': { en: 'Vyatipata', hi: 'व्यतीपात', sa: 'व्यतीपातः', mr: 'व्यतीपात', gu: 'વ્યતીપાત' },
  'variyan': { en: 'Variyan', hi: 'वरीयान्', sa: 'वरीयान्', mr: 'वरीयान', gu: 'વરીયાન' },
  'parigha': { en: 'Parigha', hi: 'परिघ', sa: 'परिघः', mr: 'परिघ', gu: 'પરિઘ' },
  'shiva': { en: 'Shiva', hi: 'शिव', sa: 'शिवः', mr: 'शिव', gu: 'શિવ' },
  'siddha': { en: 'Siddha', hi: 'सिद्ध', sa: 'सिद्धः', mr: 'सिद्ध', gu: 'સિદ્ધ' },
  'sadhya': { en: 'Sadhya', hi: 'साध्य', sa: 'साध्यः', mr: 'साध्य', gu: 'સાધ્ય' },
  'shubha': { en: 'Shubha', hi: 'शुभ', sa: 'शुभः', mr: 'शुभ', gu: 'શુભ' },
  'brahma': { en: 'Brahma', hi: 'ब्रह्म', sa: 'ब्रह्म', mr: 'ब्रह्म', gu: 'બ્રહ્મ' },
  'indra': { en: 'Indra', hi: 'इन्द्र', sa: 'इन्द्रः', mr: 'इंद्र', gu: 'ઇન્દ્ર' },
  'vaidhriti': { en: 'Vaidhriti', hi: 'वैधृति', sa: 'वैधृतिः', mr: 'वैधृती', gu: 'વૈધૃતિ' },

  // All 11 Karanas
  'bava': { en: 'Bava', hi: 'बव', sa: 'बवः', mr: 'बव', gu: 'બવ' },
  'balava': { en: 'Balava', hi: 'बालव', sa: 'बालवः', mr: 'बालव', gu: 'બાલવ' },
  'kaulava': { en: 'Kaulava', hi: 'कौलव', sa: 'कौलवः', mr: 'कौलव', gu: 'કૌલવ' },
  'taitila': { en: 'Taitila', hi: 'तैतिल', sa: 'तैतिलः', mr: 'तैतिल', gu: 'તૈતિલ' },
  'garija': { en: 'Garija', hi: 'गरिज', sa: 'गरिजः', mr: 'गरिज', gu: 'ગરિજ' },
  'vanija': { en: 'Vanija', hi: 'वणिज', sa: 'वणिजः', mr: 'वणिज', gu: 'વણિજ' },
  'vishti': { en: 'Bhadra', hi: 'विष्टि', sa: 'विष्टिः', mr: 'विष्टी', gu: 'વિષ્ટિ' },
  'bhadra': { en: 'Bhadra', hi: 'भद्रा', sa: 'भद्रा', mr: 'भद्रा', gu: 'ભદ્રા' },
  'shakuni': { en: 'Shakuni', hi: 'शकुनि', sa: 'शकुनिः', mr: 'शकुनी', gu: 'શકુનિ' },
  'chatushpada': { en: 'Chatushpada', hi: 'चतुष्पाद', sa: 'चतुष्पात्', mr: 'चतुष्पाद', gu: 'ચતુષ્પાદ' },
  'naga': { en: 'Naga', hi: 'नाग', sa: 'नागः', mr: 'नाग', gu: 'નાગ' },
  'kintughna': { en: 'Kintughna', hi: 'किंस्तुघ्न', sa: 'किंस्तुघ्नः', mr: 'किंस्तुघ्न', gu: 'કિસ્તુઘ્ન' },

  // Weekdays (Vara)
  'sunday': { en: 'Sunday', hi: 'रविवार', sa: 'रविवासरः', mr: 'रविवार', gu: 'રવિવાર' },
  'monday': { en: 'Monday', hi: 'सोमवार', sa: 'सोमवासरः', mr: 'सोमवार', gu: 'સોમવાર' },
  'tuesday': { en: 'Tuesday', hi: 'मंगलवार', sa: 'मङ्गलवासरः', mr: 'मंगळवार', gu: 'મંગળવાર' },
  'wednesday': { en: 'Wednesday', hi: 'बुधवार', sa: 'बुधवासरः', mr: 'बुधवार', gu: 'બુધવાર' },
  'thursday': { en: 'Thursday', hi: 'गुरुवार', sa: 'गुरुवासरः', mr: 'गुरुवार', gu: 'ગુરુવાર' },
  'friday': { en: 'Friday', hi: 'शुक्रवार', sa: 'शुक्रवासरः', mr: 'शुक्रवार', gu: 'શુક્રવાર' },
  'saturday': { en: 'Saturday', hi: 'शनिवार', sa: 'शनिवासरः', mr: 'शनिवार', gu: 'શનિવાર' },

  // Muhurats & Choghadiya Slots
  'abhijit': { en: 'Abhijit', hi: 'अभिजित', sa: 'अभिजित्', mr: 'अभिजित', gu: 'અભિજિત' },
  'abhijit muhurat': { en: 'Abhijit Muhurat', hi: 'अभिजित मुहूर्त', sa: 'अभिजित्मुहूर्तः', mr: 'अभिजित मुहूर्त', gu: 'અભિજિત મુહૂર્ત' },
  'brahma muhurat': { en: 'Brahma Muhurat', hi: 'ब्रह्म मुहूर्त', sa: 'ब्रह्ममुहूर्तः', mr: 'ब्रह्म मुहूर्त', gu: 'બ્રહ્મ મુહૂર્ત' },
  'rahu kaal': { en: 'Rahu Kaal', hi: 'राहु काल', sa: 'राहुकालः', mr: 'राहु काळ', gu: 'રાહુ કાળ' },
  'rahu kalam': { en: 'Rahu Kalam', hi: 'राहु काल', sa: 'राहुकालः', mr: 'राहु काळ', gu: 'રાહુ કાળ' },
  'yamaganda': { en: 'Yamaganda', hi: 'यमगण्ड', sa: 'यमगण्डः', mr: 'यमगंड', gu: 'યમગંડ' },
  'yamaghanta': { en: 'Yamaghanta', hi: 'यमघण्ट', sa: 'यमघण्टः', mr: 'यमघंट', gu: 'યમઘંટ' },
  'gulika': { en: 'Gulika Kaal', hi: 'गुलिक काल', sa: 'गुलिककालः', mr: 'गुलिक काळ', gu: 'ગુલિક કાળ' },
  'gulikai': { en: 'Gulika Kaal', hi: 'गुलिक काल', sa: 'गुलिककालः', mr: 'ગુલિક કાળ', gu: 'ગુલિક કાળ' },
  'amrit': { en: 'Amrit', hi: 'अमृत', sa: 'अमृतम्', mr: 'अमृत', gu: 'અમૃત' },
  'shubh': { en: 'Shubh', hi: 'शुभ', sa: 'शुभम्', mr: 'शुभ', gu: 'શુભ' },
  'labh': { en: 'Labh', hi: 'लाभ', sa: 'लाभः', mr: 'लाभ', gu: 'લાભ' },
  'char': { en: 'Char', hi: 'चर', sa: 'चलम्', mr: 'चर', gu: 'ચર' },
  'chal': { en: 'Char', hi: 'चर', sa: 'चलम्', mr: 'चर', gu: 'ચર' },
  'rog': { en: 'Rog', hi: 'रोग', sa: 'रोगः', mr: 'रोग', gu: 'રોગ' },
  'kaal': { en: 'Kaal', hi: 'काल', sa: 'कालः', mr: 'काळ', gu: 'કાળ' },
  'udveg': { en: 'Udveg', hi: 'उद्वेग', sa: 'उद्वेगः', mr: 'उद्वेग', gu: 'ઉદ્વેગ' },
  'vijaya muhurat': { en: 'Vijaya Muhurat', hi: 'विजय मुहूर्त', sa: 'विजयमुहूर्तः', mr: 'विजय मुहूर्त', gu: 'વિજય મુહૂર્ત' },
  'godhuli muhurat': { en: 'Godhuli Muhurat', hi: 'गोधूलि मुहूर्त', sa: 'गोधूलिमुहूर्तः', mr: 'गोधूलि मुहूर्त', gu: 'ગોધૂલિ મુહૂર્ત' },
  'sayahna sandhya': { en: 'Sayahna Sandhya', hi: 'सायाह्न सन्ध्या', sa: 'सायाह्नसान्ध्या', mr: 'सायान्ह संध्या', gu: 'સાયાહ્ન સંધ્યા' },
  'pratah sandhya': { en: 'Pratah Sandhya', hi: 'प्रातः सन्ध्या', sa: 'प्रातःसान्ध्या', mr: 'प्रातः संध्या', gu: 'પ્રાતઃ સંધ્યા' },
  'nishita kaal': { en: 'Nishita Kaal', hi: 'निशीथ काल', sa: 'निशीथकालः', mr: 'निशीथ काळ', gu: 'નિશીથ કાળ' },
  'amrit kaal': { en: 'Amrit Kaal', hi: 'अमृत काल', sa: 'अमृतकालः', mr: 'अमृत काळ', gu: 'અમૃત કાળ' },
  'dur muhurat': { en: 'Dur Muhurat', hi: 'दुर्मुहूर्त', sa: 'दुर्मुहूर्तः', mr: 'दुर्मुहूर्त', gu: 'દુર્મુહૂર્ત' },
  'varjyam': { en: 'Varjyam', hi: 'वर्ज्यम्', sa: 'वर्ज्यम्', mr: 'वर्ज्यम्', gu: 'વર્જ્યમ્' },
  'gulika kaal': { en: 'Gulika Kaal', hi: 'गुलिक काल', sa: 'गुलिककालः', mr: 'गुलिक काळ', gu: 'ગુલિક કાળ' },
  'highly auspicious': { en: 'Highly Auspicious', hi: 'परम शुभ', sa: 'परमशुभम्', mr: 'अत्यंत शुभ', gu: 'અત્યંત શુભ' },
  'auspicious': { en: 'Auspicious', hi: 'शुभ', sa: 'शुभम्', mr: 'शुभ', gu: 'શુભ' },
  'moderate': { en: 'Moderate', hi: 'मध्यम', sa: 'मध्यमम्', mr: 'मध्यम', gu: 'મધ્યમ' },
  'inauspicious': { en: 'Inauspicious', hi: 'अशुभ', sa: 'अशुभम्', mr: 'अशुभ', gu: 'અશુભ' },
  'neutral': { en: 'Neutral', hi: 'मध्यम', sa: 'मध्यमम्', mr: 'मध्यम', gu: 'મધ્યમ' },
  'choghadiya': { en: 'Choghadiya', hi: 'चौघड़िया', sa: 'चौघडिया', mr: 'चौघडिया', gu: 'ચોઘડિયા' },

  // Ayana & Ritu
  'uttarayana': { en: 'Uttarayana', hi: 'उत्तरायण', sa: 'उत्तरायणम्', mr: 'उत्तरायण', gu: 'ઉત્તરાયણ' },
  'dakshinayana': { en: 'Dakshinayana', hi: 'दक्षिणायन', sa: 'दक्षिणायनम्', mr: 'दक्षिणायन', gu: 'દક્ષિણાયન' },
  'vasant': { en: 'Vasant', hi: 'वसन्त', sa: 'वसन्तः', mr: 'वसंत', gu: 'વસંત' },
  'grishma': { en: 'Grishma', hi: 'ग्रीष्म', sa: 'ग्रीष्मः', mr: 'ग्रीष्म', gu: 'ગ્રીષ્મ' },
  'varsha': { en: 'Varsha', hi: 'वर्षा', sa: 'वर्षा', mr: 'वर्षा', gu: 'વર્ષા' },
  'sharad': { en: 'Sharad', hi: 'शरद', sa: 'शरत्', mr: 'शरद', gu: 'શરદ' },
  'hemant': { en: 'Hemant', hi: 'हेमन्त', sa: 'हेमन्तः', mr: 'हेमंत', gu: 'હેમંત' },
  'shishir': { en: 'Shishir', hi: 'शिशिर', sa: 'शिशिरः', mr: 'शिशिर', gu: 'શિશિર' },

  // 12 Zodiac Signs (Rashis) - Authentic Hinglish in 'en' mode, Native scripts elsewhere
  'mesha': { en: 'Mesha', hi: 'मेष', sa: 'मेषः', mr: 'मेष', gu: 'મેષ' },
  'vrishabha': { en: 'Vrishabha', hi: 'वृषभ', sa: 'वृषभः', mr: 'वृषभ', gu: 'વૃષભ' },
  'mithuna': { en: 'Mithuna', hi: 'मिथुन', sa: 'मिथुनम्', mr: 'मिथुन', gu: 'મિથુન' },
  'karka': { en: 'Karka', hi: 'कर्क', sa: 'कर्कः', mr: 'કર્ક', gu: 'કર્ક' },
  'simha': { en: 'Simha', hi: 'सिंह', sa: 'सिंहः', mr: 'सिंह', gu: 'સિંહ' },
  'kanya': { en: 'Kanya', hi: 'कन्या', sa: 'कन्या', mr: 'कन्या', gu: 'કન્યા' },
  'tula': { en: 'Tula', hi: 'तुला', sa: 'तुला', mr: 'तूळ', gu: 'તુલા' },
  'vrishchika': { en: 'Vrishchika', hi: 'वृश्चिक', sa: 'वृश्चिकः', mr: 'वृश्चिक', gu: 'વૃશ્ચિક' },
  'dhanu': { en: 'Dhanu', hi: 'धनु', sa: 'धनुः', mr: 'धनु', gu: 'ધન' },
  'makara': { en: 'Makara', hi: 'मकर', sa: 'मकरः', mr: 'मकर', gu: 'મકર' },
  'kumbha': { en: 'Kumbha', hi: 'कुम्भ', sa: 'कुम्भः', mr: 'कुंभ', gu: 'કુંભ' },
  'meena': { en: 'Meena', hi: 'मीन', sa: 'मीनः', mr: 'मीन', gu: 'મીન' },

  // Western Zodiac Aliases mapped to Vedic Hinglish/Native
  'aries': { en: 'Mesha', hi: 'मेष', sa: 'मेषः', mr: 'मेष', gu: 'મેષ' },
  'taurus': { en: 'Vrishabha', hi: 'वृषभ', sa: 'वृषभः', mr: 'वृषभ', gu: 'વૃષભ' },
  'gemini': { en: 'Mithuna', hi: 'मिथुन', sa: 'मिथुनम्', mr: 'मिथुन', gu: 'મિથુન' },
  'cancer': { en: 'Karka', hi: 'कर्क', sa: 'कर्कः', mr: 'कर्क', gu: 'કર્ક' },
  'leo': { en: 'Simha', hi: 'सिंह', sa: 'सिंहः', mr: 'सिंह', gu: 'સિંહ' },
  'virgo': { en: 'Kanya', hi: 'कन्या', sa: 'कन्या', mr: 'कन्या', gu: 'કન્યા' },
  'libra': { en: 'Tula', hi: 'तुला', sa: 'तुला', mr: 'तूळ', gu: 'તુલા' },
  'scorpio': { en: 'Vrishchika', hi: 'वृश्चिक', sa: 'वृश्चिकः', mr: 'वृश्चिक', gu: 'વૃશ્ચિક' },
  'sagittarius': { en: 'Dhanu', hi: 'धनु', sa: 'धनुः', mr: 'धनु', gu: 'ધન' },
  'capricorn': { en: 'Makara', hi: 'मकर', sa: 'मकरः', mr: 'मकर', gu: 'મકર' },
  'aquarius': { en: 'Kumbha', hi: 'कुम्भ', sa: 'कुम्भः', mr: 'कुंभ', gu: 'કુંભ' },
  'pisces': { en: 'Meena', hi: 'मीन', sa: 'मीनः', mr: 'मीन', gu: 'મીન' },

  // Moon Phases
  'full moon': { en: 'Purnima', hi: 'पूर्णिमा', sa: 'पूर्णिमा', mr: 'पौर्णिमा', gu: 'પૂનમ' },
  'new moon': { en: 'Amavasya', hi: 'अमावस्या', sa: 'अमावास्या', mr: 'अमावास्या', gu: 'અમાસ' },
  'waxing crescent': { en: 'Shukla Paksha', hi: 'शुक्ल पक्ष', sa: 'शुक्लपक्षः', mr: 'शुक्ल पक्ष', gu: 'શુક્લ પક્ષ' },
  'waxing gibbous': { en: 'Shukla Paksha', hi: 'शुक्ल पक्ष', sa: 'शुक्लपक्षः', mr: 'शुक्ल पक्ष', gu: 'શુક્લ પક્ષ' },
  'waning gibbous': { en: 'Krishna Paksha', hi: 'कृष्ण पक्ष', sa: 'कृष्णपक्षः', mr: 'कृष्ण पक्ष', gu: 'કૃષ્ણ પક્ષ' },
  'waning crescent': { en: 'Krishna Paksha', hi: 'कृष्ण पक्ष', sa: 'कृष्णपक्षः', mr: 'कृष्ण पक्ष', gu: 'કૃષ્ણ પક્ષ' },
  'first quarter': { en: 'Shukla Ashtami', hi: 'शुक्ल अष्टमी', sa: 'शुक्लाष्टमी', mr: 'शुक्ल अष्टमी', gu: 'શુક્લ આઠમ' },
  'third quarter': { en: 'Krishna Ashtami', hi: 'कृष्ण अष्टमी', sa: 'कृष्णाष्टमी', mr: 'कृष्ण अष्टमी', gu: 'કૃષ્ણ આઠમ' },

  // Panchak Types
  'mrityu panchak': { en: 'Mrityu Panchak', hi: 'मृत्यु पंचक', sa: 'मृत्युपञ्चकम्', mr: 'मृत्यू पंचक', gu: 'મૃત્યુ પંચક' },
  'agni panchak': { en: 'Agni Panchak', hi: 'अग्नि पंचक', sa: 'अग्निपञ्चकम्', mr: 'अग्नी पंचक', gu: 'અગ્નિ પંચક' },
  'raja panchak': { en: 'Raja Panchak', hi: 'राज पंचक', sa: 'राजपञ्चकम्', mr: 'राज पंचक', gu: 'રાજ પંચક' },
  'chora panchak': { en: 'Chora Panchak', hi: 'चोर पंचक', sa: 'चोरपञ्चकम्', mr: 'चोर पंचक', gu: 'ચોર પંચક' },
  'roga panchak': { en: 'Roga Panchak', hi: 'रोग पंचक', sa: 'रोगपञ्चकम्', mr: 'रोग पंचक', gu: 'રોગ પંચક' },
  'nirdosha panchak': { en: 'Nirdosha Panchak', hi: 'निर्दोष पंचक', sa: 'निर्दोषपञ्चकम्', mr: 'निर्दोष पंचक', gu: 'નિર્દોષ પંચક' },

  // Festivals & Observances (Strictly Zero Brackets)
  'diwali': { en: 'Diwali', hi: 'दीपावली', sa: 'दीपावली', mr: 'दिवाळी', gu: 'દિવાળી' },
  'deepavali': { en: 'Deepavali', hi: 'दीपावली', sa: 'दीपावली', mr: 'दिवाळी', gu: 'દિવાળી' },
  'dhanteras': { en: 'Dhanteras', hi: 'धनतेरस', sa: 'धनत्रयोदशी', mr: 'धनत्रयोदशी', gu: 'ધનતેરસ' },
  'chhoti diwali': { en: 'Chhoti Diwali', hi: 'नरक चतुर्दशी', sa: 'नरकचतुर्दशी', mr: 'नरक चतुर्दशी', gu: 'કાળી ચૌદસ' },
  'naraka chaturdashi': { en: 'Naraka Chaturdashi', hi: 'नरक चतुर्दशी', sa: 'नरकचतुर्दशी', mr: 'नरक चतुर्दशी', gu: 'કાળી ચૌદસ' },
  'govardhan puja': { en: 'Govardhan Puja', hi: 'गोवर्धन पूजा', sa: 'गोवर्धनपूजा', mr: 'गोवर्धन पूजा', gu: 'ગોવર્ધન પૂજા' },
  'bhai dooj': { en: 'Bhai Dooj', hi: 'भाई दूज', sa: 'यमद्वितीया', mr: 'भाऊबीज', gu: 'ભાઈબીજ' },
  'chhath puja': { en: 'Chhath Puja', hi: 'छठ पूजा', sa: 'सूर्यषष्ठी', mr: 'छठ पूजा', gu: 'છઠ પૂજા' },
  'karwa chauth': { en: 'Karwa Chauth', hi: 'करवा चौथ', sa: 'करकचतुर्थी', mr: 'करवा चौथ', gu: 'કરવા ચોથ' },
  'maha shivaratri': { en: 'Maha Shivaratri', hi: 'महाशिवरात्रि', sa: 'महाशिवरात्रिः', mr: 'महाशिवरात्री', gu: 'મહાશિવરાત્રિ' },
  'krishna janmashtami': { en: 'Krishna Janmashtami', hi: 'श्रीकृष्ण जन्माष्टमी', sa: 'कृष्णजन्माष्टमी', mr: 'श्रीकृष्ण जन्माष्टमी', gu: 'કૃષ્ણ જન્માષ્ટમી' },
  'janmashtami': { en: 'Janmashtami', hi: 'श्रीकृष्ण जन्माष्टमी', sa: 'कृष्णजन्माष्टमी', mr: 'श्रीकृष्ण जन्माष्टमी', gu: 'કૃષ્ણ જન્માષ્ટમી' },
  'radha ashtami': { en: 'Radha Ashtami', hi: 'राधा अष्टमी', sa: 'राधाष्टमी', mr: 'राधा अष्टमी', gu: 'રાધા અષ્ટમી' },
  'ahoi ashtami': { en: 'Ahoi Ashtami', hi: 'अहोई अष्टमी', sa: 'अहोईअष्टमी', mr: 'अहोई अष्टमी', gu: 'અહોઈ અષ્ટમી' },
  'gopashtami': { en: 'Gopashtami', hi: 'गोपाष्टमी', sa: 'गोपाष्टमी', mr: 'गोपाष्टमी', gu: 'ગોપાષ્ટમી' },
  'kalabhairav jayanti': { en: 'Kalabhairav Jayanti', hi: 'कालभैरव जयन्ती', sa: 'कालभैरवजयन्ती', mr: 'कालभैरव जयंती', gu: 'કાલભૈરવ જયંતી' },
  'sheetala ashtami': { en: 'Sheetala Ashtami', hi: 'शीतला अष्टमी', sa: 'शीतलाष्टमी', mr: 'शीतला अष्टमी', gu: 'શીતળા સાતમ' },
  'bhishma ashtami': { en: 'Bhishma Ashtami', hi: 'भीष्म अष्टमी', sa: 'भीष्माष्टमी', mr: 'भीष्म अष्टमी', gu: 'ભીષ્મ અષ્ટમી' },
  'janaki jayanti': { en: 'Janaki Jayanti', hi: 'जानकी जयन्ती', sa: 'जानकीजयन्ती', mr: 'जानकी जयंती', gu: 'જાનકી જયંતી' },
  'masik durgashtami': { en: 'Masik Durgashtami', hi: 'मासिक दुर्गाष्टमी', sa: 'मासिकदुर्गाष्टमी', mr: 'मासिक दुर्गाष्टमी', gu: 'માસિક દુર્ગાષ્ટમી' },
  'masik kalashtami': { en: 'Masik Kalashtami', hi: 'मासिक कालाष्टमी', sa: 'मासिककालाष्टमी', mr: 'मासिक कालाष्टमी', gu: 'માસિક કાલાષ્ટમી' },
  'masik shivaratri': { en: 'Masik Shivaratri', hi: 'मासिक शिवरात्रि', sa: 'मासिकशिवरात्रिः', mr: 'मासिक शिवरात्री', gu: 'માસિક શિવરાત્રિ' },
  'ganesh chaturthi': { en: 'Ganesh Chaturthi', hi: 'गणेश चतुर्थी', sa: 'गणेशचतुर्थी', mr: 'गणेश चतुर्थी', gu: 'ગણેશ ચતુર્થી' },
  'holika dahan': { en: 'Holika Dahan', hi: 'होलिका दहन', sa: 'होलिकादहनम्', mr: 'होलिका दहन', gu: 'હોલિકા દહન' },
  'rangwali holi': { en: 'Rangwali Holi', hi: 'रंगवाली होली', sa: 'धूलिवन्दनम्', mr: 'धूलिवंदन', gu: 'ધૂળેટી' },
  'holi': { en: 'Holi', hi: 'होली', sa: 'धूलिवन्दनम्', mr: 'होळी', gu: 'હોળી' },
  'ram navami': { en: 'Ram Navami', hi: 'श्रीराम नवमी', sa: 'रामनवमी', mr: 'रामनवमी', gu: 'રામ નવમી' },
  'hanuman jayanti': { en: 'Hanuman Jayanti', hi: 'श्री हनुमान जयन्ती', sa: 'हनुमज्जयन्ती', mr: 'हनुमान जयंती', gu: 'હનુમાન જયંતી' },
  'raksha bandhan': { en: 'Raksha Bandhan', hi: 'रक्षा बन्धन', sa: 'रक्षाबन्धनम्', mr: 'रक्षाबंधन', gu: 'રક્ષાબંધન' },
  'guru purnima': { en: 'Guru Purnima', hi: 'गुरु पूर्णिमा', sa: 'गुरुपूर्णिमा', mr: 'गुरु पौर्णिमा', gu: 'ગુરુ પૂર્ણિમા' },
  'makar sankranti': { en: 'Makar Sankranti', hi: 'मकर संक्रान्ति', sa: 'मकरसङ्क्रान्तिः', mr: 'मकर संक्रांत', gu: 'મકર સંક્રાંતિ' },
  'vasant panchami': { en: 'Vasant Panchami', hi: 'वसन्त पंचमी', sa: 'वसन्तपञ्चमी', mr: 'वसंत पंचमी', gu: 'વસંત પંચમી' },
  'nag panchami': { en: 'Nag Panchami', hi: 'नाग पंचमी', sa: 'नागपञ्चमी', mr: 'नाग पंचमी', gu: 'નાગ પાંચમ' },
  'tulsi vivah': { en: 'Tulsi Vivah', hi: 'तुलसी विवाह', sa: 'तुलसीविवाहः', mr: 'तुलसी विवाह', gu: 'તુલસી વિવાહ' },
  'anant chaturdashi': { en: 'Anant Chaturdashi', hi: 'अनन्त चतुर्दशी', sa: 'अनन्तचतुर्दशी', mr: 'अनंत चतुर्दशी', gu: 'અનંત ચતુર્દશી' },
  'akshaya tritiya': { en: 'Akshaya Tritiya', hi: 'अक्षय तृतीया', sa: 'अक्षयतृतीया', mr: 'अक्षय्य तृतीया', gu: 'અક્ષય તૃતીયા' },
  'buddha purnima': { en: 'Buddha Purnima', hi: 'बुद्ध पूर्णिमा', sa: 'बुद्धपूर्णिमा', mr: 'बुद्ध पौर्णिमा', gu: 'બુદ્ધ પૂર્ણિમા' },
  'nirjala ekadashi': { en: 'Nirjala Ekadashi', hi: 'निर्जला एकादशी', sa: 'निर्जलाएकादशी', mr: 'निर्जला एकादशी', gu: 'નિર્જલા એકાદશી' },
  'devshayani ekadashi': { en: 'Devshayani Ekadashi', hi: 'देवशयनी एकादशी', sa: 'देवशयनीएकादशी', mr: 'देवशयनी एकादशी', gu: 'દેવશયની એકાદશી' },
  'ratha yatra': { en: 'Ratha Yatra', hi: 'रथयात्रा', sa: 'रथयात्रा', mr: 'रथयात्रा', gu: 'રથયાત્રા' },
  'sharad purnima': { en: 'Sharad Purnima', hi: 'शरद पूर्णिमा', sa: 'शरत्पूर्णिमा', mr: 'शरद पौर्णिमा', gu: 'શરદ પૂર્ણિમા' },
  'gita jayanti': { en: 'Gita Jayanti', hi: 'गीता जयन्ती', sa: 'गीताजयन्ती', mr: 'गीता जयंती', gu: 'ગીતા જયંતી' },
  'ratha saptami': { en: 'Ratha Saptami', hi: 'रथ सप्तमी', sa: 'रथसप्तमी', mr: 'रथ सप्तमी', gu: 'રથ સપ્તમી' },
  'chaitra navratri': { en: 'Chaitra Navratri', hi: 'चैत्र नवरात्रि', sa: 'चैत्रनवरात्रम्', mr: 'चैत्र नवरात्र', gu: 'ચૈત્ર નવરાત્રિ' },
  'sharad navratri': { en: 'Sharad Navratri', hi: 'शारदीय नवरात्रि', sa: 'शारदीय नवरात्रम्', mr: 'शारदीय नवरात्र', gu: 'શારદીય નવરાત્રિ' },
  'dussehra': { en: 'Dussehra', hi: 'विजयादशमी', sa: 'विजयादशमी', mr: 'दसरा', gu: 'વિજયાદશમી' },
  'nitya panchang': { en: 'Nitya Panchang', hi: 'नित्य पञ्चाङ्ग', sa: 'नित्यपञ्चाङ्गम्', mr: 'नित्य पंचांग', gu: 'નિત્ય પંચાંગ' },

  // Gregorian National & Public Holidays
  'republic day': { en: 'Republic Day', hi: 'गणतंत्र दिवस', sa: 'गणतन्त्रदिवसः', mr: 'प्रजासत्ताक दिन', gu: 'પ્રજાસત્તાક દિવસ' },
  'independence day': { en: 'Independence Day', hi: 'स्वतंत्रता दिवस', sa: 'स्वातन्त्र्यदिवसः', mr: 'स्वातंत्र्य दिन', gu: 'સ્વાતંત્ર્ય દિવસ' },
  'gandhi jayanti': { en: 'Mahatma Gandhi Jayanti', hi: 'गांधी जयन्ती', sa: 'गान्धीजयन्ती', mr: 'गांधी जयंती', gu: 'ગાંધી જયંતી' },
  'mahatma gandhi jayanti': { en: 'Mahatma Gandhi Jayanti', hi: 'गांधी जयन्ती', sa: 'गान्धीजयन्ती', mr: 'गांधी जयंती', gu: 'ગાંધી જયંતી' },
  'christmas day': { en: 'Christmas Day', hi: 'क्रिसमस', sa: 'क्रिसमस', mr: 'नाताळ', gu: 'નાતાળ' },
  'christmas': { en: 'Christmas', hi: 'क्रिसमस', sa: 'क्रिसमस', mr: 'नाताळ', gu: 'નાતાળ' },
  "new year's day": { en: "New Year's Day", hi: 'नव वर्ष दिवस', sa: 'नववर्षदिनम्', mr: 'नवीन वर्ष दिन', gu: 'નવા વર્ષ દિવસ' },
  'new year': { en: 'New Year', hi: 'नव वर्ष', sa: 'नववर्षम्', mr: 'नवीन वर्ष', gu: 'નવું વર્ષ' },
  'international labour day': { en: 'International Labour Day', hi: 'अंतर्राष्ट्रीय श्रमिक दिवस', sa: 'अन्तर्राष्ट्रीयश्रमदिवसः', mr: 'कामगार दिन', gu: 'કામદાર દિવસ' },
  'labour day': { en: 'Labour Day', hi: 'श्रमिक दिवस', sa: 'श्रमदिवसः', mr: 'कामगार दिन', gu: 'કામદાર દિવસ' },
  'may day': { en: 'May Day', hi: 'मई दिवस', sa: 'मे दिवसः', mr: 'कामगार दिन', gu: 'કામદાર દિવસ' },
};

/**
 * Sanitizes strings by stripping redundant parenthetical glosses or dual-language brackets,
 * while strictly preserving timestamps/clock times like "(06:42 AM)" or "(12:30 PM)".
 */
export function cleanTerm(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/\s*\((?!\s*\d{1,2}:\d{2}[^)]*\))[^)]*\)/g, '')
    .trim();
}

/**
 * Normalizes input strings for flexible case-insensitive lookup.
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[—–-]/g, ' ')
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dynamic Astrological Term Translator.
 * Translates raw terms (Tithis, Nakshatras, Yogas, Karanas, Months, Muhurats, Festivals)
 * into authentic Hinglish for English mode and pure Devanagari/native script for Indian languages,
 * ensuring zero dual-language brackets remain.
 */
export function translateTerm(term: string | undefined | null, lang?: SupportedLanguage): string {
  if (!term) return '';
  const targetLang = lang || 'en';
  const cleaned = cleanTerm(term);
  const normalized = normalizeKey(cleaned);

  // 1. Direct dictionary match
  if (ASTROLOGICAL_TERMS[normalized]?.[targetLang]) {
    return cleanTerm(ASTROLOGICAL_TERMS[normalized][targetLang]);
  }

  // 1b. Check if term has 'masa' suffix in dictionary (e.g. Jyeshtha Masa, Shravana Masa, Magha Masa)
  if (ASTROLOGICAL_TERMS[`${normalized} masa`]?.[targetLang]) {
    return cleanTerm(ASTROLOGICAL_TERMS[`${normalized} masa`][targetLang]);
  }

  // 1c. If term ends with ' masa', check base term (e.g. Kartika Masa -> Kartika)
  if (normalized.endsWith(' masa')) {
    const baseMonth = normalized.replace(/ masa$/, '');
    if (ASTROLOGICAL_TERMS[baseMonth]?.[targetLang]) {
      return cleanTerm(ASTROLOGICAL_TERMS[baseMonth][targetLang]);
    }
  }

  // 2. Try raw normalized before cleaning
  const rawNormalized = normalizeKey(term);
  if (ASTROLOGICAL_TERMS[rawNormalized]?.[targetLang]) {
    return cleanTerm(ASTROLOGICAL_TERMS[rawNormalized][targetLang]);
  }

  // 3. Compound phrase splitting: Paksha + Tithi (e.g., "Shukla Tritiya" or "Krishna Dashami")
  const parts = normalized.split(' ');
  if (parts.length === 2) {
    const p1 = ASTROLOGICAL_TERMS[parts[0]]?.[targetLang];
    const p2 = ASTROLOGICAL_TERMS[parts[1]]?.[targetLang];
    if (p1 && p2) {
      return cleanTerm(`${p1} ${p2}`);
    }
  }

  // 4. Return cleaned term
  return cleaned;
}
