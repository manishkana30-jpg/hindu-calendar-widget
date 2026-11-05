import { PanchangData } from './vedic-astronomy';
import { VratDefinition, VratDateEntry } from './vrat-data';
import { MuhuratCategoryDefinition } from './muhurat-data';

export function generatePanchangFaqSchema(panchang: PanchangData, cityName: string = 'New Delhi') {
  const tithi = panchang.udayaTithi || panchang.tithi;
  const tithiName = tithi?.name || 'Tithi';
  const paksha = tithi?.paksha || 'Shukla';
  const endTime = tithi?.endTime || 'Sunset';
  
  const rahuStart = panchang.muhurats?.rahuKaal?.start || '09:00 AM';
  const rahuEnd = panchang.muhurats?.rahuKaal?.end || '10:30 AM';

  const abhijitStart = panchang.muhurats?.abhijitMuhurat?.start || '11:45 AM';
  const abhijitEnd = panchang.muhurats?.abhijitMuhurat?.end || '12:35 PM';

  const sunrise = panchang.sunrise || '06:30 AM';
  const sunset = panchang.sunset || '06:00 PM';
  const nakshatra = panchang.nakshatra?.name || 'Ashwini';
  const samvat = panchang.vikramSamvat || 2083;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is today's Tithi and Paksha in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Today in ${cityName}, the prevailing Tithi is ${tithiName} during ${paksha} Paksha, ending at approximately ${endTime}.`
        }
      },
      {
        '@type': 'Question',
        name: `What is today's Rahu Kaal timing in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Today in ${cityName}, Rahu Kaal is from ${rahuStart} to ${rahuEnd}. In Vedic tradition, auspicious ceremonies and new beginnings should strictly be avoided during this window.`
        }
      },
      {
        '@type': 'Question',
        name: `What is today's Abhijit Muhurat in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Today's Abhijit Muhurat in ${cityName} is from ${abhijitStart} to ${abhijitEnd}. This is considered the most powerful universal window for commencing auspicious activities.`
        }
      },
      {
        '@type': 'Question',
        name: `What are the sunrise and sunset timings in ${cityName} today?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Sunrise in ${cityName} today is at ${sunrise} and sunset is at ${sunset}. All Dina Mana and Choghadiya partitions are calculated relative to these solar boundaries.`
        }
      },
      {
        '@type': 'Question',
        name: `Which Nakshatra is active today in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Today's prevailing constellation (Nakshatra) is ${nakshatra} under Vikram Samvat ${samvat}.`
        }
      }
    ]
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function generateVratEventSchema(vrat: VratDefinition, dates: VratDateEntry[]) {
  return dates.slice(0, 10).map((d) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${vrat.name} - ${d.name}`,
    description: `${vrat.description} Observed on ${d.tithiName} with fast breaking (Parana): ${d.paranaTime}.`,
    startDate: d.date.toISOString().split('T')[0],
    endDate: d.date.toISOString().split('T')[0],
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Global Vedic Observance',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN'
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'Daily Tithi Vedic Astrometry',
      url: 'https://dailytithi.com'
    }
  }));
}

export function generateVratFaqSchema(vrat: VratDefinition) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...vrat.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer
        }
      })),
      {
        '@type': 'Question',
        name: `What are the Dharma Shastra scriptural rules for ${vrat.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${vrat.dharmaShastraRule.english} (${vrat.dharmaShastraRule.shastraReference})`
        }
      }
    ]
  };
}

export function generateMuhuratFaqSchema(muhurat: MuhuratCategoryDefinition) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...muhurat.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer
        }
      })),
      {
        '@type': 'Question',
        name: `Which Nakshatras and Tithis are auspicious for ${muhurat.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Favorable Nakshatras: ${muhurat.favorableNakshatras.join(', ')}. Favorable Tithis: ${muhurat.favorableTithis.join(', ')}. Avoid: ${muhurat.avoidances.join(', ')}.`
        }
      }
    ]
  };
}

