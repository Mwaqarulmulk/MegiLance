// @AI-HINT: Factual Trust Indicators component for Homepage. Features verified platform capabilities, security architecture, and escrow protection details.
'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Shield, Sparkles, Globe, Zap, Star, Lock, FileCheck } from 'lucide-react';
import useAnimatedCounter from '@/hooks/useAnimatedCounter';
import { PLATFORM_FACTS, PRICING_CONFIG } from '@/lib/platform-config';

import commonStyles from './TrustIndicators.common.module.css';
import lightStyles from './TrustIndicators.light.module.css';
import darkStyles from './TrustIndicators.dark.module.css';

interface TrustIndicator {
  id: number;
  icon: React.ReactNode;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface SecurityBadge {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const trustIndicators: TrustIndicator[] = [
  { id: 1, icon: <Sparkles size={24} />, value: PLATFORM_FACTS.AI_TOOLS_COUNT, label: "Free AI Tools Available", suffix: "" },
  { id: 2, icon: <Globe size={24} />, value: 70, label: "Countries Supported", suffix: "+" },
  { id: 3, icon: <FileCheck size={24} />, value: 10, label: "Service Categories", suffix: "" },
  { id: 4, icon: <Shield size={24} />, value: 100, label: "Milestone Escrow Protection", suffix: "%" },
];

const securityBadges: SecurityBadge[] = [
  { id: 1, title: "Milestone Escrow", description: "Funds pre-funded and held safely until work is reviewed and approved", icon: <Lock size={20} /> },
  { id: 2, title: "Multi-Factor AI Matching", description: "Objective 7-factor competency, rate, and availability scoring", icon: <Star size={20} /> },
  { id: 3, title: "Encrypted Workrooms", description: "Secure end-to-end communication and file sharing for project collaboration", icon: <Shield size={20} /> },
];

const TrustIndicators: React.FC = () => {
  const mode = useThemeMode();
  const styles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.trustContainer, styles.trustContainer)}>
      <div className={cn(commonStyles.trustHeader, styles.trustHeader)}>
        <h2 className={cn(commonStyles.trustTitle, styles.trustTitle)}>Built for Transparent &amp; Secure Collaboration</h2>
        <p className={cn(commonStyles.trustSubtitle, styles.trustSubtitle)}>
          Empowering freelancers and clients with free planning tools, transparent milestone payments, and verified skill matching.
        </p>
      </div>

      <div className={cn(commonStyles.trustIndicators, styles.trustIndicators)}>
        {trustIndicators.map((indicator) => (
          <TrustIndicatorItem 
            key={indicator.id} 
            indicator={indicator} 
            themeStyles={styles} 
          />
        ))}
      </div>

      <div className={cn(commonStyles.securityBadges, styles.securityBadges)}>
        {securityBadges.map((badge) => (
          <div key={badge.id} className={cn(commonStyles.badgeItem, styles.badgeItem)}>
            <div className={cn(commonStyles.badgeIcon, styles.badgeIcon)}>
              {badge.icon}
            </div>
            <div className={cn(commonStyles.badgeContent, styles.badgeContent)}>
              <h3 className={cn(commonStyles.badgeTitle, styles.badgeTitle)}>{badge.title}</h3>
              <p className={cn(commonStyles.badgeDescription, styles.badgeDescription)}>
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Verified Architecture & Security Standards Strip */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(150, 150, 150, 0.15)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontWeight: 700 }}>
          Modern Full-Stack Architecture &amp; Security
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', opacity: 0.85 }}>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(69, 115, 223, 0.3)', fontSize: '0.8rem', fontWeight: 600 }}>🔒 JWT &amp; Role-Based Access</span>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(39, 174, 96, 0.3)', fontSize: '0.8rem', fontWeight: 600 }}>🛡️ Milestone Escrow Protection</span>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(155, 81, 224, 0.3)', fontSize: '0.8rem', fontWeight: 600 }}>⚡ Turso Edge SQL Database</span>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(242, 201, 76, 0.3)', fontSize: '0.8rem', fontWeight: 600 }}>🚀 Next.js 16 &amp; FastAPI Async Core</span>
        </div>
      </div>
    </div>
  );
};

interface TrustIndicatorItemProps {
  indicator: TrustIndicator;
  themeStyles: typeof lightStyles;
}

const TrustIndicatorItem: React.FC<TrustIndicatorItemProps> = ({ indicator, themeStyles }) => {
  const ref = useRef<HTMLDivElement>(null);
  const animatedValue = useAnimatedCounter(indicator.value, 2000, 0, ref);

  const formattedValue = new Intl.NumberFormat('en-US').format(Number(animatedValue));

  return (
    <div 
      ref={ref}
      className={cn(commonStyles.indicatorItem, themeStyles.indicatorItem)}
    >
      <div className={cn(commonStyles.indicatorIcon, themeStyles.indicatorIcon)}>
        {indicator.icon}
      </div>
      <div className={cn(commonStyles.indicatorContent, themeStyles.indicatorContent)}>
        <span className={cn(commonStyles.indicatorValue, themeStyles.indicatorValue)}>
          {indicator.prefix}{formattedValue}{indicator.suffix}
        </span>
        <span className={cn(commonStyles.indicatorLabel, themeStyles.indicatorLabel)}>
          {indicator.label}
        </span>
      </div>
    </div>
  );
};

export default TrustIndicators;
