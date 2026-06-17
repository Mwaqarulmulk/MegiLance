// @AI-HINT: Shared data model + brand tokens for AI tool report exports (PDF & Word).
// A tool builds an `AIReport` from its result, then ExportMenu renders it to PDF/DOCX.

export type ReportBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'keyValue'; rows: { label: string; value: string }[] }
  | {
      kind: 'table';
      columns: string[];
      rows: (string | number)[][];
      /** zero-based index of a row to visually highlight (e.g. the user's choice) */
      highlightRowIndex?: number;
    }
  | { kind: 'callout'; tone?: 'info' | 'success' | 'warning'; title?: string; text: string };

export interface ReportSection {
  heading: string;
  /** optional one-line description shown under the heading */
  description?: string;
  blocks: ReportBlock[];
}

export interface ReportKPI {
  label: string;
  value: string;
  hint?: string;
}

export interface AIReport {
  /** Tool that produced the report, e.g. "AI Price Estimator". */
  toolName: string;
  /** Document title, e.g. "Project Pricing Report". */
  title: string;
  /** Short summary sentence shown under the title. */
  subtitle?: string;
  generatedAt?: Date;
  /** Hero metrics shown as cards near the top. */
  kpis?: ReportKPI[];
  /** Small facts row (inputs/context) shown as chips. */
  meta?: { label: string; value: string }[];
  sections: ReportSection[];
  disclaimer?: string;
  /** Base file name (without extension) for the download. */
  fileBaseName?: string;
}

/** Brand palette + identity used across every exported report. */
export const REPORT_BRAND = {
  name: 'MegiLance',
  tagline: 'AI-Powered Freelance Marketplace',
  url: 'megilance.com',
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  accent: '#7C3AED',
  ink: '#0F172A',
  body: '#334155',
  muted: '#64748B',
  line: '#E2E8F0',
  bgSoft: '#F1F5FF',
  card: '#F8FAFC',
  success: '#15803D',
  successBg: '#DCFCE7',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  infoBg: '#EEF2FF',
  white: '#FFFFFF',
} as const;

/** Build a safe, dated file name like "megilance-price-report-2026-06-17". */
export function reportFileName(report: AIReport): string {
  const base = (report.fileBaseName || report.toolName || 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const d = report.generatedAt ?? new Date();
  const stamp = d.toISOString().slice(0, 10);
  return `${base}-${stamp}`;
}

export function formatReportDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
