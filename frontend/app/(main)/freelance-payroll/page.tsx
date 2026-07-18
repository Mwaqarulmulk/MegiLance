import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CreditCard, ArrowRight, Shield, Globe, Landmark, CheckCircle2 } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Payroll & Global Payments Solutions | MegiLance',
  description: 'Manage freelance payroll and global freelancer payments securely. Automated invoicing, multi-currency support, escrow security, and tax compliance built for teams.',
  path: '/freelance-payroll',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'freelance payroll', 'freelancer payment', 'global freelancer payments',
    'freelance billing solutions', 'contractor payments platform'
  ]),
});

export default function FreelancePayrollPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
          <CreditCard size={13} />
          Global Finance Suite
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Freelance Payroll &amp; Global Payments
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pay your international freelancer teams with zero hassle. Seamless compliance, instant invoices, escrow security, and flexible currency payouts.
        </p>
      </header>

      {/* Feature Showcase */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Streamline Freelancer Payments</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Managing cross-border freelance payroll doesn't have to be complicated. MegiLance combines secure escrow deposits, automated milestones, and instantaneous bank transfers or crypto (USDC) payouts to keep your team motivated and compliant.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Globe className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Global Contractor Coverage</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Hire and pay freelancers in over 150 countries with local currency conversion and compliance checks.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Escrow-Backed Safety</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Funds are securely locked in milestone-based escrow. Work is reviewed and approved before release.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Landmark className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Tax &amp; 1099 Compliance</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automate tax document generation, local expense logs, and invoice tracking for seamless reporting.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Instant Bank &amp; Web3 Payouts</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Support for Stripe, direct wire, bank deposits, and gasless USDC stablecoin payments on Polygon.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Scale Your Remote Workforce</h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-6">
          Start hiring and managing freelance payroll today. Benefit from simple transparent pricing plans with zero client-side fees.
        </p>
        <Link 
          href="/pricing" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-blue-650 hover:scale-[1.02] transition-transform"
        >
          View Pricing Plans <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How does MegiLance protect freelancer payments?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              We leverage smart escrow systems where clients deposit funds prior to project commencement. Once a milestone is successfully delivered, the client approves, and funds are disbursed instantly.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Are there transaction fees for freelance payroll?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              MegiLance charges 0% fees on client transactions. Freelancers pay a flat, transparent platform fee on their earnings which can be optimized with our Pro plan.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
