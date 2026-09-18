/**
 * Daily Panchang Notification Payload Builder
 * 
 * Dynamically assembles intelligent, context-aware notification payloads
 * based on whether the day has an active Festival, Vrat, or Panchak.
 * Strictly avoids placeholder markers ("No festival", "None", etc.) on ordinary days.
 */

export interface PanchangNotificationData {
  tithi: string;
  paksha: string;
  samvat: string;
  festival?: string | null;
  vrat?: string | null;
  panchak?: { isActive: boolean; type?: string } | null;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon: string;
  badge: string;
  data: { url: string };
}

/**
 * Truncates text cleanly at word boundaries if it exceeds maxLength.
 */
function truncateCleanly(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.6) {
    return `${truncated.slice(0, lastSpace)}...`;
  }
  return `${truncated}...`;
}

/**
 * Sanitizes and extracts valid attribute strings, filtering out placeholders.
 */
function sanitizeAttribute(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === '' ||
    lower === 'none' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower.includes('nitya panchang') ||
    lower.includes('no festival') ||
    lower.includes('no vrat') ||
    lower.includes('no panchak')
  ) {
    return null;
  }
  return trimmed;
}

export function buildDailyNotificationPayload(data: PanchangNotificationData): NotificationPayload {
  const tithi = data.tithi?.trim() || 'Panchang';
  const paksha = data.paksha?.trim() || '';
  const samvat = data.samvat?.trim() || '';

  const cleanFestival = sanitizeAttribute(data.festival);
  const cleanVrat = sanitizeAttribute(data.vrat);
  const isPanchakActive = Boolean(data.panchak?.isActive);
  const cleanPanchakType = isPanchakActive ? (data.panchak?.type?.trim() || 'Panchak') : null;

  // Identify active items with appropriate iconography
  const activeItems: { type: 'festival' | 'vrat' | 'panchak'; label: string; titleLabel: string }[] = [];

  if (cleanFestival) {
    activeItems.push({
      type: 'festival',
      label: `🎉 ${cleanFestival}`,
      titleLabel: `🎉 ${cleanFestival}`
    });
  }

  if (cleanVrat) {
    activeItems.push({
      type: 'vrat',
      label: `🙏 ${cleanVrat}`,
      titleLabel: `🙏 ${cleanVrat}`
    });
  }

  if (cleanPanchakType) {
    activeItems.push({
      type: 'panchak',
      label: `⚠️ ${cleanPanchakType}`,
      titleLabel: `⚠️ ${cleanPanchakType} Active`
    });
  }

  const activeCount = activeItems.length;

  let title = '';
  let body = '';

  // Base paksha/tithi string (avoid duplicate paksha if tithi string already contains it)
  const baseTithiInfo =
    paksha && !tithi.toLowerCase().startsWith(paksha.toLowerCase())
      ? `${paksha} ${tithi}`
      : tithi;
  const baseSamvatInfo = samvat ? `Vikram Samvat ${samvat}` : '';

  if (activeCount === 0) {
    // ─────────────────────────────────────────────────────────────────────────
    // CASE A: Normal Day (No Vrat, No Panchak, No Festival)
    // ─────────────────────────────────────────────────────────────────────────
    title = `Today's Tithi: ${tithi}`;
    body = baseSamvatInfo ? `${baseTithiInfo} • ${baseSamvatInfo}` : baseTithiInfo;
  } else if (activeCount === 1) {
    // ─────────────────────────────────────────────────────────────────────────
    // CASE B: Single Attribute Active
    // ─────────────────────────────────────────────────────────────────────────
    const single = activeItems[0];
    title = `${single.titleLabel} | ${tithi}`;
    body = baseSamvatInfo ? `${baseTithiInfo} • ${baseSamvatInfo}` : baseTithiInfo;
  } else {
    // ─────────────────────────────────────────────────────────────────────────
    // CASE C: Multiple Attributes Active (2 or 3 items)
    // ─────────────────────────────────────────────────────────────────────────
    // Highlight hierarchy: Festival > Vrat > Panchak
    const primary =
      activeItems.find(i => i.type === 'festival') ||
      activeItems.find(i => i.type === 'vrat') ||
      activeItems[0];

    title = `${primary.titleLabel} & Sacred Observances`;

    const itemsSummary = activeItems.map(i => i.label).join(' • ');
    body = `${tithi} • ${itemsSummary}`;
  }

  // Ensure body stays within lock-screen budget (~120 chars)
  const constrainedBody = truncateCleanly(body, 120);

  return {
    title,
    body: constrainedBody,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: {
      url: '/'
    }
  };
}
