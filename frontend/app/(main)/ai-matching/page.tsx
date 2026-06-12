import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';
import AiMatchingClient from './AiMatchingClient';

export const metadata: Metadata = buildMeta({
  title: 'AI Talent Matching | Find the Perfect Freelancer with Machine Learning',
  description: 'MegiLance AI matching engine analyzes skills, budget, and compatibility to instantly shortlist the perfect freelancers for your project. No more scrolling — let the AI find your ideal candidate.',
  path: '/ai-matching',
  keywords: getKeywordsForPage(['features', 'transactional'], [
    'AI freelancer matching', 'machine learning talent search', 'AI hire developer',
    'smart freelancer discovery', 'automated talent matching platform',
    'AI powered recruitment', 'find freelancers with AI',
  ]),
});

export default function AiMatchingPage() {
  return <AiMatchingClient />;
}
