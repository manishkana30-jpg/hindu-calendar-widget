import { MonthCalendarDay } from '../vedic-astronomy';
import { SupportedLanguage, TranslationDictionary } from '../i18n/translations';

export interface DharmaShastraRule {
  prefix: string;
  ruleText: string;
  fullRule: string;
}

/**
 * Strips any bracketed glosses (...) or dual explanations to enforce Rule 1 (zero brackets)
 */
function stripBrackets(str: string): string {
  return str.replace(/\s*\([^)]*\)/g, '').trim();
}

/**
 * Resolves the authoritative Dharma Shastra governing rule for a given calendar day.
 * Determines whether the day follows the default Udaya-Vyapini rule or specific
 * Vrat exceptions (Dashami Vedha for Ekadashi, Pradosha Kaal for Pradosh, Chandrodaya
 * for Sankashti, Nishita Kaal for Shivaratri, Kshaya/Vriddhi Tithi, or Festival-specific Smriti rules).
 */
export function resolveDharmaShastraRule(
  day: MonthCalendarDay,
  language: SupportedLanguage,
  t: (key: keyof TranslationDictionary) => string
): DharmaShastraRule {
  const prefix = t('dharmaShastraPrefix');
  const isHi = language === 'hi';
  const festLower = (day.festival || '').toLowerCase();

  // 1. Kshaya Tithi Rule (Tithi started after previous sunrise and ended before current sunrise)
  if (day.udayaTithi.isKshayaTithi) {
    const text = t('ruleKshayaTithi');
    return {
      prefix,
      ruleText: text,
      fullRule: `${prefix} ${text}`
    };
  }

  // 2. Vriddhi Tithi Rule (Tithi spans across two consecutive sunrises)
  if (day.udayaTithi.isVriddhiTithi) {
    const text = t('ruleVriddhiTithi');
    return {
      prefix,
      ruleText: text,
      fullRule: `${prefix} ${text}`
    };
  }

  // 3. Ekadashi Vrat (Dashami Vedha Rule)
  if (day.udayaTithi.isEkadashi || festLower.includes('ekadashi')) {
    const text = t('ruleEkadashiVedha');
    return {
      prefix,
      ruleText: text,
      fullRule: `${prefix} ${text}`
    };
  }

  // 4. Pradosh Vrat (Pradosha Kaal Vyapini)
  if (festLower.includes('pradosh') || day.udayaTithi.index === 13 || day.udayaTithi.index === 28) {
    const text = t('rulePradoshaKaal');
    return {
      prefix,
      ruleText: text,
      fullRule: `${prefix} ${text}`
    };
  }

  // 5. Sankashti Chaturthi / Karwa Chauth (Chandrodaya Vyapini)
  if (festLower.includes('sankashti') || festLower.includes('karwa') || (day.udayaTithi.paksha === 'Krishna' && day.udayaTithi.index === 19)) {
    const text = t('ruleChandrodaya');
    return {
      prefix,
      ruleText: text,
      fullRule: `${prefix} ${text}`
    };
  }

  // 6. Shivaratri / Masa Shivaratri (Nishita Kaal Vyapini)
  if (festLower.includes('shivaratri') || (day.udayaTithi.paksha === 'Krishna' && day.udayaTithi.index === 29)) {
    const text = t('ruleNishitaKaal');
    return {
      prefix,
      ruleText: text,
      fullRule: `${prefix} ${text}`
    };
  }

  // 7. Festival Specific Shastra briefRule (if explicitly provided in festival database)
  if (day.festivalDetails?.briefRule) {
    const customRule = isHi 
      ? day.festivalDetails.briefRule.hindi 
      : (day.festivalDetails.briefRule.english || day.festivalDetails.briefRule.hindi);
    if (customRule && customRule.trim().length > 0) {
      const cleanCustom = stripBrackets(customRule);
      return {
        prefix,
        ruleText: cleanCustom,
        fullRule: `${prefix} ${cleanCustom}`
      };
    }
  }

  // 8. Purnima & Amavasya Parva
  if (day.udayaTithi.isPurnima || day.udayaTithi.isAmavasya) {
    const text = t('rulePurnimaAmavasya');
    return {
      prefix,
      ruleText: text,
      fullRule: `${prefix} ${text}`
    };
  }

  // 9. Default Udaya Tithi Rule (Governs all general days per Surya Siddhanta)
  const sunriseTime = day.sunrise || 'Sunrise';
  const text = t('ruleUdayaTithi').replace('{time}', sunriseTime);
  return {
    prefix,
    ruleText: text,
    fullRule: `${prefix} ${text}`
  };
}

