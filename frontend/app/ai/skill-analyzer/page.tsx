import { Metadata } from 'next';
import SkillAnalyzer from './SkillAnalyzer';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'AI Freelancer Skill Analyzer | MegiLance Tools',
  description: 'Evaluate your freelance capabilities with the AI freelancer skill analyzer. Detect high-demand skills, view salary multipliers, and map your growth roadmap.',
  path: '/ai/skill-analyzer',
  keywords: ['ai freelancer skill analyzer', 'skill analyzer', 'freelancer skills test', 'AI skill assessment', 'freelance career growth roadmap'],
});

export default function SkillAnalyzerPage() {
  return <SkillAnalyzer />;
}
