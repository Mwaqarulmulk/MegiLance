// @AI-HINT: High-intent interactive Fiverr Fee & Commission Calculator.
// Targets viral keywords: "fiverr fee calculator", "fiverr fees calculator", "how much does fiverr take"
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, DollarSign, ShieldCheck, Sparkles, TrendingUp, Zap, CheckCircle2, Award } from 'lucide-react';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';

export default function FiverrFeeCalculatorPage() {
  const [gigPrice, setGigPrice] = useState<number>(500);
  const [tipsAmount, setTipsAmount] = useState<number>(50);
  const [ordersPerMonth, setOrdersPerMonth] = useState<number>(8);

  // Fiverr Calculations (20% flat seller cut on price + tips, 5.5% + $2.50 buyer fee)
  const totalOrderValue = gigPrice + tipsAmount;
  const fiverrSellerCut = totalOrderValue * 0.20;
  const fiverrBuyerFee = (gigPrice * 0.055) + (gigPrice < 50 ? 2.50 : 0);
  const totalFiverrCutPerOrder = fiverrSellerCut + fiverrBuyerFee;
  const monthlyFiverrFeeLoss = fiverrSellerCut * ordersPerMonth;

  // MegiLance (0% platform commission during 2026 launch)
  const megilanceFee = 0;
  const netEarningsFiverr = totalOrderValue - fiverrSellerCut;
  const netEarningsMegiLance = totalOrderValue;
  const monthlySavingsMegiLance = monthlyFiverrFeeLoss;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': 'Fiverr Fee Calculator & Seller Commission Estimator',
        'url': 'https://megilance.site/tools/fiverr-fee-calculator',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0.00',
          'priceCurrency': 'USD',
        },
        'description': 'Calculate exact Fiverr 20% seller commission fees, buyer surcharges (5.5%), and tip deductions vs MegiLance 0% fee marketplace savings.',
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How much does Fiverr take from sellers in 2026?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Fiverr takes a flat 20% commission from all seller earnings, including Gig packages, custom milestone offers, and client tips.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Does Fiverr take 20% of tips?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! Fiverr deducts 20% from client tips left for sellers.',
            },
          },
          {
            '@type': 'Question',
            'name': 'How does MegiLance compare to Fiverr fees?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'MegiLance charges 0% platform commission during our 2026 launch period. Freelancers keep 100% of their earnings and tips with pre-funded milestone escrow protection.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://megilance.site' },
          { '@type': 'ListItem', 'position': 2, 'name': 'AI Tools', 'item': 'https://megilance.site/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Fiverr Fee Calculator', 'item': 'https://megilance.site/tools/fiverr-fee-calculator' },
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
              Commission Transparency &amp; Net Take-Home Calculator
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Fiverr Fee Calculator &amp; Commission Estimator
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-350 leading-relaxed">
              Calculate exact Fiverr seller deductions (20%), buyer surcharges, and tip cuts. Discover how much you keep on MegiLance with <strong>0% platform commission</strong>.
            </p>
          </header>

          {/* Interactive Calculator Grid */}
          <div className="grid md:grid-cols-12 gap-8 mb-12">
            {/* Input Controls */}
            <div className="md:col-span-5 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="text-emerald-500" size={20} />
                Order Parameters
              </h2>

              {/* Gig Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Gig / Order Price ($)
                  </label>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ${gigPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="5000"
                  step="25"
                  value={gigPrice}
                  onChange={(e) => setGigPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Tips Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Client Tip Amount ($)
                  </label>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ${tipsAmount} (Fiverr takes 20%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={tipsAmount}
                  onChange={(e) => setTipsAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Monthly Orders Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Orders Completed Per Month
                  </label>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {ordersPerMonth} orders/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={ordersPerMonth}
                  onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            {/* Output Dashboard */}
            <div className="md:col-span-7 space-y-4">
              {/* Massive Annual Savings Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white inline-block mb-3">
                  Your Monthly Savings on MegiLance
                </span>
                <div className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
                  +${monthlySavingsMegiLance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-normal text-emerald-200 ml-1">/ month</span>
                </div>
                <p className="text-emerald-100 text-sm max-w-md">
                  That is <strong>+${(monthlySavingsMegiLance * 12).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/year</strong> kept in your bank account instead of paying 20% platform commission!
                </p>
              </div>

              {/* Per Order Breakdown */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Single Order Breakdown (${totalOrderValue} Total)
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="text-slate-650 dark:text-slate-400">Fiverr 20% Seller Commission</span>
                    <div className="text-right">
                      <span className="line-through text-red-500 mr-2 font-mono">-${fiverrSellerCut.toFixed(2)}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">$0.00 on MegiLance</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="text-slate-650 dark:text-slate-400">Fiverr 5.5% Buyer Surcharge</span>
                    <div className="text-right">
                      <span className="line-through text-red-500 mr-2 font-mono">+${fiverrBuyerFee.toFixed(2)}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">$0.00 on MegiLance</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 font-bold text-base">
                    <span className="text-slate-900 dark:text-white">Seller Net Take-Home</span>
                    <div className="text-right font-mono">
                      <div className="text-xs font-normal text-slate-400">Fiverr: ${netEarningsFiverr.toFixed(2)}</div>
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
                    <span>Keep 100% of Your Earnings</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/compare/fiverr"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-900 dark:text-white text-sm transition"
                  >
                    <span>Fiverr vs MegiLance Review</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Explanatory SEO Content */}
          <section className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 mb-12 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Understanding Fiverr's 20% Fee Structure in 2026
            </h2>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Fiverr charges one of the highest commission rates in the freelance marketplace industry. Sellers lose <strong>20% of every dollar earned</strong>, including Gig packages, gig extras, custom offers, and client tips. On top of this, buyers pay a <strong>5.5% service fee</strong> plus an extra <strong>$2.50 fee</strong> on orders below $50. MegiLance eliminates this 20% tax with 0% platform commission and milestone escrow protection.
            </p>
          </section>

          {/* FAQs */}
          <section className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Frequently Asked Questions About Fiverr Fees
            </h2>
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  How much does Fiverr take from sellers in 2026?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  Fiverr takes a flat 20% commission from all seller earnings, including Gig packages, custom milestone offers, and client tips.
                </p>
              </div>

              <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Does Fiverr take 20% of tips?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  Yes! Fiverr deducts 20% from client tips left for sellers.
                </p>
              </div>

              <div className="pb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  How does MegiLance compare to Fiverr fees?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  MegiLance charges 0% platform commission during our 2026 launch period. Freelancers keep 100% of their earnings and tips with pre-funded milestone escrow protection.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
