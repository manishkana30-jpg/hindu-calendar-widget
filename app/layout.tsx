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
  title: {
    default: 'Hindu Calendar & Live Panchang | Real-Time Vedic Astrometry',
    template: '%s | Hindu Calendar & Live Panchang'
  },
  description: 'High-precision offline-first Vedic Panchang with live Ishta Kaal, Udaya Tithi, 8-Pahar segmentation, dynamic Choghadiya Muhurats, and Dharmashastra festival engine.',
  keywords: [
    'Hindu Calendar', 'Panchang', 'Tithi', 'Udaya Tithi', 'Choghadiya', 
    'Muhurat', 'Ishta Kaal', 'Panchak', 'Dharmashastra', 'Vikram Samvat', 'Vedic Astrology'
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
    url: 'https://vikram-samvat-widget.vercel.app',
    siteName: 'Hindu Calendar & Live Panchang',
    title: 'Hindu Calendar & Live Panchang | Real-Time Vedic Astrometry',
    description: 'Real-time offline-first Vedic Panchang delivering live Ghati/Pala timekeeping, Udaya Tithi, Choghadiya Muhurats, and Dharmashastra-compliant festival calculations.',
    images: [
      {
        url: '/icon-512.svg',
        width: 512,
        height: 512,
        alt: 'Hindu Calendar & Live Panchang Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hindu Calendar & Live Panchang | Real-Time Vedic Astrometry',
    description: 'Accurate Vedic Panchang with live Ishta Kaal, Udaya Tithi, Choghadiya, and Dharmashastra rules.',
    images: ['/icon-512.svg']
  },
  alternates: {
    canonical: '/'
  }
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://vikram-samvat-widget.vercel.app/#webapp',
      name: 'Hindu Calendar & Live Panchang',
      url: 'https://vikram-samvat-widget.vercel.app',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Works 100% offline.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      description: 'High-precision offline-first Vedic Panchang with live Ishta Kaal, Udaya Tithi, dynamic Choghadiya Muhurats, and Dharmashastra festival calculations.'
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://vikram-samvat-widget.vercel.app/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: "How is today's Tithi determined in this calendar?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Tithi is calculated using high-precision Swiss Ephemeris astronomical algorithms anchored to local Sunrise (Udaya Tithi) and the Nirayana Lahiri Ayanamsa, strictly compliant with Nirnayasindhu and Dharmasindhu canons.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is Ishta Kaal and how is it measured?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ishta Kaal is the elapsed sacred time from local sunrise, measured in traditional Vedic units: 1 Day = 60 Ghatis (24 minutes each), 1 Ghati = 60 Palas (24 seconds each), and 1 Pala = 60 Vipalas (0.4 seconds each).'
          }
        },
        {
          '@type': 'Question',
          name: 'Does this Hindu Calendar PWA work offline?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The Progressive Web App installs directly to Android, iOS, and Windows devices and runs 100% offline using client-side mathematical astrometry algorithms.'
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
