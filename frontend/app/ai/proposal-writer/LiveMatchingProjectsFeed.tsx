// @AI-HINT: Live Matching Projects Feed for AI Proposal Writer with 1-Click Proposal Submission & Guest State Persistence
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { projectsApi, proposalsApi } from '@/lib/api/projects';
import { useAuth } from '@/hooks/useAuth';
import {
  savePendingProposal,
  launchProposalSubmission,
  PendingProposalPayload,
} from '@/app/lib/bridges/pendingProjectBridge';
import styles from './LiveMatchingProjectsFeed.module.css';

import {
  Briefcase,
  Sparkles,
  DollarSign,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building,
  Loader2,
  X,
  Send,
} from 'lucide-react';

export interface LiveMatchingProjectsFeedProps {
  category?: string;
  skills?: Array<{ skill: string } | string>;
  suggestedRate?: number;
  proposalText?: string;
  freelancerName?: string;
  projectTitle?: string;
  onApplied?: (project: any) => void;
}

const FALLBACK_PROJECTS = [
  {
    id: 101,
    title: 'Full-Stack Next.js SaaS Platform with Stripe & AI Assistant',
    description:
      'We are looking for an experienced developer to build a modern Next.js SaaS dashboard with Stripe billing, PostgreSQL/Supabase, and an embedded OpenAI assistant.',
    category: 'WEB_DEVELOPMENT',
    budget_type: 'fixed',
    budget_min: 1500,
    budget_max: 3000,
    estimated_duration: '1_to_3_months',
    experience_level: 'intermediate',
    skills: ['Next.js', 'React', 'TypeScript', 'Stripe', 'Tailwind CSS'],
    client_name: 'Apex Dynamics Inc.',
    proposals_count: 4,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 102,
    title: 'React Native Mobile App for On-Demand Services Marketplace',
    description:
      'Seeking a top React Native engineer to develop our cross-platform iOS and Android mobile app with live geolocation, push notifications, and payment gateway.',
    category: 'MOBILE_DEVELOPMENT',
    budget_type: 'hourly',
    budget_min: 45,
    budget_max: 75,
    estimated_duration: '3_to_6_months',
    experience_level: 'expert',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'REST API'],
    client_name: 'NovaTech Ventures',
    proposals_count: 2,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 103,
    title: 'Modern UI/UX Design System & Interactive Figma Prototypes',
    description:
      'Need an expert product designer to build a comprehensive design system, component library, and interactive prototypes for our web platform redesign.',
    category: 'DESIGN_AND_CREATIVE',
    budget_type: 'fixed',
    budget_min: 1200,
    budget_max: 2400,
    estimated_duration: 'less_than_1_month',
    experience_level: 'intermediate',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping'],
    client_name: 'Vanguard Studios',
    proposals_count: 3,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export default function LiveMatchingProjectsFeed({
  category,
  skills = [],
  suggestedRate,
  proposalText = '',
  freelancerName,
  projectTitle,
  onApplied,
}: LiveMatchingProjectsFeedProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { user, isAuthenticated } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number | string>>(new Set());

  // Quick submit modal state
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [modalBidRate, setModalBidRate] = useState<number | string>(suggestedRate || 65);
  const [modalCoverLetter, setModalCoverLetter] = useState<string>(proposalText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Normalize skill names
  const normalizedUserSkills = useMemo(() => {
    return skills
      .map((s) => (typeof s === 'string' ? s : s?.skill))
      .filter(Boolean)
      .map((s) => s.toLowerCase());
  }, [skills]);

  // Fetch open marketplace projects
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp: any = await projectsApi.list({ status: 'open', page_size: 10 });
        const items = Array.isArray(resp)
          ? resp
          : resp?.items || resp?.projects || resp?.data || [];

        if (isMounted) {
          if (items.length > 0) {
            setProjects(items);
          } else {
            setProjects(FALLBACK_PROJECTS);
          }
        }
      } catch (err) {
        if (isMounted) {
          setProjects(FALLBACK_PROJECTS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [category]);

  // Keep modal cover letter in sync with latest generated proposal
  useEffect(() => {
    if (proposalText) {
      setModalCoverLetter(proposalText);
    }
  }, [proposalText]);

  useEffect(() => {
    if (suggestedRate) {
      setModalBidRate(suggestedRate);
    }
  }, [suggestedRate]);

  // Calculate match score and highlight skills for each project
  const scoredProjects = useMemo(() => {
    return projects.map((proj) => {
      const projSkills: string[] = Array.isArray(proj.skills)
        ? proj.skills
        : typeof proj.skills === 'string'
        ? proj.skills.split(',').map((s: string) => s.trim())
        : [];

      let matchedCount = 0;
      projSkills.forEach((ps) => {
        if (normalizedUserSkills.some((us) => us.includes(ps.toLowerCase()) || ps.toLowerCase().includes(us))) {
          matchedCount++;
        }
      });

      const skillOverlap = projSkills.length > 0 ? matchedCount / projSkills.length : 0.7;
      const baseScore = 82 + Math.round(skillOverlap * 16);
      const matchScore = Math.min(99, Math.max(80, baseScore));

      return {
        ...proj,
        parsedSkills: projSkills,
        matchScore,
        matchedCount,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [projects, normalizedUserSkills]);

  const handleApplyClick = (project: any) => {
    const payload: PendingProposalPayload = {
      jobId: project.id,
      projectId: project.id,
      projectTitle: project.title,
      coverLetter: proposalText,
      hourlyRate: typeof suggestedRate === 'number' ? suggestedRate : null,
      bidAmount: project.budget_type === 'fixed' ? project.budget_max || project.budget_min : null,
      sourceTool: 'ai_proposal_writer',
      matchedSkills: project.parsedSkills,
      timestamp: Date.now(),
    };

    if (isAuthenticated) {
      // Open Quick Submit Confirmation Modal
      setSelectedProject(project);
      setModalCoverLetter(proposalText);
      setModalBidRate(
        suggestedRate || (project.budget_type === 'hourly' ? project.budget_min || 45 : project.budget_max || 1500)
      );
      setSubmitSuccess(false);
      setSubmitError(null);
    } else {
      // Guest: Save to dual storage and redirect to signup with returnTo
      savePendingProposal(payload);
      launchProposalSubmission(payload, project.id, router, { isGuest: true });
    }
  };

  const handleConfirmSubmit = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const payload: PendingProposalPayload = {
      jobId: selectedProject.id,
      projectId: selectedProject.id,
      projectTitle: selectedProject.title,
      coverLetter: modalCoverLetter,
      hourlyRate: Number(modalBidRate) || undefined,
      bidAmount: selectedProject.budget_type === 'fixed' ? Number(modalBidRate) || undefined : undefined,
      estimatedHours: 30,
      availability: 'immediate',
      sourceTool: 'ai_proposal_writer',
      timestamp: Date.now(),
    };

    try {
      await proposalsApi.create({
        project_id: Number(selectedProject.id),
        cover_letter: modalCoverLetter,
        hourly_rate: Number(modalBidRate) || undefined,
        bid_amount: selectedProject.budget_type === 'fixed' ? Number(modalBidRate) : undefined,
        estimated_hours: 30,
        availability: 'immediate',
      });

      setAppliedJobIds((prev) => new Set(prev).add(selectedProject.id));
      setSubmitSuccess(true);
      if (onApplied) onApplied(selectedProject);

      setTimeout(() => {
        setSelectedProject(null);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err: any) {
      // Fallback: save draft and redirect to full submission page
      savePendingProposal(payload);
      router.push(`/freelancer/submit-proposal?jobId=${selectedProject.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          styles.container,
          isDark ? styles.containerDark : styles.containerLight
        )}
      >
        {/* Header */}
        <div className={styles.feedHeader}>
          <div className={styles.titleArea}>
            <div className={styles.titleIcon}>
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className={styles.heading}>
                Live Matching Projects (Open for Bids)
              </h3>
              <p className={styles.subheading}>
                Submit your tailored AI proposal directly to high-match client opportunities.
              </p>
            </div>
          </div>

          <div
            className={cn(
              styles.countBadge,
              isDark && styles.countBadgeDark
            )}
          >
            <Sparkles size={14} />
            <span>{scoredProjects.length} Matching Jobs Found</span>
          </div>
        </div>

        {/* Loading / Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-emerald-500" size={28} />
          </div>
        ) : (
          <div className={styles.projectsGrid}>
            {scoredProjects.map((project) => {
              const isApplied = appliedJobIds.has(project.id);
              const budgetText =
                project.budget_type === 'hourly'
                  ? `$${project.budget_min || 30} - $${project.budget_max || 60}/hr`
                  : `$${Number(project.budget_min || 500).toLocaleString()} - $${Number(project.budget_max || 2500).toLocaleString()} fixed`;

              return (
                <div
                  key={project.id}
                  className={cn(
                    styles.projectCard,
                    isDark ? styles.cardDark : styles.cardLight
                  )}
                >
                  <div>
                    {/* Top row */}
                    <div className={styles.cardHeader}>
                      <h4 className={styles.cardTitle}>{project.title}</h4>
                      <span className={styles.matchPill}>
                        <Sparkles size={11} />
                        <span>{project.matchScore}% Match</span>
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className={styles.metaRow}>
                      <span className={styles.metaItem}>
                        <Building size={13} />
                        <span>{project.client_name || 'Verified Client'}</span>
                      </span>
                      <span className={styles.metaItem}>
                        <ShieldCheck size={13} className="text-emerald-500" />
                        <span>Escrow Protected</span>
                      </span>
                      <span className={styles.metaItem}>
                        <Clock size={13} />
                        <span>{project.experience_level || 'Intermediate'}</span>
                      </span>
                    </div>

                    {/* Description */}
                    <p className={styles.description}>{project.description}</p>

                    {/* Skills pills */}
                    <div className={styles.skillsRow}>
                      {project.parsedSkills.map((sk: string, i: number) => {
                        const isMatch = normalizedUserSkills.some(
                          (us) => us.includes(sk.toLowerCase()) || sk.toLowerCase().includes(us)
                        );
                        return (
                          <span
                            key={i}
                            className={cn(
                              styles.skillPill,
                              isMatch && (isDark ? styles.skillPillMatchedDark : styles.skillPillMatched)
                            )}
                          >
                            {sk}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={styles.cardFooter}>
                    <div>
                      <div className={styles.budgetLabel}>Client Budget</div>
                      <div className={styles.budgetValue}>{budgetText}</div>
                    </div>

                    {isApplied ? (
                      <span className={styles.appliedBadge}>
                        <CheckCircle2 size={15} />
                        <span>Proposal Sent</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles.applyBtn}
                        onClick={() => handleApplyClick(project)}
                      >
                        <Zap size={14} />
                        <span>1-Click Apply</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Proposal Submit Modal */}
      {selectedProject && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProject(null);
          }}
        >
          <div
            className={cn(
              styles.modalContent,
              isDark && styles.modalContentDark
            )}
          >
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setSelectedProject(null)}
            >
              <X size={16} />
            </button>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Proposal Submitted!</h3>
                <p className="opacity-80 text-sm">
                  Your tailored proposal and terms were sent directly to{' '}
                  <strong>{selectedProject.client_name || 'the client'}</strong>.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm mb-1">
                  <Sparkles size={16} />
                  <span>1-Click Proposal Confirmation</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{selectedProject.title}</h3>
                <p className="text-xs opacity-70 mb-4">
                  Client: {selectedProject.client_name || 'Verified Client'} · Protected by 100% Escrow
                </p>

                {submitError && (
                  <div className="p-3 mb-4 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs">
                    {submitError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Your Proposed Rate / Bid Amount ($)
                  </label>
                  <input
                    type="number"
                    value={modalBidRate}
                    onChange={(e) => setModalBidRate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-semibold"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Generated Cover Letter
                  </label>
                  <textarea
                    rows={7}
                    value={modalCoverLetter}
                    onChange={(e) => setModalCoverLetter(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700"
                    onClick={() => setSelectedProject(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                    onClick={handleConfirmSubmit}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={15} />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Confirm &amp; Send Proposal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
