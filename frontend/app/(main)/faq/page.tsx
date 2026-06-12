"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import commonStyles from './FAQ.common.module.css';

const faqs = [
  {
    q: "What is MegiLance?",
    a: "MegiLance is an AI-powered freelancing platform that connects clients with top-tier freelancers using intelligent matching, secure escrow payments, and real-time collaboration tools.",
  },
  {
    q: "How does AI matching work?",
    a: "Our matching engine analyzes skills, project requirements, budget, past performance, and communication style to recommend the best freelancers for your project — not just keyword matches, but true compatibility scores.",
  },
  {
    q: "What are the fees?",
    a: "MegiLance charges a flat 5% service fee, significantly lower than competitors who charge 10-20%. There are no hidden costs.",
  },
  {
    q: "How does escrow work?",
    a: "When you hire a freelancer, funds are held in escrow. Payments are released milestone-by-milestone as work is completed and approved. This protects both clients and freelancers.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We support Stripe (credit/debit cards), bank transfers, and cryptocurrency payments. Freelancers can withdraw via multiple methods.",
  },
  {
    q: "Can I hire freelancers for long-term projects?",
    a: "Yes. You can create contracts with milestones spanning weeks or months. Many freelancers on MegiLance specialize in long-term engagements.",
  },
  {
    q: "What if I'm not satisfied with the work?",
    a: "MegiLance has a dispute resolution system. If work doesn't meet agreed milestones, you can request revisions or escalate to mediation. Escrowed funds are protected until resolution.",
  },
  {
    q: "How do I become a freelancer?",
    a: "Sign up, complete your profile with skills and portfolio, and start applying to projects. Our AI will also suggest projects that match your expertise.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use end-to-end encryption, JWT authentication, rate limiting, and regular security audits. Your data is never sold to third parties.",
  },
  {
    q: "Do you support real-time messaging?",
    a: "Yes. MegiLance includes real-time chat powered by Socket.IO, with typing indicators, online presence, file sharing, and read receipts.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Image
            src="/images/hero/faq-hero-v2.png"
            alt="MegiLance FAQ — clear answers, trusted support, always here to help"
            width={420}
            height={340}
            priority
            sizes="(max-width: 640px) 280px, 420px"
            style={{ width: '100%', maxWidth: '420px', height: 'auto', objectFit: 'contain' }}
          />
        </div>
        <h1 className={commonStyles.title}>Frequently Asked Questions</h1>
        <p className={commonStyles.subtitle}>
          Everything you need to know about MegiLance.
        </p>
      </header>

      <section className={commonStyles.list}>
        {faqs.map((faq, i) => (
          <div key={i} className={commonStyles.item}>
            <button
              className={commonStyles.question}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {faq.q}
              <span className={`${commonStyles.icon} ${open === i ? commonStyles.iconOpen : ""}`}>+</span>
            </button>
            {open === i && <p className={commonStyles.answer}>{faq.a}</p>}
          </div>
        ))}
      </section>

      <section className={commonStyles.cta}>
        <h2>Still have questions?</h2>
        <p>Reach out to our support team or browse the documentation.</p>
        <a href="/contact" className={commonStyles.button}>Contact Support</a>
      </section>
    </main>
  );
}
