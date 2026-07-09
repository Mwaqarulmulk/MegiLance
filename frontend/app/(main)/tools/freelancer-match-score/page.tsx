import type { Metadata } from 'next';
import React from 'react';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';
import MatchScoreSimulatorClient from './MatchScoreSimulatorClient';
import { 
  buildMeta, 
  buildFAQJsonLd, 
  buildSoftwareAppJsonLd, 
  jsonLdScriptProps, 
  getKeywordsForPage 
} from '@/lib/seo';
import Link from 'next/link';

const faqs = [
  {
    question: 'How does MegiLance calculate the freelancer match score?',
    answer: 'The matching engine uses NLP to scan project descriptions for skills, experience levels, and domain requirements, matching them against freelancer profile certifications, portfolios, review sentiment, and past success scores.',
  },
  {
    question: 'What is a "Good Match" threshold?',
    answer: 'A score of 70% or higher is considered a strong match. Excellent matches are scored above 85% and represent freelancers who have completed similar projects with high client ratings.',
  },
  {
    question: 'How do I invite matched freelancers to my project?',
    answer: 'After posting a project, the system runs the AI matching engine in the background and returns a ranked list. You can invite the top candidates directly from your client portal.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Free AI Freelancer Match Score Simulator | MegiLance',
  description: 'Simulate and calculate freelance match scores for your project. Analyze candidate skills, ratings, and experience using MegiLance\'s intelligent matching engine.',
  path: '/tools/freelancer-match-score',
  keywords: getKeywordsForPage(['longTail', 'features'], [
    'freelancer match score', 'calculate freelancer match score',
    'simulate candidate match', 'AI freelance matching engine', 'find developers matching score'
  ]),
});

export default function FreelancerMatchScorePage() {
  const jsonLd = [
    buildSoftwareAppJsonLd(),
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
              AI Freelancer Match Score Simulator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-350 mb-6">
              Enter your required skills below to see how our AI matching engine evaluates freelancers based on competence, availability, and past performance.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-100 dark:border-blue-900/50">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>Beta Preview: Match Engine v2.0 (July 2026)</span>
            </div>
          </header>

          {/* Interactive Simulator Wrapper */}
          <MatchScoreSimulatorClient />

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
