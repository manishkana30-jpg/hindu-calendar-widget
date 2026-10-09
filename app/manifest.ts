import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Daily Tithi - Live Vedic Panchang & Hindu Calendar',
    short_name: 'Daily Tithi',
    description: 'High-Precision Vedic Panchang with live Ishta Kaal, 8-Pahar segmentation, real-time Muhurats, and Dharmashastra determination rules.',
    start_url: '/',
    scope: '/',
    id: 'https://www.dailytithi.com/',
    display: 'standalone',
    background_color: '#090e1a',
    theme_color: '#090e1a',
    orientation: 'any',
    prefer_related_applications: false,
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      }
    ],
    categories: ['utilities', 'lifestyle', 'productivity']
  };
}
