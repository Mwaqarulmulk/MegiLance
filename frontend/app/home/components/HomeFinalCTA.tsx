'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Sparkles, ArrowRight, ShieldCheck, UserPlus, Briefcase, Zap, CheckCircle2 } from 'lucide-react';
import { PRICING_CONFIG, PLATFORM_STATUS } from '@/lib/platform-config';
import commonStyles from './HomeFinalCTA.common.module.css';
import lightStyles from './HomeFinalCTA.light.module.css';
import darkStyles from './HomeFinalCTA.dark.module.css';

export default function HomeFinalCTA() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.wrapper, themeStyles.wrapper)}>
      <div className={cn(commonStyles.card, themeStyles.card)}>
        
        {/* Radiant Aurora Glow */}
        <div className={commonStyles.auroraGlow} aria-hidden="true" />

        <div className={commonStyles.content}>
          <span className={cn(commonStyles.badge, themeStyles.badge)}>
            <Zap size={14} className="text-amber-300" />
            0% Platform Fee · Guaranteed Milestone Escrow
          </span>

          <h2 className={cn(commonStyles.title, themeStyles.title)}>
            Ready to Build, Hire, or Freelance with Complete Protection?
          </h2>

          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Join thousands of clients and specialists using free AI planning tools, verified talent matching, and secure milestone escrow.
          </p>

          <div className={commonStyles.actions}>
            <Link href="/create-project" className={cn(commonStyles.primaryBtn, themeStyles.primaryBtn)}>
              <Briefcase size={18} />
              <span>Post a Project Free</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="#ai-tools" className={cn(commonStyles.secondaryBtn, themeStyles.secondaryBtn)}>
              <Sparkles size={18} className="text-amber-300" />
              <span>Explore 11 Free AI Tools</span>
            </Link>
          </div>

          <div className={commonStyles.trustRow}>
            <div className={commonStyles.trustItem}>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>100% Pre-Funded Milestone Escrow</span>
            </div>
            <div className={commonStyles.trustItem}>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>0% Promotional Platform Cut</span>
            </div>
            <div className={commonStyles.trustItem}>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Instant Multi-Currency Payouts</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
