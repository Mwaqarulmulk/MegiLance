// @AI-HINT: A final, high-impact Call-to-Action section designed with premium styling and animations to maximize user conversion.

'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import Button from '@/app/components/Button/Button';
const NewsletterSignup = dynamic(() => import('@/app/components/Newsletter/NewsletterSignup'));

import commonStyles from './CTA.common.module.css';
import lightStyles from './CTA.light.module.css';
import darkStyles from './CTA.dark.module.css';

const CTA: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.3 });

  return (
    <section
      ref={sectionRef}
      className={cn(
        commonStyles.ctaSection,
        themeStyles.ctaSection,
        isVisible ? commonStyles.isVisible : commonStyles.isNotVisible
      )}
    >
      <div className={cn(commonStyles.container)}>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>Ready to Build the Future?</h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          Join MegiLance today and unlock AI-powered tools, access global projects, and get paid instantly with crypto.
        </p>
        <Link href="/signup" passHref>
          <Button as="a" variant="primary" size="large" className={commonStyles.ctaButton}>
            Get Started Free
            <Rocket className={commonStyles.buttonIcon} />
          </Button>
        </Link>
        <div className={commonStyles.newsletterWrapper}>
          <p className={commonStyles.newsletterLabel}>Stay updated with platform launches & AI features</p>
          <NewsletterSignup compact />
        </div>
      </div>
    </section>
  );
};

export default CTA;
