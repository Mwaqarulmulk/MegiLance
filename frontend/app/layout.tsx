import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../styles/themes/light.css';
import '../styles/themes/dark.css';
import '../styles/tokens.css';
import './styles/theme.css';

import { ThemeProvider } from 'next-themes';
import AppChrome from './components/AppChrome/AppChrome';
import { ToasterProvider } from './components/Toast/ToasterProvider';
import ChatbotAgent from './components/AI/ChatbotAgent/ChatbotAgent';
import StructuredData from '@/app/shared/StructuredData';
import { AnalyticsProvider } from '@/app/shared/analytics/AnalyticsProvider';

export const metadata: Metadata = {
  title: 'MegiLance - Next-Gen Freelance Platform',
  description: 'The Next-Generation Freelance Platform powered by AI and Blockchain.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  authors: [{ name: 'MegiLance' }],
  applicationName: 'MegiLance',
  openGraph: {
    title: 'MegiLance - Next-Gen Freelance Platform',
    description: 'The Next-Generation Freelance Platform powered by AI and Blockchain.',
    url: 'https://megilance.com',
    siteName: 'MegiLance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MegiLance - Next-Gen Freelance Platform',
    description: 'The Next-Generation Freelance Platform powered by AI and Blockchain.',
    creator: '@megilance',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--background)] text-[var(--text-primary)]">

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
      </body>
    </html>
  );
}

