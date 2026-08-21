import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, ArrowRight, ShieldCheck, Heart, CheckCircle2, Zap, DollarSign, Wallet } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'How do Pakistani freelancers withdraw earnings on MegiLance?',
    answer: 'Freelancers can withdraw their escrow-released earnings via direct local bank transfer, Payoneer, wire transfer, and multi-currency stablecoin (USDC/USDT) wallets with 0% platform fee deduction.',
  },
  {
    question: 'How does MegiLance compare to Upwork and Fiverr for Pakistani talent?',
    answer: 'While Upwork and Fiverr deduct 10% to 20% in commission fees plus high currency withdrawal markups, MegiLance charges 0% platform fees during our launch period, allowing Pakistani freelancers to retain 100% of their client payments.',
  },
  {
    question: 'Are there any upfront charges or paid connects required to bid?',
    answer: 'No! MegiLance does not charge for bid connects or proposal tokens. Freelancers are matched objectively by technical capability and verified portfolio samples.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Top Freelancing Platform for Pakistani Freelancers | 0% Commission — MegiLance',
  description: 'Join thousands of Pakistani software engineers, UI/UX designers, and digital experts on MegiLance. 0% platform fees, fast local withdrawals, and instant AI matching.',
  path: '/freelancing-platform-for-pakistani-freelancers',
  keywords: getKeywordsForPage(['transactional', 'informational', 'longTail'], [
    'freelancing platform for pakistani freelancers', 'freelancing websites in pakistan',
    'best freelance platform for pakistan', 'freelance jobs for pakistani developers',
    'zero fee freelance platform pakistan', 'online earning websites in pakistan'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Global Hubs', path: '/explore' },
      { name: 'Pakistan Freelancers', path: '/freelancing-platform-for-pakistani-freelancers' },
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
            <Globe size={13} />
            Global Access &amp; Direct Local Settlements
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            The Premier Freelancing Platform for Pakistani Talent
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate 20% platform commission deductions, solve banking delays, and connect directly with high-budget international clients with guaranteed milestone escrow.
          </p>
        </header>

        {/* 3 Major Advantages */}
        <section className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { title: '0% Platform Fee', desc: 'Keep 100% of your earnings. Save up to $2,000+ per $10k earned compared to legacy platforms.', icon: DollarSign },
            { title: 'Multi-Channel Payouts', desc: 'Fast withdrawals via local bank transfer, Payoneer, and instant stablecoin crypto rails.', icon: Wallet },
            { title: 'Objective AI Matching', desc: 'Rank by verified technical skills and client reviews rather than paid bid connects.', icon: Zap },
          ].map((adv) => {
            const Icon = adv.icon;
            return (
              <div key={adv.title} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{adv.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{adv.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Empowering Pakistan's 3M+ Freelancer Community</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Pakistan is one of the world's fastest-growing tech talent hubs. Yet developers and creatives lose thousands of dollars each year to platform commission fees, payment corridor restrictions, and arbitrary account freezes. MegiLance provides guaranteed milestone escrow, 0% platform fee, and direct global client collaboration.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Heart className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Guaranteed Milestone Payouts</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">All client funds are pre-funded before work begins, eliminating non-payment risk.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Free AI Business Tool Suite</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Use our AI proposal writer, contract generator, and rate advisor completely free.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Join MegiLance Freelancers Today</h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-6">
            Create your verified profile, showcase your portfolio, and apply for high-value international projects with 0% platform fees.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/signup?role=freelancer" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-750 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Create Free Profile</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/freelancer/projects" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Browse Active Jobs</span>
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
