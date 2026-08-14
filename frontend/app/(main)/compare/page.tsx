import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';
import CompareIndexClient from './CompareIndexClient';

export const metadata: Metadata = buildMeta({
  title: 'MegiLance vs Upwork vs Fiverr | Best Freelance Platform Comparison 2026',
  description: 'Compare MegiLance vs Upwork vs Fiverr vs Freelancer.com. 0% promotional platform commission during launch, free AI productivity tools, and built-in milestone escrow protection.',
  path: '/compare',
  keywords: getKeywordsForPage(['informational', 'transactional'], [
    'upwork vs fiverr vs megilance', 'best freelance platform 2026',
    'freelance marketplace comparison', 'alternatives to upwork', 'alternatives to fiverr',
    'lower fees than upwork', 'better than fiverr', 'toptal alternative cheaper',
    'compare freelance platforms', 'megilance vs upwork',
  ]),
});

const COMPETITORS = [
  {
    slug: 'upwork',
    name: 'Upwork',
    desc: 'Compare commission structures, contract initiation fees, connects cost, and escrow payment protection.',
  },
  {
    slug: 'fiverr',
    name: 'Fiverr',
    desc: 'See how MegiLance compares for complex milestone projects vs Gig-based micro-services.',
  },
  {
    slug: 'toptal',
    name: 'Toptal',
    desc: 'Compare elite vetting mechanisms, platform deposits, and overall startup hiring costs.',
  },
  {
    slug: 'freelancer-com',
    name: 'Freelancer.com',
    desc: 'Analyze bid-boosting fees, spam control, and on-chain escrow payment safety.',
  },
];

export default function ComparePage() {
  return <CompareIndexClient competitors={COMPETITORS} />;
}
