// @AI-HINT: Shared mock API types for frontend-only data flows. Replace with real types when backend is ready.
export type BudgetType = 'Fixed' | 'Hourly';

export interface JobDraft {
  id: string; // uuid
  title: string;
  category: string;
  budgetType: BudgetType;
  budget: number | null;
  description: string;
  skills: string[];
  timeline: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: 'draft' | 'submitted';
}

export interface CreateJobInput {
  title: string;
  category: string;
  budgetType: BudgetType;
  budget: number;
  description: string;
  skills: string[];
  timeline: string;
}

export interface CreateJobResult {
  id: string;
  message: string;
}

// Hire flow types
export interface HireDraft {
  id: string; // uuid
  freelancerId: string;
  title: string;
  description: string;
  rateType: BudgetType; // reuse Fixed/Hourly semantics
  rate: number | null;
  startDate: string; // ISO date string
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: 'draft' | 'submitted';
}

export interface CreateHireInput {
  freelancerId: string;
  title: string;
  description: string;
  rateType: BudgetType;
  rate: number;
  startDate: string; // ISO
}

export interface CreateHireResult {
  id: string;
  message: string;
}
