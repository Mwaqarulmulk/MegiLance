import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Free Freelancer Tools | Cost Calculator, Rate Estimator & AI Tools — MegiLance',
  description: 'Free AI-powered freelancer tools by MegiLance: project cost calculator, rate estimator, proposal templates, invoice generator, portfolio analyzer, and skill gap analysis. Boost your earnings.',
  path: '/tools',
  keywords: getKeywordsForPage(['features', 'longTail'], [
    'free freelancer tools', 'online freelance tools', 'freelance rate calculator',
    'freelance proposal generator', 'invoice maker for freelancers',
    'portfolio analyzer tool', 'skill gap analyzer freelance',
    'AI tools for freelancers', 'productivity tools for remote workers',
  ]),
});

import React from 'react';
import Link from 'next/link';
import { 
  Calculator, TrendingUp, FileText, BarChart3, Brain, Layers, 
  DollarSign, Shield, Search, MessageSquare, ArrowRight, Sparkles,
  Zap, Clock, Users, Globe, CheckCircle2, Star
} from 'lucide-react';
import commonStyles from './Tools.common.module.css';

const aiTools = [
  {
    title: "AI Price Estimator",
    description: "Get AI-powered price estimates for any project based on real market data across 10 industries and 100+ service types.",
    href: "/ai/price-estimator",
    icon: DollarSign,
    tag: "Popular",
    tagColor: "#22c55e",
    tagBg: "#f0fdf4",
  },
  {
    title: "AI Proposal Writer",
    description: "Generate winning proposals with market-data pricing, skill matching, and a quality score to maximize your win rate.",
    href: "/ai/proposal-writer",
    icon: FileText,
    tag: "AI-Powered",
    tagColor: "#8b5cf6",
    tagBg: "#f5f3ff",
  },
  {
    title: "AI Rate Advisor",
    description: "Get data-backed hourly rate recommendations with income projections and platform comparisons for your niche.",
    href: "/ai/rate-advisor",
    icon: TrendingUp,
    tag: "AI-Powered",
    tagColor: "#3b82f6",
    tagBg: "#eff6ff",
  },
  {
    title: "AI Skill Analyzer",
    description: "Assess your skills against market demand, discover high-ROI skill gaps, and get a personalized growth roadmap.",
    href: "/ai/skill-analyzer",
    icon: Brain,
    tag: "New",
    tagColor: "#f97316",
    tagBg: "#fff7ed",
  },
  {
    title: "AI Scope Planner",
    description: "Plan project scope, milestones, timeline, and budget with AI-powered breakdown and risk assessment.",
    href: "/ai/scope-planner",
    icon: Layers,
    tag: null,
    tagColor: "",
    tagBg: "",
  },
  {
    title: "Income Calculator",
    description: "Project your freelance income, taxes, savings, and financial health with country-specific calculations.",
    href: "/ai/income-calculator",
    icon: BarChart3,
    tag: null,
    tagColor: "",
    tagBg: "",
  },
  {
    title: "Expense & Tax Calculator",
    description: "Plan self-employment taxes, quarterly estimates, and business deductions with country-specific rules.",
    href: "/ai/expense-calculator",
    icon: Calculator,
    tag: null,
    tagColor: "",
    tagBg: "",
  },
  {
    title: "Invoice Generator",
    description: "Create professional invoices with line items, tax calculations, and multiple currency support.",
    href: "/ai/invoice-generator",
    icon: FileText,
    tag: null,
    tagColor: "",
    tagBg: "",
  },
  {
    title: "Contract Builder",
    description: "Generate legally-sound freelance contracts with customizable clauses, IP terms, and jurisdiction support.",
    href: "/tools/contract-builder",
    icon: Shield,
    tag: null,
    tagColor: "",
    tagBg: "",
  },
  {
    title: "Fraud Check",
    description: "Analyze project descriptions and messages for scam patterns, suspicious payment terms, and red flags.",
    href: "/ai/fraud-check",
    icon: Search,
    tag: "Security",
    tagColor: "#ef4444",
    tagBg: "#fef2f2",
  },
  {
    title: "AI Chatbot",
    description: "Get instant answers about freelancing, pricing, and finding talent. 24/7 intelligent support powered by AI.",
    href: "/ai/chatbot",
    icon: MessageSquare,
    tag: "Free",
    tagColor: "#22c55e",
    tagBg: "#f0fdf4",
  },
];

const platformTools = [
  {
    title: "Cost Calculator",
    description: "Estimate project costs based on skill, complexity, and duration with real market rate data.",
    href: "/cost-calculator",
    icon: Calculator,
  },
  {
    title: "Find Talent",
    description: "Get AI-matched with the best freelancers in minutes.",
    href: "/client/find-talent",
    icon: FileText,
  },
  {
    title: "Browse Projects",
    description: "Browse available projects matching your skills.",
    href: "/freelancer/projects",
    icon: Users,
  },
];

export default function ToolsPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero Header */}
      <header style={{ textAlign: 'center', padding: '4rem 2rem 3rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(168,85,247,0.2)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#c4b5fd' }}>
          <Sparkles size={14} />
          <span>11 Free AI Tools</span>
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>Freelancer Tools</h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
          Invoice generators, proposal templates, rate estimators, and more — all powered by AI. 100% free.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/ai" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
            Explore All AI Tools <ArrowRight size={16} />
          </Link>
          <Link href="/cost-calculator" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
            Cost Calculator
          </Link>
        </div>
      </header>

      {/* Stats Banner */}
      <section style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            <Zap size={16} style={{ color: '#4573df' }} />
            <span><strong style={{ color: '#0f172a' }}>11</strong> Free AI Tools</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
            <span><strong style={{ color: '#0f172a' }}>No</strong> Sign-up Required</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            <Globe size={16} style={{ color: '#8b5cf6' }} />
            <span><strong style={{ color: '#0f172a' }}>70+</strong> Countries</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            <Clock size={16} style={{ color: '#f97316' }} />
            <span><strong style={{ color: '#0f172a' }}>Instant</strong> Results</span>
          </div>
        </div>
      </section>

      {/* AI Tools Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>AI-Powered Tools</h2>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>100% free, instant results, no account needed.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem',
                  borderRadius: '16px', border: '1.5px solid #e2e8f0', textDecoration: 'none', color: 'inherit',
                  transition: 'all 0.25s ease', background: 'white',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} style={{ color: '#4573df' }} />
                  </div>
                  {tool.tag && (
                    <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: tool.tagBg, color: tool.tagColor }}>
                      {tool.tag}
                    </span>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#0f172a' }}>{tool.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#4573df', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    Try Now <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Platform Tools */}
      <section style={{ padding: '3rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>Platform Tools</h2>
            <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>Essential freelancing tools built into MegiLance.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {platformTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                    borderRadius: '14px', border: '1.5px solid #e2e8f0', textDecoration: 'none', color: 'inherit',
                    transition: 'all 0.2s', background: 'white',
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 650, margin: '0 0 0.2rem', color: '#0f172a' }}>{tool.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>{tool.description}</p>
                  </div>
                  <ArrowRight size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#0f172a' }}>Ready to start freelancing?</h2>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 1.5rem', maxWidth: '500px', marginInline: 'auto' }}>
          Join thousands of freelancers using MegiLance to find work, manage projects, and get paid.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
            Get Started Free <ArrowRight size={16} />
          </Link>
          <Link href="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none', fontWeight: 600 }}>
            Explore Platform
          </Link>
        </div>
      </section>
    </main>
  );
}
