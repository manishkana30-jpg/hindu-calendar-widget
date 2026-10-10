import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Outfit, Noto_Serif_Devanagari, Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { FloatingInstallShare } from './components/FloatingInstallShare';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { NotificationNavigationHandler } from './components/NotificationNavigationHandler';

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
  display: 'swap' 
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari', 'latin'],
  variable: '--font-devanagari',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
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
  metadataBase: new URL('https://dailytithi.com'),
  title: {
    default: 'Daily Tithi | Live Hindu Calendar, Panchang & Muhurat',
    template: '%s | Daily Tithi',
  },
  description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
  keywords: [
    'Daily Tithi', 'Hindu Calendar & Live Panchang', 'Vikram Samvat 2083', 'Shaka Samvat 1948', 
    'Udaya Tithi today', 'Choghadiya Muhurat', 'Hindu festival calendar', 
    'Panchak timing', 'Ghati Pala calculator', 'Swiss Ephemeris Vedic calendar', 
    'live panchang widget', 'Ishta Kaal', 'Dharmashastra', 'Vedic Astrology'
  ],
  authors: [{ name: 'Daily Tithi Research Team' }],
  creator: 'Daily Tithi',
  publisher: 'Daily Tithi',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dailytithi.com',
    siteName: 'Daily Tithi',
    title: 'Daily Tithi | Live Hindu Calendar, Panchang & Muhurat',
    description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
    images: [
      {
        url: 'https://dailytithi.com/api/og',
        width: 1200,
        height: 630,
        alt: 'Daily Tithi Live Vedic Panchang Preview Card'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Tithi | Live Hindu Calendar, Panchang & Muhurat',
    description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
    images: ['https://dailytithi.com/api/og']
  },
  alternates: {
    canonical: 'https://dailytithi.com'
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google2779ca9c3cc8b844.html',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '54274A593A0417D0C42AC6F422F4A71C',
    },
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://dailytithi.com/#webpage',
      url: 'https://dailytithi.com/',
      name: "Daily Tithi | Live Hindu Calendar, Panchang & Muhurat",
      description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://dailytithi.com/#website',
        name: 'Daily Tithi',
        url: 'https://dailytithi.com/'
      },
      about: {
        '@type': 'Thing',
        name: 'Vedic Astrometry and Hindu Panchang System'
      },
      author: {
        '@type': 'Organization',
        name: 'Daily Tithi Research Team'
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://dailytithi.com/'
          }
        ]
      }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://dailytithi.com/#software',
      name: 'Daily Tithi',
      url: 'https://dailytithi.com/',
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
      '@id': 'https://dailytithi.com/#faq',
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
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#090e1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Daily Tithi" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className={`${outfit.variable} ${plusJakarta.variable} font-sans bg-neutral-950 text-neutral-100 antialiased min-h-screen selection:bg-orange-500/30 selection:text-orange-200`}>
        <Suspense fallback={null}>
          <NotificationNavigationHandler />
        </Suspense>
        {children}
        <FloatingInstallShare />
        <PwaUpdatePrompt />
      </body>
    </html>

  );
}
