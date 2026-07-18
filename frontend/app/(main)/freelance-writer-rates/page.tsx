import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PenTool, ArrowRight, DollarSign, Award, BookOpen, CheckCircle2 } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Writer Rates Guidelines & Pricing | MegiLance',
  description: 'Understand typical freelance writer rates and how to calculate your copy pricing. Compare writer fees across niches, experience levels, and length.',
  path: '/freelance-writer-rates',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'freelance writer rates', 'how much to charge for freelance writing',
    'copywriter hourly rates', 'content writing project pricing', 'freelancer rate calculator'
  ]),
});

export default function FreelanceWriterRatesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
          <PenTool size={13} />
          Creative Writing Suite
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Freelance Writer Rates Guidelines
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Learn how to set competitive freelance writer rates. Read our comprehensive guide on hourly wages, per-word billing, and pricing structures for copy and content writing.
        </p>
      </header>

      {/* Pricing Matrix Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How Writers Calculate Rates</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Setting your rates as a writer depends on your specialized domain knowledge, years of experience, and content complexity. Whether you charge per-word, hourly, or on a flat project basis, MegiLance offers a transparent marketplace with 0% commission fees to maximize your earnings.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <DollarSign className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Hourly vs. Per-Word Pricing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Discover average industry ranges: $0.10 to $1.00 per word, or $30 to $120+ per hour for copywriting.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <BookOpen className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Writing Niche Specialization</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">High-ROI niches (such as technical writing, SaaS case studies, whitepapers, medical copy) yield premium rates.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Award className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Factor in Business Overhead</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ensure your writer rates cover self-employment taxes, health insurance, software licenses, and unpaid vacation.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI-Powered Rate Guidance</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Use our integrated rate advisor to compare your pricing details against real-world database metrics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Calculate Your Freelance Rates</h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-6">
          Use our interactive rate advisor tool to estimate your required hourly and project billing targets based on expenses and salary goals.
        </p>
        <Link 
          href="/tools/freelance-rate-calculator" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-blue-650 hover:scale-[1.02] transition-transform"
        >
          Open Rate Calculator <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Should beginner writers charge low rates?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              While beginners start lower to build a portfolio, charging too little can signal low quality. Aim for at least $0.08 per word or $25/hr as a baseline, and raise prices as you gain reviews.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How do I negotiate higher rates with clients?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Base negotiations on business results. Show how your past content drove traffic, generated signups, or improved conversions. MegiLance portfolios simplify displaying these case studies.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
