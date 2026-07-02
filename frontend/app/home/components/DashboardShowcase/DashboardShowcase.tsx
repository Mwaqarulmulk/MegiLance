'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  Laptop, 
  Layers, 
  CheckCircle, 
  Lock, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight,
  User,
  Briefcase,
  Sliders,
  DollarSign
} from 'lucide-react';
import commonStyles from './DashboardShowcase.common.module.css';

type ScreenKey = 'client' | 'estimator' | 'proposals' | 'escrow';

export default function DashboardShowcase() {
  const mode = useThemeMode();
  const isDark = mode === 'dark';
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('client');

  const screens = {
    client: {
      title: 'Client Dashboard',
      tagline: 'Manage active contracts at a glance',
      desc: 'Track active milestones, budget allocations, chat sessions, and delivery check-offs in real-time from a single workspace control panel.',
      mockup: (
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Active Projects</h4>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Client View</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200">SaaS Admin Dashboard Redesign</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Assigned to: Elena Popova</p>
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">$1,200 Budget</span>
            </div>
            <div className="space-y-1.5 mt-3">
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>Milestone 2/3: API Integration</span>
                <span>65% Completed</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </div>
      )
    },
    estimator: {
      title: 'AI Price Estimator Output',
      tagline: 'Grounded cost calculations',
      desc: 'Receive reliable budget ranges, required hours, and recommended milestone structures before drafting contracts.',
      mockup: (
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">AI Cost Estimate</h4>
            <span className="text-[10px] bg-green-150 text-green-700 px-2 py-0.5 rounded-full font-bold">Grounded ML</span>
          </div>
          <div className="text-center py-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Estimated Range</p>
            <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mt-1">$450 — $700</p>
            <p className="text-[9px] text-slate-400 mt-1">Based on Next.js, API Integration &amp; 3 weeks duration</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg">
              <span className="text-slate-400 block mb-0.5">Average Hourly Rate</span>
              <strong className="text-slate-800 dark:text-slate-200">$55/hr</strong>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg">
              <span className="text-slate-400 block mb-0.5">Confidence Level</span>
              <strong className="text-slate-800 dark:text-slate-200 text-emerald-500">High (92%)</strong>
            </div>
          </div>
        </div>
      )
    },
    proposals: {
      title: 'Proposal Rankings',
      tagline: 'No bid-boosting. Real meritocracy.',
      desc: 'Compare submissions sorted objectively by AI Compatibility Scores. Evaluates developer experience, skill overlap, and ratings.',
      mockup: (
        <div className="p-4 md:p-6 space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Ranked Bids</h4>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">AI Rank</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Aisha Khan', score: 98, rate: '$85/hr', status: 'Best Match' },
              { name: 'Elena Popova', score: 89, rate: '$75/hr', status: 'Strong Match' }
            ].map((f, idx) => (
              <div key={f.name} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-850 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                    {f.name[0]}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-850 dark:text-slate-200">{f.name}</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">{f.rate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 block">{f.score}% Match</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded font-bold">{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    escrow: {
      title: 'Milestone Escrow Screen',
      tagline: 'Code-enforced financial safety',
      desc: 'Smart contract ledger locks payment before milestones start, releasing them automatically upon approval.',
      mockup: (
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Escrow Status</h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">On-Chain Locked</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Lock size={18} />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-850 dark:text-slate-250">Milestone 1: UI &amp; Auth Setup</h5>
                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Funded &amp; Secured</p>
              </div>
            </div>
            <strong className="text-xs text-slate-800 dark:text-slate-250">$350.00 USDC</strong>
          </div>
          <div className="flex justify-end">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              Verifiable Prototype contract active
            </span>
          </div>
        </div>
      )
    }
  };

  return (
    <section className={cn(commonStyles.section, isDark ? commonStyles.dark : commonStyles.light)}>
      <div className={commonStyles.container}>
        
        {/* Section Header */}
        <div className={commonStyles.header}>
          <span className={commonStyles.badge}>
            <Sliders size={13} />
            See MegiLance In Action
          </span>
          <h2 className={commonStyles.title}>Interactive Product Walkthrough</h2>
          <p className={commonStyles.subtitle}>
            Explore our actual core software interfaces showing live project planning, price modeling, and smart escrow security.
          </p>
        </div>

        {/* Main Side-by-Side Grid */}
        <div className={commonStyles.grid}>
          
          {/* Left Column: Interactive Controls */}
          <div className={commonStyles.controls}>
            {Object.entries(screens).map(([key, data]) => {
              const isActive = activeScreen === key;
              return (
                <button
                  key={key}
                  className={cn(
                    commonStyles.ctrlBtn, 
                    isActive && commonStyles.ctrlBtnActive
                  )}
                  onClick={() => setActiveScreen(key as ScreenKey)}
                >
                  <h3 className={commonStyles.ctrlTitle}>{data.title}</h3>
                  <p className={commonStyles.ctrlTag}>{data.tagline}</p>
                  {isActive && (
                    <p className={commonStyles.ctrlDesc}>{data.desc}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Premium Stylized Browser/Laptop Frame Mockup */}
          <div className={commonStyles.previewContainer}>
            <div className={commonStyles.browserFrame}>
              <div className={commonStyles.browserHeader}>
                <div className={commonStyles.browserDots}>
                  <span className={commonStyles.dotRed} />
                  <span className={commonStyles.dotYellow} />
                  <span className={commonStyles.dotGreen} />
                </div>
                <div className={commonStyles.browserUrl}>
                  https://megilance.site/portal/dashboard
                </div>
              </div>
              <div className={commonStyles.browserBody}>
                {screens[activeScreen].mockup}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
