import type { Metadata } from 'next';
import './globals.css';
import '../styles/themes/light.css';
import '../styles/themes/dark.css';
import '../styles/tokens.css';
import './styles/theme.css';

import { ThemeProvider } from 'next-themes';
import AppChrome from './components/AppChrome/AppChrome';
import { DevAuthProvider } from './providers/DevAuthProvider';

export const metadata: Metadata = {
  title: 'MegiLance - Next-Gen Freelance Platform',
  description: 'The Next-Generation Freelance Platform powered by AI and Blockchain.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--text-primary)]">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <DevAuthProvider>
            <AppChrome>
              {children}
            </AppChrome>
          </DevAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

