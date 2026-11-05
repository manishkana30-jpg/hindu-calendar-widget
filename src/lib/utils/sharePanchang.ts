import { PanchangData } from '../vedic-astronomy';
import { ActiveMuhuratState } from '@/src/hooks/usePanchang';
import { getActivePanchakStatus } from '../dharmashastra-rules';

export interface PanchangShareData {
  date: Date;
  vara?: string;
  dayOfWeekName?: string;
  tithiName?: string;
  paksha?: 'Shukla' | 'Krishna' | string;
  significance?: string;
  tithiEndTime?: string;
  sunrise?: string;
  sunset?: string;
  auspiciousWindow?: string;
  rahuKaalWindow?: string;
  panchakStatus?: string;
  appUrl?: string;
  callToAction?: string;
}

export interface ShareOptions {
  onToast?: (message: string) => void;
  target?: '_blank' | '_self';
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'whatsapp' | 'clipboard';
  message?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Builds standard share data from active Panchang calculations and state.
 */
export function buildShareDataFromPanchang(
  date: Date,
  panchang: PanchangData,
  activeMuhurat?: ActiveMuhuratState | null,
  customPanchakStatus?: string
): PanchangShareData {
  const vara = panchang.dayOfWeekName || panchang.vaar?.name || date.toLocaleDateString('en-US', { weekday: 'long' });

  const tithi = panchang.udayaTithi || panchang.tithi;
  const tithiName = tithi?.name || 'Pratipada';
  const paksha = tithi?.paksha || 'Shukla';

  let significance = '';
  if (panchang.todayFestival?.title) {
    significance = panchang.todayFestival.title;
  } else if (panchang.todayFestival?.shortName) {
    significance = panchang.todayFestival.shortName;
  } else if (tithi?.deity) {
    significance = `Deity: ${tithi.deity}`;
  } else {
    significance = paksha === 'Shukla' ? 'Shukla Paksha' : 'Krishna Paksha';
  }
  if (significance.length > 28) {
    significance = significance.split('(')[0].trim();
  }

  let tithiEndTime = tithi?.endTime || 'Sunset';
  if (tithi?.endDate && tithi.endDate.getDate() !== date.getDate()) {
    if (!tithiEndTime.toLowerCase().includes('tomorrow')) {
      tithiEndTime = `Tomorrow ${tithiEndTime}`;
    }
  }

  let auspiciousWindow = '';
  const abhijit = panchang.muhurats?.abhijitMuhurat;
  if (abhijit?.start && abhijit?.end) {
    auspiciousWindow = `${abhijit.start} – ${abhijit.end}`;
  } else if (panchang.muhurats?.amritKaal?.start && panchang.muhurats?.amritKaal?.end) {
    auspiciousWindow = `${panchang.muhurats.amritKaal.start} – ${panchang.muhurats.amritKaal.end}`;
  } else if (activeMuhurat?.windowString) {
    auspiciousWindow = `${activeMuhurat.windowString}`;
  } else {
    auspiciousWindow = '11:45 AM – 12:35 PM';
  }

  let rahuKaalWindow = '';
  const rahu = panchang.muhurats?.rahuKaal;
  if (rahu?.start && rahu?.end) {
    rahuKaalWindow = `${rahu.start} – ${rahu.end}`;
  } else {
    rahuKaalWindow = '09:15 AM – 10:45 AM';
  }

  let panchakStatus = 'No Active Panchak (Free)';
  if (customPanchakStatus && customPanchakStatus.trim()) {
    panchakStatus = customPanchakStatus;
  } else {
    const panchakInfo = getActivePanchakStatus(date);
    if (panchakInfo?.isActive && panchakInfo.panchak) {
      panchakStatus = `${panchakInfo.panchak.type} (Active)`;
    } else {
      panchakStatus = 'No Active Panchak (Free)';
    }
  }

  return {
    date,
    vara,
    tithiName,
    paksha,
    significance,
    tithiEndTime,
    sunrise: panchang.sunrise || '06:30 AM',
    sunset: panchang.sunset || '06:15 PM',
    auspiciousWindow,
    rahuKaalWindow,
    panchakStatus,
    appUrl: 'https://dailytithi.com'
  };
}

/**
 * Assembles today's calculated Tithi, Muhurat, and Rahu Kaal data into
 * the exact viral WhatsApp greeting card specification.
 */
export function formatPanchangShareText(data: PanchangShareData): string {
  const day = data.date.getDate();
  const month = MONTH_NAMES[data.date.getMonth()];
  const year = data.date.getFullYear();
  const vara = data.vara || data.dayOfWeekName || data.date.toLocaleDateString('en-US', { weekday: 'long' });
  const paksha = data.paksha || 'Shukla';
  
  // Format clean Tithi name e.g. "Shukla- Saptami" or just the tithi name
  let cleanTithi = data.tithiName || 'Pratipada';
  cleanTithi = cleanTithi.replace(/^(Shukla|Krishna)\s*/i, '').trim();

  const formattedDate = `${day} ${month} ${year}, ${vara}`;
  const tithiEndTime = data.tithiEndTime || 'Sunset';
  const sunrise = data.sunrise || '06:30 AM';
  const sunset = data.sunset || '06:15 PM';
  const auspiciousWindow = data.auspiciousWindow || '11:45 AM – 12:35 PM';
  const rahuKaalWindow = data.rahuKaalWindow || '09:15 AM – 10:45 AM';
  const appUrl = data.appUrl || 'https://dailytithi.com';

  return `🌸 *Aaj Ka Panchang • Daily Tithi* 🌸
📅 ${formattedDate}
✨ Tithi: ${paksha}- ${cleanTithi} (upto ${tithiEndTime})
🌅 Sunrise: ${sunrise} | 🌇 Sunset: ${sunset}
⚡ Shubh Muhurat: ${auspiciousWindow}
⚠️ Rahu Kaal: ${rahuKaalWindow} (Avoid)

👉 Check full Panchang & Choghadiya: ${appUrl}`;
}

/**
 * Checks whether the current runtime environment is a mobile browser.
 */
function isMobileClient(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /android|iphone|ipad|ipod/i.test(ua);
}

/**
 * Robust fallback-aware Panchang share handler:
 * 1. Mobile First: Attempt navigator.share({ title, text, url }) on Android/iOS.
 * 2. WhatsApp Direct Fallback: On desktop or when share is rejected, open api.whatsapp.com.
 * 3. Clipboard Fallback: If blocked, copy formatted text to clipboard and show toast.
 */
export async function sharePanchang(
  data: PanchangShareData,
  options: ShareOptions = {}
): Promise<ShareResult> {
  const shareText = formatPanchangShareText(data);
  const appUrl = data.appUrl || 'https://dailytithi.com';
  const onToast = options.onToast || (() => {});

  // 1. Mobile Web Share API Attempt
  if (isMobileClient() && typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      if (navigator.canShare && navigator.canShare({ title: 'Daily Tithi — Aaj Ka Panchang', text: shareText, url: appUrl })) {
        await navigator.share({
          title: 'Daily Tithi — Aaj Ka Panchang',
          text: shareText,
          url: appUrl
        });
        return { success: true, method: 'native' };
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return { success: false, method: 'native', message: 'Share dismissed' };
      }
    }
  }

  // 2. Direct WhatsApp URL Intent
  try {
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

    if (typeof window !== 'undefined') {
      const opened = window.open(whatsappUrl, options.target || '_blank', 'noopener,noreferrer');
      if (opened) {
        onToast('Opening WhatsApp...');
        return { success: true, method: 'whatsapp' };
      }
    }
  } catch (err: unknown) {
    console.warn('[Share] WhatsApp direct open error:', err);
  }

  // 3. Resilient Clipboard Fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      onToast('Panchang copied to clipboard! Ready to paste in WhatsApp.');
      return { success: true, method: 'clipboard' };
    } catch (clipErr) {
      console.warn('[Share] Clipboard write failed:', clipErr);
    }
  }

  return { success: false, method: 'whatsapp', message: 'Unable to open share sheet' };
}
