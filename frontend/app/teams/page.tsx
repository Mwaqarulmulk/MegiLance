import type { Metadata } from 'next';
import TeamsClient from './TeamsClient';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Hire Freelancers for Teams - Scale with Remote Developers & Designers',
    description: 'Build distributed teams by hiring freelancers on MegiLance. Hire web developers, graphic designers, virtual assistants for your team. Enterprise-grade tools, unified billing, bulk hiring. Best freelance marketplace for teams.',
    path: '/teams',
    keywords: [
      'hire freelancers', 'hire remote teams', 'hire web developer',
      'hire a virtual assistant', 'enterprise freelancing', 'scale remote workforce',
      'bulk hire freelancers', 'distributed teams', 'freelance marketplace teams',
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
