// @AI-HINT: This is the Pricing page component, refactored to use next-themes and modular CSS.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button/Button';
import { FaCheckCircle, FaChevronDown, FaUser, FaBuilding, FaRocket } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import styles from './Pricing.module.css';




// --- MOCK DATA --- //
const pricingTiers = [
  {
    name: 'Freelancer',
    icon: <FaUser />,
    description: 'For talented individuals ready to take on their next project.',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Create a professional profile',
      'Browse and apply for unlimited projects',
      'Receive secure crypto payments (USDC)',
      'Benefit from AI-powered profile ranking',
    ],
    button: { text: 'Get Started for Free', href: '/signup', variant: 'secondary' as const },
  },
  {
    name: 'Client',
    icon: <FaBuilding />,
    description: 'For businesses looking to hire top-tier, AI-vetted talent.',
    price: { monthly: 49, yearly: 499 },
    features: [
      'Post unlimited job opportunities',
      'Access our pool of AI-vetted freelancers',
      'Secure project funding with smart contracts',
      'Utilize AI-analyzed performance reviews',
      'Dedicated account manager',
    ],
    button: { text: 'Start Hiring', href: '/signup?plan=client', variant: 'primary' as const },
    isPopular: true,
  },
  {
    name: 'Enterprise',
    icon: <FaRocket />,
    description: 'Custom solutions for large-scale teams and agencies.',
    price: 'Custom',
    features: [
      'All features from the Client plan',
      'Advanced team management tools',
      'Custom compliance & security features',
      'API access & third-party integrations',
      'Priority, 24/7 dedicated support',
    ],
    button: { text: 'Contact Sales', href: '/contact', variant: 'outline' as const },
  },
];

const faqItems = [
  {
    question: 'Can I try MegiLance before committing?',
    answer: 'Absolutely! Our Freelancer plan is completely free and allows you to explore the platform, create a profile, and browse projects. For clients, we offer a 14-day money-back guarantee on your first month.'
  },
  {
    question: 'What are the benefits of the yearly plan?',
    answer: 'By choosing the yearly plan, you get a significant discount, equivalent to two months free compared to the monthly subscription. It\'s the best value for clients planning to hire consistently.'
  },
  {
    question: 'How does the AI vetting process work?',
    answer: 'Our proprietary AI analyzes a freelancer\'s portfolio, skills, past project success, and client feedback to provide a comprehensive vetting score. This helps you hire with confidence, knowing you\'re getting top talent.'
  },
  {
    question: 'What kind of payment methods are supported?',
    answer: 'All payments on MegiLance are handled securely on the blockchain using USDC (USD Coin), a stablecoin pegged to the US dollar. This ensures fast, transparent, and low-fee transactions for both clients and freelancers.'
  }
];

// --- FAQ Item Sub-component --- //
const FaqItem = ({ item, isOpen, onClick }: { item: { question: string; answer: string }, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQuestion} onClick={onClick}>
        <span>{item.question}</span>
        <FaChevronDown className={cn(styles.faqChevron, { [styles.open]: isOpen })} />
      </button>
      <div className={cn(styles.faqAnswer, { [styles.open]: isOpen })}>
        <p>{item.answer}</p>
      </div>
    </div>
  );
};

// --- Main Pricing Component --- //
const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleFaqToggle = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={styles.pricingPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.headerEyebrow}>Pricing Plans</span>
          <h1>Find the Perfect Plan for Your Needs</h1>
          <p className={styles.headerDescription}>From individual freelancers to large enterprises, MegiLance offers a tailored solution to achieve your goals with the power of AI and secure payments.</p>
        </header>

        <div className={styles.toggleWrapper}>
          <span className={cn(styles.toggleLabel, { [styles.active]: billingCycle === 'monthly' })}>Monthly</span>
          <label className={styles.toggle} htmlFor="billing-toggle">
            <input
              type="checkbox"
              id="billing-toggle"
              className={styles.toggleCheckbox}
              checked={billingCycle === 'yearly'}
              onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              aria-label="Billing cycle toggle"
            />
            <span className={styles.toggleSlider}></span>
          </label>
          <span className={cn(styles.toggleLabel, { [styles.active]: billingCycle === 'yearly' })}>Yearly</span>
          <span className={styles.toggleDiscount}>Save 20%</span>
        </div>

        <div className={styles.pricingGrid}>
          {pricingTiers.map(tier => (
            <div key={tier.name} className={cn(styles.pricingCard, { [styles.popular]: tier.isPopular })}>
              {tier.isPopular && <div className={styles.popularBadge}>Most Popular</div>}
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{tier.icon}</div>
                <h2 className={styles.cardTier}>{tier.name}</h2>
              </div>
              <div className={styles.priceSection}>
                {typeof tier.price === 'string' ? (
                  <div className={cn(styles.price, styles.custom)}>{tier.price}</div>
                ) : (
                  <div className={styles.price}>
                    <span className={styles.priceAmount}>${billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly}</span>
                    <span className={styles.pricePeriod}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                )}
                <p className={styles.cardDescription}>{tier.description}</p>
              </div>
              <ul className={styles.features}>
                {tier.features.map(feature => (
                  <li key={feature} className={styles.featureItem}>
                    <FaCheckCircle className={styles.featureIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.cardCta}>
                <Link href={tier.button.href} passHref>
                  <Button variant={tier.button.variant} fullWidth>{tier.button.text}</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <section className={styles.faq}>
          <div className={styles.faqHeader}>
            <h2>Frequently Asked Questions</h2>
            <p>Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.</p>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item, index) => (
              <FaqItem 
                key={item.question} 
                item={item} 
                isOpen={openFaq === index}
                onClick={() => handleFaqToggle(index)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pricing;
