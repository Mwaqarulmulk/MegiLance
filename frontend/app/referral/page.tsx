import type { Metadata } from 'next';
import ReferralClient from './ReferralClient';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Referral Program - Earn Rewards by Inviting Friends',
    description: 'Join MegiLance\'s referral program and earn crypto rewards for every friend who signs up and completes a project. Unlimited referrals, instant payouts, and exclusive bonuses for top referrers.',
    path: '/referral',
    keywords: [
      'MegiLance referral program', 'freelance referral rewards', 'earn crypto referrals',
      'invite friends freelancing', 'referral bonus freelance platform',
    ],
  });
}

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Referral Program', path: '/referral' }])
      )} />
      <ReferralClient />
    </>
  );
}
