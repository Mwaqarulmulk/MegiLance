// @AI-HINT: This is the Freelancer Rank page, showcasing the AI-powered ranking system. It has been fully refactored for a premium, theme-aware, and data-centric design.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';

import ProgressBar from '@/app/components/ProgressBar/ProgressBar';
import RankGauge from '@/app/components/RankGauge/RankGauge';
import { cn } from '@/lib/utils';
import commonStyles from './RankPage.common.module.css';
import lightStyles from './RankPage.light.module.css';
import darkStyles from './RankPage.dark.module.css';

// Mock data for rank
const rankData = {
  overallRank: 'Top 10%',
  rankScore: 92,
  factors: [
    { label: 'Job Success Score', score: 98, description: 'Based on client satisfaction and successful project completions.' },
    { label: 'Client Recommendations', score: 95, description: 'Reflects positive reviews and re-hire rates.' },
    { label: 'Communication', score: 90, description: 'Analyzed from response times and clarity in messaging (AI-assessed).' },
    { label: 'On-Time Delivery', score: 88, description: 'Based on meeting deadlines for all project milestones.' },
  ],
};

const RankFactor: React.FC<{ label: string; score: number; description: string; styles: any }> = ({ label, score, description, styles }) => {
  return (
    <div className={cn(styles.rankFactor)}>
      <div className={cn(styles.factorHeader)}>
        <span className={cn(styles.label)}>{label}</span>
        <span className={cn(styles.score)}>{score}/100</span>
      </div>
      <ProgressBar progress={score} />
      <p className={cn(styles.factorDescription)}>{description}</p>
    </div>
  );
};

const RankPage: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={cn(styles.pageWrapper)}>
      <header className={cn(styles.header)}>
        <div className={cn(styles.titleGroup)}>
          <h1>My Freelancer Rank</h1>
          <p>Understand your AI-powered rank and how to improve it.</p>
        </div>
      </header>

      <main className={cn(styles.mainGrid)}>
        <span className={cn(styles.srOnly)} aria-live="polite">
          {`Overall rank ${rankData.overallRank}. Rank score ${rankData.rankScore} out of 100.`}
        </span>
        <aside>
          <div className={cn(styles.rankDisplayCard)} role="region" aria-label="Your current rank" title="Your current rank">
            <h2>Your Current Rank</h2>
            <p className={cn(styles.scoreText)}>{rankData.overallRank}</p>
            <RankGauge score={rankData.rankScore} />
          </div>
        </aside>

        <section className={cn(styles.factorsContainer)} role="region" aria-label="Rank factors" title="Rank factors">
          <h2>How Your Rank is Calculated</h2>
          <div className={cn(styles.factorsGrid)}>
            {rankData.factors.map((factor, index) => (
              <RankFactor key={index} {...factor} styles={styles} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RankPage;

