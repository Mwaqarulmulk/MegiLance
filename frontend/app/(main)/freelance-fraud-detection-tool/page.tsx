import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Eye, AlertTriangle, CheckCircle2, Lock, Sparkles, Shield } from 'lucide-react';
import { buildMeta, getKeywordsForPage, buildFAQJsonLd, buildBreadcrumbsJsonLd } from '@/lib/seo';

const PAGE_FAQS = [
  {
    question: 'How does the MegiLance AI Fraud & Scam Checker detect risks?',
    answer: 'The scanner analyzes job briefs, messages, and proposal patterns for off-platform communication triggers (Telegram/WhatsApp), unpaid work requests, fake escrow links, and payment red flags.',
  },
  {
    question: 'Are my project scans private and confidential?',
    answer: 'Yes! Text scanned through our free tool is evaluated in memory and never stored, indexed, or shared with third parties.',
  },
  {
    question: 'How does MegiLance prevent fraud on the marketplace?',
    answer: 'All projects on MegiLance require 100% pre-funded milestone escrow, identity verification, and deliverable inspection before funds release.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Freelance Fraud Detection & Scam Risk Checker | MegiLance',
  description: 'Scan job briefs, client messages, and proposals for phishing, fake escrow links, and scam patterns with our free AI fraud checker.',
  path: '/freelance-fraud-detection-tool',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'freelance fraud detection tool', 'freelance scam checker', 'spot freelance scams',
    'upwork scam checker', 'safe freelance payment tool', 'freelance security scanner'
  ]),
});

export default function Page() {
  const jsonLd = [
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'AI Tools', path: '/ai' },
      { name: 'Fraud & Scam Checker', path: '/freelance-fraud-detection-tool' },
    ]),
    buildFAQJsonLd(PAGE_FAQS),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 mb-4 dark:bg-rose-950 dark:text-rose-300">
            <ShieldCheck size={13} />
            Safety &amp; Scam Prevention
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Freelance Fraud Detection &amp; Scam Risk Checker
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stay protected across the global freelance marketplace. Detect phishing patterns, suspicious payment links, and fake client briefs in real-time.
          </p>
        </header>

        {/* 3-Point Risk Inspection Grid */}
        <section className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { title: 'Off-Platform Triggers', desc: 'Flags attempts to redirect conversations to Telegram, WhatsApp, or unsecured email.' },
            { title: 'Unpaid Work Traps', desc: 'Detects requests for extensive free design or coding tests disguised as "interviews".' },
            { title: 'Payment Bypass Risks', desc: 'Identifies fake invoice links, check deposit scams, and un-escrowed promises.' },
          ].map((risk) => (
            <div key={risk.title} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                <AlertTriangle size={18} />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{risk.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{risk.desc}</p>
            </div>
          ))}
        </section>

        {/* Value Card */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Use the MegiLance Scam Scanner?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Freelance scams have surged with generative phishing and fake job posts. MegiLance protects your time and finances by scanning text patterns against thousands of known scam heuristics and enforcing 100% pre-funded milestone escrow on every live contract.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <AlertTriangle className="text-rose-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Instant Contextual Risk Scoring</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Identifies high-risk phrases, suspicious external URLs, and fee-bypass attempts.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Shield className="text-rose-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Protected Milestone Escrow</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Never work on credit. Funds lock securely before any sprint begins.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="bg-gradient-to-r from-rose-600 to-red-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Scan a Job Brief or Message Live</h2>
          <p className="text-rose-100 max-w-xl mx-auto mb-6">
            Paste suspicious job descriptions or client communications to evaluate risk scores in seconds.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/ai/fraud-check" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-rose-700 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>Launch AI Fraud Detector</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/trust" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Platform Safety Standards</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {PAGE_FAQS.map((faq) => (
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
