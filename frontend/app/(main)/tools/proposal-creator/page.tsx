import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PenTool, ArrowRight, Sparkles, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildAIToolJsonLd, buildFAQJsonLd, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Free AI Proposal Creator | Write Winning Freelance Bids',
  description: 'Write tailored project bids instantly with our free AI proposal creator. Grounded in the best generative AI models for fast proposal writing on Upwork and MegiLance.',
  path: '/tools/proposal-creator',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'proposal creator', 'best ai for proposal writing',
    'best generative ai for fast proposal writing', 'freelance proposal generator', 'write project bids'
  ]),
});

export default function ProposalCreatorPage() {
  const aiToolJsonLd = buildAIToolJsonLd(
    'Free AI Proposal Creator',
    'Write winning freelance proposals and bids in seconds using advanced generative AI. Tailored to each project, compatible with Upwork, Fiverr, and MegiLance.',
    '/tools/proposal-creator',
    '4.9',
    '198'
  );

  const faqJsonLd = buildFAQJsonLd([
    { question: 'Is the proposal creator free to use?', answer: 'Yes, the AI proposal creator is completely free. Guests get up to 5 proposals per day, while verified MegiLance freelancers get unlimited access.' },
    { question: 'Which platforms support the generated proposals?', answer: 'You can copy and use the AI-generated proposals on any platform including Upwork, Freelancer.com, Toptal, and MegiLance.' },
    { question: 'What makes a good freelance proposal?', answer: 'A winning proposal directly addresses the client\'s specific requirements, showcases relevant experience, proposes a clear timeline and milestones, and maintains a professional but personable tone. Our AI tailors every proposal to the specific job posting.' },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(aiToolJsonLd, faqJsonLd, buildBreadcrumbJsonLd([{ name: 'AI Tools', path: '/tools' }, { name: 'Proposal Creator', path: '/tools/proposal-creator' }]))} />
      <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
          <PenTool size={13} />
          AI Writing Suite
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Free AI Proposal Creator &amp; Bid Writer
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Draft high-converting freelance proposals in seconds. Utilize the best generative AI for fast proposal writing to win more contracts on global marketplaces.
        </p>
      </header>

      {/* Benefits Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Use generative AI for Proposal Writing?</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Applying to jobs takes time, and generic template copies get ignored. Our AI proposal creator scans specific project requirements, matches them to your user profile skills, and generates a personalized, highly tailored cover letter.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Sparkles className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Fast Generative Drafts</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Generate complete, contextual drafts in under 5 seconds using customized tone-of-voice options.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MessageSquare className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Align with Project Requirements</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Directly address client constraints, budget thresholds, timelines, and technical tools requested in the brief.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldAlert className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Audit Against AI Flags</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ensure your cover letter sounds natural and doesn't trigger client spam filters or automated blocking.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Integrated into MegiLance</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Easily save and load generated proposals during active bids on the MegiLance project ecosystem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Open the AI Proposal Writer</h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-6">
          Access our fully interactive AI suite to write proposals, estimate prices, and audit your freelance profile match scores.
        </p>
        <Link 
          href="/ai/proposal-writer" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-blue-650 hover:scale-[1.02] transition-transform"
        >
          Draft Proposals Instantly <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Is the proposal creator free to use?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Yes, our proposal generator is completely free. Guests can write up to 5 proposals per day, while verified MegiLance freelancers get unlimited access.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Which platforms are supported?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              While integrated into MegiLance, you can copy, edit, and use the generated proposal drafts on Upwork, Freelancer.com, Toptal, or other job portals.
            </p>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
