import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ShieldCheck, HelpCircle, ArrowRight, Gavel, FileText, CheckCircle2, Shield, Zap } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'How are client funds held securely in escrow?',
    answer: 'Funds are deposited into an isolated, audited escrow vault before sprint execution commences. Neither party can unilaterally withdraw funds during an active milestone.',
  },
  {
    question: 'What happens during a contract dispute?',
    answer: 'If deliverables are disputed, escrow release is paused. A MegiLance arbitrator reviews the project scope, submitted deliverables, and workroom chat logs to issue an impartial ruling within 48 hours.',
  },
  {
    question: 'Does MegiLance charge an escrow processing fee?',
    answer: 'MegiLance charges 0% platform fees during our launch period, offering the most cost-effective milestone escrow protection in the industry.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Smart Contract Escrow & Payment Security Architecture | MegiLance',
  description: 'Learn how MegiLance protects project funds using pre-funded milestone escrow, automated deliverable sign-offs, and fair dispute mediation.',
  path: '/security/escrow',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'smart contract escrow payment security', 'freelance escrow protection',
    'safe freelance payments', 'milestone escrow dispute resolution', 'zero fee freelance escrow'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Security', path: '/security' },
      { name: 'Escrow Protection', path: '/security/escrow' },
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
            Payment Escrow Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Trust &amp; Escrow Security Architecture
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate payment mistrust. Our milestone escrow protocol secures project budgets before work begins, releasing funds programmatically upon verified deliverable approval.
          </p>
        </header>

        {/* The Core Problem */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Eliminating the Dual-Risk Freelancing Dilemma</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-6">
            Traditional freelancing forces one party to assume all the financial risk. MegiLance creates total symmetry with code-enforced milestone vaults:
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                <ShieldCheck size={16} />
                Freelancer Protection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero unpaid work or ghosting clients. Funds are 100% pre-funded and locked in escrow before a contractor begins writing code.
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                <Lock size={16} />
                Client Protection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Funds are released only after you review and approve the submitted source code, designs, or milestone deliverables.
              </p>
            </div>
          </div>
        </section>

        {/* Escrow Flow */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">The 4-Step Escrow Workflow</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              { step: '1', title: 'Scope & Milestone Definition', desc: 'Client and freelancer define project milestones, budgets, and clear acceptance criteria.' },
              { step: '2', title: 'Pre-Fund Escrow Vault', desc: 'Client pre-funds the sprint budget via card, bank transfer, or stablecoins.' },
              { step: '3', title: 'Work Delivery in Workroom', desc: 'Freelancer works with 100% payment assurance and uploads deliverables to the secure workroom.' },
              { step: '4', title: 'Review & Instant Release', desc: 'Client reviews submissions and approves. Funds release to the freelancer with 0% platform fee.' }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dispute Resolutions */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Gavel className="text-emerald-500" size={20} />
            Impartial Dispute Resolution Mediation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
            If a client requests extensive revisions outside the agreed scope or a contractor fails to deliver specifications, funds remain locked safely. A MegiLance moderator inspects workroom chat logs, commits, and scope criteria to issue an objective ruling.
          </p>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-center text-white shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Work with 100% Escrow Protection</h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-6">
            Whether hiring or looking for work, experience peace of mind with MegiLance's escrow-backed project workflows.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-750 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/how-it-works" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Learn How It Works</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-12">
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
