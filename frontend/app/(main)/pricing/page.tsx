import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Pricing & Platform Fees | MegiLance Promotional Launch Terms',
  description: 'View MegiLance platform fees and promotional launch pricing. 0% platform fees during launch with milestone escrow protection.',
  path: '/pricing',
  keywords: getKeywordsForPage(['transactional', 'informational'], [
    'megilance pricing plans', 'megilance pricing', 'freelance platform pricing', 'freelance marketplace fees',
    'low fee freelance platform cost', 'upwork vs megilance fees'
  ]),
});

import Pricing from './Pricing';

export default function PricingPage() {
  return <Pricing />;
}
