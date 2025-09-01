// @AI-HINT: Root index route for the marketing site pointing to Home component.
import type { Metadata } from 'next';
import Home from './Home/Home';

export const metadata: Metadata = {
  title: 'MegiLance – AI & Blockchain Freelance Marketplace',
  description: 'Hire vetted freelancers and get paid in secure USDC escrow. AI-powered ranking, transparent pricing, and global access.',
  alternates: { canonical: '/' }
};

export default function IndexPage() { return <Home />; }
