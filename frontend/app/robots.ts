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
      // ── AI assistants that drive referral traffic — ALLOW ──
      // ChatGPT browsing (via Bing) cites and links to sites — allow for discoverability
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/', '/settings/', '/messages/'],
      },
      // ChatGPT real-time browsing — drives direct citation traffic
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // Perplexity — top AI search engine, significant referral source
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/'],
      },
      // Apple — Spotlight, Siri, Safari Reader
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // Claude (Anthropic) — web browsing for AI responses
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/'],
      },
      // ClaudeBot — Anthropic web crawler
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/'],
      },
      // Google Gemini / Bard crawler
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/'],
      },
      // Cohere — AI training crawler
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/_next/'],
      },
      // ── Block bulk scrapers used ONLY for raw training data (no search/referral value) ──
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'omgili',
        disallow: '/',
      },
      {
        userAgent: 'omgilibot',
        disallow: '/',
      },
      {
        userAgent: 'Bytespider',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
