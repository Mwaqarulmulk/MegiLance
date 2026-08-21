import type { Metadata } from 'next';
import MethodologyClient from './MethodologyClient';
import { buildMeta, getKeywordsForPage, buildBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'AI Methodology & Algorithm Documentation | MegiLance',
  description: 'Technical documentation of MegiLance AI engines: inputs, dataset sources, estimation algorithms, matching models, assumptions, and limitations.',
  path: '/methodology',
  keywords: getKeywordsForPage(['informational', 'technology', 'longTail'], [
    'AI methodology documentation', 'freelance pricing algorithm', 'talent matching methodology',
    'freelance AI engine specs', 'megilance algorithm documentation'
  ]),
});

export default function MethodologyPage() {
  const jsonLd = buildBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Methodology', path: '/methodology' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MethodologyClient />
    </>
  );
}
