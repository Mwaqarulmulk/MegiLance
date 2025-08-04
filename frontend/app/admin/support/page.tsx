// @AI-HINT: This is the Next.js route file for the Admin Support page. It delegates to the Support component.
'use client';

import React from 'react';
import Support from './Support';
import { useTheme } from '@/app/contexts/ThemeContext';

const SupportPage = () => {
  const { theme } = useTheme();

  return <Support theme={theme} />;
};

export default SupportPage;
