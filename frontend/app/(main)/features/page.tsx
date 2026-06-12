import React from 'react';
import Image from 'next/image';
import commonStyles from './Features.common.module.css';

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Matching",
    description: "Our ML engine analyzes skills, budget, and compatibility to match you with the perfect freelancer — not just keywords, but real fit.",
  },
  {
    icon: "🔒",
    title: "Secure Escrow",
    description: "Funds are held safely in escrow and released milestone-by-milestone. Both clients and freelancers are protected.",
  },
  {
    icon: "⚡",
    title: "Zero-Friction Milestones",
    description: "Break projects into milestones, track progress, and approve deliverables — all in one streamlined workflow.",
  },
  {
    icon: "💬",
    title: "Real-time Chat",
    description: "Communicate instantly with typing indicators, file sharing, and read receipts powered by Socket.IO.",
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    description: "Track project progress, spending, freelancer performance, and market trends with AI-generated insights.",
  },
  {
    icon: "💳",
    title: "Multi-Currency Payments",
    description: "Accept payments in USD, EUR, GBP, PKR, and more. Live exchange rates with Stripe and crypto support.",
  },
  {
    icon: "🛡️",
    title: "Fraud Detection",
    description: "Behavioral analysis and ML models detect suspicious accounts, payment fraud, and malicious activity in real time.",
  },
  {
    icon: "📱",
    title: "Mobile Optimized",
    description: "Fully responsive PWA that works beautifully on any device — manage projects, chat, and track milestones on the go.",
  },
  {
    icon: "🌐",
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
            <span className={commonStyles.icon}>{f.icon}</span>
            <h3 className={commonStyles.cardTitle}>{f.title}</h3>
            <p className={commonStyles.cardDesc}>{f.description}</p>
          </article>
        ))}
      </section>

      {/* Security + Smart Escrow visuals */}
      <section style={{ padding: '3rem 2rem', display: 'flex', gap: '3rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <Image
            src="/images/sections/security.png"
            alt="MegiLance security — end-to-end encryption, verified profiles, secure payments, and blockchain trust"
            width={480}
            height={400}
            sizes="(max-width: 640px) 100vw, 480px"
            style={{ width: '100%', maxWidth: '480px', height: 'auto' }}
          />
          <p style={{ marginTop: '1rem', fontWeight: 600, color: '#4573df' }}>Enterprise-Grade Security</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Image
            src="/images/hero/smart-escrow-hero.png"
            alt="Smart Contract Escrow — funds locked securely until milestones approved, then released to freelancer"
            width={440}
            height={400}
            sizes="(max-width: 640px) 100vw, 440px"
            style={{ width: '100%', maxWidth: '440px', height: 'auto' }}
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
