import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Outfit, Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { NotificationNavigationHandler } from './components/NotificationNavigationHandler';
import { ClientNotificationScheduler } from './components/ClientNotificationScheduler';
import { FloatingAlertBanner } from './components/FloatingAlertBanner';
import { ContentProtection } from './components/ContentProtection';
import { LanguageProvider } from '@/src/context/LanguageContext';

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
  display: 'swap' 
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
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dailytithi.com'),
  title: {
    default: 'Daily Tithi | Vedic Panchang & Sunrise Alerts',
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
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Daily Tithi',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dailytithi.com',
    siteName: 'Daily Tithi',
    title: 'Daily Tithi | Vedic Panchang & Sunrise Alerts',
    description: "Accurate Vedic Panchang, today's Udaya Tithi, dynamic Choghadiya Muhurat, and Vikram Samvat calendar powered by high-precision Swiss Ephemeris.",
    images: [
      {
        url: 'https://dailytithi.com/api/og',
        width: 1200,
        height: 630,
        alt: 'Daily Tithi Live Vedic Panchang & Sunrise Alerts Preview Card',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Tithi | Vedic Panchang & Sunrise Alerts',
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
      'google-adsense-account': 'ca-pub-4999722531202967',
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
      description: 'Real-time Vedic astrometry dashboard delivering live Ghati/Pala timekeeping, Udaya Tithi, dynamic Choghadiya Muhurats, Panchak tracking, and Dharmashastra-compliant festival calculations with offline PWA capabilities.',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '128',
        bestRating: '5',
        worstRating: '1'
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth w-full max-w-full overflow-x-hidden" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#090e1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Daily Tithi" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="copyright" content="Daily Tithi. All Rights Reserved." />
        <meta name="author" content="Daily Tithi Research & Astrometry" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;500;600;700;800&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "yvla08wyc6");
          `}
        </Script>
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4999722531202967"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${outfit.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} font-sans bg-neutral-950 text-neutral-100 antialiased min-h-dvh w-full max-w-full overflow-x-hidden touch-pan-y selection:bg-orange-500/30 selection:text-orange-200 pb-[env(safe-area-inset-bottom)]`}>
        <LanguageProvider>
          <Suspense fallback={null}>
            <NotificationNavigationHandler />
          </Suspense>
          <ClientNotificationScheduler />
          <ContentProtection />
          {children}
          <FloatingAlertBanner />
          <PwaUpdatePrompt />
        </LanguageProvider>
      </body>
    </html>

  );
}
