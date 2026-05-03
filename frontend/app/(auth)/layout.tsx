// @AI-HINT: Chrome-less auth layout. Keep it minimal and let pages handle their own positioning/layout.

import React from 'react';
import type { Metadata } from 'next';
import styles from './AuthShared.module.css';

export const metadata: Metadata = {
  title: {
    template: '%s | MegiLance',
    default: 'Sign In | MegiLance',
  },
  description: 'Sign in or create your MegiLance account to access the freelancing platform.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      {children}
    </main>
  );
}
