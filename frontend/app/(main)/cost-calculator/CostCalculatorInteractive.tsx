"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FeeSavingsCalculator from '../../components/widgets/FeeSavingsCalculator';
import commonStyles from './CostCalculator.common.module.css';
import { jsonLdScriptProps, buildFAQJsonLd, buildWebApplicationJsonLd } from '../../../lib/seo';

const skillRates: Record<string, number> = {
  "React": 75, "Next.js": 80, "Node.js": 70, "Python": 65, "TypeScript": 75,
  "FastAPI": 70, "Django": 65, "Flutter": 85, "React Native": 80, "AWS Architect": 95,
  "Docker / DevOps": 85, "Kubernetes": 95, "Figma / UI UX": 60, "Machine Learning": 125,
  "Go Developer": 90, "Rust Developer": 105, "Technical Content Writer": 50, "SEO Specialist": 55,
};

const complexityMultiplier = { simple: 0.8, moderate: 1.0, complex: 1.5, "very complex": 2.0 };
const durationMultiplier = { "1-2 weeks": 0.9, "1 month": 1.0, "2-3 months": 1.1, "6+ months": 1.2 };

const faqs = [
  {
    question: "How accurate are these freelance project cost estimates?",
    answer: "Our project estimates are calculated using aggregated real-time market data across thousands of successful freelance software development, design, and AI contracts. Actual rates vary based on senior talent experience and specialized scope."
  },
  {
    question: "How much can I save on MegiLance compared to Upwork & Fiverr?",
    answer: "Because MegiLance operates with 0% platform commission fees, clients and freelancers save between 10% to 20% on every contract. For a $10,000 project, you save up to $2,000 in platform fees."
  },
  {
    question: "How do I turn this cost estimate into a live project post?",
    answer: "Click the 'Post Project with This Budget' button below! You can automatically pre-fill your required skill, estimated scope, and budget range into the project creation portal."
  }
];

export default function CostCalculatorInteractive() {
  const [skill, setSkill] = useState("React");
  const [complexity, setComplexity] = useState("moderate");
  const [duration, setDuration] = useState("1 month");
  const [hours, setHours] = useState(100);
  const [estimate, setEstimate] = useState({ min: 0, max: 0, avg: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const base = skillRates[skill] || 70;
    const cm = (complexityMultiplier as Record<string, number>)[complexity] || 1;
    const dm = (durationMultiplier as Record<string, number>)[duration] || 1;
    const low = Math.round(hours * base * cm * dm * 0.85);
    const high = Math.round(hours * base * cm * dm * 1.25);
    const avg = Math.round(hours * base * cm * dm);
    setEstimate({ min: low, max: high, avg });
  }, [skill, complexity, duration, hours]);

  const handleCopyEstimate = () => {
    const text = `📋 MegiLance Project Cost Estimate:
----------------------------------
Skill / Role: ${skill}
Complexity: ${complexity.toUpperCase()}
Estimated Duration: ${duration}
Estimated Hours: ${hours} hrs
----------------------------------
Low Estimate: $${estimate.min.toLocaleString()}
Average Market Cost: $${estimate.avg.toLocaleString()}
High Estimate: $${estimate.max.toLocaleString()}

MegiLance 0% Platform Fee Savings: Up to $${Math.round(estimate.avg * 0.2).toLocaleString()} saved vs Upwork/Fiverr!
Estimate generated on https://megilance.site/cost-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toolSchema = buildWebApplicationJsonLd({
    name: "Freelance Project Cost Calculator",
    description: "Estimate software development, design, and AI freelance project costs instantly using real market rates.",
    path: "/cost-calculator",
    category: "BusinessApplication",
  });
  const faqSchema = buildFAQJsonLd(faqs);

  return (
    <>
      <script {...jsonLdScriptProps(toolSchema)} />
      <script {...jsonLdScriptProps(faqSchema)} />

      <main className={commonStyles.container}>
        <header className={commonStyles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Image
              src="/images/sections/ai-price-estimator.png"
              alt="MegiLance AI Pricing Engine — get accurate project cost estimates with market rate data"
              width={420}
              height={380}
              priority
              sizes="(max-width: 640px) 280px, 420px"
              style={{ width: '100%', maxWidth: '420px', height: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h1 className={commonStyles.title}>Freelance Project Cost Calculator</h1>
          <p className={commonStyles.subtitle}>
            Estimate your project cost instantly using real market rates and compare 0% platform fee savings.
          </p>
        </header>

        <section className={commonStyles.calculator}>
          <div className={commonStyles.field}>
            <label htmlFor="skillSelect">Skill / Technology Domain</label>
            <select id="skillSelect" value={skill} onChange={(e) => setSkill(e.target.value)}>
              {Object.keys(skillRates).map((s) => (
                <option key={s} value={s}>{s} — ${skillRates[s]}/hr avg</option>
              ))}
            </select>
          </div>

          <div className={commonStyles.field}>
            <label htmlFor="complexitySelect">Project Complexity Level</label>
            <select id="complexitySelect" value={complexity} onChange={(e) => setComplexity(e.target.value)}>
              <option value="simple">Simple (Standard features, minimal integrations)</option>
              <option value="moderate">Moderate (Custom features, standard APIs)</option>
              <option value="complex">Complex (Advanced architecture, high performance)</option>
              <option value="very complex">Very Complex (Enterprise scale, AI/ML models)</option>
            </select>
          </div>

          <div className={commonStyles.field}>
            <label htmlFor="durationSelect">Estimated Duration</label>
            <select id="durationSelect" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="2-3 months">2-3 months</option>
              <option value="6+ months">6+ months</option>
            </select>
          </div>

          <div className={commonStyles.field}>
            <label htmlFor="hoursRange">Estimated Project Hours: <strong>{hours} hrs</strong></label>
            <input
              id="hoursRange"
              type="range"
              min={10}
              max={1000}
              step={10}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </div>

          <div className={commonStyles.result}>
            <div className={commonStyles.resultItem}>
              <span className={commonStyles.resultLabel}>Low Estimate</span>
              <span className={commonStyles.resultValue}>${estimate.min.toLocaleString()}</span>
            </div>
            <div className={commonStyles.resultItem}>
              <span className={commonStyles.resultLabel}>Average Market Cost</span>
              <span className={commonStyles.resultValuePrimary}>${estimate.avg.toLocaleString()}</span>
            </div>
            <div className={commonStyles.resultItem}>
              <span className={commonStyles.resultLabel}>High Estimate</span>
              <span className={commonStyles.resultValue}>${estimate.max.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Link
              href={`/(portal)/create-project?skill=${encodeURIComponent(skill)}&budget=${estimate.avg}`}
              style={{
                padding: '0.85rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '0.75rem',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              🚀 Post Project with This Estimate
            </Link>
            <button
              onClick={handleCopyEstimate}
              type="button"
              style={{
                padding: '0.85rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy Estimate Breakdown'}
            </button>
          </div>

          <p className={commonStyles.disclaimer}>
            Estimates are based on MegiLance marketplace averages. Actual rates vary by freelancer experience and location.
          </p>
        </section>

        {/* Embedded Fee Savings Visualizer */}
        <FeeSavingsCalculator
          initialBudget={estimate.avg}
          title="See How Much You Save on MegiLance"
          subtitle={`For an estimated $${estimate.avg.toLocaleString()} project, see your net savings with MegiLance's 0% platform fee.`}
        />

        {/* FAQ Section for AEO & Google Snippets */}
        <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.5rem' }}>{faq.question}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.85 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
