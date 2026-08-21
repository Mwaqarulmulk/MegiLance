// @AI-HINT: High-craft comparison and platform advantages section for the homepage.
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe2, Calculator, ShieldCheck, CalendarClock, Receipt, BadgeCheck, ArrowRight, X, Check,
  Sparkles, Zap, Lock, DollarSign, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';

const COMPARISON_ROWS = [
  {
    topic: 'Platform Commission & Fees',
    traditional: '10% to 20% commission deducted from every payment',
    megilance: '0% promotional launch fee — keep 100% of earned project capital',
    icon: Receipt,
  },
  {
    topic: 'Payment & Escrow Protection',
    traditional: 'Slow manual payouts, wire fees, and dispute anxiety',
    megilance: 'Code-enforced milestone escrow with instant multi-currency releases',
    icon: Lock,
  },
  {
    topic: 'Pricing & Budget Transparency',
    traditional: 'Blind guesswork, price gouging, and endless bidding wars',
    megilance: 'Data-grounded AI Price Estimator calibrated on 50k+ live projects',
    icon: Calculator,
  },
  {
    topic: 'Talent Screening & Matching',
    traditional: 'Manual resume sorting through hundreds of spam bids',
    megilance: 'Objective 7-factor AI compatibility scoring on skill & delivery record',
    icon: BadgeCheck,
  },
  {
    topic: 'Project Scope Alignment',
    traditional: 'Vague contracts causing scope creep and deliverable friction',
    megilance: 'Structured Milestone Work Breakdown with transparent checkpoints',
    icon: CalendarClock,
  },
];

export default function PainSolutions() {
  const mode = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
          style={{ 
            background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)', 
            color: isDark ? '#60a5fa' : '#2563eb', 
            borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.2)' 
          }}
        >
          <Sparkles size={14} className="text-amber-500" />
          The MegiLance Advantage
        </span>
        <h2 className={cn(
          'text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight', 
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          Engineered for Trust, <span className="text-blue-600 dark:text-blue-400">Zero Friction</span> &amp; Fair Work
        </h2>
        <p className={cn(
          'mt-4 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto', 
          isDark ? 'text-slate-400' : 'text-slate-600'
        )}>
          See how MegiLance replaces outdated marketplace practices with modern milestone escrow, transparent pricing, and instant AI scoping.
        </p>
      </div>

      {/* Comparison Matrix Table / Cards */}
      <div className="space-y-4 mb-16">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-extrabold text-xs uppercase tracking-wider text-slate-400">
          <div className="col-span-4">Platform Dimension</div>
          <div className="col-span-4 text-rose-500 dark:text-rose-400">❌ Traditional Marketplaces</div>
          <div className="col-span-4 text-emerald-600 dark:text-emerald-400">✅ MegiLance Guarantee</div>
        </div>

        {COMPARISON_ROWS.map((row, idx) => {
          const Icon = row.icon;
          return (
            <div
              key={row.topic}
              className={cn(
                'rounded-2xl border p-5 md:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
                isDark 
                  ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xl' 
                  : 'bg-white border-slate-200/90 shadow-sm'
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Topic Column */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)', 
                      color: isDark ? '#60a5fa' : '#2563eb' 
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className={cn('font-bold text-sm md:text-base', isDark ? 'text-white' : 'text-slate-900')}>
                      {row.topic}
                    </h3>
                  </div>
                </div>

                {/* Traditional Column */}
                <div className="md:col-span-4 p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200/60 dark:border-rose-900/40 flex items-start gap-2.5">
                  <X size={16} className="text-rose-500 font-bold flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 leading-snug">
                    {row.traditional}
                  </span>
                </div>

                {/* MegiLance Column */}
                <div className="md:col-span-4 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-500 font-bold flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 leading-snug">
                    {row.megilance}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Banner Card */}
      <div
        className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
          boxShadow: '0 24px 60px -15px rgba(37, 99, 235, 0.45)',
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 text-left">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-white backdrop-blur-md mb-3 border border-white/20">
              <Shield size={12} className="text-emerald-300" /> 100% Escrow Guarantee
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Post Your Project Free — Release Funds Only on Milestone Approval
            </h3>
            <p className="mt-3 text-base text-white/90 font-medium leading-relaxed">
              No upfront risk, zero platform cut during launch. Get matched with top specialists in minutes and hold your project budget in secure milestone escrow.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white text-blue-800 hover:bg-slate-50 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl text-sm sm:text-base"
              >
                <span>Post a Project Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/ai/price-estimator"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all text-sm sm:text-base"
              >
                <Calculator size={18} />
                <span>Estimate Project Budget</span>
              </Link>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-full md:w-72 h-52 md:h-64 flex items-center justify-center">
            <BrandLottiePlayer
              src="/lottie/10_product_launch_rocket.json"
              ariaLabel="Rocket Launch Animation"
              className="w-full h-full"
              glow={false}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
