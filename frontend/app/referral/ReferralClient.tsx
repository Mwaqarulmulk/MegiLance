// @AI-HINT: This page allows users to find their referral link and track their rewards.
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { referralApi } from '@/lib/api';
import Button from '@/app/components/atoms/Button/Button';
import { PageTransition, ScrollReveal, StaggerContainer } from '@/app/components/Animations';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';
import { Loader2, AlertCircle } from 'lucide-react';
import commonStyles from './ReferralPage.common.module.css';
import lightStyles from './ReferralPage.light.module.css';
import darkStyles from './ReferralPage.dark.module.css';

interface ReferralData {
  referralLink: string;
  rewardsEarned: number;
  successfulReferrals: number;
}

const ReferralPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData>({ referralLink: '', rewardsEarned: 0, successfulReferrals: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [codeRes, statsRes] = await Promise.allSettled([
          referralApi.getMyCode(),
          referralApi.getStats(),
        ]);

        const link = codeRes.status === 'fulfilled'
          ? ((codeRes.value as Record<string, unknown>).referral_link as string) || ((codeRes.value as Record<string, unknown>).link as string) || ''
          : '';
        const stats = statsRes.status === 'fulfilled' ? (statsRes.value as Record<string, unknown>) : {};

        setReferralData({
          referralLink: link,
          rewardsEarned: (stats.rewards_earned as number) || (stats.rewardsEarned as number) || 0,
          successfulReferrals: (stats.successful_referrals as number) || (stats.successfulReferrals as number) || 0,
        });
      } catch {
        setError('Failed to load referral data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopyLink = () => {
    if (!referralData.referralLink) return;
    navigator.clipboard.writeText(referralData.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <PageTransition className={cn(commonStyles.container, themeStyles.container)}>
        <div className={cn(commonStyles.header)}>
          <Loader2 size={32} className="animate-spin" />
          <p>Loading referral data...</p>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className={cn(commonStyles.container, themeStyles.container)}>
        <div className={cn(commonStyles.header)}>
          <AlertCircle size={32} />
          <p>{error}</p>
          <Button variant="primary" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className={cn(commonStyles.container, themeStyles.container)}>
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
      <ScrollReveal className={commonStyles.header}>
        <h1 className={cn(commonStyles.title, themeStyles.title)}>Invite Friends, Earn Crypto</h1>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>Share your unique link and earn rewards for every new user who joins and completes a job.</p>
      </ScrollReveal>

      <StaggerContainer className={commonStyles.main}>
        <ScrollReveal className={cn(commonStyles.card, themeStyles.card)}>
          <h2 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Your Referral Link</h2>
          <div className={commonStyles.linkWrapper}>
            <label htmlFor="referral-link" className={commonStyles.visuallyHidden}>Your referral link</label>
            <input id="referral-link" type="text" readOnly value={referralData.referralLink} className={cn(commonStyles.linkInput, themeStyles.linkInput)} />
            <Button variant="primary" onClick={handleCopyLink}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal className={cn(commonStyles.statsCard, themeStyles.statsCard)}>
          <h2 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Your Stats</h2>
          <div className={commonStyles.statsGrid}>
            <div className={cn(commonStyles.statItem, themeStyles.statItem)}>
              <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{referralData.successfulReferrals}</span>
              <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Successful Referrals</span>
            </div>
            <div className={cn(commonStyles.statItem, themeStyles.statItem)}>
              <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{referralData.rewardsEarned.toFixed(2)}</span>
              <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Tokens Earned</span>
            </div>
          </div>
        </ScrollReveal>
      </StaggerContainer>
    </PageTransition>
  );
};

export default ReferralPage;
