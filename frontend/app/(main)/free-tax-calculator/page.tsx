import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, ArrowRight, Landmark, Receipt, Percent, FileText } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Free Tax Calculator for Freelancers & Self-Employed | MegiLance',
  description: 'Estimate your self-employment taxes, quarterly obligations, and business write-offs using our free tax calculator. Built for freelancers and remote contractors.',
  path: '/free-tax-calculator',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'free tax calculator', 'freelance expense and tax calculator',
    'self-employed tax estimator', 'calculate freelance taxes', 'write-off calculator'
  ]),
});

export default function FreeTaxCalculatorPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-950 dark:text-emerald-300">
          <Calculator size={13} />
          Self-Employed Tax Utilities
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Free Tax Calculator for Freelancers
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stay on top of your quarterly IRS self-employment taxes, track legal business write-offs, and project your net take-home income.
        </p>
      </header>

      {/* Overview Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How Freelance Taxes Work</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Unlike salaried employees, freelancers do not have taxes automatically withheld from their earnings. You are responsible for both the employee and employer portions of Social Security and Medicare taxes (Self-Employment Contribution Act, or SECA), usually paid quarterly.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Percent className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Calculate Self-Employment Tax</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Estimate the standard 15.3% SECA tax applied to 92.35% of your net self-employed earnings.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Receipt className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Track Legal Write-offs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Deduct home office space, internet bills, software subscriptions, hardware purchases, and travel costs.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Landmark className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Project Net Earnings</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Estimate state, federal, and local income taxes to know exactly how much net cash you keep.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <FileText className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Quarterly Estimates (1040-ES)</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avoid underpayment penalties by projecting and scheduling your quarterly estimated tax payments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Double Interactive Tools Callout */}
      <section className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Income &amp; Tax Estimator</h3>
            <p className="text-emerald-100 text-sm mb-6">
              Calculate your overall net income, tax rate brackets, and disposable earnings by country or state.
            </p>
          </div>
          <Link 
            href="/ai/income-calculator" 
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold bg-white text-emerald-700 hover:bg-emerald-50 transition-colors w-full text-center"
          >
            Calculate Income Taxes <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-3xl text-white shadow-md flex flex-col justify-between border border-slate-700">
          <div>
            <h3 className="text-xl font-bold mb-2">Write-off &amp; Expense Auditor</h3>
            <p className="text-slate-300 text-sm mb-6">
              Input your annual business expenses to determine your eligible write-offs and lower your taxable income.
            </p>
          </div>
          <Link 
            href="/ai/expense-calculator" 
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold bg-white text-slate-900 hover:bg-slate-50 transition-colors w-full text-center"
          >
            Audit Business Expenses <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What qualifies as a freelance business write-off?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Any expense that is both "ordinary and necessary" for your trade or business can be written off. This includes laptops, website hosting, platform fees, professional education, and co-working memberships.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">When are self-employed quarterly taxes due?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              In the United States, quarterly estimated tax deadlines are typically April 15, June 15, September 15, and January 15 of the following year.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
