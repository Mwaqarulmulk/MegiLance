// @AI-HINT: Cookie Policy page for MegiLance.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';
import common from './Cookies.common.module.css';
import light from './Cookies.light.module.css';
import dark from './Cookies.dark.module.css';

const CookiesPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === 'dark' ? dark : light;

  return (
    <PageTransition>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
         <AnimatedOrb variant="purple" size={500} blur={90} opacity={0.1} className="absolute top-[-10%] right-[-10%]" />
         <AnimatedOrb variant="blue" size={400} blur={70} opacity={0.08} className="absolute bottom-[-10%] left-[-10%]" />
         <ParticlesSystem count={12} className="absolute inset-0" />
         <div className="absolute top-20 left-10 opacity-10 animate-float-slow">
           <FloatingCube size={40} />
         </div>
         <div className="absolute bottom-40 right-20 opacity-10 animate-float-medium">
           <FloatingSphere size={30} variant="gradient" />
         </div>
      </div>
      <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div className={common.header}>
          <h1 className={common.title}>Cookie Policy</h1>
          <p className={cn(common.subtitle, themed.subtitle)}>
            How we use cookies and similar technologies
          </p>
        </div>

        <section className={common.section}>
          <h2 className={common.sectionTitle}>What Are Cookies?</h2>
          <p className={common.content}>
            <strong>Cookies</strong> are small text files stored securely on your browser or device when you visit MegiLance. 
            They help us provide a seamless authentication experience, maintain active sessions, and ensure robust <strong>milestone escrow security</strong>.
          </p>
        </section>

        <section className={common.section}>
          <h2 className={common.sectionTitle}>Types of Cookies We Use</h2>
          <div className={common.cookiesGrid}>
            <div className={common.cookieCard}>
              <h3 className={common.cookieTitle}>1. Essential &amp; Authentication Cookies</h3>
              <p className={common.cookieDescription}>
                <strong>Strictly Necessary:</strong> Required for account login, cryptographic JWT sessions, CSRF protection, and milestone escrow authorization. These cannot be disabled.
              </p>
            </div>
            <div className={common.cookieCard}>
              <h3 className={common.cookieTitle}>2. Performance &amp; Telemetry Cookies</h3>
              <p className={common.cookieDescription}>
                <strong>Anonymous Analytics:</strong> Measure API latency, page load speed, and server uptime. No personal identifiable information (PII) is recorded or shared.
              </p>
            </div>
            <div className={common.cookieCard}>
              <h3 className={common.cookieTitle}>3. Functional &amp; Theme Cookies</h3>
              <p className={common.cookieDescription}>
                <strong>User Preferences:</strong> Remember your light/dark theme preference, sound settings, workspace sidebar state, and language selection.
              </p>
            </div>
            <div className={common.cookieCard}>
              <h3 className={common.cookieTitle}>4. Zero 3rd-Party Tracking Guarantee</h3>
              <p className={common.cookieDescription}>
                <strong>Zero Ad Networks:</strong> MegiLance does <strong>not</strong> use invasive third-party ad retargeting trackers or sell browsing data to data brokers.
              </p>
            </div>
          </div>
        </section>

        <section className={common.section}>
          <h2 className={common.sectionTitle}>Managing Your Cookie Preferences</h2>
          <p className={common.content}>
            You can control or clear cookies directly through your <strong>browser settings</strong> (Chrome, Firefox, Safari, or Edge). Note that blocking essential session cookies will prevent login to protected client and freelancer dashboards.
          </p>
        </section>

        <section className={common.section}>
          <h2 className={common.sectionTitle}>Updates &amp; Contact</h2>
          <p className={common.content}>
            We review our cookie practices periodically. For inquiries regarding our cookie standards or privacy policies, please reach out to <a href="mailto:support@megilance.site" className={common.emailLink}>support@megilance.site</a>.
          </p>
        </section>

        <section className={common.section}>
          <h2 className={common.sectionTitle}>Contact Us</h2>
          <p className={common.content}>
            If you have any questions about our use of cookies, please contact us at{' '}
            <a href="mailto:privacy@megilance.com" className={common.emailLink}>
              privacy@megilance.com
            </a>
          </p>
        </section>
      </div>
    </main>
    </PageTransition>
  );
};

export default CookiesPage; 
