// @AI-HINT: This file configures Next.js, with PWA support enabled via @ducanh2912/next-pwa.
const withPWAInit = require('@ducanh2912/next-pwa').default;

const withPWA = withPWAInit({
  dest: 'public', // Service worker files will be generated in public/
  register: true, // Automatically register the service worker
  skipWaiting: true, // Install new service worker without waiting
  // Controlled via env. Enable by setting NEXT_ENABLE_PWA=1
  disable: process.env.NEXT_ENABLE_PWA !== '1',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config options can go here.
  eslint: {
    // Don't fail the build on ESLint errors; we'll address them incrementally.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
  },
  async rewrites() {
    // Allow overriding the backend URL in production via env, while keeping
    // the Docker dev-compose default (http://backend:8000) for local dev.
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:8000';
    return [
      // Proxy backend through Next server to avoid CORS in browser
      { source: '/backend/:path*', destination: `${backendUrl}/:path*` },
    ];
  },
  async redirects() {
    return [
      // Consolidate portal routes under /portal; if legacy /freelancer/* is hit, redirect it
      {
        source: '/freelancer/:path*',
        destination: '/portal/freelancer/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
