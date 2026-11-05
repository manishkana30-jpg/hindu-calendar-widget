import { MetadataRoute } from 'next';
import { TOP_CITIES } from '@/src/lib/constants/cities';
import { VRAT_DEFINITIONS } from '@/src/lib/vrat-data';
import { MUHURAT_CATEGORIES } from '@/src/lib/muhurat-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dailytithi.com';
  // Valid RFC 3339 timestamp
  const currentDate = new Date().toISOString();

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

  // City Pages mapped over TOP_CITIES registry with hourly revalidation & 0.85 priority
  const cityUrls: MetadataRoute.Sitemap = Object.keys(TOP_CITIES).map((slug) => ({
    url: `${baseUrl}/panchang/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'hourly',
    priority: 0.85,
  }));

  // Dedicated Vrat & Festival Hubs (0.8 priority)
  const vratUrls: MetadataRoute.Sitemap = Object.values(VRAT_DEFINITIONS).map((vrat) => ({
    url: `${baseUrl}/vrat/${vrat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Dedicated Shubh Muhurat Hubs (0.8 priority)
  const muhuratUrls: MetadataRoute.Sitemap = Object.values(MUHURAT_CATEGORIES).map((muhurat) => ({
    url: `${baseUrl}/muhurat/${muhurat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticUrls, ...cityUrls, ...vratUrls, ...muhuratUrls];
}
