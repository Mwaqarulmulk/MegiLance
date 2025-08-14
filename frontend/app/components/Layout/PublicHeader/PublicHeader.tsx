// @AI-HINT: This is the dedicated header for the public-facing marketing website. It includes navigation, branding, and primary calls-to-action like 'Sign In' and 'Sign Up'.
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import { MegiLanceLogo } from '@/app/components/MegiLanceLogo/MegiLanceLogo';
import Button from '@/app/components/Button/Button';
import ThemeSwitcher from '@/app/components/ThemeSwitcher/ThemeSwitcher';
import NotificationBell from '@/app/components/NotificationBell/NotificationBell';

import commonStyles from './PublicHeader.common.module.css';
import lightStyles from './PublicHeader.light.module.css';
import darkStyles from './PublicHeader.dark.module.css';

const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const PublicHeader = () => {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement | null>(null);
  const mobileToggleRef = React.useRef<HTMLButtonElement | null>(null);

  // Focus management and Escape handling for mobile menu
  React.useEffect(() => {
    const menuEl = mobileMenuRef.current;
    if (!menuEl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!menuOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = Array.from(
          menuEl.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('aria-hidden'));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    const onOpen = () => {
      if (!menuOpen) return;
      const first = menuEl.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    onOpen();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to the toggle when menu closes
      if (!menuOpen) {
        mobileToggleRef.current?.focus();
      }
    };
  }, [menuOpen]);

  // Prevent background scroll and set main content aria-hidden when menu is open
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      const main = document.getElementById('main-content');
      if (main) main.setAttribute('aria-hidden', 'true');
    } else {
      const main = document.getElementById('main-content');
      if (main) main.removeAttribute('aria-hidden');
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      const main = document.getElementById('main-content');
      if (main) main.removeAttribute('aria-hidden');
    };
  }, [menuOpen]);

  const mockNotifications = React.useMemo(() => ([
    { id: 'n1', title: 'New message from client', description: 'Acme Corp replied to your proposal.', href: '/freelancer/notifications', time: '2m ago', read: false },
    { id: 'n2', title: 'Invoice paid', description: 'Invoice #1042 has been paid.', href: '/freelancer/invoices', time: '1h ago', read: false },
    { id: 'n3', title: 'Timesheet reminder', description: "Don't forget to submit this week's hours.", href: '/freelancer/timesheets', time: '1d ago', read: true },
  ]), []);

  const isActive = (href: string) => {
    // Treat hash links as active only on home route
    if (href.startsWith('/#')) return pathname === '/';
    return pathname === href;
  };

  return (
    <header className={cn(commonStyles.header, styles.header)}>
      <div className={cn(commonStyles.container, styles.container)}>
        <div className={commonStyles.logoContainer}>
          <Link href="/" aria-label="MegiLance Home">
            <MegiLanceLogo />
          </Link>
        </div>
        <nav className={commonStyles.nav} aria-label="Main">
          <ul className={commonStyles.navList}>
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={cn(commonStyles.navLink, styles.navLink, isActive(link.href) && commonStyles.navLinkActive)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={commonStyles.actionsContainer}>
          <NotificationBell items={mockNotifications} />
          <ThemeSwitcher />
          <Button as="a" href="/login" variant="ghost" className={cn(commonStyles.signInButton, styles.signInButton)}>
            Sign In
          </Button>
          <Button as="a" href="/signup" variant="primary">
            Sign Up Free
          </Button>
        </div>
        {/* Mobile menu toggle */}
        <button
          ref={mobileToggleRef}
          type="button"
          className={commonStyles.mobileToggle}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-haspopup="menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={commonStyles.srOnly}>Toggle navigation</span>
          {/* Simple icon using text; replace with SVG icon if available */}
          ☰
        </button>
      </div>
      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        id="mobile-nav"
        className={cn(commonStyles.mobileMenu, menuOpen && commonStyles.mobileMenuOpen)}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal={menuOpen}
      >
        <ul className={commonStyles.mobileNavList}>
          {navLinks.map((link) => (
            <li key={`m-${link.name}`}>
              <Link
                href={link.href}
                className={cn(commonStyles.mobileNavLink, styles.navLink, isActive(link.href) && commonStyles.navLinkActive)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li className={commonStyles.mobileActions}>
            <NotificationBell items={mockNotifications} />
            <div className={commonStyles.mobileThemeSwitcherSpacer}>
              <ThemeSwitcher />
            </div>
            <Button as="a" href="/login" variant="ghost" className={cn(commonStyles.signInButton, styles.signInButton)}>
              Sign In
            </Button>
            <Button as="a" href="/signup" variant="primary">
              Sign Up Free
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default PublicHeader;
