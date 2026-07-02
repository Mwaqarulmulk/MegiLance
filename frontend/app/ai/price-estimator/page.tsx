// @AI-HINT: Route for AI Price Estimator Pro — general-purpose, market-aware pricing tool
import { Metadata } from 'next';
import PriceEstimatorPro from './PriceEstimatorPro';

export const metadata: Metadata = {
  title: 'AI Price Estimator | MegiLance Pricing Intelligence',
  description: 'Estimate project development costs instantly with our AI-powered price estimator. Grounded in real market rates across categories, experience levels, and regions.',
};

export default function PriceEstimatorPage() {
  return <PriceEstimatorPro />;
}
