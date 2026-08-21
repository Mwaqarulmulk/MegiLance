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
  DollarSign,
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle2,
  FileCode,
  Globe
} from 'lucide-react';
import commonStyles from './DashboardShowcase.common.module.css';
import lightStyles from './DashboardShowcase.light.module.css';
import darkStyles from './DashboardShowcase.dark.module.css';

type ScreenKey = 'workroom' | 'estimator' | 'proposals' | 'escrow';

export default function DashboardShowcase() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('workroom');
  const [demoHourSlider, setDemoHourSlider] = useState<number>(45);

  const screens = {
    workroom: {
      title: 'Collaboration Workroom',
      tagline: 'Real-time project execution',
      desc: 'Track milestones, chat directly, review deliverables, and release escrow funds in real time without messy email chains.',
      mockup: (
        <div className="p-4 md:p-6 space-y-4 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">Next.js 16 SaaS Dashboard</h4>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-extrabold">
              Milestone 2 Active
            </span>
          </div>

          {/* Milestone Progress Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Sprint</span>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">API Integration &amp; Stripe Billing</h5>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">$1,400.00 In Escrow</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Progress: 75% Completed</span>
                <span>Due in 3 days</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>

          {/* Workroom Chat & Deliverable Stream */}
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                EP
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Elena Popova:</span> Delivered webhook handlers &amp; unit tests. Ready for verification!
              </div>
            </div>
          </div>
        </div>
      )
    },
    estimator: {
      title: 'AI Price & Scope Modeler',
      tagline: 'Instant data-calibrated budgets',
      desc: 'Ground contracts in real-time global market indices with automated hourly-to-fixed milestone conversion.',
      mockup: (
        <div className="p-4 md:p-6 space-y-4 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">Real-Time Scope Calculator</h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
              96% Confidence
            </span>
          </div>

          <div className="text-center py-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Project Total</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              ${(demoHourSlider * 65).toLocaleString()} USD
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {demoHourSlider} hours @ $65/hr market median
            </span>
          </div>

          {/* Interactive slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span>Adjust Project Scope:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{demoHourSlider} Dev Hours</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              value={demoHourSlider}
              onChange={(e) => setDemoHourSlider(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>
        </div>
      )
    },
    proposals: {
      title: '7-Factor Meritocratic Matching',
      tagline: 'Zero bid-boosting · Pure competency',
      desc: 'Review applicants ranked objectively by multi-factor AI compatibility models evaluating skill overlap, delivery velocity, and reviews.',
      mockup: (
        <div className="p-4 md:p-6 space-y-3 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">Ranked Specialist Matches</h4>
            <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
              Multi-Factor Score
            </span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Elena Popova', score: 99, role: 'Full-Stack Lead', rate: '$75/hr', status: 'Best Match' },
              { name: 'Marcus Vance', score: 95, role: 'Next.js Specialist', rate: '$68/hr', status: 'Strong Fit' }
            ].map((f) => (
              <div key={f.name} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {f.name[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{f.name}</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{f.role} · {f.rate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">{f.score}% Match</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-bold">{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    escrow: {
      title: 'Milestone Escrow Vault',
      tagline: 'Code-enforced financial safety',
      desc: 'Milestone funds lock safely before work begins, releasing to the specialist only upon your deliverable verification.',
      mockup: (
        <div className="p-4 md:p-6 space-y-4 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">Escrow Protection Vault</h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
              100% Pre-Funded
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Lock size={18} />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Milestone 1: Prototype Deliverable</h5>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Funds Held in Secure Escrow</p>
              </div>
            </div>
            <strong className="text-xs font-black text-slate-900 dark:text-white">$1,200.00 USD</strong>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" /> Guaranteed Release on Approval
            </span>
            <span>Tx: #ESC-948271</span>
          </div>
        </div>
      )
    }
  };

  return (
    <section className={cn(commonStyles.section, themeStyles.section)} aria-label="Interactive Product Walkthrough">
      <div className={commonStyles.container}>
        
        {/* Section Header */}
        <div className={commonStyles.header}>
          <div className={cn(commonStyles.badge, themeStyles.badge)}>
            <Sliders size={13} className="text-blue-500" />
            <span>Live Interface Walkthrough</span>
          </div>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>
            Experience the Software Built for Frictionless Collaboration
          </h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Explore real interfaces powering active milestone scoping, meritocratic talent ranking, and secure escrow settlement.
          </p>
        </div>

        {/* Main Grid */}
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
                    themeStyles.ctrlBtn,
                    isActive && themeStyles.ctrlBtnActive
                  )}
                  onClick={() => setActiveScreen(key as ScreenKey)}
                  aria-pressed={isActive}
                >
                  <h3 className={cn(commonStyles.ctrlTitle, themeStyles.ctrlTitle)}>{data.title}</h3>
                  <p className={cn(commonStyles.ctrlTag, themeStyles.ctrlTag)}>{data.tagline}</p>
                  {isActive && (
                    <p className={cn(commonStyles.ctrlDesc, themeStyles.ctrlDesc)}>{data.desc}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Premium Stylized Browser Frame */}
          <div className={commonStyles.previewContainer}>
            <div className={cn(commonStyles.browserFrame, themeStyles.browserFrame)}>
              <div className={cn(commonStyles.browserHeader, themeStyles.browserHeader)}>
                <div className={commonStyles.browserDots}>
                  <span className={commonStyles.dotRed} />
                  <span className={commonStyles.dotYellow} />
                  <span className={commonStyles.dotGreen} />
                </div>
                <div className={cn(commonStyles.browserUrl, themeStyles.browserUrl)}>
                  https://megilance.site/portal/workroom
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
