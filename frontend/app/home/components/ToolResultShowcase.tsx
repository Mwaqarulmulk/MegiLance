'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  DollarSign, 
  FileText, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Shield, 
  Copy, 
  Check,
  Zap,
  Sliders,
  Code2,
  Bot
} from 'lucide-react';
import commonStyles from './ToolResultShowcase.common.module.css';
import lightStyles from './ToolResultShowcase.light.module.css';
import darkStyles from './ToolResultShowcase.dark.module.css';

const exampleTabs = [
  {
    id: 'pricing',
    name: 'AI Price Estimator',
    icon: DollarSign,
    sampleInput: 'Full-Stack Next.js 16 SaaS Platform with Stripe Escrow, Auth & AI API Integration',
    result: {
      title: 'Market Budget & Milestone Breakdown',
      range: '$3,800 – $5,600',
      avgHours: '70 – 95 hours',
      suggestedRate: '$55 – $75/hr (Senior Full-Stack)',
      confidence: '98% Data Grounded',
      milestones: [
        { name: 'Milestone 1: Architecture & UI Setup', hours: '25h', cost: '$1,400', status: 'Pre-Funded Escrow' },
        { name: 'Milestone 2: Auth, APIs & Stripe Billing', hours: '40h', cost: '$2,400', status: 'In Scope' },
        { name: 'Milestone 3: E2E Testing, Deploy & Handover', hours: '20h', cost: '$1,200', status: 'In Scope' },
      ],
      ctaText: 'Hire Freelancers for this Scope',
      ctaHref: '/talent',
    },
  },
  {
    id: 'proposal',
    name: 'AI Proposal Writer',
    icon: FileText,
    sampleInput: 'Senior React / Next.js Engineer needed to build real-time collaborative canvas app',
    result: {
      title: 'High-Impact Tailored Freelance Proposal',
      range: 'Expected Win Rate: Top 5%',
      avgHours: 'Structured in 3 Milestones',
      suggestedRate: 'Ready to Submit',
      confidence: 'High-Converting Format',
      hook: 'I specialize in building low-latency React canvas tools with WebSocket sync and optimistic state management...',
      deliverables: [
        'Interactive canvas with multi-user cursors & zoom controls',
        'State reconciliation layer with sub-50ms latency',
        'Comprehensive Playwright E2E & unit test coverage',
      ],
      ctaText: 'Find Matching Projects',
      ctaHref: '/explore',
    },
  },
  {
    id: 'scope',
    name: 'Milestone Scope Planner',
    icon: Layers,
    sampleInput: 'Cross-Platform Mobile App for iOS & Android with Push Notifications and Stripe Checkout',
    result: {
      title: 'Milestone Work Breakdown Structure (WBS)',
      range: '4 Milestones · 6 Weeks Delivery',
      avgHours: '120 Total Hours',
      suggestedRate: '2 Sprints (Bi-Weekly)',
      confidence: 'Standardized Milestones',
      milestones: [
        { name: 'M1: Design Tokens & Core Navigation', hours: '30h', cost: '$1,800', status: 'Milestone 1' },
        { name: 'M2: Catalog, Search & Cart State', hours: '40h', cost: '$2,400', status: 'Milestone 2' },
        { name: 'M3: Checkout, Stripe & Order History', hours: '35h', cost: '$2,100', status: 'Milestone 3' },
        { name: 'M4: App Store Submission & QA Polish', hours: '15h', cost: '$900', status: 'Milestone 4' },
      ],
      ctaText: 'Post Project with this Scope',
      ctaHref: '/create-project',
    },
  },
];

export default function ToolResultShowcase() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [activeTabId, setActiveTabId] = useState('pricing');
  const [copied, setCopied] = useState(false);

  const activeTab = exampleTabs.find((t) => t.id === activeTabId) || exampleTabs[0];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(commonStyles.wrapper, themeStyles.wrapper)}>
      
      {/* Section Header */}
      <div className={commonStyles.header}>
        <div className={cn(commonStyles.badge, themeStyles.badge)}>
          <Sparkles size={13} className="text-amber-500" />
          <span>Interactive Output Sandbox</span>
        </div>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>
          See How Data-Grounded AI Delivers Instant Clarity
        </h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          Try sample outputs generated from 50,000+ real marketplace contracts. Factual budgets, structured milestones, and zero guesswork.
        </p>
      </div>

      {/* Switcher Tabs */}
      <div className={commonStyles.tabList} role="tablist" aria-label="Tool Result Demonstrations">
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
              <Icon size={16} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Showcase Card Frame */}
      <div className={cn(commonStyles.showcaseCard, themeStyles.showcaseCard)}>
        
        {/* Input Bar */}
        <div className={cn(commonStyles.inputBar, themeStyles.inputBar)}>
          <div className="flex items-center gap-2 flex-1">
            <span className={commonStyles.inputLabel}>Input Brief:</span>
            <span className={cn(commonStyles.inputText, themeStyles.inputText)}>"{activeTab.sampleInput}"</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(commonStyles.copyBtn, themeStyles.copyBtn)}
            aria-label="Copy sample result"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Sample Result'}</span>
          </button>
        </div>

        {/* Result Content Body */}
        <div className={commonStyles.resultBody}>
          <div className={commonStyles.resultHeader}>
            <div>
              <span className={cn(commonStyles.resultBadge, themeStyles.resultBadge)}>
                <Sparkles size={12} className="text-amber-500" /> {activeTab.result.confidence}
              </span>
              <h3 className={cn(commonStyles.resultTitle, themeStyles.resultTitle)}>{activeTab.result.title}</h3>
            </div>
            {activeTab.result.range && (
              <div className={cn(commonStyles.estimateHighlight, themeStyles.estimateHighlight)}>
                <span className={commonStyles.estimateValue}>{activeTab.result.range}</span>
                <span className={commonStyles.estimateMeta}>{activeTab.result.avgHours}</span>
              </div>
            )}
          </div>

          {activeTab.id === 'proposal' ? (
            <div className={commonStyles.proposalBox}>
              <p className={commonStyles.proposalHook}>"{activeTab.result.hook}"</p>
              <div className={commonStyles.deliverablesTitle}>Proposed Deliverables &amp; Milestones:</div>
              <ul className={commonStyles.deliverablesList}>
                {activeTab.result.deliverables?.map((del, i) => (
                  <li key={i} className={commonStyles.deliverableItem}>
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className={commonStyles.milestoneGrid}>
              {activeTab.result.milestones?.map((ms, idx) => (
                <div key={idx} className={cn(commonStyles.milestoneItem, themeStyles.milestoneItem)}>
                  <div className={commonStyles.msTop}>
                    <div className={commonStyles.msName}>{ms.name}</div>
                    <span className={cn(commonStyles.msStatusPill, themeStyles.msStatusPill)}>{ms.status}</span>
                  </div>
                  <div className={commonStyles.msMeta}>
                    <span><Clock size={13} className="inline mr-1 opacity-70" />{ms.hours}</span>
                    <span className={commonStyles.msCost}>{ms.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className={cn(commonStyles.cardFooter, themeStyles.cardFooter)}>
            <div className={commonStyles.actionPrompt}>
              <Shield size={16} className="text-emerald-500 flex-shrink-0" />
              <span>Ready to convert this calculation into a protected milestone contract?</span>
            </div>
            <Link href={activeTab.result.ctaHref} className={cn(commonStyles.conversionBtn, themeStyles.conversionBtn)}>
              <span>{activeTab.result.ctaText}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
