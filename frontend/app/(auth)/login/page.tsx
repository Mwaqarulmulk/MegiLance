import { Metadata } from 'next';
import { Suspense } from 'react';
import Login from './Login';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Sign In | MegiLance',
  description: 'Log in to your MegiLance account to post projects, manage contracts, communicate with freelancers, and approve escrow payments securely.',
  path: '/login',
  noindex: true,
});

const LoginFallback = () => (
  <div className="max-w-md mx-auto my-10 p-8 border rounded-2xl bg-white dark:bg-slate-950 shadow-sm text-center">
    <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Sign In to MegiLance</h1>
    <p className="text-slate-600 dark:text-slate-400 mb-6">
      Log in to your MegiLance account to access your workspace, manage milestone escrows, 
      view AI-matched opportunities, and collaborate with freelancers.
    </p>
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <Login />
    </Suspense>
  );
}
