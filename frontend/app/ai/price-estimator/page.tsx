import { Metadata } from 'next';
import { Suspense } from 'react';
import PriceEstimatorPro from './PriceEstimatorPro';

export const metadata: Metadata = {
  title: 'AI Price Estimator | MegiLance Pricing Intelligence',
  description: 'Estimate project development costs instantly with our AI-powered price estimator. Grounded in real market rates across categories, experience levels, and regions.',
};

const PriceEstimatorFallback = () => (
  <div className="max-w-4xl mx-auto my-10 p-8 border rounded-2xl bg-white dark:bg-slate-950 shadow-sm text-center">
    <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">AI Price Estimator Pro</h1>
    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto leading-relaxed">
      Estimate freelance project budgets using AI-powered pricing guidance based on category, complexity, 
      timeline, and skill requirements. Aligns budget expectations using real market rates. 
      Loading price estimation dashboard...
    </p>
    <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
      <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl"></div>
      <div className="h-48 bg-slate-100 dark:bg-slate-850 rounded-2xl"></div>
    </div>
  </div>
);

export default function PriceEstimatorPage() {
  return (
    <Suspense fallback={<PriceEstimatorFallback />}>
      <PriceEstimatorPro />
    </Suspense>
  );
}
