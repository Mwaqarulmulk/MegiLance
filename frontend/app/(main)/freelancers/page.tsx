import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Hire Top Freelancers Online | Vetted Web Developers & Designers for Hire',
  description: 'Browse and hire top-rated freelancers online on MegiLance. Find web developers for hire, freelance web designers, programmers, and writers vetted by AI. Secure escrow payments.',
  path: '/freelancers',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'web developers for hire', 'web developer for hire', 'free lance web designers',
    'hire freelancers online', 'browse top freelancers', 'vetted remote developers'
  ]),
});

// @AI-HINT: Freelancers Page - renders the advanced PublicFreelancers search and filtering component
import React, { Suspense } from 'react';
import PublicFreelancers from './PublicFreelancers';
import { Users, Search } from 'lucide-react';

const FreelancersDirectoryFallback = () => (
  <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
    <header className="text-center max-w-3xl mx-auto mb-8">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mb-3">
        <Users size={14} /> Verified Talent Directory
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Hire Vetted Global Freelancers
      </h1>
      <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
        Browse independent developers, designers, writers, and specialists ready for milestone-based contracts.
      </p>
      <div className="mt-6 max-w-2xl mx-auto h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-full" />
          <div className="flex gap-1.5 pt-2">
            <div className="h-6 w-16 bg-slate-100 dark:bg-slate-850 rounded-md" />
            <div className="h-6 w-16 bg-slate-100 dark:bg-slate-850 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </main>
);

export default async function FreelancersPage() {
  return (
    <Suspense fallback={<FreelancersDirectoryFallback />}>
      <PublicFreelancers />
    </Suspense>
  );
}

