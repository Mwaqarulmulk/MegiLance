import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Cpu, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Users, Search, Award, Zap } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'How does the 7-Factor AI Talent Matching engine work?',
    answer: 'The algorithm evaluates technical skill overlap, verified repository commits, past delivery velocity, client satisfaction ratings, market rate calibration, language proficiency, and real-time availability.',
  },
  {
    question: 'How fast can clients hire matched specialists?',
    answer: 'Most clients receive their top 3 ranked specialist matches within 15 minutes of posting a project and begin work in dedicated escrow-protected workrooms within 24 hours.',
  },
  {
    question: 'What are the platform fees for hiring on MegiLance?',
    answer: 'Clients pay 0% platform fees during our initial launch. Freelancers keep 100% of their earnings with zero hidden deductions.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'AI Freelancer Matching Platform | Hire Top 1% Specialists — MegiLance',
  description: 'Connect with verified top-tier freelance developers, UI/UX designers, and AI engineers in minutes using our objective 7-factor AI matching engine. 0% fees.',
  path: '/ai-freelancer-matching-platform',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'ai freelancer matching platform', 'hire ai developers', 'ai matching freelance marketplace',
    'hire verified freelancers', 'find developers online', 'best freelance talent matching'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Hire Talent', path: '/client/find-talent' },
      { name: 'AI Matching', path: '/ai-freelancer-matching-platform' },
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600 mb-4 dark:bg-cyan-950 dark:text-cyan-300">
            <Cpu size={13} />
            Objective Talent Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            AI Freelancer Matching Platform
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate vetting fatigue and spam bidding. Connect with verified top-tier specialists using our objective 7-factor competency engine.
          </p>
        </header>

        {/* 7-Factor Compatibility Matrix */}
        <section className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { title: 'Verified Skill Overlap', desc: 'Evaluates required frameworks & libraries against verified past work.', icon: Zap },
            { title: 'Delivery Velocity', desc: 'Tracks historical sprint milestone completion times & on-time delivery.', icon: Award },
            { title: 'Code Quality Score', desc: 'Inspects past commit quality, test coverage, and repository rigor.', icon: ShieldCheck },
          ].map((factor) => {
            const Icon = factor.icon;
            return (
              <div key={factor.title} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{factor.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{factor.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How Meritocratic AI Matching Works</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Legacy platforms rank freelancers based on who pays for bid-boosts or keyword ads, resulting in poor-fit hires. MegiLance matches clients based strictly on verified technical competency, past reviews, and delivery speed.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Sparkles className="text-cyan-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Zero Paid Boosts</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers rank by demonstrated craft and client reviews, ensuring top talent wins.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="text-cyan-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Pre-Funded Escrow Handover</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Collaborate directly in dedicated workrooms with code inspection and milestone release.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Find Top Vetted Specialists Today</h2>
          <p className="text-cyan-100 max-w-xl mx-auto mb-6">
            Post your project for free, get matched with verified specialists in minutes, and collaborate in protected escrow workrooms.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/signup?role=client" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-cyan-750 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Post a Project Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/client/find-talent" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Browse Vetted Talent</span>
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
