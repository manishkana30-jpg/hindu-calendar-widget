import { MetadataRoute } from 'next';
import { CITIES } from '@/src/lib/cities';
import { VRAT_DEFINITIONS } from '@/src/lib/vrat-data';
import { MUHURAT_CATEGORIES } from '@/src/lib/muhurat-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dailytithi.com';
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
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // City Pages (Metros get 0.9, others get 0.85)
  const cityUrls: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${baseUrl}/panchang/${city.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: city.isMetro ? 0.9 : 0.85,
  }));

  // Dedicated Vrat & Festival Hubs (0.8)
  const vratUrls: MetadataRoute.Sitemap = Object.values(VRAT_DEFINITIONS).map((vrat) => ({
    url: `${baseUrl}/vrat/${vrat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Dedicated Shubh Muhurat Hubs (0.8)
  const muhuratUrls: MetadataRoute.Sitemap = Object.values(MUHURAT_CATEGORIES).map((muhurat) => ({
    url: `${baseUrl}/muhurat/${muhurat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticUrls, ...cityUrls, ...vratUrls, ...muhuratUrls];
}
