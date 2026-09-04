import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

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
      </head>
      <body className={`${outfit.variable} ${plusJakarta.variable} font-sans bg-neutral-950 text-neutral-100 antialiased min-h-screen selection:bg-orange-500/30 selection:text-orange-200`}>
        {children}
      </body>
    </html>
  );
}
