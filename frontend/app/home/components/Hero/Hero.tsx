'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { useAuth } from '@/hooks/useAuth';
import commonStyles from './Hero.common.module.css';
import lightStyles from './Hero.light.module.css';
import darkStyles from './Hero.dark.module.css';

import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';

const defaultStats = [
  { label: 'Escrow Volume Protected', value: '$2.4M+' },
  { label: 'Vetted Engineering & Design Talent', value: '25,000+' },
  { label: 'Platform Commission Fee', value: '0% Launch' },
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
              <Link href="/talent" className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}>
                Hire Top Talent
              </Link>
              <Link href="/explore" className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}>
                Find Freelance Work
              </Link>
            </>
          )}
        </div>

        {/* Hero Lottie Feature Animation Showcase */}
        <div className="mt-8 mb-4 w-full flex justify-center">
          <BrandLottiePlayer
            src="/lottie/01_ai_saas_dashboard.json"
            ariaLabel="MegiLance AI SaaS Dashboard Animation"
            className="w-full max-w-xl h-64 md:h-80"
            framed={true}
            glow={true}
          />
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