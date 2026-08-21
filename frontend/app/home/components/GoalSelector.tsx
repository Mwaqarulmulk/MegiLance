'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Sparkles, Users, Briefcase, ArrowRight, Shield, CheckCircle2, Zap, Star, Lock, Calculator, TrendingUp } from 'lucide-react';
import commonStyles from './GoalSelector.common.module.css';
import lightStyles from './GoalSelector.light.module.css';
import darkStyles from './GoalSelector.dark.module.css';

export default function GoalSelector() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <span className={cn(commonStyles.badge, themeStyles.badge)}>
          <Zap size={14} className="text-amber-500" />
          Choose Your Path
        </span>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>
          Designed for Clients Who Value Quality &amp; Freelancers Who Deliver It
        </h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          Whether you need instant AI project estimates, vetted specialists for your next build, or freelance opportunities with guaranteed milestone payouts.
        </p>
      </div>

      {/* Modern Asymmetric Bento Grid */}
      <div className={commonStyles.bentoGrid}>
        
        {/* Bento Tile 1: Primary Large Card - Hire Vetted Talent */}
        <div className={cn(commonStyles.bentoCard, commonStyles.bentoCardHero, themeStyles.bentoCard, themeStyles.bentoCardHero)}>
          <div className={commonStyles.cardGlow} />
          <div className={commonStyles.cardContentTop}>
            <div className={commonStyles.pillRow}>
              <span className={cn(commonStyles.pill, themeStyles.pillPrimary)}>
                <Shield size={12} className="text-emerald-500" /> 100% Escrow Protection
              </span>
              <span className={cn(commonStyles.pill, themeStyles.pillSecondary)}>
                0% Client Platform Fee
              </span>
            </div>

            <h3 className={cn(commonStyles.bentoTitle, themeStyles.bentoTitle)}>
              Hire Verified Talent with Code-Enforced Milestone Escrow
            </h3>
            <p className={cn(commonStyles.bentoDesc, themeStyles.bentoDesc)}>
              Connect with top developers, UI/UX designers, AI specialists, and marketers. Funds are pre-funded into neutral escrow and released only when deliverables meet your standards.
            </p>

            {/* Interactive Talent Snapshot Widget */}
            <div className={cn(commonStyles.talentSnapshot, themeStyles.talentSnapshot)}>
              <div className={commonStyles.talentHeader}>
                <div className={commonStyles.talentAvatar}>
                  <span>EP</span>
                </div>
                <div className={commonStyles.talentMeta}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Elena Popova</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
                      ⭐ Top Rated Plus
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Senior Full-Stack &amp; AI Engineer</span>
                </div>
                <div className="text-right ml-auto">
                  <span className="text-sm font-black text-slate-900 dark:text-white">$75/hr</span>
                  <span className="text-[10px] text-emerald-500 font-semibold block">98% AI Match</span>
                </div>
              </div>

              <div className={commonStyles.talentSkillsRow}>
                <span className={commonStyles.skillChip}>Next.js 16</span>
                <span className={commonStyles.skillChip}>FastAPI</span>
                <span className={commonStyles.skillChip}>Stripe Escrow</span>
                <span className={commonStyles.skillChip}>UI/UX Systems</span>
              </div>
            </div>
          </div>

          <div className={commonStyles.cardContentBottom}>
            <Link href="/talent" className={cn(commonStyles.bentoBtn, themeStyles.bentoBtnPrimary)}>
              <span>Hire Top Specialists</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Bento Tile 2: Free AI Tools Hub */}
        <div className={cn(commonStyles.bentoCard, themeStyles.bentoCard)}>
          <div className={commonStyles.cardContentTop}>
            <div className={commonStyles.pillRow}>
              <span className={cn(commonStyles.pill, themeStyles.pillAccent)}>
                <Sparkles size={12} className="text-amber-500" /> 100% Free · No Sign-Up
              </span>
            </div>

            <h3 className={cn(commonStyles.bentoTitle, themeStyles.bentoTitle)}>
              Plan Scopes &amp; Price Projects with Free AI Tools
            </h3>
            <p className={cn(commonStyles.bentoDesc, themeStyles.bentoDesc)}>
              Ground your project budgets in real market indices. Generate client proposals, calculate hourly rates, and structure milestones in seconds.
            </p>

            {/* Mini Interactive Estimator Preview */}
            <div className={cn(commonStyles.toolMiniPreview, themeStyles.toolMiniPreview)}>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Project Budget</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">$3,400 – $4,800</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                <span>3 Suggested Milestones</span>
                <span>~60 Dev Hours</span>
              </div>
            </div>
          </div>

          <div className={commonStyles.cardContentBottom}>
            <Link href="#ai-tools" className={cn(commonStyles.bentoBtn, themeStyles.bentoBtnSecondary)}>
              <span>Explore 11 Free Tools</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Bento Tile 3: Freelancers Keep 100% */}
        <div className={cn(commonStyles.bentoCard, themeStyles.bentoCard)}>
          <div className={commonStyles.cardContentTop}>
            <div className={commonStyles.pillRow}>
              <span className={cn(commonStyles.pill, themeStyles.pillSuccess)}>
                <Zap size={12} className="text-emerald-500" /> Keep 100% of Earnings
              </span>
            </div>

            <h3 className={cn(commonStyles.bentoTitle, themeStyles.bentoTitle)}>
              Find High-Value Work with Guaranteed Escrow
            </h3>
            <p className={cn(commonStyles.bentoDesc, themeStyles.bentoDesc)}>
              No bidding wars or hidden fees. Win contracts with AI-assisted proposals and receive guaranteed milestone payouts directly to your bank or crypto wallet.
            </p>

            <ul className={commonStyles.miniCheckList}>
              <li className={commonStyles.miniCheckItem}>
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Zero commission taken from your earnings</span>
              </li>
              <li className={commonStyles.miniCheckItem}>
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Pre-funded milestone escrow on every contract</span>
              </li>
              <li className={commonStyles.miniCheckItem}>
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>AI-powered proposal generator to boost win rates</span>
              </li>
            </ul>
          </div>

          <div className={commonStyles.cardContentBottom}>
            <Link href="/explore" className={cn(commonStyles.bentoBtn, themeStyles.bentoBtnSecondary)}>
              <span>Find Freelance Projects</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
