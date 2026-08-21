// @AI-HINT: 60-Second Instant Matching Client Onboarding Wizard component
'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { aiMatchingApi } from '@/lib/api/ai';
import { useGuestStateBridge } from '@/app/lib/bridges/useGuestStateBridge';
import type {
  InstantMatchingWizardProps,
  ExtractedBrief,
  InstantMatchCandidate,
  MilestoneDraft,
} from './types';

import commonStyles from './InstantMatchingWizard.common.module.css';
import lightStyles from './InstantMatchingWizard.light.module.css';
import darkStyles from './InstantMatchingWizard.dark.module.css';

import {
  Sparkles,
  Zap,
  Shield,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Star,
  DollarSign,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

const QUICK_CHIPS = [
  'Build Next.js SaaS with Stripe',
  'Mobile App in React Native',
  'AI Chatbot with OpenAI & FastAPI',
  'Modern Figma UI/UX Design',
  'Full-Stack Web App Development',
  'WordPress E-commerce Store',
  'DevOps AWS & Docker Pipeline',
  'Python Data Analytics & ML',
];

const CATEGORY_OPTIONS = [
  { key: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { key: 'MOBILE_DEVELOPMENT', label: 'Mobile App' },
  { key: 'AI_AND_MACHINE_LEARNING', label: 'AI & ML' },
  { key: 'DESIGN_AND_CREATIVE', label: 'UI/UX Design' },
  { key: 'DEVOPS_AND_CLOUD', label: 'DevOps & Cloud' },
  { key: 'SALES_AND_MARKETING', label: 'Marketing & SEO' },
];

const BUDGET_HINT_PRESETS = [500, 1500, 3000, 5000, 10000];

export default function InstantMatchingWizard({
  initialPrompt = '',
  initialCategory,
  initialBudgetHint,
  onComplete,
  onCancel,
  compact = false,
  className,
}: InstantMatchingWizardProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const {
    draft,
    saveDraft,
    clearDraft,
    redirectToAuth,
    executeProjectAndInvitation,
    isAuthenticated,
    isExecuting,
  } = useGuestStateBridge();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [budgetHint, setBudgetHint] = useState<number | undefined>(initialBudgetHint);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Matching results state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedBrief, setExtractedBrief] = useState<ExtractedBrief | null>(null);
  const [matches, setMatches] = useState<InstantMatchCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<InstantMatchCandidate | null>(null);

  // Step 3 Milestone Escrow state
  const [milestoneTitle, setMilestoneTitle] = useState<string>('');
  const [milestoneAmount, setMilestoneAmount] = useState<number>(500);
  const [deliverables, setDeliverables] = useState<string>('');
  const [inviteNotes, setInviteNotes] = useState<string>('');
  const [successResult, setSuccessResult] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate from draft if available
  useEffect(() => {
    if (draft) {
      if (draft.prompt && !prompt) setPrompt(draft.prompt);
      if (draft.category && !category) setCategory(draft.category);
      if (draft.budgetHint && !budgetHint) setBudgetHint(draft.budgetHint);
      if (draft.extractedBrief) setExtractedBrief(draft.extractedBrief);
      if (draft.matches && draft.matches.length > 0) setMatches(draft.matches);
      if (draft.selectedCandidate) setSelectedCandidate(draft.selectedCandidate);
      if (draft.milestoneDraft) {
        setMilestoneTitle(draft.milestoneDraft.title);
        setMilestoneAmount(draft.milestoneDraft.amount);
        setDeliverables(draft.milestoneDraft.deliverables);
        setInviteNotes(draft.milestoneDraft.notes);
      }
      if (draft.step && draft.step > 1) {
        setStep(draft.step);
      }
    }
  }, [draft]);

  const themeStyles = mounted && resolvedTheme === 'dark' ? darkStyles : lightStyles;

  // Handle Quick Select Chip click
  const handleChipClick = (chipText: string) => {
    setPrompt(chipText);
  };

  // Trigger Instant Match (Step 1 -> Step 2)
  const handleTriggerMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt || !prompt.trim()) {
      setErrorMessage('Please describe what you need built or hire for.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingPhase(1);

    // Dynamic phase transitions for high-impact UX feedback
    const t1 = setTimeout(() => setLoadingPhase(2), 500);
    const t2 = setTimeout(() => setLoadingPhase(3), 1100);

    try {
      const response = await aiMatchingApi.instantMatch({
        prompt: prompt.trim(),
        category: category || undefined,
        budget_hint: budgetHint || undefined,
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (response && response.extracted_brief && response.matches) {
        const brief = response.extracted_brief;
        const candidates = response.matches;

        setExtractedBrief(brief);
        setMatches(candidates);

        // Auto-select candidate #1 as default best fit
        const firstCandidate = candidates[0] || null;
        setSelectedCandidate(firstCandidate);

        // Pre-fill Step 3 milestone fields
        const m1Amount = Math.max(100, Math.round((brief.budget_min || 1000) * 0.5));
        const m1Title = `Milestone 1: ${brief.title.replace(/^Full-Stack\s+/i, '')} Architecture & Prototype`;
        const m1Deliverables = `Initial setup, core technical architecture, repository configuration, and MVP delivery of ${brief.title}.`;
        const m1Notes = `Hi ${firstCandidate ? firstCandidate.name : 'there'}, I matched with your profile on MegiLance for "${brief.title}". I would love to work with you!`;

        setMilestoneTitle(m1Title);
        setMilestoneAmount(m1Amount);
        setDeliverables(m1Deliverables);
        setInviteNotes(m1Notes);

        const newDraft = {
          step: 2,
          prompt: prompt.trim(),
          category,
          budgetHint,
          extractedBrief: brief,
          matches: candidates,
          selectedCandidate: firstCandidate,
          milestoneDraft: {
            title: m1Title,
            amount: m1Amount,
            deliverables: m1Deliverables,
            notes: m1Notes,
          },
          timestamp: Date.now(),
        };

        saveDraft(newDraft);
        setStep(2);
      } else {
        throw new Error('Could not extract brief. Please try a different description.');
      }
    } catch (err: any) {
      console.error('[InstantMatchingWizard] Match failed:', err);
      setErrorMessage(
        err?.message || 'Matching engine temporarily unavailable. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Candidate Selection
  const handleSelectCandidate = (candidate: InstantMatchCandidate) => {
    setSelectedCandidate(candidate);
    if (extractedBrief) {
      setInviteNotes(
        `Hi ${candidate.name}, I reviewed your verified profile and selected you for "${extractedBrief.title}". Let's get started!`
      );
    }
    saveDraft({
      step: 2,
      selectedCandidate: candidate,
      milestoneDraft: {
        title: milestoneTitle,
        amount: milestoneAmount,
        deliverables,
        notes: `Hi ${candidate.name}, I reviewed your verified profile and selected you for "${extractedBrief?.title || 'Project'}". Let's get started!`,
      },
    });
  };

  // Proceed to Step 3
  const handleProceedToStep3 = () => {
    setStep(3);
    saveDraft({ step: 3 });
  };

  // Final Conversion Action (Step 3)
  const handleFinalSubmit = async () => {
    if (!extractedBrief) return;

    const milestonePayload: MilestoneDraft = {
      title: milestoneTitle || 'Milestone 1',
      amount: Number(milestoneAmount) || 500,
      deliverables: deliverables || 'Initial project scope deliverable',
      notes: inviteNotes || 'Looking forward to working together!',
    };

    saveDraft({
      step: 3,
      milestoneDraft: milestonePayload,
    });

    if (!isAuthenticated) {
      // Guest visitor: preserve draft and redirect to signup
      redirectToAuth('/client/dashboard?instantMatch=resume');
      return;
    }

    // Authenticated client: execute project creation and direct candidate invitation
    try {
      const result = await executeProjectAndInvitation({
        briefOverride: extractedBrief,
        candidateOverride: selectedCandidate || undefined,
        milestoneOverride: milestonePayload,
      });

      setSuccessResult(result);
      if (onComplete) {
        onComplete(result);
      } else {
        setTimeout(() => {
          router.push('/client/projects');
        }, 1800);
      }
    } catch (err: any) {
      console.error('[InstantMatchingWizard] Execution error:', err);
      setErrorMessage(err?.message || 'Failed to complete project creation.');
    }
  };

  return (
    <div
      className={cn(
        commonStyles.wizardContainer,
        themeStyles.wizardContainer,
        compact ? 'max-w-xl' : '',
        className
      )}
      data-testid="instant-matching-wizard"
    >
      {/* Wizard Header with 3-Step Indicator */}
      <div className={cn(commonStyles.wizardHeader, themeStyles.wizardHeader)}>
        <div className={commonStyles.stepIndicatorBar} aria-label="Wizard progress">
          <div
            className={cn(
              commonStyles.stepPill,
              step >= 1 ? themeStyles.stepPillActive : themeStyles.stepPillInactive
            )}
          />
          <div
            className={cn(
              commonStyles.stepPill,
              step >= 2 ? themeStyles.stepPillActive : themeStyles.stepPillInactive
            )}
          />
          <div
            className={cn(
              commonStyles.stepPill,
              step >= 3 ? themeStyles.stepPillActive : themeStyles.stepPillInactive
            )}
          />
        </div>

        <div className={commonStyles.headerTitleRow}>
          <div>
            <h2 className={cn(commonStyles.headerTitle, themeStyles.headerTitle)}>
              <Zap size={20} className="text-amber-500 fill-amber-500" />
              {step === 1 && '60-Second Instant Talent Match'}
              {step === 2 && 'Top 3 Verified Matches'}
              {step === 3 && 'Milestone Escrow & 1-Click Invite'}
            </h2>
            <p className={cn(commonStyles.headerSubtitle, themeStyles.headerSubtitle)}>
              {step === 1 &&
                'Describe what you need in one sentence. AI matches and ranks top talent instantly.'}
              {step === 2 &&
                'Select your preferred specialist to review deliverables and setup 100% escrow.'}
              {step === 3 &&
                'Funds are held securely in neutral escrow. Released only when you approve the milestone.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs font-bold px-2.5 py-1 rounded-full border',
                themeStyles.trustBadgeHighlight
              )}
            >
              <Shield size={12} className="inline mr-1" /> 100% Escrow Protection
            </span>
          </div>
        </div>
      </div>

      {/* Wizard Step Body */}
      <div className={commonStyles.stepBody}>
        {/* ========================================================================= */}
        {/* STEP 1: 1-Sentence Prompt, Chips, and Instant Match Trigger */}
        {/* ========================================================================= */}
        {step === 1 && (
          <>
            <form onSubmit={handleTriggerMatch} className={commonStyles.promptInputWrapper}>
              <label
                htmlFor="instant-match-prompt"
                className="text-sm font-bold text-gray-800 dark:text-gray-200"
              >
                What do you need built or delivered?
              </label>
              <textarea
                id="instant-match-prompt"
                data-testid="wizard-prompt-input"
                className={cn(commonStyles.promptTextarea, themeStyles.promptTextarea)}
                placeholder="e.g. Build a high-converting Next.js SaaS web app with Stripe payments, auth, and Tailwind CSS..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                disabled={isLoading}
              />

              <div className={cn(commonStyles.promptMetaRow, themeStyles.promptMetaRow)}>
                <span>Tip: Mention tech stack or goals for high accuracy.</span>
                <span>{prompt.length} characters</span>
              </div>
            </form>

            {/* 8 Quick-Select Chips */}
            <div className={commonStyles.quickChipsSection}>
              <span className={cn(commonStyles.chipsLabel, themeStyles.chipsLabel)}>
                Popular Project Scopes
              </span>
              <div className={commonStyles.chipsList} role="group" aria-label="Quick select prompts">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className={cn(
                      commonStyles.chipButton,
                      themeStyles.chipButton,
                      prompt === chip ? themeStyles.chipButtonActive : ''
                    )}
                    data-testid={`quick-chip-${chip.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <Sparkles size={13} className="text-amber-500" />
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable Category & Budget Hints */}
            <div className={cn(commonStyles.expandableSection, themeStyles.expandableSection)}>
              <button
                type="button"
                className={cn(commonStyles.expandableHeader, themeStyles.expandableHeader, 'w-full')}
                onClick={() => setShowOptions(!showOptions)}
                aria-expanded={showOptions}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={15} /> Customize Category &amp; Budget Hint (Optional)
                </span>
                {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showOptions && (
                <div className={cn(commonStyles.expandableContent, themeStyles.expandableContent)}>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Category
                    </span>
                    <div className={commonStyles.optionsGrid}>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setCategory(category === cat.key ? undefined : cat.key)}
                          className={cn(
                            commonStyles.categoryOption,
                            themeStyles.categoryOption,
                            category === cat.key ? themeStyles.categoryOptionActive : ''
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Target Budget (USD)
                    </span>
                    <div className={commonStyles.budgetInputsRow}>
                      <div className="flex gap-2 flex-wrap flex-1">
                        {BUDGET_HINT_PRESETS.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() =>
                              setBudgetHint(budgetHint === amount ? undefined : amount)
                            }
                            className={cn(
                              commonStyles.chipButton,
                              themeStyles.chipButton,
                              budgetHint === amount ? themeStyles.chipButtonActive : ''
                            )}
                          >
                            ${amount.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      <input
                        type="number"
                        placeholder="Custom $"
                        value={budgetHint || ''}
                        onChange={(e) =>
                          setBudgetHint(e.target.value ? Number(e.target.value) : undefined)
                        }
                        className={cn(commonStyles.budgetInput, themeStyles.budgetInput)}
                        aria-label="Custom budget input in USD"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium"
              >
                {errorMessage}
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Extraction Animation, Brief Summary, and Top 3 Candidate Cards */}
        {/* ========================================================================= */}
        {step === 2 && (
          <>
            {isLoading ? (
              <div className={commonStyles.loadingContainer} data-testid="matching-loading-state">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin flex items-center justify-center">
                    <Zap size={24} className="text-indigo-600 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {loadingPhase === 1 && '🧠 Analyzing project scope & architecture...'}
                    {loadingPhase === 2 && '⚡ Scanning 10,000+ verified talent profiles...'}
                    {loadingPhase === 3 && '🏆 Ranking top 3 best-fit specialists...'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Applying 9-factor multi-dimensional ranking and escrow verification
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Extracted Brief Summary Box */}
                {extractedBrief && (
                  <div
                    className={cn(commonStyles.briefSummaryCard, themeStyles.briefSummaryCard)}
                    data-testid="extracted-brief-card"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                          AI-Extracted Project Scope
                        </span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                          {extractedBrief.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                          {extractedBrief.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                      {extractedBrief.description}
                    </p>

                    <div className={commonStyles.briefMetaRow}>
                      <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200">
                        <DollarSign size={14} className="text-emerald-500" />
                        Est. Budget: ${extractedBrief.budget_min?.toLocaleString()} - $
                        {extractedBrief.budget_max?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock size={14} /> Est. Delivery: ~{extractedBrief.estimated_days} days
                      </span>
                    </div>

                    {extractedBrief.skills && extractedBrief.skills.length > 0 && (
                      <div className={commonStyles.briefSkillsRow}>
                        {extractedBrief.skills.map((s) => (
                          <span
                            key={s}
                            className={cn(commonStyles.skillPill, themeStyles.skillPill)}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Top 3 Candidate Cards */}
                <div
                  className={commonStyles.candidatesGrid}
                  role="radiogroup"
                  aria-label="Matched Freelancer Candidates"
                >
                  {matches.map((candidate, idx) => {
                    const isSelected =
                      selectedCandidate?.freelancer_id === candidate.freelancer_id;
                    const score = candidate.match_score || 90;
                    const scoreColor =
                      score >= 90
                        ? 'text-emerald-500 stroke-emerald-500'
                        : score >= 80
                        ? 'text-blue-500 stroke-blue-500'
                        : 'text-indigo-500 stroke-indigo-500';

                    return (
                      <div
                        key={String(candidate.freelancer_id)}
                        onClick={() => handleSelectCandidate(candidate)}
                        className={cn(
                          commonStyles.candidateCard,
                          themeStyles.candidateCard,
                          isSelected ? themeStyles.candidateCardSelected : ''
                        )}
                        data-testid={`candidate-card-${idx}`}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            handleSelectCandidate(candidate);
                          }
                        }}
                      >
                        {/* Top Row: Candidate Header + Circular Match Gauge */}
                        <div className={commonStyles.candidateTopRow}>
                          <div className={commonStyles.candidateInfo}>
                            <div className={cn(commonStyles.avatarWrapper, themeStyles.avatarWrapper)}>
                              {candidate.avatar_url && candidate.avatar_url.startsWith('http') ? (
                                <img
                                  src={candidate.avatar_url}
                                  alt={candidate.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{candidate.name.charAt(0)}</span>
                              )}
                            </div>

                            <div className={commonStyles.candidateMeta}>
                              <span className={cn(commonStyles.candidateName, themeStyles.candidateName)}>
                                {candidate.name}
                              </span>
                              <span
                                className={cn(commonStyles.candidateTitle, themeStyles.candidateTitle)}
                              >
                                {candidate.title || 'Senior Specialist'}
                              </span>
                              <span className={cn(commonStyles.candidateRate, themeStyles.candidateRate)}>
                                ${candidate.hourly_rate}/hr
                              </span>
                            </div>
                          </div>

                          {/* Circular Match Score Gauge */}
                          <div className={commonStyles.scoreGauge} title={`${score}% AI Fit Match`}>
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle
                                cx="18"
                                cy="18"
                                r="15.915"
                                fill="none"
                                className="stroke-gray-200 dark:stroke-gray-800"
                                strokeWidth="3.2"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="15.915"
                                fill="none"
                                className={scoreColor}
                                strokeWidth="3.2"
                                strokeDasharray={`${score}, 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[11px] font-black text-gray-900 dark:text-white">
                              {score}%
                            </span>
                          </div>
                        </div>

                        {/* Verified Trust Badges */}
                        <div className={commonStyles.trustBadgesRow}>
                          <span
                            className={cn(
                              commonStyles.trustBadgeMini,
                              themeStyles.trustBadgeHighlight
                            )}
                          >
                            <Shield size={11} /> 100% Escrow
                          </span>
                          <span className={cn(commonStyles.trustBadgeMini, themeStyles.trustBadgeMini)}>
                            <Zap size={11} className="text-amber-500" /> 0% Fee
                          </span>
                          <span className={cn(commonStyles.trustBadgeMini, themeStyles.trustBadgeMini)}>
                            <UserCheck size={11} className="text-blue-500" /> ID Verified
                          </span>
                          <span className={cn(commonStyles.trustBadgeMini, themeStyles.trustBadgeMini)}>
                            <Star size={11} className="text-amber-400 fill-amber-400" />{' '}
                            {candidate.trust_signals?.verified_badge || 'Top Rated'}
                          </span>
                        </div>

                        {/* Fit Explanation */}
                        <p className={cn(commonStyles.fitExplanation, themeStyles.fitExplanation)}>
                          💡 <strong>Why Match:</strong> {candidate.why_good_fit}
                        </p>

                        {/* 1-Click Select Button */}
                        <button
                          type="button"
                          className={cn(
                            commonStyles.selectCandidateBtn,
                            themeStyles.selectCandidateBtn,
                            isSelected ? themeStyles.selectCandidateBtnActive : ''
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCandidate(candidate);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={15} /> Selected Match
                            </>
                          ) : (
                            'Select Candidate'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Milestone Escrow Setup & 1-Click Direct Invite */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className={cn(commonStyles.escrowSetupCard, themeStyles.escrowSetupCard)}>
            {/* Success Animation if Finished */}
            {successResult ? (
              <div
                className="py-10 flex flex-col items-center text-center gap-3"
                data-testid="wizard-success-state"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Project Created &amp; Direct Invite Sent!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  We have notified {selectedCandidate?.name}. You can review active milestone escrow
                  and workroom progress in your dashboard.
                </p>
              </div>
            ) : (
              <>
                {/* Selected Candidate Mini Summary */}
                {selectedCandidate && (
                  <div
                    className={cn(
                      commonStyles.selectedCandidateSummary,
                      themeStyles.selectedCandidateSummary
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          commonStyles.avatarWrapper,
                          themeStyles.avatarWrapper,
                          'w-10 h-10 text-sm'
                        )}
                      >
                        <span>{selectedCandidate.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          Inviting {selectedCandidate.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedCandidate.title} • ${selectedCandidate.hourly_rate}/hr
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                        ⭐ {selectedCandidate.match_score}% Match Score
                      </span>
                    </div>
                  </div>
                )}

                {/* Milestone 1 Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={commonStyles.milestoneFormGroup}>
                    <label
                      htmlFor="milestone-title"
                      className={cn(commonStyles.formLabel, themeStyles.formLabel)}
                    >
                      Milestone 1 Deliverable Name
                    </label>
                    <input
                      id="milestone-title"
                      type="text"
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
                      className={cn(commonStyles.formInput, themeStyles.formInput)}
                      placeholder="e.g. Architecture, MVP Scope & Prototype"
                    />
                  </div>

                  <div className={commonStyles.milestoneFormGroup}>
                    <label
                      htmlFor="milestone-budget"
                      className={cn(commonStyles.formLabel, themeStyles.formLabel)}
                    >
                      Milestone 1 Escrow Amount (USD)
                    </label>
                    <input
                      id="milestone-budget"
                      type="number"
                      value={milestoneAmount}
                      onChange={(e) => setMilestoneAmount(Number(e.target.value))}
                      className={cn(commonStyles.formInput, themeStyles.formInput)}
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className={commonStyles.milestoneFormGroup}>
                  <label
                    htmlFor="milestone-deliverables"
                    className={cn(commonStyles.formLabel, themeStyles.formLabel)}
                  >
                    Milestone Deliverables Scope
                  </label>
                  <textarea
                    id="milestone-deliverables"
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    rows={2}
                    className={cn(commonStyles.formTextarea, themeStyles.formTextarea)}
                    placeholder="Describe specific milestones or deliverables..."
                  />
                </div>

                <div className={commonStyles.milestoneFormGroup}>
                  <label
                    htmlFor="invite-notes"
                    className={cn(commonStyles.formLabel, themeStyles.formLabel)}
                  >
                    Direct Message to Specialist
                  </label>
                  <textarea
                    id="invite-notes"
                    value={inviteNotes}
                    onChange={(e) => setInviteNotes(e.target.value)}
                    rows={2}
                    className={cn(commonStyles.formTextarea, themeStyles.formTextarea)}
                    placeholder="Add any specific instructions or requirements..."
                  />
                </div>

                {/* Risk Reversal Callout */}
                <div
                  className={cn(
                    commonStyles.riskReversalCallout,
                    themeStyles.riskReversalCallout
                  )}
                >
                  <Shield size={20} className="flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">100% Milestone Escrow Guarantee</strong>
                    <span>
                      Your escrow payment is held securely in neutral custody. Funds are never
                      released until you review and approve the submitted milestone deliverables. 0%
                      client fee.
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Wizard Footer with Action Buttons */}
      {!successResult && (
        <div className={cn(commonStyles.wizardFooter, themeStyles.wizardFooter)}>
          <div className={cn(commonStyles.trustFooter, themeStyles.trustFooter)}>
            <Shield size={14} className="text-emerald-500" />
            <span>100% Escrow Protection • 0% Client Fee • Verified Identity</span>
          </div>

          <div className={commonStyles.actionButtonsRow}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={cn(commonStyles.secondaryBtn, themeStyles.secondaryBtn)}
                disabled={isLoading || isExecuting}
              >
                <ArrowLeft size={15} className="inline mr-1" />
                Back
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleTriggerMatch}
                className={cn(commonStyles.primaryCta, themeStyles.primaryCta)}
                disabled={isLoading || !prompt.trim()}
                data-testid="wizard-find-matches-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin inline mr-1" />
                    Finding Best Matches...
                  </>
                ) : (
                  <>
                    Match Top 3 Specialists in 60s
                    <Zap size={16} className="fill-current inline ml-1" />
                  </>
                )}
              </button>
            )}

            {step === 2 && !isLoading && (
              <button
                type="button"
                onClick={handleProceedToStep3}
                className={cn(commonStyles.primaryCta, themeStyles.primaryCta)}
                disabled={!selectedCandidate}
                data-testid="wizard-proceed-step3-btn"
              >
                Next: Setup Milestone Escrow
                <ArrowRight size={16} className="inline ml-1" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className={cn(commonStyles.primaryCta, themeStyles.primaryCta)}
                disabled={isExecuting}
                data-testid="wizard-final-submit-btn"
              >
                {isExecuting ? (
                  <>
                    <Loader2 size={16} className="animate-spin inline mr-1" />
                    Creating Project...
                  </>
                ) : isAuthenticated ? (
                  <>
                    Confirm &amp; Send Direct Invite
                    <Send size={16} className="inline ml-1" />
                  </>
                ) : (
                  <>
                    Proceed with 0% Fee &amp; Instant Match
                    <ArrowRight size={16} className="inline ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
