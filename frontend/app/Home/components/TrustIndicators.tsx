// @AI-HINT: Trust Indicators component for the Homepage. Features animated counters, security badges, and social proof elements.
'use client';

import React, { useRef } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Shield, Award, Users, Zap, Globe, Star } from 'lucide-react';
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
  { id: 1, icon: <Users size={24} />, value: 50000, label: "Active Freelancers", suffix: "+" },
  { id: 2, icon: <Globe size={24} />, value: 45, label: "Countries Served" },
  { id: 3, icon: <Zap size={24} />, value: 2500000, label: "Paid to Freelancers", prefix: "$" },
  { id: 4, icon: <Award size={24} />, value: 125000, label: "Projects Completed", suffix: "+" },
];

const securityBadges: SecurityBadge[] = [
  { id: 1, title: "Bank-Level Security", description: "256-bit encryption for all data", icon: <Shield size={20} /> },
  { id: 2, title: "Verified Reviews", description: "AI-moderated feedback system", icon: <Star size={20} /> },
  { id: 3, title: "Instant Payments", description: "USDC blockchain transactions", icon: <Zap size={20} /> },
];

const TrustIndicators: React.FC = () => {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.trustContainer, styles.trustContainer)}>
      <div className={cn(commonStyles.trustHeader, styles.trustHeader)}>
        <h2 className={cn(commonStyles.trustTitle, styles.trustTitle)}>Trusted by Professionals Worldwide</h2>
        <p className={cn(commonStyles.trustSubtitle, styles.trustSubtitle)}>
          Join thousands of freelancers and clients who trust MegiLance for their work
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
    </div>
  );
};

interface TrustIndicatorItemProps {
  indicator: TrustIndicator;
  themeStyles: any;
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