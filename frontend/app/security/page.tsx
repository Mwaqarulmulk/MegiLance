import type { Metadata } from 'next';
import SecurityClient from './SecurityClient';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps, getKeywordsForPage } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Trust & Security Center | MegiLance Escrow & Protection',
    description: 'MegiLance employs enterprise-grade security: smart contract escrow payments, end-to-end encryption, 2-factor authentication, identity verification, and regular audits. Your data and payments are always safe.',
    path: '/security',
    keywords: getKeywordsForPage(['features'], [
      'freelance platform security', 'secure freelance payments', 'blockchain escrow',
      'freelance data protection', 'identity verification freelancers', 'safe freelancing',
      'encrypted freelance platform', 'GDPR compliant freelancing',
    ]),
  });
}

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Trust & Security Center', path: '/security' }])
      )} />
      <SecurityClient />
    </>
  );
}
