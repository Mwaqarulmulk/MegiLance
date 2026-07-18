import { Metadata } from 'next';
import ExpenseTaxCalculator from './ExpenseTaxCalculator';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Expense & Tax Calculator | MegiLance Free Tax Tools',
  description: 'Manage self-employed write-offs and calculate obligations with the ultimate freelance expense & tax calculator. Try our free tax tools on MegiLance.',
  path: '/ai/expense-calculator',
  keywords: ['freelance expense and tax calculator', 'free tax calculator', 'expense calculator', 'tax write-off calculator', 'self-employed tax estimator'],
});

export default function ExpenseTaxPage() {
  return <ExpenseTaxCalculator />;
}
