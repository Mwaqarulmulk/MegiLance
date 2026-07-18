import type { Metadata } from 'next';
import TeamsClient from './TeamsClient';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Hire Freelancers for Teams | Scale Distributed Teams & Agencies',
    description: 'Build distributed teams and hire marketing freelancers or developers on MegiLance. Streamline bulk hiring, unified collaboration, and scale remote teams with zero friction.',
    path: '/teams',
    keywords: [
      'hire freelancers for teams', 'hire marketing freelancers', 'hire freelancer marketers',
      'distributed teams', 'hire remote teams', 'hire freelancers', 'enterprise freelancing'
    ],
  });
}

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'For Teams', path: '/teams' }])
      )} />
      <TeamsClient />
    </>
  );
}
