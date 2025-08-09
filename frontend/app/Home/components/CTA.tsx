// @AI-HINT: This is the final Call-to-Action section, designed to be visually impactful with animations to drive user conversion.
'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button/Button';
import { FaRocket } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
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
        commonStyles.homeCtaSection,
        themeStyles.homeCtaSection,
        isVisible ? commonStyles.isVisible : commonStyles.isNotVisible
      )}
    >
      <div className={commonStyles.homeCtaContent}>
        <h2 className={cn(commonStyles.homeCtaTitle, themeStyles.homeCtaTitle)}>Ready to Join the Future of Freelancing?</h2>
        <p className={cn(commonStyles.homeCtaSubtitle, themeStyles.homeCtaSubtitle)}>Sign up today and get access to AI-powered tools, global projects, and secure crypto payments.</p>
        <Link href="/signup" passHref>
          <Button as="a" variant="primary" size="large">
            <FaRocket aria-hidden="true" /> Get Started for Free
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTA;
