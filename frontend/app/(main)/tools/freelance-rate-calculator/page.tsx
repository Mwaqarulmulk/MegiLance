import type { Metadata } from 'next';
import { Suspense } from 'react';
import RateAdvisor from '@/app/ai/rate-advisor/RateAdvisor';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';
import { 
  buildMeta, 
  buildFAQJsonLd, 
  buildAIToolJsonLd, 
  jsonLdScriptProps, 
  getKeywordsForPage 
} from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = buildMeta({
  title: 'Free Freelance Rate Calculator | Find Your Hourly & Freelance Writer Rates',
  description: 'Use our free freelance rate calculator to discover your ideal hourly rates, freelance writer rates, and designer wages based on expenses and net targets.',
  path: '/tools/freelance-rate-calculator',
  keywords: getKeywordsForPage(['longTail', 'features'], [
    'free freelance rate calculator', 'freelance writer rates', 'freelance rate calculator',
    'freelancer hourly rate calculator', 'calculate freelance rates', 'freelancer rate advisor'
  ]),
});

const faqs = [
  {
    question: 'How do I calculate my freelance hourly rate?',
    answer: 'Enter your target annual salary, expected business expenses, billable hours per week, and vacation weeks. The calculator will determine the base rate you need to charge to cover taxes, overhead, and reach your income goals.',
  },
  {
    question: 'Why is freelance rate calculations different than salary?',
    answer: 'Freelancers must cover their own health insurance, self-employment taxes (e.g. FICA), unpaid vacation, administrative tasks, and hardware. Therefore, your freelance rate needs to be 1.5x to 2x your equivalent salaried rate.',
  },
  {
    question: 'Can I save and compare different rate scenarios?',
    answer: 'Yes, our rate advisor allows you to adjust target utilization and tax rates to project monthly, quarterly, and yearly net income, helping you price projects with confidence.',
  },
];

export default function FreelanceRateCalculatorPage() {
  const jsonLd = [
    buildAIToolJsonLd(
      "Freelance Rate Calculator",
      "Calculate your optimal freelance hourly rate and project self-employed billings. Compare rates across skills, experience, and global platforms.",
      "/tools/freelance-rate-calculator",
      "4.8",
      "145"
    ),
    buildFAQJsonLd(faqs),
  ];

  return (
    <>
      <script {...jsonLdScriptProps(...jsonLd)} />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Heading & Intro */}
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Freelance Rate Calculator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-350 mb-6">
              Determine your ideal hourly and project rates to cover taxes, overhead, savings, and target income. Compare your rates against global market database benchmarks.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-100 dark:border-blue-900/50">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>Beta Preview: Live Market Rates (July 2026)</span>
            </div>
          </header>

          {/* Embedded Interactive Wizard */}
          <section className="mb-12 shadow-md rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
            <Suspense fallback={
              <div className="p-8 text-center animate-pulse">
                <p className="text-slate-600 dark:text-slate-400">Loading Freelance Rate Advisor...</p>
              </div>
            }>
              <RateAdvisor />
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
              <Link href="/tools/project-scope-generator" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                Scope Planner →
              </Link>
              <span className="text-slate-350">|</span>
              <Link href="/tools/milestone-generator" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                Milestone Generator →
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
