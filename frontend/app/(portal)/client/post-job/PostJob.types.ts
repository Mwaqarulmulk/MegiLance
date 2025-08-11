// @/app/(portal)/client/post-job/PostJob.types.ts

const CATEGORIES = ['Web Development', 'Mobile Apps', 'UI/UX Design', 'Data Science', 'AI/ML', 'DevOps'] as const;
const BUDGET_TYPES = ['Fixed', 'Hourly'] as const;

export type Category = typeof CATEGORIES[number];
export type BudgetType = typeof BUDGET_TYPES[number];

export interface PostJobData {
  title: string;
  category: Category | '';
  description: string;
  skills: string[];
  budgetType: BudgetType;
  budgetAmount: number | null;
  timeline: string;
}

export type PostJobErrors = Partial<Record<keyof PostJobData, string>>;
