// @AI-HINT: This is the AuthLayout, used for login, signup, and other authentication pages. It centers the content on the page.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './AuthLayout.common.css';
import './AuthLayout.light.css';
import './AuthLayout.dark.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`AuthLayout AuthLayout--${theme}`}>
      <main className="AuthLayout-main">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
