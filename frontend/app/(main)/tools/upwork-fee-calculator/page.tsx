// @AI-HINT: High-intent interactive Upwork & Freelance Fee Calculator.
// Targets viral keywords: "upwork fee calculator", "upwork fees calculator", "how much does upwork take"
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, DollarSign, ShieldCheck, Sparkles, TrendingUp, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';

export default function UpworkFeeCalculatorPage() {
  const [projectAmount, setProjectAmount] = useState<number>(3000);
  const [proposalsPerMonth, setProposalsPerMonth] = useState<number>(20);
  const [contractType, setContractType] = useState<'fixed' | 'hourly'>('fixed');

  // Upwork Calculations
  const upworkFreelancerFee = projectAmount * 0.10; // 10% flat
  const upworkClientFee = (projectAmount * 0.05) + 2.95; // 5% + $2.95 contract fee
  const upworkConnectsCost = proposalsPerMonth * 16 * 0.15; // 16 connects per bid @ $0.15
  const totalUpworkCut = upworkFreelancerFee + upworkClientFee + upworkConnectsCost;

  // Fiverr Calculations (20% seller + 5.5% buyer)
  const fiverrSellerCut = projectAmount * 0.20;
  const fiverrBuyerCut = (projectAmount * 0.055) + 2.50;
  const totalFiverrCut = fiverrSellerCut + fiverrBuyerCut;

  // MegiLance (0% platform commission during launch)
  const megilanceFee = 0;
  const totalSaved = totalUpworkCut;
  const netEarningsMegiLance = projectAmount;
  const netEarningsUpwork = projectAmount - upworkFreelancerFee - upworkConnectsCost;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': 'Upwork Fee Calculator & Freelance Marketplace Fee Comparison Tool',
        'url': 'https://megilance.site/tools/upwork-fee-calculator',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0.00',
          'priceCurrency': 'USD',
        },
        'description': 'Calculate exact Upwork freelancer fees (10%), client charges (5%), and connects costs vs MegiLance 0% commission marketplace savings.',
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How much does Upwork take from freelancers in 2026?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Upwork charges a flat 10% freelancer service fee on all earnings, plus $0.15 per Connect required to submit proposals (typically 8–16 connects per bid, costing $1.20–$2.40 per proposal).',
            },
          },
          {
            '@type': 'Question',
            'name': 'How much does Upwork charge clients in fees?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Upwork charges clients a 5% client marketplace fee on every billing plus a $2.95 contract initiation fee per contract.',
            },
          },
          {
            '@type': 'Question',
            'name': 'How does MegiLance eliminate these freelance platform fees?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'MegiLance operates with 0% platform commission for freelancers and clients during our 2026 launch. Freelancers keep 100% of their billings, proposals are 100% free with zero paid connects, and payments are protected in secure milestone escrow.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://megilance.site' },
          { '@type': 'ListItem', 'position': 2, 'name': 'AI Tools', 'item': 'https://megilance.site/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Upwork Fee Calculator', 'item': 'https://megilance.site/tools/upwork-fee-calculator' },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Heading */}
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-950 dark:text-emerald-300">
              <Calculator size={13} />
              Fee Transparency &amp; Savings Calculator
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Upwork Fee Calculator &amp; Savings Estimator
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-350 leading-relaxed">
              Calculate exact Upwork freelancer commissions, client fees, and Connects costs. See how much money you save on MegiLance with <strong>0% platform fees</strong>.
            </p>
          </header>

          {/* Interactive Calculator Grid */}
          <div className="grid md:grid-cols-12 gap-8 mb-12">
            {/* Input Controls */}
            <div className="md:col-span-5 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="text-emerald-500" size={20} />
                Project Parameters
              </h2>

              {/* Project Budget Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Project Contract Value ($)
                  </label>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ${projectAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="25000"
                  step="100"
                  value={projectAmount}
                  onChange={(e) => setProjectAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>$200</span>
                  <span>$10,000</span>
                  <span>$25,000+</span>
                </div>
              </div>

              {/* Proposals Per Month Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Bids / Proposals Per Month
                  </label>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {proposalsPerMonth} proposals ({proposalsPerMonth * 16} connects)
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={proposalsPerMonth}
                  onChange={(e) => setProposalsPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upwork charges ~$2.40 (16 connects @ $0.15) per bid. MegiLance bids are 100% free.
                </span>
              </div>

              {/* Quick Budget Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                  Quick Budget Presets:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 2500, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setProjectAmount(preset)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition ${
                        projectAmount === preset
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      ${preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comparison Output Dashboard */}
            <div className="md:col-span-7 space-y-4">
              {/* Massive Savings Highlight Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white inline-block mb-3">
                    Your Savings with MegiLance
                  </span>
                  <div className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
                    +${totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-emerald-100 text-sm max-w-md">
                    Kept in your wallet on this single ${projectAmount.toLocaleString()} project instead of paying Upwork fees and paid connects!
                  </p>
                </div>
              </div>

              {/* Breakdown Comparison Table */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Fee Breakdown: Upwork vs MegiLance
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="text-slate-650 dark:text-slate-400">Freelancer Service Fee (10% on Upwork)</span>
                    <div className="text-right">
                      <span className="line-through text-red-500 mr-2 font-mono">-${upworkFreelancerFee.toFixed(2)}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">$0.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="text-slate-650 dark:text-slate-400">Client Marketplace Fee (5% + $2.95 on Upwork)</span>
                    <div className="text-right">
                      <span className="line-through text-red-500 mr-2 font-mono">-${upworkClientFee.toFixed(2)}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">$0.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="text-slate-650 dark:text-slate-400">Paid Bid Connects ({proposalsPerMonth} bids/mo)</span>
                    <div className="text-right">
                      <span className="line-through text-red-500 mr-2 font-mono">-${upworkConnectsCost.toFixed(2)}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">100% Free</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 font-bold text-base">
                    <span className="text-slate-900 dark:text-white">Net Take-Home for Freelancer</span>
                    <div className="text-right font-mono">
                      <div className="text-xs font-normal text-slate-400">Upwork: ${netEarningsUpwork.toFixed(2)}</div>
                      <div className="text-emerald-600 dark:text-emerald-400 text-lg font-black">
                        MegiLance: ${netEarningsMegiLance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-3">
                  <Link
                    href="/signup?role=freelancer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition shadow-sm"
                  >
                    <span>Start Earning with 0% Fee</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/create-project"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-900 dark:text-white text-sm transition"
                  >
                    <span>Post Project Free</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Explanatory SEO Content */}
          <section className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 mb-12 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Understanding Upwork's Fee Structure in 2026
            </h2>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Upwork simplified its tiered fee structure (which previously charged 20% / 10% / 5%) into a flat <strong>10% freelancer service fee</strong> across all contracts. However, hidden costs have increased: clients must pay a <strong>5% marketplace fee</strong> on top of every invoice plus a <strong>$2.95 contract initiation fee</strong>. Additionally, freelancers must purchase <strong>Connects ($0.15 each)</strong>, with competitive project bids often demanding 16 to 30 Connects ($2.40 to $4.50 per application) just to submit a proposal.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Upwork (10% + 5%)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">10% freelancer cut, 5% client surcharge, $0.15/connect bids.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Fiverr (20% + 5.5%)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">20% seller deduction, 5.5% buyer surcharge on all orders.</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-1">MegiLance (0% Launch)</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">0% freelancer fee, 0% client fee, 100% free proposals.</p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Frequently Asked Questions About Freelance Platform Fees
            </h2>
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  How much does Upwork take from freelancers in 2026?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  Upwork charges a flat 10% freelancer service fee on all earnings, plus $0.15 per Connect required to submit proposals (typically 8–16 connects per bid, costing $1.20–$2.40 per proposal).
                </p>
              </div>

              <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  How much does Upwork charge clients in fees?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  Upwork charges clients a 5% client marketplace fee on every billing plus a $2.95 contract initiation fee per contract.
                </p>
              </div>

              <div className="pb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Why is MegiLance offering 0% platform commission?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  We believe talented freelancers and growing businesses shouldn't be penalized with 10–20% middleman taxes. MegiLance provides intelligent AI talent matching, free proposal generation, and milestone escrow to foster a meritocratic global workforce.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
