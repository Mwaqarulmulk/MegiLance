import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';
import FreelancerRateInteractive from './FreelancerRateInteractive';

export const metadata: Metadata = buildMeta({
  title: 'Freelancer Hourly Rate Calculator | Calculate Net Income & 0% Fee Savings — MegiLance',
  description: 'Use MegiLance\'s free freelancer hourly rate calculator to compute your target billing rate based on annual income goals, billable hours, expenses, and taxes. Calculate 0% platform fee savings instantly.',
  path: '/freelancer-rate-calculator',
  keywords: getKeywordsForPage(['longTail', 'transactional', 'features'], [
    'freelancer hourly rate calculator', 'freelance rate calculator',
    'how to calculate freelance hourly rate', 'freelancer net income calculator',
    'freelance salary calculator', 'freelancer rate formula',
    'freelancer pricing calculator', 'freelance take home calculator',
  ]),
});

export default function FreelancerRatePage() {
  return <FreelancerRateInteractive />;
}
