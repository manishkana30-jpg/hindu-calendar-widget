import { SupportedLanguage, translateTerm as translateTermRaw } from '../i18n/translations';

/**
 * Normalizes Paksha and Tithi into strict '[Paksha]- [Tithi]' format.
 * Eliminates redundant wording (e.g., 'Krishna Paksha . Krishna Saptami' -> 'Krishna- Saptami',
 * 'कृष्ण पक्ष • कृष्ण सप्तमी' -> 'कृष्ण- सप्तमी').
 *
 * In 'en' mode: 'Krishna- Saptami', 'Shukla- Ekadashi', 'Shukla- Pratipada'
 * In 'hi' mode: 'कृष्ण- सप्तमी', 'शुक्ल- एकादशी', 'शुक्ल- प्रतिपदा'
 */
export function formatNormalizedPakshaTithi(
  pakshaInput: string | undefined | null,
  tithiInput: string | undefined | null,
  lang: SupportedLanguage = 'en',
  pureNameInput?: string | undefined | null
): string {
  let rawPure = (pureNameInput || '').trim();
  let rawPaksha = (pakshaInput || '').trim();

  const combined = `${rawPaksha} ${tithiInput || ''}`.trim();

  // Deduce Paksha if missing or empty
  if (!rawPaksha) {
    if (combined.toLowerCase().includes('krishna') || combined.includes('कृष्ण') || combined.includes('કૃષ્ણ')) {
      rawPaksha = 'Krishna';
    } else if (combined.toLowerCase().includes('shukla') || combined.includes('शुक्ल') || combined.includes('શુક્લ')) {
      rawPaksha = 'Shukla';
    } else {
      rawPaksha = 'Shukla';
    }
  }

  // If pureName wasn't explicitly provided, strip redundant words from tithiInput
  if (!rawPure && tithiInput) {
    let cleaned = tithiInput
      .replace(/\s*\([^)]*\)/g, ' ') // remove parenthetical text
      .replace(/[.•·\-_|/]/g, ' '); // remove dots, hyphens, bullets

    // Strip paksha words and repeated paksha names across ASCII & Indic scripts (Devanagari, Gujarati, etc.)
    const pakshaPattern = /(^|\s+)(krishna|shukla|paksha|paksh|कृष्ण|शुक्ल|पक्ष|पक्षम्|કૃષ્ણ|શુક્લ|પક્ષ)(?=\s+|$)/gi;
    cleaned = cleaned.replace(pakshaPattern, ' ');
    cleaned = cleaned.replace(pakshaPattern, ' '); // Second pass for consecutive tokens

    rawPure = cleaned.replace(/\s+/g, ' ').trim();
  }

  // Default fallback if parsing fails
  if (!rawPure) {
    rawPure = 'Pratipada';
  }

  // Translate both tokens
  const translatedPaksha = translateTermRaw(rawPaksha, lang) || rawPaksha;
  const translatedTithi = translateTermRaw(rawPure, lang) || rawPure;

  // Final cleanup of translated strings to guarantee no accidental residual words
  const cleanPakshaStr = translatedPaksha
    .replace(/(^|\s+)(paksha|paksh|पक्ष|पक्षम्|પક્ષ)(?=\s+|$)/gi, ' ')
    .trim();
  const cleanTithiStr = translatedTithi
    .replace(/(^|\s+)(paksha|paksh|पक्ष|पक्षम्|પક્ષ)(?=\s+|$)/gi, ' ')
    .replace(/(^|\s+)(krishna|shukla|कृष्ण|शुक्ल|કૃષ્ણ|શુક્લ)(?=\s+|$)/gi, ' ')
    .trim();

  return `${cleanPakshaStr}- ${cleanTithiStr}`;
}

/**
 * Strips the redundant word 'Masa'/'MASA'/'मास' from month names so it strictly renders
 * only the month name (e.g. 'Kartika', 'कार्तिक').
 *
 * English: 'Kartika', 'Margashirsha', 'Chaitra', 'Vaisakha'
 * Hindi: 'कार्तिक', 'मार्गशीर्ष', 'चैत्र', 'वैशाख'
 */
export function cleanMasaMonthName(
  rawMonth: string | undefined | null,
  lang: SupportedLanguage = 'en'
): string {
  if (!rawMonth) return '';
  // 1. Strip brackets e.g. (Purnimanta) or (Amanta)
  let clean = rawMonth.replace(/\s*\([^)]*\)/g, ' ').trim();
  // 2. Strip Masa / MASA / मास / मासम् / महिना / માસ (Unicode-safe word boundaries)
  const masaPattern = /(^|\s+)(masa|मास|मासम्|महिना|માસ)(?=\s+|$)/gi;
  clean = clean.replace(masaPattern, ' ').trim();
  // 3. Translate raw month name
  const translated = translateTermRaw(clean, lang) || clean;
  // 4. Strip again in case translation dictionary returned a string with Masa
  return translated.replace(masaPattern, ' ').trim();
}

/**
 * Formats Tithi end time in clean, muted text without line-wrapping.
 * English: 'upto 08:42 PM' or 'Full Day'
 * Hindi: 'तक 08:42 PM' or 'पूरा दिन'
 */
export function formatTithiEndTime(
  endTimeStr: string | undefined | null,
  lang: SupportedLanguage = 'en'
): string {
  const raw = (endTimeStr || '').trim();
  if (!raw || raw.toLowerCase().includes('full day')) {
    return lang === 'hi' ? 'पूरा दिन' : (lang === 'sa' ? 'अहोरात्रम्' : 'Full Day');
  }
  if (raw.toLowerCase().startsWith('upto') || raw.startsWith('तक')) {
    return raw;
  }
  const uptoLabel = lang === 'hi' ? 'तक' : (lang === 'sa' ? 'यावत्' : (lang === 'mr' ? 'पर्यंत' : (lang === 'gu' ? 'સુધી' : 'upto')));
  return `${uptoLabel} ${raw}`;
}
