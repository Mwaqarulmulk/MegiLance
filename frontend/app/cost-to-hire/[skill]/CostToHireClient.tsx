// @AI-HINT: Client component for interactive Cost to Hire Calculator by skill.
// Targets low-KD (8-16%) high-commercial search queries: "how much does it cost to hire a [skill]"
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, Calculator, Globe, Clock, ShieldCheck, ArrowRight, 
  CheckCircle2, Users, TrendingUp, Sparkles, Award 
} from 'lucide-react';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';

export interface SkillCostData {
  slug: string;
  name: string;
  category: string;
  avgHourlyRate: number;
  ratesBySeniority: {
    junior: { min: number; max: number; desc: string };
    mid: { min: number; max: number; desc: string };
    senior: { min: number; max: number; desc: string };
  };
  ratesByRegion: {
    country: string;
    flag: string;
    hourlyRange: string;
    annualSalary: string;
  }[];
  projectEstimates: {
    type: string;
    timeline: string;
    budget: string;
    desc: string;
  }[];
  keySkills: string[];
  faqs: { question: string; answer: string }[];
}

interface Props {
  data: SkillCostData;
}

export default function CostToHireClient({ data }: Props) {
  const [seniority, setSeniority] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [estimatedHours, setEstimatedHours] = useState<number>(80);

  const selectedRate = data.ratesBySeniority[seniority];
  const avgHourly = Math.round((selectedRate.min + selectedRate.max) / 2);
  const totalEstimatedCost = avgHourly * estimatedHours;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* Hero Header */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-4 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 shadow-sm">
            <DollarSign size={13} className="text-blue-600" />
            2026 Hiring &amp; Compensation Guide
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            How Much Does It Cost to Hire a {data.name}?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-350 leading-relaxed">
            Real market hourly rates, international salary benchmarks, and project budget estimates for hiring verified <strong>{data.name}s</strong> with 0% platform markup.
          </p>
        </header>

        {/* Interactive Cost Estimator Widget */}
        <div className="grid md:grid-cols-12 gap-8 mb-12">
          {/* Controls */}
          <div className="md:col-span-6 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="text-blue-500" size={20} />
              Calculate Project Budget
            </h2>

            {/* Seniority Selector */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Experience Level:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'junior', label: 'Junior (1-3 yrs)', rate: `$${data.ratesBySeniority.junior.min}–$${data.ratesBySeniority.junior.max}/hr` },
                  { id: 'mid', label: 'Mid-Level (3-5 yrs)', rate: `$${data.ratesBySeniority.mid.min}–$${data.ratesBySeniority.mid.max}/hr` },
                  { id: 'senior', label: 'Senior (5+ yrs)', rate: `$${data.ratesBySeniority.senior.min}–$${data.ratesBySeniority.senior.max}/hr` },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeniority(s.id as any)}
                    className={`p-3 rounded-2xl border text-center transition ${
                      seniority === s.id
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-white font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">{s.id.toUpperCase()}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{s.rate}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hours Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Estimated Project Hours
                </label>
                <span className="text-base font-black text-blue-600 dark:text-blue-400">
                  {estimatedHours} hours
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>20 hrs (Small task)</span>
                <span>80 hrs (MVP sprint)</span>
                <span>300 hrs (Full build)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-4">
              {selectedRate.desc}
            </p>
          </div>

          {/* Result Card */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white inline-block mb-3">
                  Estimated Project Cost
                </span>
                <div className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
                  ${totalEstimatedCost.toLocaleString()}
                </div>
                <p className="text-blue-100 text-sm">
                  Based on ~${avgHourly}/hr average rate for {seniority} {data.name}s over {estimatedHours} development hours.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-blue-200 block mb-0.5">Platform Markup</span>
                  <strong className="text-emerald-300 font-bold text-sm">$0.00 (0% Commission)</strong>
                </div>
                <div>
                  <span className="text-blue-200 block mb-0.5">Payment Protection</span>
                  <strong className="text-white font-bold text-sm">Milestone Escrow</strong>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/hire/${data.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition shadow-sm"
              >
                <Users size={16} />
                <span>Hire {data.name}s</span>
              </Link>
              <Link
                href={`/create-project?title=Hire+${encodeURIComponent(data.name)}&budget=${totalEstimatedCost}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-900 dark:text-white text-sm transition"
              >
                <span>Post Job Brief</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Global Rates by Region Table */}
        <section className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Globe className="text-blue-500" size={22} />
            {data.name} Hourly Rates by Country &amp; Region
          </h2>
          <p className="text-sm text-slate-650 dark:text-slate-400 mb-6">
            Developer rates vary based on cost of living, timezone overlap, and regional talent concentration:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Country / Region</th>
                  <th className="pb-3">Hourly Rate Range</th>
                  <th className="pb-3">Equivalent Annual Cost</th>
                  <th className="pb-3 text-right">MegiLance Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {data.ratesByRegion.map((r) => (
                  <tr key={r.country} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td className="py-3.5 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{r.flag}</span>
                      <span>{r.country}</span>
                    </td>
                    <td className="py-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">{r.hourlyRange}</td>
                    <td className="py-3.5 font-mono text-slate-650 dark:text-slate-400">{r.annualSalary}</td>
                    <td className="py-3.5 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      0% Commission
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Typical Project Types & Budgets */}
        <section className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Typical Project Budgets for {data.name}s
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.projectEstimates.map((proj) => (
              <div key={proj.type} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">{proj.type}</h3>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mb-2">
                    {proj.budget}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {proj.desc}
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  <span>Timeline: {proj.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {data.faqs.map((faq) => (
              <div key={faq.question} className="border-b border-slate-100 dark:border-slate-850 pb-4 last:border-0 last:pb-0">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
