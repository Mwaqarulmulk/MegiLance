import type { Metadata } from 'next';
import TrustClient from './TrustClient';

export const metadata: Metadata = {
  title: 'Trust & Safety | MegiLance Milestone Escrow & Platform Security',
  description: 'Learn how MegiLance protects clients and freelancers with milestone escrow, dispute mediation, identity verification, privacy-first AI, and security practices.',
  alternates: {
    canonical: 'https://megilance.site/trust',
  },
  openGraph: {
    title: 'Trust & Safety | MegiLance Platform Security & Escrow',
    description: 'Learn how MegiLance protects clients and freelancers with milestone escrow, dispute mediation, identity verification, and privacy-first AI.',
    url: 'https://megilance.site/trust',
  },
};

export default function TrustPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Trust & Safety on MegiLance',
    description: 'Security practices, milestone escrow workflows, dispute mediation, and data privacy policies on MegiLance.',
    url: 'https://megilance.site/trust',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://megilance.site' },
        { '@type': 'ListItem', position: 2, name: 'Trust & Safety', item: 'https://megilance.site/trust' },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrustClient />
    </>
  );
}
