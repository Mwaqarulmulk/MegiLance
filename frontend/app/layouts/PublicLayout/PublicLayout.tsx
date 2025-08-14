/* @AI-HINT: PublicLayout provides the shared chrome (Header, Footer, skip links) for all public-facing pages. It is theme-aware and uses per-component CSS modules (common, light, dark). */
"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import AnnouncementBanner from '@/app/components/AnnouncementBanner/AnnouncementBanner';
import CommandPalette, { type CommandItem } from '@/app/components/CommandPalette/CommandPalette';
import ToastProvider from '@/app/components/ToastProvider/ToastProvider';
import commonStyles from './PublicLayout.common.module.css';
import lightStyles from './PublicLayout.light.module.css';
import darkStyles from './PublicLayout.dark.module.css';

type Props = { children: React.ReactNode };

const PublicLayout: React.FC<Props> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const styles = React.useMemo(() => ({
    root: cn(commonStyles.root, themeStyles.root),
    skipLink: cn(commonStyles.skipLink, themeStyles.skipLink),
    main: cn(commonStyles.main, themeStyles.main),
  }), [themeStyles]);

  const commands = React.useMemo<CommandItem[]>(() => [
    // Global navigation
    { id: 'go-home', label: 'Go to Home', hint: '/', action: () => router.push('/') },
    { id: 'go-features', label: 'Open Features', hint: '/#features', action: () => router.push('/#features') },
    { id: 'go-pricing', label: 'Open Pricing', hint: '/pricing', action: () => router.push('/pricing') },
    { id: 'go-contact', label: 'Open Contact', hint: '/contact', action: () => router.push('/contact') },
    { id: 'go-blog', label: 'Open Blog', hint: '/blog', action: () => router.push('/blog') },
    // Auth
    { id: 'auth-login', label: 'Sign In', hint: '/login', action: () => router.push('/login') },
    { id: 'auth-signup', label: 'Sign Up', hint: '/signup', action: () => router.push('/signup') },
    // Theme
    { id: 'theme-dark', label: 'Theme: Dark', hint: 'Appearance', action: () => setTheme('dark') },
    { id: 'theme-light', label: 'Theme: Light', hint: 'Appearance', action: () => setTheme('light') },
    { id: 'theme-system', label: 'Theme: System', hint: 'Appearance', action: () => setTheme('system') },
    // Freelancer contextual (quick access)
    { id: 'fl-invoices', label: 'Freelancer: Invoices', hint: '/freelancer/invoices', action: () => router.push('/freelancer/invoices') },
    { id: 'fl-timesheets', label: 'Freelancer: Timesheets', hint: '/freelancer/timesheets', action: () => router.push('/freelancer/timesheets') },
    { id: 'fl-notifications', label: 'Freelancer: Notifications', hint: '/freelancer/notifications', action: () => router.push('/freelancer/notifications') },
    { id: 'fl-dashboard', label: 'Freelancer: Dashboard', hint: '/freelancer/dashboard', action: () => router.push('/freelancer/dashboard') },
    // Client contextual
    { id: 'cl-dashboard', label: 'Client: Dashboard', hint: '/client/dashboard', action: () => router.push('/client/dashboard') },
    { id: 'cl-contracts', label: 'Client: Contracts', hint: '/client/contracts', action: () => router.push('/client/contracts') },
    { id: 'cl-jobs', label: 'Client: Jobs', hint: '/client/jobs', action: () => router.push('/client/jobs') },
    { id: 'cl-payments', label: 'Client: Payments', hint: '/client/payments', action: () => router.push('/client/payments') },
    // Admin contextual
    { id: 'ad-dashboard', label: 'Admin: Dashboard', hint: '/admin', action: () => router.push('/admin') },
    { id: 'ad-users', label: 'Admin: Users', hint: '/admin/users', action: () => router.push('/admin/users') },
    { id: 'ad-reports', label: 'Admin: Reports', hint: '/admin/reports', action: () => router.push('/admin/reports') },
    { id: 'ad-settings', label: 'Admin: Settings', hint: '/admin/settings', action: () => router.push('/admin/settings') },
  ], [router, setTheme]);

  return (
    <ToastProvider>
    <div className={styles.root}>
      {/* @AI-HINT: Accessible skip link for keyboard users to jump to main content. */}
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>

      {/* @AI-HINT: Site-wide announcement banner with dismiss and theme-aware styling. */}
      <AnnouncementBanner
        id="launch-aug-2025"
        message={<span><strong>Big update:</strong> New Freelancer tools, AI proposal assistant, and advanced analytics are live.</span>}
        cta={{ label: "See what's new", href: '/blog/launch' }}
      />

      {/* @AI-HINT: Global Command Palette (Cmd/Ctrl+K) for fast navigation and actions. */}
      <CommandPalette items={commands} />

      {/* @AI-HINT: PublicLayout - Marketing container only; AppChrome owns the sole <main id="main-content">. */}
      <div className={styles.main} role="presentation">
        {/* @AI-HINT: Layout - Constrain content to a readable width for improved rhythm. */}
        <div className={commonStyles.container}>
          {children}
        </div>
      </div>
      {/* Footer is handled globally by AppChrome for consistency. */}
    </div>
    </ToastProvider>
  );
};

export default PublicLayout;
