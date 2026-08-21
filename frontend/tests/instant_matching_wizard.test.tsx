// @AI-HINT: Comprehensive unit test suite for InstantMatchingWizard and useGuestStateBridge
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstantMatchingWizard from '@/app/components/AI/InstantMatchingWizard/InstantMatchingWizard';
import {
  getStoredInstantMatchDraft,
  saveInstantMatchDraft,
  clearInstantMatchDraft,
  DRAFT_STORAGE_KEY,
  PENDING_PROJECT_KEY,
} from '@/app/lib/bridges/useGuestStateBridge';
import { aiMatchingApi } from '@/lib/api/ai';
import { projectsApi, talentInvitationsApi } from '@/lib/api';

// Mock next/navigation
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

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

// Mock useAuth
let mockIsAuthenticated = false;
let mockUser: any = null;
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
    updateProfile: jest.fn(),
  }),
}));

// Mock API modules
jest.mock('@/lib/api/ai', () => ({
  aiMatchingApi: {
    instantMatch: jest.fn(),
  },
}));

jest.mock('@/lib/api', () => ({
  projectsApi: {
    create: jest.fn(),
  },
  talentInvitationsApi: {
    create: jest.fn(),
  },
}));

const mockMatchResponse = {
  extracted_brief: {
    title: 'Full-Stack Next.js SaaS Development with Stripe',
    description: 'Looking for an experienced specialist to build Next.js app with Stripe.',
    category: 'WEB_DEVELOPMENT',
    skills: ['Next.js', 'React', 'TypeScript', 'Stripe', 'Tailwind CSS'],
    budget_min: 1200,
    budget_max: 2800,
    budget_type: 'fixed',
    estimated_days: 18,
    experience_level: 'intermediate',
    duration: '1_to_3_months',
  },
  matches: [
    {
      freelancer_id: '101',
      name: 'Sarah Jenkins',
      title: 'Senior Full-Stack Architect',
      avatar_url: '/avatars/sarah.jpg',
      hourly_rate: 65,
      match_score: 96,
      match_quality: 'excellent',
      why_good_fit: 'Exact match for Next.js and Stripe; 100% Job Success Score; 24 completed projects',
      top_skills: ['Next.js', 'React', 'Stripe', 'TypeScript'],
      trust_signals: {
        is_id_verified: true,
        identity_verified: true,
        payment_verified: true,
        jss_score: 100,
        seller_level: 'Top Rated Plus',
        verified_badge: 'Top Rated Plus',
        verified_skill_badges: ['Next.js', 'Stripe'],
        escrow_protected: true,
        client_fee_rate: 0,
        review_count: 28,
        average_rating: 4.98,
      },
    },
    {
      freelancer_id: '102',
      name: 'Alex Rivera',
      title: 'Lead Frontend Engineer',
      avatar_url: '/avatars/alex.jpg',
      hourly_rate: 55,
      match_score: 91,
      match_quality: 'excellent',
      why_good_fit: 'Top Rated Specialist; 99% Job Success Score; Fast 24-hour turnaround',
      top_skills: ['React', 'TypeScript', 'Tailwind CSS'],
      trust_signals: {
        is_id_verified: true,
        identity_verified: true,
        payment_verified: true,
        jss_score: 99,
        seller_level: 'Top Rated',
        verified_badge: 'Top Rated',
        verified_skill_badges: ['React'],
        escrow_protected: true,
        client_fee_rate: 0,
        review_count: 19,
        average_rating: 4.95,
      },
    },
    {
      freelancer_id: '103',
      name: 'Elena Rostova',
      title: 'Principal Full-Stack Consultant',
      avatar_url: '/avatars/elena.jpg',
      hourly_rate: 75,
      match_score: 88,
      match_quality: 'strong',
      why_good_fit: '100% Job Success Score; 34 verified reviews; Escrow protected',
      top_skills: ['Next.js', 'Stripe', 'Security'],
      trust_signals: {
        is_id_verified: true,
        identity_verified: true,
        payment_verified: true,
        jss_score: 100,
        seller_level: 'Top Rated Plus',
        verified_badge: 'Top Rated Plus',
        verified_skill_badges: ['Security'],
        escrow_protected: true,
        client_fee_rate: 0,
        review_count: 34,
        average_rating: 5.0,
      },
    },
  ],
  total_matched: 3,
};

describe('InstantMatchingWizard & useGuestStateBridge', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    mockIsAuthenticated = false;
    mockUser = null;
    (aiMatchingApi.instantMatch as jest.Mock).mockResolvedValue(mockMatchResponse);
    (projectsApi.create as jest.Mock).mockResolvedValue({ id: 501, title: 'Created Project' });
    (talentInvitationsApi.create as jest.Mock).mockResolvedValue({ id: 701, status: 'pending' });
  });

  test('1. Renders Step 1 with prompt input, 8 quick-select chips, and trust signals', () => {
    render(<InstantMatchingWizard />);

    expect(screen.getByText('60-Second Instant Talent Match')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-prompt-input')).toBeInTheDocument();
    expect(screen.getByText('Popular Project Scopes')).toBeInTheDocument();

    // Check quick chips presence
    expect(screen.getByText('Build Next.js SaaS with Stripe')).toBeInTheDocument();
    expect(screen.getByText('Mobile App in React Native')).toBeInTheDocument();
    expect(screen.getByText('AI Chatbot with OpenAI & FastAPI')).toBeInTheDocument();
    expect(screen.getByText('Modern Figma UI/UX Design')).toBeInTheDocument();
    expect(screen.getByText('Full-Stack Web App Development')).toBeInTheDocument();
    expect(screen.getByText('WordPress E-commerce Store')).toBeInTheDocument();
    expect(screen.getByText('DevOps AWS & Docker Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Python Data Analytics & ML')).toBeInTheDocument();

    // Check CTA button
    expect(screen.getByTestId('wizard-find-matches-btn')).toBeInTheDocument();
  });

  test('2. Quick select chip click populates the prompt textarea', () => {
    render(<InstantMatchingWizard />);

    const chip = screen.getByText('Build Next.js SaaS with Stripe');
    fireEvent.click(chip);

    const input = screen.getByTestId('wizard-prompt-input') as HTMLTextAreaElement;
    expect(input.value).toBe('Build Next.js SaaS with Stripe');
  });

  test('3. Expandable category & budget hint options can be toggled and selected', () => {
    render(<InstantMatchingWizard />);

    const expandBtn = screen.getByText(/Customize Category & Budget Hint/i);
    fireEvent.click(expandBtn);

    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Mobile App')).toBeInTheDocument();
    expect(screen.getByText('$1,500')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Web Development'));
    fireEvent.click(screen.getByText('$1,500'));
  });

  test('4. Submitting Step 1 calls instantMatch API and transitions to Step 2 with top 3 candidates', async () => {
    render(<InstantMatchingWizard />);

    const input = screen.getByTestId('wizard-prompt-input');
    fireEvent.change(input, { target: { value: 'Build Next.js SaaS with Stripe' } });

    const submitBtn = screen.getByTestId('wizard-find-matches-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(aiMatchingApi.instantMatch).toHaveBeenCalledWith({
        prompt: 'Build Next.js SaaS with Stripe',
        category: undefined,
        budget_hint: undefined,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Top 3 Verified Matches')).toBeInTheDocument();
    });

    // Check extracted brief
    expect(screen.getByTestId('extracted-brief-card')).toBeInTheDocument();
    expect(screen.getByText('Full-Stack Next.js SaaS Development with Stripe')).toBeInTheDocument();

    // Check 3 candidate cards rendered
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();

    // Check trust badges on cards
    expect(screen.getAllByText('100% Escrow').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0% Fee').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ID Verified').length).toBeGreaterThan(0);
  });

  test('5. Selecting candidate #2 updates selection and enables proceeding to Step 3', async () => {
    render(<InstantMatchingWizard />);

    const input = screen.getByTestId('wizard-prompt-input');
    fireEvent.change(input, { target: { value: 'Build Next.js SaaS with Stripe' } });
    fireEvent.click(screen.getByTestId('wizard-find-matches-btn'));

    await waitFor(() => {
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    });

    const candidate2Card = screen.getByTestId('candidate-card-1');
    fireEvent.click(candidate2Card);

    const proceedBtn = screen.getByTestId('wizard-proceed-step3-btn');
    fireEvent.click(proceedBtn);

    await waitFor(() => {
      expect(screen.getByText('Milestone Escrow & 1-Click Invite')).toBeInTheDocument();
    });

    expect(screen.getByText(/Inviting Alex Rivera/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Milestone Escrow Guarantee/i)).toBeInTheDocument();
  });

  test('6. Unauthenticated guest clicking final CTA triggers dual storage draft sync and auth redirect', async () => {
    render(<InstantMatchingWizard />);

    const input = screen.getByTestId('wizard-prompt-input');
    fireEvent.change(input, { target: { value: 'Build Next.js SaaS with Stripe' } });
    fireEvent.click(screen.getByTestId('wizard-find-matches-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('wizard-proceed-step3-btn')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('wizard-proceed-step3-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('wizard-final-submit-btn')).toBeInTheDocument();
    });

    const submitBtn = screen.getByTestId('wizard-final-submit-btn');
    expect(screen.getByText(/Proceed with 0% Fee & Instant Match/i)).toBeInTheDocument();
    fireEvent.click(submitBtn);

    // Verify dual storage sync
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeTruthy();
    expect(sessionStorage.getItem(PENDING_PROJECT_KEY)).toBeTruthy();

    // Verify frictionless redirect to signup
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/signup?role=client&redirect=instant-match&returnTo=')
    );
  });

  test('7. Authenticated client clicking final CTA executes project creation and talent invitation', async () => {
    mockIsAuthenticated = true;
    mockUser = { id: 10, name: 'Client Alice', user_type: 'client' };

    render(<InstantMatchingWizard />);

    const input = screen.getByTestId('wizard-prompt-input');
    fireEvent.change(input, { target: { value: 'Build Next.js SaaS with Stripe' } });
    fireEvent.click(screen.getByTestId('wizard-find-matches-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('wizard-proceed-step3-btn')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('wizard-proceed-step3-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('wizard-final-submit-btn')).toBeInTheDocument();
    });

    expect(screen.getByText(/Confirm & Send Direct Invite/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('wizard-final-submit-btn'));

    await waitFor(() => {
      expect(projectsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Full-Stack Next.js SaaS Development with Stripe',
          category: 'WEB_DEVELOPMENT',
          skills: expect.arrayContaining(['Next.js', 'Stripe']),
        })
      );
    });

    await waitFor(() => {
      expect(talentInvitationsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: 501,
          freelancer_id: 101,
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('wizard-success-state')).toBeInTheDocument();
    });
  });

  test('8. Dual storage helpers save, read, and clear draft reliably', () => {
    const sampleDraft = {
      step: 2,
      prompt: 'Build Mobile App',
      category: 'MOBILE_DEVELOPMENT',
      budgetHint: 2500,
      extractedBrief: mockMatchResponse.extracted_brief,
      matches: mockMatchResponse.matches,
      selectedCandidate: mockMatchResponse.matches[0],
      milestoneDraft: {
        title: 'Milestone 1',
        amount: 600,
        deliverables: 'Deliverable scope',
        notes: 'Invitation notes',
      },
      timestamp: Date.now(),
    };

    saveInstantMatchDraft(sampleDraft);

    const loaded = getStoredInstantMatchDraft();
    expect(loaded).not.toBeNull();
    expect(loaded?.prompt).toBe('Build Mobile App');
    expect(loaded?.extractedBrief?.title).toBe('Full-Stack Next.js SaaS Development with Stripe');

    // Check dual sync into pending project
    const pendingProject = JSON.parse(sessionStorage.getItem(PENDING_PROJECT_KEY) || '{}');
    expect(pendingProject.title).toBe('Full-Stack Next.js SaaS Development with Stripe');
    expect(pendingProject.sourceTool).toBe('instant_match_wizard');

    clearInstantMatchDraft();
    expect(getStoredInstantMatchDraft()).toBeNull();
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(PENDING_PROJECT_KEY)).toBeNull();
  });
});
