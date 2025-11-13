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
  // Next.js 16 - Configure both turbopack and webpack to avoid conflicts
  turbopack: {},
  webpack: (config) => {
    return config;
  },
  
  // ESLint config moved - use .eslintrc.json or CLI flags instead
  // eslint: { ignoreDuringBuilds: true } is no longer supported in next.config.js
  
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
      // Legacy route redirects - route groups (portal) are not in URLs
      // Routes automatically match based on file structure
    ];
  },
};

module.exports = withPWA(nextConfig);
