// @AI-HINT: This is the Next.js route file for the About page. It delegates to the About component.
'use client';

import React from 'react';
import About from './About';
import { useTheme } from '@/app/contexts/ThemeContext';

const AboutPage = () => {
  const { theme } = useTheme();

  return <About theme={theme} />;
};

export default AboutPage;
