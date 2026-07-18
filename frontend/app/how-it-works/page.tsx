import type { Metadata } from 'next';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';
import HowItWorksClient from './HowItWorksClient';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'How It Works - Find & Do Freelance Work Online | MegiLance',
    description: 'Learn how to do freelance work, where can I find freelance work, and how to hire remote talent step-by-step. Discover why MegiLance is the top Upwork alternative.',
    path: '/how-it-works',
    keywords: [
      'how to do freelance work', 'where to get freelance work', 'where can i find freelance work',
      'how to find freelance jobs', 'how to hire freelancers', 'find freelance jobs online',
      'how freelancing works', 'upwork alternative guide',
    ],
  });
}

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'How It Works', path: '/how-it-works' }])
      )} />
      <HowItWorksClient />
    </>
  );
}
