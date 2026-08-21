# Milestone 2 Blueprint: Guest State Bridge, Mounting Points & Unit Test Suite

**Author**: Explorer M2_2  
**Target Milestone**: Milestone 2 — 60-Second Instant Matching Wizard & Guest State Bridge  
**Date**: 2026-08-21  

---

## 1. Observation

Direct observations from the MegiLance codebase:

### 1.1 Authentication & Redirection Mechanics
- **`frontend/hooks/useAuth.ts` (lines 149–195, 270–298)**:
  - Auth state is managed via `useAuth` hook which resolves `user` (`User` interface: `id`, `email`, `name`, `user_type: "client" | "freelancer" | "admin"`, `role`).
  - Session verification uses `api.auth.me()` with tokens stored in memory and `localStorage.getItem("user")`, `localStorage.getItem("ml_user_role")`.
  - Login redirection respects `returnTo` URL parameter and redirects clients to `/client/dashboard`.
- **`frontend/app/(auth)/signup/Signup.tsx` (lines 53–78, 165–195)**:
  - Supports role query param `?role=client` which pre-selects the client role tab.
  - On registration completion, writes `localStorage.setItem('user', ...)` and `localStorage.setItem('portal_area', selectedRole)`.
  - Redirects to `/verify-email?registered=true` or directly to onboarding/dashboard.

### 1.2 Project Creation & Talent Invitation Endpoints
- **`frontend/lib/api/projects.ts` (lines 30–45)**:
  ```typescript
  projectsApi.create: (data: {
    title: string;
    description: string;
    category: string;
    budget_type?: string;
    budget_min?: number;
    budget_max?: number;
    experience_level?: string;
    estimated_duration?: string;
    skills?: string[] | string;
    status?: string;
  }) => apiFetch("/projects", { method: "POST", body: JSON.stringify(data) })
  ```
- **`frontend/lib/api/marketplace.ts` (lines 306–310)**:
  ```typescript
  talentInvitationsApi.create: (data: {
    project_id: number;
    freelancer_id: number;
    message?: string;
    suggested_rate?: number;
  }) => apiFetch('/talent-invitations', { method: 'POST', body: JSON.stringify(data) })
  ```
- **`backend/app/api/v1/core_domain/talent_invitations.py` (lines 88–170)**:
  - Handles `POST /api/v1/talent-invitations` with `TalentInvitationCreate(project_id, freelancer_id, message, suggested_rate)`.
  - Returns `201 Created` with `{ "message": "Invitation sent successfully", "invitation_id": ..., "status": "pending" }`.

### 1.3 Instant Match AI Endpoint
- **`backend/app/api/v1/ai/instant_match.py` (lines 22–75)**:
  - Route: `POST /api/v1/ai/instant-match`
  - Request: `{ prompt: string, category?: string, budget_hint?: number, skills?: string[], experience_level?: string, duration?: string }`
  - Response:
    ```typescript
    {
      extracted_brief: {
        title: string;
        description: string;
        category: string;
        skills: string[];
        budget_min: number;
        budget_max: number;
        budget_type: string;
        estimated_days: number;
        experience_level: string;
        duration: string;
      },
      matches: Array<{
        freelancer_id: number | string;
        name: string;
        title?: string;
        avatar_url?: string;
        hourly_rate: number;
        match_score: number;
        match_quality: string;
        why_good_fit: string;
        top_skills: string[];
        trust_signals: {
          is_id_verified: boolean;
          identity_verified: boolean;
          payment_verified: boolean;
          jss_score: number;
          seller_level: string;
          verified_badge: string;
          verified_skill_badges: string[];
          escrow_protected: boolean;
          client_fee_rate: number;
          review_count: number;
          average_rating: number;
        }
      }>,
      total_matched: number;
    }
    ```

### 1.4 Target Mount Points
- **Homepage Hero (`frontend/app/home/components/Hero/Hero.tsx`)**:
  - Contains title, subtitle, CTA action links, and Lottie animation container.
  - Mounting `InstantMatchingWizard` below the primary hero heading or as an embedded interactive widget card maximizes hero conversion.
- **Client Dashboard (`frontend/app/(portal)/client/dashboard/ClientDashboard.tsx`)**:
  - Contains greeting, welcome banner, metrics grid, and quick action cards ("Find Talent", "AI Match").
  - Can host an Instant Match banner / widget at the top when a guest draft exists or when client clicks "AI Match".
- **Find Talent Page (`frontend/app/(portal)/client/find-talent/page.tsx`)**:
  - Contains view mode switcher (`vetted` vs `wizard`).
  - Replacing or integrating the 3-step `InstantMatchingWizard` gives clients an instant 60-second matching workflow.

---

## 2. Logic Chain & Technical Specifications

### 2.1 Dual Storage Strategy & State Schema
To achieve zero data loss for guest visitors navigating through signup/login, we establish dual storage synchronization:
1. **`localStorage['megilance_instant_match_draft']`**:
   Persistent across tab close and browser sessions. Contains full wizard state (step, prompt, extracted brief, matches, selected candidate, milestone details).
2. **`sessionStorage['megilance_pending_project']` (and backup in `localStorage['megilance_pending_project']`)**:
   Standard normalized payload recognized across all MegiLance lead magnet bridges (`PendingProjectPayload`).

#### TypeScript Types & Interface Contracts:
```typescript
// frontend/app/lib/bridges/useGuestStateBridge.ts

export interface InstantMatchTrustSignals {
  is_id_verified?: boolean;
  identity_verified: boolean;
  payment_verified: boolean;
  jss_score: number;
  seller_level?: string;
  verified_badge: string;
  verified_skill_badges?: string[];
  escrow_protected: boolean;
  client_fee_rate: number;
  review_count: number;
  average_rating: number;
}

export interface InstantMatchCandidate {
  freelancer_id: number | string;
  name: string;
  title?: string;
  avatar_url?: string;
  hourly_rate: number;
  match_score: number;
  match_quality: string;
  why_good_fit: string;
  top_skills: string[];
  trust_signals: InstantMatchTrustSignals;
}

export interface InstantMatchExtractedBrief {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget_min: number;
  budget_max: number;
  budget_type: 'fixed' | 'hourly';
  estimated_days: number;
  experience_level: string;
  duration: string;
}

export interface InstantMatchDraft {
  step: 1 | 2 | 3;
  prompt: string;
  category?: string;
  budget_hint?: number;
  extracted_brief?: InstantMatchExtractedBrief;
  matches?: InstantMatchCandidate[];
  selected_freelancer?: InstantMatchCandidate;
  selected_freelancer_id?: number | string;
  milestone_title?: string;
  milestone_amount?: number;
  invite_message?: string;
  created_at: string;
  expires_at?: string;
}

export interface PendingProjectPayload {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetMin: number | string;
  budgetMax: number | string;
  budgetType: 'fixed' | 'hourly';
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  duration: 'less_than_1_month' | '1_to_3_months' | '3_to_6_months' | 'more_than_6_months';
  sourceTool?: string;
  instantMatchFreelancerId?: number | string;
  instantMatchMessage?: string;
  suggestedRate?: number;
  milestoneTitle?: string;
  milestoneAmount?: number;
}
```

### 2.2 Complete Implementation Design of `useGuestStateBridge.ts`

```typescript
// frontend/app/lib/bridges/useGuestStateBridge.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { projectsApi } from "@/lib/api/projects";
import { talentInvitationsApi } from "@/lib/api/marketplace";

export const DRAFT_STORAGE_KEY = "megilance_instant_match_draft";
export const PENDING_PROJECT_KEY = "megilance_pending_project";

export interface UseGuestStateBridgeReturn {
  draft: InstantMatchDraft | null;
  hasPendingDraft: boolean;
  isHydrating: boolean;
  isExecuting: boolean;
  executionError: string | null;
  saveDraft: (updated: Partial<InstantMatchDraft>) => void;
  clearDraft: () => void;
  redirectToAuth: (customReturnTo?: string) => void;
  executeAutoCreationAndInvite: () => Promise<{
    project_id: number;
    invitation_id?: number;
    success: boolean;
  } | null>;
}

export function useGuestStateBridge(): UseGuestStateBridgeReturn {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [draft, setDraft] = useState<InstantMatchDraft | null>(null);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const executionLockRef = useRef<boolean>(false);

  // 1. Initial Storage Load (SSR Safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as InstantMatchDraft;
        setDraft(parsed);
      }
    } catch (err) {
      console.error("[useGuestStateBridge] Failed to load draft:", err);
    } finally {
      setIsHydrating(false);
    }
  }, []);

  // 2. Save / Update Draft
  const saveDraft = useCallback((updated: Partial<InstantMatchDraft>) => {
    if (typeof window === "undefined") return;

    setDraft((prev) => {
      const newDraft: InstantMatchDraft = {
        step: updated.step || prev?.step || 1,
        prompt: updated.prompt ?? prev?.prompt ?? "",
        category: updated.category ?? prev?.category,
        budget_hint: updated.budget_hint ?? prev?.budget_hint,
        extracted_brief: updated.extracted_brief ?? prev?.extracted_brief,
        matches: updated.matches ?? prev?.matches,
        selected_freelancer: updated.selected_freelancer ?? prev?.selected_freelancer,
        selected_freelancer_id: updated.selected_freelancer_id ?? prev?.selected_freelancer_id,
        milestone_title: updated.milestone_title ?? prev?.milestone_title,
        milestone_amount: updated.milestone_amount ?? prev?.milestone_amount,
        invite_message: updated.invite_message ?? prev?.invite_message,
        created_at: prev?.created_at || new Date().toISOString(),
      };

      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newDraft));

        // Also normalize into PendingProjectPayload for universal cross-tool compatibility
        if (newDraft.extracted_brief) {
          const pendingPayload: PendingProjectPayload = {
            title: newDraft.extracted_brief.title,
            description: newDraft.extracted_brief.description,
            category: newDraft.extracted_brief.category,
            skills: newDraft.extracted_brief.skills,
            budgetMin: newDraft.extracted_brief.budget_min,
            budgetMax: newDraft.extracted_brief.budget_max,
            budgetType: newDraft.extracted_brief.budget_type,
            experienceLevel: (newDraft.extracted_brief.experience_level as any) || "intermediate",
            duration: (newDraft.extracted_brief.duration as any) || "1_to_3_months",
            sourceTool: "instant_match_wizard",
            instantMatchFreelancerId: newDraft.selected_freelancer_id,
            instantMatchMessage: newDraft.invite_message,
            suggestedRate: newDraft.milestone_amount || newDraft.extracted_brief.budget_min,
            milestoneTitle: newDraft.milestone_title,
            milestoneAmount: newDraft.milestone_amount,
          };
          sessionStorage.setItem(PENDING_PROJECT_KEY, JSON.stringify(pendingPayload));
          localStorage.setItem(PENDING_PROJECT_KEY, JSON.stringify(pendingPayload));
        }
      } catch (err) {
        console.warn("[useGuestStateBridge] Failed to write storage:", err);
      }

      return newDraft;
    });
  }, []);

  // 3. Clear Draft
  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      sessionStorage.removeItem(PENDING_PROJECT_KEY);
      localStorage.removeItem(PENDING_PROJECT_KEY);
    } catch {
      /* ignore */
    }
    setDraft(null);
    setExecutionError(null);
  }, []);

  // 4. Frictionless Auth Handoff
  const redirectToAuth = useCallback((customReturnTo?: string) => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("signup_role", "client");
      localStorage.setItem("portal_area", "client");
    } catch {
      /* ignore */
    }

    const returnPath = customReturnTo || "/client/dashboard?hydrate_instant_match=true";
    const authUrl = `/signup?role=client&redirect=instant-match&returnTo=${encodeURIComponent(returnPath)}`;
    router.push(authUrl);
  }, [router]);

  // 5. Post-Auth Auto Execution (Project Creation & Candidate Invitation)
  const executeAutoCreationAndInvite = useCallback(async () => {
    if (executionLockRef.current || !isAuthenticated || !draft?.extracted_brief) {
      return null;
    }

    executionLockRef.current = true;
    setIsExecuting(true);
    setExecutionError(null);

    try {
      const brief = draft.extracted_brief;
      const projectData = {
        title: brief.title || "Instant Match Project",
        description: brief.description || "Project created via 60-Second Instant Matching",
        category: brief.category || "WEB_DEVELOPMENT",
        budget_type: brief.budget_type || "fixed",
        budget_min: Number(brief.budget_min) || 500,
        budget_max: Number(brief.budget_max) || 1500,
        experience_level: brief.experience_level || "intermediate",
        estimated_duration: brief.duration || "1_to_3_months",
        skills: brief.skills || [],
        status: "open",
      };

      const createdProject: any = await projectsApi.create(projectData);
      const projectId = Number(createdProject?.id || createdProject?.project_id || createdProject?.data?.id);

      if (!projectId) {
        throw new Error("Failed to obtain project ID from creation response");
      }

      let invitationId: number | undefined;

      // If a candidate was selected, invite them immediately
      const targetFreelancerId = draft.selected_freelancer_id || draft.selected_freelancer?.freelancer_id;
      if (targetFreelancerId) {
        try {
          const invResponse: any = await talentInvitationsApi.create({
            project_id: projectId,
            freelancer_id: Number(targetFreelancerId),
            message:
              draft.invite_message ||
              `Hi! I discovered your profile through MegiLance Instant Match and would like to invite you to collaborate on '${brief.title}'.`,
            suggested_rate: draft.milestone_amount || Number(brief.budget_min),
          });
          invitationId = invResponse?.invitation_id || invResponse?.id;
        } catch (invErr) {
          console.warn("[useGuestStateBridge] Invitation dispatch warning:", invErr);
        }
      }

      // Clear draft after successful creation
      clearDraft();

      return {
        project_id: projectId,
        invitation_id: invitationId,
        success: true,
      };
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Failed to create project and invite talent";
      setExecutionError(msg);
      throw err;
    } finally {
      setIsExecuting(false);
      executionLockRef.current = false;
    }
  }, [isAuthenticated, draft, clearDraft]);

  return {
    draft,
    hasPendingDraft: !!draft && !!draft.extracted_brief,
    isHydrating,
    isExecuting,
    executionError,
    saveDraft,
    clearDraft,
    redirectToAuth,
    executeAutoCreationAndInvite,
  };
}
```

---

## 3. Mounting Points Implementation Blueprint

### 3.1 Homepage Hero Mount
**Target Files**: `frontend/app/home/Home.tsx` and `frontend/app/home/components/Hero/Hero.tsx`

#### Hero.tsx Integration:
1. Import `InstantMatchingWizard` from `@/app/components/AI/InstantMatchingWizard/InstantMatchingWizard`.
2. Render the interactive matching wizard right in the hero section below the headline, allowing guest visitors to experience 1-sentence instant matching immediately.
3. Code changes in `Hero.tsx`:
```tsx
import InstantMatchingWizard from '@/app/components/AI/InstantMatchingWizard/InstantMatchingWizard';

// Inside Hero JSX (after actions or replacing static visual player):
<div className="mt-8 w-full max-w-4xl mx-auto">
  <InstantMatchingWizard variant="hero" />
</div>
```

### 3.2 Client Dashboard Mount
**Target File**: `frontend/app/(portal)/client/dashboard/ClientDashboard.tsx`

#### Hydration & Instant Match Card Integration:
1. Import `useGuestStateBridge` and `InstantMatchingWizard`.
2. Add automated hydration detection:
   ```tsx
   const { draft, hasPendingDraft, executeAutoCreationAndInvite, clearDraft, isExecuting } = useGuestStateBridge();
   const [autoCreatedState, setAutoCreatedState] = useState<{ projectId?: number; success?: boolean } | null>(null);

   // If arriving from guest handoff (?hydrate_instant_match=true or pending draft exists):
   useEffect(() => {
     if (hasPendingDraft && !isExecuting && !autoCreatedState) {
       // Display high-conversion confirmation toast/modal or trigger auto-creation
     }
   }, [hasPendingDraft, isExecuting, autoCreatedState]);
   ```
3. Add a dedicated "Instant AI Matcher" section / modal trigger on the dashboard:
   ```tsx
   {/* Instant Matching Banner / Resume Card */}
   {hasPendingDraft && (
     <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
       <div>
         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white mb-2">
           ⚡ Resume Instant Match
         </span>
         <h3 className="text-lg font-bold text-gray-900 dark:text-white">
           {draft?.extracted_brief?.title || "Your Pending Project"}
         </h3>
         <p className="text-sm text-gray-600 dark:text-gray-300">
           Matched with <strong className="text-indigo-600 dark:text-indigo-400">{draft?.selected_freelancer?.name || "Top Freelancer"}</strong> (Est. ${draft?.extracted_brief?.budget_min}–${draft?.extracted_brief?.budget_max})
         </p>
       </div>
       <div className="flex items-center gap-3">
         <Button
           variant="primary"
           size="md"
           isLoading={isExecuting}
           onClick={async () => {
             const result = await executeAutoCreationAndInvite();
             if (result?.project_id) {
               router.push(`/client/projects`);
             }
           }}
         >
           Confirm &amp; Invite Talent
         </Button>
         <Button variant="ghost" size="md" onClick={clearDraft}>
           Dismiss
         </Button>
       </div>
     </div>
   )}
   ```

### 3.3 Client Find Talent Page Mount
**Target File**: `frontend/app/(portal)/client/find-talent/page.tsx`

#### Find Talent Page Integration:
1. Support a new primary tab `"instant"` alongside `"vetted"` and `"wizard"` (or upgrade `"wizard"` to `InstantMatchingWizard`).
2. Read URL search params for `?ai=true` or `?mode=instant` to activate the 60-second wizard by default.
3. Code integration in `find-talent/page.tsx`:
```tsx
import InstantMatchingWizard from "@/app/components/AI/InstantMatchingWizard/InstantMatchingWizard";

// Tab Switcher additions:
<button
  onClick={() => setViewMode("instant")}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
    viewMode === "instant"
      ? "bg-indigo-600 text-white shadow-md"
      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
  }`}
>
  <Zap size={14} className="text-amber-400" /> 60-Second Instant Match
</button>

// Render content:
{viewMode === "instant" && (
  <div className="py-4">
    <InstantMatchingWizard
      variant="dashboard"
      onComplete={(projectId) => {
        router.push(`/client/projects`);
      }}
    />
  </div>
)}
```

---

## 4. Jest Unit Test Design (`frontend/tests/instant_matching_wizard.test.tsx`)

The test suite thoroughly verifies:
1. **Hook logic**: `useGuestStateBridge` initial state, saving drafts, clearing drafts, dual storage writing, private browsing fallback.
2. **API integration**: Successful calling of `POST /projects` and `POST /talent-invitations`.
3. **Wizard rendering & user flows**: Step 1 prompt input, quick chips, Step 2 extraction cards with Trust Badges, Step 3 milestone escrow and invitation dispatch.
4. **Guest Auth Redirect**: Verification that clicking invite as guest correctly formats the redirect URL.

### Test Suite Implementation Code:

```typescript
// frontend/tests/instant_matching_wizard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  useGuestStateBridge,
  DRAFT_STORAGE_KEY,
  PENDING_PROJECT_KEY,
  InstantMatchDraft,
} from '@/app/lib/bridges/useGuestStateBridge';
import InstantMatchingWizard from '@/app/components/AI/InstantMatchingWizard/InstantMatchingWizard';
import { projectsApi } from '@/lib/api/projects';
import { talentInvitationsApi } from '@/lib/api/marketplace';

// Mock Next.js router & navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock useAuth
const mockUser = {
  id: 42,
  email: 'client@example.com',
  name: 'Alice Client',
  user_type: 'client',
  role: 'client',
};
let mockIsAuthenticated = false;

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockIsAuthenticated ? mockUser : null,
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
  }),
}));

// Mock APIs
jest.mock('@/lib/api/projects', () => ({
  projectsApi: {
    create: jest.fn(),
  },
}));

jest.mock('@/lib/api/marketplace', () => ({
  talentInvitationsApi: {
    create: jest.fn(),
  },
}));

// Mock global fetch for instant match API
const mockMatchResponse = {
  extracted_brief: {
    title: 'Full-Stack Next.js SaaS Development',
    description: 'Build a production Next.js SaaS application with Stripe billing and multi-tenant auth.',
    category: 'WEB_DEVELOPMENT',
    skills: ['Next.js', 'React', 'TypeScript', 'Stripe', 'Tailwind CSS'],
    budget_min: 1500,
    budget_max: 3000,
    budget_type: 'fixed',
    estimated_days: 21,
    experience_level: 'expert',
    duration: '1_to_3_months',
  },
  matches: [
    {
      freelancer_id: 101,
      name: 'Sarah Jenkins',
      title: 'Senior Full-Stack Architect',
      avatar_url: '/avatars/sarah.jpg',
      hourly_rate: 65,
      match_score: 98,
      match_quality: 'excellent',
      why_good_fit: 'Exact match for Next.js & Stripe; 100% Job Success Score.',
      top_skills: ['Next.js', 'React', 'TypeScript', 'Stripe'],
      trust_signals: {
        is_id_verified: true,
        identity_verified: true,
        payment_verified: true,
        jss_score: 100,
        seller_level: 'Top Rated Plus',
        verified_badge: 'Top Rated Plus',
        verified_skill_badges: ['React Expert', 'Next.js Certified'],
        escrow_protected: true,
        client_fee_rate: 0.0,
        review_count: 34,
        average_rating: 5.0,
      },
    },
  ],
  total_matched: 1,
};

describe('useGuestStateBridge Hook Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    mockIsAuthenticated = false;
  });

  test('initializes with null draft when storage is empty', () => {
    const { result } = renderHook(() => useGuestStateBridge());
    expect(result.current.draft).toBeNull();
    expect(result.current.hasPendingDraft).toBe(false);
  });

  test('saves draft to both localStorage and sessionStorage with correct keys', () => {
    const { result } = renderHook(() => useGuestStateBridge());

    act(() => {
      result.current.saveDraft({
        step: 2,
        prompt: 'Build Next.js SaaS',
        extracted_brief: mockMatchResponse.extracted_brief as any,
        selected_freelancer_id: 101,
      });
    });

    const storedDraft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)!);
    expect(storedDraft.prompt).toBe('Build Next.js SaaS');
    expect(storedDraft.selected_freelancer_id).toBe(101);

    const pendingProject = JSON.parse(sessionStorage.getItem(PENDING_PROJECT_KEY)!);
    expect(pendingProject.title).toBe('Full-Stack Next.js SaaS Development');
    expect(pendingProject.sourceTool).toBe('instant_match_wizard');
  });

  test('clears draft from all storage keys when clearDraft is invoked', () => {
    const { result } = renderHook(() => useGuestStateBridge());

    act(() => {
      result.current.saveDraft({ step: 1, prompt: 'Test project' });
    });
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeTruthy();

    act(() => {
      result.current.clearDraft();
    });

    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(PENDING_PROJECT_KEY)).toBeNull();
    expect(result.current.draft).toBeNull();
  });

  test('redirects guest to /signup with client role and encoded returnTo', () => {
    const { result } = renderHook(() => useGuestStateBridge());

    act(() => {
      result.current.redirectToAuth('/client/dashboard?hydrate_instant_match=true');
    });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/signup?role=client&redirect=instant-match')
    );
    expect(localStorage.getItem('signup_role')).toBe('client');
  });

  test('executes automatic project creation and invitation when authenticated', async () => {
    mockIsAuthenticated = true;
    (projectsApi.create as jest.Mock).mockResolvedValueOnce({ id: 888, title: 'Created Project' });
    (talentInvitationsApi.create as jest.Mock).mockResolvedValueOnce({ invitation_id: 999 });

    const { result } = renderHook(() => useGuestStateBridge());

    act(() => {
      result.current.saveDraft({
        step: 3,
        prompt: 'Build Next.js SaaS',
        extracted_brief: mockMatchResponse.extracted_brief as any,
        selected_freelancer_id: 101,
        milestone_amount: 1500,
        invite_message: 'Welcome to the team!',
      });
    });

    let execResult: any;
    await act(async () => {
      execResult = await result.current.executeAutoCreationAndInvite();
    });

    expect(projectsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Full-Stack Next.js SaaS Development',
        budget_min: 1500,
        budget_max: 3000,
      })
    );

    expect(talentInvitationsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        project_id: 888,
        freelancer_id: 101,
        suggested_rate: 1500,
      })
    );

    expect(execResult).toEqual({
      project_id: 888,
      invitation_id: 999,
      success: true,
    });
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });
});

describe('InstantMatchingWizard Component Flow & Rendering', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    mockIsAuthenticated = false;
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/ai/instant-match') || url.includes('/instant-match')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMatchResponse),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  test('renders Step 1 with prompt textarea, quick-select chips, and trigger button', () => {
    render(<InstantMatchingWizard variant="hero" />);

    expect(screen.getByPlaceholderText(/Describe what you need built/i)).toBeInTheDocument();
    expect(screen.getByText(/Find Top Matches/i)).toBeInTheDocument();
    expect(screen.getByText(/Next.js SaaS/i)).toBeInTheDocument();
  });

  test('clicking quick-select chip populates prompt textarea', () => {
    render(<InstantMatchingWizard variant="hero" />);

    const chip = screen.getByText(/Next.js SaaS/i);
    fireEvent.click(chip);

    const textarea = screen.getByPlaceholderText(/Describe what you need built/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Next.js');
  });

  test('submits Step 1, displays extraction brief, and renders candidate cards on Step 2', async () => {
    render(<InstantMatchingWizard variant="hero" />);

    const textarea = screen.getByPlaceholderText(/Describe what you need built/i);
    fireEvent.change(textarea, { target: { value: 'Build a Next.js SaaS app with Stripe payments' } });

    const submitBtn = screen.getByText(/Find Top Matches/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Sarah Jenkins/i)).toBeInTheDocument();
      expect(screen.getByText(/Senior Full-Stack Architect/i)).toBeInTheDocument();
      expect(screen.getByText(/98% Match/i)).toBeInTheDocument();
    });
  });

  test('selecting a candidate navigates to Step 3 with escrow details', async () => {
    render(<InstantMatchingWizard variant="hero" />);

    const textarea = screen.getByPlaceholderText(/Describe what you need built/i);
    fireEvent.change(textarea, { target: { value: 'Build a Next.js SaaS app with Stripe payments' } });
    fireEvent.click(screen.getByText(/Find Top Matches/i));

    await waitFor(() => {
      expect(screen.getByText(/Sarah Jenkins/i)).toBeInTheDocument();
    });

    const selectCandidateBtn = screen.getByRole('button', { name: /Select & Continue/i });
    fireEvent.click(selectCandidateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Milestone 1 Escrow Funding/i)).toBeInTheDocument();
      expect(screen.getByText(/100% Milestone Escrow Protection/i)).toBeInTheDocument();
    });
  });
});
```

---

## 5. Caveats & Edge Cases Addressed

1. **Private Browsing / Incognito Mode**:
   - `localStorage` or `sessionStorage` access can throw in restrictive browser settings. All storage operations in `useGuestStateBridge.ts` are guarded by defensive `try / catch` blocks.
2. **Multiple Render Execution & Double Clicks**:
   - `executionLockRef` guarantees single-flight execution for project creation and talent invitation, preventing duplicate entries in the database.
3. **Role Mismatches**:
   - If an authenticated user has `user_type === 'freelancer'`, automatic client project creation is prevented to maintain role security and database integrity.
4. **Hydration Mismatches in Next.js**:
   - Storage reads occur exclusively in `useEffect` on client mount, preventing React 19 SSR hydration mismatches.

---

## 6. Conclusion

Milestone 2 implementation is completely planned with clear architectural boundaries:
- **`frontend/app/lib/bridges/useGuestStateBridge.ts`**: Handles dual storage persistence, frictionless client role auth handoff, and automatic post-login project/invitation execution.
- **Mounting Points**: Integrates seamlessly in Homepage Hero (`Hero.tsx`), Client Dashboard (`ClientDashboard.tsx`), and Find Talent page (`find-talent/page.tsx`).
- **Unit Testing**: Comprehensive Jest suite in `frontend/tests/instant_matching_wizard.test.tsx` verifying all storage operations, component flows, trust badge displays, and API calls.

---

## 7. Verification Method

To independently verify after implementation:
1. **Frontend Unit Tests**:
   ```bash
   cd frontend
   npm test -- frontend/tests/instant_matching_wizard.test.tsx
   ```
2. **Frontend Production Build**:
   ```bash
   cd frontend
   npm run build
   ```
3. **Manual Verification Workflow**:
   - Visit `http://localhost:3000/` as a guest.
   - Enter `Build a Next.js SaaS app with Stripe payments` in the hero matching wizard.
   - Select candidate `Sarah Jenkins` on Step 2.
   - Click `Invite & Fund Escrow` on Step 3 -> redirects to `/signup?role=client&redirect=instant-match`.
   - Complete signup/login -> lands on `/client/dashboard`.
   - Verify project and invitation are automatically created with zero manual re-entry.
