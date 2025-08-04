// @AI-HINT: This is the Next.js route file for the PWA Install page. It delegates to the Install component.
'use client';

import React from 'react';
import Install from './Install';
import { useTheme } from '@/app/contexts/ThemeContext';

const InstallPage = () => {
  const { theme } = useTheme();

  return <Install theme={theme} />;
};

export default InstallPage;
