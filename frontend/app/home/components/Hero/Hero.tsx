'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { useAuth } from '@/hooks/useAuth';
import { 
  Sparkles, 
  Shield, 
  ArrowRight, 
  Bot, 
  Lock, 
  CheckCircle2, 
  Zap, 
  DollarSign, 
  Users, 
  Layers, 
  Star, 
  Code2, 
  TrendingUp,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { PLATFORM_FACTS, PLATFORM_STATUS } from '@/lib/platform-config';
import commonStyles from './Hero.common.module.css';
import lightStyles from './Hero.light.module.css';
import darkStyles from './Hero.dark.module.css';

const defaultStats = [
  { label: 'Project setup', value: 'Guided', sub: 'Start with a clearer brief' },
  { label: 'Delivery model', value: 'Milestones', sub: 'Review progress step by step' },
  { label: 'Free AI suite', value: `${PLATFORM_FACTS.AI_TOOLS_COUNT} tools`, sub: 'Explore before signup' },
  { label: 'Work styles', value: 'Global', sub: 'Built for remote collaboration' },
];

const TRUST_AVATARS = [
  { name: 'Alex M.', role: 'Full-Stack Lead', bg: 'from-blue-600 to-indigo-600' },
  { name: 'Sarah L.', role: 'AI Specialist', bg: 'from-purple-600 to-pink-600' },
  { name: 'David K.', role: 'UI/UX Architect', bg: 'from-emerald-600 to-teal-600' },
  { name: 'Elena P.', role: 'Smart Contract Dev', bg: 'from-amber-600 to-orange-600' },
];

type QuickTab = 'estimate' | 'escrow' | 'talent';

export default function Hero({ stats = defaultStats }) {
  const mode = useThemeMode();
  const { user, isAuthenticated } = useAuth();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [activeTab, setActiveTab] = useState<QuickTab>('estimate');
  const [selectedProjectType, setSelectedProjectType] = useState('saas');

  const projectPresets = {
    saas: {
      title: 'Full-Stack SaaS Web App',
      estimate: '$3,800 – $5,400',
      hours: '65 – 85 hrs',
      milestones: 3,
      skills: ['Next.js 16', 'FastAPI', 'Stripe Escrow', 'Tailwind'],
      lead: 'Elena Popova (98% Match)',
    },
    mobile: {
      title: 'Cross-Platform Mobile App',
      estimate: '$4,200 – $6,200',
      hours: '75 – 95 hrs',
      milestones: 4,
      skills: ['React Native', 'Node.js', 'Push Sync', 'Auth0'],
      lead: 'Marcus Vance (95% Match)',
    },
    ai: {
      title: 'AI Agent & RAG Pipeline',
      estimate: '$2,900 – $4,500',
      hours: '40 – 60 hrs',
      milestones: 3,
      skills: ['LangChain', 'Python', 'Vector DB', 'OpenAI'],
      lead: 'Dr. Sarah Lin (99% Match)',
    },
    design: {
      title: 'Design System & UX Tokens',
      estimate: '$1,800 – $2,800',
      hours: '30 – 45 hrs',
      milestones: 2,
      skills: ['Figma Tokens', 'Radix UI', 'Accessibility', 'Motion'],
      lead: 'Amara Okonjo (97% Match)',
    },
  };

  const currentPreset = projectPresets[selectedProjectType as keyof typeof projectPresets] || projectPresets.saas;

  const dashboardLink =
    user?.user_type === 'client'
      ? '/client/dashboard'
      : user?.user_type === 'admin'
      ? '/admin/dashboard'
      : '/freelancer/dashboard';

  return (
    <section className={cn(commonStyles.hero, themeStyles.hero)} aria-label="MegiLance Hero">
      <div className={cn(commonStyles.content, themeStyles.content)}>

        {/* ── Top Eyebrow Tag ── */}
        <div className={cn(commonStyles.badges, themeStyles.badges)}>
          {isAuthenticated && user ? (
            <div className={cn(commonStyles.badge, themeStyles.badge, commonStyles.welcomeBadge)}>
              <span className={commonStyles.livePulse} />
              <span>Welcome Back, <strong>{user.name}</strong> ({user.user_type})</span>
            </div>
          ) : (
            <div className={cn(commonStyles.badge, themeStyles.badge)}>
              <span className={commonStyles.livePulse} />
              <Sparkles size={13} className="text-amber-500" aria-hidden="true" />
              <span>MegiLance 2.0 · Intelligent Freelance Operating System</span>
            </div>
          )}
        </div>

        {/* ── Main Headline ── */}
        <h1 id="hero-title" className={cn(commonStyles.title, themeStyles.title)}>
          Start with clarity. Deliver with confidence{' '}
          <span className={cn(commonStyles.highlight, themeStyles.highlight)}>
            milestone by milestone.
          </span>
        </h1>

        {/* ── Subtitle ── */}
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          {isAuthenticated
            ? `Manage active workrooms, verify completed deliverables, or release protected escrow payments directly from your dashboard.`
            : 'Clients can shape a focused brief and compare relevant talent. Freelancers can find clearer opportunities and present their work with context. Use the free tools first, then choose the workflow that fits.'}
        </p>

        {/* ── Primary Action Buttons ── */}
        <div className={cn(commonStyles.actions, themeStyles.actions)}>
          {isAuthenticated ? (
            <>
              <Link
                href={dashboardLink}
                className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/contracts"
                className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}
              >
                <span>View Active Contracts</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary, themeStyles.ctaPrimary)}
              >
                <Zap size={16} aria-hidden="true" />
                <span>Post a Project Free</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/signup?role=freelancer&from=hero"
                className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary, themeStyles.ctaSecondary)}
              >
                <Users size={16} aria-hidden="true" />
                <span>Find Work as a Freelancer</span>
              </Link>
            </>
          )}
        </div>

        {/* ── Social Proof & Trust Strip ── */}
        <div className={cn(commonStyles.trustStrip, themeStyles.trustStrip)}>
          <div className={cn(commonStyles.avatarStack)}>
            {TRUST_AVATARS.map((av, i) => (
              <div
                key={i}
                className={cn(commonStyles.avatar, themeStyles.avatar, `bg-gradient-to-tr ${av.bg}`)}
                title={`${av.name} · ${av.role}`}
                aria-hidden="true"
              >
                {av.name[0]}
              </div>
            ))}
          </div>
          <div className={cn(commonStyles.trustTextGroup)}>
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400" />
                ))}
              </div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white">Built for focused work</strong>
            </div>
            <span className={cn(commonStyles.trustText, themeStyles.trustText)}>
              Clear briefs · relevant proposals · milestone-based collaboration
            </span>
          </div>
        </div>

        {/* ── Interactive Command Center HUD ── */}
        <div className={cn(commonStyles.commandHudWrapper, themeStyles.commandHudWrapper)}>
          <div className={cn(commonStyles.hudCard, themeStyles.hudCard)}>
            
            {/* HUD Top Bar / Browser-Like Header */}
            <div className={cn(commonStyles.hudHeader, themeStyles.hudHeader)}>
              <div className={commonStyles.windowDots}>
                <span className={commonStyles.dotRed} />
                <span className={commonStyles.dotYellow} />
                <span className={commonStyles.dotGreen} />
              </div>

              {/* Mode Switcher Tabs */}
              <div className={commonStyles.hudTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'estimate'}
                  onClick={() => setActiveTab('estimate')}
                  className={cn(commonStyles.hudTabBtn, themeStyles.hudTabBtn, activeTab === 'estimate' && themeStyles.hudTabBtnActive)}
                >
                  <DollarSign size={13} />
                  <span>Instant Scoping</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'escrow'}
                  onClick={() => setActiveTab('escrow')}
                  className={cn(commonStyles.hudTabBtn, themeStyles.hudTabBtn, activeTab === 'escrow' && themeStyles.hudTabBtnActive)}
                >
                  <Shield size={13} className="text-emerald-500" />
                  <span>Milestone Escrow</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'talent'}
                  onClick={() => setActiveTab('talent')}
                  className={cn(commonStyles.hudTabBtn, themeStyles.hudTabBtn, activeTab === 'talent' && themeStyles.hudTabBtnActive)}
                >
                  <Users size={13} className="text-blue-500" />
                  <span>Relevant Talent</span>
                </button>
              </div>

              <div className={cn(commonStyles.liveStatusPill, themeStyles.liveStatusPill)}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold">Escrow terms explained</span>
              </div>
            </div>

            {/* HUD Content Area */}
            <div className={cn(commonStyles.hudBody, themeStyles.hudBody)}>
              
              {activeTab === 'estimate' && (
                <div className={commonStyles.hudGrid}>
                  {/* Preset Selector */}
                  <div className={commonStyles.hudColLeft}>
                    <label className={commonStyles.hudLabel}>Select Project Blueprint:</label>
                    <div className={commonStyles.presetList}>
                      {[
                        { id: 'saas', label: 'Full-Stack SaaS Platform', icon: Code2 },
                        { id: 'mobile', label: 'Cross-Platform Mobile App', icon: Layers },
                        { id: 'ai', label: 'AI Agent & RAG System', icon: Bot },
                        { id: 'design', label: 'Design System & UI Tokens', icon: Sparkles },
                      ].map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = selectedProjectType === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedProjectType(preset.id)}
                            className={cn(
                              commonStyles.presetBtn,
                              themeStyles.presetBtn,
                              isSelected && themeStyles.presetBtnActive
                            )}
                          >
                            <Icon size={15} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                            <span className="font-medium text-xs text-left truncate">{preset.label}</span>
                            {isSelected && <ChevronRight size={14} className="ml-auto text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calculated Output Breakdown */}
                  <div className={cn(commonStyles.hudColRight, themeStyles.hudColRight)}>
                    <div className={commonStyles.estimateCardTop}>
                      <div>
                        <span className={commonStyles.estimateSubLabel}>Data-Calibrated Market Budget</span>
                        <div className={cn(commonStyles.estimateBigPrice, themeStyles.estimateBigPrice)}>
                          {currentPreset.estimate}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={commonStyles.badgeConfidence}>Illustrative range</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                          ~{currentPreset.hours} total
                        </span>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {currentPreset.skills.map((skill) => (
                        <span key={skill} className={cn(commonStyles.skillChip, themeStyles.skillChip)}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Milestones Preview */}
                    <div className={cn(commonStyles.milestoneStrip, themeStyles.milestoneStrip)}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          Structured into {currentPreset.milestones} Milestone Deliverables
                        </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Review milestone terms
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full w-full" />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                          Example specialist: <strong className="text-slate-800 dark:text-slate-200">{currentPreset.lead.replace(/\s*\([^)]*\)/, '')}</strong>
                      </span>
                      <Link
                        href="/talent"
                        className={cn(commonStyles.hudActionBtn, themeStyles.hudActionBtn)}
                      >
                        <span>Hire for this Scope</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'escrow' && (
                <div className={commonStyles.escrowView}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={cn(commonStyles.escrowStepCard, themeStyles.escrowStepCard)}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center text-xs font-bold">1</div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Milestone Pre-Funding</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Client deposits funds for Milestone 1 into neutral escrow vault. Specialist begins work with guaranteed payout.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        ✓ Locked Safely
                      </span>
                    </div>

                    <div className={cn(commonStyles.escrowStepCard, themeStyles.escrowStepCard)}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">2</div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Live Sprint Execution</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Collaborate in real-time workrooms, share commits, preview staging builds, and track automated checkpoints.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                        ● In Progress
                      </span>
                    </div>

                    <div className={cn(commonStyles.escrowStepCard, themeStyles.escrowStepCard)}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">3</div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Approval &amp; Release</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Client inspects deliverable. Upon satisfaction, funds release instantly to the specialist. 0% platform fee deducted.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Instant Multi-Currency
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'talent' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Elena Popova',
                      role: 'Senior Full-Stack & AI Engineer',
                      rate: '$75/hr',
                      match: '99% AI Match',
                      skills: ['Next.js 16', 'FastAPI', 'Turso DB', 'Stripe'],
                      projects: '42 Verified Milestones',
                      avatar: 'EP',
                      avatarBg: 'from-blue-600 to-indigo-600'
                    },
                    {
                      name: 'Marcus Vance',
                      role: 'Lead UI/UX & Design Systems',
                      rate: '$68/hr',
                      match: '97% AI Match',
                      skills: ['Design Tokens', 'Tailwind', 'Figma', 'Radix'],
                      projects: '38 Verified Milestones',
                      avatar: 'MV',
                      avatarBg: 'from-purple-600 to-pink-600'
                    }
                  ].map((specialist) => (
                    <div key={specialist.name} className={cn(commonStyles.talentCard, themeStyles.talentCard)}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${specialist.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                            {specialist.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{specialist.name}</h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded">
                                Example profile
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{specialist.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{specialist.rate}</span>
                              <span className="text-[10px] font-bold text-emerald-500 block">{specialist.match.replace(' AI Match', ' fit')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 my-3">
                        {specialist.skills.map((s) => (
                          <span key={s} className={cn(commonStyles.skillChip, themeStyles.skillChip)}>
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {specialist.projects}
                        </span>
                        <Link href="/talent" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                          <span>View Profile</span>
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className={cn(commonStyles.stats, themeStyles.stats)} aria-label="Platform key statistics">
          {stats.map((stat, i) => (
            <div key={i} className={cn(commonStyles.statItem, themeStyles.statItem)}>
              <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{stat.value}</span>
              <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>{stat.label}</span>
              {(stat as any).sub && (
                <span className={cn(commonStyles.statSub, themeStyles.statSub)}>{(stat as any).sub}</span>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}