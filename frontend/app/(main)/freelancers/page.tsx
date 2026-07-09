import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Hire Top Freelancers Online | Browse Expert Talent — MegiLance',
  description: 'Browse and hire top-rated freelancers online on MegiLance. Vetted web developers, designers, data scientists, writers & 500+ skills. AI-matched talent, secure escrow, trusted by 10,000+ clients.',
  path: '/freelancers',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'hire freelancers online', 'browse top freelancers', 'find verified freelancers',
    'vetted remote developers', 'top rated freelancers', 'expert freelancers for hire',
    'hire remote talent', 'freelancer profiles marketplace',
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

