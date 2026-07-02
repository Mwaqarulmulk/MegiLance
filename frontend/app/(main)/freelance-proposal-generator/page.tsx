import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowRight, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free AI Freelance Proposal Generator | MegiLance',
  description: 'Generate professional proposals and cover letters tailored to project descriptions, and optimize your rates using our free AI tools.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 mb-4 dark:bg-orange-950 dark:text-orange-300">
          <FileText size={13} />
          Proposal Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Freelance Proposal Generator
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Create compelling, personalized proposals in seconds. Tailored to job requirements, experience, and budget specs.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why use an AI Proposal Writer?</h2>
        <p className="text-slate-650 dark:text-slate-450 mb-6 leading-relaxed">
          Writing proposals manually for dozens of projects takes hours. Our AI analyses the project description, 
          identifies the core client needs, and drafts a highly professional pitch that highlights your relevant expertise.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Sparkles className="text-orange-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Tailored Copy</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Generate copy that directly addresses job constraints, technologies, and required features.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MessageSquare className="text-orange-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Professional Tone</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Maintain an objective, business-aligned tone that reassures clients of your execution competency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Try the Proposal Generator Live</h2>
        <p className="text-orange-100 max-w-xl mx-auto mb-6">
          Paste the job description and your skills profile to automatically generate an optimized proposal.
        </p>
        <Link 
          href="/ai/proposal-writer" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-orange-650 hover:scale-[1.02] transition-transform"
        >
          Open AI Proposal Writer <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I save proposal templates?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Yes, registered freelancers can save successful proposal variations and templates directly to their profiles.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Does the generator analyze client budgets?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Our tool evaluates the client's budget and offers optimized bid suggestions to ensure you pitch at an attractive, fair market rate.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
