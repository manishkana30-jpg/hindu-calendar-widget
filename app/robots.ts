import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Bytespider', 'Diffbot'],
        disallow: '/',
      }
    ],
    sitemap: 'https://dailytithi.com/sitemap.xml',
  };
}
