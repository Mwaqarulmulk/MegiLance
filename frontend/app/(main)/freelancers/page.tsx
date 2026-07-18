import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Hire Top Freelancers Online | Vetted Web Developers & Designers for Hire',
  description: 'Browse and hire top-rated freelancers online on MegiLance. Find web developers for hire, freelance web designers, programmers, and writers vetted by AI. Secure escrow payments.',
  path: '/freelancers',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'web developers for hire', 'web developer for hire', 'free lance web designers',
    'hire freelancers online', 'browse top freelancers', 'vetted remote developers'
  ]),
});

// @AI-HINT: Freelancers Page - renders the advanced PublicFreelancers search and filtering component
import React, { Suspense } from 'react';
import PublicFreelancers from './PublicFreelancers';

export default async function FreelancersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '8rem 2rem', textAlign: 'center', color: '#64748b', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>Loading talent directory...</div>}>
      <PublicFreelancers />
    </Suspense>
  );
}

