'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  Sparkles, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  Zap, 
  Layers, 
  ChevronRight, 
  Users, 
  FileCheck, 
  Lock, 
  DollarSign,
  LucideIcon
} from 'lucide-react';
import commonStyles from './AIResultToWork.common.module.css';
import lightStyles from './AIResultToWork.light.module.css';
import darkStyles from './AIResultToWork.dark.module.css';

interface Stage {
  step: string;
  id: string;
  title: string;
  tag: string;
  icon: LucideIcon;
  headline: string;
  description: string;
  highlight: string;
  actionText: string;
  actionHref: string;
  preview: {
    type: 'scope' | 'project' | 'matching' | 'escrow';
    badge: string;
    metrics: { label: string; val: string }[];
    details: string[];
  };
}

const STAGES: Stage[] = [
  {
    step: '01',
    id: 'ai-scope',
    title: 'Instant AI Scoping',
    tag: 'Free · Zero Signup',
    icon: Sparkles,
    headline: '1. Model Project Scopes & Budgets in Seconds',
    description: 'Use the AI Price Estimator and Scope Planner to generate fact-based milestone scopes, realistic developer hours, and market-calibrated budgets from your brief.',
    highlight: 'Data-calibrated from 50,000+ real marketplace contracts',
    actionText: 'Try AI Price Estimator Free',
    actionHref: '/ai/price-estimator',
    preview: {
      type: 'scope',
      badge: 'Calibrated WBS Output',
      metrics: [
        { label: 'Market Budget', val: '$3,800 – $5,400' },
        { label: 'Est. Timeline', val: '65 – 85 Hours' },
        { label: 'Confidence', val: '98% Data-Backed' },
      ],
      details: [
        'Milestone 1: Design Tokens & Next.js 16 Scaffold ($1,200)',
        'Milestone 2: FastAPI Auth & Stripe Escrow Logic ($2,400)',
        'Milestone 3: E2E Playwright Tests & Handover ($1,200)',
      ],
    },
  },
  {
    step: '02',
    id: 'convert-project',
    title: '1-Click Conversion',
    tag: 'Frictionless',
    icon: Layers,
    headline: '2. Convert Scope Directly into a Marketplace Brief',
    description: 'Instantly publish your generated work breakdown structure into an active project listing without retyping deliverables or milestones.',
    highlight: 'Pre-structured milestones prevent scope creep before work starts',
    actionText: 'Post a Project Free',
    actionHref: '/create-project',
    preview: {
      type: 'project',
      badge: 'Live Marketplace Project',
      metrics: [
        { label: 'Status', val: 'Accepting Proposals' },
        { label: 'Platform Fee', val: '0% Launch Cut' },
        { label: 'Escrow Ready', val: '100% Pre-Funded' },
      ],
      details: [
        'Client: Verified Tech Lead (United States)',
        'Deliverable Terms: Code-Inspected Milestones',
        'Direct Workroom: Chat, commits & video checkpoints enabled',
      ],
    },
  },
  {
    step: '03',
    id: 'talent-match',
    title: '7-Factor Match',
    tag: 'Objective Rank',
    icon: Users,
    headline: '3. Match Top 1% Specialists with Zero Spam Bids',
    description: 'Our 7-factor engine analyzes past delivery velocity, verified repository code commits, client ratings, and hourly rates to rank the top 3 optimal specialists.',
    highlight: 'Eliminates hundreds of unqualified bids in under 15 minutes',
    actionText: 'Browse Top Talent',
    actionHref: '/talent',
    preview: {
      type: 'matching',
      badge: 'Top Ranked Specialist',
      metrics: [
        { label: 'Elena Popova', val: '99% Match' },
        { label: 'Rate', val: '$75/hr' },
        { label: 'Completed', val: '42 Milestones' },
      ],
      details: [
        'Skills: Next.js 16, FastAPI, Turso DB, Stripe Escrow',
        'Verification: Identity & GitHub Verified',
        'Avg Milestone Speed: 4.2 days (Top 3% Platform-wide)',
      ],
    },
  },
  {
    step: '04',
    id: 'escrow-release',
    title: 'Milestone Escrow',
    tag: 'Guaranteed Payout',
    icon: Shield,
    headline: '4. Execute in Live Workrooms & Release on Approval',
    description: 'Funds are deposited into neutral milestone escrow. Specialists work with guaranteed payout, and clients release funds only after deliverable inspection.',
    highlight: '0% commission deducted — instant multi-currency settlement',
    actionText: 'Learn About Escrow Safety',
    actionHref: '/security/escrow',
    preview: {
      type: 'escrow',
      badge: 'Escrow Vault Status: Locked',
      metrics: [
        { label: 'Milestone 1', val: '$1,400.00 Released ✓' },
        { label: 'Milestone 2', val: '$2,400.00 In Escrow 🔒' },
        { label: 'Dispute Rate', val: '< 0.1% Platform-wide' },
      ],
      details: [
        'Source code & staging preview verified by client',
        'Instant payout sent to freelancer local bank account',
        '0% platform deductions applied',
      ],
    },
  },
];

export default function AIResultToWork() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const activeStage = STAGES[activeStageIndex];

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      
      {/* Section Header */}
      <div className={commonStyles.header}>
        <div className={cn(commonStyles.badge, themeStyles.badge)}>
          <Zap size={13} className="text-amber-500" />
          <span>Product Execution Lifecycle</span>
        </div>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>How an AI Result Becomes Real Work</h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          From initial cost scoping to final deliverable release — see how MegiLance turns AI productivity into protected, milestone-escrowed freelance execution.
        </p>
      </div>

      {/* Interactive Step Switcher Bar */}
      <div className={commonStyles.stageNav} role="tablist" aria-label="Lifecycle Stages">
        {STAGES.map((s, index) => {
          const Icon = s.icon;
          const isActive = activeStageIndex === index;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveStageIndex(index)}
              className={cn(
                commonStyles.stageTabBtn,
                themeStyles.stageTabBtn,
                isActive && commonStyles.stageTabBtnActive,
                isActive && themeStyles.stageTabBtnActive
              )}
            >
              <div className={commonStyles.stageTabHeader}>
                <span className={cn(commonStyles.stageTabNum, themeStyles.stageTabNum)}>{s.step}</span>
                <span className={cn(commonStyles.stageTabTag, themeStyles.stageTabTag)}>{s.tag}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Icon size={16} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                <span className={commonStyles.stageTabTitle}>{s.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Stage Detail & Live Simulator */}
      <div className={cn(commonStyles.stageCard, themeStyles.stageCard)}>
        <div className={commonStyles.stageGrid}>
          
          {/* Left Column: Stage Explanation */}
          <div className={commonStyles.stageLeft}>
            <div className={cn(commonStyles.stagePill, themeStyles.stagePill)}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeStage.highlight}</span>
            </div>

            <h3 className={cn(commonStyles.stageHeadline, themeStyles.stageHeadline)}>
              {activeStage.headline}
            </h3>

            <p className={cn(commonStyles.stageDesc, themeStyles.stageDesc)}>
              {activeStage.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href={activeStage.actionHref} className={cn(commonStyles.primaryBtn, themeStyles.primaryBtn)}>
                <span>{activeStage.actionText}</span>
                <ArrowRight size={15} />
              </Link>
              
              {activeStageIndex < STAGES.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStageIndex(activeStageIndex + 1)}
                  className={cn(commonStyles.nextStageBtn, themeStyles.nextStageBtn)}
                >
                  <span>Next Stage ({STAGES[activeStageIndex + 1].step})</span>
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Live Mockup Simulator */}
          <div className={cn(commonStyles.stageRight, themeStyles.stageRight)}>
            <div className={cn(commonStyles.simulatorCard, themeStyles.simulatorCard)}>
              
              {/* Simulator Card Header */}
              <div className={cn(commonStyles.simHeader, themeStyles.simHeader)}>
                <div className={commonStyles.simDots}>
                  <span className={commonStyles.dotRed} />
                  <span className={commonStyles.dotYellow} />
                  <span className={commonStyles.dotGreen} />
                </div>
                <span className={cn(commonStyles.simBadge, themeStyles.simBadge)}>
                  {activeStage.preview.badge}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className={commonStyles.metricsGrid}>
                {activeStage.preview.metrics.map((m, i) => (
                  <div key={i} className={cn(commonStyles.metricTile, themeStyles.metricTile)}>
                    <span className={commonStyles.metricLabel}>{m.label}</span>
                    <strong className={cn(commonStyles.metricVal, themeStyles.metricVal)}>{m.val}</strong>
                  </div>
                ))}
              </div>

              {/* Stage Specific Details List */}
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Verified Checkpoints:
                </span>
                {activeStage.preview.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Global Footer CTA */}
      <div className={commonStyles.footerCta}>
        <Link href="#ai-tools" className={cn(commonStyles.globalPrimaryBtn, themeStyles.globalPrimaryBtn)}>
          <Sparkles size={16} />
          <span>Start with a Free AI Tool</span>
          <ArrowRight size={16} />
        </Link>
        <Link href="/how-it-works" className={cn(commonStyles.globalSecondaryBtn, themeStyles.globalSecondaryBtn)}>
          <span>Read Complete Workflow Guide</span>
        </Link>
      </div>

    </div>
  );
}
