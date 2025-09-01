// @AI-HINT: Route entry for FAQ page with metadata.
import type { Metadata } from 'next';
import Faq from './Faq';

export const metadata: Metadata = {
  title: 'FAQ – MegiLance Platform Questions Answered',
  description: 'Find answers to common questions about MegiLance, AI-driven talent ranking, USDC payments, and platform features.',
  openGraph: {
    title: 'MegiLance FAQ',
    description: 'Answers about AI matching, USDC payments, security and more.'
  }
};

export default function FaqPage() { return <Faq />; }
