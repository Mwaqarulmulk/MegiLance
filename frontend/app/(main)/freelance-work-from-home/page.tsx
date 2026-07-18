import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Laptop, ArrowRight, Code, BrainCircuit, Search, Award } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Work From Home Jobs & Remote IT Careers | MegiLance',
  description: 'Find premium freelance work from home jobs and remote IT freelance opportunities. Explore top coding websites and get matched with high-paying projects.',
  path: '/freelance-work-from-home',
  keywords: getKeywordsForPage(['transactional', 'informational'], [
    'freelance work from home', 'job freelance it', 'freelance coding websites',
    'remote programming jobs', 'work from home developers'
  ]),
});

export default function FreelanceWorkFromHomePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 dark:bg-indigo-950 dark:text-indigo-300">
          <Laptop size={13} />
          Remote Work Opportunities
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Freelance Work From Home &amp; IT Jobs
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Unlock the freedom of working from anywhere. Get matched with global tech companies hiring remote programmers, UI/UX designers, and IT professionals.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why MegiLance is the Top Freelance Coding Website</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Traditional platforms lock you in with heavy commission fees, poor job matching, and delayed payouts. MegiLance empowers tech workers by introducing zero-commission freelancing, secure escrow budgets, and smart AI talent matching.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Code className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Premium IT &amp; Developer Gigs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Discover projects targeting React, Next.js, Node.js, Python, Django, AWS, and blockchain development.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <BrainCircuit className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI-Powered Job Matching</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Skip the application pile. Our engine ranks you based on skills and delivers your profile to matched clients.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Search className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Easy Remote Job Search</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Filter jobs by budget, duration, technical stack, and client verification status to find your fit.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Award className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Zero Commission on Earnings</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Keep up to 100% of your earnings. Take back control of your financial growth and career roadmap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Browse Active Project Listings</h2>
        <p className="text-indigo-100 max-w-xl mx-auto mb-6">
          Find your next work-from-home project. Vetted jobs in software engineering, mobile development, design, and writing are posted daily.
        </p>
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-indigo-650 hover:scale-[1.02] transition-transform"
        >
          Explore Projects Now <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How do I start freelancing from home on MegiLance?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Create a free account, complete your profile with your developer/creative skills, link your portfolio, and apply to jobs directly in the explore marketplace.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I work for international clients from any country?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Yes, MegiLance is a global platform. As long as you have an internet connection and the required skills, you can collaborate with clients worldwide.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
