import type { Metadata } from 'next';
import './styles/theme.css';
import './globals.css';

import { ThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher/ThemeSwitcher';
import InstallAppBanner from './components/PWA/InstallAppBanner/InstallAppBanner';
import UpdateNotification from './components/PWA/UpdateNotification/UpdateNotification';



export const metadata: Metadata = {
  title: 'MegiLance - Next-Gen Freelance Platform',
  description: 'The Next-Generation Freelance Platform powered by AI and Blockchain.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
                  <body>
        <ThemeProvider>
          <ThemeSwitcher />
          {children}
          <InstallAppBanner />
          <UpdateNotification />
        </ThemeProvider>
      </body>
    </html>
  );
}

