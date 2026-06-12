import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Post a Project | Hire Freelancers in 24 Hours Free — MegiLance',
  description: 'Post your project for free on MegiLance and receive expert proposals within 24 hours. AI matching instantly connects you with the best-fit freelancers. No upfront cost, no commitment.',
  path: '/post-project',
  keywords: getKeywordsForPage(['transactional'], [
    'post a project online', 'post freelance job', 'hire freelancer fast',
    'get freelance proposals', 'post project get bids', 'free project posting',
    'publish freelance project', 'find freelancers for my project',
  ]),
});

import PostProjectClient from './PostProjectClient';

const faqs = [
  { question: "Is it really free to post?", answer: "Yes. Posting projects on MegiLance is completely free with no hidden fees." },
  { question: "How fast will I get proposals?", answer: "Most projects receive proposals within 1-2 hours thanks to AI-powered matching." },
  { question: "What if I'm not satisfied?", answer: "Our escrow system protects your payment. If work doesn't meet milestones, you can request revisions or escalate to dispute resolution." },
];

export default function PostProjectPage() {
  return <PostProjectClient faqs={faqs} />;
}
