// @AI-HINT: Privacy Policy page with theme-aware styling, animated sections, and accessible table of contents.
'use client';

import React, { useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Privacy.common.module.css';
import light from './Privacy.light.module.css';
import dark from './Privacy.dark.module.css';

const sections = [
  { id: 'intro', title: 'Introduction' },
  { id: 'data-we-collect', title: 'Data We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Data' },
  { id: 'cookies', title: 'Cookies & Tracking' },
  { id: 'sharing', title: 'Sharing & Disclosure' },
  { id: 'security', title: 'Security' },
  { id: 'retention', title: 'Data Retention' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'contact', title: 'Contact Us' },
];

const Privacy: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const headerRef = useRef<HTMLElement | null>(null);
  const layoutRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const layoutVisible = useIntersectionObserver(layoutRef, { threshold: 0.1 });

  const Header = useMemo(() => (
    <header
      ref={headerRef as any}
      className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}
    >
      <h1 className={common.title}>Privacy Policy</h1>
      <p className={common.subtitle}>We respect your privacy and are committed to protecting your data.</p>
      <p className={common.meta} aria-label="Policy last updated">Last updated: Aug 8, 2025</p>
    </header>
  ), [headerVisible]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        {Header}

        <div
          ref={layoutRef}
          className={cn(common.layout, layoutVisible ? common.isVisible : common.isNotVisible)}
        >
          <nav className={common.toc} aria-label="Table of contents">
            <div className={common.tocTitle}>On this page</div>
            <ul className={common.tocList}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a className={common.tocLink} href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={common.content}>
            <section id="intro" className={common.section} aria-labelledby="intro-title">
              <h2 id="intro-title">Introduction</h2>
              <p>
                This Privacy Policy explains how MegiLance (&quot;we&quot;, &quot;us&quot;) collects, uses, and safeguards your
                information when you use our platform. By using MegiLance, you agree to the practices described here.
              </p>
            </section>

            <section id="data-we-collect" className={common.section} aria-labelledby="collect-title">
              <h2 id="collect-title">Data We Collect</h2>
              <ul>
                <li>Account data (name, email, role)</li>
                <li>Profile and portfolio content</li>
                <li>Usage and analytics data</li>
                <li>Payment and transaction details (via secure providers)</li>
              </ul>
            </section>

            <section id="how-we-use" className={common.section} aria-labelledby="use-title">
              <h2 id="use-title">How We Use Your Data</h2>
              <p>
                We use your data to provide and improve our services, personalize your experience, facilitate payments,
                and maintain platform security, including fraud prevention and abuse detection.
              </p>
            </section>

            <section id="cookies" className={common.section} aria-labelledby="cookies-title">
              <h2 id="cookies-title">Cookies & Tracking</h2>
              <p>
                We use cookies and similar technologies to remember preferences, analyze usage, and improve performance.
                You can control cookies through your browser settings.
              </p>
            </section>

            <section id="sharing" className={common.section} aria-labelledby="sharing-title">
              <h2 id="sharing-title">Sharing & Disclosure</h2>
              <p>
                We share data with trusted third-party processors solely to provide our services. We do not sell your
                personal data.
              </p>
            </section>

            <section id="security" className={common.section} aria-labelledby="security-title">
              <h2 id="security-title">Security</h2>
              <p>
                We implement technical and organizational measures to protect your data, including encryption in transit,
                access controls, and regular audits.
              </p>
            </section>

            <section id="retention" className={common.section} aria-labelledby="retention-title">
              <h2 id="retention-title">Data Retention</h2>
              <p>
                We retain personal data only as long as necessary for the purposes outlined in this policy or as
                required by law.
              </p>
            </section>

            <section id="rights" className={common.section} aria-labelledby="rights-title">
              <h2 id="rights-title">Your Rights</h2>
              <ul>
                <li>Access, update, or delete your data</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section id="contact" className={common.section} aria-labelledby="contact-title">
              <h2 id="contact-title">Contact Us</h2>
              <p>
                For privacy inquiries, contact us at privacy@megilance.com. We respond promptly to rights requests and
                questions about this policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
