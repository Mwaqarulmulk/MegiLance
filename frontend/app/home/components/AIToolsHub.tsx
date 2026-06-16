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
            9 AI-powered tools
          </span>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>AI Tools Hub</h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Supercharge your workflow with intelligent tools built for modern freelancing.
          </p>
        </div>

        <div className={commonStyles.grid}>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.label}
                href={tool.href}
                className={cn(commonStyles.card, themeStyles.card)}
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

        <div className={commonStyles.cta}>
          <Link href="/ai" className={cn(commonStyles.ctaBtn, themeStyles.ctaBtn)}>
            Explore All AI Tools
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* AI Hub Visual — shows all 8 AI tools radiating from center */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Image
            src="/images/hero/ai-hub-hero.png"
            alt="MegiLance AI Hub — 8 AI-powered tools including chatbot, price estimator, fraud detection, smart matching, and proposal generator"
            width={680}
            height={680}
            sizes="(max-width: 640px) 320px, (max-width: 1024px) 480px, 680px"
            style={{ width: '100%', maxWidth: '680px', height: 'auto', display: 'inline-block' }}
          />
        </div>
      </div>
    </section>
  );
};

export default AIToolsHub;
