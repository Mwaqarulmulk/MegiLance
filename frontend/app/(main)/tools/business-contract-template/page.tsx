import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowRight, ShieldCheck, Scale, Globe, Download } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Free Business Contract Template & Services Agreement | MegiLance',
  description: 'Download and generate legally-sound business contract templates, services agreement contract templates, and NDAs. Free tools built for remote teams and freelancers.',
  path: '/tools/business-contract-template',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'business contract template', 'services agreement contract template',
    'freelance agreement maker', 'free service contracts', 'freelancer NDA template'
  ]),
});

export default function BusinessContractTemplatePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-950 dark:text-emerald-300">
          <FileText size={13} />
          Legal Agreements Hub
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Free Business Contract &amp; Services Agreements
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Access professional business contract templates and services agreement contract templates designed by legal experts. Generate, customize, and sign online.
        </p>
      </header>

      {/* Benefits Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Standardized Freelance Contracts</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
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
          <div className="flex gap-3">
            <Globe className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Jurisdiction Compliance</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tailor legal clauses automatically to match regional regulatory frameworks in the United States, EU, and UK.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Download className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Export PDF &amp; Sign</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Draft customized agreements, export them to PDF, or e-sign them directly on the MegiLance portal.</p>
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
        <Link 
          href="/tools/contract-builder" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-650 hover:scale-[1.02] transition-transform"
        >
          Create Free Contract <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Are these contract templates legally binding?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Yes, when signed by both parties, they function as binding legal contracts. However, we recommend consulting a legal professional to verify compatibility with specific local regulations.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I edit the contract clauses?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Absolutely. Our contract builder allows you to toggle clauses (such as non-solicitations, non-competes, payment terms, or notice periods) to meet your project specifications.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
