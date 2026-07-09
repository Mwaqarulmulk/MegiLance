import { Metadata } from 'next';
import ExpenseTaxCalculator from './ExpenseTaxCalculator';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Expense & Tax Calculator | MegiLance Tools',
  description: 'Estimate quarterly taxes, calculate self-employment write-offs, and track freelance business expenses with country-specific tax rules.',
  path: '/ai/expense-calculator',
  keywords: ['expense calculator', 'tax write-off calculator', 'self-employed tax estimator', 'freelancer quarterly tax', 'MegiLance tools'],
});

export default function ExpenseTaxPage() {
  return <ExpenseTaxCalculator />;
}
