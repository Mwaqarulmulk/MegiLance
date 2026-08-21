// @AI-HINT: Public standalone tool page for Contract Builder - SEO optimized with JSON-LD schemas
import React from 'react';
import type { Metadata } from 'next';
import ContractBuilder from '@/app/components/ContractBuilder/ContractBuilder';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';
import { 
  buildMeta, 
  buildAIToolJsonLd, 
  buildFAQJsonLd,
  buildBreadcrumbsJsonLd,
  jsonLdScriptProps, 
  getKeywordsForPage 
} from '@/lib/seo';
import Link from 'next/link';
import { FileCheck, Shield, Lock, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const CONTRACT_FAQS = [
  {
    question: 'Why do freelancers need a written contract for every project?',
    answer: 'A formal freelance contract clearly establishes project milestones, payment schedules, intellectual property (IP) transfer terms, confidentiality (NDA), and termination conditions, protecting you from non-payment and scope creep.',
  },
  {
    question: 'Does this contract builder support milestone escrow clauses?',
    answer: 'Yes! You can toggle milestone-based escrow clauses that stipulate payments must be pre-funded into neutral escrow before deliverable handovers take place.',
  },
  {
    question: 'Are the generated contracts legally binding?',
    answer: 'Yes, the agreements are drafted based on standard common-law service agreement principles and include electronic signature acknowledgement clauses suitable for international contractor relationships.',
  },
  {
    question: 'Can I export the contract as a PDF or Word document?',
    answer: 'Yes, after configuring your contract parameters in the generator, you can copy the full legal text or export it directly as a formatted PDF for client signature.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Free AI Freelance Contract Builder | Business & Services Agreement Generator',
  description: 'Generate legally-sound freelance contracts, NDAs, independent contractor agreements, and services contract templates with customizable milestone escrow clauses.',
  path: '/tools/contract-builder',
  keywords: getKeywordsForPage(['longTail', 'features', 'transactional'], [
    'services agreement contract template', 'business contract template',
    'freelance contract builder', 'generate freelance contract free',
    'AI legal contract creator', 'freelance NDA template', 'freelancer service agreement'
  ]),
});

export default function ContractBuilderPage() {
  const jsonLd = [
    buildAIToolJsonLd(
      "AI Freelance Contract Builder",
      "Generate legally-sound freelance contracts, NDAs, and service agreements instantly with customizable legal clauses and jurisdiction support.",
      "/tools/contract-builder",
      "4.9",
      "220"
    ),
    buildFAQJsonLd(CONTRACT_FAQS),
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'AI Tools', path: '/tools' },
      { name: 'Contract Builder', path: '/tools/contract-builder' },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Heading & Intro */}
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
              <FileCheck size={13} />
              Legal Intelligence &amp; Compliance
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Free AI Freelance Contract Builder
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-350 mb-6">
              Create enforceable, bulletproof freelance contracts, NDAs, and independent contractor service agreements in minutes. Protect your IP and guarantee milestone payment release.
            </p>
          </header>

          {/* Embedded Interactive Tool */}
          <section className="mb-12 shadow-md rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <ContractBuilder />
          </section>

          {/* Essential Contract Clauses Guide */}
          <section className="max-w-4xl mx-auto bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 mb-12 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4 Essential Clauses Every Freelance Contract Must Include</h2>
            <div className="grid sm:grid-cols-2 gap-6 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-1">1. IP Transfer Upon Full Payment</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Copyright ownership of source code, designs, and content transfers to the client ONLY when all milestone invoices are 100% paid.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-1">2. Scope Revision &amp; Change Orders</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Prevents scope creep by clearly defining that features outside the Work Breakdown Structure require a newly funded milestone addendum.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-1">3. Milestone Escrow Funding</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mandates that contract funds must be deposited into MegiLance escrow vaults before contractor commences development.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-1">4. Fast Dispute Arbitration</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Establishes a 48-hour neutral mediation protocol if deliverables are disputed, avoiding costly legal proceedings.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Box */}
          <section className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Execute Contracts with 0% Platform Commission</h2>
            <p className="text-blue-100 max-w-xl mx-auto mb-6">
              Connect your contract directly to a live project on MegiLance and benefit from automated milestone escrow protection.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link 
                href="/create-project" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-blue-700 hover:scale-[1.02] transition-transform shadow-md"
              >
                <span>Post Project with Escrow</span>
                <ArrowRight size={18} />
              </Link>
              <Link 
                href="/tools/freelance-invoice-template" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
              >
                <span>Generate Invoice Template</span>
              </Link>
            </div>
          </section>

          {/* FAQs */}
          <section className="max-w-3xl mx-auto bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {CONTRACT_FAQS.map((faq) => (
                <div key={faq.question} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}