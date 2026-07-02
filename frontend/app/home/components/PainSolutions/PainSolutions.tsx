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
    pain: 'Reputation risk & credential inflation',
    solution:
      'Every freelancer is vetted through smart reputation tracking and fraud detection. Zero fake reviews or inflated portfolios—only verifiable skills.',
  },
  {
    icon: CalendarClock,
    pain: 'Milestone anxiety & scope misalignment',
    solution:
      'Break projects into clear deliverables. Funds lock in escrow for each phase, aligning client and freelancer incentives and protecting work quality.',
  },
  {
    icon: Receipt,
    pain: 'High platform commission taxing your budget',
    solution:
      'We cut out excessive marketplace fees with transparent 5–8% platform rates. More of your capital directly incentivizes the expert doing the work.',
  },
  {
    icon: BadgeCheck,
    pain: 'Screening fatigue & matching mismatch',
    solution:
      'Skip the endless resume sorting. Our semantic AI matching connects you with professionals based on objective capability, work style, and project requirements.',
  },
];

export default function PainSolutions() {
  const mode = useThemeMode();
  const isDark = mode === 'dark';

  const cardBg = isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-gray-200/80';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-gray-300/85' : 'text-gray-600';
  const painText = isDark ? 'text-gray-200' : 'text-gray-800';

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'rgba(69,115,223,0.12)', color: '#4573df' }}
        >
          Why MegiLance
        </span>
        <h2 className={cn('text-3xl md:text-4xl font-bold tracking-tight', heading)}>
          Aligning market forces, <span style={{ color: '#4573df' }}>engineered for trust</span>
        </h2>
        <p className={cn('mt-3 text-base md:text-lg', muted)}>
          Traditional marketplaces thrive on friction, high fees, and information asymmetry. MegiLance
          rebuilds the freelancer-client relationship around transparency, psychological safety, and direct economic value.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, pain, solution }) => (
          <div
            key={pain}
            className={cn('rounded-2xl border p-6 transition-transform duration-200 hover:-translate-y-1', cardBg)}
            style={{ boxShadow: isDark ? 'none' : '0 8px 24px -16px rgba(0,0,0,0.25)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(69,115,223,0.12)', color: '#4573df' }}
            >
              <Icon size={22} />
            </div>
            <div className={cn('flex items-start gap-2 mb-3 text-sm font-semibold', painText)}>
              <X size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
              <span>{pain}</span>
            </div>
            <div className={cn('flex items-start gap-2 text-sm leading-relaxed', muted)}>
              <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#27AE60' }} />
              <span>{solution}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion CTA */}
      <div
        className="mt-10 rounded-2xl p-8 md:p-10 text-center"
        style={{
          background: 'linear-gradient(135deg, #4573df 0%, #6b93e8 100%)',
          boxShadow: '0 20px 50px -20px rgba(69,115,223,0.6)',
        }}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white">
          Post your project free — pay only when you&apos;re happy
        </h3>
        <p className="mt-2 text-white/85 max-w-2xl mx-auto">
          No upfront cost, no risk. Get matched with vetted talent in minutes and keep your money in
          escrow until milestones are approved.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-[#2a4fb0] hover:scale-[1.03] transition-transform"
          >
            Post a Project <ArrowRight size={18} />
          </Link>
          <Link
            href="/ai/price-estimator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
          >
            <Calculator size={18} /> Estimate my budget
          </Link>
        </div>
      </div>
    </div>
  );
}
