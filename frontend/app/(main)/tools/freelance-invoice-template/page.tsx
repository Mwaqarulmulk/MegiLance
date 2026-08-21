import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowRight, Award, Receipt, CheckCircle2, Download, DollarSign, ShieldCheck } from 'lucide-react';
import { 
  buildMeta, 
  getKeywordsForPage, 
  buildAIToolJsonLd, 
  buildFAQJsonLd, 
  buildBreadcrumbsJsonLd, 
  jsonLdScriptProps 
} from '@/lib/seo';

const INVOICE_FAQS = [
  {
    question: 'What mandatory details must be on a professional freelance invoice?',
    answer: 'A compliant freelance invoice must include: (1) Your legal name/business details, (2) Client business name and billing address, (3) Unique invoice numbering format (e.g. INV-2026-001), (4) Issue date & due date, (5) Itemized deliverable breakdown, (6) Applicable taxes (VAT/GST), and (7) Payment gateway instructions.',
  },
  {
    question: 'Can I generate multi-currency freelance invoices (USD, EUR, GBP, PKR)?',
    answer: 'Yes! Our invoice tool supports multi-currency denominations, automatically formatting currency symbols and exchange calculation notes for international clients.',
  },
  {
    question: 'How do MegiLance milestone invoices protect against unpaid bills?',
    answer: 'Instead of invoicing after the work is delivered and waiting 30–60 days for payment, MegiLance milestone contracts require clients to pre-fund each milestone into escrow upfront, ensuring instant payout release upon approval.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Free Freelance Invoice Templates & Generator | Download Word, Excel & PDF',
  description: 'Create and download professional freelance billing invoice templates. Calculate VAT, itemize deliverables, and generate multi-currency invoices for free.',
  path: '/tools/freelance-invoice-template',
  keywords: getKeywordsForPage(['transactional', 'longTail', 'features'], [
    'freelance invoice template', 'freelance billing invoice template',
    'free invoice creator app', 'freelance billing solutions', 'self-employed invoice format',
    'download freelance invoice pdf', 'contractor invoice generator'
  ]),
});

export default function FreelanceInvoiceTemplatePage() {
  const jsonLd = [
    buildAIToolJsonLd(
      "Free Freelance Invoice Template Generator",
      "Create, customize, and download professional freelance billing invoice templates in PDF, Excel, and Word formats with automated tax calculations.",
      "/tools/freelance-invoice-template",
      "4.8",
      "190"
    ),
    buildFAQJsonLd(INVOICE_FAQS),
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'AI Tools', path: '/tools' },
      { name: 'Invoice Templates', path: '/tools/freelance-invoice-template' },
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
            <Receipt size={13} />
            Invoicing, Billing &amp; Tax Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Free Freelance Invoice Templates &amp; Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create, customize, and download professional freelance billing invoice templates. MegiLance provides the ultimate free invoice creator app to automate your billing operations.
          </p>
        </header>

        {/* 4 Steps to Compliant Invoicing */}
        <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { step: '01. Client Details', desc: 'Add legal business entity, tax ID, and address.' },
            { step: '02. Itemized Deliverables', desc: 'Detail sprint deliverables, hours, and rates.' },
            { step: '03. Tax & Discounts', desc: 'Auto-calculate VAT, GST, or early payment discounts.' },
            { step: '04. Escrow & Pay Link', desc: 'Embed direct Stripe or crypto settlement links.' },
          ].map((s) => (
            <div key={s.step} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 block mb-1">{s.step}</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{s.desc}</p>
            </div>
          ))}
        </section>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Professional Self-Employed Billing Standards</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Late and missed client payments cost independent professionals thousands in lost revenue every year. A clean, standardized freelance invoice template accelerates payout times and ensures accurate bookkeeping for annual tax filings.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <FileText className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Universal Invoice Formats</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Export clean PDF, Excel, and Google Sheets formats designed for creative and technical professionals.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Escrow Payout Guarantee</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Eliminate Net-30 payment chasing with MegiLance pre-funded milestone escrow contracts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Box */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Launch the Live AI Invoice Generator</h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-6">
            Build customized, branded freelance invoices with auto tax calculation in seconds.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/ai/invoice-generator" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-700 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Open Invoice Generator</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/tools/contract-builder" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Build Legal Contract</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {INVOICE_FAQS.map((faq) => (
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
