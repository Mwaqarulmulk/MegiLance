// @AI-HINT: TypeScript types and contracts for 60-Second Instant Matching Wizard and Guest State Bridge

export interface ExtractedBrief {
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
}

export interface TrustSignals {
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

export interface InstantMatchCandidate {
  freelancer_id: string | number;
  name: string;
  title?: string;
  avatar_url?: string;
  hourly_rate: number;
  match_score: number;
  match_quality: string;
  why_good_fit: string;
  top_skills: string[];
  trust_signals: TrustSignals;
}

export interface InstantMatchResponse {
  extracted_brief: ExtractedBrief;
  matches: InstantMatchCandidate[];
  total_matched: number;
}

export interface MilestoneDraft {
  title: string;
  amount: number;
  deliverables: string;
  notes: string;
}

export interface InstantMatchDraft {
  step: number;
  prompt: string;
  category?: string;
  budgetHint?: number;
  extractedBrief: ExtractedBrief | null;
  matches: InstantMatchCandidate[];
  selectedCandidate: InstantMatchCandidate | null;
  milestoneDraft: MilestoneDraft | null;
  timestamp: number;
  source?: string;
}

export interface PendingProjectPayload {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetMin: string | number;
  budgetMax: string | number;
  budgetType: 'fixed' | 'hourly';
  experienceLevel: 'entry' | 'intermediate' | 'expert' | string;
  duration: 'less_than_1_month' | '1_to_3_months' | '3_to_6_months' | 'more_than_6_months' | string;
  sourceTool?: string;
  instantMatchFreelancerId?: string | number;
}

export interface InstantMatchingWizardProps {
  initialPrompt?: string;
  initialCategory?: string;
  initialBudgetHint?: number;
  onComplete?: (result: { project: any; invitation?: any }) => void;
  onCancel?: () => void;
  compact?: boolean;
  className?: string;
}
