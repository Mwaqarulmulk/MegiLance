import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart Contract Escrow for Freelancers | Secure Payments | MegiLance',
  description: 'Protect freelance earnings and eliminate milestone payment anxiety with our secure smart-contract escrow protocol.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-950 dark:text-emerald-300">
          <Lock size={13} />
          Payment Security
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Smart Contract Escrow for Freelancers
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Remove transaction anxiety from freelancing. Fund contracts securely and release payouts automatically on approval.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What is Smart Contract Escrow?</h2>
        <p className="text-slate-650 dark:text-slate-450 mb-6 leading-relaxed">
          Traditional platforms charge high fees and hold your funds in opaque accounts. 
          MegiLance uses decentralized smart contract protocols to hold contract funds transparently. 
          Clients fund milestones in USDC, lock them securely, and release them directly to the freelancer's wallet upon approving deliverables.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <ShieldCheck className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Mutual Safety</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers work knowing funds are fully locked. Clients release them only when deliverables meet specs.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Lock className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Low Processing Costs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Blockchain transfers reduce intermediary charges, ensuring freelancers keep their rates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Safer Payments Await</h2>
        <p className="text-emerald-100 max-w-xl mx-auto mb-6">
          Create an account today to post a project or build a profile with milestone-based escrow verification.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-emerald-650 hover:scale-[1.02] transition-transform"
          >
            Create Account <ArrowRight size={18} />
          </Link>
          <Link 
            href="/how-it-works" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
          >
            Learn How It Works
          </Link>
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Do I need cryptocurrency to use MegiLance?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              No. Clients can fund escrows using standard credit cards or PayPal. MegiLance automatically handles currency conversions behind the scenes.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How are disputes handled?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              If a dispute arises, the contract remains locked in escrow. An administrative moderator reviews contract logs and deliverables to split funds fairly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
