import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowRight, Award, Receipt, CheckCircle2, Download } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Free Freelance Invoice Templates & Billing Creator | MegiLance',
  description: 'Download free freelance invoice templates and freelance billing invoice templates. Streamline self-employed billing using our free invoice creator app.',
  path: '/tools/freelance-invoice-template',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'freelance invoice template', 'freelance billing invoice template',
    'free invoice creator app', 'freelance billing solutions', 'self-employed invoice format'
  ]),
});

export default function FreelanceInvoiceTemplatePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-950 dark:text-emerald-300">
          <Receipt size={13} />
          Invoicing &amp; Billing
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Free Freelance Invoice Templates
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Create, customize, and download professional freelance billing invoice templates. MegiLance provides the ultimate free invoice creator app to automate your billing operations.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Professional Self-Employed Billing</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Invoicing is crucial to maintaining a healthy cash flow. A professional freelance invoice template should outline your payment terms, include details of milestones, support multi-currency formatting, and state tax breakdowns clearly.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <FileText className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Standard Freelance Formats</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Access customizable Word, Excel, and Google Sheets formats designed for creative and technical experts.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Download className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Export PDF &amp; Print</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Generate clean invoice documents, download them instantly, or send them to clients directly via email.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Automated Calculations</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Let the app calculate sub-totals, local VAT or sales tax additions, and discounts automatically.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Award className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Integrated Payments</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Embed Stripe, bank deposits, or crypto payment links into your invoices to secure instant disbursements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Open the AI Invoice Generator</h2>
        <p className="text-emerald-100 max-w-xl mx-auto mb-6">
          Use our interactive invoice creator app to build customized, branded freelance invoices in seconds with AI support.
        </p>
        <Link 
          href="/ai/invoice-generator" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-650 hover:scale-[1.02] transition-transform"
        >
          Generate Invoice Instantly <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What elements must be on a freelance invoice?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Your invoice should include: (1) Your name &amp; contact info, (2) Client\'s business details, (3) Unique invoice number, (4) Date of issue, (5) Itemized list of deliverables, (6) Total balance due, and (7) Payment methods and deadlines.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I customize the invoice logo and branding?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Yes, our invoice creator app allows you to upload custom logos, set primary brand colors, adjust column layouts, and write a customized thank-you note.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
