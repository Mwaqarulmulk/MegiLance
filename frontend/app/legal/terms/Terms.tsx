// @AI-HINT: Terms of Service page with theme-aware styling, animated sections, and accessible table of contents.
'use client';

import React, { useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Terms.common.module.css';
import light from './Terms.light.module.css';
import dark from './Terms.dark.module.css';

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'accounts', title: 'Accounts & Security' },
  { id: 'payments', title: 'Payments & Billing' },
  { id: 'conduct', title: 'Prohibited Conduct' },
  { id: 'ip', title: 'Intellectual Property' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'limitation', title: 'Limitation of Liability' },
  { id: 'law', title: 'Governing Law' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'contact', title: 'Contact Us' },
];

const Terms: React.FC = () => {
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
      <h1 className={common.title}>Terms of Service</h1>
      <p className={common.subtitle}>Please read these terms carefully before using MegiLance.</p>
      <p className={common.meta} aria-label="Terms last updated">Last updated: Aug 8, 2025</p>
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
            <section id="acceptance" className={common.section} aria-labelledby="acceptance-title">
              <h2 id="acceptance-title">Acceptance of Terms</h2>
              <p>
                By creating an account, accessing, or using MegiLance, you agree to be bound by these Terms of Service
                and our Privacy Policy. If you do not agree, you may not use the platform.
              </p>
            </section>

            <section id="eligibility" className={common.section} aria-labelledby="eligibility-title">
              <h2 id="eligibility-title">Eligibility</h2>
              <p>
                You must be at least the age of majority in your jurisdiction and have the authority to enter into these
                terms. You represent and warrant that the information you provide is accurate and complete.
              </p>
            </section>

            <section id="accounts" className={common.section} aria-labelledby="accounts-title">
              <h2 id="accounts-title">Accounts & Security</h2>
              <ul>
                <li>You are responsible for maintaining the confidentiality of your credentials.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
                <li>We may suspend or terminate accounts for violations of these terms.</li>
              </ul>
            </section>

            <section id="payments" className={common.section} aria-labelledby="payments-title">
              <h2 id="payments-title">Payments & Billing</h2>
              <p>
                Payments are processed by secure third-party providers. You authorize us to charge your chosen payment
                method for fees incurred through your use of the platform, including subscriptions or project-related
                charges where applicable.
              </p>
            </section>

            <section id="conduct" className={common.section} aria-labelledby="conduct-title">
              <h2 id="conduct-title">Prohibited Conduct</h2>
              <ul>
                <li>Illegal, fraudulent, or deceptive activities.</li>
                <li>Infringing intellectual property or privacy rights.</li>
                <li>Harassment, hate speech, or abusive behavior.</li>
                <li>Circumventing platform security or payment protections.</li>
              </ul>
            </section>

            <section id="ip" className={common.section} aria-labelledby="ip-title">
              <h2 id="ip-title">Intellectual Property</h2>
              <p>
                The MegiLance name, brand, and platform materials are protected. Except as expressly permitted, you may
                not copy, modify, distribute, or create derivative works without prior written consent.
              </p>
            </section>

            <section id="disclaimers" className={common.section} aria-labelledby="disclaimers-title">
              <h2 id="disclaimers-title">Disclaimers</h2>
              <p>
                The platform is provided &quot;as is&quot; without warranties of any kind, whether express or implied, including
                merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section id="limitation" className={common.section} aria-labelledby="limitation-title">
              <h2 id="limitation-title">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, MegiLance will not be liable for indirect, incidental, special,
                consequential, or punitive damages, or loss of profits or revenues.
              </p>
            </section>

            <section id="law" className={common.section} aria-labelledby="law-title">
              <h2 id="law-title">Governing Law</h2>
              <p>
                These terms are governed by the laws of the applicable jurisdiction, without regard to conflict of law
                principles. Venue shall be in the courts of competent jurisdiction.
              </p>
            </section>

            <section id="changes" className={common.section} aria-labelledby="changes-title">
              <h2 id="changes-title">Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Material changes will be communicated via the platform or
                email. Continued use constitutes acceptance of the updated terms.
              </p>
            </section>

            <section id="contact" className={common.section} aria-labelledby="contact-title">
              <h2 id="contact-title">Contact Us</h2>
              <p>
                For questions about these Terms, contact us at legal@megilance.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Terms;
