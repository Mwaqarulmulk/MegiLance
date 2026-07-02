import { Metadata } from 'next';
import IncomeCalculator from './IncomeCalculator';

export const metadata: Metadata = {
  title: 'Freelance Income Calculator | MegiLance Tools',
  description: 'Project your freelance earnings, self-employment taxes, business expenses, and net disposable income with our free country-specific calculator.',
  keywords: ['income calculator', 'freelancer income calculator', 'freelance earnings projection', 'self-employed calculator', 'MegiLance tools'],
};

export default function IncomeCalculatorPage() {
  return <IncomeCalculator />;
}
