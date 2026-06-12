import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'About MegiLance | Our Mission, Team & Story Behind the AI Freelance Platform',
  description: 'Learn about MegiLance — the AI-powered freelance marketplace on a mission to make hiring and earning fair. Our story, values, team, and commitment to zero-commission freelancing.',
  path: '/about',
  keywords: getKeywordsForPage(['brand', 'informational'], [
    'about megilance', 'megilance team', 'megilance mission', 'freelance platform story',
    'AI freelancing company', 'megilance founders', 'who built megilance',
  ]),
});

// @AI-HINT: About page route — delegates to the premium About component with full theme support, animations, and accessibility
import About from "./About";

export default function AboutPage() {
  return <About />;
}
