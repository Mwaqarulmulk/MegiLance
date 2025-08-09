// @AI-HINT: Premium Pricing component with theme-aware CSS modules and small in-view animation.
'use client';
import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './Pricing.common.module.css';
import light from './Pricing.light.module.css';
import dark from './Pricing.dark.module.css';

function useInView<T extends HTMLElement>(opts: IntersectionObserverInit = { threshold: 0.15 }) {
  const ref = React.useRef<T | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        ob.disconnect();
      }
    }, opts);
    ob.observe(ref.current);
    return () => ob.disconnect();
  }, [opts]);
  return { ref, visible } as const;
}

const tiers = [
  { name: 'Starter', price: '$0', cta: 'Get Started', features: ['Unlimited browsing', 'Basic messages', 'Community access'] },
  { name: 'Pro', price: '$29', cta: 'Start Pro', features: ['Priority invites', 'Advanced filters', 'Verified badge'] },
  { name: 'Teams', price: '$99', cta: 'Start Teams', features: ['Team seats (5)', 'Shared wallet', 'Priority support'] },
];

const Pricing: React.FC = () => {
  const { theme } = useTheme();
  const t = theme === 'dark' ? dark : light;
  const styles = {
    root: cn(common.root, t.root),
    header: cn(common.header, t.header),
    subtitle: cn(common.subtitle, t.subtitle),
    grid: cn(common.grid, t.grid),
    card: cn(common.card, t.card),
    price: cn(common.price, t.price),
    list: cn(common.list, t.list),
    cta: cn(common.cta, t.cta),
    note: cn(common.note, t.note),
    badge: cn(common.badge, t.badge),
    fadeIn: cn(common.fadeIn, t.fadeIn),
    visible: cn(common.visible, t.visible),
  };

  const { ref: headerRef, visible: headerVisible } = useInView<HTMLDivElement>();
  const { ref: gridRef, visible: gridVisible } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <main id="main-content" role="main" aria-labelledby="pricing-title" className={styles.root}>
      <div ref={headerRef} className={cn(styles.header, styles.fadeIn, headerVisible && styles.visible)}>
        <span className={styles.badge}>Transparent pricing</span>
        <h1 id="pricing-title">Pricing</h1>
        <p className={styles.subtitle}>Simple plans for freelancers, clients, and growing teams. Upgrade or cancel anytime.</p>
      </div>

      <div ref={gridRef} className={cn(styles.grid, styles.fadeIn, gridVisible && styles.visible)}>
        {tiers.map((tier) => (
          <article key={tier.name} className={styles.card} aria-label={`${tier.name} plan`}>
            <h2>{tier.name}</h2>
            <div className={styles.price}>{tier.price}<span>/mo</span></div>
            <ul className={styles.list}>
              {tier.features.map((f) => (<li key={f}>{f}</li>))}
            </ul>
            <Link className={styles.cta} href="/signup" aria-label={`Choose ${tier.name}`}>{tier.cta}</Link>
          </article>
        ))}
      </div>

      <p className={styles.note}>Prices in USD. Taxes may apply. Contact sales for enterprise and custom SLAs.</p>
    </main>
  );
};

export default Pricing;
