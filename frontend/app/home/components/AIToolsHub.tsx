'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  DollarSign, 
  FileText, 
  Brain, 
  Shield, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Lock, 
  CreditCard, 
  Scale, 
  Bot,
  Zap,
  CheckCircle2
} from 'lucide-react';
import commonStyles from './AIToolsHub.common.module.css';
import lightStyles from './AIToolsHub.light.module.css';
import darkStyles from './AIToolsHub.dark.module.css';

type CategoryFilter = 'all' | 'pricing' | 'proposals' | 'contracts';

const tools = [
  { 
    id: 'price-estimator',
    icon: DollarSign, 
    label: 'AI Price Estimator', 
    desc: 'Calculate market budgets, developer hours, and milestones based on live scope indices.', 
    href: '/ai/price-estimator', 
    category: 'pricing',
    badge: 'Popular',
    color: '#3b82f6' 
  },
  { 
    id: 'proposal-writer',
    icon: FileText, 
    label: 'AI Proposal Writer', 
    desc: 'Generate high-converting freelance proposals with structured deliverables and milestones.', 
    href: '/ai/proposal-writer', 
    category: 'proposals',
    badge: 'High Win-Rate',
    color: '#8b5cf6' 
  },
  { 
    id: 'rate-advisor',
    icon: TrendingUp, 
    label: 'Freelance Rate Advisor', 
    desc: 'Determine fair, location-adjusted hourly and fixed project rates for your specialization.', 
    href: '/ai/rate-advisor', 
    category: 'pricing',
    badge: 'Data-Backed',
    color: '#10b981' 
  },
  { 
    id: 'scope-planner',
    icon: Layers, 
    label: 'Milestone Scope Planner', 
    desc: 'Break complex client briefs into clear deliverables, sprint timelines, and WBS milestones.', 
    href: '/ai/scope-planner', 
    category: 'pricing',
    badge: 'Essential',
    color: '#06b6d4' 
  },
  { 
    id: 'contract-builder',
    icon: Lock, 
    label: 'Milestone Contract Builder', 
    desc: 'Generate legally solid freelance contracts with milestone escrow terms and IP clauses.', 
    href: '/tools/contract-builder', 
    category: 'contracts',
    badge: 'Legal Grade',
    color: '#6366f1' 
  },
  { 
    id: 'invoice-generator',
    icon: CreditCard, 
    label: 'Smart Invoice Generator', 
    desc: 'Create professional, multi-currency invoices with automatic tax and discount calculations.', 
    href: '/ai/invoice-generator', 
    category: 'contracts',
    badge: 'Instant PDF',
    color: '#f59e0b' 
  },
  { 
    id: 'skill-analyzer',
    icon: Brain, 
    label: 'Skill & Growth Analyzer', 
    desc: 'Map your freelance skills against active global marketplace demand to optimize rates.', 
    href: '/ai/skill-analyzer', 
    category: 'proposals',
    badge: 'Career Growth',
    color: '#ec4899' 
  },
  { 
    id: 'fraud-check',
    icon: Shield, 
    label: 'Risk & Scam Checker', 
    desc: 'Scan job posts and communications for scam indicators and payment risk red flags.', 
    href: '/ai/fraud-check', 
    category: 'contracts',
    badge: 'Security',
    color: '#ef4444' 
  },
];

export default function AIToolsHub() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredTools = activeCategory === 'all' 
    ? tools 
    : tools.filter(t => t.category === activeCategory);

  return (
    <section className={cn(commonStyles.section, themeStyles.section)} aria-label="Free AI Freelance Tools Hub">
      <div className={commonStyles.container}>
        
        <div className={commonStyles.header}>
          <span className={cn(commonStyles.badge, themeStyles.badge)}>
            <Sparkles size={14} className="text-amber-500" />
            11 Free Productivity Tools
          </span>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>
            Instant AI Tools to Price, Plan &amp; Protect Your Work
          </h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Zero signup required. Run calculations, generate contracts, or write proposals in seconds before hiring or bidding on MegiLance.
          </p>

          {/* Filter Navigation Tabs */}
          <div className={commonStyles.filterTabs} role="tablist" aria-label="Tool Categories">
            {[
              { key: 'all', label: 'All Tools' },
              { key: 'pricing', label: 'Pricing & Scoping' },
              { key: 'proposals', label: 'Proposals & Pitching' },
              { key: 'contracts', label: 'Contracts & Safety' },
            ].map((tab) => {
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(tab.key as CategoryFilter)}
                  className={cn(
                    commonStyles.filterBtn, 
                    themeStyles.filterBtn, 
                    isActive && themeStyles.filterBtnActive
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Bento Grid */}
        <div className={commonStyles.toolsGrid}>
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={cn(commonStyles.toolCard, themeStyles.toolCard)}
                style={{ '--accent-color': tool.color } as React.CSSProperties}
              >
                <div className={commonStyles.cardTop}>
                  <div 
                    className={commonStyles.iconWrap}
                    style={{ '--accent-color': tool.color } as React.CSSProperties}
                  >
                    <Icon size={22} />
                  </div>
                  <span className={cn(commonStyles.toolBadge, themeStyles.toolBadge)}>
                    {tool.badge}
                  </span>
                </div>

                <h3 className={cn(commonStyles.toolTitle, themeStyles.toolTitle)}>
                  {tool.label}
                </h3>
                <p className={cn(commonStyles.toolDesc, themeStyles.toolDesc)}>
                  {tool.desc}
                </p>

                <div className={commonStyles.cardBottom}>
                  <span className={cn(commonStyles.useToolLink, themeStyles.useToolLink)}>
                    Launch Tool Free <ArrowRight size={14} className={commonStyles.arrowIcon} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Hub Link */}
        <div className={commonStyles.ctaWrapper}>
          <Link href="/ai" className={cn(commonStyles.allToolsBtn, themeStyles.allToolsBtn)}>
            <span>Browse Full Suite of 11 Free Tools</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
