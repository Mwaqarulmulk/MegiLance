'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Layers,
  MapPin,
  Lock,
  Calendar
} from 'lucide-react';
import commonStyles from './JobDetail.common.module.css';
import lightStyles from './JobDetail.light.module.css';
import darkStyles from './JobDetail.dark.module.css';

export interface PublicJobData {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  budgetType: 'fixed_milestones' | 'hourly';
  duration: string;
  experienceLevel: string;
  skills: string[];
  postedAt: string;
  client: {
    name: string;
    location: string;
    isPaymentVerified: boolean;
    totalHires: number;
    rating: number;
  };
  milestones?: Array<{
    title: string;
    description: string;
    amount: number;
  }>;
  isSample?: boolean;
}

export default function JobDetailClient({ job }: { job: PublicJobData }) {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      
      {/* Top Back Navigation */}
      <Link href="/explore" className={cn(commonStyles.backLink, themeStyles.backLink)}>
        <ArrowLeft size={16} />
        <span>Back to Project Listings</span>
      </Link>

      {job.isSample && (
        <div className="mb-6 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles size={14} className="text-amber-500" />
            Verified Sample Brief · MegiLance Public Beta
          </span>
          <span className="opacity-80">Pre-Funded Milestone Escrow Active</span>
        </div>
      )}

      {/* Main Grid */}
      <div className={commonStyles.layoutGrid}>
        
        {/* Left Column: Brief Details */}
        <div className={cn(commonStyles.mainCard, themeStyles.mainCard)}>
          
          <div className={commonStyles.headerTop}>
            <span className={cn(commonStyles.statusPill, themeStyles.statusPill)}>
              <Lock size={12} /> 100% Escrow Funded
            </span>
            <span className={cn(commonStyles.postedDate, themeStyles.postedDate)}>
              Posted {job.postedAt}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 block">
              {job.category}
            </span>
            <h1 className={cn(commonStyles.title, themeStyles.title)}>{job.title}</h1>
          </div>

          {/* Quick Metrics */}
          <div className={cn(commonStyles.metaGrid, themeStyles.metaGrid)}>
            <div className={commonStyles.metaItem}>
              <div className={cn(commonStyles.metaIcon, themeStyles.metaIcon)}>
                <DollarSign size={18} />
              </div>
              <div>
                <span className={commonStyles.metaLabel}>Total Budget</span>
                <span className={commonStyles.metaValue}>${job.budget.toLocaleString()} USD</span>
              </div>
            </div>

            <div className={commonStyles.metaItem}>
              <div className={cn(commonStyles.metaIcon, themeStyles.metaIcon)}>
                <Clock size={18} />
              </div>
              <div>
                <span className={commonStyles.metaLabel}>Est. Timeline</span>
                <span className={commonStyles.metaValue}>{job.duration}</span>
              </div>
            </div>

            <div className={commonStyles.metaItem}>
              <div className={cn(commonStyles.metaIcon, themeStyles.metaIcon)}>
                <Layers size={18} />
              </div>
              <div>
                <span className={commonStyles.metaLabel}>Experience Level</span>
                <span className={commonStyles.metaValue}>{job.experienceLevel}</span>
              </div>
            </div>
          </div>

          {/* Project Brief */}
          <div>
            <h2 className={cn(commonStyles.sectionHeading, themeStyles.sectionHeading)}>Project Scope &amp; Deliverables</h2>
            <p className={cn(commonStyles.description, themeStyles.description)}>
              {job.description}
            </p>
          </div>

          {/* Skills Required */}
          <div>
            <h2 className={cn(commonStyles.sectionHeading, themeStyles.sectionHeading)}>Required Skills &amp; Stack</h2>
            <div className={commonStyles.skillsRow}>
              {job.skills.map((skill) => (
                <span key={skill} className={cn(commonStyles.skillTag, themeStyles.skillTag)}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Milestone Breakdown */}
          {job.milestones && job.milestones.length > 0 && (
            <div>
              <h2 className={cn(commonStyles.sectionHeading, themeStyles.sectionHeading)}>Milestone Work Breakdown</h2>
              <div className={commonStyles.milestonesList}>
                {job.milestones.map((ms, idx) => (
                  <div key={idx} className={cn(commonStyles.milestoneCard, themeStyles.milestoneCard)}>
                    <div>
                      <h3 className={cn(commonStyles.msTitle, themeStyles.msTitle)}>Milestone {idx + 1}: {ms.title}</h3>
                      <p className={cn(commonStyles.msDesc, themeStyles.msDesc)}>{ms.description}</p>
                    </div>
                    <span className={cn(commonStyles.msAmount, themeStyles.msAmount)}>
                      ${ms.amount.toLocaleString()} USD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Actions & Client Vetting */}
        <div className={cn(commonStyles.sidebarCard, themeStyles.sidebarCard)}>
          
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Total Project Escrow</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              ${job.budget.toLocaleString()} <span className="text-xs font-semibold text-slate-500">USD</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <ShieldCheck size={14} /> 100% Guaranteed Escrow Release
            </p>
          </div>

          <div className="space-y-3">
            <Link 
              href={`/ai/proposal-writer?projectId=${job.id}`}
              className={cn(commonStyles.ctaBtn, themeStyles.ctaBtn)}
            >
              <Send size={16} />
              <span>Apply with AI Proposal</span>
            </Link>

            <Link 
              href={`/ai/price-estimator?category=${encodeURIComponent(job.category)}`}
              className={cn(commonStyles.secondaryAction, themeStyles.secondaryAction)}
            >
              <Sparkles size={16} className="text-amber-500" />
              <span>Verify Rates with Estimator</span>
            </Link>
          </div>

          {/* Client Trust Signals */}
          <div className={cn(commonStyles.clientMetaSection, themeStyles.clientMetaSection)}>
            <span className={commonStyles.clientHeading}>About the Client</span>
            
            <div className={commonStyles.clientSignal}>
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
              <span>Payment Verified &amp; Escrow Pre-Funded</span>
            </div>

            <div className={commonStyles.clientSignal}>
              <MapPin size={16} className="text-blue-500 flex-shrink-0" />
              <span>{job.client.location}</span>
            </div>

            <div className={commonStyles.clientSignal}>
              <Calendar size={16} className="text-purple-500 flex-shrink-0" />
              <span>{job.client.totalHires} previous hires · {job.client.rating}★ rating</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
