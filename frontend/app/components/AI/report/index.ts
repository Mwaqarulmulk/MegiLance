// @AI-HINT: Barrel for the AI report export + user-guide kit. Import from '@/app/components/AI/report'.
export { default as ExportMenu } from './ExportMenu';
export { default as UserGuide } from './UserGuide';
export type { GuideStep, GuideFAQ } from './UserGuide';
export { exportReportPDF } from './pdf';
export { exportReportDOCX } from './docx';
export {
  REPORT_BRAND,
  reportFileName,
  formatReportDate,
} from './reportTypes';
export type {
  AIReport,
  ReportSection,
  ReportBlock,
  ReportKPI,
} from './reportTypes';
