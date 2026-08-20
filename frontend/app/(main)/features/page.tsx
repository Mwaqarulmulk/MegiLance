import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'MegiLance Platform Features | AI Matching, Escrow, Real-time Chat & Analytics',
  description: 'Discover MegiLance\'s powerful features: ML-powered talent matching, secure milestone escrow, real-time Socket.IO chat, smart analytics, fraud detection, multi-currency payments, and a mobile PWA.',
  path: '/features',
  keywords: getKeywordsForPage(['features', 'transactional'], [
    'AI powered freelance features', 'milestone escrow freelancing', 'real time chat freelance platform',
    'freelance platform with analytics', 'multi currency freelance payments',
    'mobile freelance app', 'fraud detection freelancing', 'secure freelance contracts',
  ]),
});

import React from 'react';
import Image from 'next/image';
import {
  BrainCircuit,
  ShieldCheck,
  Zap,
  MessageSquare,
  BarChart3,
  CreditCard,
  ShieldAlert,
  Smartphone,
  Globe
} from 'lucide-react';
import commonStyles from './Features.common.module.css';
import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';

const features = [
  {
    icon: <BrainCircuit size={28} className="text-blue-500" />,
    title: "AI-Powered Matching",
    description: "Our ML engine analyzes skills, budget, and compatibility to match you with the perfect freelancer — not just keywords, but real fit.",
  },
  {
    icon: <ShieldCheck size={28} className="text-emerald-500" />,
    title: "Secure Escrow",
    description: "Funds are held safely in escrow and released milestone-by-milestone. Both clients and freelancers are protected.",
  },
  {
    icon: <Zap size={28} className="text-amber-500" />,
    title: "Zero-Friction Milestones",
    description: "Break projects into milestones, track progress, and approve deliverables — all in one streamlined workflow.",
  },
  {
    icon: <MessageSquare size={28} className="text-indigo-500" />,
    title: "Real-time Chat",
    description: "Communicate instantly with typing indicators, file sharing, and read receipts powered by Socket.IO.",
  },
  {
    icon: <BarChart3 size={28} className="text-purple-500" />,
    title: "Smart Analytics",
    description: "Track project progress, spending, freelancer performance, and market trends with AI-generated insights.",
  },
  {
    icon: <CreditCard size={28} className="text-cyan-500" />,
    title: "Multi-Currency Payments",
    description: "Accept payments in USD, EUR, GBP, PKR, and more. Live exchange rates with Stripe and crypto support.",
  },
  {
    icon: <ShieldAlert size={28} className="text-rose-500" />,
    title: "Fraud Detection",
    description: "Behavioral analysis and ML models detect suspicious accounts, payment fraud, and malicious activity in real time.",
  },
  {
    icon: <Smartphone size={28} className="text-teal-500" />,
    title: "Mobile Optimized",
    description: "Fully responsive PWA that works beautifully on any device — manage projects, chat, and track milestones on the go.",
  },
  {
    icon: <Globe size={28} className="text-blue-600" />,
    title: "Global Talent Pool",
    description: "Access freelancers from 150+ countries. AI-powered ranking surfaces the best talent for your specific needs.",
  },
];

export default function FeaturesPage() {
  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header}>
        {/* How It Works full-page visual — 4-step flow with AI Deal Engine */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <Image
            src="/images/sections/how-it-works-page.png"
            alt="How MegiLance works — 4 steps: Project Intake, AI Match, Smart Contract Escrow, Collaborate and Get Paid"
            width={1100}
            height={520}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
            style={{ width: '100%', maxWidth: '1100px', height: 'auto', borderRadius: '20px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)' }}
          />
        </div>
        <h1 className={commonStyles.title}>Platform Features</h1>
        <p className={commonStyles.subtitle}>
          Everything you need to hire, manage, and pay freelancers — powered by AI.
        </p>
      </header>

      <section className={commonStyles.grid}>
        {features.map((f) => (
          <article key={f.title} className={commonStyles.card}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 mb-4 shadow-sm">
              {f.icon}
            </div>
            <h3 className={commonStyles.cardTitle}>{f.title}</h3>
            <p className={commonStyles.cardDesc}>{f.description}</p>
          </article>
        ))}
      </section>

      {/* Security + Smart Escrow visuals */}
      <section style={{ padding: '3rem 2rem', display: 'flex', gap: '3rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '440px' }}>
          <BrandLottiePlayer
            src="/lottie/06_cybersecurity_trust.json"
            ariaLabel="Cybersecurity & Trust Lottie Animation"
            className="w-full h-64 md:h-72"
            framed={true}
            glow={true}
          />
          <p style={{ marginTop: '1rem', fontWeight: 600, color: '#4573df' }}>Enterprise-Grade Security</p>
        </div>
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '440px' }}>
          <BrandLottiePlayer
            src="/lottie/15_payment_security.json"
            ariaLabel="Payment Security & Escrow Lottie Animation"
            className="w-full h-64 md:h-72"
            framed={true}
            glow={true}
          />
          <p style={{ marginTop: '1rem', fontWeight: 600, color: '#4573df' }}>Smart Contract Escrow</p>
        </div>
      </section>

      <section className={commonStyles.cta}>
        <h2>Ready to get started?</h2>
        <p>Join thousands of clients and freelancers already using MegiLance.</p>
        <a href="/signup" className={commonStyles.button}>Create Free Account</a>
      </section>
    </main>
  );
}
