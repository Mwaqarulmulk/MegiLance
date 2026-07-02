import { Metadata } from 'next';
import ScopePlanner from './ScopePlanner';

export const metadata: Metadata = {
  title: 'AI Freelance Scope & Project Planner | MegiLance Tools',
  description: 'Plan project scopes, structure milestones, define deliverables, and assess timelines and budgets with AI scope planning intelligence.',
  keywords: ['scope planner', 'project scope creator', 'AI milestones planner', 'freelance project scope definition', 'MegiLance tools'],
};

export default function ScopePlannerPage() {
  return <ScopePlanner />;
}
