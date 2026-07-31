import Home from '@/app/home/Home';
import type { Metadata } from 'next';
import { buildWebSiteJsonLd, buildOrganizationJsonLd, buildFAQJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'MegiLance — AI-Powered Freelancer Website & Freelancing Platform',
  description: 'Connect with top AI-vetted freelancers on MegiLance, the ultimate freelancer website. Find freelance jobs online and hire developers, designers, or writers with zero commission. The future of freelancing starts here.',
  keywords: ['freelancer website', 'freelance jobs online', 'freelancing websites', 'freelancing sites', 'best freelance websites', 'hire freelancers', 'AI freelancing'],
  alternates: {
    canonical: 'https://megilance.site',
  },
};

export default function Page() {
  const jsonLd = [
    buildWebSiteJsonLd(),
    buildOrganizationJsonLd(),
    buildFAQJsonLd([
      {
        question: 'What is MegiLance?',
        answer: 'MegiLance is an AI-powered freelancing platform that connects clients with top-vetted freelancers using smart matching algorithms, secure escrow payments, and real-time collaboration tools.',
      },
      {
        question: 'How does AI matching work?',
        answer: 'Our AI analyzes project requirements, freelancer skills, past performance, and market rates to recommend the best matches for your project.',
      },
      {
        question: 'Is payment secure?',
        answer: 'Yes. All payments are held in secure escrow until milestones are completed and approved. We support Stripe, crypto (USDC), and bank transfers.',
      },
      {
        question: 'What types of projects can I post?',
        answer: 'You can post any project — web development, design, writing, marketing, AI/ML, data science, and more.',
      },
    ]),
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
