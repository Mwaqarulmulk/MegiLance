import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage, buildAboutPageJsonLd, buildBreadcrumbJsonLd, jsonLdScriptProps } from '../../../lib/seo';
import About from './About';

export const metadata: Metadata = buildMeta({
  title: 'About MegiLance | Our Mission, Team & Story Behind the AI Freelance Platform',
  description: 'Learn about MegiLance, the leading AI-powered freelancer website. Discover our story, values, team, and commitment to zero-commission freelance work.',
  path: '/about',
  keywords: getKeywordsForPage(['brand', 'informational'], [
    'about megilance', 'freelancer website story', 'megilance team', 'megilance mission'
  ]),
});

// @AI-HINT: About page route — delegates to the premium About component with full theme support, animations, and accessibility

export default function AboutPage() {
  return (
    <>
      <script {...jsonLdScriptProps(buildAboutPageJsonLd())} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'About', path: '/about' }])
      )} />
      <About />
    </>
  );
}
