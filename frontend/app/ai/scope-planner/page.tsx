import { Metadata } from 'next';
import ScopePlanner from './ScopePlanner';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'AI Freelance Scope & Project Planner | MegiLance Tools',
  description: 'Plan project scopes, structure milestones, define deliverables, and assess timelines and budgets with AI scope planning intelligence.',
  path: '/tools/project-scope-generator',
  keywords: ['scope planner', 'project scope creator', 'AI milestones planner', 'freelance project scope definition', 'MegiLance tools'],
});

export default function ScopePlannerPage() {
  return <ScopePlanner />;
}
