'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Sparkles, ArrowRight, ShieldCheck, UserPlus, Briefcase, Zap, CheckCircle2, Lock } from 'lucide-react';
import commonStyles from './HomeFinalCTA.common.module.css';
import lightStyles from './HomeFinalCTA.light.module.css';
import darkStyles from './HomeFinalCTA.dark.module.css';

export default function HomeFinalCTA() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.wrapper, themeStyles.wrapper)}>
      <div className={cn(commonStyles.card, themeStyles.card)}>
        
        {/* Radiant Aurora Ambient Glow */}
        <div className={commonStyles.auroraGlow} aria-hidden="true" />

        <div className={commonStyles.content}>
          <div className={cn(commonStyles.badge, themeStyles.badge)}>
            <Zap size={13} className="text-amber-300" />
            <span>0% Promotional Platform Fee · Guaranteed Milestone Escrow</span>
          </div>

          <h2 className={cn(commonStyles.title, themeStyles.title)}>
            Ready to Build, Hire, or Freelance with Complete Financial Protection?
          </h2>

          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Join thousands of clients and verified specialists using free AI scoping tools, meritocratic talent matching, and code-enforced milestone escrow.
          </p>

          <div className={commonStyles.actions}>
            <Link href="/create-project" className={cn(commonStyles.primaryBtn, themeStyles.primaryBtn)}>
              <Briefcase size={17} />
              <span>Post a Project Free</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="#ai-tools" className={cn(commonStyles.secondaryBtn, themeStyles.secondaryBtn)}>
              <Sparkles size={17} className="text-amber-300" />
              <span>Explore 11 Free AI Tools</span>
            </Link>
          </div>

          <div className={commonStyles.trustRow}>
            <div className={commonStyles.trustItem}>
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>100% Pre-Funded Milestone Escrow</span>
            </div>
            <div className={commonStyles.trustItem}>
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>0% Promotional Platform Cut</span>
            </div>
            <div className={commonStyles.trustItem}>
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Instant Multi-Currency Payouts</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
