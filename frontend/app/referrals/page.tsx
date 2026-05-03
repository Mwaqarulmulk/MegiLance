// @AI-HINT: Referrals Dashboard Page
import { Metadata } from 'next';
import { ReferralsClient } from './ReferralsClient';

export const metadata: Metadata = {
  title: 'Referral Program | MegiLance',
  description: 'Invite friends and earn rewards on MegiLance.',
};

export default function ReferralsPage() {
  return <ReferralsClient />;
}
