import { Metadata } from 'next';
import RateAdvisor from './RateAdvisor';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'AI Freelancer Rate Advisor | MegiLance Tools',
  description: 'Find your optimal hourly rate with AI pricing intelligence. Compare platform averages, set comfort rates, and project your monthly billable income.',
  path: '/tools/freelance-rate-calculator',
  keywords: ['rate advisor', 'freelance hourly rate calculator', 'how much to charge freelance', 'AI rate calculator', 'MegiLance tools'],
});

export default function RateAdvisorPage() {
  return <RateAdvisor />;
}
