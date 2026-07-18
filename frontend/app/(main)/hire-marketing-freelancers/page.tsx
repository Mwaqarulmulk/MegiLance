import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Megaphone, ArrowRight, TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Hire Marketing Freelancers | Vetted Digital Marketers | MegiLance',
  description: 'Hire top marketing freelancers for SEO, paid ads, email marketing, social media, and content strategy. Vetted experts available at 0% client fees on MegiLance.',
  path: '/hire-marketing-freelancers',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'hire marketing freelancers', 'freelance digital marketer',
    'hire social media freelancer', 'freelance seo expert', 'freelance email marketer',
  ]),
});

export default function HireMarketingFreelancersPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 mb-4 dark:bg-orange-950 dark:text-orange-300">
          <Megaphone size={13} />
          Marketing Talent Hub
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Hire Top Marketing Freelancers
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Connect with vetted freelance digital marketers, SEO specialists, content strategists, and social media managers. Scale your marketing campaigns with confidence.
        </p>
      </header>

      {/* Specializations */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Marketing Specializations Available</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Marketing success requires specialized expertise. Whether you need SEO rankings, paid advertising ROI, or brand-building social content, MegiLance connects you to specialists in every marketing discipline.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <TrendingUp className="text-orange-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">SEO &amp; Content Marketing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Drive organic traffic with expert SEO audits, keyword strategies, and high-quality content that ranks.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Target className="text-orange-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Paid Media &amp; PPC</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Reduce CPA and maximize ad spend with Google Ads, Meta Ads, and programmatic campaign specialists.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Users className="text-orange-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Social Media Management</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Build communities and grow your following on LinkedIn, Instagram, X, and TikTok with proven social media freelancers.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-orange-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email Marketing &amp; CRM</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Increase open rates and revenue with funnel-savvy email marketers experienced in Mailchimp, Klaviyo, and HubSpot.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-orange-600 to-rose-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Post a Marketing Project Today</h2>
        <p className="text-orange-100 max-w-xl mx-auto mb-6">
          Describe your campaign goals and receive proposals from vetted marketing freelancers within hours. Clients always pay 0% fees.
        </p>
        <Link
          href="/client/find-talent"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-orange-600 hover:scale-[1.02] transition-transform"
        >
          Find Marketing Experts <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How much do freelance marketers charge?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Rates vary by specialization and experience. SEO specialists typically charge $40–$120/hr, social media managers $30–$80/hr, and PPC experts $50–$150/hr. Use our rate calculator to estimate project budgets.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How do I verify a marketing freelancer's results?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              MegiLance profiles include verified case studies, past campaign results, and client reviews with specific outcome metrics so you can evaluate ROI evidence before hiring.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
