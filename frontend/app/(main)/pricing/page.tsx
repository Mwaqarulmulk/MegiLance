import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'MegiLance Pricing | Transparent Plans — Free, Pro $19/mo & Enterprise',
  description: 'Simple transparent pricing with no hidden fees. MegiLance Free plan for starters, Pro Freelancer at $19/month with 8% fee, and Enterprise with custom pricing. No contracts, cancel anytime.',
  path: '/pricing',
  keywords: getKeywordsForPage(['transactional', 'informational'], [
    'megilance pricing', 'freelance platform pricing', 'freelance marketplace fees',
    'how much does megilance cost', 'megilance pro plan', 'megilance subscription',
    'zero commission freelancing', 'low fee freelance platform cost',
    'upwork vs megilance fees', 'freelance platform subscription',
  ]),
});

// @AI-HINT: Pricing directory - Memberships and platform fees
import React from 'react';
import Image from 'next/image';
import commonStyles from './Pricing.common.module.css';

export default function PricingPage() {
  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header} style={{ textAlign: 'center', padding: '6rem 2rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <Image
            src="/images/hero/pricing-hero.png"
            alt="MegiLance Simple Pricing — No hidden fees, flat rates, cancel anytime"
            width={420}
            height={420}
            priority
            sizes="(max-width: 640px) 280px, 420px"
            style={{ width: '100%', maxWidth: '420px', height: 'auto' }}
          />
        </div>
        <h1 className={commonStyles.title} style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: 'var(--text-primary, #0f172a)' }}>Transparent Pricing</h1>
        <p className={commonStyles.subtitle} style={{ fontSize: '1.25rem', color: 'var(--text-secondary, #64748b)', maxWidth: '600px', margin: '0 auto' }}>
          No hidden fees. Simple flat rates and memberships designed to help you succeed.
        </p>
      </header>

      <section style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '2rem', flexWrap: 'wrap' }}>
        {/* Basic Tier */}
        <div style={{ border: '1px solid var(--border-light, #e2e8f0)', borderRadius: '24px', padding: '3rem 2rem', width: '350px', background: 'var(--bg-card, white)' }}>
           <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary, #0f172a)' }}>Basic</h2>
           <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary, #0f172a)' }}>Free</div>
           <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '2rem', minHeight: '48px' }}>Perfect for getting started and exploring the platform.</p>
           
           <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary, #334155)' }}>
              <li>✔️ Create a free profile</li>
              <li>✔️ Apply to 10 jobs per month</li>
              <li>✔️ Standard AI matching</li>
              <li>✔️ 15% Platform fee on earnings</li>
           </ul>
           <button style={{ width: '100%', background: 'var(--bg-secondary, #f1f5f9)', color: 'var(--text-primary, #0f172a)', border: '1px solid var(--border-light, #cbd5e1)', padding: '1rem', borderRadius: '12px', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer' }}>
             Get Started
           </button>
        </div>

        {/* Pro Tier */}
        <div style={{ border: '2px solid #4573df', borderRadius: '24px', padding: '3rem 2rem', width: '350px', background: 'var(--bg-card, white)', position: 'relative', transform: 'scale(1.05)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
           <div style={{ position: 'absolute', top: '-15px', right: '2rem', background: '#e81123', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 700 }}>MOST POPULAR</div>
           <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary, #0f172a)' }}>Pro Freelancer</h2>
           <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary, #0f172a)' }}>$19<span style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--text-secondary, #64748b)' }}>/mo</span></div>
           <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '2rem', minHeight: '48px' }}>For serious professionals looking to maximize earnings.</p>
           
           <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary, #334155)' }}>
              <li>✔️ Premium profile placement</li>
              <li>✔️ Unlimited job applications</li>
              <li>✔️ Priority AI matching</li>
              <li>✔️ Reduced 8% Platform fee</li>
              <li>✔️ Analytics & Insights</li>
           </ul>
           <button style={{ width: '100%', background: '#4573df', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer' }}>
             Upgrade to Pro
           </button>
        </div>
      </section>

      <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--bg-secondary, #f8fafc)', marginTop: '4rem' }}>
         <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>Interested in Enterprise Solutions?</h2>
         <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '2rem' }}>We offer custom hiring plans and dedicated account managers for large teams.</p>
         <button style={{ background: 'var(--text-primary, #0f172a)', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '999px', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer' }}>
           Contact Sales
         </button>
      </section>
    </main>
  );
}
