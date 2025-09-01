// @AI-HINT: Dedicated /Home route (optional) reusing Home component for deep linking.
import type { Metadata } from 'next';
import Home from './Home';

export const metadata: Metadata = {
  title: 'Home – MegiLance Platform',
  description: 'Overview of MegiLance features: AI talent matching, secure USDC payments, and blockchain escrow.'
};

export default function HomeIndexPage() { return <Home />; }
