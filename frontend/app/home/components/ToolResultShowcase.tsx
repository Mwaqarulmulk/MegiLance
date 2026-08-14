'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { DollarSign, FileText, Layers, TrendingUp, CheckCircle2, ArrowRight, Sparkles, Clock, Shield } from 'lucide-react';
import commonStyles from './ToolResultShowcase.common.module.css';
import lightStyles from './ToolResultShowcase.light.module.css';
import darkStyles from './ToolResultShowcase.dark.module.css';

const exampleTabs = [
  {
    id: 'pricing',
    name: 'Price Estimator',
    icon: DollarSign,
    sampleInput: 'Full-Stack Next.js 16 SaaS Dashboard with Stripe Billing & AI API Integration',
    result: {
      title: 'AI Market Budget & Timeline Estimate',
      range: '$3,800 – $5,600',
      avgHours: '65 – 90 hours',
      suggestedRate: '$55 – $75/hr',
      milestones: [
        { name: 'Phase 1: Architecture & UI Setup', hours: '20h', cost: '$1,200' },
        { name: 'Phase 2: Auth, APIs & Stripe Billing', hours: '35h', cost: '$2,200' },
        { name: 'Phase 3: Testing, Deploy & Handover', hours: '15h', cost: '$900' },
      ],
      ctaText: 'Find Freelancers for this Scope',
      ctaHref: '/talent',
    },
  },
  {
    id: 'proposal',
    name: 'Proposal Writer',
    icon: FileText,
    sampleInput: 'Senior React Engineer needed to build real-time collaborative canvas application',
    result: {
      title: 'Generated Freelance Proposal Preview',
      hook: 'I specialize in building low-latency React canvas tools with WebSocket sync and optimistic state management...',
      deliverables: [
        'Interactive canvas with multi-user cursors & zoom controls',
        'State reconciliation layer with sub-50ms latency',
        'Comprehensive Playwright E2E & unit test coverage',
      ],
      milestonesCount: '3 milestones suggested',
      ctaText: 'Find Matching Projects',
      ctaHref: '/explore',
    },
  },
  {
    id: 'scope',
    name: 'Scope Planner',
    icon: Layers,
    sampleInput: 'Mobile E-Commerce App for iOS & Android with push notifications',
    result: {
      title: 'Milestone Work Breakdown Structure',
      range: '4 Milestones · 6 Weeks Delivery',
      avgHours: '120 Total Hours',
      suggestedRate: '2 Sprints (Bi-Weekly)',
      milestones: [
        { name: 'M1: Design Tokens & Core Navigation', hours: '30h', cost: '$1,800' },
        { name: 'M2: Catalog, Search & Cart State', hours: '40h', cost: '$2,400' },
        { name: 'M3: Checkout, Stripe & Order History', hours: '35h', cost: '$2,100' },
        { name: 'M4: App Store Submission & Polish', hours: '15h', cost: '$900' },
      ],
      ctaText: 'Create Project from Scope',
      ctaHref: '/create-project',
    },
  },
];

export default function ToolResultShowcase() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [activeTabId, setActiveTabId] = useState('pricing');

  const activeTab = exampleTabs.find((t) => t.id === activeTabId) || exampleTabs[0];

  return (
    <div className={cn(commonStyles.wrapper, themeStyles.wrapper)}>
      <div className={commonStyles.header}>
        <span className={cn(commonStyles.badge, themeStyles.badge)}>Live Result Demonstration</span>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>See How an AI Result Delivers Instant Clarity</h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          Try our tools with zero signup. Get data-grounded estimates, actionable milestone breakdowns, and structured proposals in seconds.
        </p>
      </div>

      {/* Tabs */}
      <div className={commonStyles.tabList} role="tablist">
        {exampleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(commonStyles.tabBtn, themeStyles.tabBtn, isActive && themeStyles.tabBtnActive)}
            >
              <Icon size={18} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Showcase Card */}
      <div className={cn(commonStyles.showcaseCard, themeStyles.showcaseCard)}>
        <div className={commonStyles.inputBar}>
          <span className={commonStyles.inputLabel}>Example Input:</span>
          <span className={cn(commonStyles.inputText, themeStyles.inputText)}>"{activeTab.sampleInput}"</span>
        </div>

        <div className={commonStyles.resultBody}>
          <div className={commonStyles.resultHeader}>
            <div>
              <span className={cn(commonStyles.resultBadge, themeStyles.resultBadge)}>
                <Sparkles size={14} className="inline mr-1 text-amber-500" /> AI Generated Result
              </span>
              <h3 className={cn(commonStyles.resultTitle, themeStyles.resultTitle)}>{activeTab.result.title}</h3>
            </div>
            {activeTab.result.range && (
              <div className={commonStyles.estimateHighlight}>
                <span className={commonStyles.estimateValue}>{activeTab.result.range}</span>
                <span className={commonStyles.estimateMeta}>{activeTab.result.avgHours}</span>
              </div>
            )}
          </div>

          {activeTab.id === 'proposal' ? (
            <div className={commonStyles.proposalContent}>
              <div className={cn(commonStyles.proposalBox, themeStyles.proposalBox)}>
                <p className={commonStyles.proposalHook}>"{activeTab.result.hook}"</p>
                <div className={commonStyles.deliverablesTitle}>Proposed Milestones &amp; Deliverables:</div>
                <ul className={commonStyles.deliverablesList}>
                  {activeTab.result.deliverables?.map((del, i) => (
                    <li key={i} className={commonStyles.deliverableItem}>
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className={commonStyles.milestoneGrid}>
              {activeTab.result.milestones?.map((ms, idx) => (
                <div key={idx} className={cn(commonStyles.milestoneItem, themeStyles.milestoneItem)}>
                  <div className={commonStyles.msName}>{ms.name}</div>
                  <div className={commonStyles.msMeta}>
                    <span><Clock size={14} className="inline mr-1 opacity-70" />{ms.hours}</span>
                    <span className={commonStyles.msCost}>{ms.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className={cn(commonStyles.cardFooter, themeStyles.cardFooter)}>
            <div className={commonStyles.actionPrompt}>
              <Shield size={16} className="text-emerald-500" />
              <span>Ready to turn this estimate into real freelance work?</span>
            </div>
            <Link href={activeTab.result.ctaHref} className={cn(commonStyles.conversionBtn, themeStyles.conversionBtn)}>
              <span>{activeTab.result.ctaText}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
