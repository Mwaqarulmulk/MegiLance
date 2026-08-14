// @AI-HINT: High-conversion "pain point → solution" section for the homepage. Speaks
// directly to client anxieties (cross-border pay, overpaying, risk/trust, late delivery)
// and shows how MegiLance removes each one. Built to drive "Post a Project" sign-ups.
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe2, Calculator, ShieldCheck, CalendarClock, Receipt, BadgeCheck, ArrowRight, X, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';

const ITEMS = [
  {
    icon: Globe2,
    pain: 'Cross-border payment friction & banking barriers',
    solution:
      'On-chain escrow settles instantly. Bypass high wire fees, unstable local currencies, and banking restrictions. Funds release automatically upon verified milestone completion.',
  },
  {
    icon: Calculator,
    pain: 'Pricing asymmetry & budget guesswork',
    solution:
      'Our AI Price Estimator analyzes real-time market indices, location data, and skill complexity, giving you fair, location-adjusted pricing in seconds.',
  },
  {
    icon: ShieldCheck,
    pain: 'Reputation risk & credential uncertainty',
    solution:
      'Evaluate talent through multi-factor competency assessments and verified milestone delivery history, ensuring reliable skills on every job.',
  },
  {
    icon: CalendarClock,
    pain: 'Milestone anxiety & scope misalignment',
    solution:
      'Break projects into clear deliverables. Funds lock in escrow for each phase, aligning client and freelancer expectations and protecting work quality.',
  },
  {
    icon: Receipt,
    pain: 'High platform commission taxing your budget',
    solution:
      'Take advantage of 0% promotional platform commission during our launch. More of your project capital directly rewards the specialist doing the work.',
  },
  {
    icon: BadgeCheck,
    pain: 'Screening fatigue & matching mismatch',
    solution:
      'Skip the endless resume sorting. Our semantic AI matching connects you with professionals based on objective capability, work style, and project requirements.',
  },
];

import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';

export default function PainSolutions() {
  const mode = useThemeMode();
  const isDark = mode === 'dark';

  const cardBg = isDark
    ? 'bg-slate-900/60 border-slate-800/80 shadow-sm'
    : 'bg-white border-slate-200/80 shadow-sm';
  const heading = isDark ? 'text-slate-50' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-600';
  const painText = isDark ? 'text-slate-200' : 'text-slate-800';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
          style={{ background: 'rgba(69,115,223,0.12)', color: '#3b66d1', borderColor: 'rgba(69,115,223,0.25)' }}
        >
          Why MegiLance
        </span>
        <h2 className={cn('text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight', heading)}>
          Aligning collaboration, <span style={{ color: '#4573df' }}>engineered for trust</span>
        </h2>
        <p className={cn('mt-4 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto', muted)}>
          MegiLance eliminates marketplace friction with free planning tools, transparent milestone escrow, and verified skill matching.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, pain, solution }) => (
          <div
            key={pain}
            className={cn('rounded-2xl border p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between', cardBg)}
          >
            <div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm"
                style={{ background: 'rgba(69,115,223,0.12)', color: '#4573df' }}
              >
                <Icon size={24} />
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 dark:bg-red-950/30 border border-red-500/20 mb-3 flex items-start gap-2.5">
                <X size={18} className="mt-0.5 flex-shrink-0 text-red-500 font-bold" />
                <span className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300 leading-snug">{pain}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5">
                <Check size={18} className="mt-0.5 flex-shrink-0 text-emerald-500 font-bold" />
                <span className={cn('text-xs sm:text-sm font-medium leading-relaxed', muted)}>{solution}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion CTA with Lottie Rocket */}
      <div
        className="mt-12 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3b66d1 0%, #4573df 50%, #6b93e8 100%)',
          boxShadow: '0 24px 60px -15px rgba(69,115,223,0.5)',
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Post your project free — pay only when you&apos;re happy
            </h3>
            <p className="mt-3 text-base text-white/90 font-medium leading-relaxed">
              No upfront cost, no risk. Get matched with vetted talent in minutes and keep your money in
              escrow until milestones are approved.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold bg-white text-[#2a4fb0] hover:bg-slate-50 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg text-sm sm:text-base"
              >
                Post a Project <ArrowRight size={20} />
              </Link>
              <Link
                href="/ai/price-estimator"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold border border-white/50 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all text-sm sm:text-base"
              >
                <Calculator size={20} /> Estimate my budget
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0 w-full md:w-72 h-52 md:h-64">
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
