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
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "AI Proposal Writer",
    description: "Generate winning proposals with market-data pricing, skill matching, and a quality score to maximize your win rate.",
    href: "/ai/proposal-writer",
    icon: FileText,
    tag: "AI-Powered",
    tagColor: "#a855f7",
    tagBg: "rgba(168, 85, 247, 0.15)",
  },
  {
    title: "AI Rate Advisor",
    description: "Get data-backed hourly rate recommendations with income projections and platform comparisons for your niche.",
    href: "/ai/rate-advisor",
    icon: TrendingUp,
    tag: "AI-Powered",
    tagColor: "#3b82f6",
    tagBg: "rgba(59, 130, 246, 0.15)",
  },
  {
    title: "AI Skill Analyzer",
    description: "Assess your skills against market demand, discover high-ROI skill gaps, and get a personalized growth roadmap.",
    href: "/ai/skill-analyzer",
    icon: Brain,
    tag: "New",
    tagColor: "#f97316",
    tagBg: "rgba(249, 115, 22, 0.15)",
  },
  {
    title: "AI Project Scope Planner",
    description: "Generate comprehensive project scope documents, milestones, deliverables, and timelines in seconds.",
    href: "/tools/project-scope-generator",
    icon: Layers,
    tag: "AI-Powered",
    tagColor: "#a855f7",
    tagBg: "rgba(168, 85, 247, 0.15)",
  },
  {
    title: "AI Freelance Risk Checker",
    description: "Analyze project descriptions for red flags, unrealistic budgets, Scope Creep risk, and client reputation scores.",
    href: "/tools/freelance-risk-checker",
    icon: Shield,
    tag: "Free",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "AI Milestone Generator",
    description: "Break down complex projects into structured, paid milestone schedules with suggested payment terms.",
    href: "/tools/milestone-generator",
    icon: Zap,
    tag: "Popular",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "AI Proposal Reviewer",
    description: "Paste your draft proposal and get an instant AI review with actionable tips to increase client response rates.",
    href: "/tools/proposal-reviewer",
    icon: Search,
    tag: "Free",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "Freelance Invoice Generator",
    description: "Create professional PDF invoices with multi-currency support, payment links, and instant download. No account required.",
    href: "/tools/freelance-invoice-template",
    icon: FileText,
    tag: "Free",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "Contract Template Builder",
    description: "Generate legally sound freelance contract templates with IP assignment, NDA clauses, and milestone terms.",
    href: "/tools/contract-builder",
    icon: Shield,
    tag: "Popular",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "AI Chatbot Assistant",
    description: "24/7 AI-powered assistance for freelancing advice, pricing strategy, client communication tips, and platform help.",
    href: "/ai/chatbot",
    icon: MessageSquare,
    tag: "Free",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
];

export default function ToolsPage() {
  return (
    <main className={commonStyles.main}>
      {/* Hero Header */}
      <header className={commonStyles.hero}>
        <div className={commonStyles.heroBadge}>
          <Sparkles size={14} />
          <span>11 Free AI Tools</span>
        </div>
        <h1 className={commonStyles.title}>Freelancer Tools</h1>
        <p className={commonStyles.subtitle}>
          Invoice generators, proposal templates, rate estimators, and more — all powered by AI. 100% free.
        </p>
        <div className={commonStyles.heroCtas}>
          <Link href="/ai" className={commonStyles.btnPrimary}>
            Explore All AI Tools <ArrowRight size={16} />
          </Link>
          <Link href="/cost-calculator" className={commonStyles.btnSecondary}>
            Cost Calculator
          </Link>
        </div>
      </header>

      {/* Stats Banner */}
      <section className={commonStyles.statsBanner}>
        <div className={commonStyles.statsRow}>
          <div className={commonStyles.statItem}>
            <Zap size={16} style={{ color: '#4573df' }} />
            <span><strong>11</strong> Free AI Tools</span>
          </div>
          <div className={commonStyles.statItem}>
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
            <span><strong>No</strong> Sign-up Required</span>
          </div>
          <div className={commonStyles.statItem}>
            <Globe size={16} style={{ color: '#8b5cf6' }} />
            <span><strong>70+</strong> Countries</span>
          </div>
          <div className={commonStyles.statItem}>
            <Clock size={16} style={{ color: '#f97316' }} />
            <span><strong>Instant</strong> Results</span>
          </div>
        </div>
      </section>

      {/* AI Tools Grid */}
      <section className={commonStyles.gridSection}>
        <div className={commonStyles.sectionHeader}>
          <h2 className={commonStyles.sectionTitle}>AI-Powered Tools</h2>
          <p className={commonStyles.sectionDesc}>100% free, instant results, no account needed.</p>
        </div>

        <div className={commonStyles.grid}>
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className={commonStyles.card}
              >
                <div className={commonStyles.cardHeader}>
                  <div className={commonStyles.iconBox}>
                    <Icon size={22} />
                  </div>
                  {tool.tag && (
                    <span className={commonStyles.tagPill} style={{ background: tool.tagBg, color: tool.tagColor }}>
                      {tool.tag}
                    </span>
                  )}
                </div>
                <h3 className={commonStyles.cardTitle}>{tool.title}</h3>
                <p className={commonStyles.cardDesc}>{tool.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
