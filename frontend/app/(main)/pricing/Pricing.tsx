// @AI-HINT: This is the primary pricing page component. It includes a monthly/annual toggle and uses the reusable PricingCard component to display different tiers.
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PricingCard } from '@/components/pricing/PricingCard/PricingCard';
import commonStyles from './Pricing.common.module.css';
import lightStyles from './Pricing.light.module.css';
import darkStyles from './Pricing.dark.module.css';

const pricingData = {
  monthly: [
    {
      tier: 'Starter',
      description: 'For individuals and hobbyists getting started.',
      price: '$0',
      pricePeriod: '/ forever',
      features: ['Unlimited project browsing', 'Standard messaging tools', 'Access to community forum'],
      ctaText: 'Start for Free',
      ctaLink: '/signup?plan=starter',
    },
    {
      tier: 'Pro',
      description: 'For professional freelancers and small businesses.',
      price: '$29',
      pricePeriod: '/ month',
      features: ['Everything in Starter', 'Priority project invites', 'Advanced search filters', 'Verified freelancer badge', 'AI-powered proposal assistant'],
      isPopular: true,
      ctaText: 'Start Your Trial',
      ctaLink: '/signup?plan=pro',
    },
    {
      tier: 'Teams',
      description: 'For agencies and teams collaborating on projects.',
      price: '$99',
      pricePeriod: '/ month',
      features: ['Everything in Pro', 'Up to 5 team seats', 'Shared team wallet', 'Dedicated account manager', 'Priority support'],
      ctaText: 'Contact Sales',
      ctaLink: '/contact?plan=teams',
    },
  ],
  annually: [
    {
      tier: 'Starter',
      description: 'For individuals and hobbyists getting started.',
      price: '$0',
      pricePeriod: '/ forever',
      features: ['Unlimited project browsing', 'Standard messaging tools', 'Access to community forum'],
      ctaText: 'Start for Free',
      ctaLink: '/signup?plan=starter',
    },
    {
      tier: 'Pro',
      description: 'For professional freelancers and small businesses.',
      price: '$24',
      pricePeriod: '/ month',
      features: ['Everything in Starter', 'Priority project invites', 'Advanced search filters', 'Verified freelancer badge', 'AI-powered proposal assistant'],
      isPopular: true,
      ctaText: 'Start Your Trial',
      ctaLink: '/signup?plan=pro-annual',
    },
    {
      tier: 'Teams',
      description: 'For agencies and teams collaborating on projects.',
      price: '$83',
      pricePeriod: '/ month',
      features: ['Everything in Pro', 'Up to 5 team seats', 'Shared team wallet', 'Dedicated account manager', 'Priority support'],
      ctaText: 'Contact Sales',
      ctaLink: '/contact?plan=teams-annual',
    },
  ],
};

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main id="main-content" className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Find the perfect plan</h1>
        <p className={styles.subtitle}>Start for free, then upgrade or downgrade anytime. No hidden fees.</p>
      </div>

      <div className={styles.toggleContainer} role="group" aria-label="Billing cycle">
        <span className={cn(styles.toggleLabel, billingCycle === 'monthly' && styles.activeLabel)} id="billing-monthly-label">Monthly</span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
          className={styles.toggleSwitch}
          role="switch"
          aria-checked={billingCycle === 'annually' ? true : false}
          aria-label="Toggle billing cycle"
          aria-labelledby={billingCycle === 'annually' ? 'billing-annually-label' : 'billing-monthly-label'}
          type="button"
        >
          <motion.div className={styles.toggleHandle} layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} />
        </button>
        <span className={cn(styles.toggleLabel, billingCycle === 'annually' && styles.activeLabel)} id="billing-annually-label">
          Annually <span className={styles.discountBadge}>Save 15%</span>
        </span>
      </div>

      <motion.div 
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {pricingData[billingCycle].map((tier) => (
          <motion.div key={tier.tier} variants={itemVariants}>
            <PricingCard {...tier} />
          </motion.div>
        ))}
      </motion.div>

      <p className={styles.note}>All prices in USD. Applicable taxes may be added at checkout. Contact us for enterprise solutions.</p>
    </main>
  );
};

export default Pricing;
