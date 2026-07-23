// @AI-HINT: This file configures Next.js, with PWA support enabled via @ducanh2912/next-pwa.
// Production-ready configuration with performance optimizations
const withPWAInit = require('@ducanh2912/next-pwa').default;

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' && process.env.NEXT_ENABLE_PWA !== '1',
  fallbacks: {
    document: '/~offline',
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SHOW_DEMO_LOGIN: process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN ?? 'true',
  },

  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  output: 'standalone',

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['warn', 'error'] }
      : false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      'chart.js',
      'react-chartjs-2',
      'zod',
      'lottie-react',
      'react-icons',
      'react-hook-form',
      '@hookform/resolvers',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'three',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    scrollRestoration: true,
    optimizeServerReact: true,
  },

  turbopack: {
    root: process.env.TURBOPACK_ROOT || __dirname,
    resolveAlias: {
      '@': '.',
      'three/src/misc/Timer.js': require('path').resolve(__dirname, './lib/three-timer-shim.ts'),
    },
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
      'three/src/misc/Timer.js': require('path').resolve(__dirname, './lib/three-timer-shim.ts'),
    };

    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      );
    }

    return config;
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'unpkg.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'megilance.site' },
      { protocol: 'https', hostname: 'www.megilance.site' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },

  trailingSlash: false,

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/login',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Vary', value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch' },
        ],
      },
      {
        source: '/signup',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Vary', value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch' },
        ],
      },
      {
        source: '/forgot-password',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Vary', value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/screenshots/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000' },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
        ],
      },
      {
        source: '/blog/feed.xml',
        headers: [
          { key: 'Content-Type', value: 'application/rss+xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Link', value: '<https://fonts.googleapis.com>; rel=preconnect, <https://fonts.gstatic.com>; rel=preconnect; crossorigin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },

  async rewrites() {
    return [];
  },

  async redirects() {
    return [
      {
        source: '/api/auth/callback/:provider',
        destination: '/callback',
        permanent: true,
      },
      {
        source: '/referral',
        destination: '/referrals',
        permanent: true,
      },
      {
        source: '/status',
        destination: '/system-status',
        permanent: true,
      },
      {
        source: '/ai/contract-builder',
        destination: '/tools/contract-builder',
        permanent: true,
      },
      {
        source: '/legal/privacy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/legal/terms',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/ai-freelancer-matching-platform',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/ai-talent-matching',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/blockchain-escrow-for-freelancers',
        destination: '/how-it-works#escrow',
        permanent: true,
      },
      {
        source: '/smart-contract-escrow-for-freelancers',
        destination: '/how-it-works#escrow',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.megilance.site' }],
        destination: 'https://megilance.site/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
