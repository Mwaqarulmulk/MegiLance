// @AI-HINT: Clients directory - for companies looking to hire talent — fully theme-aware via 3-file CSS module system
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Sparkles, ArrowRight, Zap, CheckCircle2, Lock, 
  Users, DollarSign, Award, Clock, FileText, ChevronRight, Star,
  Code, Layers, Search, Briefcase, Building2, HelpCircle
} from "lucide-react";
import Breadcrumbs from "@/app/components/molecules/Breadcrumbs/Breadcrumbs";

const CLIENT_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "100% Pre-Funded Milestone Escrow",
    desc: "Your capital never leaves escrow until you personally verify and approve the delivered milestones and source code.",
    badge: "Financial Safety",
  },
  {
    icon: DollarSign,
    title: "0% Client Platform Markup",
    desc: "Unlike traditional platforms taking 5% to 20% in client fees and payment processing markups, MegiLance operates with 0% commission.",
    badge: "Zero Hidden Fees",
  },
  {
    icon: Award,
    title: "Top 1% Rigorously Vetted Talent",
    desc: "Every engineer and designer in our network is screened for architectural rigor, clear communication, and proven production records.",
    badge: "Verified Quality",
  },
  {
    icon: Sparkles,
    title: "Instant AI Scoping & Blueprints",
    desc: "Convert project ideas into milestone sprint timelines, deliverables lists, and market-accurate budget forecasts in seconds.",
    badge: "Smart Tooling",
  },
];

const HIRING_ROLES = [
  { role: "Next.js & React Engineers", rate: "$65 – $95/hr", count: "120+ Available", link: "/hire/react-developer", icon: "⚡" },
  { role: "Python & AI Specialists", rate: "$75 – $120/hr", count: "85+ Available", link: "/hire/python-developer", icon: "🤖" },
  { role: "UI/UX & Product Designers", rate: "$55 – $85/hr", count: "95+ Available", link: "/hire/ui-ux-designer", icon: "🎨" },
  { role: "Mobile App Developers (Flutter/RN)", rate: "$60 – $90/hr", count: "70+ Available", link: "/hire/mobile-developer", icon: "📱" },
  { role: "Full-Stack Web Architects", rate: "$70 – $110/hr", count: "110+ Available", link: "/hire/fullstack-developer", icon: "🏗️" },
  { role: "DevOps & Cloud Engineers", rate: "$80 – $115/hr", count: "60+ Available", link: "/hire/devops-engineer", icon: "☁️" },
];

const WORKFLOW_STEPS = [
  {
    num: "01",
    title: "Scope & Price in Minutes",
    desc: "Use our free AI Project Cost Estimator to draft deliverables, milestones, and realistic market budgets.",
  },
  {
    num: "02",
    title: "Match Top Candidates",
    desc: "Receive AI-ranked proposals from vetted specialists whose verified experience aligns with your exact stack.",
  },
  {
    num: "03",
    title: "Fund Milestone Escrow",
    desc: "Deposit milestone funds safely into code-enforced escrow before work begins. Zero upfront payout risk.",
  },
  {
    num: "04",
    title: "Review & Instant Release",
    desc: "Inspect deliverables in your dedicated workroom. Release payments only when milestones meet your quality bar.",
  },
];

export default function ClientsPageClient() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Breadcrumb */}
        <Breadcrumbs />

        {/* Hero Section */}
        <header className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
            <Building2 size={13} className="text-blue-500" />
            <span>Built for Modern Tech Teams &amp; Visionary Founders</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Hire Elite Talent with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Escrow Protection
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-650 dark:text-slate-350 leading-relaxed max-w-2xl mx-auto">
            Eliminate delivery risk, agency markups, and hiring delays. Match with top 1% independent specialists and manage projects with pre-funded milestone escrow contracts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/create-project")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base transition shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              <Zap size={16} />
              <span>Post a Project Free</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => router.push("/freelancers")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white text-sm sm:text-base transition shadow-sm cursor-pointer"
            >
              <Search size={16} />
              <span>Browse Vetted Talent</span>
            </button>
          </div>

          {/* Social Proof Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" /> 0% Platform Markup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" /> Milestone-Based Release
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" /> Full IP &amp; NDA Ownership
            </span>
          </div>
        </header>

        {/* 4-Step Client Workflow Pipeline */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              How Hiring Works on MegiLance
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              From instant scoping to verified release in 4 straightforward steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-800 transition"
              >
                <div>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono block mb-3">
                    {step.num}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Client Value Matrix */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Why High-Growth Companies Choose MegiLance
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Built to replace chaotic bidding platforms with guaranteed delivery standards.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {CLIENT_BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Icon size={24} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {benefit.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Roles Quick Browse */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Hire Specialists Across Core Domains
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Explore real-time hourly benchmarks and vetted freelancer availability.
              </p>
            </div>
            <Link
              href="/freelancers"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
            >
              <span>View All Talent</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HIRING_ROLES.map((r) => (
              <Link
                key={r.role}
                href={r.link}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {r.role}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {r.rate}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <span>{r.count}</span>
                  <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Final Client CTA Banner */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-2xl text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
              <ShieldCheck size={14} className="text-emerald-300" /> Start with Zero Risk
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to Hire Your Next Lead Specialist?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Post your project in under 2 minutes. Receive AI-aligned proposals and release payments only on verified milestone completion.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/create-project")}
              className="px-8 py-4 rounded-xl font-bold bg-white text-blue-900 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl text-sm sm:text-base cursor-pointer"
            >
              Post a Project Free
            </button>
            <button
              type="button"
              onClick={() => router.push("/signup?role=client")}
              className="px-8 py-4 rounded-xl font-bold border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all text-sm sm:text-base cursor-pointer"
            >
              Create Client Account
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
