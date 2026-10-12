/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/embed',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms https://scripts.clarity.ms https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://*.clarity.ms https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net; connect-src 'self' blob: https://*.googleapis.com https://*.push.services.mozilla.com https://*.push.apple.com https://*.notify.windows.com https://*.upstash.io https://api.restful-api.dev https://*.clarity.ms https://*.supabase.co https://*.google.com https://pagead2.googlesyndication.com; frame-src 'self' https://googleads.g.doubleclick.net https://*.google.com https://*.googlesyndication.com; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors *;"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      },
      {
        source: '/((?!embed).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms https://scripts.clarity.ms https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://*.clarity.ms https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net; connect-src 'self' blob: https://*.googleapis.com https://*.push.services.mozilla.com https://*.push.apple.com https://*.notify.windows.com https://*.upstash.io https://api.restful-api.dev https://*.clarity.ms https://*.supabase.co https://*.google.com https://pagead2.googlesyndication.com; frame-src 'self' https://googleads.g.doubleclick.net https://*.google.com https://*.googlesyndication.com; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
