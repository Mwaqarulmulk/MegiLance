import type { Metadata } from 'next';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';
import HowItWorksClient from './HowItWorksClient';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'How It Works - Hire Freelancers & Find Freelance Jobs Online',
    description: 'Learn how to hire freelancers and find freelance jobs online on MegiLance. Step-by-step guide: post projects, get AI-matched with experts, collaborate securely. The easiest Upwork alternative.',
    path: '/how-it-works',
    keywords: [
      'how to hire freelancers', 'find freelance jobs online', 'freelance work online',
      'how freelancing works', 'hire freelancers step by step', 'upwork alternative guide',
      'freelancer website guide', 'freelance marketplace how to',
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
