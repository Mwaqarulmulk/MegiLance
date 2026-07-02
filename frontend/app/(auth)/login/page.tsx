// @AI-HINT: This is the Next.js route file for the Login page. It delegates to the Login component and passes theme via context/props only.
import { Metadata } from 'next';
import { Suspense } from 'react';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import Login from './Login';

export const metadata: Metadata = {
  title: 'Sign In | MegiLance',
  description: 'Log in to your MegiLance account to post projects, manage contracts, communicate with freelancers, and approve escrow payments securely.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-96" />}>
      <Login />
    </Suspense>
  );
}
