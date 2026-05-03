// @AI-HINT: Robots.txt configuration for SEO and crawler control.
// Optimized for Google, Bing, and all major search engine bots with
// granular per-bot rules for maximum indexing coverage.
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://megilance.site';

  return {
    rules: [
      // ── Default rules for all crawlers ──
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/backend/',
          '/portal/',
          '/client/dashboard/',
          '/freelancer/dashboard/',
          '/settings/',
          '/messages/',
          '/_next/',
          '/private/',
          '/onboarding/',
          '/test/',
          '/test-login/',
          '/auth-dashboard/',
          '/wallet/',
          '/logout/',
          '/analytics/',
          '/user-management/',
          '/complete-profile/',
          '/create-project/',
          '/dashboard/',
          '/*.json$',
        ],
      },
      // ── Google - maximize crawling ──
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/portal/',
          '/_next/',
          '/settings/',
          '/messages/',
          '/wallet/',
          '/onboarding/',
          '/dashboard/',
        ],
      },
      // ── Google Images - allow all public images ──
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/icons/',
          '/images/',
          '/_next/image',
          '/_next/static/media/',
          '/uploads/portfolio/',
          '/uploads/avatars/',
        ],
      },
      // ── Bing ──
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/', '/settings/', '/messages/'],
      },
      // ── DuckDuckBot ──
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/'],
      },
      // ── Yandex ──
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/'],
      },
      // ── Social media bots for rich previews ──
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      // ── Block AI scrapers from training data ──
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
