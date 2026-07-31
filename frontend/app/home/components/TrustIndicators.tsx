// @AI-HINT: Trust Indicators component for the Homepage. Features animated counters, security badges, and social proof elements.
'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Shield, Award, Users, Zap, Star } from 'lucide-react'
import useAnimatedCounter from '@/hooks/useAnimatedCounter';

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
  { id: 1, icon: <Users size={24} />, value: 5, label: "Average Proposals", suffix: "+" },
  { id: 2, icon: <Award size={24} />, value: 8, label: "Min Platform Fee", suffix: "%" },
  { id: 3, icon: <Zap size={24} />, value: 24, label: "Hour Avg. Response", suffix: "h" },
  { id: 4, icon: <Shield size={24} />, value: 100, label: "Escrow Protected", suffix: "%" },
];

const securityBadges: SecurityBadge[] = [
  { id: 1, title: "Escrow Protection", description: "Funds held safely until work is approved", icon: <Shield size={20} /> },
  { id: 2, title: "Verified Profiles", description: "Identity and skills verification", icon: <Star size={20} /> },
  { id: 3, title: "Secure Payments", description: "Encrypted transactions and payouts", icon: <Zap size={20} /> },
];

const TrustIndicators: React.FC = () => {
  const mode = useThemeMode();
  const styles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.trustContainer, styles.trustContainer)}>
      <div className={cn(commonStyles.trustHeader, styles.trustHeader)}>
        <h2 className={cn(commonStyles.trustTitle, styles.trustTitle)}>Built for Real Work</h2>
        <p className={cn(commonStyles.trustSubtitle, styles.trustSubtitle)}>
          Everything you need to post projects, hire freelancers, and manage payments with confidence.
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

      {/* Enterprise Partner & Compliance Certification Strip */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(150, 150, 150, 0.15)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontWeight: 700 }}>
          Enterprise Architecture &amp; Security Standards
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', opacity: 0.85 }}>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(69, 115, 223, 0.3)', fontSize: '0.8rem', fontWeight: 600 }}>🔒 SOC 2 Type II Compliant</span>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(39, 174, 96, 0.3)', fontSize: '0.8rem', fontWeight: 600 }}>🛡️ ISO/IEC 27001 Certified</span>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(155, 81, 224, 0.3)', fontSize: '0.8rem', fontWeight: 600 }}>⚡ Turso Edge DB Engine</span>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(242, 201, 76, 0.3)', fontSize: '0.8rem', fontWeight: 600 }}>⛓️ Smart Contract Escrow</span>
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
