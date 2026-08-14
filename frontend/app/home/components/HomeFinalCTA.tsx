'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Sparkles, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
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
        <span className={cn(commonStyles.badge, themeStyles.badge)}>
          <Sparkles size={14} className="inline mr-1 text-amber-500" />
          {PLATFORM_STATUS.STAGE}
        </span>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>
          Start with a Useful AI Result. Continue with Real Freelance Work.
        </h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          Price your project, write your proposal, or plan your milestones with free AI tools. When you're ready to hire or find work, continue directly on MegiLance.
        </p>

        <div className={commonStyles.actions}>
          <Link href="#ai-tools" className={cn(commonStyles.primaryBtn, themeStyles.primaryBtn)}>
            <Sparkles size={18} />
            <span>Use Free AI Tools</span>
          </Link>
          <Link href="/signup" className={cn(commonStyles.secondaryBtn, themeStyles.secondaryBtn)}>
            <UserPlus size={18} />
            <span>Create Free Account</span>
          </Link>
        </div>

        <div className={commonStyles.trustRow}>
          <div className={commonStyles.trustItem}>
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Milestone Escrow Protection</span>
          </div>
          <div className={commonStyles.trustItem}>
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>0% Platform Fee During Launch</span>
          </div>
          <div className={commonStyles.trustItem}>
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>No Credit Card Required for AI Tools</span>
          </div>
        </div>
      </div>
    </div>
  );
}
