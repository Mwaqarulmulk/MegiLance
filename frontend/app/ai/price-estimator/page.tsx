import { Metadata } from 'next';
import { Suspense } from 'react';
import PriceEstimatorPro from './PriceEstimatorPro';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'AI Price Estimator | MegiLance Pricing & Budget Forecasting',
  description: 'Estimate project development budgets instantly with the AI price estimator. Leverage price forecasting and real-time market data across global regions.',
  path: '/ai/price-estimator',
  keywords: ['ai price estimator', 'price forecasting', 'freelance project price estimator', 'project cost estimator', 'budget forecasting'],
});

const PriceEstimatorFallback = () => (
  <div className="max-w-5xl mx-auto my-8 p-6 md:p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/60 shadow-sm animate-pulse space-y-6">
    <div className="text-center space-y-3">
      <div className="h-6 w-48 bg-blue-100 dark:bg-blue-950/60 rounded-full mx-auto" />
      <div className="h-9 w-80 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
      <div className="h-4 max-w-lg bg-slate-100 dark:bg-slate-850 rounded mx-auto" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-100 dark:bg-slate-850 rounded-2xl" />
      ))}
    </div>
    <div className="h-64 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850" />
  </div>
);

export default function PriceEstimatorPage() {
  return (
    <Suspense fallback={<PriceEstimatorFallback />}>
      <PriceEstimatorPro />
    </Suspense>
  );
}
