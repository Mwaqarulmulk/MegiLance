import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Freelance Fraud Detection & Vetting Tool | MegiLance',
  description: 'Protect yourself from freelance scams, fake reviews, and payment fraud using our real-time AI fraud detection tool.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 mb-4 dark:bg-rose-950 dark:text-rose-300">
          <ShieldCheck size={13} />
          Safety &amp; Compliance
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Freelance Fraud Detection &amp; Vetting
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stay secure in the freelance marketplace. Detect scam patterns, suspicious client briefs, and payment red flags in real-time.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why use AI Fraud Detection?</h2>
        <p className="text-slate-650 dark:text-slate-450 mb-6 leading-relaxed">
          Freelance platforms are filled with fake job postings, payment scams, and plagiarized portfolios. 
          MegiLance resolves this by running every project scope, proposal text, and user profile through an automated 
          fraud check engine. We flag suspicious links, off-platform payment attempts, and duplicate profiles immediately.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <AlertTriangle className="text-rose-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Detect Scam Patterns</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Our model detects phishing links, requests for free test work, and payment verification bypasses.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Eye className="text-rose-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Verifiable Credentials</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Profile review verification blocks fake reviews, duplicate accounts, and identity theft.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-rose-600 to-red-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Scan Your Project Scope</h2>
        <p className="text-rose-100 max-w-xl mx-auto mb-6">
          Paste a project description or proposal details to check for scam patterns and security risk scores instantly.
        </p>
        <Link 
          href="/ai/fraud-check" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-rose-650 hover:scale-[1.02] transition-transform"
        >
          Open AI Fraud Detector <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How does the risk score work?</h3>
            <p className="text-slate-650 dark:text-slate-450 leading-relaxed text-sm">
              Our model analyses the text context for triggers (like "Telegram", "WhatsApp", "free trial", or "unrealistic rate") and outputs a risk score from low to critical.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Are my scans confidential?</h3>
            <p className="text-slate-650 dark:text-slate-450 leading-relaxed text-sm">
              Yes, guest scans are fully private and are not stored in our databases or shared with any third party.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
