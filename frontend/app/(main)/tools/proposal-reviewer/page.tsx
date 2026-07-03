import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProposalWriter from '@/app/ai/proposal-writer/ProposalWriter';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';
import { 
  buildMeta, 
  buildFAQJsonLd, 
  buildSoftwareAppJsonLd, 
  jsonLdScriptProps, 
  getKeywordsForPage 
} from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = buildMeta({
  title: 'Free AI Proposal Writer & Reviewer | Write Winning Bids',
  description: 'Write and audit freelance proposals instantly using AI. Check matching percentage, proposal quality scores, and receive tips to win more projects.',
  path: '/tools/proposal-reviewer',
  keywords: getKeywordsForPage(['longTail', 'features'], [
    'freelance proposal generator', 'proposal reviewer', 
    'write freelance proposals', 'proposal template maker', 'how to write winning proposals'
  ]),
});

const faqs = [
  {
    question: 'How does the AI proposal reviewer work?',
    answer: 'It compares your proposal draft or skills profile against the target project description. It highlights matched skills, detects missing trust signals, rates your bid quality, and provides actionable improvement tips.',
  },
  {
    question: 'Can freelancers use this to write proposals?',
    answer: 'Absolutely. It functions as a proposal generator. Simply enter the project title and description, and the AI will draft a highly professional, tailored response in your preferred tone.',
  },
  {
    question: 'How do clients benefit from a proposal reviewer?',
    answer: 'Clients can copy and paste incoming bids into the tool to analyze whether the freelancer has truly understood the project description or if the proposal is a generic AI copy-paste.',
  },
];

export default function ProposalReviewerPage() {
  const jsonLd = [
    buildSoftwareAppJsonLd(),
    buildFAQJsonLd(faqs),
  ];

  return (
    <>
      <script {...jsonLdScriptProps(jsonLd)} />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Heading & Intro */}
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              AI Proposal Writer & Reviewer
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-350 mb-6">
              Draft tailored freelance proposals or review existing bids. Evaluate skill matching, bid rates, quality scores, and missing contract elements to maximize your hiring success.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-100 dark:border-blue-900/50">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>Beta Preview: Writing Intelligence (July 2026)</span>
            </div>
          </header>

          {/* Embedded Interactive Wizard */}
          <section className="mb-12 shadow-md rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
            <Suspense fallback={
              <div className="p-8 text-center animate-pulse">
                <p className="text-slate-600 dark:text-slate-400">Loading AI Proposal Writer...</p>
              </div>
            }>
              <ProposalWriter />
            </Suspense>
          </section>

          {/* FAQs & Informational Resources */}
          <section className="max-w-3xl mx-auto bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-850 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="border-b border-slate-100 dark:border-slate-850 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Growth Linkage Hub / Cross Linking */}
          <footer className="text-center bg-slate-100 dark:bg-slate-950/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Other Free AI Freelance Tools</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
              <Link href="/tools/ai-project-cost-estimator" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                Cost Estimator →
              </Link>
              <span className="text-slate-350">|</span>
              <Link href="/tools/freelance-rate-calculator" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                Rate Calculator →
              </Link>
              <span className="text-slate-350">|</span>
              <Link href="/tools/project-scope-generator" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                Scope Planner →
              </Link>
              <span className="text-slate-350">|</span>
              <Link href="/tools/milestone-generator" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                Milestone Generator →
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
