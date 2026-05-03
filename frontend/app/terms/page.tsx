import type { Metadata } from 'next';
import TermsClient from './TermsClient';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Terms of Service - User Agreement & Platform Rules',
    description: 'Read MegiLance\'s Terms of Service. Understand user rights, payment terms, dispute resolution policies, intellectual property protections, and platform usage guidelines for clients and freelancers.',
    path: '/terms',
    keywords: [
      'MegiLance terms of service', 'freelance platform terms', 'user agreement freelancing',
      'freelance marketplace rules', 'terms of use MegiLance',
    ],
  });
}

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Terms of Service', path: '/terms' }])
      )} />
      <TermsClient />
    </>
  );
}
