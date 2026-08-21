// @AI-HINT: Guest state bridge hook for seamless client onboarding and instant match conversion
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { projectsApi, talentInvitationsApi } from '@/lib/api';
import type {
  InstantMatchDraft,
  PendingProjectPayload,
  ExtractedBrief,
  InstantMatchCandidate,
  MilestoneDraft,
} from '@/app/components/AI/InstantMatchingWizard/types';

export const DRAFT_STORAGE_KEY = 'megilance_instant_match_draft';
export const PENDING_PROJECT_KEY = 'megilance_pending_project';
export const PENDING_PROPOSAL_KEY = 'megilance_pending_proposal';

/**
 * Reads the instant match draft from localStorage with fallback to sessionStorage pending project
 */
export function getStoredInstantMatchDraft(): InstantMatchDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const localDraftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (localDraftStr) {
      const parsed = JSON.parse(localDraftStr) as InstantMatchDraft;
      if (parsed && (parsed.prompt || parsed.extractedBrief)) {
        return parsed;
      }
    }

    // Fallback: Check if there is a pending project payload saved by AI tools or lead magnets
    const pendingProjectStr =
      sessionStorage.getItem(PENDING_PROJECT_KEY) || localStorage.getItem(PENDING_PROJECT_KEY);
    if (pendingProjectStr) {
      const p = JSON.parse(pendingProjectStr) as PendingProjectPayload;
      if (p && (p.title || p.description)) {
        const brief: ExtractedBrief = {
          title: p.title || 'Custom Project',
          description: p.description || '',
          category: p.category || 'WEB_DEVELOPMENT',
          skills: Array.isArray(p.skills) ? p.skills : [],
          budget_min: Number(p.budgetMin) || 1000,
          budget_max: Number(p.budgetMax) || 2500,
          budget_type: p.budgetType || 'fixed',
          estimated_days: 14,
          experience_level: p.experienceLevel || 'intermediate',
          duration: p.duration || '1_to_3_months',
        };
        return {
          step: 2,
          prompt: p.description || p.title,
          category: p.category,
          budgetHint: Number(p.budgetMax) || undefined,
          extractedBrief: brief,
          matches: [],
          selectedCandidate: null,
          milestoneDraft: null,
          timestamp: Date.now(),
          source: p.sourceTool,
        };
      }
    }
  } catch (err) {
    console.warn('[useGuestStateBridge] Failed to read stored draft:', err);
  }
  return null;
}

/**
 * Checks if a pending instant match draft exists in storage
 */
export function hasStoredInstantMatchDraft(): boolean {
  return getStoredInstantMatchDraft() !== null;
}

/**
 * Saves instant match draft with dual storage synchronization
 */
export function saveInstantMatchDraft(draft: InstantMatchDraft): void {
  if (typeof window === 'undefined') return;
  try {
    // 1. Save to primary instant match draft key in localStorage
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

    // 2. Dual-sync to pending project payload format for cross-tool universal bridge compatibility
    if (draft.extractedBrief) {
      const b = draft.extractedBrief;
      const pendingPayload: PendingProjectPayload = {
        title: b.title,
        description: b.description,
        category: b.category,
        skills: b.skills,
        budgetMin: b.budget_min,
        budgetMax: b.budget_max,
        budgetType: (b.budget_type === 'hourly' ? 'hourly' : 'fixed'),
        experienceLevel: b.experience_level,
        duration: b.duration,
        sourceTool: 'instant_match_wizard',
        instantMatchFreelancerId: draft.selectedCandidate?.freelancer_id,
      };
      sessionStorage.setItem(PENDING_PROJECT_KEY, JSON.stringify(pendingPayload));
      localStorage.setItem(PENDING_PROJECT_KEY, JSON.stringify(pendingPayload));
    }
  } catch (err) {
    console.warn('[useGuestStateBridge] Failed to save draft:', err);
  }
}

/**
 * Clears instant match and pending project drafts from all storages
 */
export function clearInstantMatchDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    sessionStorage.removeItem(PENDING_PROJECT_KEY);
    localStorage.removeItem(PENDING_PROJECT_KEY);
  } catch (err) {
    console.warn('[useGuestStateBridge] Failed to clear draft:', err);
  }
}

export function useGuestStateBridge() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [draft, setDraft] = useState<InstantMatchDraft | null>(null);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Hydrate on mount
  useEffect(() => {
    const loaded = getStoredInstantMatchDraft();
    setDraft(loaded);
    setIsHydrating(false);
  }, []);

  const saveDraft = useCallback((updated: Partial<InstantMatchDraft>) => {
    setDraft((prev) => {
      const nextDraft: InstantMatchDraft = {
        step: updated.step ?? prev?.step ?? 1,
        prompt: updated.prompt ?? prev?.prompt ?? '',
        category: updated.category ?? prev?.category,
        budgetHint: updated.budgetHint ?? prev?.budgetHint,
        extractedBrief: updated.extractedBrief !== undefined ? updated.extractedBrief : (prev?.extractedBrief ?? null),
        matches: updated.matches ?? prev?.matches ?? [],
        selectedCandidate: updated.selectedCandidate !== undefined ? updated.selectedCandidate : (prev?.selectedCandidate ?? null),
        milestoneDraft: updated.milestoneDraft !== undefined ? updated.milestoneDraft : (prev?.milestoneDraft ?? null),
        timestamp: Date.now(),
        source: updated.source ?? prev?.source ?? 'instant_match_wizard',
      };
      saveInstantMatchDraft(nextDraft);
      return nextDraft;
    });
  }, []);

  const clearDraft = useCallback(() => {
    clearInstantMatchDraft();
    setDraft(null);
  }, []);

  /**
   * Frictionless guest-to-registered redirect preserving complete draft state
   */
  const redirectToAuth = useCallback(
    (customReturnTo?: string) => {
      const returnPath = customReturnTo || '/client/dashboard?instantMatch=resume';
      const redirectUrl = `/signup?role=client&redirect=instant-match&returnTo=${encodeURIComponent(returnPath)}`;
      router.push(redirectUrl);
    },
    [router]
  );

  /**
   * Executes project creation and candidate direct invitation upon authentication
   */
  const executeProjectAndInvitation = useCallback(
    async (options?: {
      briefOverride?: ExtractedBrief;
      candidateOverride?: InstantMatchCandidate;
      milestoneOverride?: MilestoneDraft;
    }): Promise<{ project: any; invitation?: any; success: boolean }> => {
      setIsExecuting(true);
      setExecutionError(null);

      try {
        const activeDraft = draft || getStoredInstantMatchDraft();
        const brief = options?.briefOverride || activeDraft?.extractedBrief;
        const candidate = options?.candidateOverride || activeDraft?.selectedCandidate;
        const milestone = options?.milestoneOverride || activeDraft?.milestoneDraft;

        if (!brief) {
          throw new Error('No project brief available to create project.');
        }

        // 1. Create project via projectsApi
        const projectPayload = {
          title: brief.title,
          description: brief.description,
          category: brief.category,
          budget_type: brief.budget_type || 'fixed',
          budget_min: Number(brief.budget_min) || 500,
          budget_max: Number(brief.budget_max) || 2500,
          experience_level: brief.experience_level || 'intermediate',
          estimated_duration: brief.duration || '1_to_3_months',
          skills: brief.skills,
          status: 'open',
        };

        const projectRes = (await projectsApi.create(projectPayload)) as any;
        const createdProject = projectRes?.project || projectRes;
        const projectId = createdProject?.id;

        let invitationRes = null;

        // 2. Send direct talent invitation if a candidate was selected
        if (candidate && candidate.freelancer_id && projectId) {
          try {
            const rawFreelancerId = candidate.freelancer_id;
            const numericFreelancerId =
              typeof rawFreelancerId === 'number'
                ? rawFreelancerId
                : parseInt(String(rawFreelancerId).replace(/\D/g, ''), 10) || 1;

            const inviteMessage =
              milestone?.notes ||
              `Hi ${candidate.name}, I reviewed your profile and matched you for "${brief.title}". I would love to collaborate!`;

            invitationRes = await talentInvitationsApi.create({
              project_id: Number(projectId),
              freelancer_id: numericFreelancerId,
              message: inviteMessage,
              suggested_rate: candidate.hourly_rate || undefined,
            });
          } catch (invErr) {
            console.warn('[useGuestStateBridge] Invitation dispatch warning:', invErr);
            // Don't fail the entire project creation if invitation had non-critical issue
          }
        }

        // Clear stored draft upon successful creation
        clearDraft();

        return {
          project: createdProject,
          invitation: invitationRes,
          success: true,
        };
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to create project and send invitation';
        setExecutionError(errorMsg);
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [draft, clearDraft]
  );

  return {
    draft,
    hasPendingDraft: !!draft && (!!draft.prompt || !!draft.extractedBrief),
    isHydrating,
    isExecuting,
    executionError,
    saveDraft,
    clearDraft,
    redirectToAuth,
    executeProjectAndInvitation,
    user,
    isAuthenticated,
  };
}

export default useGuestStateBridge;
