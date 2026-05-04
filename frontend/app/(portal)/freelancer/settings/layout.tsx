// @AI-HINT: This is the main layout for the freelancer settings section. It establishes a premium, responsive two-panel layout with the SettingsNav on the side and the page content in the main area.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import SettingsNav from './components/SettingsNav/SettingsNav';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';

import commonStyles from './Layout.common.module.css';
import lightStyles from './Layout.light.module.css';
import darkStyles from './Layout.dark.module.css';

interface FreelancerSettingsLayoutProps {
  children: React.ReactNode;
}

export default function FreelancerSettingsLayout({ children }: FreelancerSettingsLayoutProps) {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, styles.container)}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <AnimatedOrb variant="purple" size={500} blur={90} opacity={0.1} className="absolute top-[-10%] right-[-10%]" />
        <AnimatedOrb variant="blue" size={400} blur={70} opacity={0.08} className="absolute bottom-[-10%] left-[-10%]" />
        <ParticlesSystem count={15} className="absolute inset-0" />
        <div className="absolute top-[60%] right-[15%] opacity-10"><FloatingCube /></div>
        <div className="absolute top-[20%] left-[10%] opacity-10"><FloatingSphere /></div>
      </div>
      <header className={cn(commonStyles.header, styles.header)}>
        <h1 className={cn(commonStyles.title, styles.title)}>Settings</h1>
        <p className={cn(commonStyles.subtitle, styles.subtitle)}>
          Manage your account, password, and notification preferences.
        </p>
      </header>
      <div className={cn(commonStyles.mainContainer, styles.mainContainer)}>
        <aside className={cn(commonStyles.sidebar, styles.sidebar)}>
          <SettingsNav />
        </aside>
        <main className={cn(commonStyles.content, styles.content)}>
          {children}
        </main>
      </div>
    </div>
  );
}
