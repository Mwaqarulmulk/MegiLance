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
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';
import commonStyles from './AIToolsHub.common.module.css';
import lightStyles from './AIToolsHub.light.module.css';
import darkStyles from './AIToolsHub.dark.module.css';

type CategoryFilter = 'all' | 'pricing' | 'proposals' | 'contracts';

const leftTools = [
  { 
    id: 'price-estimator',
    icon: DollarSign, 
    label: 'AI Price Estimator', 
    desc: 'Estimate a practical budget range, effort, and milestone shape from your project brief.', 
    href: '/ai/price-estimator', 
    category: 'pricing',
    badge: 'Popular',
    color: '#3b82f6',
    runs: '18k+ runs'
  },
  { 
    id: 'proposal-writer',
    icon: FileText, 
    label: 'AI Proposal Writer', 
    desc: 'Turn your experience and project understanding into a clear proposal with deliverables and milestones.', 
    href: '/ai/proposal-writer', 
    category: 'proposals',
    badge: 'Proposal structure',
    color: '#8b5cf6',
    runs: '24k+ runs'
  },
  { 
    id: 'rate-advisor',
    icon: TrendingUp, 
    label: 'Freelance Rate Advisor', 
    desc: 'Determine fair, location-adjusted hourly and fixed project rates for your specialization.', 
    href: '/ai/rate-advisor', 
    category: 'pricing',
    badge: 'Data-Backed',
    color: '#10b981',
    runs: '12k+ runs'
  },
];

const rightTools = [
  { 
    id: 'scope-planner',
    icon: Layers, 
    label: 'Milestone Scope Planner', 
    desc: 'Break complex client briefs into clear deliverables, sprint timelines, and WBS milestones.', 
    href: '/ai/scope-planner', 
    category: 'pricing',
    badge: 'Essential',
    color: '#06b6d4',
    runs: '9k+ runs'
  },
  { 
    id: 'contract-builder',
    icon: Lock, 
    label: 'Milestone Contract Builder', 
    desc: 'Draft a contract starting point with milestone, payment, and IP terms to review before signing.', 
    href: '/tools/contract-builder', 
    category: 'contracts',
    badge: 'Contract basics',
    color: '#6366f1',
    runs: '14k+ runs'
  },
  { 
    id: 'fraud-check',
    icon: Shield, 
    label: 'Risk & Scam Checker', 
    desc: 'Check a job post or message for common scam signals and payment-risk red flags.', 
    href: '/ai/fraud-check', 
    category: 'contracts',
    badge: 'Security',
    color: '#ef4444',
    runs: '15k+ runs'
  },
];

const secondaryTools = [
  { 
    id: 'invoice-generator',
    icon: CreditCard, 
    label: 'Smart Invoice Generator', 
    desc: 'Create professional, multi-currency invoices with automatic tax and discount calculations.', 
    href: '/ai/invoice-generator', 
    badge: 'Instant PDF',
    color: '#f59e0b',
  },
  { 
    id: 'skill-analyzer',
    icon: Brain, 
    label: 'Skill & Growth Analyzer', 
    desc: 'Map your freelance skills against active global marketplace demand to optimize rates.', 
    href: '/ai/skill-analyzer', 
    badge: 'Career Growth',
    color: '#ec4899',
  },
  { 
    id: 'expense-calculator',
    icon: Scale, 
    label: 'Tax & Net Profit Calculator', 
    desc: 'Calculate estimated tax deductions, operating expenses, and net take-home earnings.', 
    href: '/ai/expense-calculator', 
    badge: 'Finance',
    color: '#14b8a6',
  },
];

export default function AIToolsHub() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filterTool = (tool: { category?: string }) => {
    if (activeCategory === 'all') return true;
    return tool.category === activeCategory;
  };

  return (
    <section className={cn(commonStyles.section, themeStyles.section)} aria-label="Free AI Freelance Tools Hub">
      <div className={commonStyles.container}>
        
        {/* Section Header */}
        <div className={commonStyles.header}>
          <div className={cn(commonStyles.badge, themeStyles.badge)}>
            <Sparkles size={13} className="text-amber-500" />
            <span>Free tools for clearer decisions · No signup to explore</span>
          </div>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>
            Practical tools for pricing, planning, and safer work
          </h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Explore the tools first, then decide when you are ready to create an account. Turn a rough brief into clearer scope, budget, milestones, and communication.
          </p>

          {/* Filter Navigation Tabs */}
          <div className={cn(commonStyles.filterTabs, themeStyles.filterTabs)} role="tablist" aria-label="Tool Categories">
            {[
              { key: 'all', label: 'All AI Tools' },
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

        {/* ── Central Lottie Hub with Surrounding Orbiting Tools ── */}
        <div className={commonStyles.orbitContainer}>
          
          {/* Left Wing Tools */}
          <div className={commonStyles.wingColumn}>
            {leftTools.filter(filterTool).map((tool) => {
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
                      <Icon size={20} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(commonStyles.runsTag, themeStyles.runsTag)}>{tool.runs}</span>
                      <span className={cn(commonStyles.toolBadge, themeStyles.toolBadge)}>{tool.badge}</span>
                    </div>
                  </div>

                  <h3 className={cn(commonStyles.toolTitle, themeStyles.toolTitle)}>{tool.label}</h3>
                  <p className={cn(commonStyles.toolDesc, themeStyles.toolDesc)}>{tool.desc}</p>

                  <div className={commonStyles.cardBottom}>
                    <span className={cn(commonStyles.useToolLink, themeStyles.useToolLink)}>
                      <span>Launch Free Tool</span>
                      <ArrowRight size={13} className={commonStyles.arrowIcon} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Center Glowing Lottie AI Brain Animation Core */}
          <div className={cn(commonStyles.centerHub, themeStyles.centerHub)}>
            <div className={commonStyles.centerGlowRing} aria-hidden="true" />
            
            <div className={commonStyles.lottieWrapper}>
              <BrandLottiePlayer
                src="/lottie/ai-brain.json"
                ariaLabel="MegiLance AI Brain Core"
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64"
                glow={true}
              />
            </div>

            <div className={cn(commonStyles.centerCardContent, themeStyles.centerCardContent)}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Tools designed around real project decisions</span>
              </div>
              <h3 className={cn(commonStyles.centerHubTitle, themeStyles.centerHubTitle)}>
                MegiLance decision toolkit
              </h3>
              <p className={cn(commonStyles.centerHubSubtitle, themeStyles.centerHubSubtitle)}>
                Built to help you reason through scope, rates, proposals, and delivery risks. Review every suggestion before you act.
              </p>
              <Link href="/ai" className={cn(commonStyles.centerHubCta, themeStyles.centerHubCta)}>
                <span>See all tools</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Wing Tools */}
          <div className={commonStyles.wingColumn}>
            {rightTools.filter(filterTool).map((tool) => {
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
                      <Icon size={20} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(commonStyles.runsTag, themeStyles.runsTag)}>{tool.runs}</span>
                      <span className={cn(commonStyles.toolBadge, themeStyles.toolBadge)}>{tool.badge}</span>
                    </div>
                  </div>

                  <h3 className={cn(commonStyles.toolTitle, themeStyles.toolTitle)}>{tool.label}</h3>
                  <p className={cn(commonStyles.toolDesc, themeStyles.toolDesc)}>{tool.desc}</p>

                  <div className={commonStyles.cardBottom}>
                    <span className={cn(commonStyles.useToolLink, themeStyles.useToolLink)}>
                      <span>Launch Free Tool</span>
                      <ArrowRight size={13} className={commonStyles.arrowIcon} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>

        {/* Bottom Secondary Tools Row */}
        <div className={commonStyles.secondaryGrid}>
          {secondaryTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={cn(commonStyles.secondaryCard, themeStyles.secondaryCard)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={commonStyles.secondaryIconWrap}
                    style={{ background: `color-mix(in srgb, ${tool.color} 15%, transparent)`, color: tool.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={cn(commonStyles.secondaryTitle, themeStyles.secondaryTitle)}>{tool.label}</h4>
                      <span className={cn(commonStyles.secondaryBadge, themeStyles.secondaryBadge)}>{tool.badge}</span>
                    </div>
                    <p className={cn(commonStyles.secondaryDesc, themeStyles.secondaryDesc)}>{tool.desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
              </Link>
            );
          })}
        </div>

        {/* Footer Hub Link */}
        <div className={commonStyles.ctaWrapper}>
          <Link href="/ai" className={cn(commonStyles.allToolsBtn, themeStyles.allToolsBtn)}>
            Explore the complete free toolkit
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
