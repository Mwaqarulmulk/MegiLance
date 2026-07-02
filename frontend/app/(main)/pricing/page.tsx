import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'MegiLance Pricing | Transparent Plans — Free, Pro $19/mo & Enterprise',
  description: 'Simple transparent pricing with no hidden fees. MegiLance Free plan for starters (10% fee), Pro Freelancer at $19/month with 5% fee, and Enterprise with custom pricing. No contracts, cancel anytime.',
  path: '/pricing',
  keywords: getKeywordsForPage(['transactional', 'informational'], [
    'megilance pricing', 'freelance platform pricing', 'freelance marketplace fees',
    'how much does megilance cost', 'megilance pro plan', 'megilance subscription',
    'zero commission freelancing', 'low fee freelance platform cost',
    'upwork vs megilance fees', 'freelance platform subscription',
  ]),
});

import Pricing from './Pricing';

export default function PricingPage() {
  return <Pricing />;
}
