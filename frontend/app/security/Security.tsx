// @AI-HINT: Security page using per-page theme-aware modules, intersection observer animations, and accessible structure.
'use client';

import React, { useRef } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Security.common.module.css';
import light from './Security.light.module.css';
import dark from './Security.dark.module.css';

const Security: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const headerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });
  const sectionVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  return (
    <main id="main-content" role="main" className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <header
          ref={headerRef as any}
          className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}
        >
          <h1 className={common.title}>Security Overview</h1>
          <p className={common.subtitle} aria-label="Last updated">Last Updated: August 4, 2025</p>
        </header>

        <div
          ref={gridRef}
          className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)}
          aria-label="Security highlights"
        >
          <article className={common.card} aria-labelledby="sec-1">
            <h3 id="sec-1" className={common.cardTitle}>Smart Contract Security</h3>
            <p className={common.cardDesc}>
              Our payment and escrow systems are built on audited smart contracts. All contracts undergo rigorous
              internal testing and multiple external audits from leading security firms before deployment. Audit reports
              are available upon request.
            </p>
          </article>

          <article className={common.card} aria-labelledby="sec-2">
            <h3 id="sec-2" className={common.cardTitle}>Platform Security</h3>
            <p className={common.cardDesc}>
              We employ industry-standard security practices to protect our platform, including encryption of data in
              transit and at rest, regular security scans, and protection against common web vulnerabilities like XSS
              and CSRF.
            </p>
          </article>

          <article className={common.card} aria-labelledby="sec-3">
            <h3 id="sec-3" className={common.cardTitle}>Account Protection</h3>
            <p className={common.cardDesc}>
              User accounts are protected with password hashing. We strongly recommend all users enable two-factor
              authentication (2FA) for an additional layer of security. You are responsible for the security of your own
              account credentials and connected wallets.
            </p>
          </article>
        </div>

        <div
          ref={sectionRef}
          className={cn(common.section, sectionVisible ? common.isVisible : common.isNotVisible)}
        >
          <h2 className={common.sectionTitle}>Responsible Disclosure</h2>
          <p className={common.cardDesc}>
            If you discover a security vulnerability, please report it to us at security@megilance.com. We appreciate
            the community&apos;s help in keeping our platform safe and may offer bounties for valid, responsibly disclosed
            vulnerabilities.
          </p>
          <div className={common.cta}>
            <button className={common.button} aria-label="Email security team">Contact Security</button>
            <button className={cn(common.button, common.buttonSecondary)} aria-label="View security policy">View Policy</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Security;
