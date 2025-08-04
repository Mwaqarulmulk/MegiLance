// @AI-HINT: This page allows users to find their referral link and track their rewards.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import './ReferralPage.common.css';
import './ReferralPage.light.css';
import './ReferralPage.dark.css';

// @AI-HINT: Mock data. In a real app, this would be fetched for the logged-in user.
const referralData = {
  referralLink: 'https://megilance.io/join/user123xyz',
  rewardsEarned: 150.75, // Example in platform tokens
  successfulReferrals: 3,
};

const ReferralPage: React.FC = () => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className={`ReferralPage-container ReferralPage-container--${theme}`}>
      <header className="ReferralPage-header">
        <h1 className="ReferralPage-title">Invite Friends, Earn Crypto</h1>
        <p className="ReferralPage-subtitle">Share your unique link and earn rewards for every new user who joins and completes a job.</p>
      </header>

      <main className="ReferralPage-main">
        <div className={`ReferralPage-card ReferralPage-card--${theme}`}>
          <h2 className="ReferralPage-card-title">Your Referral Link</h2>
          <div className={`ReferralPage-link-wrapper ReferralPage-link-wrapper--${theme}`}>
            <label htmlFor="referral-link" className="visually-hidden">Your referral link</label>
            <input id="referral-link" type="text" readOnly value={referralData.referralLink} className="ReferralPage-link-input" />
            <Button theme={theme} variant="primary" onClick={handleCopyLink}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className={`ReferralPage-stats-card ReferralPage-stats-card--${theme}`}>
          <h2 className="ReferralPage-card-title">Your Stats</h2>
          <div className="ReferralPage-stats-grid">
            <div className="ReferralPage-stat-item">
              <span className="ReferralPage-stat-value">{referralData.successfulReferrals}</span>
              <span className="ReferralPage-stat-label">Successful Referrals</span>
            </div>
            <div className="ReferralPage-stat-item">
              <span className="ReferralPage-stat-value">{referralData.rewardsEarned.toFixed(2)}</span>
              <span className="ReferralPage-stat-label">Tokens Earned</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferralPage;
