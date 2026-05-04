import type { Metadata } from 'next';
import SecurityClient from './SecurityClient';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps, getKeywordsForPage } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Security Center - Enterprise-Grade Protection for Your Freelance Projects',
    description: 'MegiLance employs enterprise-grade security: blockchain escrow payments, end-to-end encryption, 2FA authentication, identity verification, smart contract protection, and regular security audits. Your data and payments are always safe.',
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
        buildBreadcrumbJsonLd([{ name: 'Security', path: '/security' }])
      )} />
      <SecurityClient />
    </>
  );
}
