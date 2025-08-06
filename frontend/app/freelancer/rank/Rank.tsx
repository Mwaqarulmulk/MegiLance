// @AI-HINT: This is the Freelancer Rank page, showcasing the AI-powered ranking system. All styles are per-component only.
'use client';

import React from 'react';
import ProgressBar from '@/app/components/ProgressBar/ProgressBar';
import RankGauge from '@/app/components/RankGauge/RankGauge';
import commonStyles from './Rank.common.module.css';
import lightStyles from './Rank.light.module.css';
import darkStyles from './Rank.dark.module.css';

// @AI-HINT: This is the Freelancer Rank page, showcasing the AI-powered ranking system. All styles are per-component only. Now fully theme-switchable using global theme context.

const RankFactor: React.FC<{ label: string; score: number; description: string }> = ({ label, score, description }) => {
  return (
    <div className={commonStyles.rankFactor}>
      <div className={commonStyles.header}>
        <span className={commonStyles.label}>{label}</span>
        <span className={commonStyles.score}>{score}/100</span>
      </div>
      <ProgressBar progress={score} />
      <p className={commonStyles.description}>{description}</p>
    </div>
  );
};

const Rank: React.FC = () => {
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

  return (
    <div className={commonStyles.rank}>
      <div className={commonStyles.container}>
        <header className={commonStyles.header}>
          <h1>My Freelancer Rank</h1>
          <p>Understand your AI-powered rank and how to improve it.</p>
        </header>

        <div className={commonStyles.displayCard}>
          <h2>Your Current Rank is</h2>
          <p className={commonStyles.scoreText}>{rankData.overallRank}</p>
          <RankGauge score={rankData.rankScore} />
        </div>

        <section className={commonStyles.factors}>
          <h2>How Your Rank is Calculated</h2>
          <div className={commonStyles.factorsGrid}>
            {rankData.factors.map((factor, index) => (
              <RankFactor key={index} {...factor} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Rank;
