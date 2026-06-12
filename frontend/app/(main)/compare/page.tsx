import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';
import CompareClient from './CompareClient';

export const metadata: Metadata = buildMeta({
  title: 'MegiLance vs Upwork vs Fiverr | Best Freelance Platform Comparison 2026',
  description: 'Compare MegiLance vs Upwork vs Fiverr vs Freelancer.com. Lower 5% fee, superior AI matching, faster hiring, and built-in milestone escrow. See why MegiLance wins every category.',
  path: '/compare',
  keywords: getKeywordsForPage(['informational', 'transactional'], [
    'upwork vs fiverr vs megilance', 'best freelance platform 2026',
    'freelance marketplace comparison', 'alternatives to upwork', 'alternatives to fiverr',
    'lower fees than upwork', 'better than fiverr', 'toptal alternative cheaper',
    'compare freelance platforms', 'megilance vs upwork',
  ]),
});

export default function ComparePage() {
  return <CompareClient />;
}
