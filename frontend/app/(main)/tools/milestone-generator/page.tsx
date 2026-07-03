import type { Metadata } from 'next';
import { Suspense } from 'react';
import ScopePlanner from '@/app/ai/scope-planner/ScopePlanner';
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
  title: 'Free Freelance Milestone Generator | AI Escrow Planner',
  description: 'Break your freelance projects into clear timeline phases, deliverables, and payment milestones. Optimize project scoping for secure escrow payouts.',
  path: '/tools/milestone-generator',
  keywords: getKeywordsForPage(['longTail', 'features'], [
    'milestone generator', 'escrow milestone planner', 
    'freelance milestones planner', 'AI payment milestone creator', 'project timeline phases generator'
  ]),
});

const faqs = [
  {
    question: 'What is a project milestone?',
    answer: 'A milestone is a key deliverable stage in a freelance project that represents completed work. In MegiLance, milestones are linked to escrow payments: the client deposits funds into escrow for the active milestone, and funds are released when deliverables are verified.',
  },
  {
    question: 'How many milestones should a project have?',
    answer: 'Typically, 3 to 5 milestones are ideal. Small projects may have 2 milestones (50% upfront, 50% on completion), while larger software projects might have weekly or bi-weekly milestones linked to specific feature rollouts.',
  },
  {
    question: 'Can I import generated milestones into a contract?',
    answer: 'Yes! After creating your milestones with our AI planner, you can directly turn them into a contract draft on MegiLance to protect your project budget in secure milestone escrow.',
  },
];

export default function MilestoneGeneratorPage() {
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
              AI Escrow & Milestone Generator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-350 mb-6">
              Break down project timelines into clear, verifiable milestones and labor budgets. Perfect for setting up structured smart-contract milestone escrows between clients and freelancers.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-100 dark:border-blue-900/50">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>Beta Preview: Escrow Integration (July 2026)</span>
            </div>
          </header>

          {/* Embedded Interactive Wizard */}
          <section className="mb-12 shadow-md rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
            <Suspense fallback={
              <div className="p-8 text-center animate-pulse">
                <p className="text-slate-600 dark:text-slate-400">Loading AI Milestone Planner...</p>
              </div>
            }>
              <ScopePlanner />
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
              <Link href="/tools/proposal-reviewer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                Proposal Writer →
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
