// @AI-HINT: Public About page. Uses premium About component with semantic main landmark and theme-aware styles.
import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import About from './About';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'About',
    description: 'Learn about MegiLance’s mission to elevate global freelancing with AI and secure payments.',
    path: '/about',
  });
}

export default function AboutPage() {
  return <About />;
}
