// @AI-HINT: Global Rankings & Gamification page for freelancers. Theme-aware and structured with animation wrappers.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import FreelancerLeaderboard from '@/app/components/organisms/Gamification/FreelancerLeaderboard';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { Trophy } from 'lucide-react';

import commonStyles from './Rank.common.module.css';
import lightStyles from './Rank.light.module.css';
import darkStyles from './Rank.dark.module.css';

export default function RankPage() {
  const { resolvedTheme } = useTheme();

  const themeStyles = useMemo(() => {
    return resolvedTheme === 'dark' ? darkStyles : lightStyles;
  }, [resolvedTheme]);

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container)}>
        <ScrollReveal>
          <header className={cn(commonStyles.header, themeStyles.header)}>
            <h1 className={cn(commonStyles.title, themeStyles.title)}>
              <Trophy size={28} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--ml-yellow)' }} />
              Global Rankings
            </h1>
            <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
              Top freelancers computed dynamically from matching telemetry, project quality, and client reviews.
            </p>
          </header>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <FreelancerLeaderboard timeframe="monthly" />
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
