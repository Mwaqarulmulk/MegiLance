// @AI-HINT: This is the AuthLayout, used for login, signup, and other authentication pages. It centers the content on the page.
'use client';

import React from 'react';
import { useThemeStyles } from '@/app/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import commonStyles from './AuthLayout.common.module.css';
import lightStyles from './AuthLayout.light.module.css';
import darkStyles from './AuthLayout.dark.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const themeStyles = useThemeStyles(lightStyles, darkStyles);

  return (
    <div className={cn(commonStyles.layout, themeStyles.layout)}>
      <main className={commonStyles.main}>
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
