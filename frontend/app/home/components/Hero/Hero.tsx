'use client';

// @AI-HINT: Dynamic Hero component for MegiLance redesign, strict 3-file CSS module.
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { useAuth } from '@/hooks/useAuth';
import commonStyles from './Hero.common.module.css';
import lightStyles from './Hero.light.module.css';
import darkStyles from './Hero.dark.module.css';

// Ideally, these would come from an API call such as: `const stats = await fetch('/api/v1/analytics/aggregates')`
const defaultStats = [
  { label: 'Demo Projects', value: '11' },
  { label: 'Freelancer Profiles', value: '28' },
  { label: 'Escrow Prototype', value: '100%' },
];

export default function Hero({ stats = defaultStats }) {
  const mode = useThemeMode();
  const { user, isAuthenticated } = useAuth();

  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  // Determine dashboard link based on role
  const dashboardLink = user?.user_type === 'client' 
    ? '/client/dashboard' 
    : user?.user_type === 'admin' 
    ? '/admin/dashboard' 
    : '/freelancer/dashboard';

  return (
    <section className={cn(commonStyles.hero, themeStyles.hero)}>
      <div className={cn(commonStyles.content, themeStyles.content)}>
        
        <div className={cn(commonStyles.badges, themeStyles.badges)}>
          {isAuthenticated && user ? (
            <span className={cn(commonStyles.badge, themeStyles.badge, "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 font-bold")}>
              👋 Welcome Back, {user.name}
            </span>
          ) : (
            <>
              <span className={cn(commonStyles.badge, themeStyles.badge)}>
                ✨ AI-Powered Matching
              </span>
              <span className={cn(commonStyles.badge, themeStyles.badge)}>
                🛡️ Escrow Protection
              </span>
            </>
          )}
        </div>

        <h1 id="hero-title" className={cn(commonStyles.title, themeStyles.title)}>
          AI-Powered Freelancing with <br />
          <span className={cn(commonStyles.highlight, themeStyles.highlight)}>Smarter Matching & Milestone Escrow</span>
        </h1>
        
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          {isAuthenticated ? (
            `You are logged in as a ${user?.user_type}. Access your collaboration workrooms, manage active escrow payments, or check your proposal status from your dashboard.`
          ) : (
            "MegiLance helps clients scope, price, match, and manage freelance projects with AI-powered tools and milestone escrow."
          )}
        </p>

        <div className={cn(commonStyles.actions, themeStyles.actions)}>
          {isAuthenticated ? (
            <>
              <Link href={dashboardLink} className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}>
                Go to Dashboard
              </Link>
              <Link href="/contracts" className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}>
                View Active Contracts
              </Link>
            </>
          ) : (
            <>
              <Link href="/explore" className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}>
                Explore Platform
              </Link>
              <Link href="/ai/price-estimator" className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}>
                Try Price Estimator
              </Link>
            </>
          )}
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