import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck, HelpCircle, CheckCircle2, Shield, Zap, DollarSign } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'How do smart contract escrow agreements work on MegiLance?',
    answer: 'Contract terms and payment amounts are encoded into an immutable escrow vault. Funds remain securely locked and are programmatically released to the freelancer as milestones are approved.',
  },
  {
    question: 'Do I need crypto experience to use smart contract escrow?',
    answer: 'No! MegiLance seamlessly bridges traditional bank/card payments and digital asset settlement, allowing clients to pay in USD/EUR and freelancers to receive payouts in their preferred currency.',
  },
  {
    question: 'Are there hidden transaction fees?',
    answer: 'No. MegiLance operates with 0% platform commission fee during launch. You only pay standard third-party processing network costs.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Smart Contract Escrow for Freelancers | MegiLance',
  description: 'Automated milestone escrow agreements and instant contract payouts. Eliminate payment delays and non-payment risks with transparent escrow protection.',
  path: '/smart-contract-escrow-for-freelancers',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'smart contract escrow for freelancers', 'decentralized freelance escrow',
    'crypto escrow freelance', 'milestone escrow smart contract', 'secure freelance transactions'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Security', path: '/security' },
      { name: 'Smart Contract Escrow', path: '/smart-contract-escrow-for-freelancers' },
    ]),
    buildFAQJsonLd(PAGE_FAQS),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-950 dark:text-emerald-300">
            <Lock size={13} />
            Automated Escrow Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Smart Contract Escrow for Freelancers
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate non-payment risk and arbitrary account freezes. Pre-funded milestone vaults ensure transparent financial protection for both sides.
          </p>
        </header>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Code-Enforced Financial Safety</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Traditional freelancing portals hold contractor funds in proprietary black boxes subject to delayed clearance times and high markup fees. MegiLance provides transparent milestone vaults that release immediately upon deliverable sign-off.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Mutual Milestone Protection</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers work knowing funds are pre-funded; clients release funds only after deliverable inspection.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Lock className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Zero Intermediary Clawbacks</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Funds cannot be arbitrarily drained or withheld without verified dispute mediation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Experience Secure Freelance Escrow</h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-6">
            Create an account today to post a project or build a verified freelancer profile with milestone protection.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/security/escrow" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-750 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Explore Security Architecture</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Create Free Account</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {PAGE_FAQS.map((faq) => (
              <div key={faq.question} className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
