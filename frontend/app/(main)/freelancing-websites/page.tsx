import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ArrowRight, Award, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Best Freelancing Websites & Platforms | MegiLance',
  description: 'Explore the best freelancing websites and top freelancing sites. Compare Upwork, Fiverr, and MegiLance\'s zero-commission freelance platform model.',
  path: '/freelancing-websites',
  keywords: getKeywordsForPage(['transactional', 'informational'], [
    'freelancing websites', 'freelancing sites', 'best freelance websites',
    'top 10 freelance platforms', 'best freelance platform'
  ]),
});

export default function FreelancingWebsitesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
          <Layers size={13} />
          Marketplace Reviews
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Best Freelancing Websites &amp; Platforms
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Compare the top freelancing sites to choose the right marketplace for your business. Discover how MegiLance eliminates traditional platform fees.
        </p>
      </header>

      {/* Comparison Overview */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How MegiLance Redefines the Gig Economy</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Most freelancing websites tax your hard work by taking 10% to 20% of your earnings, while charging clients hidden handling fees. MegiLance introduces a zero-commission model, secure escrow deposits, and verified profiles to maximize success.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Award className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">0% Commission Model</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers keep 92% to 100% of their billings, while clients enjoy fee-free project postings.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Zap className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Smart Match Engine</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avoid spam proposals. Our AI system matches clients directly to verified specialists instantly.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Secure Milestone Escrows</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Secure payment reserves protect both parties. Release funds only after successfully reviewing deliverables.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Comprehensive Tool Suite</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Built-in AI invoice generators, legal contract builders, and expense trackers simplify your business operations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Link Callout */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Compare Top Freelance Sites</h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-6">
          See how MegiLance stack up against competitors like Upwork, Fiverr, Toptal, and Freelancer.com. Learn why we are the best choice.
        </p>
        <Link 
          href="/compare" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-blue-650 hover:scale-[1.02] transition-transform"
        >
          View Comparison Matrix <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What makes MegiLance one of the best freelancing websites?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              We focus on transparency and utility. By offering 0% client fees and equipping users with free AI business tools (like contract generators and rate advisors), we create a high-value workspace.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How do I transition from other platforms?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Create an account, import your portfolio details, verify your skills, and invite your existing clients to MegiLance to save on commission fees.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
