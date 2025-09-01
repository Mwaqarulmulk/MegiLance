// @AI-HINT: Route entry for About page with SEO metadata.
import type { Metadata } from 'next';
import About from './About';

export const metadata: Metadata = {
  title: 'About MegiLance – AI & Secure Freelance Platform',
  description: 'Learn about MegiLance: our mission, team, and values driving an AI-powered, secure, USDC-based freelance marketplace.',
  openGraph: {
    title: 'About MegiLance',
    description: 'Building a transparent, AI-driven freelance economy with secure USDC payments.',
    type: 'website'
  }
};

export default function AboutPage() {
  return <About />;
}
