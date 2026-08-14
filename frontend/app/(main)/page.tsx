import Home from '@/app/home/Home';
import type { Metadata } from 'next';
import { buildWebSiteJsonLd, buildOrganizationJsonLd, buildFAQJsonLd } from '@/lib/seo';
import { PLATFORM_FAQS } from '@/lib/platform-config';

export const metadata: Metadata = {
  title: 'MegiLance: Free AI Freelance Tools & Freelance Marketplace',
  description: 'Use free AI tools to price freelance projects, write proposals, calculate rates and plan work. Then find freelancers or freelance jobs and manage projects on MegiLance.',
  keywords: [
    'free ai freelance tools',
    'ai price estimator',
    'freelance proposal generator',
    'freelancer rate calculator',
    'freelance marketplace',
    'hire freelancers',
    'find freelance jobs',
  ],
  alternates: {
    canonical: 'https://megilance.site',
  },
};

export default function Page() {
  const jsonLd = [
    buildWebSiteJsonLd(),
    buildOrganizationJsonLd(),
    buildFAQJsonLd([...PLATFORM_FAQS]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Home />
    </>
  );
}
