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
import { PLATFORM_FACTS, PLATFORM_STATUS } from '@/lib/platform-config';
import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';
import InstantMatchingWizard from '@/app/components/AI/InstantMatchingWizard';

const defaultStats = [
  { label: 'Free AI Tools', value: `${PLATFORM_FACTS.AI_TOOLS_COUNT}` },
  { label: 'Markets Reached', value: PLATFORM_FACTS.COUNTRIES_SUPPORTED },
  { label: 'Platform Fee', value: '0%' },
];

/**
 * Tiny avatar initials — displayed as a stacked trust strip.
 * Replace src with real avatars when available.
 */
const TRUST_AVATARS = ['A', 'K', 'M', 'S', 'R'];

export default function Hero({ stats = defaultStats }) {
  const mode = useThemeMode();
  const { user, isAuthenticated } = useAuth();

  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  const dashboardLink =
    user?.user_type === 'client'
      ? '/client/dashboard'
      : user?.user_type === 'admin'
      ? '/admin/dashboard'
      : '/freelancer/dashboard';

  return (
    <section className={cn(commonStyles.hero, themeStyles.hero)}>
      <div className={cn(commonStyles.content, themeStyles.content)}>

        {/* ── Badges ── */}
        <div className={cn(commonStyles.badges, themeStyles.badges)}>
          {isAuthenticated && user ? (
            <span className={cn(commonStyles.badge, themeStyles.badge, 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 font-bold')}>
              👋 Welcome Back, {user.name}
            </span>
          ) : (
            <>
              <span className={cn(commonStyles.badge, themeStyles.badge)}>
                <Bot size={13} className="inline" aria-hidden="true" /> {PLATFORM_STATUS.BADGE}
              </span>
              <span className={cn(commonStyles.badge, themeStyles.badge)}>
                <Sparkles size={13} className="inline text-amber-500" aria-hidden="true" /> Free AI Suite
              </span>
              <span className={cn(commonStyles.badge, themeStyles.badge)}>
                <Shield size={13} className="inline text-emerald-500" aria-hidden="true" /> Milestone Escrow
              </span>
            </>
          )}
        </div>

        {/* ── Headline ── */}
        <h1 id="hero-title" className={cn(commonStyles.title, themeStyles.title)}>
          Free AI Tools for Freelancers &amp; Clients —{' '}
          <span className={cn(commonStyles.highlight, themeStyles.highlight)}>
            Plus a Smarter Freelance Marketplace
          </span>
        </h1>

        {/* ── Subtitle ── */}
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          {isAuthenticated
            ? `You're logged in as a ${user?.user_type}. Access your workrooms, manage escrow payments, or check proposals from your dashboard.`
            : 'Price projects, write stronger proposals, plan scopes and calculate rates with free AI tools. When ready, hire or find work directly on MegiLance.'}
        </p>

        {/* ── 60-Second Instant Matching Wizard ── */}
        <div className="w-full my-2 text-left">
          <InstantMatchingWizard className="shadow-2xl" />
        </div>

        {/* ── CTAs ── */}
        <div className={cn(commonStyles.actions, themeStyles.actions)}>
          {isAuthenticated ? (
            <>
              <Link
                href={dashboardLink}
                className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}
              >
                Go to Dashboard
              </Link>
              <Link
                href="/contracts"
                className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}
              >
                View Active Contracts
              </Link>
            </>
          ) : (
            <>
              <Link
                href="#ai-tools"
                className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}
              >
                <Sparkles size={16} aria-hidden="true" />
                Use Free AI Tools
              </Link>
              <Link
                href="/talent"
                className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}
              >
                Hire Freelancers
              </Link>
            </>
          )}
        </div>

        {/* ── Trust Strip ── */}
        {!isAuthenticated && (
          <div className={cn(commonStyles.trustStrip, themeStyles.trustStrip)}>
            <div className={cn(commonStyles.avatarStack)}>
              {TRUST_AVATARS.map((initial, i) => (
                <div
                  key={i}
                  className={cn(commonStyles.avatar, themeStyles.avatar)}
                  aria-hidden="true"
                >
                  {initial}
                </div>
              ))}
            </div>
            <span className={cn(commonStyles.trustText, themeStyles.trustText)}>
              Freelancers &amp; clients across {PLATFORM_FACTS.COUNTRIES_SUPPORTED} markets trust MegiLance
            </span>
          </div>
        )}

        {/* ── Find Work link ── */}
        {!isAuthenticated && (
          <div className="mt-1 text-center">
            <Link
              href="/explore"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Find Freelance Work</span>
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* ── Hero Visual Panel — Lottie inside glass frame ── */}
        <div className={cn(commonStyles.visualPanel)}>
          <div className={cn(commonStyles.visualFrame, themeStyles.visualFrame)}>
            <BrandLottiePlayer
              src="/lottie/01_ai_saas_dashboard.json"
              ariaLabel="MegiLance AI SaaS Dashboard Animation"
              className="w-full max-w-xl h-64 md:h-80"
              framed={false}
              glow={false}
            />
          </div>
        </div>

        {/* ── Stats ── */}
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