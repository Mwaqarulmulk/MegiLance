'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { MessageSquare, DollarSign, FileText, Brain, Shield, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import commonStyles from './AIToolsHub.common.module.css';
import lightStyles from './AIToolsHub.light.module.css';
import darkStyles from './AIToolsHub.dark.module.css';

import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';

const tools = [
  { icon: MessageSquare, label: 'AI Chatbot', desc: 'Instant 24/7 support', href: '/ai/chatbot', color: '#4573df' },
  { icon: DollarSign, label: 'Price Estimator', desc: 'Data-driven pricing', href: '/ai/price-estimator', color: '#27AE60' },
  { icon: FileText, label: 'Proposal Writer', desc: 'Win more projects', href: '/ai/proposal-writer', color: '#ff9800' },
  { icon: Brain, label: 'Skill Analyzer', desc: 'Map your growth', href: '/ai/skill-analyzer', color: '#9B59B6' },
  { icon: Shield, label: 'Fraud Detector', desc: 'Stay protected', href: '/ai/fraud-check', color: '#e81123' },
  { icon: TrendingUp, label: 'Rate Advisor', desc: 'Earn what you deserve', href: '/ai/rate-advisor', color: '#00BCD4' },
];

const AIToolsHub: React.FC = () => {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.section, themeStyles.section)}>
      <div className={commonStyles.container}>
        <div className={commonStyles.header}>
          <span className={cn(commonStyles.badge, themeStyles.badge)}>
            <Sparkles size={13} />
            11 AI-powered tools
          </span>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>AI Tools Hub</h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Supercharge your workflow with intelligent tools built for modern freelancing.
          </p>
        </div>

        {/* Orbital Hub Layout: Central Lottie with surrounding cards */}
        <div className={commonStyles.hubWrapper}>
          {/* Central Lottie Core */}
          <div className={commonStyles.centerCore}>
            <BrandLottiePlayer
              src="/lottie/ai-brain.json"
              ariaLabel="AI Neural Matching Animation"
              className="w-full max-w-xs md:max-w-md h-52 md:h-64"
              glow={true}
            />
            <div className={commonStyles.corePulseRing} />
          </div>

          {/* Surrounding Cards Grid */}
          <div className={commonStyles.orbitalGrid}>
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className={cn(commonStyles.card, themeStyles.card, commonStyles[`cardPos${idx}`])}
                  style={{ '--tool-color': tool.color } as React.CSSProperties}
                >
                  <div
                    className={commonStyles.iconWrap}
                    style={{ '--tool-color': tool.color } as React.CSSProperties}
                  >
                    <Icon size={20} />
                  </div>
                  <div className={commonStyles.cardBody}>
                    <span className={cn(commonStyles.cardLabel, themeStyles.cardLabel)}>{tool.label}</span>
                    <span className={cn(commonStyles.cardDesc, themeStyles.cardDesc)}>{tool.desc}</span>
                  </div>
                  <ArrowRight size={14} className={commonStyles.arrow} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className={commonStyles.cta}>
          <Link href="/ai" className={cn(commonStyles.ctaBtn, themeStyles.ctaBtn)}>
            Explore All AI Tools
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AIToolsHub;
