import { PanchangData } from '../vedic-astronomy';
import { ActiveMuhuratState } from '@/src/hooks/usePanchang';
import { getActivePanchakStatus } from '../dharmashastra-rules';

export interface PanchangShareData {
  date: Date;
  vara?: string;
  dayOfWeekName?: string;
  tithiName?: string;
  significance?: string;
  tithiEndTime?: string;
  auspiciousWindow?: string;
  rahuKaalWindow?: string;
  panchakStatus?: string;
  appUrl?: string;
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

  let significance = '';
  if (panchang.todayFestival?.title) {
    significance = panchang.todayFestival.title;
  } else if (panchang.todayFestival?.shortName) {
    significance = panchang.todayFestival.shortName;
  } else if (tithi?.deity) {
    significance = `Deity: ${tithi.deity}`;
  } else {
    significance = tithi?.paksha === 'Shukla' ? 'Shukla Paksha' : 'Krishna Paksha';
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
    auspiciousWindow = `${abhijit.start} – ${abhijit.end} (Abhijit Muhurat)`;
  } else if (panchang.muhurats?.amritKaal?.start && panchang.muhurats?.amritKaal?.end) {
    auspiciousWindow = `${panchang.muhurats.amritKaal.start} – ${panchang.muhurats.amritKaal.end} (Amrit Kaal)`;
  } else if (activeMuhurat?.windowString) {
    auspiciousWindow = `${activeMuhurat.windowString} (${activeMuhurat.title})`;
  } else {
    auspiciousWindow = '11:45 AM – 12:35 PM (Abhijit Muhurat)';
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
    significance,
    tithiEndTime,
    auspiciousWindow,
    rahuKaalWindow,
    panchakStatus,
    appUrl: 'https://dailytithi.com'
  };
}

/**
 * Assembles today's calculated Tithi, Muhurat, and Rahu Kaal data into
 * the exact WhatsApp greeting card specification.
 */
export function formatPanchangShareText(data: PanchangShareData): string {
  const day = data.date.getDate();
  const month = MONTH_NAMES[data.date.getMonth()];
  const year = data.date.getFullYear();
  const vara = data.vara || data.dayOfWeekName || data.date.toLocaleDateString('en-US', { weekday: 'long' });
  const tithiName = data.tithiName || 'Pratipada';
  const significance = data.significance || 'Sacred Day';
  const tithiEndTime = data.tithiEndTime || 'At Sunset';
  const auspiciousWindow = data.auspiciousWindow || '11:45 AM – 12:35 PM (Abhijit Muhurat)';
  const rahuKaalWindow = data.rahuKaalWindow || '09:15 AM – 10:45 AM';
  const panchakStatus = data.panchakStatus || 'No Active Panchak (Free)';
  const appUrl = data.appUrl || 'https://dailytithi.com';

  return `🌅 Aaj Ka Panchang • Daily Tithi
📅 ${vara}, ${day} ${month} ${year}

🪔 Tithi: ${tithiName} (${significance})
⏳ Tithi Ends: ${tithiEndTime}

🟢 Shubh Window: ${auspiciousWindow}
🔴 Rahu Kaal: ${rahuKaalWindow}
🛡️ Panchak: ${panchakStatus}

Check live real-time muhurat & panchang:
${appUrl}`;
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
  const formattedText = formatPanchangShareText(data);
  const appUrl = data.appUrl || 'https://dailytithi.com';
  const isMobile = isMobileClient();

  // 1. Mobile First: On mobile devices with navigator.share, trigger the native share sheet
  if (isMobile && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: 'Aaj Ka Panchang • Daily Tithi',
        text: formattedText,
        url: appUrl
      });
      return { success: true, method: 'native' };
    } catch (err: unknown) {
      const error = err as Error;
      if (error && error.name === 'AbortError') {
        return { success: false, method: 'native', message: 'Share sheet dismissed' };
      }
      // On failure, fall through to WhatsApp direct
    }
  }

  // 2. WhatsApp Direct Fallback (or default behavior on Desktop)
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;
  try {
    if (typeof window !== 'undefined') {
      const win = window.open(whatsappUrl, options.target || '_blank', 'noopener,noreferrer');
      if (win) {
        return { success: true, method: 'whatsapp' };
      }
    }
  } catch {
    // Window open blocked by browser popup blocker
  }

  // 3. Clipboard Fallback
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(formattedText);
      const toastMsg = 'Panchang copied to clipboard!';
      if (options.onToast) {
        options.onToast(toastMsg);
      }
      return { success: true, method: 'clipboard', message: toastMsg };
    }
  } catch {
    // Clipboard failed
  }

  return { success: false, method: 'clipboard', message: 'Unable to share' };
}
