// @AI-HINT: This is the Next.js route file for the Signup page under the (auth) route group.
import { Metadata } from 'next';
import { Suspense } from 'react';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import Signup from './Signup';

export const metadata: Metadata = {
  title: 'Sign Up | MegiLance',
  description: 'Create your MegiLance account today to start hiring top-tier freelancers or finding high-paying remote development projects with secure smart contract escrow.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-96" />}>
      <Signup />
    </Suspense>
  );
}
