// @AI-HINT: The Hero component is the main landing page banner. It uses modern visuals, lucide-react icons, and animated counters to create a premium, engaging first impression.
'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { ArrowRight, PlayCircle, Zap, ShieldCheck, Bot, Globe } from 'lucide-react';

import Button from '@/app/components/Button/Button';
import StatItem from './StatItem'; // Assuming StatItem will be created

import commonStyles from './Hero.common.module.css';
import lightStyles from './Hero.light.module.css';
import darkStyles from './Hero.dark.module.css';

const Hero: React.FC = () => {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.heroContainer, styles.heroContainer)}>
      <div className={cn(commonStyles.backgroundVisuals, styles.backgroundVisuals)}></div>
      <div className={commonStyles.contentWrapper}>
        <a href="/blog/new-features" className={cn(commonStyles.promoBadge, styles.promoBadge)}>
          <span className={cn(commonStyles.promoBadgeHighlight, styles.promoBadgeHighlight)}>New</span>
          Announcing our new AI-powered project briefs
          <ArrowRight size={16} />
        </a>

        <h1 className={cn(commonStyles.mainHeading, styles.mainHeading)}>
          The Platform for Modern Freelancing
        </h1>

        <p className={cn(commonStyles.subheading, styles.subheading)}>
          MegiLance combines AI-powered matching with blockchain-secured payments to connect the world&apos;s top talent with innovative projects. Your future of work starts here.
        </p>

        <div className={commonStyles.ctaButtons}>
          <Link href="/signup" passHref legacyBehavior>
            <Button as="a" variant="primary" size="large">
              Get Started Free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/contact" passHref legacyBehavior>
            <Button as="a" variant="secondary" size="large">
              <PlayCircle size={18} />
              Contact Sales
            </Button>
          </Link>
        </div>

        <div className={commonStyles.featuresList}>
          <div className={cn(commonStyles.featureItem, styles.featureItem)}>
            <Bot size={20} />
            <span>AI Smart Matching</span>
          </div>
          <div className={cn(commonStyles.featureItem, styles.featureItem)}>
            <Zap size={20} />
            <span>Instant USDC Payments</span>
          </div>
          <div className={cn(commonStyles.featureItem, styles.featureItem)}>
            <ShieldCheck size={20} />
            <span>Blockchain Escrow</span>
          </div>
          <div className={cn(commonStyles.featureItem, styles.featureItem)}>
            <Globe size={20} />
            <span>Global Opportunities</span>
          </div>
        </div>

        <div className={cn(commonStyles.statsGrid, styles.statsGrid)}>
          <StatItem value={50000} label="Active Freelancers" />
          <StatItem value={125000} label="Projects Completed" />
          <StatItem value={2500000} label="Paid to Freelancers" prefix="$" />
          <StatItem value={45} label="Countries Served" />
        </div>
      </div>
    </div>
  );
};

export default Hero;