// @AI-HINT: Single client boundary to host providers and app chrome. This reduces RSC client-manifest issues.
'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import AppChrome from './components/AppChrome/AppChrome';
import { ToasterProvider } from './components/Toast/ToasterProvider';
import StructuredData from '@/app/shared/StructuredData';
import { AnalyticsProvider } from '@/app/shared/analytics/AnalyticsProvider';

const ClientRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <AnalyticsProvider>
        <ToasterProvider>
          <AppChrome>
            {children}
          </AppChrome>
          <StructuredData />
        </ToasterProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
};

export default ClientRoot;
