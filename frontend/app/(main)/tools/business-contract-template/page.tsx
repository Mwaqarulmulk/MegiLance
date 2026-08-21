import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowRight, ShieldCheck, Scale, Globe, Download, CheckCircle2 } from 'lucide-react';
import { 
  buildMeta, 
  getKeywordsForPage, 
  buildAIToolJsonLd, 
  buildFAQJsonLd, 
  buildBreadcrumbsJsonLd, 
  jsonLdScriptProps 
} from '@/lib/seo';

const CONTRACT_TEMPLATE_FAQS = [
  {
    question: 'Are MegiLance business contract templates legally binding?',
    answer: 'Yes! When digitally signed by both client and independent contractor, these service agreements function as legally binding common-law contracts covering deliverables, IP assignment, and payment terms.',
  },
  {
    question: 'What types of freelance contracts are available?',
    answer: 'Templates include Master Services Agreements (MSA), Statements of Work (SOW), Mutual Non-Disclosure Agreements (NDA), Software Development Contracts, and UI/UX Design Retainers.',
  },
  {
    question: 'Can I combine this template with milestone escrow?',
    answer: 'Yes, all MegiLance contracts automatically link into our smart milestone escrow protocol, ensuring payments are held safely and released only upon deliverable verification.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Free Business Contract Template & Services Agreement Generator | MegiLance',
  description: 'Download and generate legally-sound business contract templates, services agreement contract templates, and NDAs. Free tools built for remote teams and freelancers.',
  path: '/tools/business-contract-template',
  keywords: getKeywordsForPage(['transactional', 'longTail', 'features'], [
    'business contract template', 'services agreement contract template',
    'freelance agreement maker', 'free service contracts', 'freelancer NDA template',
    'software development contract template', 'independent contractor agreement generator'
  ]),
});

export default function BusinessContractTemplatePage() {
  const jsonLd = [
    buildAIToolJsonLd(
      "Business Contract & Services Agreement Generator",
      "Generate legally-sound business contract templates, services agreement contract templates, and NDAs with jurisdiction compliance.",
      "/tools/business-contract-template",
      "4.9",
      "210"
    ),
    buildFAQJsonLd(CONTRACT_TEMPLATE_FAQS),
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'AI Tools', path: '/tools' },
      { name: 'Business Contract Template', path: '/tools/business-contract-template' },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-950 dark:text-emerald-300">
            <FileText size={13} />
            Legal Intelligence &amp; Compliance Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Free Business Contract &amp; Services Agreements
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Access professional business contract templates and services agreement contract templates designed by legal experts. Generate, customize, and sign online.
          </p>
        </header>

        {/* 4 Contract Categories */}
        <section className="grid sm:grid-cols-2 gap-4 mb-12">
          {[
            { title: 'Independent Contractor Agreement', desc: 'Standard master agreement defining hourly/fixed rates, deliverables, and tax independence.' },
            { title: 'Software Development Agreement', desc: 'Specialized IP assignment, source code warranty, and repository handover clauses.' },
            { title: 'Mutual Non-Disclosure Agreement (NDA)', desc: 'Protects proprietary business logic, client data, and trade secrets before discovery.' },
            { title: 'Design & Creative Retainer SOW', desc: 'Specifies revision limits, asset licensing rights, and monthly milestone retainers.' },
          ].map((c) => (
            <div key={c.title} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{c.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </section>

        {/* Benefits Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Standardized Freelance Contracts</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Operating without a signed contract exposes both clients and freelancers to severe financial risks. Our library of business contract templates ensures clear definitions of intellectual property ownership, milestone deliveries, payment schedules, and dispute resolutions.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Scale className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Standard Services Agreements</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Protect your intellectual property and define client deliverables using our services agreement contract templates.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Mutual NDA Templates</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Keep proprietary code, business metrics, and strategy documents confidential with customizable NDAs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Box */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Open the AI Contract Builder</h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-6">
            Generate legally-sound freelance contracts, NDAs, and services agreements instantly with our interactive wizard.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/tools/contract-builder" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-700 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Create Free Contract</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/create-project" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Post Project with Escrow</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {CONTRACT_TEMPLATE_FAQS.map((faq) => (
              <div key={faq.question} className="border-b border-slate-100 dark:border-slate-850 pb-4">
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
