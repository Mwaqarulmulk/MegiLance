import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, ArrowRight, ShieldCheck, Heart, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Freelancing Platform for Pakistani Freelancers | MegiLance',
  description: 'Empowering Pakistani freelancers by removing payment barriers, integrating local payout methods, and offering lower platform fees.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-600 mb-4 dark:bg-pink-950 dark:text-pink-300">
          <Globe size={13} />
          Local Payouts &amp; Global Access
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Freelancing Platform for Pakistani Freelancers
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Unlock the global economy. Overcome Stripe/PayPal barriers, secure stable payouts, and pay 0% launch commissions for 2026.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Empowering Pakistani Talent</h2>
        <p className="text-slate-650 dark:text-slate-450 mb-6 leading-relaxed">
          Pakistan hosts the 4th largest freelance community globally, yet local professionals struggle with delayed payouts, 
          unstable banking corridors, and high intermediary commission structures. MegiLance is engineered specifically to 
          resolve these problems through a hybrid Web2 + Web3 architecture that secures instant global settlement.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Heart className="text-pink-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Financial Inclusion</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Withdraw earnings directly to stablecoin wallets, avoiding local banking delays and high wire fees.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="text-pink-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Zero Commission Launch Offer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Keep 100% of your hard-earned income with 0% platform commission during our 2026 launch offer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Join Our Growing Community</h2>
        <p className="text-pink-100 max-w-xl mx-auto mb-6">
          Showcase your skills, complete tasks, raise your AI matching score, and connect directly with high-value clients worldwide.
        </p>
        <Link 
          href="/signup?role=freelancer" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-pink-650 hover:scale-[1.02] transition-transform"
        >
          Create Freelancer Account <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How are Pakistani bank transfers supported?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Freelancers can withdraw their escrow-settled USDC directly to exchange accounts or use integrated P2P portals to convert stablecoins into local PKR accounts instantly.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Is the platform free to register?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Yes, registration is 100% free. You can build your profile and start applying to project bids immediately.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
