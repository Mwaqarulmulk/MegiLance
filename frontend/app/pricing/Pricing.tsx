// @AI-HINT: Pricing page component. Theme-aware (light/dark) via next-themes, modular CSS modules, animated via Intersection Observer, and fully accessible (ARIA-compliant FAQ and controls).
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button/Button';
import { FaCheckCircle, FaChevronDown, FaUser, FaBuilding, FaRocket } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

import commonStyles from './Pricing.common.module.css';
import lightStyles from './Pricing.light.module.css';
import darkStyles from './Pricing.dark.module.css';




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
    answer: 'By choosing the yearly plan, you get a significant discount, equivalent to two months free compared to the monthly subscription. It&apos;s the best value for clients planning to hire consistently.'
  },
  {
    question: 'How does the AI vetting process work?',
    answer: 'Our proprietary AI analyzes a freelancer&apos;s portfolio, skills, past project success, and client feedback to provide a comprehensive vetting score. This helps you hire with confidence, knowing you&apos;re getting top talent.'
  },
  {
    question: 'What kind of payment methods are supported?',
    answer: 'All payments on MegiLance are handled securely on the blockchain using USDC (USD Coin), a stablecoin pegged to the US dollar. This ensures fast, transparent, and low-fee transactions for both clients and freelancers.'
  }
];

// --- FAQ Item Sub-component --- //
const FaqItem = ({
  item,
  isOpen,
  onClick,
  index,
  themeStyles,
}: {
  item: { question: string; answer: string };
  isOpen: boolean;
  onClick: () => void;
  index: number;
  themeStyles: { [k: string]: string };
}) => {
  const contentId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;
  return (
    <div className={cn(commonStyles.faqItem, themeStyles.faqItem)}>
      <button
        id={buttonId}
        className={cn(commonStyles.faqQuestion, themeStyles.faqQuestion)}
        onClick={onClick}
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-controls={contentId}
      >
        <span>{item.question}</span>
        <FaChevronDown
          aria-hidden="true"
          className={cn(
            commonStyles.faqChevron,
            themeStyles.faqChevron,
            { [commonStyles.faqChevronOpen]: isOpen }
          )}
        />
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(
          commonStyles.faqAnswer,
          themeStyles.faqAnswer,
          { [commonStyles.faqAnswerOpen]: isOpen }
        )}
      >
        <p className={themeStyles.faqAnswerP}>{item.answer}</p>
      </div>
    </div>
  );
};

// Animated section wrapper
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={cn(
        className,
        commonStyles.isNotVisible,
        { [commonStyles.isVisible]: isVisible }
      )}
    >
      {children}
    </div>
  );
};

// --- Main Pricing Component --- //
const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handleFaqToggle = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={cn(commonStyles.pricingPage, themeStyles.root)}>
      <div className={commonStyles.container}>
        <AnimatedSection className={commonStyles.header}>
          <header className={commonStyles.header}>
            <span className={cn(commonStyles.headerEyebrow, themeStyles.headerEyebrow)}>Pricing Plans</span>
            <h1 className={cn(themeStyles.headerTitle)}>Find the Perfect Plan for Your Needs</h1>
            <p className={cn(commonStyles.headerDescription, themeStyles.headerDescription)}>
              From individual freelancers to large enterprises, MegiLance offers a tailored solution to achieve your goals with the power of AI and secure payments.
            </p>
          </header>
        </AnimatedSection>

        <AnimatedSection className={commonStyles.toggleWrapper}>
          <div className={commonStyles.toggleWrapper}>
            <span
              className={cn(
                commonStyles.toggleLabel,
                themeStyles.toggleLabel,
                { [themeStyles.toggleLabelActive]: billingCycle === 'monthly' }
              )}
            >
              Monthly
            </span>
            <label className={commonStyles.toggle} htmlFor="billing-toggle">
              <input
                type="checkbox"
                id="billing-toggle"
                className={cn(commonStyles.toggleCheckbox, themeStyles.toggleCheckbox)}
                checked={billingCycle === 'yearly'}
                onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                aria-label="Toggle billing cycle"
                role="switch"
                aria-checked={billingCycle === 'yearly' ? 'true' : 'false'}
              />
              <span className={cn(commonStyles.toggleSlider, themeStyles.toggleSlider)}></span>
            </label>
            <span
              className={cn(
                commonStyles.toggleLabel,
                themeStyles.toggleLabel,
                { [themeStyles.toggleLabelActive]: billingCycle === 'yearly' }
              )}
            >
              Yearly
            </span>
            <span className={cn(commonStyles.toggleDiscount, themeStyles.toggleDiscount)}>Save 20%</span>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className={commonStyles.pricingGrid}>
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  commonStyles.pricingCard,
                  themeStyles.pricingCard,
                  { [commonStyles.popular]: tier.isPopular, [themeStyles.popular]: tier.isPopular }
                )}
              >
                {tier.isPopular && (
                  <div className={cn(commonStyles.popularBadge, themeStyles.popularBadge)}>Most Popular</div>
                )}
                <div className={commonStyles.cardHeader}>
                  <div className={cn(commonStyles.cardIcon, themeStyles.cardIcon)}>{tier.icon}</div>
                  <h2 className={cn(commonStyles.cardTier, themeStyles.cardTier)}>{tier.name}</h2>
                </div>
                <div className={commonStyles.priceSection}>
                  {typeof tier.price === 'string' ? (
                    <div className={cn(commonStyles.price, commonStyles.priceCustom, themeStyles.priceCustom)}>
                      {tier.price}
                    </div>
                  ) : (
                    <div className={commonStyles.price}>
                      <span className={cn(commonStyles.priceAmount, themeStyles.priceAmount)}>
                        ${billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly}
                      </span>
                      <span className={cn(commonStyles.pricePeriod, themeStyles.pricePeriod)}>
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                  )}
                  <p className={cn(commonStyles.cardDescription, themeStyles.cardDescription)}>{tier.description}</p>
                </div>
                <ul className={commonStyles.features}>
                  {tier.features.map((feature) => (
                    <li key={feature} className={cn(commonStyles.featureItem, themeStyles.featureItem)}>
                      <FaCheckCircle aria-hidden="true" className={cn(commonStyles.featureIcon, themeStyles.featureIcon)} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className={commonStyles.cardCta}>
                  <Link href={tier.button.href} passHref>
                    <Button variant={tier.button.variant} fullWidth>
                      {tier.button.text}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <section className={commonStyles.faq} aria-labelledby="pricing-faq-heading">
            <div className={commonStyles.faqHeader}>
              <h2 id="pricing-faq-heading" className={cn(themeStyles.faqHeaderTitle)}>Frequently Asked Questions</h2>
              <p className={cn(themeStyles.faqHeaderText)}>
                Have questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking for, feel free to contact us.
              </p>
            </div>
            <div className={cn(commonStyles.faqList, themeStyles.faqList)}>
              {faqItems.map((item, index) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  isOpen={openFaq === index}
                  onClick={() => handleFaqToggle(index)}
                  index={index}
                  themeStyles={themeStyles}
                />
              ))}
            </div>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Pricing;
