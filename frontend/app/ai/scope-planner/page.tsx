import { Metadata } from 'next';
import ScopePlanner from './ScopePlanner';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'AI Freelance Scope & Project Planner | MegiLance Tools',
  description: 'Define milestones and plan project structures with the AI freelance scope & project planner. Optimize project scope definition and deliverables.',
  path: '/ai/scope-planner',
  keywords: ['ai freelance scope & project planner', 'scope planner', 'project scope creator', 'AI milestones planner', 'freelance project scope definition'],
});

export default function ScopePlannerPage() {
  return <ScopePlanner />;
}
