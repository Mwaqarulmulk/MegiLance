import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { 
  Calculator, TrendingUp, FileText, BarChart3, Brain, Layers, 
  DollarSign, Shield, Search, MessageSquare, ArrowRight, Sparkles,
  Zap, Clock, Users, Globe, CheckCircle2, Star, Percent, Scale, Rocket
} from 'lucide-react';
import { 
  buildMeta, 
  getKeywordsForPage, 
  buildBreadcrumbsJsonLd, 
  jsonLdScriptProps, 
  BASE_URL 
} from '../../../lib/seo';
import commonStyles from './Tools.common.module.css';

export const metadata: Metadata = buildMeta({
  title: '14 Free Freelance AI Tools | Fee Calculators, Rate Estimators & Contract Builders',
  description: 'Free AI-powered freelance tools by MegiLance: Upwork & Fiverr fee calculators, AI project cost estimator, rate advisor, proposal writer, contract builder, and invoice generator. 100% free with no signup.',
  path: '/tools',
  keywords: getKeywordsForPage(['features', 'longTail', 'transactional'], [
    'free freelancer tools', 'upwork fee calculator', 'fiverr fee calculator',
    'online freelance tools', 'freelance rate calculator',
    'freelance proposal generator', 'invoice maker for freelancers',
    'freelance contract builder', 'portfolio analyzer tool', 'skill gap analyzer freelance',
    'AI tools for freelancers', 'productivity tools for remote workers',
  ]),
});

const aiTools = [
  {
    title: "Website Cost Calculator",
    description: "Calculate how much it costs to build a website in 2026 for landing pages, WordPress, Shopify, and custom web apps.",
    href: "/tools/website-cost-calculator",
    icon: Globe,
    tag: "High Volume",
    tagColor: "#10b981",
    tagBg: "rgba(16, 185, 129, 0.15)",
  },
  {
    title: "AI Startup Advisor & Blueprint",
    description: "Turn business ideas into project execution plans: recommended tech stack, timeline, budget, and required team.",
    href: "/tools/ai-startup-advisor",
    icon: Rocket,
    tag: "Flagship",
    tagColor: "#6366f1",
    tagBg: "rgba(99, 102, 241, 0.15)",
  },
  {
    title: "Upwork Fee Calculator",
    description: "Calculate Upwork's 10% freelancer fee, 5% client surcharge, and connects costs vs MegiLance 0% commission savings.",
    href: "/tools/upwork-fee-calculator",
    icon: Percent,
    tag: "High Savings",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "Fiverr Fee Calculator",
    description: "Calculate Fiverr's 20% seller commission, tips cut, and buyer fees. See how much you save on MegiLance.",
    href: "/tools/fiverr-fee-calculator",
    icon: DollarSign,
    tag: "High Savings",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "AI Price Estimator",
    description: "Get AI-powered price estimates for software, mobile, AI, and design builds based on real market rates across 10 industries.",
    href: "/tools/ai-project-cost-estimator",
    icon: Calculator,
    tag: "Popular",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "AI Rate Advisor",
    description: "Discover your optimal hourly rates based on living expenses, tax obligations, and global market rate percentiles.",
    href: "/tools/freelance-rate-calculator",
    icon: TrendingUp,
    tag: "AI-Powered",
    tagColor: "#3b82f6",
    tagBg: "rgba(59, 130, 246, 0.15)",
  },
  {
    title: "Contract Template Builder",
    description: "Generate legally sound freelance service contracts, NDAs, and milestone agreements with IP transfer clauses.",
    href: "/tools/contract-builder",
    icon: Shield,
    tag: "Legal Suite",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "Freelance Invoice Generator",
    description: "Create professional PDF invoices with multi-currency support, payment links, VAT calculation, and instant download.",
    href: "/tools/freelance-invoice-template",
    icon: FileText,
    tag: "Free",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "Business Contract Templates",
    description: "Download standard independent contractor agreements, software development SOWs, and mutual NDAs.",
    href: "/tools/business-contract-template",
    icon: Scale,
    tag: "Templates",
    tagColor: "#3b82f6",
    tagBg: "rgba(59, 130, 246, 0.15)",
  },
  {
    title: "AI Project Scope Planner",
    description: "Generate comprehensive 4-stage Work Breakdown Structures (WBS), milestone timelines, and risk mitigation plans.",
    href: "/tools/project-scope-generator",
    icon: Layers,
    tag: "AI-Powered",
    tagColor: "#a855f7",
    tagBg: "rgba(168, 85, 247, 0.15)",
  },
  {
    title: "AI Proposal Writer",
    description: "Draft tailored, 3-pillar high-converting bids in under 5 seconds with market pricing and skill alignment.",
    href: "/tools/proposal-creator",
    icon: FileText,
    tag: "AI-Powered",
    tagColor: "#a855f7",
    tagBg: "rgba(168, 85, 247, 0.15)",
  },
  {
    title: "AI Proposal Reviewer",
    description: "Paste your draft proposal and get an instant AI audit for tone, competitiveness, and client alignment.",
    href: "/tools/proposal-reviewer",
    icon: Search,
    tag: "Free",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "AI Freelance Risk Checker",
    description: "Inspect job briefs for red flags, unrealistic budgets, off-platform payment traps, and client reputation risks.",
    href: "/tools/freelance-risk-checker",
    icon: Shield,
    tag: "Security",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "Freelancer Match Score",
    description: "Evaluate applicant and project compatibility using our 7-factor talent matching engine.",
    href: "/tools/freelancer-match-score",
    icon: Brain,
    tag: "Matching",
    tagColor: "#f97316",
    tagBg: "rgba(249, 115, 22, 0.15)",
  },
  {
    title: "AI Milestone Generator",
    description: "Break down complex projects into structured, paid milestone schedules with suggested payment escrow terms.",
    href: "/tools/milestone-generator",
    icon: Zap,
    tag: "Escrow Sprints",
    tagColor: "#22c55e",
    tagBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "AI Skill Analyzer",
    description: "Assess your technical skills against global market demand, discover high-ROI skill gaps, and get a growth roadmap.",
    href: "/ai/skill-analyzer",
    icon: Brain,
    tag: "Skill Gap",
    tagColor: "#f97316",
    tagBg: "rgba(249, 115, 22, 0.15)",
  },
];

export default function ToolsPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Free Freelancer Tools & AI Productivity Suite',
      description: 'Directory of 14 free AI-powered freelance tools including Upwork and Fiverr fee calculators, contract builders, invoice makers, and price estimators.',
      url: `${BASE_URL}/tools`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: aiTools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tool.title,
          description: tool.description,
          url: `${BASE_URL}${tool.href}`,
        })),
      },
    },
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'AI Tools', path: '/tools' },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={commonStyles.main}>
        {/* Hero Header */}
        <header className={commonStyles.hero}>
          <div className={commonStyles.heroBadge}>
            <Sparkles size={14} />
            <span>16 Free AI Tools</span>
          </div>
          <h1 className={commonStyles.title}>Free Freelancer &amp; Client AI Tools</h1>
          <p className={commonStyles.subtitle}>
            Website cost calculators, startup advisors, fee calculators, contract builders, proposal writers, and invoice generators — 100% free with zero signup friction.
          </p>
          <div className={commonStyles.heroCtas}>
            <Link href="/tools/website-cost-calculator" className={commonStyles.btnPrimary}>
              <span>Website Cost Calculator</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/tools/ai-startup-advisor" className={commonStyles.btnSecondary}>
              <span>AI Startup Advisor</span>
            </Link>
          </div>
        </header>

        {/* Stats Banner */}
        <section className={commonStyles.statsBanner}>
          <div className={commonStyles.statsRow}>
            <div className={commonStyles.statItem}>
              <Zap size={16} style={{ color: '#4573df' }} />
              <span><strong>16</strong> Free AI Tools</span>
            </div>
            <div className={commonStyles.statItem}>
              <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
              <span><strong>No</strong> Sign-up Required</span>
            </div>
            <div className={commonStyles.statItem}>
              <Globe size={16} style={{ color: '#8b5cf6' }} />
              <span><strong>0%</strong> Commission Fee</span>
            </div>
            <div className={commonStyles.statItem}>
              <Clock size={16} style={{ color: '#f97316' }} />
              <span><strong>Instant</strong> In-Browser Results</span>
            </div>
          </div>
        </section>

        {/* AI Tools Grid */}
        <section className={commonStyles.gridSection}>
          <div className={commonStyles.sectionHeader}>
            <h2 className={commonStyles.sectionTitle}>All Free Freelance Tools</h2>
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
    </>
  );
}
