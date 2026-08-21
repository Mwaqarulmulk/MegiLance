import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowRight, Sparkles, MessageSquare, CheckCircle2, Shield, Zap, Award } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'How does the MegiLance AI Proposal Writer increase win rates?',
    answer: 'The AI analyzes the client brief, extracts technical requirements and deliverables, and drafts a structured, high-impact proposal with clear milestone breakdowns rather than generic boilerplate.',
  },
  {
    question: 'Is the freelance proposal generator free to use?',
    answer: 'Yes! The tool is 100% free with zero signup barrier. You can generate unlimited proposals and copy or save them directly.',
  },
  {
    question: 'How do proposals connect to live freelance projects on MegiLance?',
    answer: 'Once you find a matching project on MegiLance, you can submit your generated proposal with 0% platform fee deducted from your payout upon milestone completion.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Free AI Freelance Proposal Generator & Cover Letter Writer | MegiLance',
  description: 'Generate high-converting freelance proposals, client cover letters, and milestone pitch decks tailored to job requirements. 100% free with 0% platform fee.',
  path: '/freelance-proposal-generator',
  keywords: getKeywordsForPage(['transactional', 'informational', 'longTail'], [
    'freelance proposal generator', 'ai proposal writer', 'freelance cover letter generator',
    'upwork proposal generator', 'freelance bid generator', 'client proposal template'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'AI Tools', path: '/ai' },
      { name: 'Proposal Generator', path: '/freelance-proposal-generator' },
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 mb-4 dark:bg-orange-950 dark:text-orange-300">
            <FileText size={13} />
            Proposal Intelligence &amp; Pitching
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Free AI Freelance Proposal Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create high-converting, personalized freelance proposals in seconds. Tailored to job requirements, technical stacks, and milestone deliverables.
          </p>
        </header>

        {/* 3-Pillar Proposal Formula */}
        <section className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { step: '01. The Hook', desc: 'Direct technical empathy addressing the client\'s core challenge in the first 2 sentences.', icon: Sparkles },
            { step: '02. WBS Deliverables', desc: 'Concrete sprint milestones with transparent timelines and verifiable outputs.', icon: Zap },
            { step: '03. Proof & Escrow', desc: 'Verified past case studies and code-inspected escrow guarantee terms.', icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{item.step}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Use the MegiLance AI Proposal Writer?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Writing custom proposals for multiple high-value briefs takes hours. Generic templates get filtered out by clients within 3 seconds. Our AI analyzes the exact client brief, highlights your relevant tech skills, and builds structured deliverables that maximize your win rate.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Sparkles className="text-orange-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Tailored Technical Copy</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Generate copy that directly addresses job constraints, frameworks, and required APIs.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MessageSquare className="text-orange-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">High-Impact Professional Tone</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Maintains an objective, execution-focused tone that reassures clients of your competency.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Try the AI Proposal Writer Live</h2>
          <p className="text-orange-100 max-w-xl mx-auto mb-6">
            Paste the job brief and your skill specialties to automatically generate an optimized proposal.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/ai/proposal-writer" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-orange-700 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Open AI Proposal Writer</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/explore" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Find Freelance Projects</span>
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
