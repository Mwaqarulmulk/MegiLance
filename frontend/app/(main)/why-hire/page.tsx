import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Why Hire on MegiLance | AI Matching, 0% Launch Fees & Verified Talent',
  description: 'Discover why businesses hire on MegiLance. AI-powered matching, 0% launch fees and commissions for 2026, secure milestone escrow, verified freelancer profiles, fraud detection, and 24/7 support.',
  path: '/why-hire',
  keywords: getKeywordsForPage(['transactional', 'features', 'longTail'], [
    'why use megilance', 'best place to hire freelancers', 'hire verified freelancers',
    'advantages of megilance', 'better freelance platform', 'why hire freelancers online',
    'benefits of ai freelance matching', 'secure freelance hiring platform',
  ]),
});

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import commonStyles from './WhyHire.common.module.css';

const reasons = [
  {
    title: "Top 1% Talent",
    description: "Our AI ranks freelancers by skill graphs, past performance, and client feedback — only the best surface.",
  },
  {
    title: "Hire in 24 Hours",
    description: "AI matching delivers qualified proposals within hours, not weeks. Most clients hire same-day.",
  },
  {
    title: "Zero Risk Escrow",
    description: "Funds are held in escrow and released only when you approve milestones. Your money is always protected.",
  },
  {
    title: "Zero Commission Launch Offer",
    description: "Enjoy 0% platform commission and 0% client fees during our 2026 startup launch promotion. No hidden charges.",
  },
  {
    title: "Built-in Compliance",
    description: "We handle KYC verification, tax documentation, and contractor compliance so you don't have to.",
  },
  {
    title: "AI Quality Analysis",
    description: "Automated code review, sentiment analysis, and project health scoring keep quality high.",
  },
];

const testimonials = [
  { name: "Sarah Chen", role: "CTO, TechStartup", quote: "We hired a senior React developer in 3 hours. MegiLance's AI matching is genuinely better than manual screening." },
  { name: "Ahmed Khan", role: "Founder, Finova", quote: "The escrow system gave us confidence to hire internationally for the first time. Zero issues." },
  { name: "Maria Rodriguez", role: "VP Eng, ScaleUp", quote: "We've cut our hiring time from 2 weeks to 2 days. The quality of freelancers here is consistently high." },
];

export default function WhyHirePage() {
  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header}>
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <Image
            src="/images/hero/freelancer-dashboard.png"
            alt="MegiLance freelancer dashboard — AI matched projects, milestone payments, earnings tracking, and portfolio highlights"
            width={520}
            height={380}
            priority
            sizes="(max-width: 768px) 100vw, 520px"
            style={{ width: '100%', maxWidth: '520px', height: 'auto', borderRadius: '16px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.15)' }}
          />
          <Image
            src="/images/sections/testimonials.png"
            alt="What MegiLance users say — 10K+ happy clients, 25K+ skilled freelancers, 98% satisfaction rate, 4.9/5 average rating"
            width={480}
            height={320}
            sizes="(max-width: 768px) 100vw, 480px"
            style={{ width: '100%', maxWidth: '480px', height: 'auto', objectFit: 'contain' }}
          />
        </div>
        <h1 className={commonStyles.title}>Why Hire on MegiLance?</h1>
        <p className={commonStyles.subtitle}>
          We handle compliance, escrow, and finding the top 1% so you can focus on building.
        </p>
      </header>

      <section className={commonStyles.reasonsGrid}>
        {reasons.map((r) => (
          <article key={r.title} className={commonStyles.card}>
            <h3>{r.title}</h3>
            <p>{r.description}</p>
          </article>
        ))}
      </section>

      <section className={commonStyles.testimonials}>
        <h2>What Clients Say</h2>
        <div className={commonStyles.testimonialGrid}>
          {testimonials.map((t) => (
            <blockquote key={t.name} className={commonStyles.quote}>
              <p>&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <strong>{t.name}</strong> — {t.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className={commonStyles.cta}>
        <h2>Ready to hire?</h2>
        <p>Post your project in under 5 minutes — completely free.</p>
        <Link href="/signup?role=client" className={commonStyles.button}>
          Post a Project Free
        </Link>
      </section>
    </main>
  );
}
