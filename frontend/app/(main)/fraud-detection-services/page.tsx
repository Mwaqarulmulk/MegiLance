import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Scan, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Fraud Detection Services for Freelancers | MegiLance',
  description: 'Protect your freelance business with AI-powered fraud detection services. Identify scam clients, fake reviews, and payment fraud before they cost you.',
  path: '/fraud-detection-services',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'fraud detection services', 'freelance fraud detection',
    'scam client detection', 'fake review detection', 'payment fraud prevention freelancer',
  ]),
});

export default function FraudDetectionServicesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 mb-4 dark:bg-red-950 dark:text-red-300">
          <ShieldAlert size={13} />
          Fraud Protection Suite
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          AI-Powered Fraud Detection Services
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Protect your freelance business from scams, fake clients, and payment fraud. MegiLance uses real-time AI behavioral analysis to detect and block threats before they cause damage.
        </p>
      </header>

      {/* Features Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How Our Fraud Detection Works</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Freelancers and clients face unique fraud risks: advance-fee scams, fake payment confirmations, identity theft, and manipulated reviews. Our multi-layer detection engine monitors over 200 behavioral signals in real time to flag suspicious activity before you lose money.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Scan className="text-red-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Client Identity Verification</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Cross-reference client identities against known fraud databases and detect duplicate account patterns instantly.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Fake Review Detection</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automated sentiment analysis and behavioral pattern matching identifies and removes manipulated reviews from profiles.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Lock className="text-red-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Payment &amp; Escrow Safety</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Escrow-held milestone payments ensure you only release funds after verifying deliverable completion — eliminating payment fraud risk.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-red-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Account Takeover Prevention</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">MFA enforcement, device fingerprinting, and login anomaly detection prevent unauthorized access to your account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Run a Fraud Risk Check</h2>
        <p className="text-red-100 max-w-xl mx-auto mb-6">
          Use our free fraud risk analysis tool to evaluate a client&apos;s profile, payment history, and behavioral patterns before accepting a contract.
        </p>
        <Link
          href="/ai/fraud-check"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-red-600 hover:scale-[1.02] transition-transform"
        >
          Run Fraud Risk Check <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What are the most common freelance scams?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Common scams include: overpayment check scams, fake job offer deposits, scope creep without payment, fake escrow release notifications, and identity impersonation. MegiLance's fraud detection flags all of these patterns automatically.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How does escrow protect freelancers?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              When a client posts a project, they fund an escrow account upfront. Funds are only released to the freelancer upon verified milestone completion, eliminating non-payment risk entirely.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
