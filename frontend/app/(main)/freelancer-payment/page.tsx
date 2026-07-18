import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Wallet, ArrowRight, Globe, CreditCard, Shield, Zap } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelancer Payment Methods & Secure Payouts | MegiLance',
  description: 'Get paid faster as a freelancer. MegiLance supports bank transfer, Stripe, PayPal, stablecoins, and crypto payouts. Zero withdrawal fees on most payment methods.',
  path: '/freelancer-payment',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'freelancer payment', 'how freelancers get paid', 'freelance payout methods',
    'freelance payment platform', 'get paid as a freelancer',
  ]),
});

export default function FreelancerPaymentPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 mb-4 dark:bg-green-950 dark:text-green-300">
          <Wallet size={13} />
          Payments &amp; Payouts
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Freelancer Payment &amp; Payout Methods
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Get paid on time, every time. MegiLance offers secure multi-currency payouts via bank wire, Stripe, stablecoins, and crypto — with milestone-protected escrow ensuring your earnings are guaranteed.
        </p>
      </header>

      {/* Payment Methods Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Supported Payment Methods</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          We know that international freelancers need flexible payment options. Whether you're accepting payments from clients in the US, EU, or Asia, MegiLance automatically handles currency conversion and regulatory compliance so you can focus on your work.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Globe className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">International Bank Wire</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Withdraw directly to any bank account in 150+ countries. Funds clear within 1–3 business days with no hidden transfer fees.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CreditCard className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Stripe &amp; PayPal</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Instant withdrawals to your linked Stripe or PayPal account for quick access to your freelance earnings.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Zap className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Stablecoin &amp; Crypto Payouts</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Receive USDT, USDC, or ETH payouts via blockchain with near-zero fees for cross-border freelance transactions.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Milestone Escrow Protection</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Every project is funded upfront into escrow. Your freelance payment is 100% guaranteed upon milestone delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-green-600 to-teal-700 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Set Up Your Payout Method</h2>
        <p className="text-green-100 max-w-xl mx-auto mb-6">
          Add your preferred payout method to your MegiLance account and receive payments from clients worldwide within hours of milestone completion.
        </p>
        <Link
          href="/settings/payout-methods/add"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-green-700 hover:scale-[1.02] transition-transform"
        >
          Configure Payouts <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">When do I receive my freelancer payment?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Payments are released from escrow immediately after the client approves a milestone. Bank wire transfers clear within 1–3 days, while crypto payouts settle within minutes.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Are there withdrawal fees?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Most payout methods have zero MegiLance withdrawal fees. Network fees may apply for crypto transactions, and bank wire fees depend on your financial institution.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
