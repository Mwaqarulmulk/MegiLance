// @AI-HINT: Pricing page with 3 simplified tiers: Free, Standard, Enterprise. Commission-based model.
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
  Building2, Lock, UserCheck, BarChart3, MessageSquare, Globe
} from 'lucide-react';
import commonStyles from './Pricing.common.module.css';
import lightStyles from './Pricing.light.module.css';
import darkStyles from './Pricing.dark.module.css';

const plans = [
  {
    tier: 'Free Starter',
    description: 'All essential tools to collaborate directly. Empowered by live AI pricing and secure smart contract escrow.',
    price: '$0',
    pricePeriod: '/mo (Free for 2026)',
    features: [
      '0% Client fee & 0% Freelancer commission',
      'Unlimited applications & client connections',
      'Full AI suite (Price estimator, proposal editor)',
      'Semantic AI talent matching',
      'Real-time collaborative workspaces',
      'Smart contract milestone escrow',
      'Community support & advice',
    ],
    ctaText: 'Get Started Free',
    ctaLink: '/signup?plan=free',
  },
  {
    tier: 'Pro Freelancer',
    description: 'For established professionals seeking priority platform exposure and advanced workspace analytics.',
    price: '$0',
    pricePeriod: '/mo (Waived for Launch)',
    features: [
      'Everything in Free (incl. all AI tools)',
      '0% Platform fee (Keep 100% of your earnings)',
      'Priority matching & search placement',
      'Verified Profile Badge',
      'Advanced market analytics & trends',
      'Detailed workspace insights',
      'Priority human support',
    ],
    isPopular: true,
    ctaText: 'Claim Free Pro Access',
    ctaLink: '/signup?plan=pro',
  },
  {
    tier: 'Enterprise',
    description: 'For scaling organizations requiring compliance support, dedicated sourcing, and flexible talent integration.',
    price: '$0',
    pricePeriod: '/mo (Free Launch Access)',
    features: [
      'Everything in Pro Freelancer',
      'Dedicated Sourcing Partner',
      'Compliance, NDA & IP transfer templates',
      'Elastic staff augmentation',
      'Custom developer/designer vetting',
      '24/7 account management & SLA',
      'Custom integration APIs',
      '0% platform commission during launch',
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/contact?plan=enterprise',
  },
];

const comparisonFeatures = [
  { name: 'Post & Browse Projects', free: true, standard: true, enterprise: true },
  { name: 'Escrow Payment Protection', free: true, standard: true, enterprise: true },
  { name: 'Monthly Proposals', free: 'Unlimited', standard: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'AI Talent Matching', free: 'Included', standard: 'Priority', enterprise: 'Custom' },
  { name: 'AI Proposal Writer & Tools', free: true, standard: true, enterprise: true },
  { name: 'AI Price Estimator', free: true, standard: true, enterprise: true },
  { name: 'Verified Profile Badge', free: true, standard: true, enterprise: true },
  { name: 'Advanced Analytics', free: true, standard: true, enterprise: true },
  { name: 'Priority Support', free: true, standard: true, enterprise: true },
  { name: 'Dedicated Account Manager', free: false, standard: true, enterprise: true },
  { name: 'NDA & Legal Agreements', free: true, standard: true, enterprise: true },
  { name: 'Staff Augmentation', free: false, standard: true, enterprise: true },
  { name: 'Custom Talent Sourcing', free: false, standard: true, enterprise: true },
  { name: 'Client Fee', free: '0% (Launch Free)', standard: '0% (Launch Free)', enterprise: '0% (Launch Free)' },
  { name: 'Freelancer Platform Fee', free: '0% (Launch Free)', standard: '0% (Launch Free)', enterprise: '0% (Launch Free)' },
];

const faqs = [
  { q: 'Is MegiLance really 100% free right now?', a: 'Yes! As a launching startup, MegiLance is offering 100% free platform access throughout at least 2026. There are zero subscription charges, zero client fees, and zero freelancer commissions.' },
  { q: 'Are there any commission or platform fees during launch?', a: 'No. Freelancers keep 100% of their earnings and clients pay 0% service fees during our 2026 startup launch promotion.' },
  { q: 'Are all AI features included for free?', a: 'Yes. Our complete AI tooling—including price estimating, proposal writing, and talent matching—is completely free for all users with no usage limits or hidden costs.' },
  { q: 'What happens after the launch promotion period?', a: 'Any future fee structure changes will be communicated well in advance. For all of 2026, all features and transactions remain 100% commission-free and subscription-free.' },
  { q: 'What is Staff Augmentation?', a: 'With our Enterprise tier, we help source and embed dedicated freelancers into your team on a contract basis, complete with NDA templates and dedicated account support.' },
  { q: 'Are there any hidden payment charges?', a: 'There are no hidden platform fees. Standard payment gateway processing fees (such as Stripe or crypto gas fees) apply directly from payment providers, but MegiLance charges 0% commission.' },
];

const Pricing: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = { ...commonStyles, ...themeStyles };
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <span className={commonStyles.heroBadge}>🚀 Startup Launch Offer · 100% Free for 2026</span>
            <h1 className={styles.title}>100% Free Platform & Zero Commission</h1>
            <p className={styles.subtitle}>
              As a newly launched startup platform, MegiLance is completely FREE for everyone throughout 2026.
              Enjoy $0 subscription fees, 0% client fees, and 0% freelancer commission fees on all completed contracts!
            </p>
          </div>
        </ScrollReveal>

        {/* Plans Grid */}
        <StaggerContainer className={styles.grid}>
          {plans.map((tier) => (
            <StaggerItem key={tier.tier}>
              <PricingCard {...tier} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* How It Works */}
        <ScrollReveal delay={0.2}>
          <section className={commonStyles.howSection}>
            <h2 className={cn(commonStyles.sectionHeading, themeStyles.title)}>How It Works</h2>
            <div className={commonStyles.howGrid}>
              <div className={cn(commonStyles.howCard, themeStyles.howCard)}>
                <div className={cn(commonStyles.howIcon, themeStyles.howIcon)}><Users size={24} /></div>
                <h3 className={cn(commonStyles.howTitle, themeStyles.howTitle)}>Free &amp; Standard</h3>
                <p className={cn(commonStyles.howDesc, themeStyles.howDesc)}>
                  Clients post projects, freelancers apply. Both sides connect directly on the platform. We facilitate the process and secure payments via escrow. Commission is deducted automatically on project completion.
                </p>
              </div>
              <div className={cn(commonStyles.howCard, themeStyles.howCard)}>
                <div className={cn(commonStyles.howIcon, themeStyles.howIcon)}><Building2 size={24} /></div>
                <h3 className={cn(commonStyles.howTitle, themeStyles.howTitle)}>Enterprise</h3>
                <p className={cn(commonStyles.howDesc, themeStyles.howDesc)}>
                  We work as your talent partner. NDA agreements, staff augmentation, custom sourcing, and dedicated account management. You tell us what you need — we find and embed the right people into your team.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Feature Comparison Table */}
        <ScrollReveal delay={0.3}>
          <section className={commonStyles.comparisonSection}>
            <h2 className={cn(commonStyles.sectionHeading, themeStyles.title)}>Feature Comparison</h2>
            <div className={cn(commonStyles.tableWrapper, themeStyles.tableWrapper)}>
              <table className={cn(commonStyles.comparisonTable, themeStyles.comparisonTable)}>
                <thead>
                  <tr>
                    <th className={cn(commonStyles.tableHead, themeStyles.tableHead)}>Feature</th>
                    <th className={cn(commonStyles.tableHead, commonStyles.tableHeadCenter, themeStyles.tableHead)}>Free</th>
                    <th className={cn(commonStyles.tableHead, commonStyles.tableHeadCenter, themeStyles.tableHead, commonStyles.tableHeadHighlight)}>Standard</th>
                    <th className={cn(commonStyles.tableHead, commonStyles.tableHeadCenter, themeStyles.tableHead)}>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feat) => (
                    <tr key={feat.name} className={cn(commonStyles.tableRow, themeStyles.tableRow)}>
                      <td className={cn(commonStyles.tableCell, themeStyles.tableCell)}>{feat.name}</td>
                      {(['free', 'standard', 'enterprise'] as const).map((plan) => (
                        <td key={plan} className={cn(commonStyles.tableCell, commonStyles.tableCellCenter, themeStyles.tableCell)}>
                          {feat[plan] === true ? (
                            <Check size={18} className={commonStyles.checkIcon} />
                          ) : feat[plan] === false ? (
                            <span className={commonStyles.dashIcon}>—</span>
                          ) : (
                            <span className={commonStyles.cellText}>{feat[plan]}</span>
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

        {/* FAQ */}
        <ScrollReveal delay={0.4}>
          <section className={commonStyles.faqSection}>
            <h2 className={cn(commonStyles.sectionHeading, themeStyles.title)}>Frequently Asked Questions</h2>
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
          <p className={styles.note}>All prices in USD. Enterprise plans billed on custom terms. Need help choosing? <a href="/contact" className={commonStyles.noteLink}>Talk to our team</a>.</p>
        </ScrollReveal>
      </main>
    </PageTransition>
  );
};

export default Pricing;
