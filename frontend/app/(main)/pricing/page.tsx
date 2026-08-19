import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage, buildOfferCatalogJsonLd, buildBreadcrumbJsonLd, buildFAQJsonLd, buildSpeakableJsonLd, jsonLdScriptProps } from '../../../lib/seo';

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

const pricingFAQs = [
  { question: 'How much does MegiLance cost?', answer: 'MegiLance is 100% free to use during our 2026 launch period. There are 0% platform commission fees for both clients and freelancers. Standard Stripe payment processing fees (2.9% + $0.30) apply for card payments only.' },
  { question: 'Does MegiLance charge freelancers a commission?', answer: 'No. MegiLance charges 0% platform commission during our launch promotion. Freelancers keep 100% of their earnings. Compare that to Upwork (10-20%) or Fiverr (20%).' },
  { question: 'Is there a fee for clients to post projects on MegiLance?', answer: 'No. Posting projects is completely free on MegiLance. Clients only pay the agreed project amount plus standard payment processing fees.' },
  { question: 'What payment processing fees apply on MegiLance?', answer: 'Standard Stripe fees apply (2.9% + $0.30 per transaction for card payments). These go directly to Stripe, not to MegiLance. Bank transfers may have lower or no per-transaction fees.' },
  { question: 'Will MegiLance always be free?', answer: 'The 0% commission is a promotional launch offer for 2026. Future pricing may be introduced for premium features. However, the free tier will remain available for core platform access.' },
];

export default function PricingPage() {
  return (
    <>
      <script {...jsonLdScriptProps(buildOfferCatalogJsonLd())} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Pricing', path: '/pricing' }])
      )} />
      <script {...jsonLdScriptProps(buildFAQJsonLd(pricingFAQs))} />
      <script {...jsonLdScriptProps(
        buildSpeakableJsonLd(['h1', '.pricing-summary', '.pricing-plans'])
      )} />
      <Pricing />
    </>
  );
}
