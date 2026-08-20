import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck, Database, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Secure Blockchain Escrow for Freelancers | MegiLance',
  description: 'Secure your freelance payments with our decentralized blockchain smart contract escrow protocol. 0% non-payment risk for developers and clients.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 dark:bg-indigo-950 dark:text-indigo-300">
          <Database size={13} />
          Web3 Payments Security
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Blockchain Escrow for Freelancers
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The ultimate payment protection. Lock client funds securely on the ledger and release them programmatically upon milestone verification.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Blockchain Escrow?</h2>
        <p className="text-slate-650 dark:text-slate-450 mb-6 leading-relaxed">
          Traditional freelancing platforms hold client payments in centralized accounts, introducing processing delays, 
          high wire transfer charges, and potential payment defaults. Our smart contract protocol solves this by locking 
          stablecoin assets directly in immutable escrow until milestones are completed.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <ShieldCheck className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Guaranteed Payouts</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers work with confidence knowing funds are pre-funded and programmatically locked.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Lock className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">0% central control</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Funds cannot be arbitrarily clawed back or refunded without verified dispute mediation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Explore Our Escrow Features</h2>
        <p className="text-indigo-100 max-w-xl mx-auto mb-6">
          Review how smart contracts automate milestones, secure agreements, and manage disputes under sandbox mode.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link 
            href="/security/escrow" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-indigo-650 hover:scale-[1.02] transition-transform"
          >
            Go to Security &amp; Escrow <ArrowRight size={18} />
          </Link>
          <Link 
            href="/signup?role=freelancer" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Which blockchain network is utilized?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              MegiLance utilizes multi-chain EVM smart contracts supporting Ethereum, Polygon, Arbitrum, Base, and BNB Chain for real-time USDC, USDT, and native cryptocurrency settlements.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Are there extra blockchain fees?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              There is 0% additional platform fee. Freelancers only cover the standard network gas fees when transferring USDC payouts to external wallets.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
