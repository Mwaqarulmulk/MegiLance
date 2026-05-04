import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Privacy Policy - How We Protect Your Data',
    description: 'Read MegiLance\'s Privacy Policy. We are committed to protecting your personal information with enterprise-grade encryption, GDPR compliance, and transparent data practices. Learn how we collect, use, and safeguard your data.',
    path: '/privacy',
    keywords: [
      'MegiLance privacy policy', 'freelance platform privacy', 'data protection freelancing',
      'GDPR freelance marketplace', 'personal data protection',
    ],
  });
}

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Privacy Policy', path: '/privacy' }])
      )} />
      <PrivacyClient />
    </>
  );
}
