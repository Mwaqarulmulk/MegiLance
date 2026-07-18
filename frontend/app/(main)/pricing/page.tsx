import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'MegiLance Pricing Plans | Transparent Plans — Free, Pro $19/mo & Enterprise',
  description: 'View MegiLance pricing plans with zero hidden fees. Start for free or choose our Pro Freelancer plan. Simple and cost-effective Upwork alternative.',
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
