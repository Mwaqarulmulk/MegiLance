// @AI-HINT: Flagship AI Startup Advisor & Business Blueprint Engine.
// Positions MegiLance as the AI Operating System for Starting, Building, and Scaling Digital Businesses.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Brain, Sparkles, ArrowRight, CheckCircle2, DollarSign, Clock, Users, 
  Layers, Code, ShieldCheck, Download, Share2, Compass, Rocket, Briefcase 
} from 'lucide-react';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';

interface ProjectBlueprint {
  title: string;
  category: string;
  recommendedStack: string[];
  timelineWeeks: number;
  budgetRange: { min: number; max: number };
  teamNeeded: { role: string; count: number; avgRate: number; link: string; icon: string }[];
  milestones: { name: string; duration: string; deliverables: string[] }[];
  growthAdvice: string[];
}

const BUSINESS_TEMPLATES: Record<string, ProjectBlueprint> = {
  'ecommerce': {
    title: 'Modern Direct-to-Consumer (D2C) E-Commerce Brand',
    category: 'E-Commerce & Retail',
    recommendedStack: ['Next.js 16 (Storefront)', 'Shopify Storefront API / MedusaJS', 'Stripe Payments', 'Tailwind CSS', 'Klaviyo'],
    timelineWeeks: 6,
    budgetRange: { min: 3500, max: 7500 },
    teamNeeded: [
      { role: 'Full-Stack Developer', count: 1, avgRate: 75, link: '/hire/fullstack-developer', icon: '💻' },
      { role: 'UI/UX Brand Designer', count: 1, avgRate: 65, link: '/hire/ui-ux-designer', icon: '🎨' },
      { role: 'SEO & Performance Marketer', count: 1, avgRate: 55, link: '/hire/seo-specialist', icon: '📈' },
    ],
    milestones: [
      { name: 'Phase 1: Brand System & Figma Prototype', duration: 'Weeks 1-2', deliverables: ['Figma Design System', 'Mobile Responsive Layouts', 'Checkout UX Flow'] },
      { name: 'Phase 2: Headless Storefront & Catalog Setup', duration: 'Weeks 3-4', deliverables: ['Product Catalog Integration', 'Cart & Multi-Currency Checkout', 'Stripe / PayPal Gateway'] },
      { name: 'Phase 3: Marketing Automation & SEO Setup', duration: 'Week 5', deliverables: ['Google Analytics 4 & Meta Pixel', 'Automated Email Abandoned Cart Flows', 'Technical On-Page SEO'] },
      { name: 'Phase 4: QA, Load Testing & Launch', duration: 'Week 6', deliverables: ['Cross-Browser QA', 'Payment Gateway Live Test', 'Production Deployment'] },
    ],
    growthAdvice: [
      'Focus on mobile conversion rate optimization — 72% of D2C traffic is on smartphones.',
      'Implement one-click upsells and post-purchase email flows to increase Average Order Value (AOV) by 25%+',
      'Ensure zero platform transaction cuts by utilizing MegiLance milestone contracts for development.',
    ],
  },
  'saas': {
    title: 'AI-Powered B2B SaaS Platform (MVP to Scale)',
    category: 'SaaS & Enterprise Tech',
    recommendedStack: ['Next.js 16 + React 19', 'FastAPI / Python (AI Backend)', 'PostgreSQL / Supabase', 'OpenAI / Claude API', 'Stripe Billing'],
    timelineWeeks: 8,
    budgetRange: { min: 6000, max: 14000 },
    teamNeeded: [
      { role: 'Senior Python / AI Engineer', count: 1, avgRate: 95, link: '/hire/python-developer', icon: '🤖' },
      { role: 'Full-Stack Next.js Developer', count: 1, avgRate: 85, link: '/hire/react-developer', icon: '⚡' },
      { role: 'Product UI/UX Designer', count: 1, avgRate: 70, link: '/hire/ui-ux-designer', icon: '🎨' },
    ],
    milestones: [
      { name: 'Phase 1: System Architecture & User Journey', duration: 'Weeks 1-2', deliverables: ['Database Schema & API Specs', 'Figma Interactive Mockup', 'Auth & Multi-Tenant Specs'] },
      { name: 'Phase 2: Core AI Engine & Backend APIs', duration: 'Weeks 3-4', deliverables: ['LLM Prompt Pipelines', 'Vector Embedding Index', 'FastAPI Microservice Deployment'] },
      { name: 'Phase 3: Frontend Dashboard & Subscription Billing', duration: 'Weeks 5-6', deliverables: ['Responsive Admin Dashboard', 'Stripe Tiered Subscription Portal', 'Usage Analytics'] },
      { name: 'Phase 4: Security Audit, Testing & Staging Launch', duration: 'Weeks 7-8', deliverables: ['Rate Limiting & OWASP Checks', 'Automated Pytest / Jest Coverage', 'Production CI/CD'] },
    ],
    growthAdvice: [
      'Build a tight MVP focused on solving one painful workflow extremely well before adding secondary features.',
      'Implement usage-based or tiered billing with annual discounts to maximize upfront cashflow.',
      'Deploy MegiLance escrow milestone releases to fund sprints strictly upon verified staging test passes.',
    ],
  },
  'mobile-app': {
    title: 'Cross-Platform Mobile App (iOS & Android)',
    category: 'Mobile Applications',
    recommendedStack: ['Flutter / React Native', 'Node.js / Express', 'Firebase / PostgreSQL', 'Apple Pay & Google Pay'],
    timelineWeeks: 7,
    budgetRange: { min: 4500, max: 9500 },
    teamNeeded: [
      { role: 'Mobile App Developer', count: 1, avgRate: 85, link: '/hire/mobile-developer', icon: '📱' },
      { role: 'Backend API Engineer', count: 1, avgRate: 75, link: '/hire/nodejs-developer', icon: '⚙️' },
      { role: 'Mobile UI/UX Designer', count: 1, avgRate: 65, link: '/hire/ui-ux-designer', icon: '✨' },
    ],
    milestones: [
      { name: 'Phase 1: Mobile Wireframes & Human Interface Guidelines', duration: 'Weeks 1-2', deliverables: ['iOS & Android Interactive Prototypes', 'Design System Components'] },
      { name: 'Phase 2: App Core Logic & API Integration', duration: 'Weeks 3-5', deliverables: ['State Management Architecture', 'Push Notifications Setup', 'Offline Sync & Cache'] },
      { name: 'Phase 3: App Store & Play Store Submissions', duration: 'Weeks 6-7', deliverables: ['App Store Review Compliance', 'TestFlight / Internal Testing Track', 'Live Store Release'] },
    ],
    growthAdvice: [
      'Design with native platform ergonomics (Apple HIG and Material Design 3) to boost App Store feature odds.',
      'Track Day-1, Day-7, and Day-30 retention rigorously to identify feature drop-offs early.',
    ],
  },
  'marketplace': {
    title: 'Two-Sided Peer-to-Peer Marketplace',
    category: 'Marketplace & Web3',
    recommendedStack: ['Next.js 16', 'FastAPI / Node.js', 'PostgreSQL', 'Stripe Connect (Escrow / Split Payments)'],
    timelineWeeks: 9,
    budgetRange: { min: 7500, max: 16000 },
    teamNeeded: [
      { role: 'Senior Full-Stack Architect', count: 1, avgRate: 90, link: '/hire/fullstack-developer', icon: '🏗️' },
      { role: 'Fintech & Payment Specialist', count: 1, avgRate: 95, link: '/hire/python-developer', icon: '💳' },
      { role: 'UI/UX Interaction Designer', count: 1, avgRate: 70, link: '/hire/ui-ux-designer', icon: '🎨' },
    ],
    milestones: [
      { name: 'Phase 1: Marketplace Dynamics & Escrow Logic', duration: 'Weeks 1-2', deliverables: ['Escrow Flow Documentation', 'Buyer/Seller Account Wireframes', 'Dispute Logic'] },
      { name: 'Phase 2: Search, Listings & Booking Engine', duration: 'Weeks 3-5', deliverables: ['Faceted Search & Filters', 'Listing Creation Flow', 'Real-Time Messaging'] },
      { name: 'Phase 3: Split Payments & Multi-Party Escrow', duration: 'Weeks 6-7', deliverables: ['Stripe Connect Onboarding', 'Automated Payout Schedules', 'Platform Commission Logic'] },
      { name: 'Phase 4: Launch & Beta User Onboarding', duration: 'Weeks 8-9', deliverables: ['End-to-End Transaction Testing', 'Security & KYC Verification', 'Go-to-Market Launch'] },
    ],
    growthAdvice: [
      'Solve the "chicken-or-egg" supply vs demand dilemma by manually onboarding high-quality supply first.',
      'Utilize MegiLance smart milestone escrows as a benchmark for user trust and dispute mediation.',
    ],
  },
};

export default function AiStartupAdvisorPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('saas');
  const [customIdea, setCustomIdea] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const blueprint = BUSINESS_TEMPLATES[selectedCategory] || BUSINESS_TEMPLATES['saas'];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': 'AI Startup Advisor & Digital Business Blueprint Generator',
        'url': 'https://megilance.site/tools/ai-startup-advisor',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0.00',
          'priceCurrency': 'USD',
        },
        'description': 'Input your business idea and get an instant AI project blueprint: recommended tech stack, timeline, budget estimate, and required expert team.',
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the MegiLance AI Startup Advisor?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The AI Startup Advisor analyzes your business concept, recommends the exact technology stack, estimates timelines and budgets, and matches you with verified talent to build and scale your digital venture.',
            },
          },
          {
            '@type': 'Question',
            'name': 'How does MegiLance help me execute my project plan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Once your blueprint is generated, you can post the project with pre-funded milestone escrow on MegiLance. We automatically match you with vetted developers, designers, and marketers with 0% platform commission.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://megilance.site' },
          { '@type': 'ListItem', 'position': 2, 'name': 'AI Tools', 'item': 'https://megilance.site/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'AI Startup Advisor', 'item': 'https://megilance.site/tools/ai-startup-advisor' },
        ],
      },
    ],
  };

  const handleSelect = (key: string) => {
    setIsGenerating(true);
    setSelectedCategory(key);
    setTimeout(() => setIsGenerating(false), 300);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Hero Heading */}
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 mb-4 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
              <Sparkles size={13} className="animate-spin text-indigo-500" />
              AI Business Consultant &amp; Execution OS
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              AI Startup Advisor &amp; Project Blueprint Generator
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-350 leading-relaxed">
              Transform your business idea into a comprehensive project execution plan: <strong>recommended tech stack, timeline, budget range, and required team composition</strong>.
            </p>
          </header>

          {/* Interactive Business Model Selector */}
          <div className="mb-10 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Select Your Business Model Archetype:
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'saas', name: 'AI & B2B SaaS', icon: '🤖' },
                { id: 'ecommerce', name: 'D2C E-Commerce', icon: '🛒' },
                { id: 'mobile-app', name: 'Mobile App (iOS/Android)', icon: '📱' },
                { id: 'marketplace', name: 'P2P Marketplace', icon: '🤝' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m.id)}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                    selectedCategory === m.id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-white ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <div className="font-bold text-sm">{m.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Generate Plan →</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generated Blueprint View */}
          <div className={`space-y-8 transition-opacity duration-300 ${isGenerating ? 'opacity-40' : 'opacity-100'}`}>
            {/* Header Summary Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
              <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 inline-block">
                    {blueprint.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">{blueprint.title}</h2>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    AI-calibrated blueprint incorporating industry benchmarks, modular stack architecture, and milestone escrow milestones.
                  </p>
                </div>
                <div className="md:col-span-5 grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm text-center">
                  <div>
                    <div className="text-xs text-indigo-300 font-semibold mb-0.5">Estimated Timeline</div>
                    <div className="text-2xl font-black text-white">{blueprint.timelineWeeks} Weeks</div>
                    <div className="text-[11px] text-indigo-300/80">4 Agile Sprints</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-300 font-semibold mb-0.5">Estimated Budget</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      ${blueprint.budgetRange.min.toLocaleString()}–${blueprint.budgetRange.max.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-300/80">0% MegiLance Commission</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid: Recommended Stack & Team Composition */}
            <div className="grid md:grid-cols-12 gap-8">
              {/* Recommended Stack */}
              <div className="md:col-span-5 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code className="text-indigo-500" size={20} />
                  Recommended Tech Stack
                </h3>
                <div className="space-y-2.5">
                  {blueprint.recommendedStack.map((tech) => (
                    <div key={tech} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Strategic AI Advice
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-400">
                    {blueprint.growthAdvice.map((advice, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Required Talent Team */}
              <div className="md:col-span-7 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="text-indigo-500" size={20} />
                  Required Expert Team ({blueprint.teamNeeded.length} Roles)
                </h3>
                <div className="space-y-3">
                  {blueprint.teamNeeded.map((member) => (
                    <div key={member.role} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{member.icon}</span>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{member.role}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Avg Rate: <strong>${member.avgRate}/hr</strong> • {member.count} Expert
                          </div>
                        </div>
                      </div>
                      <Link
                        href={member.link}
                        className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                      >
                        <span>View Talent</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>

                {/* 1-Click Launch Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-3">
                  <Link
                    href={`/create-project?title=${encodeURIComponent(blueprint.title)}&budget=${blueprint.budgetRange.max}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition shadow-md"
                  >
                    <Rocket size={16} />
                    <span>Post Project &amp; Match Talent</span>
                  </Link>
                  <Link
                    href="/tools/ai-project-cost-estimator"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-900 dark:text-white text-sm transition"
                  >
                    <span>Fine-Tune Rates</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 4-Stage Milestone Roadmap */}
            <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="text-indigo-500" size={20} />
                Sprint Milestone &amp; Escrow Roadmap
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {blueprint.milestones.map((m, idx) => (
                  <div key={m.name} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                        {m.duration}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">{m.name}</h4>
                      <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400">
                        {m.deliverables.map((deliv, i) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{deliv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs */}
          <section className="mt-12 bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-850">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Frequently Asked Questions About AI Business Planning
            </h2>
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  How does MegiLance convert blueprints into live products?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  Instead of just giving theoretical advice, MegiLance connects your blueprint directly to our verified freelancer talent pool. Sprints are bound to pre-funded milestone escrow contracts with 0% platform commission.
                </p>
              </div>
              <div className="pb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Can I customize the tech stack or add more roles?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  Yes! You can click "Post Project & Match Talent" to modify deliverables, set custom budget caps, or request specific specialized tools and frameworks.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
