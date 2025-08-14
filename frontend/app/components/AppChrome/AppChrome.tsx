// @AI-HINT: AppChrome is the top-level layout component. It intelligently renders the correct 'chrome' (header/footer) based on the route, distinguishing between public marketing pages and internal application portals.
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import PublicHeader from '@/app/components/Layout/PublicHeader/PublicHeader';
import PublicFooter from '@/app/components/Layout/PublicFooter/PublicFooter';
import ThemeToggleButton from '@/app/components/ThemeToggleButton';
import FloatingActionButtons from '@/app/components/FloatingActionButtons/FloatingActionButtons';
import ChatbotAgent from '@/app/components/AI/ChatbotAgent/ChatbotAgent';
import InstallAppBanner from '@/app/components/PWA/InstallAppBanner/InstallAppBanner';
import UpdateNotification from '@/app/components/PWA/UpdateNotification/UpdateNotification';
import PageTransition from '@/app/components/Transitions/PageTransition';

/**
 * Determines if a given route should have minimal chrome.
 * This applies to authentication pages and the root of all authenticated portals,
 * which manage their own internal layouts, sidebars, and headers.
 * @param pathname The current URL pathname.
 * @returns {boolean} True if the route should be chrome-less.
 */
function isPortalOrAuthRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false; 

  const normalizedPath = pathname.toLowerCase().replace(/\/$/, '');

  const portalOrAuthRoots = [
    // Standalone auth pages
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    // Root of authenticated portals
    '/admin',
    '/client',
    '/freelancer',
    // Unified portal section roots (dashboard app pages)
    '/dashboard',
    '/projects', '/Projects',
    '/messages', '/Messages',
    '/notifications', '/Notifications',
    '/settings', '/Settings',
    '/profile', '/Profile',
    '/payments', '/Payments',
    '/calendar', '/Calendar',
    '/reports', '/Reports',
    '/audit-logs',
    '/help',
    '/search',
  ];

  return portalOrAuthRoots.some(root => normalizedPath === root || normalizedPath.startsWith(`${root}/`));
}

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMinimalChrome = isPortalOrAuthRoute(pathname);

  // For portal or auth routes, we render a minimal shell.
  // The responsibility for layout (like sidebars and headers) is delegated to the specific portal's layout file.
  if (isMinimalChrome) {
    return (
      <div className="min-h-screen flex flex-col">
        <main id="main-content" role="main" className="flex-1">
          <PageTransition variant="fade">
            {children}
          </PageTransition>
        </main>
      </div>
    );
  }

  // For all other pages, we assume they are public-facing marketing pages
  // and render the full public header and footer.
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main id="main-content" role="main" className="flex-grow">
        <PageTransition variant="fade">
          {children}
        </PageTransition>
      </main>
      <PublicFooter />
      {/* Right-side floating actions */}
      <FloatingActionButtons position="right">
        <ChatbotAgent />
      </FloatingActionButtons>
      {/* Left-side floating actions */}
      <FloatingActionButtons position="left">
        <ThemeToggleButton />
      </FloatingActionButtons>
      <InstallAppBanner />
      <UpdateNotification />
    </div>
  );
}
