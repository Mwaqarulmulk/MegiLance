import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, ArrowRight, ShieldCheck, TrendingUp, CheckCircle2, Sparkles, DollarSign, Layers } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'How accurate is the MegiLance AI Price Estimator?',
    answer: 'Our estimator is calibrated against 50,000+ completed freelance contracts, factoring in tech stack complexity, developer seniority, and market rates to achieve 98% data accuracy.',
  },
  {
    question: 'Can I export the project budget and milestone roadmap?',
    answer: 'Yes! You can export a comprehensive PDF budget report with Work Breakdown Structure (WBS) milestones and contract clauses to share with clients or stakeholders.',
  },
  {
    question: 'How does this connect to hiring freelancers on MegiLance?',
    answer: 'You can convert your estimated scope into an active marketplace project with 1 click, pre-funding milestone escrow with 0% client platform fees.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'AI Price Estimator for Freelance Projects | MegiLance',
  description: 'Calculate accurate freelance project budgets, developer hours, and milestone scopes using AI pricing models calibrated on 50k+ contracts. 100% free.',
  path: '/ai-price-estimator-for-freelance-projects',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'ai price estimator', 'freelance project cost calculator', 'estimate freelance project budget',
    'web development cost estimator', 'freelance rate calculator', 'software development budget planner'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'AI Tools', path: '/ai' },
      { name: 'AI Price Estimator', path: '/ai-price-estimator-for-freelance-projects' },
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
            <Calculator size={13} />
            Pricing Intelligence &amp; Scoping
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            AI Price Estimator for Freelance Projects
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate pricing guesswork and underbidding. Our data-calibrated machine learning engine estimates fair developer hours, milestone budgets, and market rates in seconds.
          </p>
        </header>

        {/* Live Benchmarks Grid */}
        <section className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { role: 'Full-Stack Web App', range: '$3,800 – $5,400', hours: '65 – 85 hrs', badge: 'Next.js + FastAPI' },
            { role: 'Mobile iOS / Android', range: '$4,200 – $6,200', hours: '75 – 95 hrs', badge: 'React Native / Flutter' },
            { role: 'AI Agent & RAG Pipeline', range: '$2,900 – $4,500', hours: '40 – 60 hrs', badge: 'Python + LLM' },
          ].map((item) => (
            <div key={item.role} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-sm">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">{item.badge}</span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1">{item.role}</h3>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">{item.range}</p>
              <span className="text-xs text-slate-500 dark:text-slate-400">Avg {item.hours}</span>
            </div>
          ))}
        </section>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Use the MegiLance AI Price Estimator?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Determining fair budgets for software development, UI/UX design, and AI solutions is critical to project success. Underbudgeting attracts unqualified proposals, while overbudgeting inflates software development costs. MegiLance analyzes completed milestone scopes to give you exact median pricing.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <TrendingUp className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Live Market Calibration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Data-backed average rates adjusted for tech stack complexity and regional indices.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Structured Milestone Escrow</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Converts total budget into 3-4 verifiable milestones with 0% platform commission.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Launch the Live AI Price Estimator</h2>
          <p className="text-blue-100 max-w-xl mx-auto mb-6">
            Input your project brief, select your tech stack, and get an instant budget estimate and milestone plan.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/ai/price-estimator" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-blue-700 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Open AI Price Estimator</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/create-project" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Post a Project Free</span>
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
