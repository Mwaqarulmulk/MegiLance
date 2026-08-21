'use client';


import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Zap,
  Lock,
  Globe2,
  Wallet2,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useThemeMode } from '@/app/hooks/useThemeMode';

import commonStyles from './WhyMegiLance.common.module.css';
import lightStyles from './WhyMegiLance.light.module.css';
import darkStyles from './WhyMegiLance.dark.module.css';
import SectionGlobe from '@/app/components/Animations/SectionGlobe/SectionGlobe';

export interface ValueProp {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  variant: 'primary' | 'success' | 'orange' | 'purple';
}

const valuePropositions: ValueProp[] = [
  {
    id: 'ai-precision',
    icon: <Zap className={commonStyles.icon} />,
    title: 'AI-Powered Precision',
    subtitle: 'Intelligent Scoping & Estimation',
    description:
      'Leverage our suite of free AI tools to estimate project costs, generate client proposals, and break briefs into actionable milestone scopes.',
    benefits: [
      'Calibrated cost estimation using market data',
      'AI-structured milestone deliverables',
      'Instant proposal generation with clear WBS',
      'Real-time market rate benchmarking',
    ],
    variant: 'primary',
  },
  {
    id: 'bulletproof-security',
    icon: <Lock className={commonStyles.icon} />,
    title: 'Milestone Escrow Vault',
    subtitle: '100% Pre-Funded Protection',
    description:
      'Eliminate payment disputes and non-delivery risk. Funds are secured in a neutral escrow vault and released only upon client deliverable sign-off.',
    benefits: [
      '100% pre-funded milestone escrow',
      'Code and deliverable verification before release',
      'Automated dispute mediation safeguards',
      'Instant payout release upon approval',
    ],
    variant: 'success',
  },
  {
    id: 'borderless-opportunities',
    icon: <Globe2 className={commonStyles.icon} />,
    title: '7-Factor Merit Matching',
    subtitle: 'Top 1% Specialist Network',
    description:
      'Connect with verified technical specialists matched objectively on past delivery velocity, verified code commits, and skill depth.',
    benefits: [
      'Zero spam bids; meritocratic ranking',
      '7-factor AI matching algorithm',
      'Curated technical & design specialists',
      'Multi-currency and global timezone coverage',
    ],
    variant: 'orange',
  },
  {
    id: 'zero-commission',
    icon: <Wallet2 className={commonStyles.icon} />,
    title: '0% Platform Commission',
    subtitle: 'Keep 100% of Your Earnings',
    description:
      'Freelancers retain 100% of their contract value with zero hidden deductions, while clients enjoy transparent milestone pricing.',
    benefits: [
      '0% freelancer platform fee',
      'Transparent milestone invoices',
      'Multi-currency bank & card settlement',
      'Direct payout to local bank accounts',
    ],
    variant: 'purple',
  },
];

interface ValueCardProps {
  prop: ValueProp;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  themeStyles: typeof lightStyles;
}

const ValueCard: React.FC<ValueCardProps> = ({
  prop,
  isHovered,
  onHover,
  themeStyles,
}) => {
  const variantClass = `variant${prop.variant.charAt(0).toUpperCase() + prop.variant.slice(1)}`;

  return (
    <div 
      className={commonStyles.cardWrapper}
      onMouseEnter={() => onHover(prop.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={cn(
          commonStyles.valueCard,
          commonStyles[variantClass as keyof typeof commonStyles],
          themeStyles.valueCard,
          isHovered && commonStyles.valueCardHovered
        )}
      >
        {/* Gradient Border Effect */}
        <div className={commonStyles.cardGradientBorder} />

      {/* Icon Container */}
      <div className={cn(commonStyles.iconContainer, themeStyles.iconContainer)}>
        <div className={commonStyles.iconBackground}>{prop.icon}</div>
      </div>

      {/* Content Container */}
      <div className={commonStyles.cardContent}>
        {/* Title Section */}
        <div className={commonStyles.titleSection}>
          <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>
            {prop.title}
          </h3>
          <p className={cn(commonStyles.cardSubtitle, themeStyles.cardSubtitle)}>
            {prop.subtitle}
          </p>
        </div>

        {/* Description */}
        <p
          className={cn(
            commonStyles.cardDescription,
            themeStyles.cardDescription
          )}
        >
          {prop.description}
        </p>

        {/* Benefits List - Visible on Hover */}
        <div
          className={cn(
            commonStyles.benefitsList,
            isHovered && commonStyles.benefitsListVisible
          )}
        >
          {prop.benefits.map((benefit, idx) => (
            <div key={idx} className={cn(commonStyles.benefitItem, commonStyles[variantClass as keyof typeof commonStyles])}>
              <Check size={16} className={commonStyles.checkIcon} />
              <span className={cn(commonStyles.benefitText, themeStyles.benefitText)}>
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button - Links to relevant sections */}
        <a
          href={prop.id === 'ai-precision' ? '/ai/chatbot' : 
                prop.id === 'bulletproof-security' ? '/security' :
                prop.id === 'borderless-opportunities' ? '/freelancer/projects' : 
                '/pricing'}
          className={cn(
            commonStyles.cardCta,
            commonStyles[`cta${prop.variant.charAt(0).toUpperCase() + prop.variant.slice(1)}` as keyof typeof commonStyles],
            themeStyles.cardCta
          )}
        >
          <span>Learn More</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
    </div>
  );
};

const WhyMegiLance: React.FC = () => {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className={cn(commonStyles.section, themeStyles.section)}>
      {/* Animated Background Elements */}
      <div className={commonStyles.backgroundElements}>
        <div className={cn(commonStyles.bgBlob, commonStyles.bgBlob1)} />
        <div className={cn(commonStyles.bgBlob, commonStyles.bgBlob2)} />
        <div className={cn(commonStyles.bgBlob, commonStyles.bgBlob3)} />
      </div>
      <SectionGlobe variant="orange" size="sm" position="right" />

      <div className={commonStyles.container}>
        {/* Section Header */}
        <div className={cn(commonStyles.header, themeStyles.header)}>
          <div className={cn(commonStyles.preheader, themeStyles.preheader)}>
            <span className={commonStyles.badge}>Core Advantages</span>
            <div className={commonStyles.badgeDot} />
            <span className={commonStyles.badgeText}>Why Choose Us</span>
          </div>

          <h2 className={cn(commonStyles.heading, themeStyles.heading)}>
            Why <span className={commonStyles.highlightText}>MegiLance?</span>
          </h2>

          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            We&apos;ve built a next-generation freelance ecosystem with tools and
            security you can trust. Powered by AI precision, cryptographic security,
            and borderless access—all designed for your success.
          </p>
        </div>

        {/* Value Propositions Grid */}
        <div className={commonStyles.grid}>
          {valuePropositions.map((prop) => (
            <ValueCard
              key={prop.id}
              prop={prop}
              isHovered={hoveredCard === prop.id}
              onHover={setHoveredCard}
              themeStyles={themeStyles}
            />
          ))}
        </div>

        {/* Trust Badges Section */}
        <div className={cn(commonStyles.trustSection, themeStyles.trustSection)}>
          <p className={cn(commonStyles.trustLabel, themeStyles.trustLabel)}>
            Built with trust at our core
          </p>
          <div className={commonStyles.trustBadges}>
            {[
              { label: 'Bank-Level Security', icon: '🔐' },
              { label: 'Web3 Native', icon: '⛓️' },
              { label: '24/7 Support', icon: '🤝' },
              { label: 'Zero Hidden Fees', icon: '💎' },
            ].map((badge, idx) => (
              <div
                key={idx}
                className={cn(
                  commonStyles.trustBadge,
                  themeStyles.trustBadge
                )}
              >
                <span className={commonStyles.badgeEmoji}>{badge.icon}</span>
                <span className={commonStyles.badgeLabel}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyMegiLance;
