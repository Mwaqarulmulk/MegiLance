import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Demo Preview | MegiLance',
  description: 'Internal engineering architecture and workflow preview for MegiLance developers and academic reviewers.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ProjectDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-800 dark:text-amber-300 px-4 py-2 text-xs font-semibold text-center">
        ⚠️ Engineering Demo Preview — For developer demonstration and academic review purposes only. Not a customer-facing marketplace page.
      </div>
      {children}
    </div>
  );
}
