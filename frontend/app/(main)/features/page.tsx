import React from 'react';
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

      <section className={commonStyles.cta}>
        <h2>Ready to get started?</h2>
        <p>Join thousands of clients and freelancers already using MegiLance.</p>
        <a href="/signup" className={commonStyles.button}>Create Free Account</a>
      </section>
    </main>
  );
}
