import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, ArrowRight, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Price Estimator for Freelance Projects | MegiLance',
  description: 'Calculate accurate freelance project budgets using our machine learning price estimator. Grounded in global market rates, complexity factors, and regional multipliers.',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
          <Calculator size={13} />
          Pricing Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          AI Price Estimator for Freelance Projects
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Remove the guesswork from project pricing. Our machine learning engine estimates fair freelance rates based on real market data.
        </p>
      </header>

      {/* Value Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why use an AI Price Estimator?</h2>
        <p className="text-slate-650 dark:text-slate-450 mb-6 leading-relaxed">
          Determining budgets for software development, design, and marketing can be challenging. 
          Underbudgeting leads to low-quality submissions, while overbudgeting results in capital waste. 
          MegiLance resolves this by analyzing actual completed project rates, regional cost indices, and technical requirements.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <TrendingUp className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Market Alignment</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get data-backed average budgets adjusted for complexity and developer experience.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Milestone Breakdown</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically map out milestone release plans based on similar scope profiles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Try the Price Estimator Live</h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-6">
          Input your project category, complexity, experience requirements, and region to get a detailed budget estimate instantly.
        </p>
        <Link 
          href="/ai/price-estimator" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-blue-650 hover:scale-[1.02] transition-transform"
        >
          Open AI Price Estimator <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How accurate are the estimates?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Our estimates are based on aggregated rates from actual contracts completed on MegiLance and standard global index multipliers, ensuring they align with real-world hiring ranges.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I download the pricing report?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Yes, our interactive price estimator allows you to export a complete PDF budget breakdown and milestone roadmap to share with stakeholders.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
