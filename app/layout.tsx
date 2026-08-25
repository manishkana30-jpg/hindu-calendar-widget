import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hindu Calendar & Live Panchang | Real-Time Vedic Astrometry',
  description: 'High-precision offline-first Vedic Panchang with live Ishta Kaal, 8-Pahar segmentation, real-time Muhurats, and 24h Choghadiyas.',
  keywords: ['Hindu Calendar', 'Panchang', 'Tithi', 'Nakshatra', 'Choghadiya', 'Muhurat', 'Ishta Kaal', 'Vedic Astrology', '8 Pahar'],
  authors: [{ name: 'Hindu Calendar Team' }],
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="theme-color" content="#09090b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen selection:bg-orange-500/30 selection:text-orange-200">
        {children}
      </body>
    </html>
  );
}
