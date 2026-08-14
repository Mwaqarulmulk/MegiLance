'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Brain, 
  Shield, 
  FileText, 
  ArrowRight,
  Database,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import commonStyles from './MethodologyClient.common.module.css';
import lightStyles from './MethodologyClient.light.module.css';
import darkStyles from './MethodologyClient.dark.module.css';

const toolsMethodology = [
  {
    id: 'price-estimator',
    name: 'AI Price Estimator',
    icon: DollarSign,
    tagline: 'Market-grounded project cost and milestone timeline forecasting',
    inputs: [
      'Project service category & specific deliverable type (100+ services)',
      'Estimated project scope size (Minimal, Small, Medium, Large, Enterprise)',
      'Deliverable complexity & feature checklist',
      'Target experience tier (Junior, Mid, Senior, Expert)',
      'Urgency & delivery turnaround requirements',
      'Client and Freelancer geographical regions / countries (PPP adjusted)',
    ],
    dataSources: [
      'Global freelance market compensation benchmarks across 10 disciplines',
      'World Bank Purchasing Power Parity (PPP) index data for 70+ countries',
      'Historical project duration averages by technical stack complexity',
    ],
    updateFrequency: 'Quarterly market index reviews and continuous parameter calibration',
    output: 'Low, high, and expected total project cost (USD), recommended hourly rate range, estimated total hours, phase-by-phase milestone budget breakdown, and confidence score.',
    assumptions: [
      'Assumes standard scope stability without unmanaged mid-project scope changes',
      'Assumes professional freelance execution and prompt client feedback cycles',
    ],
    limitations: 'Generates decision-support benchmark ranges. Specialized domain requirements (e.g. niche medical AI compliance) may command higher rates than global category averages.',
    toolHref: '/ai/price-estimator',
  },
  {
    id: 'rate-advisor',
    name: 'Freelance Rate Advisor',
    icon: TrendingUp,
    tagline: 'Sustainable hourly and project rate calculation for independent talent',
    inputs: [
      'Primary skill specialty and professional experience level',
      'Target monthly or annual net personal income (USD)',
      'Weekly billable hours capacity (typically 20–30 hours/week)',
      'Annual non-billable overhead & software subscription costs',
      'Freelancer country of tax residence',
    ],
    dataSources: [
      'International developer & creative contractor rate surveys',
      'Estimated regional self-employment and corporate tax baseline brackets',
      'Cost of Living Indices (Numbeo & World Bank)',
    ],
    updateFrequency: 'Bi-annual economic and tax assumption calibration',
    output: 'Minimum floor rate, target sustainable hourly rate, premium project rate, and monthly income trajectory projections.',
    assumptions: [
      'Assumes a 65–75% billable utilization ratio (accounting for marketing, admin, and learning)',
      'Calculates rates to support sustainable living standards and retirement savings',
    ],
    limitations: 'Actual negotiated rates depend on individual portfolio strength, client urgency, and specialized industry positioning.',
    toolHref: '/ai/rate-advisor',
  },
  {
    id: 'smart-matching',
    name: '7-Factor Skill & Talent Matcher',
    icon: Zap,
    tagline: 'Algorithmic alignment between client project briefs and verified freelancer profiles',
    inputs: [
      'Client project brief, required technologies, and deliverables',
      'Target budget and delivery timeline',
      'Freelancer indexed skills, verified portfolio items, and completed milestone reviews',
      'Freelancer current workload availability and timezone compatibility',
    ],
    dataSources: [
      'Semantic embeddings of project requirements and freelancer skill taxonomies',
      'Platform workroom communication responsiveness metrics',
      'Verified contract completion and milestone ratings',
    ],
    updateFrequency: 'Real-time computation per search query and project posting',
    output: 'Match compatibility score (0–100%) broken down by Skill Alignment (30%), Experience Match (15%), Budget Compatibility (15%), Responsiveness (10%), Success Track Record (10%), Timezone Match (10%), and Current Availability (10%).',
    assumptions: [
      'Freelancer profiles and portfolio repositories reflect authentic past work',
    ],
    limitations: 'Match scores serve as recommendations to guide client discovery; clients should review full workroom proposals and interview candidates directly.',
    toolHref: '/talent',
  },
  {
    id: 'skill-analyzer',
    name: 'Skill Analyzer & Market Demand Engine',
    icon: Brain,
    tagline: 'Market competitiveness evaluation and high-ROI upskilling roadmap',
    inputs: [
      'Current technical stack, programming languages, design software, or marketing tools',
      'Years of professional experience per skill',
      'Target freelance career direction (e.g. AI Integration, Full-Stack, Cloud Architecture)',
    ],
    dataSources: [
      'Aggregate freelance project posting demand trends across tech and creative sectors',
      'Cross-skill adjacency and compensation correlation models',
    ],
    updateFrequency: 'Monthly demand trend updates',
    output: 'Skill portfolio score, market demand percentile, high-value complementary skill recommendations, and potential earning impact.',
    assumptions: [
      'Market demand trends reflect active contract volume and client budget patterns',
    ],
    limitations: 'Does not replace hands-on project experience or comprehensive technical certification.',
    toolHref: '/ai/skill-analyzer',
  },
  {
    id: 'fraud-check',
    name: 'Fraud & Risk Checker',
    icon: Shield,
    tagline: 'NLP scam heuristic detection for project posts and client communications',
    inputs: [
      'Job description text, client message transcripts, or proposal submission requests',
      'Proposed payment mechanisms or third-party contact solicitations',
    ],
    dataSources: [
      'Heuristic patterns of established freelance fraud (e.g. fake check scams, requests for free test tasks, off-platform payment steering, deposit requests)',
    ],
    updateFrequency: 'Continuous heuristic rule refinement',
    output: 'Risk level indicator (Low, Medium, High), identified warning flags, specific suspicious phrases, and recommended defensive actions.',
    assumptions: [
      'Analysis is performed strictly on provided text patterns',
    ],
    limitations: 'Cannot guarantee absolute prevention of sophisticated fraud. Always conduct payments strictly through MegiLance milestone escrow.',
    toolHref: '/ai/fraud-check',
  },
  {
    id: 'proposal-writer',
    name: 'AI Proposal Writer',
    icon: FileText,
    tagline: 'Structured, persuasive proposal drafting grounded in client requirements',
    inputs: [
      'Project title, client requirements, and job description',
      'Freelancer relevant technical skills, portfolio highlights, and proposed approach',
      'Suggested project duration and milestone pricing structure',
    ],
    dataSources: [
      'Best-practice freelance proposal frameworks emphasizing client problem diagnosis, clear milestones, and tangible value delivery',
    ],
    updateFrequency: 'Continuous prompt engineering and template optimization',
    output: 'Customized cover letter, deliverable schedule, milestone roadmap, risk mitigation questions, and call-to-action closing.',
    assumptions: [
      'Freelancer possesses the competencies described in the generated proposal draft',
    ],
    limitations: 'Proposals should always be reviewed, personalized, and verified by the freelancer before final client submission.',
    toolHref: '/ai/proposal-writer',
  },
];

export default function MethodologyClient() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <header className={commonStyles.header}>
        <span className={cn(commonStyles.badge, themeStyles.badge)}>
          <Database size={14} className="inline mr-1 text-blue-500" />
          Transparent AI Documentation
        </span>
        <h1 className={cn(commonStyles.title, themeStyles.title)}>AI Methodology &amp; Feature Mechanics</h1>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          We believe in transparent algorithms. Here is exact documentation of the inputs, data sources, update cadence, calculation models, and known limitations for every MegiLance AI tool.
        </p>
      </header>

      {/* Methodology Cards */}
      <div className={commonStyles.toolsList}>
        {toolsMethodology.map((tool) => {
          const Icon = tool.icon;
          return (
            <article key={tool.id} id={tool.id} className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
              <div className={commonStyles.toolHeader}>
                <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
                  <Icon size={26} />
                </div>
                <div>
                  <h2 className={cn(commonStyles.toolName, themeStyles.toolName)}>{tool.name}</h2>
                  <p className={cn(commonStyles.toolTagline, themeStyles.toolTagline)}>{tool.tagline}</p>
                </div>
              </div>

              <div className={commonStyles.detailsGrid}>
                <div className={commonStyles.detailBlock}>
                  <h3 className={commonStyles.blockHeading}>
                    <Info size={16} className="text-blue-500" /> Inputs Considered
                  </h3>
                  <ul className={commonStyles.bulletList}>
                    {tool.inputs.map((inp, i) => (
                      <li key={i}>{inp}</li>
                    ))}
                  </ul>
                </div>

                <div className={commonStyles.detailBlock}>
                  <h3 className={commonStyles.blockHeading}>
                    <Database size={16} className="text-purple-500" /> Data Sources &amp; Indices
                  </h3>
                  <ul className={commonStyles.bulletList}>
                    {tool.dataSources.map((ds, i) => (
                      <li key={i}>{ds}</li>
                    ))}
                  </ul>
                </div>

                <div className={commonStyles.detailBlock}>
                  <h3 className={commonStyles.blockHeading}>
                    <RefreshCw size={16} className="text-emerald-500" /> Update Cadence
                  </h3>
                  <p className={commonStyles.blockText}>{tool.updateFrequency}</p>
                </div>

                <div className={commonStyles.detailBlock}>
                  <h3 className={commonStyles.blockHeading}>
                    <CheckCircle2 size={16} className="text-teal-500" /> Output Delivered
                  </h3>
                  <p className={commonStyles.blockText}>{tool.output}</p>
                </div>

                <div className={commonStyles.detailBlock}>
                  <h3 className={commonStyles.blockHeading}>
                    <Info size={16} className="text-amber-500" /> Underlying Assumptions
                  </h3>
                  <ul className={commonStyles.bulletList}>
                    {tool.assumptions.map((asmp, i) => (
                      <li key={i}>{asmp}</li>
                    ))}
                  </ul>
                </div>

                <div className={commonStyles.detailBlock}>
                  <h3 className={commonStyles.blockHeading}>
                    <AlertTriangle size={16} className="text-rose-500" /> Known Limitations
                  </h3>
                  <p className={commonStyles.blockText}>{tool.limitations}</p>
                </div>
              </div>

              <div className={commonStyles.toolFooter}>
                <Link href={tool.toolHref} className={cn(commonStyles.tryBtn, themeStyles.tryBtn)}>
                  <span>Try the {tool.name}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
