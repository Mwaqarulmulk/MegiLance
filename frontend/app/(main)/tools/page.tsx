import React from 'react';
import Link from 'next/link';
import commonStyles from './Tools.common.module.css';

const tools = [
  {
    title: "Cost Calculator",
    description: "Estimate project costs based on skill, complexity, and duration with real market rate data.",
    href: "/cost-calculator",
    tag: "Popular",
  },
  {
    title: "Skill Analyzer",
    description: "Identify skill gaps and get personalized learning path recommendations based on market demand.",
    href: "/dashboard/freelancer/skills",
    tag: "AI-Powered",
  },
  {
    title: "Portfolio Analyzer",
    description: "Get your portfolio scored against market benchmarks with actionable improvement suggestions.",
    href: "/dashboard/freelancer/portfolio",
    tag: "New",
  },
  {
    title: "Rate Estimator",
    description: "AI-powered hourly rate recommendation based on your skills, experience, and market data.",
    href: "/dashboard/freelancer/rates",
    tag: "AI-Powered",
  },
  {
    title: "Invoice Generator",
    description: "Create professional invoices for completed milestones with automatic calculations.",
    href: "/dashboard/freelancer/invoices",
    tag: null,
  },
  {
    title: "Proposal Templates",
    description: "Browse and customize winning proposal templates for different project types.",
    href: "/dashboard/freelancer/proposals",
    tag: null,
  },
];

export default function ToolsPage() {
  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header}>
        <h1 className={commonStyles.title}>Freelancer Tools</h1>
        <p className={commonStyles.subtitle}>
          Invoice generators, proposal templates, rate estimators, and more — all powered by AI.
        </p>
      </header>

      <section className={commonStyles.grid}>
        {tools.map((tool) => (
          <Link key={tool.title} href={tool.href} className={commonStyles.card}>
            {tool.tag && <span className={commonStyles.tag}>{tool.tag}</span>}
            <h3 className={commonStyles.cardTitle}>{tool.title}</h3>
            <p className={commonStyles.cardDesc}>{tool.description}</p>
          </Link>
        ))}
      </section>

      <section className={commonStyles.cta}>
        <h2>Need a custom tool?</h2>
        <p>Request a feature or build your own integrations via our API.</p>
        <Link href="/contact" className={commonStyles.button}>Contact Us</Link>
      </section>
    </main>
  );
}
