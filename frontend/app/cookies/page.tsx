import type { Metadata } from 'next';
import CookiesClient from './CookiesClient';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Cookie Policy - Transparency About Our Cookie Usage',
    description: 'Learn how MegiLance uses cookies and tracking technologies to improve your experience. We use essential cookies for security, analytics cookies for improvement, and optional marketing cookies. Full GDPR compliance.',
    path: '/cookies',
    keywords: [
      'MegiLance cookie policy', 'cookie usage freelance platform', 'tracking cookies',
    ],
  });
}

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Cookie Policy', path: '/cookies' }])
      )} />
      <CookiesClient />
    </>
  );
}
