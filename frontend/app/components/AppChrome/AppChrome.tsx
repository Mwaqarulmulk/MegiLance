// @AI-HINT: AppChrome conditionally renders global chrome (Header/Footer, toggles, PWA banners) except on auth routes for a focused experience.
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import ThemeToggleButton from '@/app/components/ThemeToggleButton';
import InstallAppBanner from '@/app/components/PWA/InstallAppBanner/InstallAppBanner';
import UpdateNotification from '@/app/components/PWA/UpdateNotification/UpdateNotification';

function isChromeLessRoute(pathname: string | null | undefined) {
  if (!pathname) return true; // default to hiding chrome pre-mount to avoid overlay on auth screens
  const clean = pathname.replace(/\/$/, '').toLowerCase(); // strip trailing slash + normalize case
  const chromeLessRoots = [
    // Auth
    '/login', '/signup', '/forgot-password', '/reset-password',
    // Portal (client/freelancer/admin) app shell screens that have their own Navbar/Sidebar
    '/dashboard', '/messages', '/notifications', '/search', '/help', '/audit-logs',
    '/client', '/admin'
  ];
  return chromeLessRoots.some((r) => clean === r || clean.startsWith(r + '/'));
}

// Using per-route-group/layout files for marketing pages; detect and skip chrome.
function isMarketingRoute(pathname: string | null | undefined) {
  if (!pathname) return false;
  const clean = pathname.replace(/\/$/, '').toLowerCase();
  const marketingRoots = new Set([
    '/', '/about', '/blog', '/pricing', '/faq', '/contact',
    '/clients', '/freelancers', '/terms', '/privacy', '/security', '/support',
    '/how-it-works', '/testimonials', '/teams', '/referral', '/jobs', '/install'
  ]);
  return marketingRoots.has(clean);
}

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const hideChrome = isChromeLessRoute(pathname);
  const marketing = isMarketingRoute(pathname);

  // Until mounted, render a minimal shell. For auth, keep a consistent main wrapper.
  if (!mounted || hideChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  // On marketing routes, do not render AppChrome header/footer because
  // those routes already use PublicLayout via their own layout.tsx.
  if (marketing) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ThemeToggleButton />
      <InstallAppBanner />
      <UpdateNotification />
    </>
  );
}
