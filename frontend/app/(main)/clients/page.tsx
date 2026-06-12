import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';
import ClientsPageClient from './ClientsPageClient';

export const metadata: Metadata = buildMeta({
  title: 'For Clients | Hire Top Freelancers with AI Matching — MegiLance',
  description: 'MegiLance for clients: post projects, get proposals in 24 hours, use AI to find the best freelancer, and pay securely via milestone escrow. Start hiring the top 1% of talent today.',
  path: '/clients',
  keywords: getKeywordsForPage(['transactional', 'features'], [
    'hire freelancers online', 'find freelance talent', 'post project get proposals',
    'vetted freelancers for hire', 'client freelance platform', 'businesses hire freelancers',
    'scale team with freelancers', 'managed freelance hiring',
  ]),
});

export default function ClientsPage() {
  return <ClientsPageClient />;
}
