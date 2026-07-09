import { Metadata } from 'next';
import SkillAnalyzer from './SkillAnalyzer';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'AI Freelancer Skill Analyzer | MegiLance Tools',
  description: 'Analyze your freelance skill set against real-world market demand. Identify high-ROI skills, discover learning resources, and view salary multipliers.',
  path: '/tools/freelancer-match-score',
  keywords: ['skill analyzer', 'freelancer skills test', 'AI skill assessment', 'freelance career growth roadmap', 'MegiLance tools'],
});

export default function SkillAnalyzerPage() {
  return <SkillAnalyzer />;
}
