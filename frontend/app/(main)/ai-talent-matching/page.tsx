import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowRight, BrainCircuit, ShieldAlert, Star, Users } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';
import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';

export const metadata: Metadata = buildMeta({
  title: 'AI Talent Matching Engine | Instant Vetted Recommendations',
  description: 'Learn how MegiLance\'s AI talent matching engine scans portfolios, reviews, and test scores to deliver top-rated freelancer recommendations.',
  path: '/ai-talent-matching',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'ai talent matching', 'freelancer match score', 'candidate matching engine',
    'hire developers matching score', 'find freelancers intelligent match'
  ]),
});

export default function AiTalentMatchingPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 dark:bg-indigo-950 dark:text-indigo-300">
          <Sparkles size={13} />
          Matching Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          AI Talent Matching Engine
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Skip the endless scrolling. Our AI analyzes profiles, reviews, and past performance to recommend the perfect candidates for your projects.
        </p>

        {/* Lottie AI Automation Agent Showcase */}
        <div className="mt-8 flex justify-center">
          <BrandLottiePlayer
            src="/lottie/02_ai_automation_agent.json"
            ariaLabel="AI Automation Agent Matching Animation"
            className="w-full max-w-md h-56 md:h-72"
            framed={true}
            glow={true}
          />
        </div>
      </header>

      {/* Benefits Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How Intelligent Matching Works</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          MegiLance replaces ad-hoc bidding with data-driven recruitment metrics. Our neural matching engine calculates a candidate match percentage by scanning project briefs for technical skills and cross-referencing freelancer historical success rates.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <BrainCircuit className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Semantic Requirements Analysis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Natural language processing analyzes the context of your brief to determine mandatory vs. optional skills.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Star className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Historical Success Audits</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Evaluate candidates based on positive sentiment score trends, milestone adherence, and budget metrics.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldAlert className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Scam and Quality Checks</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Deter duplicate profile entries, fake review logs, and copy-pasted generic proposals automatically.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Users className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Instant Invitations</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Invite matched freelancers to bid directly from the client dashboard, cutting time-to-hire by 70%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Simulate a Matching Score</h2>
        <p className="text-indigo-100 max-w-xl mx-auto mb-6">
          Test our matching engine simulator by entering project requirements and viewing match ratings instantly.
        </p>
        <Link 
          href="/tools/freelancer-match-score" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-indigo-700 hover:scale-[1.02] transition-transform"
        >
          Open Match Simulator <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How long does matching take?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              The matching calculations are processed in real-time and return recommendations within milliseconds after posting a project.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How are hourly rates accounted for?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              The AI matching engine filters candidate target rates against your budget scope, highlighting candidates that offer optimal value and market competitive pricing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
