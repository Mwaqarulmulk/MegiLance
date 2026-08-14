import type { Metadata } from 'next';
import MethodologyClient from './MethodologyClient';

export const metadata: Metadata = {
  title: 'AI Methodology & Algorithm Documentation | MegiLance',
  description: 'Understand how MegiLance AI tools work: inputs, dataset sources, estimation algorithms, matching models, assumptions, and limitations.',
  alternates: {
    canonical: 'https://megilance.site/methodology',
  },
  openGraph: {
    title: 'AI Methodology & Algorithm Documentation | MegiLance',
    description: 'Understand how MegiLance AI tools work: inputs, dataset sources, estimation algorithms, matching models, assumptions, and limitations.',
    url: 'https://megilance.site/methodology',
  },
};

export default function MethodologyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Methodology & Algorithm Documentation',
    description: 'Documentation of inputs, calculation methodology, data sources, assumptions, and limitations for MegiLance AI tools.',
    url: 'https://megilance.site/methodology',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://megilance.site' },
        { '@type': 'ListItem', position: 2, name: 'AI Methodology', item: 'https://megilance.site/methodology' },
      ],
    },
  };

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
