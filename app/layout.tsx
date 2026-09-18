import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { FloatingInstallShare } from './components/FloatingInstallShare';

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
  display: 'swap' 
});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap' 
});

export const viewport: Viewport = {
  themeColor: '#090e1a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vikram-samvat-widget.vercel.app'),
  title: "Hindu Calendar & Live Panchang | Today's Tithi & Muhurat",
  description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
  keywords: [
    'Hindu Calendar & Live Panchang', 'Vikram Samvat 2083', 'Shaka Samvat 1948', 
    'Udaya Tithi today', 'Choghadiya Muhurat', 'Hindu festival calendar', 
    'Panchak timing', 'Ghati Pala calculator', 'Swiss Ephemeris Vedic calendar', 
    'live panchang widget', 'Ishta Kaal', 'Dharmashastra', 'Vedic Astrology'
  ],
  authors: [{ name: 'Vedic Astrometry Research Team' }],
  creator: 'Vedic Astrometry Research Team',
  publisher: 'Hindu Calendar & Live Panchang',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vikram-samvat-widget.vercel.app/',
    siteName: 'Hindu Calendar & Live Panchang',
    title: "Hindu Calendar & Live Panchang | Today's Tithi & Muhurat",
    description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
    images: [
      {
        url: 'https://vikram-samvat-widget.vercel.app/api/og',
        width: 1200,
        height: 630,
        alt: 'Hindu Calendar & Live Panchang Preview Card'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hindu Calendar & Live Panchang | Today's Tithi & Muhurat",
    description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
    images: ['https://vikram-samvat-widget.vercel.app/api/og']
  },
  alternates: {
    canonical: 'https://vikram-samvat-widget.vercel.app/'
  }
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://vikram-samvat-widget.vercel.app/#webpage',
      url: 'https://vikram-samvat-widget.vercel.app/',
      name: "Hindu Calendar & Live Panchang | Today's Tithi & Muhurat",
      description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://vikram-samvat-widget.vercel.app/#website',
        name: 'Hindu Calendar & Live Panchang',
        url: 'https://vikram-samvat-widget.vercel.app/'
      },
      about: {
        '@type': 'Thing',
        name: 'Vedic Astrometry and Hindu Panchang System'
      },
      author: {
        '@type': 'Organization',
        name: 'Vedic Astrometry Research Team'
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://vikram-samvat-widget.vercel.app/'
          }
        ]
      }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://vikram-samvat-widget.vercel.app/#software',
      name: 'Hindu Calendar & Live Panchang',
      url: 'https://vikram-samvat-widget.vercel.app/',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'All (Web, Android, iOS, Windows, macOS)',
      browserRequirements: 'Modern browser with JavaScript support. Functions 100% offline.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      description: 'Real-time Vedic astrometry dashboard delivering live Ghati/Pala timekeeping, Udaya Tithi, dynamic Choghadiya Muhurats, Panchak tracking, and Dharmashastra-compliant festival calculations with offline PWA capabilities.'
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://vikram-samvat-widget.vercel.app/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: "What is today's Udaya Tithi and how is it calculated?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Udaya Tithi is the lunar day active at the exact moment of local sunrise at your coordinates. In Hindu Dharmashastra canons such as the Nirnayasindhu and Dharmasindhu, the Tithi prevailing at sunrise governs the religious observances, fasts (Vrats), and festivals for that entire civil day, regardless of when the Tithi concludes later in the day."
          }
        },
        {
          '@type': 'Question',
          name: "How does this calendar differ from standard Gregorian dates?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Unlike the solar Gregorian calendar which resets at midnight, the Hindu calendar (Panchang) is lunisolar and resets at local sunrise. It tracks the dynamic celestial interplay of the Sun and Moon, calculating time across five sacred limbs (Pancha-Anga): Tithi (lunar day), Vara (solar weekday), Nakshatra (lunar mansion), Yoga (soli-lunar angle), and Karana (half-tithi), alongside Vikram Samvat and Shaka Samvat eras."
          }
        },
        {
          '@type': 'Question',
          name: "What is a Ghati, Pala, and Vipala?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Ghati, Pala, and Vipala are the foundational sexagesimal units of traditional Vedic timekeeping. One civil day (Ahoratra, from sunrise to next sunrise, approximately 24 hours) is divided into 60 Ghatis (24 minutes each). Each Ghati is subdivided into 60 Palas (24 seconds each), and each Pala is subdivided into 60 Vipalas (0.4 seconds each), totaling 216,000 Vipalas per day."
          }
        },
        {
          '@type': 'Question',
          name: "How is dynamic Choghadiya calculated for my specific city?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Dynamic Choghadiya calculates auspicious and inauspicious Muhurats based on your city's exact geographic coordinates. The time between local sunrise and sunset (Dina Mana) is divided into 8 equal daytime segments, and the time between sunset and next sunrise (Ratri Mana) is divided into 8 equal nighttime segments. Each segment is assigned a planetary ruler in a cyclical sequence starting with the day's ruler: Amrit (nectar), Shubh (auspicious), Labh (gain), Char (neutral/motion), Rog (disease), Kaal (loss), and Udveg (anxiety)."
          }
        },
        {
          '@type': 'Question',
          name: "What makes this calculator more accurate than standard online panchangs?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Most generic online panchangs rely on pre-computed lookup tables calculated for a single arbitrary city (often Ujjain or Greenwich) with approximate sunrise times. This micro-tool runs client-side high-precision Swiss Ephemeris astronomical algorithms anchored to the Nirayana (sidereal) zodiac with Lahiri (Chitra Paksha) Ayanamsa. It computes exact topocentric solar and lunar coordinates and true horizon refraction for your selected city in real time, with 100% offline capability."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className={`${outfit.variable} ${plusJakarta.variable} font-sans bg-neutral-950 text-neutral-100 antialiased min-h-screen selection:bg-orange-500/30 selection:text-orange-200`}>
        {children}
        <FloatingInstallShare />
      </body>
    </html>
  );
}
