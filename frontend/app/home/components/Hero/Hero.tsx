'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { useAuth } from '@/hooks/useAuth';
import commonStyles from './Hero.common.module.css';
import lightStyles from './Hero.light.module.css';
import darkStyles from './Hero.dark.module.css';
import { Sparkles, Shield, ArrowRight, Bot } from 'lucide-react';
import { PLATFORM_FACTS, PRICING_CONFIG, PLATFORM_STATUS } from '@/lib/platform-config';
import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';
import InstantMatchingWizard from '@/app/components/AI/InstantMatchingWizard';

const defaultStats = [
  { label: 'Free AI Freelance Tools', value: `${PLATFORM_FACTS.AI_TOOLS_COUNT} Tools` },
  { label: 'Supported Global Markets', value: PLATFORM_FACTS.COUNTRIES_SUPPORTED },
  { label: 'Promotional Launch Fee', value: '0% Platform' },
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
                <Bot size={14} className="inline mr-1" /> {PLATFORM_STATUS.BADGE}
              </span>
              <span className={cn(commonStyles.badge, themeStyles.badge)}>
                <Sparkles size={14} className="inline mr-1 text-amber-500" /> Free AI Tools Suite
              </span>
              <span className={cn(commonStyles.badge, themeStyles.badge)}>
                <Shield size={14} className="inline mr-1 text-emerald-500" /> Milestone Escrow
              </span>
            </>
          )}
        </div>

        <h1 id="hero-title" className={cn(commonStyles.title, themeStyles.title)}>
          Free AI Tools for Freelancers &amp; Clients —{' '}
          <span className={cn(commonStyles.highlight, themeStyles.highlight)}>Plus a Smarter Freelance Marketplace</span>
        </h1>
        
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          {isAuthenticated ? (
            `You are logged in as a ${user?.user_type}. Access your collaboration workrooms, manage active escrow payments, or check your proposal status from your dashboard.`
          ) : (
            "Price projects, write stronger proposals, plan scopes, calculate rates and evaluate freelance opportunities with free AI tools. When you're ready to hire or find work, continue directly on MegiLance."
          )}
        </p>

        {/* 60-Second Instant Matching Wizard Centerpiece */}
        <div className="w-full my-4 text-left">
          <InstantMatchingWizard className="shadow-2xl" />
        </div>

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
              <Link href="#ai-tools" className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}>
                Use Free AI Tools
              </Link>
              <Link href="/talent" className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}>
                Hire Freelancers
              </Link>
            </>
          )}
        </div>

        {!isAuthenticated && (
          <div className="mt-1 text-center">
            <Link href="/explore" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              <span>Find Freelance Work</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Hero Lottie Feature Animation Showcase */}
        <div className="mt-4 mb-2 w-full flex justify-center">
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