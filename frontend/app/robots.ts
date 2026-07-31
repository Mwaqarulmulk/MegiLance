// @AI-HINT: Robots.txt configuration for SEO and crawler control.
// Optimized for Google, Bing, AI Search Bots (OAI-SearchBot, Perplexity-User, Claude-User, etc.)
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
          '/client/',
          '/freelancer/',
          '/settings/',
          '/messages/',
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
          '/contracts/',
          '/workroom/',
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
          '/client/',
          '/freelancer/',
          '/settings/',
          '/messages/',
          '/wallet/',
          '/onboarding/',
          '/dashboard/',
          '/contracts/',
          '/workroom/',
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
      // ── OpenAI Search Bot ──
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/settings/', '/messages/'],
      },
      // ── ChatGPT Search ──
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/settings/', '/messages/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── Perplexity AI Search ──
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      {
        userAgent: 'Perplexity-User',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── Claude / Anthropic Search ──
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      {
        userAgent: 'Claude-User',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── Bing ──
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/', '/settings/', '/messages/'],
      },
      // ── DuckDuckBot ──
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── Yandex ──
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
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
      // ── Apple bot & extended ──
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── DeepSeek Bot ──
      {
        userAgent: 'DeepSeekBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── SearchGPT Bot ──
      {
        userAgent: 'SearchGPT-Bot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── Meta External Agent ──
      {
        userAgent: 'Meta-ExternalAgent',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── Google Extended ──
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/admin/', '/portal/'],
      },
      // ── Block bulk non-search scrapers ──
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

