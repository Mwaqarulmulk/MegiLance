'use client';

// @AI-HINT: Dynamic Hero component for MegiLance redesign, strict 3-file CSS module.
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import commonStyles from './Hero.common.module.css';
import lightStyles from './Hero.light.module.css';
import darkStyles from './Hero.dark.module.css';

// Ideally, these would come from an API call such as: `const stats = await fetch('/api/v1/analytics/aggregates')`
const defaultStats = [
  { label: 'Active Projects', value: '12K+' },
  { label: 'Top Freelancers', value: '50K+' },
  { label: 'Saved in Fees', value: '$2M+' },
];

export default function Hero({ stats = defaultStats }) {
  const mode = useThemeMode();

  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.hero, themeStyles.hero)}>
      <div className={cn(commonStyles.content, themeStyles.content)}>
        
        <div className={cn(commonStyles.badges, themeStyles.badges)}>
          <span className={cn(commonStyles.badge, themeStyles.badge)}>
            ✨ AI-Powered Matching
          </span>
          <span className={cn(commonStyles.badge, themeStyles.badge)}>
            🛡️ Escrow Protection
          </span>
        </div>

        <h1 id="hero-title" className={cn(commonStyles.title, themeStyles.title)}>
          Hire the best talent. <br />
          <span className={cn(commonStyles.highlight, themeStyles.highlight)}>Zero commission.</span>
        </h1>
        
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          MegiLance fixes what&apos;s broken in freelancing: AI matches you with vetted talent at a
          fair price, milestone escrow protects every payment — even cross-border — and transparent
          pricing means no overpaying, no surprises, and no late projects.
        </p>

        <div className={cn(commonStyles.actions, themeStyles.actions)}>
          <Link href="/client/find-talent" className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}>
            Find Talent
          </Link>
          <Link href="/explore" className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}>
            Find Work
          </Link>
        </div>

        <div className={cn(commonStyles.stats, themeStyles.stats)} aria-label="Platform statistics">
          {stats.map((stat, i) => (
            <div key={i} className={cn(commonStyles.statItem, themeStyles.statItem)}>
              <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{stat.value}</span>
              <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>{stat.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}