// @AI-HINT: Why Hire client component — shows value props, savings calculator, testimonials, FAQs.
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  ArrowRight, CheckCircle2, Shield, Zap, Users, Clock, Star, DollarSign,
  TrendingUp, Globe, Bot, ChevronDown, ChevronUp,
} from 'lucide-react';
import Button from '@/app/components/atoms/Button/Button';
import EmailCapture from '@/app/components/organisms/EmailCapture/EmailCapture';

import commonStyles from './WhyHire.common.module.css';
import lightStyles from './WhyHire.light.module.css';
import darkStyles from './WhyHire.dark.module.css';

type FAQ = { question: string; answer: string };

export default function WhyHireClient({ faqs }: { faqs: FAQ[] }) {
  const { resolvedTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = (mounted && resolvedTheme === 'light') ? lightStyles : darkStyles;

  const reasons = [
    { icon: <Bot size={24} />, title: 'AI-Powered Match Precision', desc: 'Skip manual vetting. Our algorithm matches projects with verified specialists based on capability alignment, code assessments, and domain experience.' },
    { icon: <DollarSign size={24} />, title: 'Direct Economic ROI', desc: 'Save 40-60% compared to agency markups and fixed full-time salaries. Scale your overhead dynamically by paying only for active deliverables.' },
    { icon: <Shield size={24} />, title: 'Zero-Anxiety Milestone Escrow', desc: 'Mitigate financial risk. Funds are secured in smart contract escrow for each phase and released only when you approve the work.' },
    { icon: <Clock size={24} />, title: 'Instant Team Assembly', desc: 'Hire vetted talent within 24 hours. Receive context-aware proposals from professionals who are ready to hit the ground running.' },
    { icon: <Star size={24} />, title: 'Eliminating Credential Inflation', desc: "Every freelancer's track record, technical competency, and communication feedback are audited. No synthetic reviews." },
    { icon: <Globe size={24} />, title: 'Bypassing Geographic Constraints', desc: 'Tap into top-tier experts across the Global South. Overcome local talent deficits and connect with high-caliber professionals.' },
    { icon: <Zap size={24} />, title: 'Frictionless 0% Platform Fees', desc: 'We do not tax your hiring budget. Post projects with 0% platform fees, while freelancers keep 100% of their earnings during our promotional launch.' },
    { icon: <TrendingUp size={24} />, title: 'Elastic Scale & Flexibility', desc: 'Scale up or down instantly. Manage project scope dynamically without the operational friction of traditional employment contracts.' },
  ];

  const savings = [
    { role: 'Full-Stack Developer', fullTime: '$120,000/yr', freelance: '$50-80/hr', savings: '40-55%' },
    { role: 'UI/UX Designer', fullTime: '$95,000/yr', freelance: '$40-65/hr', savings: '35-50%' },
    { role: 'Content Writer', fullTime: '$65,000/yr', freelance: '$25-50/hr', savings: '45-60%' },
    { role: 'Data Scientist', fullTime: '$140,000/yr', freelance: '$60-100/hr', savings: '35-50%' },
  ];

  return (
    <div className={cn(commonStyles.page, theme.page)}>
      <section className={cn(commonStyles.hero, theme.hero)}>
        <div className={commonStyles.heroInner}>
          <h1 className={cn(commonStyles.heroTitle, theme.heroTitle)}>
            Why Smart Businesses Hire<br />
            <span className={cn(commonStyles.gradient, theme.gradient)}>Freelancers on MegiLance</span>
          </h1>
          <p className={cn(commonStyles.heroDesc, theme.heroDesc)}>
            Leverage top-tier talent with optimized ROI. Access AI-matched, vetted experts
            under secure milestone escrow. Zero client-side fees and high-speed execution.
          </p>
          <div className={commonStyles.heroCtas}>
            <Link href="/client/find-talent">
              <Button variant="primary" size="lg">
                Find Talent Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">How It Works</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reasons Grid */}
      <section className={cn(commonStyles.section, theme.section)}>
        <div className={commonStyles.inner}>
          <h2 className={cn(commonStyles.sectionTitle, theme.sectionTitle)}>
            8 Reasons Businesses Choose MegiLance
          </h2>
          <div className={commonStyles.reasonsGrid}>
            {reasons.map((r) => (
              <div key={r.title} className={cn(commonStyles.reasonCard, theme.reasonCard)}>
                <div className={cn(commonStyles.reasonIcon, theme.reasonIcon)}>{r.icon}</div>
                <h3 className={cn(commonStyles.reasonTitle, theme.reasonTitle)}>{r.title}</h3>
                <p className={cn(commonStyles.reasonDesc, theme.reasonDesc)}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Savings Table */}
      <section className={cn(commonStyles.section, commonStyles.savingsSection, theme.savingsSection)}>
        <div className={commonStyles.inner}>
          <h2 className={cn(commonStyles.sectionTitle, theme.sectionTitle)}>
            How Much Can You Save?
          </h2>
          <p className={cn(commonStyles.sectionSub, theme.sectionSub)}>
            Maximize operational efficiency by shifting fixed headcount costs into elastic, value-driven deliverables.
          </p>
          <div className={cn(commonStyles.savingsTable, theme.savingsTable)}>
            <div className={cn(commonStyles.savingsRow, commonStyles.savingsHeader, theme.savingsHeader)}>
              <div>Role</div>
              <div>Full-Time Salary</div>
              <div>Freelance Rate</div>
              <div>You Save</div>
            </div>
            {savings.map((s) => (
              <div key={s.role} className={cn(commonStyles.savingsRow, theme.savingsRow)}>
                <div className={cn(commonStyles.savingsRole, theme.savingsRole)}>{s.role}</div>
                <div className={cn(commonStyles.savingsFt, theme.savingsFt)}>{s.fullTime}</div>
                <div className={cn(commonStyles.savingsFl, theme.savingsFl)}>{s.freelance}</div>
                <div className={cn(commonStyles.savingsPercent, theme.savingsPercent)}>{s.savings}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={cn(commonStyles.section, theme.section)}>
        <div className={commonStyles.inner}>
          <h2 className={cn(commonStyles.sectionTitle, theme.sectionTitle)}>Frequently Asked Questions</h2>
          <div className={commonStyles.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} className={cn(commonStyles.faqItem, theme.faqItem)}>
                <button
                  className={cn(commonStyles.faqQ, theme.faqQ)}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.question}</span>
                  {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {openFaq === i && (
                  <div className={cn(commonStyles.faqA, theme.faqA)}>{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={cn(commonStyles.section, theme.section)}>
        <EmailCapture
          headline="Free Guide: How to Hire Freelancers Successfully"
          subtext="Get our step-by-step guide on hiring, managing, and paying freelancers. Plus weekly tips."
          buttonLabel="Get Free Guide"
          source="why-hire"
          variant="card"
        />
      </section>

      {/* Final CTA */}
      <section className={cn(commonStyles.finalCta, theme.finalCta)}>
        <div className={commonStyles.inner}>
          <h2 className={cn(commonStyles.ctaTitle, theme.ctaTitle)}>
            Start Hiring Top Freelancers Today
          </h2>
          <p className={cn(commonStyles.ctaDesc, theme.ctaDesc)}>
            Post your first project free. Get proposals in hours. Pay only when satisfied.
          </p>
          <Link href="/client/find-talent">
            <Button variant="primary" size="lg">
              Find Talent Free <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
