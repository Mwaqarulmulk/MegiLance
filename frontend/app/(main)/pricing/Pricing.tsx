// @AI-HINT: Pricing page consuming the single source of truth (PRICING_CONFIG) with promotional launch terms, transparent fee breakdown, and feature comparison.
'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PricingCard } from '@/app/components/organisms/PricingCard/PricingCard';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/app/components/Animations/StaggerContainer';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';
import {
  Check, Shield, Users, Zap, FileText, HeadphonesIcon,
  Building2, Lock, UserCheck, BarChart3, MessageSquare, Globe, Info
} from 'lucide-react';
import FeeSavingsCalculator from '@/app/components/widgets/FeeSavingsCalculator';
import commonStyles from './Pricing.common.module.css';
import lightStyles from './Pricing.light.module.css';
import darkStyles from './Pricing.dark.module.css';
import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';
import { PRICING_CONFIG, PLATFORM_STATUS } from '@/lib/platform-config';

const Pricing: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = { ...commonStyles, ...themeStyles };
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = PRICING_CONFIG.PLANS;
  const comparisonRows = PRICING_CONFIG.COMPARISON_ROWS;

  const faqs = [
    {
      q: 'How does MegiLance pricing work during the launch period?',
      a: PRICING_CONFIG.LAUNCH_POLICY_NOTICE,
    },
    {
      q: 'Are all 11 AI tools free to use?',
      a: 'Yes. All 11 core AI tools (including the Price Estimator, Proposal Writer, Rate Advisor, and Scope Planner) are 100% free to use. You can generate initial results without even signing up.',
    },
    {
      q: 'Are there any hidden payment charges?',
      a: PRICING_CONFIG.PAYMENT_PROCESSOR_NOTE,
    },
    {
      q: 'How does milestone escrow protect my money?',
      a: 'Clients fund individual project milestones in advance. Money is locked securely in escrow and only released to the freelancer once the deliverable is reviewed and approved.',
    },
    {
      q: 'What is included in Enterprise & Teams?',
      a: 'The Enterprise tier offers custom talent sourcing assistance, standard NDA/IP templates, dedicated onboarding support, and team collaboration workflows.',
    },
    {
      q: 'What happens after the promotional launch period?',
      a: 'Any future adjustments to standard platform fee structures will be announced transparently in advance to all community members.',
    },
  ];

  return (
    <PageTransition>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <AnimatedOrb variant="purple" size={500} blur={90} opacity={0.1} className="absolute top-[-10%] right-[-10%]" />
        <AnimatedOrb variant="blue" size={400} blur={70} opacity={0.08} className="absolute bottom-[-10%] left-[-10%]" />
        <ParticlesSystem count={12} className="absolute inset-0" />
        <div className="absolute top-20 left-10 opacity-10 animate-float-slow">
          <FloatingCube size={40} />
        </div>
        <div className="absolute bottom-40 right-20 opacity-10 animate-float-medium">
          <FloatingSphere size={30} variant="gradient" />
        </div>
      </div>

      <main id="main-content" className={styles.root}>
        {/* Hero */}
        <ScrollReveal>
          <div className={styles.header}>
            <span className={commonStyles.heroBadge}>✨ {PLATFORM_STATUS.BADGE} · Promotional Platform Pricing</span>
            <h1 className={styles.title}>Transparent Pricing &amp; Free AI Productivity</h1>
            <p className={styles.subtitle}>
              {PRICING_CONFIG.LAUNCH_POLICY_NOTICE}
            </p>

            <div className="mt-8 flex justify-center">
              <BrandLottiePlayer
                src="/lottie/07_data_analytics_growth.json"
                ariaLabel="Data Analytics & Fee Savings Growth Lottie Animation"
                className="w-full max-w-md h-56 md:h-72"
                framed={true}
                glow={true}
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Plans Grid */}
        <StaggerContainer className={styles.grid}>
          {plans.map((tier) => (
            <StaggerItem key={tier.id}>
              <PricingCard
                tier={tier.tier}
                description={tier.description}
                price={tier.price}
                pricePeriod={tier.pricePeriod}
                features={[...tier.features]}
                ctaText={tier.ctaText}
                ctaLink={tier.ctaLink}
                isPopular={tier.isPopular}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* How It Works */}
        <ScrollReveal delay={0.2}>
          <section className={commonStyles.howSection}>
            <h2 className={cn(commonStyles.sectionHeading, themeStyles.title)}>How Collaboration &amp; Payments Work</h2>
            <div className={commonStyles.howGrid}>
              <div className={cn(commonStyles.howCard, themeStyles.howCard)}>
                <div className={cn(commonStyles.howIcon, themeStyles.howIcon)}><Users size={24} /></div>
                <h3 className={cn(commonStyles.howTitle, themeStyles.howTitle)}>Clients &amp; Freelancers</h3>
                <p className={cn(commonStyles.howDesc, themeStyles.howDesc)}>
                  Scope projects with free AI tools, post opportunities, and submit proposals. Work together directly in collaborative workrooms with milestone-based escrow safety.
                </p>
              </div>
              <div className={cn(commonStyles.howCard, themeStyles.howCard)}>
                <div className={cn(commonStyles.howIcon, themeStyles.howIcon)}><Building2 size={24} /></div>
                <h3 className={cn(commonStyles.howTitle, themeStyles.howTitle)}>Enterprise &amp; Teams</h3>
                <p className={cn(commonStyles.howDesc, themeStyles.howDesc)}>
                  Custom sourcing support, standardized NDA/IP templates, dedicated account management, and flexible multi-member team billing.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Feature Comparison Table */}
        <ScrollReveal delay={0.3}>
          <section className={commonStyles.comparisonSection}>
            <h2 className={cn(commonStyles.sectionHeading, themeStyles.title)}>Plan &amp; Feature Comparison</h2>
            <div className={cn(commonStyles.tableWrapper, themeStyles.tableWrapper)}>
              <table className={cn(commonStyles.comparisonTable, themeStyles.comparisonTable)}>
                <thead>
                  <tr>
                    <th className={cn(commonStyles.tableHead, themeStyles.tableHead)}>Feature</th>
                    <th className={cn(commonStyles.tableHead, commonStyles.tableHeadCenter, themeStyles.tableHead, commonStyles.tableHeadHighlight)}>2026 Free Launch</th>
                    <th className={cn(commonStyles.tableHead, commonStyles.tableHeadCenter, themeStyles.tableHead)}>Enterprise &amp; Teams</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((feat) => (
                    <tr key={feat.name} className={cn(commonStyles.tableRow, themeStyles.tableRow)}>
                      <td className={cn(commonStyles.tableCell, themeStyles.tableCell)}>{feat.name}</td>
                      {(['free', 'enterprise'] as const).map((planKey) => (
                        <td key={planKey} className={cn(commonStyles.tableCell, commonStyles.tableCellCenter, themeStyles.tableCell)}>
                          {feat[planKey] === true ? (
                            <Check size={18} className={commonStyles.checkIcon} />
                          ) : feat[planKey] === false ? (
                            <span className={commonStyles.dashIcon}>—</span>
                          ) : (
                            <span className={commonStyles.cellText}>{feat[planKey]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </ScrollReveal>

        {/* Live Fee Savings Calculator Widget */}
        <ScrollReveal delay={0.35}>
          <FeeSavingsCalculator
            title="Interactive Fee Comparison Calculator"
            subtitle="Compare platform fee overhead between MegiLance promotional pricing and legacy platforms."
            showCTA={true}
          />
        </ScrollReveal>

        {/* FAQ */}
        <ScrollReveal delay={0.4}>
          <section className={commonStyles.faqSection}>
            <h2 className={cn(commonStyles.sectionHeading, themeStyles.title)}>Pricing &amp; Billing FAQs</h2>
            <div className={commonStyles.faqList}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={cn(commonStyles.faqItem, themeStyles.faqItem, openFaq === i && commonStyles.faqItemOpen)}
                >
                  <button
                    className={cn(commonStyles.faqQuestion, themeStyles.faqQuestion)}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    {faq.q}
                    <span className={commonStyles.faqChevron}>{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <p className={cn(commonStyles.faqAnswer, themeStyles.faqAnswer)}>{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <p className={styles.note}>
            All prices in USD. {PRICING_CONFIG.PAYMENT_PROCESSOR_NOTE} Need assistance? <a href="/contact" className={commonStyles.noteLink}>Contact our team</a>.
          </p>
        </ScrollReveal>
      </main>
    </PageTransition>
  );
};

export default Pricing;
