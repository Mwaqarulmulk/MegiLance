import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ArrowRight, ShieldCheck, ClipboardList, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Freelance Project Scope Planner | MegiLance AI Tools',
  description: 'Break down project requirements, draft clear deliverables, and plan project milestones with our intelligent freelance scope planner tool.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 dark:bg-indigo-950 dark:text-indigo-300">
          <Layers size={13} />
          Workflow Automation
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Freelance Project Scope Planner
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Define clear deliverables, timelines, and milestones. Prevent scope creep and align client expectations before work begins.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why use a Project Scope Planner?</h2>
        <p className="text-slate-650 dark:text-slate-450 mb-6 leading-relaxed">
          Unclear project requirements are the leading cause of freelance dispute escalations and scope creep. 
          A detailed scope planner ensures that both parties agree on what will be delivered, when, and for what cost.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <ClipboardList className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Prevent Scope Creep</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Lock down milestones and deliverables in smart-contract escrows so work terms remain fixed.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Contract Alignment</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Convert your finalized project scope directly into a contract draft in one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Try the Scope Planner Live</h2>
        <p className="text-indigo-100 max-w-xl mx-auto mb-6">
          Input your project goals to automatically generate a structured breakdown of tasks, milestone roadmaps, and estimated timelines.
        </p>
        <Link 
          href="/ai/scope-planner" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-indigo-650 hover:scale-[1.02] transition-transform"
        >
          Open AI Scope Planner <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can clients edit the scope?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Yes, once a scope is proposed, both client and freelancer can collaborate, adjust milestones, and finalize terms before contract signing.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Is the tool free to use?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Yes, our AI Scope Planner is fully free for all users as part of MegiLance's mission to reduce operational overhead for freelancers globally.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
