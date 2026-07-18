import { Metadata } from 'next';
import IncomeCalculator from './IncomeCalculator';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Income Calculator & Free Tax Calculator | MegiLance',
  description: 'Project your earnings with our freelance income calculator and free tax calculator. Estimate self-employment taxes, quarterly obligations, and business expenses.',
  path: '/ai/income-calculator',
  keywords: ['freelance income calculator', 'free tax calculator', 'income calculator', 'freelancer income calculator', 'self-employed tax estimator'],
});

export default function IncomeCalculatorPage() {
  return <IncomeCalculator />;
}
