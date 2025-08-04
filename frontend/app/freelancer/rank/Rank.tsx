// @AI-HINT: This is the Freelancer Rank page, showcasing the AI-powered ranking system. All styles are per-component only.
'use client';

import React from 'react';
import './Rank.common.css';
import './Rank.light.css';
import './Rank.dark.css';

interface RankProps {
  theme?: 'light' | 'dark';
}

// A simple component to visualize a metric contributing to the rank
const RankFactor: React.FC<{ theme: 'light' | 'dark'; label: string; score: number; description: string }> = ({ theme, label, score, description }) => (
  <div className={`RankFactor RankFactor--${theme}`}>
    <div className="RankFactor-header">
      <span className="RankFactor-label">{label}</span>
      <span className="RankFactor-score">{score}/100</span>
    </div>
    <div className="RankFactor-progress-bar">
      <div className="RankFactor-progress" style={{ width: `${score}%` }}></div>
    </div>
    <p className="RankFactor-description">{description}</p>
  </div>
);

const Rank: React.FC<RankProps> = ({ theme = 'light' }) => {
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
    <div className={`Rank Rank--${theme}`}>
      <div className="Rank-container">
        <header className="Rank-header">
          <h1>My Freelancer Rank</h1>
          <p>Understand your AI-powered rank and how to improve it.</p>
        </header>

        <div className={`Rank-display-card Rank-display-card--${theme}`}>
          <h2>Your Current Rank is</h2>
          <p className="Rank-score-text">{rankData.overallRank}</p>
          <div className="Rank-gauge">
            <div className="Rank-gauge-fill" style={{ transform: `rotate(${rankData.rankScore / 100 * 180}deg)` }}></div>
            <div className="Rank-gauge-cover"></div>
            <span className="Rank-gauge-score">{rankData.rankScore}</span>
          </div>
        </div>

        <section className="Rank-factors">
          <h2>How Your Rank is Calculated</h2>
          <div className="Rank-factors-grid">
            {rankData.factors.map((factor, index) => (
              <RankFactor key={index} theme={theme} {...factor} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Rank;
