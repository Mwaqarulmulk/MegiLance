import type { Metadata } from 'next';
import { Suspense } from 'react';
import PriceEstimatorPro from '@/app/ai/price-estimator/PriceEstimatorPro';
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
  title: 'Free AI Project Cost Estimator | Calculate Development Budgets',
  description: 'Estimate your software development or design project budget instantly. MegiLance provides a free AI project cost estimator powered by real market data.',
  path: '/tools/ai-project-cost-estimator',
  keywords: getKeywordsForPage(['longTail', 'features'], [
    'free ai project cost estimator', 'AI project cost estimator',
    'project budget calculator', 'software development cost calculator'
  ]),
});

const faqs = [
  {
    question: 'How accurate is the AI project cost estimator?',
    answer: 'The estimator uses average hourly rates across 10 global regions and 100+ skills combined with complexity factors. While it provides a reliable budget range, actual freelancer quotes may vary based on exact requirements.',
  },
  {
    question: 'How does it adjust for freelancer locations?',
    answer: 'It applies Purchasing Power Parity (PPP) indices and regional cost-of-living multipliers to calculate local vs. international rate differences, helping you choose the best hiring strategy.',
  },
  {
    question: 'Can I turn my estimate into a platform project brief?',
    answer: 'Yes, after completing the estimation, you can save your results and click "Post this project on MegiLance" to automatically pre-fill your client project listing.',
  },
];

export default function AiProjectCostEstimatorPage() {
  const jsonLd = [
    buildAIToolJsonLd(
      "AI Project Cost Estimator",
      "Estimate software development, web builds, mobile apps, and creative design project budgets instantly using real market rates and data-driven project scoping.",
      "/tools/ai-project-cost-estimator",
      "4.9",
      "180"
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
              AI Project Cost Estimator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-350 mb-6">
              Estimate software development, web builds, mobile apps, and creative design project budgets instantly using real market rates and data-driven project scoping.
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
                <p className="text-slate-600 dark:text-slate-400">Loading AI Price Estimator...</p>
              </div>
            }>
              <PriceEstimatorPro />
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
