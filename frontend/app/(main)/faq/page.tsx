import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, jsonLdScriptProps } from '../../../lib/seo';
import FaqClient from './FaqClient';

export const metadata: Metadata = buildMeta({
  title: 'FAQ — Frequently Asked Questions | MegiLance Freelance Platform Help',
  description: 'Get answers to common questions about MegiLance: how AI matching works, service fees (5%), escrow payments, how to hire freelancers, data security, and real-time messaging.',
  path: '/faq',
  keywords: getKeywordsForPage(['informational', 'brand'], [
    'megilance faq', 'freelance platform questions', 'how does escrow work freelancing',
    'freelance platform fees explained', 'is megilance safe', 'how to hire on megilance',
    'megilance vs upwork fees', 'freelance platform help',
  ]),
});

const faqJsonLd = buildFAQJsonLd([
  { question: 'What is MegiLance?', answer: 'MegiLance is an AI-powered freelancing platform that connects clients with top-tier freelancers using intelligent matching, secure escrow payments, and real-time collaboration tools.' },
  { question: 'What are the fees?', answer: 'MegiLance charges a flat 5% service fee — significantly lower than competitors who charge 10–20%. There are no hidden costs.' },
  { question: 'How does escrow work?', answer: 'When you hire a freelancer, funds are held in escrow and released milestone-by-milestone as work is completed and approved. This protects both clients and freelancers.' },
  { question: 'How does AI matching work?', answer: 'Our matching engine analyzes skills, project requirements, budget, past performance, and communication style to recommend the best freelancers — not just keyword matches, but true compatibility scores.' },
  { question: 'What payment methods are accepted?', answer: 'We support Stripe (credit/debit cards), bank transfers, and cryptocurrency payments. Freelancers can withdraw via multiple methods.' },
]);

export default function FaqPage() {
  return (
    <>
      <script {...jsonLdScriptProps(faqJsonLd)} />
      <FaqClient />
    </>
  );
}
