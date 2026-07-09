// @AI-HINT: AI section layout - uses main layout Header/Footer, only adds spacing
import type { Metadata } from 'next';
import React from 'react';
import { BASE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AI Tools for Freelancers & Clients | MegiLance AI Hub',
  description: 'Accelerate your freelance workflow. Discover free AI tools for hourly rate calculation, project cost estimation, scope planning, contract writing, and scam detection.',
  alternates: {
    canonical: `${BASE_URL}/ai`,
    languages: {
      'en-US': `${BASE_URL}/ai`,
      'x-default': `${BASE_URL}/ai`,
    },
  },
};

interface AILayoutProps {
  children: React.ReactNode;
}

export default function AILayout({ children }: AILayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
