'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Sparkles, ArrowRight, UserCheck, Shield, CheckCircle2, Zap, Layers } from 'lucide-react';
import commonStyles from './AIResultToWork.common.module.css';
import lightStyles from './AIResultToWork.light.module.css';
import darkStyles from './AIResultToWork.dark.module.css';

const steps = [
  {
    step: '01',
    title: 'Run a Free AI Tool',
    desc: 'Estimate project costs, write tailored proposals, or plan work breakdown milestones. Instant results with zero signup barrier.',
    icon: Sparkles,
  },
  {
    step: '02',
    title: 'Convert with One Click',
    desc: 'Turn your estimated scope into a marketplace project, or save your AI-crafted proposal directly to your freelancer profile.',
    icon: Layers,
  },
  {
    step: '03',
    title: 'Multi-Factor Matching',
    desc: 'Our 7-factor engine connects your requirements with verified freelancer skills, market rates, and availability.',
    icon: Zap,
  },
  {
    step: '04',
    title: 'Milestone Escrow & Delivery',
    desc: 'Work in real-time collaboration workrooms with pre-funded milestone escrow. Funds release only upon your deliverable approval.',
    icon: Shield,
  },
];

export default function AIResultToWork() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <span className={cn(commonStyles.badge, themeStyles.badge)}>Product Workflow</span>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>How an AI Result Becomes Real Work</h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          From initial cost scoping to final deliverable approval, MegiLance connects AI productivity seamlessly with freelance execution.
        </p>
      </div>

      <div className={commonStyles.stepsGrid}>
        {steps.map((s, index) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className={cn(commonStyles.stepCard, themeStyles.stepCard)}>
              <div className={commonStyles.stepTop}>
                <span className={cn(commonStyles.stepNum, themeStyles.stepNum)}>{s.step}</span>
                <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
                  <Icon size={20} />
                </div>
              </div>
              <h3 className={cn(commonStyles.stepTitle, themeStyles.stepTitle)}>{s.title}</h3>
              <p className={cn(commonStyles.stepDesc, themeStyles.stepDesc)}>{s.desc}</p>
            </div>
          );
        })}
      </div>

      <div className={commonStyles.footerCta}>
        <Link href="#ai-tools" className={cn(commonStyles.primaryBtn, themeStyles.primaryBtn)}>
          <Sparkles size={16} />
          <span>Start with a Free AI Tool</span>
        </Link>
        <Link href="/how-it-works" className={cn(commonStyles.secondaryBtn, themeStyles.secondaryBtn)}>
          <span>Read the Complete How It Works Guide</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
