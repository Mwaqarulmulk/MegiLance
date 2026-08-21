import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ArrowRight, ShieldCheck, ClipboardList, CheckCircle2, Clock, Zap, DollarSign } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'What is a Freelance Work Breakdown Structure (WBS)?',
    answer: 'A WBS divides a large project into smaller, manageable milestone deliverables with specific acceptance criteria, hours, and pre-funded escrow amounts.',
  },
  {
    question: 'How does the Scope Planner prevent scope creep?',
    answer: 'By locking agreed deliverable checkpoints and milestone criteria into the contract before work begins, any additional feature requests are formally managed as new milestones.',
  },
  {
    question: 'Can I convert a generated scope into a live project on MegiLance?',
    answer: 'Yes! Clients can post a project directly from their generated scope in 1 click, and freelancers can attach scopes to proposals with 0% platform commission.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Milestone Scope Planner & Work Breakdown Generator | MegiLance',
  description: 'Plan freelance project deliverables, create WBS milestone roadmaps, and prevent scope creep with our free AI scope planner tool.',
  path: '/freelance-project-scope-planner',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'freelance project scope planner', 'wbs milestone generator', 'freelance deliverable planner',
    'project scope template', 'freelance sprint planner', 'milestone contract builder'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'AI Tools', path: '/ai' },
      { name: 'Scope Planner', path: '/freelance-project-scope-planner' },
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
            <Layers size={13} />
            Milestone Scoping &amp; WBS Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Freelance Project Scope Planner
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Break complex briefs into crystal-clear sprint deliverables, timelines, and pre-funded milestone escrow checkpoints. Prevent scope creep before writing a single line of code.
          </p>
        </header>

        {/* 4-Stage WBS Hierarchy Grid */}
        <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { phase: 'Phase 1: Architecture', desc: 'Tech stack setup, design tokens, DB schema' },
            { phase: 'Phase 2: Core Build', desc: 'Key features, API handlers, auth logic' },
            { phase: 'Phase 3: Integration', desc: 'Third-party APIs, Stripe escrow, staging' },
            { phase: 'Phase 4: QA & Launch', desc: 'E2E tests, security audit, code handover' },
          ].map((wbs, idx) => (
            <div key={wbs.phase} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 block mb-1">M0{idx + 1}</span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{wbs.phase}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{wbs.desc}</p>
            </div>
          ))}
        </section>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Use an AI Project Scope Planner?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Vague project briefs are the #1 cause of freelance disputes, delayed payments, and uncompensated scope creep. A structured scope planner aligns both client expectations and contractor deliverables down to exact sprint criteria.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <ClipboardList className="text-indigo-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Lock Down Verifiable Deliverables</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Establish concrete acceptance checkpoints so work terms remain unambiguous.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="text-indigo-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Direct Milestone Escrow Binding</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Convert your finalized project scope directly into a pre-funded escrow contract.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Try the AI Scope Planner Live</h2>
          <p className="text-indigo-100 max-w-xl mx-auto mb-6">
            Input your project goals to automatically generate a structured breakdown of tasks, milestone roadmaps, and estimated timelines.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/ai/scope-planner" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-indigo-700 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Open AI Scope Planner</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/create-project" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Post Scope as Project</span>
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
