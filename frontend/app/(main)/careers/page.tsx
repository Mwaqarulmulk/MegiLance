import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Careers at MegiLance | Join the Future of AI-Powered Freelancing',
  description: 'Join MegiLance and help build the future of work. Open roles in engineering, design, AI/ML, product, and marketing. Remote-first culture, competitive compensation, meaningful mission.',
  path: '/careers',
  keywords: getKeywordsForPage(['brand'], [
    'megilance careers', 'jobs at megilance', 'work at freelance startup',
    'AI startup jobs', 'remote engineering jobs', 'join megilance team',
    'freelance platform jobs', 'tech startup hiring 2026',
  ]),
});

// @AI-HINT: Careers page route — delegates to the premium Careers component with full theme support and mailto apply links
import Careers from "./Careers";

export default function CareersPage() {
  return <Careers />;
}
