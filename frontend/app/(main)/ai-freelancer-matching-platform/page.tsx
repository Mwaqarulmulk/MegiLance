import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Cpu, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Freelancer Matching Platform | Vetted Talent | MegiLance',
  description: 'Find the perfect freelancer for your project in under 24 hours. Our 7-factor semantic AI matching algorithm connects you based on verified skills.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600 mb-4 dark:bg-cyan-950 dark:text-cyan-300">
          <Cpu size={13} />
          AI Matching Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          AI Freelancer Matching Platform
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Skip vetting fatigue. Connect with top developers, designers, and writers instantly using objective competency mapping.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How does AI Matching work?</h2>
        <p className="text-slate-650 dark:text-slate-450 mb-6 leading-relaxed">
          Traditional platforms display freelancers based on paid promotions or keyword bidding, leading to poor matches. 
          MegiLance uses a multi-factor competency mapping algorithm. We parse project scopes and compare them 
          against freelancer capability vectors, verified past reviews, and code repository commits.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Sparkles className="text-cyan-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Objective Vetting</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers are ranked by technical capability, not ad spend, ensuring the best rise to the top.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="text-cyan-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Bias Reduction</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Our engine evaluates hard skills and execution history, promoting meritocracy and fair pricing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Find Vetted Talent Instantly</h2>
        <p className="text-cyan-100 max-w-xl mx-auto mb-6">
          Post a project for free, get matched with compatible freelancers, and start building in under 24 hours.
        </p>
        <Link 
          href="/signup?role=client" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-cyan-650 hover:scale-[1.02] transition-transform"
        >
          Post a Project Free <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What is the "AI Matching Score"?</h3>
            <p className="text-slate-650 dark:text-slate-450 leading-relaxed text-sm">
              It is a percentage score displayed on proposals indicating the candidate's alignment with your project requirements based on verified skill tests, past ratings, and experience.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How fast do matches appear?</h3>
            <p className="text-slate-650 dark:text-slate-450 leading-relaxed text-sm">
              The AI matching algorithm runs immediately upon project posting, delivering initial matches and proposal alerts to compatible freelancers in real-time.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
