// @AI-HINT: Route entry for Pricing page with metadata.
import type { Metadata } from 'next';
import PricingPage from './Pricing';

export const metadata: Metadata = {
  title: 'Pricing – MegiLance Plans for Freelancers & Clients',
  description: 'Choose the MegiLance plan that fits your needs. Flexible pricing for freelancers, clients, and enterprises with AI features and secure USDC payments.',
  openGraph: {
    title: 'MegiLance Pricing',
    description: 'Flexible plans for freelancers, clients, and enterprises.'
  }
};

export default function Page() {
  return <PricingPage />;
}
