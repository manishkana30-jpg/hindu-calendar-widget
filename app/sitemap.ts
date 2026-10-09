import { MetadataRoute } from 'next';
import { CITIES } from '@/src/lib/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.dailytithi.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const cityUrls: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${baseUrl}/panchang/${city.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticUrls, ...cityUrls];
}
