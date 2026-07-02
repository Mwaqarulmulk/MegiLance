import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ShieldCheck, HelpCircle, ArrowRight, Gavel, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart Contract Escrow & Payment Security | MegiLance',
  description: 'Learn how MegiLance protects clients and freelancers using smart-contract milestone escrow and decentralized payment security.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-950 dark:text-emerald-300">
          <Lock size={13} />
          Payment Escrow Protocol
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Trust &amp; Escrow Protection
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Eliminate payment anxiety. Our smart contract escrow secures project budgets before work begins, releasing them only upon approved milestones.
        </p>
      </header>

      {/* The Core Problem */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Dual-Risk Problem</h2>
        <p className="text-slate-650 dark:text-slate-450 leading-relaxed text-sm mb-4">
          Online freelancing is plagued by payment mistrust:
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border">
            <h3 className="font-bold text-sm text-red-500 mb-1">Freelancers Face</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Months of unpaid work, sudden client disappearances, or arbitrary payment refusals after deliverables are submitted.
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border">
            <h3 className="font-bold text-sm text-red-500 mb-1">Clients Face</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upfront deposit theft, developers abandoning projects midway, or receiving poor quality work with zero refund recourse.
            </p>
          </div>
        </div>
      </section>

      {/* Escrow Flow */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">The Milestone Escrow Flow</h2>
        <div className="space-y-6 max-w-2xl mx-auto">
          {[
            { step: '1', title: 'Scope & Agreement', desc: 'Client and freelancer define project milestones, budgets, and clear criteria for approval.' },
            { step: '2', title: 'Fund Escrow', desc: 'Client deposits the milestone budget in USDC (or via credit card/PayPal) into the contract.' },
            { step: '3', title: 'Work Delivery', desc: 'Freelancer works with confidence knowing the budget is locked. Deliverables are uploaded directly to the platform.' },
            { step: '4', title: 'Review & Release', desc: 'Client reviews submissions and approves. The smart contract releases funds to the freelancer\'s wallet instantly.' }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blockchain Role & Limitations */}
      <section className="grid sm:grid-cols-2 gap-8 mb-12">
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Lock className="text-emerald-500" size={16} />
            Smart Contract Architecture
          </h3>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            By utilizing a programmatically locked ledger contract, we eliminate banking delays, wire fees, and the risk of platform insolvency. Payouts are code-enforced.
          </p>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <HelpCircle className="text-emerald-500" size={16} />
            Prototype Disclaimers
          </h3>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            Please note: MegiLance is currently operating in <strong>sandbox prototype mode</strong>. Blockchain smart contracts run on our local test networks, and fiat transactions are simulated for safety evaluations.
          </p>
        </div>
      </section>

      {/* Dispute Resolutions */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Gavel className="text-emerald-500" size={20} />
          Dispute Resolution Mediation
        </h2>
        <p className="text-slate-650 dark:text-slate-450 leading-relaxed text-xs">
          If a client rejects deliverables and the freelancer disputes it, the funds remain locked in the contract. 
          A platform mediator reviews the project's workspace chat logs and submitted code to make an impartial judgment, 
          splitting the funds relative to completion progress.
        </p>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-center text-white shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Post Your First Secured Milestone</h2>
        <p className="text-emerald-100 max-w-xl mx-auto mb-6">
          Whether hiring or looking for work, experience peace of mind with MegiLance's escrow-backed project workflows.
        </p>
        <Link 
          href="/signup" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-650 hover:scale-[1.02] transition-transform"
        >
          Get Started Now <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
