import { Metadata } from 'next';
import { Suspense } from 'react';
import Signup from './Signup';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Sign Up | MegiLance',
  description: 'Create your MegiLance account today to start hiring top-tier freelancers or finding high-paying remote development projects with secure smart contract escrow.',
  path: '/signup',
  noindex: true,
});

const SignupFallback = () => (
  <div className="max-w-md mx-auto my-10 p-8 border rounded-2xl bg-white dark:bg-slate-950 shadow-sm text-center">
    <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Create Your MegiLance Account</h1>
    <p className="text-slate-600 dark:text-slate-400 mb-6">
      Join MegiLance to find vetted global talent or discover high-paying remote development projects. 
      Includes smart-contract milestone escrow, 0% launch platform commission, and AI-powered competency matching.
    </p>
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
    </div>
  </div>
);

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <Signup />
    </Suspense>
  );
}
