// @AI-HINT: This is the DefaultLayout, used for public-facing pages like Home, About, etc. It includes the main Header and Footer.
'use client';

import React from 'react';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import { useTheme } from '@/app/contexts/ThemeContext';
import './DefaultLayout.common.css';
import './DefaultLayout.light.css';
import './DefaultLayout.dark.css';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`DefaultLayout DefaultLayout--${theme}`}>
      <Header />
      <main className="DefaultLayout-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
