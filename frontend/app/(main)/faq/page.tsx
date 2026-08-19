import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbJsonLd, buildSpeakableJsonLd, jsonLdScriptProps } from '../../../lib/seo';
import FaqClient from './FaqClient';

export const metadata: Metadata = buildMeta({
  title: 'FAQ — Frequently Asked Questions | MegiLance Freelance Platform Help',
  description: 'Get answers to common questions about MegiLance: how AI matching works, 0% launch platform commission, milestone escrow payments, how to hire freelancers, data security, and real-time messaging.',
  path: '/faq',
  keywords: getKeywordsForPage(['informational', 'brand'], [
    'megilance faq', 'freelance platform questions', 'how does escrow work freelancing',
    'freelance platform fees explained', 'is megilance safe', 'how to hire on megilance',
    'megilance vs upwork fees', 'freelance platform help',
  ]),
});

const faqJsonLd = buildFAQJsonLd([
  { question: 'What is MegiLance?', answer: 'MegiLance is an AI-powered freelancing platform that connects clients with top-tier freelancers using intelligent matching, secure escrow payments, and real-time collaboration tools. It is available at https://megilance.site.' },
  { question: 'What are the fees on MegiLance?', answer: 'MegiLance charges 0% platform commission during our 2026 promotional launch period. Standard third-party payment gateway processing fees apply directly from payment providers like Stripe. This means freelancers keep 100% of their earnings.' },
  { question: 'How does escrow work on MegiLance?', answer: 'When you hire a freelancer, funds are held in secure escrow and released milestone-by-milestone as work is completed and approved. This protects both clients (funds never released until satisfied) and freelancers (payment guaranteed for delivered work).' },
  { question: 'How does AI matching work?', answer: 'Our matching engine analyzes skills, project requirements, budget, past performance, and communication style to recommend the best freelancers — not just keyword matches, but true compatibility scores built with machine learning.' },
  { question: 'What payment methods are accepted?', answer: 'We support Stripe (credit/debit cards), bank transfers, and cryptocurrency payments. Freelancers can withdraw via multiple methods including bank transfer and crypto wallets.' },
  { question: 'Is MegiLance a good Upwork alternative?', answer: 'Yes. MegiLance offers 0% platform fees vs Upwork\'s 10-20% freelancer commission and 5% client fee. MegiLance also includes free AI tools, milestone escrow, and a built-in real-time workroom — all without the expensive connects system.' },
  { question: 'How do I hire a freelancer on MegiLance?', answer: 'Post your project for free, specify your required skills and budget, and our AI matching engine will surface the most compatible freelancers. Review proposals, chat with candidates, agree on milestones, and fund the escrow to start work.' },
  { question: 'How do freelancers get paid on MegiLance?', answer: 'Freelancers are paid via milestone-based escrow releases. When a client approves a milestone deliverable, payment is automatically released from escrow to the freelancer\'s account. Withdrawals are available via bank transfer, Stripe, or cryptocurrency.' },
  { question: 'Is MegiLance safe and secure?', answer: 'Yes. MegiLance uses Stripe-powered milestone escrow for payment protection, end-to-end encrypted messaging, and a 7-factor fraud detection system. All freelancers go through profile verification before they can bid on projects.' },
  { question: 'Can I use MegiLance for free?', answer: 'Yes! Creating an account is 100% free. Posting projects is free. During our 2026 launch promotion, MegiLance charges 0% platform commission, so both clients and freelancers pay nothing beyond standard payment processing fees.' },
  { question: 'What is the difference between MegiLance and Fiverr?', answer: 'Fiverr is based on pre-packaged "gigs" with a 20% commission. MegiLance supports custom project-based hiring with milestone escrow, AI talent matching, and 0% commission fees. MegiLance is better for complex, bespoke software and design projects.' },
  { question: 'What skills can I hire on MegiLance?', answer: 'MegiLance covers 40+ skill categories including web development (React, Python, Node.js), mobile development (Flutter, iOS, Android), AI/ML engineering, UI/UX design, content writing, SEO, data science, blockchain, and cybersecurity.' },
]);

export default function FaqPage() {
  return (
    <>
      <script {...jsonLdScriptProps(faqJsonLd)} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'FAQ', path: '/faq' }])
      )} />
      <script {...jsonLdScriptProps(
        buildSpeakableJsonLd(['h1', '.faq-question', '.faq-answer'])
      )} />
      <FaqClient />
    </>
  );
}
