import type { Metadata } from 'next';
import './globals.css';
import '../styles/themes/light.css';
import '../styles/themes/dark.css';
import '../styles/tokens.css';
import './styles/theme.css';

import { ThemeProvider } from 'next-themes';
import AppChrome from './components/AppChrome/AppChrome';
import { ToasterProvider } from './components/Toast/ToasterProvider';

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--background)] text-[var(--text-primary)]">
        {/* @AI-HINT: Accessibility - Provide a skip link target (#main-content) in AppChrome and a skip link here. */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded">
          Skip to main content
        </a>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <ToasterProvider>
            <AppChrome>
              {children}
            </AppChrome>
          </ToasterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

