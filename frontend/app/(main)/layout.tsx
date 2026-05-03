// @AI-HINT: This is the public site layout wrapper. It uses PublicLayout to provide the shared Header/Footer and skip links for marketing pages.

import React from 'react';
import type { Metadata } from 'next';
import PublicLayout from '../layouts/PublicLayout/PublicLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | MegiLance - Freelancer Website',
    default: 'MegiLance – Best Freelancer Website | Hire Freelance Developers & Designers',
  },
  description: 'MegiLance is the best freelancer website to hire freelancers, find freelance jobs online, and connect with verified experts. AI-powered matching, secure escrow payments, and lower fees than Upwork.',
  openGraph: {
    type: 'website',
    siteName: 'MegiLance',
    locale: 'en_US',
  },
};

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  );
}
