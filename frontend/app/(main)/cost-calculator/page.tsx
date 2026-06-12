import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';
import CostCalculatorInteractive from './CostCalculatorInteractive';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Project Cost Calculator | Estimate Hiring Budget Free — MegiLance',
  description: 'Use MegiLance\'s free freelance cost calculator to estimate project costs by skill, complexity, and duration. Get accurate market-rate estimates from React to ML engineers instantly.',
  path: '/cost-calculator',
  keywords: getKeywordsForPage(['longTail', 'features'], [
    'freelance project cost calculator', 'estimate freelance project cost',
    'how much does a freelance developer cost', 'freelance rate calculator',
    'project cost estimator online', 'hiring budget calculator', 'developer hourly rate calculator',
    'web development cost estimate', 'freelance cost comparison tool',
  ]),
});

export default function CostCalculatorPage() {
  return <CostCalculatorInteractive />;
}
