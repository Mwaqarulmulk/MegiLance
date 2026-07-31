// @AI-HINT: Centralized TypeScript domain interfaces for MegiLance Portals.
// AI agents modifying portal features should import domain entities from this module.

/** Verified Talent entity for Micro1 AI Sourcing & Matchmaking */
export interface Talent {
  id: number;
  name: string;
  headline: string;
  avatar?: string;
  hourly_rate: number;
  rating: number;
  jss: number;
  ai_match_score: number;
  response_time: string;
  is_verified: boolean;
  top_skills: Array<{ name: string; score: number }>;
  bio: string;
  completed_jobs: number;
}

/** Milestone & Escrow contract lifecycle entity */
export interface Milestone {
  id: string | number;
  title: string;
  amount: number;
  due_date: string;
  status: "funded" | "in_progress" | "submitted" | "released" | "revision_requested";
  deliverable_note?: string;
  deliverable_file?: string;
  submitted_at?: string;
}

/** Proposal & Side-by-side Evaluation Matrix entity */
export interface ProposalItem {
  id: string | number;
  freelancer_id: string | number;
  freelancer_name: string;
  avatar?: string;
  headline: string;
  bid_amount: number;
  delivery_days: number;
  ai_fit_score: number;
  rating: number;
  jss: number;
  is_verified: boolean;
  cover_letter: string;
  milestones_proposed: Array<{ title: string; amount: number }>;
}

/** Project domain entity */
export interface ProjectData {
  id: number;
  title: string;
  description: string;
  category?: string;
  budget_type?: string;
  budget_min?: number;
  budget_max?: number;
  experience_level?: string;
  estimated_duration?: string;
  skills?: string[];
  status: string;
  client_id?: number;
  created_at: string;
  updated_at?: string;
}

/** Escrow Ledger financial overview */
export interface EscrowLedger {
  totalBudget: number;
  escrowFunded: number;
  releasedAmount: number;
  remainingBalance: number;
}
