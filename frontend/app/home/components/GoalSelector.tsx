'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  Sparkles, 
  Users, 
  Briefcase, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  Zap, 
  Star, 
  Lock, 
  Calculator, 
  Layers,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import commonStyles from './GoalSelector.common.module.css';
import lightStyles from './GoalSelector.light.module.css';
import darkStyles from './GoalSelector.dark.module.css';

export default function GoalSelector() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      
      {/* Section Header */}
      <div className={commonStyles.header}>
        <div className={cn(commonStyles.badge, themeStyles.badge)}>
          <Zap size={13} className="text-amber-500" />
          <span>The MegiLance Operating Model</span>
        </div>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>
          Engineered for Clients Who Value Delivery &amp; Freelancers Who Deliver It
        </h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          From code-enforced milestone escrow to instant AI scoping tools — every layer is designed to remove friction, protect capital, and reward craft.
        </p>
      </div>

      {/* Asymmetric Bento Grid (Linear / Stripe Grade) */}
      <div className={commonStyles.bentoGrid}>
        
        {/* Bento Tile 1: Large Span - Milestone Escrow Vault */}
        <div className={cn(commonStyles.bentoTile, commonStyles.tileHero, themeStyles.bentoTile, themeStyles.tileHero)}>
          <div className={commonStyles.tileGlow} aria-hidden="true" />
          
          <div className={commonStyles.tileContentTop}>
            <div className={commonStyles.pillRow}>
              <span className={cn(commonStyles.pill, themeStyles.pillEscrow)}>
                <Shield size={12} className="text-emerald-500" /> 100% Pre-Funded Escrow
              </span>
              <span className={cn(commonStyles.pill, themeStyles.pillCommission)}>
                0% Platform Cut
              </span>
            </div>

            <h3 className={cn(commonStyles.tileTitle, themeStyles.tileTitle)}>
              Hire Top 1% Specialists with Code-Enforced Milestone Escrow
            </h3>
            <p className={cn(commonStyles.tileDesc, themeStyles.tileDesc)}>
              Never pay upfront without verification. Funds are deposited into a neutral escrow vault and released only when completed code or designs meet your agreed standards.
            </p>

            {/* Simulated Live Escrow Milestone Card */}
            <div className={cn(commonStyles.liveEscrowCard, themeStyles.liveEscrowCard)}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black">
                    EP
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Elena Popova</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        ⭐ Top Rated Plus
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Senior Full-Stack &amp; AI Architect</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white">$75/hr</span>
                  <span className="text-[9px] font-bold text-emerald-500 block">99% AI Match</span>
                </div>
              </div>

              {/* Live Escrow Status Strip */}
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Milestone 2: Stripe Escrow Handover</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">$1,800.00 Locked</strong>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full" style={{ width: '85%' }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400">
                  <span>Deliverable verified by client</span>
                  <span>Ready for Instant Release</span>
                </div>
              </div>
            </div>
          </div>

          <div className={commonStyles.tileBottom}>
            <Link href="/talent" className={cn(commonStyles.tileBtnPrimary, themeStyles.tileBtnPrimary)}>
              <span>Browse Vetted Specialists</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Bento Tile 2: AI Planning & Scoping Command Hub */}
        <div className={cn(commonStyles.bentoTile, themeStyles.bentoTile)}>
          <div className={commonStyles.tileContentTop}>
            <div className={commonStyles.pillRow}>
              <span className={cn(commonStyles.pill, themeStyles.pillAi)}>
                <Sparkles size={12} className="text-amber-500" /> 11 Free Tools · No Signup
              </span>
            </div>

            <h3 className={cn(commonStyles.tileTitle, themeStyles.tileTitle)}>
              Price &amp; Scope Projects with Real Market Data
            </h3>
            <p className={cn(commonStyles.tileDesc, themeStyles.tileDesc)}>
              Ground your project budgets in real historical deliverables. Calculate fair market rates, structure milestone sprint timelines, and generate high-impact proposals in seconds.
            </p>

            {/* Mini Scope Preview Widget */}
            <div className={cn(commonStyles.miniScopeWidget, themeStyles.miniScopeWidget)}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Project Total</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">$3,600 – $5,200</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>3 Sprint Milestones</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>~65 Total Dev Hours</span>
                </div>
              </div>
            </div>
          </div>

          <div className={commonStyles.tileBottom}>
            <Link href="#ai-tools" className={cn(commonStyles.tileBtnSecondary, themeStyles.tileBtnSecondary)}>
              <span>Explore 11 Free AI Tools</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Bento Tile 3: Freelancers Keep 100% */}
        <div className={cn(commonStyles.bentoTile, themeStyles.bentoTile)}>
          <div className={commonStyles.tileContentTop}>
            <div className={commonStyles.pillRow}>
              <span className={cn(commonStyles.pill, themeStyles.pillSuccess)}>
                <Zap size={12} className="text-emerald-500" /> Keep 100% of Earnings
              </span>
            </div>

            <h3 className={cn(commonStyles.tileTitle, themeStyles.tileTitle)}>
              Win High-Value Contracts with Zero Commission Cut
            </h3>
            <p className={cn(commonStyles.tileDesc, themeStyles.tileDesc)}>
              No bidding wars or hidden platform deductions. Use AI proposal builders to win contracts, work directly in dedicated rooms, and receive guaranteed payouts.
            </p>

            <ul className={commonStyles.checkList}>
              <li className={commonStyles.checkItem}>
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>0% commission deducted from your payouts</span>
              </li>
              <li className={commonStyles.checkItem}>
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Pre-funded milestone escrow on every active contract</span>
              </li>
              <li className={commonStyles.checkItem}>
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>AI proposal generator calibrated for high win rates</span>
              </li>
            </ul>
          </div>

          <div className={commonStyles.tileBottom}>
            <Link href="/explore" className={cn(commonStyles.tileBtnSecondary, themeStyles.tileBtnSecondary)}>
              <span>Find Freelance Projects</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
