import { PanchangData } from './vedic-astronomy';
import { VratDefinition, VratDateEntry } from './vrat-data';
import { MuhuratCategoryDefinition } from './muhurat-data';

export function generatePanchangFaqSchema(
  panchang: PanchangData,
  cityName: string = 'New Delhi',
  lang: string = 'en',
  localizedCityName?: string
) {
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
  const locCity = localizedCityName || cityName;

  if (lang === 'hi') {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `आज ${locCity} में कौन सी तिथि और पक्ष है?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `आज ${locCity} में सक्रिय तिथि ${tithiName} (${paksha} पक्ष) है, जो लगभग ${endTime} तक मान्य रहेगी।`
          }
        },
        {
          '@type': 'Question',
          name: `आज ${locCity} में राहु काल का समय क्या है?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} में आज राहु काल ${rahuStart} से ${rahuEnd} तक है। वैदिक शास्त्रों के अनुसार इस समय शुभ कार्य और नए अनुबंध वर्जित हैं।`
          }
        },
        {
          '@type': 'Question',
          name: `आज ${locCity} में अभिजीत मुहूर्त कब है?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} में आज अभिजीत मुहूर्त ${abhijitStart} से ${abhijitEnd} तक है। यह समय सभी प्रकार के मांगलिक कार्यों के लिए अत्यंत शुभ माना जाता है।`
          }
        },
        {
          '@type': 'Question',
          name: `आज ${locCity} में सूर्योदय और सूर्यास्त का समय क्या है?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} में आज सूर्योदय ${sunrise} और सूर्यास्त ${sunset} पर होगा। दिनमान की सभी चौघड़िया गणनाएं इसी सौर समय पर आधारित हैं।`
          }
        },
        {
          '@type': 'Question',
          name: `आज ${locCity} में कौन सा नक्षत्र सक्रिय है?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `आज ${locCity} में विक्रम संवत ${samvat} के अंतर्गत सक्रिय नक्षत्र ${nakshatra} है।`
          }
        }
      ]
    };
  }

  if (lang === 'mr') {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `आज ${locCity} मध्ये कोणती तिथी आणि पक्ष आहे?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `आज ${locCity} मध्ये सक्रिय तिथी ${tithiName} (${paksha} पक्ष) आहे, जी अंदाजे ${endTime} पर्यंत राहील.`
          }
        },
        {
          '@type': 'Question',
          name: `आज ${locCity} मध्ये राहु काळ ची वेळ काय आहे?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} मध्ये आज राहु काळ ${rahuStart} ते ${rahuEnd} पर्यंत आहे. वैदिक परंपरेनुसार या काळात शुभ कार्ये टाळावीत.`
          }
        },
        {
          '@type': 'Question',
          name: `आज ${locCity} मध्ये अभिजित मुहूर्त कधी आहे?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} मध्ये आज अभिजit मुहूर्त ${abhijitStart} ते ${abhijitEnd} पर्यंत आहे. हा काळ सर्व प्रकारच्या मंगल कार्यांसाठी अत्यंत शुभ मानला जातो.`
          }
        },
        {
          '@type': 'Question',
          name: `आज ${locCity} मध्ये सूर्योदय आणि सूर्यास्त ची वेळ काय आहे?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} मध्ये आज सूर्योदय ${sunrise} आणि सूर्यास्त ${sunset} वाजता होईल. दिनमानाचे सर्व चोघडिया याच वेळेनुसार ठरतात.`
          }
        },
        {
          '@type': 'Question',
          name: `आज ${locCity} मध्ये कोणते नक्षत्र सक्रिय आहे?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `आज ${locCity} मध्ये विक्रम संवत ${samvat} अंतर्गत सक्रिय नक्षत्र ${nakshatra} आहे.`
          }
        }
      ]
    };
  }

  if (lang === 'gu') {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `આજે ${locCity} માં કઈ તિથિ અને પક્ષ છે?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `આજે ${locCity} માં સક્રિય તિથિ ${tithiName} (${paksha} પક્ષ) છે, જે આશરે ${endTime} સુધી રહેશે.`
          }
        },
        {
          '@type': 'Question',
          name: `આજે ${locCity} માં રાહુ કાળ નો સમય શું છે?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} માં આજે રાહુ કાળ ${rahuStart} થી ${rahuEnd} સુધી છે. વૈદિક શાસ્ત્રો મુજબ આ સમયગાળા દરમિયાન શુભ કાર્યો ટાળવા જોઈએ.`
          }
        },
        {
          '@type': 'Question',
          name: `આજે ${locCity} માં અભિજીત મુહૂર્ત ક્યારે છે?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} માં આજે અભિજીત મુહૂર્ત ${abhijitStart} થી ${abhijitEnd} સુધી છે. આ સમય તમામ માંગલિક કાર્યો માટે સર્વોત્તમ માનવામાં આવે છે.`
          }
        },
        {
          '@type': 'Question',
          name: `આજે ${locCity} માં સૂર્યોદય અને સૂર્યાસ્ત નો સમય શું છે?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${locCity} માં આજે સૂર્યોદય ${sunrise} અને સૂર્યાસ્ત ${sunset} વાગ્યે થશે. દિવસમાન અને ચોઘડિયા ની ગણતરી આ સૌર સમય પર આધારિત છે.`
          }
        },
        {
          '@type': 'Question',
          name: `આજે ${locCity} માં કયું નક્ષત્ર સક્રિય છે?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `આજે ${locCity} માં વિક્રમ સંવત ${samvat} હેઠળ સક્રિય નક્ષત્ર ${nakshatra} છે.`
          }
        }
      ]
    };
  }

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

