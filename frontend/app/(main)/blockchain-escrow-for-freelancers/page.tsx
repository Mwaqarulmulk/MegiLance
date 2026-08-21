import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck, Database, HelpCircle, CheckCircle2, Shield, Zap } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'How does milestone escrow protect both clients and freelancers?',
    answer: 'Clients pre-fund specific milestone deliverables into a neutral vault before work begins. The freelancer works with guaranteed payment assurance, and funds release only upon client inspection and approval.',
  },
  {
    question: 'What currencies and payment gateways are supported?',
    answer: 'MegiLance supports multi-currency payments via major credit cards, Stripe, bank wire, and stablecoin cryptocurrency settlements with instant payout release.',
  },
  {
    question: 'What happens if there is a deliverable disagreement?',
    answer: 'Our transparent dispute resolution safeguards pause escrow release while an objective mediator evaluates original brief specs, deliverables, and workroom logs to settle fairly.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Milestone Escrow & Payment Protection for Freelancers | MegiLance',
  description: '100% pre-funded milestone escrow payments for freelance developers and clients. Eliminate non-payment risk and chargebacks with automated milestone vaults.',
  path: '/blockchain-escrow-for-freelancers',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'blockchain escrow for freelancers', 'smart contract escrow freelance', 'secure freelance payments',
    'freelance milestone escrow', 'safe freelance payment platform', 'escrow payment protection'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Trust & Security', path: '/trust' },
      { name: 'Milestone Escrow', path: '/blockchain-escrow-for-freelancers' },
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 dark:bg-indigo-950 dark:text-indigo-300">
            <Lock size={13} />
            Financial Security &amp; Escrow
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Milestone Escrow Protection for Freelancers &amp; Clients
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate non-payment risk, chargebacks, and delivery friction. Lock milestone funds securely and release them instantly upon verified deliverable approval.
          </p>
        </header>

        {/* 3-Step Escrow Lifecycle */}
        <section className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { step: '1. Milestone Deposit', desc: 'Client deposits milestone budget into neutral escrow before contractor starts work.', icon: Lock },
            { step: '2. Live Sprint Execution', desc: 'Collaborate in real-time workrooms, share commits, and review staging builds.', icon: Zap },
            { step: '3. Instant Release', desc: 'Deliverable approved → funds release directly to freelancer with 0% platform fee.', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{item.step}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Pre-Funded Milestone Escrow is Essential</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Traditional freelancing forces contractors to work on credit or demands clients pay 100% upfront before seeing results. MegiLance solves this dilemma with code-enforced milestone escrow vaults that protect both parties equally.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <ShieldCheck className="text-indigo-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Guaranteed Payout Security</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers work with 100% confidence knowing milestone capital is pre-funded.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Lock className="text-indigo-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Deliverable Sign-Off Control</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Clients inspect source code or designs before releasing escrowed funds.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Work with 100% Escrow Protection</h2>
          <p className="text-indigo-100 max-w-xl mx-auto mb-6">
            Post a project for free or create a verified freelancer profile with instant milestone payouts.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/security/escrow" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-indigo-750 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>View Escrow Architecture</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Get Started Free</span>
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
