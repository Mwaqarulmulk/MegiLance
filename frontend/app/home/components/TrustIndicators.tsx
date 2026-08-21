// @AI-HINT: Enterprise Trust & Security Architecture component for the homepage.
'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Shield, Sparkles, Globe, Zap, Star, Lock, FileCheck, CheckCircle2, Award, BadgeCheck } from 'lucide-react';
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
  subtext: string;
  prefix?: string;
  suffix?: string;
}

interface SecurityBadge {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
}

const trustIndicators: TrustIndicator[] = [
  { id: 1, icon: <Shield size={24} />, value: 100, label: "Milestone Escrow", subtext: "Funds locked safely until deliverable approval", suffix: "%" },
  { id: 2, icon: <Zap size={24} />, value: 0, label: "Platform Commission", subtext: "Keep 100% of your earnings during launch", suffix: "%" },
  { id: 3, icon: <Globe size={24} />, value: 70, label: "Supported Markets", subtext: "Instant multi-currency global settlement", suffix: "+" },
  { id: 4, icon: <Sparkles size={24} />, value: PLATFORM_FACTS.AI_TOOLS_COUNT, label: "Free Planning Tools", subtext: "Instant data-grounded calculations", suffix: " Tools" },
];

const securityBadges: SecurityBadge[] = [
  { 
    id: 1, 
    title: "Zero-Risk Milestone Escrow", 
    description: "Payments are pre-funded into neutral escrow. Specialists work with guaranteed payment, and clients release funds only after deliverable verification.", 
    icon: <Lock size={22} className="text-emerald-500" />,
    tag: "Financial Safety"
  },
  { 
    id: 2, 
    title: "Multi-Factor Skill Verification", 
    description: "Candidates are evaluated across verified competency tests, delivery velocity, and client feedback to ensure top-tier execution.", 
    icon: <BadgeCheck size={22} className="text-blue-500" />,
    tag: "Vetted Specialists"
  },
  { 
    id: 3, 
    title: "Encrypted Workrooms & IP Protection", 
    description: "Confidential collaboration rooms with automatic milestone contract generation, NDA compliance, and full intellectual property transfer.", 
    icon: <Shield size={22} className="text-purple-500" />,
    tag: "Legal & IP Guard"
  },
];

const TrustIndicators: React.FC = () => {
  const mode = useThemeMode();
  const styles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.trustContainer, styles.trustContainer)} aria-label="Platform Trust & Security">
      
      {/* Section Header */}
      <div className={cn(commonStyles.trustHeader, styles.trustHeader)}>
        <span className={cn(commonStyles.headerBadge, styles.headerBadge)}>
          <Shield size={13} className="text-emerald-500" />
          Enterprise Trust &amp; Security
        </span>
        <h2 className={cn(commonStyles.trustTitle, styles.trustTitle)}>
          Built with Safety, Transparency &amp; Protection at Every Milestone
        </h2>
        <p className={cn(commonStyles.trustSubtitle, styles.trustSubtitle)}>
          Empowering freelancers and clients with guaranteed milestone escrow, zero platform fees, and verified meritocratic matching.
        </p>
      </div>

      {/* Key Metric Counters */}
      <div className={cn(commonStyles.trustIndicators, styles.trustIndicators)}>
        {trustIndicators.map((indicator) => (
          <TrustIndicatorItem 
            key={indicator.id} 
            indicator={indicator} 
            themeStyles={styles} 
          />
        ))}
      </div>

      {/* Security Architecture Cards */}
      <div className={cn(commonStyles.securityBadges, styles.securityBadges)}>
        {securityBadges.map((badge) => (
          <div key={badge.id} className={cn(commonStyles.badgeItem, styles.badgeItem)}>
            <div className={cn(commonStyles.badgeTopRow)}>
              <div className={cn(commonStyles.badgeIcon, styles.badgeIcon)}>
                {badge.icon}
              </div>
              <span className={cn(commonStyles.badgeTag, styles.badgeTag)}>
                {badge.tag}
              </span>
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

      {/* Verified Guarantees Strip */}
      <div className={cn(commonStyles.guaranteeStrip, styles.guaranteeStrip)}>
        <span className={commonStyles.guaranteeLabel}>
          MegiLance Operational &amp; Financial Standards
        </span>
        <div className={commonStyles.guaranteePills}>
          <span className={cn(commonStyles.guaranteePill, styles.guaranteePill)}>
            <CheckCircle2 size={14} className="text-emerald-500" /> 100% Pre-Funded Milestone Escrow
          </span>
          <span className={cn(commonStyles.guaranteePill, styles.guaranteePill)}>
            <CheckCircle2 size={14} className="text-emerald-500" /> Transparent Dispute Resolution Protocol
          </span>
          <span className={cn(commonStyles.guaranteePill, styles.guaranteePill)}>
            <CheckCircle2 size={14} className="text-emerald-500" /> Instant Multi-Currency Payout Rails
          </span>
          <span className={cn(commonStyles.guaranteePill, styles.guaranteePill)}>
            <CheckCircle2 size={14} className="text-emerald-500" /> Full IP Rights Transfer on Final Approval
          </span>
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
        {indicator.subtext && (
          <span className={cn(commonStyles.indicatorSubtext, themeStyles.indicatorSubtext)}>
            {indicator.subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default TrustIndicators;
